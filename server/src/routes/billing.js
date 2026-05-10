const { requireUser } = require("../user-auth");
const { ErrorCodes, sendOk, sendError } = require("../api-response");
const { appendAuditLog } = require("../audit-log-store");
const {
  quoteMembershipPlan,
  listMembershipPlans,
  processOnchainPayment,
  MEMBERSHIP_DEPOSIT_ADDRESS
} = require("../membership-payment");
const { linkWalletAddress } = require("../user-store");
const { asyncHandler } = require("../async-handler");

/** Billing — 결제·멤버십 (금액 확정은 서버 단일 진실 유지) */
function registerBillingRoutes(router) {
  router.get("/payments/membership/catalog", asyncHandler(async (_req, res) => {
    sendOk(res, { plans: listMembershipPlans() });
  }));

  router.post("/payments/wallet/connect", requireUser, asyncHandler(async (req, res) => {
    const walletAddress = String(req.body?.walletAddress ?? "").trim();
    const walletNetwork = String(req.body?.walletNetwork ?? "evm").trim();
    if (!walletAddress) {
      sendError(res, 400, ErrorCodes.VALIDATION_ERROR, "walletAddress가 필요합니다.");
      return;
    }
    try {
      const user = await linkWalletAddress({ userId: req.user.sub, walletAddress, walletNetwork });
      sendOk(res, { user });
    } catch (error) {
      sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error instanceof Error ? error.message : "지갑 연결 실패");
    }
  }));

  router.get("/payments/membership/quote", requireUser, asyncHandler(async (req, res) => {
    const planCode = String(req.query.planCode ?? "vip_30d");
    sendOk(res, {
      quote: quoteMembershipPlan(planCode),
      depositAddress: MEMBERSHIP_DEPOSIT_ADDRESS
    });
  }));

  router.post("/payments/membership/webhook", asyncHandler(async (req, res) => {
    try {
      const result = await processOnchainPayment(req.body || {});
      await appendAuditLog({
        actor: "membership-webhook",
        eventType: "membership_auto_extend",
        target: String(req.body?.userId ?? ""),
        action: "onchain_payment_confirmed",
        note: `tx=${req.body?.txHash ?? ""}, plan=${req.body?.planCode ?? ""}`
      });
      sendOk(res, result);
    } catch (error) {
      sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error instanceof Error ? error.message : "결제 처리 실패");
    }
  }));
}

module.exports = { registerBillingRoutes };
