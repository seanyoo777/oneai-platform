const { useDatabase } = require("./db-env");
const fileStore = require("./audit-log-file");

function db() {
  return require("./audit-log-prisma");
}

async function appendAuditLog(event) {
  if (useDatabase()) return db().appendAuditLog(event);
  return fileStore.appendAuditLog(event);
}

async function readAuditLogs() {
  if (useDatabase()) return db().readAuditLogs();
  return fileStore.readAuditLogs();
}

module.exports = { appendAuditLog, readAuditLogs };
