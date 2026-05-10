const dummy = require("./dummy");
const { fetchCgPrices, mergeCryptoIntoSummary } = require("./coingecko");
const { fetchQuote, mergeNasdaqRow } = require("./finnhub");
const { fetchKospiFromYahoo, mergeKospiRow, DEFAULT_SYMBOL_PATH } = require("./yahoo-kospi");
const { fetchGeneralNews } = require("./finnhub-news");

function coingeckoEnabled() {
  const v = process.env.ONEAI_COINGECKO;
  return v === "1" || v === "true";
}

function finnhubEnabled() {
  const k = process.env.FINNHUB_API_KEY;
  return typeof k === "string" && k.trim().length > 0;
}

function yahooKospiEnabled() {
  const v = process.env.ONEAI_YAHOO_KOSPI;
  return v === "1" || v === "true";
}

function finnhubNewsEnabled() {
  return process.env.ONEAI_FINNHUB_NEWS === "1" || process.env.ONEAI_FINNHUB_NEWS === "true";
}

const marketProvider = {
  async getSummary() {
    let rows = await dummy.marketProvider.getSummary();

    if (coingeckoEnabled()) {
      try {
        const cgData = await fetchCgPrices();
        rows = mergeCryptoIntoSummary(rows, cgData);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn("[oneai-sources] CoinGecko 비활성, 더미 유지:", msg);
      }
    }

    if (finnhubEnabled()) {
      try {
        const token = String(process.env.FINNHUB_API_KEY).trim();
        const symbol = String(process.env.ONEAI_FINNHUB_SYMBOL || "QQQ").trim() || "QQQ";
        const quote = await fetchQuote(symbol, token);
        rows = mergeNasdaqRow(rows, quote);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn("[oneai-sources] Finnhub 비활성, NASDAQ 더미 유지:", msg);
      }
    }

    if (yahooKospiEnabled()) {
      try {
        const symPath = String(process.env.ONEAI_YAHOO_SYMBOL || DEFAULT_SYMBOL_PATH).trim() || DEFAULT_SYMBOL_PATH;
        const kospi = await fetchKospiFromYahoo(symPath);
        rows = mergeKospiRow(rows, kospi);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn("[oneai-sources] Yahoo KOSPI 비활성, 더미 유지:", msg);
      }
    }

    return rows;
  }
};

const newsProvider = {
  async getNews() {
    const fallback = await dummy.newsProvider.getNews();
    if (!finnhubNewsEnabled() || !finnhubEnabled()) {
      return fallback;
    }
    try {
      const token = String(process.env.FINNHUB_API_KEY).trim();
      const items = await fetchGeneralNews(token);
      return items.length > 0 ? items : fallback;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("[oneai-sources] Finnhub 뉴스, 더미 유지:", msg);
      return fallback;
    }
  }
};

module.exports = {
  marketProvider,
  signalProvider: dummy.signalProvider,
  newsProvider
};
