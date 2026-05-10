const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "audit-logs.json");

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf8");
}

function readAuditLogs() {
  ensureStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function appendAuditLog(event) {
  const logs = readAuditLogs();
  logs.unshift({ ...event, timestamp: new Date().toISOString() });
  fs.writeFileSync(filePath, JSON.stringify(logs.slice(0, 5000), null, 2), "utf8");
}

module.exports = { readAuditLogs, appendAuditLog };
