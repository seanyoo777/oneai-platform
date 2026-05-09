const express = require("express");
const { marketProvider, signalProvider, newsProvider } = require("./sources");
const { canAutoExecute } = require("./automation");
const { exchangeConnectors, globalDataConnector } = require("./connectors");
const { getScanOverview, runStockScan } = require("./stock-scan");
const { getStrategyScores } = require("./strategy-score");
const { evaluatePolicy, adminStrategyAction, getActionHistory } = require("./strategy-policy");
const { requireAdmin } = require("./admin-auth");
const { issueUserToken } = require("./auth-token");
const { requireUser } = require("./user-auth");
const { issueRefreshToken, consumeRefreshToken, revokeRefreshToken } = require("./refresh-token-store");
const { appendAuditLog, readAuditLogs } = require("./audit-log-store");
const { quoteMembershipPlan, processOnchainPayment, MEMBERSHIP_DEPOSIT_ADDRESS } = require("./membership-payment");
const {
  registerUser,
  authenticateUser,
  getUserById,
  getUsers,
  updateUserRoleMembership,
  linkWalletAddress
} = require("./user-store");

function createRouter() {
  const router = express.Router();

  router.post("/auth/register", async (req, res) => {
    const email = String(req.body?.email ?? "").trim();
    const password = String(req.body?.password ?? "");
    const nickname = String(req.body?.nickname ?? "").trim();
    const referredBy = String(req.body?.referredBy ?? "").trim();
    if (!email || !password || !nickname) {
      res.status(400).json({ ok: false, message: "email, password, nickname은 필수입니다." });
      return;
    }
    try {
      const user = await registerUser({ email, password, nickname, referredBy: referredBy || null });
      const token = issueUserToken(user);
      const refreshToken = issueRefreshToken(user.id);
      res.json({ ok: true, user, token, refreshToken });
    } catch (error) {
      res.status(400).json({ ok: false, message: error instanceof Error ? error.message : "회원가입 실패" });
    }
  });

  router.post("/auth/login", async (req, res) => {
    const email = String(req.body?.email ?? "").trim();
    const password = String(req.body?.password ?? "");
    const user = await authenticateUser(email, password);
    if (!user) {
      res.status(401).json({ ok: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      return;
    }
    const token = issueUserToken(user);
    const refreshToken = issueRefreshToken(user.id);
    res.json({ ok: true, user, token, refreshToken });
  });

  router.get("/auth/me", requireUser, async (req, res) => {
    const user = await getUserById(req.user.sub);
    if (!user) {
      res.status(404).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }
    res.json({ ok: true, user });
  });

  router.post("/auth/refresh", async (req, res) => {
    const refreshToken = String(req.body?.refreshToken ?? "");
    if (!refreshToken) {
      res.status(400).json({ ok: false, message: "refreshToken이 필요합니다." });
      return;
    }
    const userId = consumeRefreshToken(refreshToken);
    if (!userId) {
      res.status(401).json({ ok: false, message: "유효하지 않거나 만료된 refresh token입니다." });
      return;
    }
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ ok: false, message: "사용자를 찾을 수 없습니다." });
      return;
    }
    const token = issueUserToken(user);
    const rotatedRefreshToken = issueRefreshToken(user.id);
    res.json({ ok: true, token, refreshToken: rotatedRefreshToken });
  });

  router.post("/auth/logout", async (req, res) => {
    const refreshToken = String(req.body?.refreshToken ?? "");
    if (refreshToken) revokeRefreshToken(refreshToken);
    res.json({ ok: true });
  });

  router.post("/payments/wallet/connect", requireUser, async (req, res) => {
    const walletAddress = String(req.body?.walletAddress ?? "").trim();
    const walletNetwork = String(req.body?.walletNetwork ?? "evm").trim();
    if (!walletAddress) {
      res.status(400).json({ ok: false, message: "walletAddress가 필요합니다." });
      return;
    }
    try {
      const user = await linkWalletAddress({ userId: req.user.sub, walletAddress, walletNetwork });
      res.json({ ok: true, user });
    } catch (error) {
      res.status(400).json({ ok: false, message: error instanceof Error ? error.message : "지갑 연결 실패" });
    }
  });

  router.get("/payments/membership/quote", requireUser, async (req, res) => {
    const planCode = String(req.query.planCode ?? "vip_30d");
    res.json({
      ok: true,
      quote: quoteMembershipPlan(planCode),
      depositAddress: MEMBERSHIP_DEPOSIT_ADDRESS
    });
  });

  router.post("/payments/membership/webhook", async (req, res) => {
    try {
      const result = await processOnchainPayment(req.body || {});
      appendAuditLog({
        actor: "membership-webhook",
        eventType: "membership_auto_extend",
        target: String(req.body?.userId ?? ""),
        action: "onchain_payment_confirmed",
        note: `tx=${req.body?.txHash ?? ""}, plan=${req.body?.planCode ?? ""}`
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ ok: false, message: error instanceof Error ? error.message : "결제 처리 실패" });
    }
  });

  router.get("/market/summary", async (_, res) => {
    res.json(await marketProvider.getSummary());
  });

  router.get("/signals", async (_, res) => {
    res.json(await signalProvider.getSignals());
  });

  router.get("/news", async (_, res) => {
    res.json(await newsProvider.getNews());
  });

  router.get("/system-trading/exchanges", async (_, res) => {
    const statuses = await Promise.all(
      Object.entries(exchangeConnectors).map(async ([key, connector]) => ({
        key,
        ...(await connector.getStatus())
      }))
    );
    res.json(statuses);
  });

  router.get("/system-trading/eligibility", async (_, res) => {
    // MVP: 실제 인증 연동 전까지 쿼리로 시뮬레이션
    const expiresAt = String(res.req.query.expiresAt ?? "");
    const referredBy = String(res.req.query.referredBy ?? "");
    const role = String(res.req.query.role ?? "free_member");

    const result = canAutoExecute({
      membershipExpiresAt: expiresAt,
      referredBy: referredBy || undefined,
      role
    });
    res.json(result);
  });

  router.get("/global-data/coverage", async (_, res) => {
    res.json(await globalDataConnector.getCoverage());
  });

  router.get("/scan/overview", async (_, res) => {
    res.json(await getScanOverview());
  });

  router.get("/scan/results", async (_, res) => {
    const type = String(res.req.query.type ?? "all");
    res.json(await runStockScan(type));
  });

  router.get("/research/strategy-scores", async (_, res) => {
    res.json(await getStrategyScores());
  });

  router.get("/research/strategy-policy", async (_, res) => {
    res.json(await evaluatePolicy());
  });

  router.post("/admin/strategies/action", requireAdmin, async (req, res) => {
    const strategyId = String(req.body?.strategyId ?? "");
    const action = String(req.body?.action ?? "");
    const note = String(req.body?.note ?? "");
    if (!strategyId || !action) {
      res.status(400).json({ ok: false, message: "strategyId와 action이 필요합니다." });
      return;
    }
    const result = await adminStrategyAction({ strategyId, action, note, actor: req.adminActor });
    appendAuditLog({
      actor: req.adminActor,
      eventType: "strategy_action",
      target: strategyId,
      action,
      note
    });
    res.json(result);
  });

  router.get("/admin/strategies/action-history", requireAdmin, async (_, res) => {
    res.json(await getActionHistory());
  });

  router.get("/admin/users", requireAdmin, async (_, res) => {
    res.json(await getUsers());
  });

  router.patch("/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await updateUserRoleMembership({
        userId: String(req.params.id),
        role: req.body?.role ? String(req.body.role) : undefined,
        membershipType: req.body?.membershipType ? String(req.body.membershipType) : undefined,
        membershipExpiresAt:
          req.body?.membershipExpiresAt !== undefined ? String(req.body.membershipExpiresAt || "") : undefined
      });
      appendAuditLog({
        actor: req.adminActor,
        eventType: "admin_user_update",
        target: String(req.params.id),
        action: "update_role_membership",
        note: `role=${req.body?.role ?? ""}, membershipType=${req.body?.membershipType ?? ""}, membershipExpiresAt=${req.body?.membershipExpiresAt ?? ""}`
      });
      res.json({ ok: true, user: updated });
    } catch (error) {
      res.status(400).json({ ok: false, message: error instanceof Error ? error.message : "회원 수정 실패" });
    }
  });

  router.get("/admin/audit-logs", requireAdmin, async (_, res) => {
    res.json(readAuditLogs().slice(0, 200));
  });

  return router;
}

module.exports = { createRouter };
