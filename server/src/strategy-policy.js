const { getStrategyScores } = require("./strategy-score");
const { readHistory, addHistoryRow } = require("./action-history-store");

const policyConfig = {
  minScore: 45,
  maxDrawdownLimit: 15,
  minTrades: 80
};
function evaluateOne(strategy) {
  const reasons = [];
  if (strategy.score < policyConfig.minScore) reasons.push("통합 점수 미달");
  if (strategy.maxDrawdown > policyConfig.maxDrawdownLimit) reasons.push("최대낙폭 한도 초과");
  if (strategy.trades < policyConfig.minTrades) reasons.push("표본 수 부족");

  return {
    id: strategy.id,
    name: strategy.name,
    score: strategy.score,
    maxDrawdown: strategy.maxDrawdown,
    trades: strategy.trades,
    action: reasons.length ? "disable_pending_admin_review" : "keep_active",
    reasons
  };
}

async function evaluatePolicy() {
  const scores = await getStrategyScores();
  return {
    policyConfig,
    evaluatedAt: new Date().toISOString(),
    results: scores.map(evaluateOne)
  };
}

async function adminStrategyAction({ strategyId, action, note, actor }) {
  const row = {
    ok: true,
    strategyId,
    action,
    note: note || "",
    actor: actor || "admin",
    processedAt: new Date().toISOString()
  };
  await addHistoryRow(row);
  return row;
}

async function getActionHistory() {
  const rows = await readHistory();
  return rows.slice(0, 100);
}

module.exports = { evaluatePolicy, adminStrategyAction, getActionHistory };
