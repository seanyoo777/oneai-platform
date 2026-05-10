import type { Metadata } from "next";
import { Card } from "@/components/card";
import { IntegrationStrip } from "@/components/integration-strip";
import { LiveSystemExchanges } from "@/components/live-system-exchanges";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Exchange",
  description: "시스템 트레이딩 허브·거래소 커넥터 상태."
};

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
    <>
      <IntegrationStrip className="mb-section" heading="Exchange · live feeds" />
      <div className="space-y-6">
        <PageHero
          eyebrow="Exchange"
          title="OneAI Exchange"
          description="허브 안내와 거래소 커넥터 상태 — 아래 카드에서 서버 응답 여부를 확인할 수 있습니다."
        />
        <Card title="올인원 시스템 트레이딩 허브" description="거래소 연동 준비 + 자동 실행 구조">
          <ul className="space-y-2 text-sm text-slate-300">
            {features.map((item) => (
              <li key={item} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 shadow-inner shadow-black/15">
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <LiveSystemExchanges title="거래소 커넥터 상태" description="동일 엔드포인트 재사용" />
        <Card title="TradingView 고급 차트 프리셋" description="전략별 차트 템플릿 (권한 기반 제공)">
          <ul className="space-y-2 text-sm text-slate-300">
            {chartProfiles.map((profile) => (
              <li key={profile} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 shadow-inner shadow-black/15">
                {profile}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
