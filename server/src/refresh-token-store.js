const { useDatabase } = require("./db-env");
const fileStore = require("./refresh-token-file");

function db() {
  return require("./refresh-token-prisma");
}

async function issueRefreshToken(userId) {
  if (useDatabase()) return db().issueRefreshToken(userId);
  return fileStore.issueRefreshToken(userId);
}

async function consumeRefreshToken(token) {
  if (useDatabase()) return db().consumeRefreshToken(token);
  return fileStore.consumeRefreshToken(token);
}

async function revokeRefreshToken(token) {
  if (useDatabase()) return db().revokeRefreshToken(token);
  return fileStore.revokeRefreshToken(token);
}

module.exports = { issueRefreshToken, consumeRefreshToken, revokeRefreshToken };
