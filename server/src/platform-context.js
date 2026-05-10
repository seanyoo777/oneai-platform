/**
 * 통합 플랫폼 전제: 모든 배포 단위는 동일한 식별 규약으로 헬스·로그·추후 게이트웨이에서 구분된다.
 * 다른 마이크로서비스로 쪼개도 user_id·감사로그·API 규격은 공유한다.
 */
const pkg = require("../package.json");

const PLATFORM_SERVICE_ID = process.env.ONEAI_PLATFORM_SERVICE_ID || "oneai-core";
const PLATFORM_API_VERSION = process.env.ONEAI_API_VERSION || "1";

function getPlatformMeta() {
  return {
    platformServiceId: PLATFORM_SERVICE_ID,
    apiVersion: PLATFORM_API_VERSION,
    serverPackageVersion: pkg.version || "0.0.0"
  };
}

/** 공개 클라이언트용 기능 플래그 — env 로 단계적 롤아웃 */
function getPublicFeatureFlags() {
  const off = (name) => process.env[name] === "0" || process.env[name] === "false";
  return {
    cms: !off("ONEAI_FEATURE_CMS"),
    watchlist: !off("ONEAI_FEATURE_WATCHLIST"),
    aiRecommendationLog: !off("ONEAI_FEATURE_AI_REC_LOG"),
    /** 역할 토큰이 하나라도 설정되면 RBAC 모드 사용 중 */
    adminRbac:
      Boolean(process.env.ONEAI_ADMIN_TOKEN_OPS) ||
      Boolean(process.env.ONEAI_ADMIN_TOKEN_CS) ||
      Boolean(process.env.ONEAI_ADMIN_TOKEN_MARKETING) ||
      Boolean(process.env.ONEAI_ADMIN_TOKEN_BILLING)
  };
}

/** 공개 조회용 — 키 존재·플래그만 노출 (값은 노출하지 않음) */
function getPublicIntegrationFlags() {
  const hasFinnhub = Boolean(process.env.FINNHUB_API_KEY && String(process.env.FINNHUB_API_KEY).trim());
  const finnhubNewsOn =
    hasFinnhub && (process.env.ONEAI_FINNHUB_NEWS === "1" || process.env.ONEAI_FINNHUB_NEWS === "true");
  return {
    coingecko: process.env.ONEAI_COINGECKO === "1" || process.env.ONEAI_COINGECKO === "true",
    finnhubQuote: hasFinnhub,
    finnhubNews: finnhubNewsOn,
    yahooKospi: process.env.ONEAI_YAHOO_KOSPI === "1" || process.env.ONEAI_YAHOO_KOSPI === "true"
  };
}

module.exports = {
  PLATFORM_SERVICE_ID,
  PLATFORM_API_VERSION,
  getPlatformMeta,
  getPublicFeatureFlags,
  getPublicIntegrationFlags
};
