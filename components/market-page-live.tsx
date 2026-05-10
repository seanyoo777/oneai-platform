"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import { LivePageSubtitle } from "@/components/live-page-subtitle";
import { PageHero } from "@/components/page-hero";
import { marketSummary as dummyMarket } from "@/lib/dummy-data";
import { fmtLiveChange, fmtLiveValue, type SummaryRow } from "@/lib/live-formatters";
import { oneaiFetch } from "@/lib/oneai-api";

export function MarketPageLive() {
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { res, json } = await oneaiFetch<{ ok?: boolean; summary?: SummaryRow[] }>("/api/market/summary");
      if (res.ok && json?.ok && Array.isArray(json.summary) && json.summary.length > 0) {
        setRows(json.summary);
      } else {
        setRows(dummyMarket.map((x) => ({ name: x.name, value: x.value, change: x.change })));
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Market" title="OneAI Market" description="국내·해외 시장 지표 요약">
        <LivePageSubtitle loading={loading} readyLabel="시장 지표 — API 우선, 실패 시 더미" />
      </PageHero>
      <Card title="시장 지표">
        <div className="grid gap-2 md:grid-cols-2">
          {rows.map((item) => (
            <div key={item.name} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 text-sm shadow-inner shadow-black/15">
              <p className="text-slate-400">{item.name}</p>
              <p className="font-semibold">{fmtLiveValue(item.value)}</p>
              <p
                className={
                  typeof item.change === "number"
                    ? item.change < 0
                      ? "text-red-400"
                      : "text-emerald-400"
                    : "text-blue-400"
                }
              >
                {fmtLiveChange(item.change)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
