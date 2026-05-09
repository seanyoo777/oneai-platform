import { Card } from "@/components/card";

const features = [
  "Bitget API 연동 레이어",
  "레퍼럴 + 멤버십 자동 실행 게이트",
  "전략 자동 실행 상태 모니터링",
  "위험관리 중심 주문 제한"
];

const chartProfiles = [
  "VIP Momentum (EMA + RSI + Volume)",
  "Macro Risk (DXY + Gold + Oil Overlay)",
  "Scalping Pro (VWAP + ATR Bands)"
];

export default function ExchangePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">OneAI Exchange</h1>
      <Card title="올인원 시스템 트레이딩 허브" description="거래소 연동 준비 + 자동 실행 구조">
        <ul className="space-y-2 text-sm text-slate-300">
          {features.map((item) => (
            <li key={item} className="rounded-md bg-slate-900 p-3">
              {item}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="TradingView 고급 차트 프리셋" description="전략별 차트 템플릿 (권한 기반 제공)">
        <ul className="space-y-2 text-sm text-slate-300">
          {chartProfiles.map((profile) => (
            <li key={profile} className="rounded-md bg-slate-900 p-3">
              {profile}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
