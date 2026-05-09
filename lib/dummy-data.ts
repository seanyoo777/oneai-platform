import type { NewsItem, Signal, Strategy, User } from "@/types";

export const marketSummary = [
  { name: "KOSPI", value: "2,745.12", change: "+0.92%" },
  { name: "NASDAQ", value: "18,344.22", change: "+1.14%" },
  { name: "BTC", value: "$66,420", change: "+2.10%" },
  { name: "ETH", value: "$3,160", change: "+1.63%" },
  { name: "Fear & Greed", value: "68", change: "Greed" }
];

export const signals: Signal[] = [
  {
    id: "s1",
    marketType: "crypto",
    symbol: "BTCUSDT",
    direction: "LONG",
    entryPrice: 66200,
    stopLoss: 65100,
    targetPrice: 68400,
    strategyName: "추세 돌파 전략",
    confidenceScore: 83,
    reason: "EMA 정배열과 거래량 증가 확인. 투자 참고용 시그널입니다.",
    createdAt: "2026-05-09T12:02:00Z"
  },
  {
    id: "s2",
    marketType: "us_stock",
    symbol: "NVDA",
    direction: "buy",
    entryPrice: 936,
    stopLoss: 905,
    targetPrice: 978,
    strategyName: "뉴스 모멘텀 전략",
    confidenceScore: 79,
    reason: "AI 반도체 섹터 수급 확대. 위험관리 중심 접근 권장.",
    createdAt: "2026-05-09T12:12:00Z"
  }
];

export const news: NewsItem[] = [
  {
    id: "n1",
    category: "경제뉴스",
    title: "미국 CPI 발표 앞두고 증시 변동성 확대",
    summary: "AI 분석 기반으로 이벤트 리스크 확대 구간으로 분류됩니다.",
    source: "MarketWire",
    importance: "high",
    sentiment: "neutral",
    relatedSymbols: ["SPX", "NDX"],
    createdAt: "2026-05-09T08:30:00Z"
  },
  {
    id: "n2",
    category: "코인뉴스",
    title: "비트코인 ETF 순유입 증가",
    summary: "단기 수급은 우호적이나 가격 변동성 주의가 필요합니다.",
    source: "CryptoDaily",
    importance: "medium",
    sentiment: "positive",
    relatedSymbols: ["BTCUSDT"],
    createdAt: "2026-05-09T10:20:00Z"
  }
];

export const strategies: Strategy[] = [
  {
    id: "st1",
    name: "추세 돌파 전략",
    marketType: "코인 선물",
    description: "EMA 정배열 + 거래량 증가 + 고점 돌파 조건",
    winRate: 58.4,
    avgReturn: 2.6,
    maxDrawdown: -7.8,
    riskLevel: "medium",
    isActive: true
  },
  {
    id: "st2",
    name: "RSI 과매도 반등 전략",
    marketType: "코인 선물",
    description: "RSI 30 이하 + 반등 캔들 확인",
    winRate: 55.2,
    avgReturn: 2.1,
    maxDrawdown: -6.9,
    riskLevel: "high",
    isActive: true
  }
];

export const users: User[] = [
  {
    id: "u1",
    email: "demo@oneai.kr",
    nickname: "OneAIDemo",
    referralCode: "ONEAI1001",
    role: "vip_member",
    membershipType: "vip",
    membershipExpiresAt: "2026-12-31",
    createdAt: "2026-04-10"
  }
];
