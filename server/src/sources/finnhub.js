/**
 * Finnhub — 미국 시장 대표 심볼(기본 QQQ) 시세로 `NASDAQ` 요약 행을 덮어씀.
 * @see https://finnhub.io/docs/api/quote
 *
 * 무료 키: https://finnhub.io/register
 */

const QUOTE_URL = "https://finnhub.io/api/v1/quote";
const TIMEOUT_MS = Number(process.env.ONEAI_FINNHUB_TIMEOUT_MS || 8000);

/**
 * @param {string} symbol 예: QQQ, SPY, MSFT
 * @param {string} token API 키
 */
async function fetchQuote(symbol, token) {
  const url = `${QUOTE_URL}?symbol=${encodeURIComponent(symbol)}&token=${encodeURIComponent(token)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" }
    });
    if (!res.ok) {
      throw new Error(`Finnhub HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Finnhub quote: c=현재가, dp=전일대비 %
 * @param {Array<{ name: string; value: unknown; change?: unknown }>} rows
 * @param {{ c?: number; dp?: number }} quote
 */
function mergeNasdaqRow(rows, quote) {
  if (!quote || typeof quote.c !== "number") return rows;
  const pct = typeof quote.dp === "number" ? Number(quote.dp.toFixed(2)) : undefined;
  return rows.map((row) => {
    if (row.name !== "NASDAQ") return row;
    return {
      ...row,
      value: quote.c,
      ...(pct !== undefined ? { change: pct } : {})
    };
  });
}

module.exports = { fetchQuote, mergeNasdaqRow };
