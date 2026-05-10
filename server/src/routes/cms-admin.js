const { requireAdmin, requireAdminRoles, AdminRoles } = require("../admin-auth");
const { ErrorCodes, sendOk, sendError } = require("../api-response");
const { getPublicFeatureFlags } = require("../platform-context");
const { appendAuditLog } = require("../audit-log-store");
const { listAll, findById, createItem, updateItem, removeItem } = require("../cms-store");
const { asyncHandler } = require("../async-handler");

const { SUPER_ADMIN, OPS_ADMIN, MARKETING_ADMIN } = AdminRoles;

function requireCmsFeature(_req, res, next) {
  if (!getPublicFeatureFlags().cms) {
    sendError(res, 403, ErrorCodes.FORBIDDEN, "CMS 기능이 비활성화되어 있습니다.");
    return;
  }
  next();
}

/** 운영 콘텐츠 CRUD — 마케팅/최고는 쓰기, 운영은 열람 */
function registerCmsAdminRoutes(router) {
  router.get(
    "/admin/cms/items",
    requireAdmin,
    requireCmsFeature,
    requireAdminRoles(SUPER_ADMIN, OPS_ADMIN, MARKETING_ADMIN),
    asyncHandler(async (req, res) => {
      try {
        const kind = req.query.kind ? String(req.query.kind) : undefined;
        const items = await listAll(kind);
        sendOk(res, { items });
      } catch (error) {
        sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error instanceof Error ? error.message : "목록 조회 실패");
      }
    })
  );

  router.post(
    "/admin/cms/items",
    requireAdmin,
    requireCmsFeature,
    requireAdminRoles(SUPER_ADMIN, MARKETING_ADMIN),
    asyncHandler(async (req, res) => {
      try {
        const item = await createItem(req.body || {});
        await appendAuditLog({
          actor: req.adminActor,
          eventType: "cms_content_create",
          target: item.id,
          action: item.kind,
          note: String(item.title ?? "").slice(0, 240)
        });
        sendOk(res, { item });
      } catch (error) {
        sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error instanceof Error ? error.message : "생성 실패");
      }
    })
  );

  router.patch(
    "/admin/cms/items/:id",
    requireAdmin,
    requireCmsFeature,
    requireAdminRoles(SUPER_ADMIN, MARKETING_ADMIN),
    asyncHandler(async (req, res) => {
      try {
        const prev = await findById(String(req.params.id));
        const updated = await updateItem(String(req.params.id), req.body || {});
        if (!updated) {
          sendError(res, 404, ErrorCodes.NOT_FOUND, "항목을 찾을 수 없습니다.");
          return;
        }
        await appendAuditLog({
          actor: req.adminActor,
          eventType: "cms_content_update",
          target: updated.id,
          action: updated.kind,
          note: `was=${prev?.title ?? ""}`.slice(0, 240)
        });
        sendOk(res, { item: updated });
      } catch (error) {
        sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error instanceof Error ? error.message : "수정 실패");
      }
    })
  );

  router.delete(
    "/admin/cms/items/:id",
    requireAdmin,
    requireCmsFeature,
    requireAdminRoles(SUPER_ADMIN, MARKETING_ADMIN),
    asyncHandler(async (req, res) => {
      try {
        const prev = await findById(String(req.params.id));
        const removed = await removeItem(String(req.params.id));
        if (!removed) {
          sendError(res, 404, ErrorCodes.NOT_FOUND, "항목을 찾을 수 없습니다.");
          return;
        }
        await appendAuditLog({
          actor: req.adminActor,
          eventType: "cms_content_delete",
          target: String(req.params.id),
          action: prev?.kind ?? "unknown",
          note: String(prev?.title ?? "").slice(0, 240)
        });
        sendOk(res, {});
      } catch (error) {
        sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error instanceof Error ? error.message : "삭제 실패");
      }
    })
  );
}

module.exports = { registerCmsAdminRoutes };
