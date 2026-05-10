import type { Metadata } from "next";
import { Card } from "@/components/card";
import { IntegrationStrip } from "@/components/integration-strip";
import { LiveSystemExchanges } from "@/components/live-system-exchanges";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "시스템 트레이딩",
  description: "자동매매·거래소 커넥터 로드맵 — 실거래 연동 준비형."
};

const capabilities = [
  "거래소별 API Key 연결 관리",
  "전략별 자동 실행 ON/OFF",
  "레퍼럴 + 멤버십 기간 기반 사용 권한",
  "위험관리 중심 주문 제한(최대 포지션/손절 필수)",
  "실행 이력/오류 로그/재시도 큐"
];

export default function SystemTradingPage() {
  return (
    <>
      <IntegrationStrip className="mb-section" heading="Trading · live feeds" />
      <div className="space-y-6">
        <PageHero
          eyebrow="Trading"
          title="시스템 트레이딩"
          description={
            <>
              거래소 커넥터는{" "}
              <code className="rounded-md bg-slate-900/80 px-1.5 py-0.5 font-mono text-xs text-emerald-300/95 ring-1 ring-slate-700">
                GET /api/system-trading/exchanges
              </code>{" "}
              기준 · 아래 카드에 서버·샘플 출처가 표시됩니다.
            </>
          }
        />
        <Card title="1차 개발 범위" description="실거래 연동 준비형 자동매매 운영 콘솔">
          <ul className="space-y-2 text-sm text-slate-300">
            {capabilities.map((item) => (
              <li key={item} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 shadow-inner shadow-black/15">
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <LiveSystemExchanges title="지원 거래소" description="공용 커넥터 인터페이스 (`GET /api/system-trading/exchanges`)" />
      </div>
    </>
  );
}
