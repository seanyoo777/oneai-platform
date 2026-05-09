function calcRsi(closes, period = 14) {
  if (!Array.isArray(closes) || closes.length < period + 1) {
    return null;
  }
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i += 1) {
    const delta = closes[i] - closes[i - 1];
    if (delta >= 0) gains += delta;
    else losses += Math.abs(delta);
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

function evaluateScan(stock) {
  const avg20Volume = stock.avg20Volume || 1;
  const volumeMultiple = stock.volume / avg20Volume;
  const rsi14 = calcRsi(stock.closeSeries, 14);
  const breakout = stock.price > stock.high20;
  const supplyStrong = stock.instNetBuy > 0 && stock.foreignNetBuy > 0;
  const newsHot = stock.newsScore >= 75;
  const themeHot = stock.themeScore >= 70;
  const unusualFlow = volumeMultiple >= 2.5 && stock.turnoverRate >= 8;

  return {
    symbol: stock.symbol,
    name: stock.name,
    price: stock.price,
    changeRate: stock.changeRate,
    volume: stock.volume,
    volumeMultiple: Number(volumeMultiple.toFixed(2)),
    rsi14: rsi14 ? Number(rsi14.toFixed(2)) : null,
    tags: [
      volumeMultiple >= 2 ? "거래량 폭증" : null,
      breakout ? "돌파" : null,
      rsi14 !== null && rsi14 <= 35 ? "RSI 저점" : null,
      supplyStrong ? "수급 강세" : null,
      newsHot ? "뉴스 모멘텀" : null,
      themeHot ? "테마 강세" : null,
      unusualFlow ? "세력 흔적 의심" : null
    ].filter(Boolean)
  };
}

const stockUniverse = [
  {
    symbol: "005930",
    name: "삼성전자",
    price: 81300,
    changeRate: 2.1,
    volume: 21800000,
    avg20Volume: 11200000,
    high20: 80800,
    instNetBuy: 32000000000,
    foreignNetBuy: 54000000000,
    turnoverRate: 4.2,
    newsScore: 79,
    themeScore: 66,
    closeSeries: [77000, 77200, 76800, 77500, 78000, 78500, 79000, 78800, 79200, 79600, 79800, 80100, 79900, 80400, 80700]
  },
  {
    symbol: "000660",
    name: "SK하이닉스",
    price: 198500,
    changeRate: 3.4,
    volume: 6100000,
    avg20Volume: 2400000,
    high20: 196000,
    instNetBuy: 41000000000,
    foreignNetBuy: 46000000000,
    turnoverRate: 8.6,
    newsScore: 83,
    themeScore: 81,
    closeSeries: [182000, 183500, 184000, 185200, 186100, 187000, 188300, 189500, 190600, 191000, 192400, 193800, 194500, 196100, 198500]
  },
  {
    symbol: "035420",
    name: "NAVER",
    price: 206000,
    changeRate: -0.8,
    volume: 910000,
    avg20Volume: 1040000,
    high20: 214000,
    instNetBuy: -6000000000,
    foreignNetBuy: 2000000000,
    turnoverRate: 1.8,
    newsScore: 62,
    themeScore: 58,
    closeSeries: [214000, 212000, 211000, 210500, 209000, 208500, 207600, 206900, 207200, 206800, 206500, 206700, 206100, 205800, 206000]
  }
];

async function getScanOverview() {
  return {
    universeCount: stockUniverse.length,
    fields: [
      "symbol",
      "price",
      "changeRate",
      "volume",
      "avg20Volume",
      "high20",
      "instNetBuy",
      "foreignNetBuy",
      "newsScore",
      "themeScore"
    ],
    scanners: [
      "volume_surge",
      "breakout",
      "rsi_reversal",
      "flow_strength",
      "news_momentum",
      "theme_strength",
      "unusual_flow"
    ]
  };
}

async function runStockScan(type = "all") {
  const scanned = stockUniverse.map(evaluateScan);
  if (type === "all") return scanned;

  const matcher = {
    volume_surge: (x) => x.tags.includes("거래량 폭증"),
    breakout: (x) => x.tags.includes("돌파"),
    rsi_reversal: (x) => x.tags.includes("RSI 저점"),
    flow_strength: (x) => x.tags.includes("수급 강세"),
    news_momentum: (x) => x.tags.includes("뉴스 모멘텀"),
    theme_strength: (x) => x.tags.includes("테마 강세"),
    unusual_flow: (x) => x.tags.includes("세력 흔적 의심")
  }[type];

  if (!matcher) return scanned;
  return scanned.filter(matcher);
}

module.exports = { getScanOverview, runStockScan };
