const { cached } = require("../cache-memory");
const { sendOk } = require("../api-response");
const { getPublicFeatureFlags } = require("../platform-context");
const { appendAiRecLog } = require("../ai-rec-log-store");
const { marketProvider, signalProvider, newsProvider } = require("../sources");
const { canAutoExecute } = require("../automation");
const { exchangeConnectors, globalDataConnector } = require("../connectors");
const { getScanOverview, runStockScan } = require("../stock-scan");
const { getStrategyScores } = require("../strategy-score");
const { evaluatePolicy } = require("../strategy-policy");
const { asyncHandler } = require("../async-handler");

const PUBLIC_CACHE_MS = Number(process.env.ONEAI_PUBLIC_CACHE_TTL_MS || 15000);

/** 시세·뉴스·스캔·연구·트레이딩 자격 — 소스 어댑터 기반 공개 조회 */
function registerMarketDataRoutes(router) {
  router.get("/market/summary", asyncHandler(async (_, res) => {
    const summary = await cached("pub:market:summary", PUBLIC_CACHE_MS, () => marketProvider.getSummary());
    sendOk(res, { summary });
  }));

  router.get("/signals", asyncHandler(async (_, res) => {
    const signals = await cached("pub:signals", PUBLIC_CACHE_MS, async () => {
      const list = await signalProvider.getSignals();
      try {
        if (getPublicFeatureFlags().aiRecommendationLog) {
          const arr = Array.isArray(list) ? list : [];
          await appendAiRecLog({
            channel: "GET /api/signals",
            kind: "signal_batch",
            modelVersion: process.env.ONEAI_SIGNAL_MODEL_VERSION || "mvp-dummy",
            summary: {
              count: arr.length,
              symbols: arr.map((s) => (s && typeof s === "object" ? s.symbol : null)).filter(Boolean)
            }
          });
        }
      } catch {
        /* 로깅 실패가 API 응답을 막지 않음 */
      }
      return list;
    });
    sendOk(res, { signals });
  }));

  router.get("/news", asyncHandler(async (_, res) => {
    const news = await cached("pub:news", PUBLIC_CACHE_MS, () => newsProvider.getNews());
    sendOk(res, { news });
  }));

  router.get("/system-trading/exchanges", asyncHandler(async (_, res) => {
    const exchanges = await Promise.all(
      Object.entries(exchangeConnectors).map(async ([key, connector]) => ({
        key,
        ...(await connector.getStatus())
      }))
    );
    sendOk(res, { exchanges });
  }));

  router.get("/system-trading/eligibility", asyncHandler(async (req, res) => {
    const expiresAt = String(req.query.expiresAt ?? "");
    const referredBy = String(req.query.referredBy ?? "");
    const role = String(req.query.role ?? "free_member");

    const eligibility = canAutoExecute({
      membershipExpiresAt: expiresAt,
      referredBy: referredBy || undefined,
      role
    });
    sendOk(res, eligibility);
  }));

  router.get("/global-data/coverage", asyncHandler(async (_, res) => {
    const coverage = await globalDataConnector.getCoverage();
    sendOk(res, coverage);
  }));

  router.get("/scan/overview", asyncHandler(async (_, res) => {
    const overview = await getScanOverview();
    sendOk(res, overview);
  }));

  router.get("/scan/results", asyncHandler(async (req, res) => {
    const type = String(req.query.type ?? "all");
    const results = await runStockScan(type);
    sendOk(res, { results });
  }));

  router.get("/research/strategy-scores", asyncHandler(async (_, res) => {
    const scores = await getStrategyScores();
    sendOk(res, { scores });
  }));

  router.get("/research/strategy-policy", asyncHandler(async (_, res) => {
    const payload = await evaluatePolicy();
    sendOk(res, payload);
  }));
}

module.exports = { registerMarketDataRoutes };
