const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "watchlists.json");

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
}

function readMap() {
  ensureStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map) {
  ensureStore();
  fs.writeFileSync(filePath, JSON.stringify(map, null, 2), "utf8");
}

function getWatchlist(userId) {
  const map = readMap();
  const rows = map[userId];
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    id: r.id || `${r.symbol}:${r.market}`,
    symbol: r.symbol,
    market: r.market,
    note: r.note ?? null,
    addedAt: r.addedAt || new Date().toISOString()
  }));
}

function setWatchlist(userId, items) {
  const map = readMap();
  const now = new Date().toISOString();
  map[userId] = items.map((it) => ({
    id: crypto.randomUUID(),
    symbol: it.symbol,
    market: it.market,
    note: it.note ?? null,
    addedAt: now
  }));
  writeMap(map);
}

module.exports = { getWatchlist, setWatchlist };
