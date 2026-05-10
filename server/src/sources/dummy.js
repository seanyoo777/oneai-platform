/** 로컬·오프라인용 고정 요약 — 외부 연동 실패 시에도 동일 형태 유지 */
const marketProvider = {
  async getSummary() {
    return [
      { name: "KOSPI", value: 2745.12, change: 0.92 },
      { name: "NASDAQ", value: 18344.22, change: 1.14 },
      { name: "BTC", value: 66420, change: 2.1 },
      { name: "ETH", value: 3320, change: 1.05 }
    ];
  }
};

const signalProvider = {
  async getSignals() {
    return [
      {
        symbol: "BTCUSDT",
        direction: "LONG",
        strategyName: "추세 돌파 전략",
        confidenceScore: 83,
        note: "AI 분석 기반 참고용 시그널"
      }
    ];
  }
};

const newsProvider = {
  async getNews() {
    return [
      {
        id: "demo-1",
        category: "경제뉴스",
        title: "미국 CPI 발표 대기",
        summary: "단기 변동성 확대 가능성. 위험관리 중심 대응 필요."
      }
    ];
  }
};

module.exports = { marketProvider, signalProvider, newsProvider };
