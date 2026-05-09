const strategySamples = [
  {
    id: "st-kr-001",
    name: "국내주식 거래량 돌파",
    market: "kr_stock",
    winRate: 57.2,
    avgWin: 3.4,
    avgLoss: 1.9,
    maxDrawdown: 8.1,
    trades: 164
  },
  {
    id: "st-us-001",
    name: "미국주식 뉴스 모멘텀",
    market: "us_stock",
    winRate: 54.6,
    avgWin: 4.1,
    avgLoss: 2.3,
    maxDrawdown: 10.4,
    trades: 121
  },
  {
    id: "st-cr-001",
    name: "코인 선물 추세 추종",
    market: "crypto_futures",
    winRate: 49.9,
    avgWin: 5.8,
    avgLoss: 2.5,
    maxDrawdown: 12.7,
    trades: 243
  }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scoreStrategy(row) {
  const p = row.winRate / 100;
  const rr = row.avgWin / row.avgLoss;
  const expectancy = p * row.avgWin - (1 - p) * row.avgLoss;

  const winRateScore = clamp(row.winRate, 0, 100);
  const rrScore = clamp(rr * 30, 0, 100);
  const mddScore = clamp(100 - row.maxDrawdown * 5, 0, 100);
  const expectancyScore = clamp(expectancy * 18, 0, 100);
  const sampleScore = clamp((row.trades / 300) * 100, 0, 100);

  const totalScore =
    winRateScore * 0.3 + rrScore * 0.25 + mddScore * 0.2 + expectancyScore * 0.2 + sampleScore * 0.05;

  return {
    ...row,
    rr: Number(rr.toFixed(2)),
    expectancy: Number(expectancy.toFixed(3)),
    score: Number(totalScore.toFixed(2))
  };
}

async function getStrategyScores() {
  return strategySamples.map(scoreStrategy).sort((a, b) => b.score - a.score);
}

module.exports = { getStrategyScores };
