const { ErrorCodes, sendOk, sendError } = require("../api-response");
const { getPublicFeatureFlags } = require("../platform-context");
const { listPublicGrouped } = require("../cms-store");
const { asyncHandler } = require("../async-handler");

function emptyCmsGrouped() {
  return {
    banners: [],
    articles: [],
    featuredPicks: [],
    events: []
  };
}

/** 게시된 배너·기사·추천·이벤트 — 인증 불필요 */
function registerCmsPublicRoutes(router) {
  router.get("/cms/public", asyncHandler(async (_req, res) => {
    try {
      if (!getPublicFeatureFlags().cms) {
        sendOk(res, emptyCmsGrouped());
        return;
      }
      const grouped = await listPublicGrouped();
      sendOk(res, grouped);
    } catch (error) {
      sendError(res, 500, ErrorCodes.INTERNAL, error instanceof Error ? error.message : "콘텐츠 조회 실패");
    }
  }));
}

module.exports = { registerCmsPublicRoutes };
