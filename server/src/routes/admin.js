const { requireAdmin, requireAdminRoles, AdminRoles } = require("../admin-auth");
const { ErrorCodes, sendOk, sendError } = require("../api-response");
const { getPublicFeatureFlags } = require("../platform-context");
const { readAiRecLogs } = require("../ai-rec-log-store");
const { appendAuditLog, readAuditLogs } = require("../audit-log-store");
const { adminStrategyAction, getActionHistory } = require("../strategy-policy");
const { getUsers, updateUserRoleMembership } = require("../user-store");
const { asyncHandler } = require("../async-handler");

const { SUPER_ADMIN, OPS_ADMIN, CS_ADMIN, MARKETING_ADMIN, BILLING_ADMIN } = AdminRoles;

/** 운영·감사 — RBAC: 역할별 토큰은 admin-auth 참고 */
function registerAdminRoutes(router) {
  router.get("/admin/session", requireAdmin, (req, res) => {
    sendOk(res, { role: req.adminRole, actor: req.adminActor });
  });

  router.post(
    "/admin/strategies/action",
    requireAdmin,
    requireAdminRoles(SUPER_ADMIN, OPS_ADMIN),
    asyncHandler(async (req, res) => {
      const strategyId = String(req.body?.strategyId ?? "");
      const action = String(req.body?.action ?? "");
      const note = String(req.body?.note ?? "");
      if (!strategyId || !action) {
        sendError(res, 400, ErrorCodes.VALIDATION_ERROR, "strategyId와 action이 필요합니다.");
        return;
      }
      const result = await adminStrategyAction({ strategyId, action, note, actor: req.adminActor });
      await appendAuditLog({
        actor: req.adminActor,
        eventType: "strategy_action",
        target: strategyId,
        action,
        note
      });
      sendOk(res, result);
    })
  );

  router.get(
    "/admin/strategies/action-history",
    requireAdmin,
    requireAdminRoles(SUPER_ADMIN, OPS_ADMIN),
    asyncHandler(async (_, res) => {
      const entries = await getActionHistory();
      sendOk(res, { entries });
    })
  );

  router.get(
    "/admin/users",
    requireAdmin,
    requireAdminRoles(SUPER_ADMIN, OPS_ADMIN, CS_ADMIN),
    asyncHandler(async (_, res) => {
      const users = await getUsers();
      sendOk(res, { users });
    })
  );

  router.patch(
    "/admin/users/:id",
    requireAdmin,
    requireAdminRoles(SUPER_ADMIN, OPS_ADMIN, CS_ADMIN),
    asyncHandler(async (req, res) => {
      try {
        const updated = await updateUserRoleMembership({
          userId: String(req.params.id),
          role: req.body?.role ? String(req.body.role) : undefined,
          membershipType: req.body?.membershipType ? String(req.body.membershipType) : undefined,
          membershipExpiresAt:
            req.body?.membershipExpiresAt !== undefined ? String(req.body.membershipExpiresAt || "") : undefined
        });
        await appendAuditLog({
          actor: req.adminActor,
          eventType: "admin_user_update",
          target: String(req.params.id),
          action: "update_role_membership",
          note: `role=${req.body?.role ?? ""}, membershipType=${req.body?.membershipType ?? ""}, membershipExpiresAt=${req.body?.membershipExpiresAt ?? ""}`
        });
        sendOk(res, { user: updated });
      } catch (error) {
        sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error instanceof Error ? error.message : "회원 수정 실패");
      }
    })
  );

  router.get(
    "/admin/audit-logs",
    requireAdmin,
    requireAdminRoles(SUPER_ADMIN, OPS_ADMIN, CS_ADMIN, MARKETING_ADMIN, BILLING_ADMIN),
    asyncHandler(async (_, res) => {
      const logs = await readAuditLogs();
      sendOk(res, { logs: logs.slice(0, 200) });
    })
  );

  router.get(
    "/admin/ai-recommendation-logs",
    requireAdmin,
    requireAdminRoles(SUPER_ADMIN, OPS_ADMIN),
    asyncHandler(async (req, res) => {
      if (!getPublicFeatureFlags().aiRecommendationLog) {
        sendOk(res, { logs: [] });
        return;
      }
      const raw = req.query.limit;
      const limit = raw !== undefined ? Number(raw) : 100;
      const logs = await readAiRecLogs(limit);
      sendOk(res, { logs });
    })
  );
}

module.exports = { registerAdminRoutes };
