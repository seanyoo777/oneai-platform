/**
 * CoinGecko 공개 API (API 키 불필요, 호출 한도 있음).
 * @see https://docs.coingecko.com/reference/simple-price
 */

const CG_SIMPLE = "https://api.coingecko.com/api/v3/simple/price";

/** summary 행 name → CoinGecko id */
const NAME_TO_ID = {
  BTC: "bitcoin",
  ETH: "ethereum"
};

const FETCH_MS = Number(process.env.ONEAI_COINGECKO_TIMEOUT_MS || 8000);

async function fetchCgPrices() {
  const ids = [...new Set(Object.values(NAME_TO_ID))].join(",");
  const url = `${CG_SIMPLE}?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" }
    });
    if (!res.ok) {
      throw new Error(`CoinGecko HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {Array<{ name: string; value: unknown; change?: unknown }>} rows
 * @param {Record<string, { usd?: number; usd_24h_change?: number }>} cgData
 */
function mergeCryptoIntoSummary(rows, cgData) {
  return rows.map((row) => {
    const id = NAME_TO_ID[row.name];
    if (!id || !cgData || typeof cgData !== "object") return row;
    const p = cgData[id];
    if (!p || typeof p !== "object") return row;
    const usd = p.usd;
    const ch = p.usd_24h_change;
    return {
      ...row,
      value: typeof usd === "number" ? usd : row.value,
      change: typeof ch === "number" ? Number(ch.toFixed(2)) : row.change
    };
  });
}

module.exports = { fetchCgPrices, mergeCryptoIntoSummary, NAME_TO_ID };
