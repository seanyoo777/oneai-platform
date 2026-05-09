import { Card } from "@/components/card";

const scanners = [
  "거래량 폭증 검색기",
  "돌파 검색기",
  "RSI 검색기",
  "기관/외국인 수급 검색기",
  "뉴스 급등 검색기",
  "테마 검색기",
  "세력 흔적 탐지"
];

const sampleResults = [
  {
    symbol: "000660",
    name: "SK하이닉스",
    signal: "거래량 폭증 / 돌파 / 뉴스 모멘텀",
    entryGuide: "전고점 재돌파 확인 시 참고",
    exitGuide: "손절 -2.5%, 분할 청산 +4%/+7%"
  },
  {
    symbol: "005930",
    name: "삼성전자",
    signal: "수급 강세 / 거래량 폭증",
    entryGuide: "장중 눌림 이후 재상승 시 참고",
    exitGuide: "손절 -2.0%, 목표 +3.5%"
  }
];

export default function ScanPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OneAI Scan</h1>
      <Card title="종목 발굴 검색기">
        <ul className="grid gap-2 md:grid-cols-2">
          {scanners.map((scanner) => (
            <li key={scanner} className="rounded-md bg-slate-900 p-3 text-sm">
              {scanner}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="MVP 검색 결과 예시" description="실시간 데이터 연동 전 더미 계산 결과">
        <div className="space-y-2">
          {sampleResults.map((item) => (
            <div key={item.symbol} className="rounded-md bg-slate-900 p-3 text-sm">
              <p className="font-medium">
                {item.name} ({item.symbol})
              </p>
              <p className="text-slate-300">신호: {item.signal}</p>
              <p className="text-slate-400">참고 진입: {item.entryGuide}</p>
              <p className="text-slate-400">참고 청산: {item.exitGuide}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
