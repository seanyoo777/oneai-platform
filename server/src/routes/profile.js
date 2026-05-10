const { requireUser } = require("../user-auth");
const { getPublicFeatureFlags } = require("../platform-context");
const { appendAuditLog } = require("../audit-log-store");
const { getWatchlist, setWatchlist, normalizeWatchlistItems } = require("../watchlist-store");
const { ErrorCodes, sendOk, sendError } = require("../api-response");
const { asyncHandler } = require("../async-handler");

function requireWatchlistFeature(_req, res, next) {
  if (!getPublicFeatureFlags().watchlist) {
    sendError(res, 403, ErrorCodes.FORBIDDEN, "관심종목 기능이 비활성화되어 있습니다.");
    return;
  }
  next();
}

/** Profile — 사용자별 설정 (통합 user_id 기준 확장: 관심종목 등) */
function registerProfileRoutes(router) {
  router.get("/me/watchlist", requireUser, requireWatchlistFeature, asyncHandler(async (req, res) => {
    try {
      const items = await getWatchlist(req.user.sub);
      sendOk(res, { items });
    } catch (error) {
      sendError(
        res,
        500,
        ErrorCodes.INTERNAL,
        error instanceof Error ? error.message : "관심종목 조회 실패"
      );
    }
  }));

  router.put("/me/watchlist", requireUser, requireWatchlistFeature, asyncHandler(async (req, res) => {
    try {
      const items = normalizeWatchlistItems(req.body?.items);
      await setWatchlist(req.user.sub, items);
      await appendAuditLog({
        actor: req.user.sub,
        eventType: "watchlist_update",
        target: req.user.sub,
        action: "replace",
        note: `count=${items.length}`
      });
      sendOk(res, { items: await getWatchlist(req.user.sub) });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "관심종목 저장 실패";
      sendError(res, 400, ErrorCodes.VALIDATION_ERROR, msg);
    }
  }));
}

module.exports = { registerProfileRoutes };
