/**
 * Finnhub 시장 뉴스 (general 등) — API 키 필요.
 * @see https://finnhub.io/docs/api/market-news
 */

const NEWS_URL = "https://finnhub.io/api/v1/news";
const TIMEOUT_MS = Number(process.env.ONEAI_FINNHUB_NEWS_TIMEOUT_MS || 10000);
const DEFAULT_LIMIT = Math.min(20, Math.max(1, Number(process.env.ONEAI_FINNHUB_NEWS_LIMIT || 10)));

/**
 * @param {string} token
 * @param {{ category?: string; limit?: number }} [opts]
 * @returns {Promise<{ id: string; category: string; title: string; summary: string }[]>}
 */
async function fetchGeneralNews(token, opts = {}) {
  const category = String(opts.category || process.env.ONEAI_FINNHUB_NEWS_CATEGORY || "general").trim() || "general";
  const limit = typeof opts.limit === "number" ? opts.limit : DEFAULT_LIMIT;
  const url = `${NEWS_URL}?category=${encodeURIComponent(category)}&token=${encodeURIComponent(token)}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" }
    });
    if (!res.ok) {
      throw new Error(`Finnhub news HTTP ${res.status}`);
    }
    const arr = await res.json();
    if (!Array.isArray(arr)) {
      throw new Error("Finnhub news: invalid body");
    }
    return arr.slice(0, limit).map((item, i) => {
      const id = item.id != null ? String(item.id) : `fh-news-${i}`;
      const headline = typeof item.headline === "string" ? item.headline : "";
      let summary = typeof item.summary === "string" ? item.summary : "";
      if (summary.length > 400) {
        summary = `${summary.slice(0, 397)}…`;
      }
      if (!summary && typeof item.url === "string") {
        summary = item.url;
      }
      const cat = typeof item.category === "string" && item.category ? item.category : "시장";
      return { id, category: cat, title: headline, summary: summary || headline };
    });
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchGeneralNews, DEFAULT_LIMIT };
