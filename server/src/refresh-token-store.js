const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "refresh-tokens.json");
const REFRESH_EXPIRES_DAYS = Number(process.env.ONEAI_REFRESH_EXPIRES_DAYS || 14);

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf8");
}

function readRows() {
  ensureStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRows(rows) {
  ensureStore();
  fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), "utf8");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function issueRefreshToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const rows = readRows().filter((x) => x.userId !== userId && new Date(x.expiresAt).getTime() > Date.now());
  rows.unshift({ tokenHash, userId, expiresAt, createdAt: new Date().toISOString() });
  writeRows(rows.slice(0, 5000));
  return token;
}

function consumeRefreshToken(token) {
  const tokenHash = hashToken(token);
  const rows = readRows();
  const row = rows.find((x) => x.tokenHash === tokenHash);
  if (!row) return null;
  if (new Date(row.expiresAt).getTime() <= Date.now()) {
    writeRows(rows.filter((x) => x.tokenHash !== tokenHash));
    return null;
  }
  writeRows(rows.filter((x) => x.tokenHash !== tokenHash));
  return row.userId;
}

function revokeRefreshToken(token) {
  const tokenHash = hashToken(token);
  writeRows(readRows().filter((x) => x.tokenHash !== tokenHash));
}

module.exports = { issueRefreshToken, consumeRefreshToken, revokeRefreshToken };
