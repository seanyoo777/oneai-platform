"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import { LivePageSubtitle } from "@/components/live-page-subtitle";
import { PageHero } from "@/components/page-hero";
import { strategies as dummyStrategies } from "@/lib/dummy-data";
import { oneaiFetch } from "@/lib/oneai-api";

type ScoreRow = Record<string, unknown>;

export function ResearchPageLive() {
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [policyBlock, setPolicyBlock] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [scRes, polRes] = await Promise.all([
        oneaiFetch<{ ok?: boolean; scores?: ScoreRow[] }>("/api/research/strategy-scores"),
        oneaiFetch<{ ok?: boolean; evaluatedAt?: string; results?: unknown[]; policyConfig?: unknown }>(
          "/api/research/strategy-policy"
        )
      ]);

      if (scRes.res.ok && scRes.json?.ok && Array.isArray(scRes.json.scores)) {
        setScores(scRes.json.scores);
      } else {
        const fallback = dummyStrategies.map((strategy) => {
          const win = strategy.winRate;
          const mddPenalty = Math.max(0, 100 - Math.abs(strategy.maxDrawdown) * 5);
          const returnScore = Math.max(0, Math.min(100, strategy.avgReturn * 20));
          const total = win * 0.5 + mddPenalty * 0.3 + returnScore * 0.2;
          return {
            id: strategy.id,
            name: strategy.name,
            winRate: strategy.winRate,
            maxDrawdown: strategy.maxDrawdown,
            trades: 80,
            score: Number(total.toFixed(2))
          };
        });
        setScores(fallback.sort((a, b) => Number(b.score) - Number(a.score)));
      }

      if (polRes.res.ok && polRes.json?.ok) {
        setPolicyBlock(polRes.json as Record<string, unknown>);
      }

      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Research" title="OneAI Research" description="전략 성과 지표와 정책 스냅샷을 참고합니다.">
        <LivePageSubtitle
          loading={loading}
          readyLabel="전략 점수·정책 판정 — API 우선 (실패 시 더미 계산)"
        />
      </PageHero>

      <Card title="전략 연구소" description="서버 산출 점수·리스크 지표 (참고용)">
        <div className="space-y-2">
          {scores.map((row) => (
            <div key={String(row.id ?? row.name)} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 text-sm shadow-inner shadow-black/15">
              <p className="font-medium">{String(row.name ?? "")}</p>
              <p className="text-slate-300">
                승률 {typeof row.winRate === "number" ? row.winRate : "—"}% · 최대낙폭{" "}
                {typeof row.maxDrawdown === "number" ? row.maxDrawdown : "—"}% · 표본{" "}
                {typeof row.trades === "number" ? row.trades : "—"}
              </p>
              <p className="text-blue-300">통합 점수: {typeof row.score === "number" ? row.score : "—"}</p>
            </div>
          ))}
        </div>
      </Card>

      {policyBlock && Array.isArray(policyBlock.results) && policyBlock.results.length > 0 ? (
        <Card title="정책 자동 판정 스냅샷" description={`평가 시각: ${String(policyBlock.evaluatedAt ?? "—")}`}>
          <ul className="space-y-2 text-sm text-slate-300">
            {(policyBlock.results as Record<string, unknown>[]).map((r, i) => (
              <li key={String(r.id ?? i)} className="rounded-lg border border-slate-700/40 bg-slate-900/70 p-2.5 text-sm shadow-inner shadow-black/15">
                <span className="font-medium text-white">{String(r.name ?? r.id ?? "")}</span>
                {" · "}
                <span className="text-slate-400">{String(r.action ?? "")}</span>
                {Array.isArray(r.reasons) && (r.reasons as string[]).length ? (
                  <span className="text-slate-500"> — {(r.reasons as string[]).join(", ")}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card title="평가 원칙" description="승률 단독이 아닌 위험조정 성과 기반">
        <p className="text-sm text-slate-300">
          승률, 손익비, 최대낙폭, 기대값, 표본 수를 반영합니다. 투자 참고용 정보이며 수익을 보장하지 않습니다.
        </p>
      </Card>
    </div>
  );
}
