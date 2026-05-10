const { useDatabase } = require("./db-env");

const fileStore = require("./watchlist-file");

function db() {
  return require("./watchlist-prisma");
}

const MAX_ITEMS = Number(process.env.ONEAI_WATCHLIST_MAX || 100);

function normalizeWatchlistItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    throw new Error("items는 배열이어야 합니다.");
  }
  if (rawItems.length > MAX_ITEMS) {
    throw new Error(`관심종목은 최대 ${MAX_ITEMS}개까지 저장할 수 있습니다.`);
  }

  const out = [];
  const keys = new Set();

  for (let i = 0; i < rawItems.length; i++) {
    const raw = rawItems[i];
    if (!raw || typeof raw !== "object") {
      throw new Error(`items[${i}] 형식이 올바르지 않습니다.`);
    }
    const symbol = String(raw.symbol ?? "")
      .trim()
      .toUpperCase();
    const market = String(raw.market ?? "")
      .trim()
      .toLowerCase();
    if (!symbol || !market) {
      throw new Error(`items[${i}]: symbol과 market은 필수입니다.`);
    }
    if (symbol.length > 32 || market.length > 32) {
      throw new Error(`items[${i}]: symbol 또는 market 길이가 너무 깁니다.`);
    }
    const key = `${symbol}|${market}`;
    if (keys.has(key)) continue;
    keys.add(key);
    let note = null;
    if (raw.note != null && String(raw.note).trim() !== "") {
      note = String(raw.note).trim().slice(0, 500);
    }
    out.push({ symbol, market, note });
  }

  return out;
}

async function getWatchlist(userId) {
  if (useDatabase()) return db().getWatchlist(userId);
  return fileStore.getWatchlist(userId);
}

async function setWatchlist(userId, items) {
  if (useDatabase()) return db().setWatchlist(userId, items);
  return fileStore.setWatchlist(userId, items);
}

module.exports = {
  getWatchlist,
  setWatchlist,
  normalizeWatchlistItems,
  MAX_ITEMS
};
