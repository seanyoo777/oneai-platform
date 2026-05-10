const { getPlatformMeta, getPublicFeatureFlags, getPublicIntegrationFlags } = require("../platform-context");
const { sendOk } = require("../api-response");

/** 클라이언트·파트너가 버전·기능 가용성을 맞추기 위한 공개 메타 */
function registerPlatformPublicRoutes(router) {
  router.get("/platform/meta", (_req, res) => {
    sendOk(res, {
      ...getPlatformMeta(),
      features: getPublicFeatureFlags(),
      integrations: getPublicIntegrationFlags(),
      time: new Date().toISOString()
    });
  });
}

module.exports = { registerPlatformPublicRoutes };
