/**
 * 배포 후 빠른 확인: health·meta(id·apiVersion·serverPackageVersion 일치), cms/public, …
 * 사용: SMOKE_API_BASE=https://oneai-api.onrender.com node scripts/smoke-api.js
 */
const http = require("http");
const https = require("https");

const base = (process.env.SMOKE_API_BASE || "http://127.0.0.1:4200").replace(/\/$/, "");

function request(path) {
  const url = new URL(path, base);
  const lib = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    lib
      .get(url, (res) => {
        let data = "";
        res.on("data", (c) => {
          data += c;
        });
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode || 0, json: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode || 0, raw: data.slice(0, 200) });
          }
        });
      })
      .on("error", reject);
  });
}

(async () => {
  try {
    const health = await request("/health");
    const hj = health.json;
    if (
      health.status !== 200 ||
      !hj ||
      hj.ok !== true ||
      hj.service !== "oneai-server" ||
      typeof hj.platformServiceId !== "string" ||
      typeof hj.apiVersion !== "string" ||
      typeof hj.serverPackageVersion !== "string" ||
      (hj.userStorage !== "postgresql" && hj.userStorage !== "file") ||
      typeof hj.features !== "object" ||
      hj.features === null ||
      typeof hj.features.cms !== "boolean" ||
      typeof hj.features.watchlist !== "boolean" ||
      typeof hj.features.aiRecommendationLog !== "boolean" ||
      typeof hj.features.adminRbac !== "boolean"
    ) {
      console.error("FAIL /health", health.status, hj ?? health.raw);
      process.exit(1);
    }
    const integ = hj.integrations;
    if (
      typeof integ !== "object" ||
      integ === null ||
      typeof integ.coingecko !== "boolean" ||
      typeof integ.finnhubQuote !== "boolean" ||
      typeof integ.finnhubNews !== "boolean" ||
      typeof integ.yahooKospi !== "boolean"
    ) {
      console.error("FAIL /health integrations", hj.integrations);
      process.exit(1);
    }
    const meta = await request("/api/platform/meta");
    const mj = meta.json;
    if (meta.status !== 200 || !mj || mj.ok !== true) {
      console.error("FAIL /api/platform/meta", meta.status, mj ?? meta.raw);
      process.exit(1);
    }
    if (mj.platformServiceId !== hj.platformServiceId || mj.apiVersion !== hj.apiVersion) {
      console.error("FAIL /health vs /api/platform/meta id/version mismatch", hj.platformServiceId, mj.platformServiceId, hj.apiVersion, mj.apiVersion);
      process.exit(1);
    }
    if (mj.serverPackageVersion !== hj.serverPackageVersion) {
      console.error(
        "FAIL /health vs /api/platform/meta serverPackageVersion mismatch",
        hj.serverPackageVersion,
        mj.serverPackageVersion
      );
      process.exit(1);
    }
    const mjInt = mj.integrations;
    if (
      typeof mjInt !== "object" ||
      mjInt === null ||
      mjInt.coingecko !== integ.coingecko ||
      mjInt.finnhubQuote !== integ.finnhubQuote ||
      mjInt.finnhubNews !== integ.finnhubNews ||
      mjInt.yahooKospi !== integ.yahooKospi
    ) {
      console.error("FAIL /health vs /api/platform/meta integrations mismatch", integ, mjInt);
      process.exit(1);
    }
    const cmsPub = await request("/api/cms/public");
    const cm = cmsPub.json;
    if (
      cmsPub.status !== 200 ||
      !cm ||
      cm.ok !== true ||
      !Array.isArray(cm.banners) ||
      !Array.isArray(cm.articles) ||
      !Array.isArray(cm.featuredPicks) ||
      !Array.isArray(cm.events)
    ) {
      console.error("FAIL /api/cms/public", cmsPub.status, cm ?? cmsPub.raw);
      process.exit(1);
    }
    const market = await request("/api/market/summary");
    if (market.status !== 200 || !market.json?.ok || market.json.summary === undefined) {
      console.error("FAIL /api/market/summary", market.status, market.json ?? market.raw);
      process.exit(1);
    }
    const signalsRes = await request("/api/signals");
    const sj = signalsRes.json;
    if (signalsRes.status !== 200 || !sj || sj.ok !== true || !Array.isArray(sj.signals)) {
      console.error("FAIL /api/signals", signalsRes.status, sj ?? signalsRes.raw);
      process.exit(1);
    }
    const newsRes = await request("/api/news");
    const nj = newsRes.json;
    if (newsRes.status !== 200 || !nj || nj.ok !== true || !Array.isArray(nj.news)) {
      console.error("FAIL /api/news", newsRes.status, nj ?? newsRes.raw);
      process.exit(1);
    }
    const scanOv = await request("/api/scan/overview");
    const so = scanOv.json;
    if (
      scanOv.status !== 200 ||
      !so ||
      so.ok !== true ||
      typeof so.universeCount !== "number" ||
      !Array.isArray(so.fields) ||
      !Array.isArray(so.scanners)
    ) {
      console.error("FAIL /api/scan/overview", scanOv.status, so ?? scanOv.raw);
      process.exit(1);
    }
    const exRes = await request("/api/system-trading/exchanges");
    const exj = exRes.json;
    if (
      exRes.status !== 200 ||
      !exj ||
      exj.ok !== true ||
      !Array.isArray(exj.exchanges) ||
      exj.exchanges.length < 1
    ) {
      console.error("FAIL /api/system-trading/exchanges", exRes.status, exj ?? exRes.raw);
      process.exit(1);
    }
    const elRes = await request("/api/system-trading/eligibility");
    const el = elRes.json;
    if (
      elRes.status !== 200 ||
      !el ||
      el.ok !== true ||
      typeof el.eligible !== "boolean" ||
      typeof el.referralOk !== "boolean" ||
      typeof el.membershipOk !== "boolean" ||
      typeof el.reason !== "string"
    ) {
      console.error("FAIL /api/system-trading/eligibility", elRes.status, el ?? elRes.raw);
      process.exit(1);
    }
    const covRes = await request("/api/global-data/coverage");
    const cv = covRes.json;
    if (
      covRes.status !== 200 ||
      !cv ||
      cv.ok !== true ||
      typeof cv.us !== "object" ||
      cv.us === null ||
      typeof cv.kr !== "object" ||
      cv.kr === null ||
      typeof cv.macro !== "object" ||
      cv.macro === null
    ) {
      console.error("FAIL /api/global-data/coverage", covRes.status, cv ?? covRes.raw);
      process.exit(1);
    }
    const stratRes = await request("/api/research/strategy-scores");
    const st = stratRes.json;
    if (
      stratRes.status !== 200 ||
      !st ||
      st.ok !== true ||
      !Array.isArray(st.scores) ||
      st.scores.length < 1
    ) {
      console.error("FAIL /api/research/strategy-scores", stratRes.status, st ?? stratRes.raw);
      process.exit(1);
    }
    const polRes = await request("/api/research/strategy-policy");
    const pj = polRes.json;
    if (
      polRes.status !== 200 ||
      !pj ||
      pj.ok !== true ||
      typeof pj.policyConfig !== "object" ||
      pj.policyConfig === null ||
      !Array.isArray(pj.results)
    ) {
      console.error("FAIL /api/research/strategy-policy", polRes.status, pj ?? polRes.raw);
      process.exit(1);
    }
    const scanRes = await request("/api/scan/results?type=all");
    const sres = scanRes.json;
    if (
      scanRes.status !== 200 ||
      !sres ||
      sres.ok !== true ||
      !Array.isArray(sres.results) ||
      sres.results.length < 1
    ) {
      console.error("FAIL /api/scan/results?type=all", scanRes.status, sres ?? scanRes.raw);
      process.exit(1);
    }
    const catalog = await request("/api/payments/membership/catalog");
    const cat = catalog.json;
    if (
      catalog.status !== 200 ||
      !cat ||
      cat.ok !== true ||
      !Array.isArray(cat.plans) ||
      cat.plans.length < 1
    ) {
      console.error("FAIL /api/payments/membership/catalog", catalog.status, cat ?? catalog.raw);
      process.exit(1);
    }
    const missing = await request("/api/__smoke_missing_route__");
    const missBody = missing.json;
    if (
      missing.status !== 404 ||
      !missBody ||
      missBody.ok !== false ||
      missBody.code !== "NOT_FOUND" ||
      typeof missBody.message !== "string"
    ) {
      console.error("FAIL unknown /api route (expect 404 NOT_FOUND)", missing.status, missBody ?? missing.raw);
      process.exit(1);
    }
    console.log("smoke ok:", base, "service=", health.json.service, "apiVersion=", meta.json.apiVersion);
  } catch (e) {
    console.error("smoke error:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
})();
