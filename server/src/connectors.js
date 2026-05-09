function makeExchangeConnector(name) {
  return {
    async getStatus() {
      return {
        provider: name,
        ready: false,
        mode: "mvp_dummy",
        note: "API 키 연결 전. 추후 실거래/모의거래 공용 인터페이스로 확장."
      };
    }
  };
}

const exchangeConnectors = {
  binance: makeExchangeConnector("binance"),
  bybit: makeExchangeConnector("bybit"),
  bitget: makeExchangeConnector("bitget"),
  okx: makeExchangeConnector("okx")
};

const globalDataConnector = {
  async getCoverage() {
    return {
      us: { equities: "planned_full_universe", providers: ["Polygon", "Finnhub", "AlphaVantage"] },
      kr: { equities: "planned_full_universe", providers: ["KIS", "Kiwoom", "Hana"] },
      macro: { enabled: true, providers: ["EconomicCalendar", "NewsAPI"] }
    };
  }
};

module.exports = { exchangeConnectors, globalDataConnector };
