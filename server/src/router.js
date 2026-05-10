const express = require("express");
const { registerAuthRoutes } = require("./routes/auth");
const { registerProfileRoutes } = require("./routes/profile");
const { registerBillingRoutes } = require("./routes/billing");
const { registerMarketDataRoutes } = require("./routes/market-data");
const { registerAdminRoutes } = require("./routes/admin");
const { registerCmsPublicRoutes } = require("./routes/cms-public");
const { registerCmsAdminRoutes } = require("./routes/cms-admin");
const { registerPlatformPublicRoutes } = require("./routes/platform-public");

/**
 * 단일 Express 마운트 지점. 논리 모듈은 routes/* 로 분리되어
 * 향후 마이크로서비스·API 게이트웨이로 경로만 이전하기 쉽다.
 */
function createRouter() {
  const router = express.Router();
  registerAuthRoutes(router);
  registerPlatformPublicRoutes(router);
  registerProfileRoutes(router);
  registerBillingRoutes(router);
  registerMarketDataRoutes(router);
  registerCmsPublicRoutes(router);
  registerAdminRoutes(router);
  registerCmsAdminRoutes(router);
  return router;
}

module.exports = { createRouter };
