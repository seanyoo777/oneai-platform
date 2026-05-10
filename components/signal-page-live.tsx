"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import { LivePageSubtitle } from "@/components/live-page-subtitle";
import { PageHero } from "@/components/page-hero";
import { signals as dummySignals } from "@/lib/dummy-data";
import { oneaiFetch } from "@/lib/oneai-api";

type SignalRow = {
  id: string;
  symbol: string;
  direction: string;
  entryPrice?: number;
  stopLoss?: number;
  targetPrice?: number;
  strategyName: string;
  confidenceScore: number;
  detail: string;
};

function mapApiSignal(sig: Record<string, unknown>, i: number): SignalRow {
  return {
    id: typeof sig.id === "string" ? sig.id : `sig-${i}`,
    symbol: String(sig.symbol ?? ""),
    direction: String(sig.direction ?? "—"),
    entryPrice: typeof sig.entryPrice === "number" ? sig.entryPrice : undefined,
    stopLoss: typeof sig.stopLoss === "number" ? sig.stopLoss : undefined,
    targetPrice: typeof sig.targetPrice === "number" ? sig.targetPrice : undefined,
    strategyName: String(sig.strategyName ?? ""),
    confidenceScore: typeof sig.confidenceScore === "number" ? sig.confidenceScore : 0,
    detail: String(sig.reason ?? sig.note ?? "")
  };
}

export function SignalPageLive() {
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { res, json } = await oneaiFetch<{ ok?: boolean; signals?: Record<string, unknown>[] }>("/api/signals");
      if (res.ok && json?.ok && Array.isArray(json.signals) && json.signals.length > 0) {
        setSignals(json.signals.map(mapApiSignal));
      } else {
        setSignals(
          dummySignals.map((s) => ({
            id: s.id,
            symbol: s.symbol,
            direction: s.direction,
            entryPrice: s.entryPrice,
            stopLoss: s.stopLoss,
            targetPrice: s.targetPrice,
            strategyName: s.strategyName,
            confidenceScore: s.confidenceScore,
            detail: s.reason
          }))
        );
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Signal" title="OneAI Signal" description="참고용 시그널·전략 정보를 확인합니다.">
        <LivePageSubtitle loading={loading} readyLabel="투자 참고용 시그널 — API 우선, 실패 시 더미" />
      </PageHero>
      <Card title="실시간 시그널">
        <div className="space-y-2">
          {signals.map((signal) => (
            <div key={signal.id} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 text-sm shadow-inner shadow-black/15">
              <p className="font-medium">{signal.symbol}</p>
              <p className="text-slate-300">
                방향: {signal.direction}
                {signal.entryPrice !== undefined ? ` / 진입가: ${signal.entryPrice}` : ""}
                {signal.stopLoss !== undefined ? ` / 손절가: ${signal.stopLoss}` : ""}
                {signal.targetPrice !== undefined ? ` / 목표가: ${signal.targetPrice}` : ""}
                {signal.strategyName ? ` · ${signal.strategyName}` : ""}
                {typeof signal.confidenceScore === "number" && signal.confidenceScore > 0
                  ? ` · 강도 ${signal.confidenceScore}`
                  : ""}
              </p>
              {signal.detail ? <p className="text-slate-400">{signal.detail}</p> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
