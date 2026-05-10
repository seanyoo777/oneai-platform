const { useDatabase } = require("./db-env");
const fileStore = require("./action-history-file");

function db() {
  return require("./action-history-prisma");
}

async function addHistoryRow(row) {
  if (useDatabase()) return db().addHistoryRow(row);
  return fileStore.addHistoryRow(row);
}

async function readHistory() {
  if (useDatabase()) return db().readHistory();
  return fileStore.readHistory();
}

module.exports = { readHistory, addHistoryRow };
