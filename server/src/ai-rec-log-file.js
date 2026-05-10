const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "ai-recommendation-logs.json");
const MAX_ROWS = 5000;

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readAll() {
  ensureDir();
  if (!fs.existsSync(filePath)) return [];
  try {
    const p = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function writeAll(rows) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(rows.slice(0, MAX_ROWS), null, 2), "utf8");
}

/**
 * @param {{ channel: string, kind: string, summary?: object | null, modelVersion?: string | null }} entry
 */
function append(entry) {
  const row = {
    id: crypto.randomUUID(),
    channel: String(entry.channel),
    kind: String(entry.kind),
    summary: entry.summary && typeof entry.summary === "object" ? entry.summary : null,
    modelVersion: entry.modelVersion != null ? String(entry.modelVersion) : null,
    createdAt: new Date().toISOString()
  };
  const rows = readAll();
  rows.unshift(row);
  writeAll(rows);
  return row;
}

function readRecent(limit) {
  return readAll().slice(0, limit);
}

module.exports = { append, readRecent };
