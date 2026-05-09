const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const filePath = path.join(dataDir, "strategy-action-history.json");

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]), "utf8");
  }
}

function readHistory() {
  ensureStore();
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(history) {
  ensureStore();
  fs.writeFileSync(filePath, JSON.stringify(history, null, 2), "utf8");
}

function addHistoryRow(row) {
  const history = readHistory();
  history.unshift(row);
  writeHistory(history.slice(0, 1000));
}

module.exports = { readHistory, addHistoryRow };
