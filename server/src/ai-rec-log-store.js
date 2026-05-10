const { useDatabase } = require("./db-env");

const fileStore = require("./ai-rec-log-file");

function db() {
  return require("./ai-rec-log-prisma");
}

/**
 * AI/시그널 등 추천성 응답이 사용자에게 나갈 때 감사·분석용으로 남깁니다. (응답 본문 전체가 아닌 요약)
 */
async function appendAiRecLog(entry) {
  if (useDatabase()) return db().append(entry);
  return fileStore.append(entry);
}

async function readAiRecLogs(limit) {
  const n = Math.min(500, Math.max(1, Number(limit) || 100));
  if (useDatabase()) return db().readRecent(n);
  return fileStore.readRecent(n);
}

module.exports = { appendAiRecLog, readAiRecLogs };
