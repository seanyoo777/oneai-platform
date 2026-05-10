/**
 * Yahoo Finance Chart API (비공식) — KOSPI (^KS11) 요약 행 병합.
 * 데이터센터 IP에서 차단될 수 있음 → 실패 시 더미 유지.
 */

const DEFAULT_INTERVAL = "1d";
const DEFAULT_RANGE = "2d";
const TIMEOUT_MS = Number(process.env.ONEAI_YAHOO_TIMEOUT_MS || 10000);

/** URL 인코딩된 심볼 기본 ^KS11 */
const DEFAULT_SYMBOL_PATH = "%5EKS11";

function buildChartUrl(symbolPath) {
  const sym = symbolPath && String(symbolPath).trim() ? String(symbolPath).trim() : DEFAULT_SYMBOL_PATH;
  return `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=${DEFAULT_INTERVAL}&range=${DEFAULT_RANGE}`;
}

async function fetchKospiFromYahoo(symbolPath) {
  const url = buildChartUrl(symbolPath);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": process.env.ONEAI_YAHOO_USER_AGENT || "Mozilla/5.0 (compatible; OneAI-MVP/1.0)"
      }
    });
    if (!res.ok) {
      throw new Error(`Yahoo chart HTTP ${res.status}`);
    }
    const json = await res.json();
    const result = json.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta || typeof meta.regularMarketPrice !== "number") {
      throw new Error("Yahoo: missing regularMarketPrice");
    }
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose;
    if (typeof prev !== "number" || prev === 0) {
      throw new Error("Yahoo: invalid chartPreviousClose");
    }
    const pct = ((price - prev) / prev) * 100;
    return {
      close: price,
      changePct: Number(pct.toFixed(2))
    };
  } finally {
    clearTimeout(timer);
  }
}

function mergeKospiRow(rows, { close, changePct }) {
  return rows.map((row) => {
    if (row.name !== "KOSPI") return row;
    return {
      ...row,
      value: close,
      change: changePct
    };
  });
}

module.exports = { fetchKospiFromYahoo, mergeKospiRow, DEFAULT_SYMBOL_PATH };
