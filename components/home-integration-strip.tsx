"use client";

import { useEffect, useState } from "react";
import { oneaiFetch } from "@/lib/oneai-api";

type IntegrationFlags = {
  coingecko?: boolean;
  finnhubQuote?: boolean;
  finnhubNews?: boolean;
  yahooKospi?: boolean;
};

const ROWS: { key: keyof IntegrationFlags; label: string }[] = [
  { key: "coingecko", label: "Crypto" },
  { key: "yahooKospi", label: "KOSPI" },
  { key: "finnhubQuote", label: "US" },
  { key: "finnhubNews", label: "News" }
];

export function HomeIntegrationStrip() {
  const [flags, setFlags] = useState<IntegrationFlags | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const { res, json } = await oneaiFetch<Record<string, unknown>>("/api/platform/meta");
        if (!res.ok) {
          setError(true);
          return;
        }
        const integ = json.integrations;
        if (integ && typeof integ === "object" && !Array.isArray(integ)) {
          setFlags(integ as IntegrationFlags);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    })();
  }, []);

  return (
    <section
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
      aria-label="외부 데이터 연결 상태"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">Live feeds</p>
        {error ? (
          <p className="text-xs text-slate-500">메타를 불러오지 못했습니다. API 주소를 확인해 주세요.</p>
        ) : flags == null ? (
          <p className="text-xs text-slate-500" role="status">
            확인 중…
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {ROWS.map(({ key, label }) => {
              const on = Boolean(flags[key]);
              return (
                <li key={key}>
                  <span
                    className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                      on
                        ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-200/95"
                        : "border-white/[0.06] bg-transparent text-slate-500"
                    }`}
                  >
                    {label}
                    <span className="sr-only">{on ? " 연결됨" : " 참고용"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
