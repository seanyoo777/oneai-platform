"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import { LivePageSubtitle } from "@/components/live-page-subtitle";
import { PageHero } from "@/components/page-hero";
import { oneaiFetch } from "@/lib/oneai-api";

const FALLBACK = [
  "미국 주식: 전체 종목 시세/재무/뉴스 메타",
  "한국 주식: 전체 종목 시세/수급/공시 메타",
  "글로벌 지수/원자재/환율/암호화폐 지표",
  "경제지표 캘린더 + 이벤트 리스크 맵"
];

export function GlobalDataPageLive() {
  const [coverage, setCoverage] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { res, json } = await oneaiFetch<Record<string, unknown>>("/api/global-data/coverage");
      if (res.ok && json && json.ok === true && typeof json === "object") {
        const { ok: _ok, ...rest } = json;
        setCoverage(rest as Record<string, unknown>);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Data" title="Global Data" description="글로벌 데이터 커버리지와 메타 정보입니다.">
        <LivePageSubtitle loading={loading} readyLabel="커버리지 메타 — API 우선" />
      </PageHero>

      {coverage ? (
        <Card title="데이터 커버리지 (서버 메타)" description="프로바이더·범위는 로드맵 기준">
          <div className="space-y-3 text-sm text-slate-300">
            {Object.entries(coverage).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 shadow-inner shadow-black/15">
                <p className="font-medium text-white">{k}</p>
                <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-xs text-slate-400">
                  {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}
                </pre>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card title="글로벌 데이터 확장 로드맵" description="API 없을 때 안내">
          <ul className="space-y-2 text-sm text-slate-300">
            {FALLBACK.map((data) => (
              <li key={data} className="rounded-lg border border-slate-700/40 bg-slate-900/70 p-3 shadow-inner shadow-black/15">
                {data}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
