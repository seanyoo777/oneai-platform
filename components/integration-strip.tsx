"use client";

import { useEffect, useState } from "react";
import { usePlatformIntegrations } from "@/components/platform-meta-provider";
import type { IntegrationFlags } from "@/lib/integration-flags";
import { oneaiFetch } from "@/lib/oneai-api";

const ROWS: { key: keyof IntegrationFlags; label: string }[] = [
  { key: "coingecko", label: "Crypto" },
  { key: "yahooKospi", label: "KOSPI" },
  { key: "finnhubQuote", label: "US" },
  { key: "finnhubNews", label: "News" }
];

export function IntegrationStrip({
  heading = "Live feeds",
  className = ""
}: {
  heading?: string;
  className?: string;
}) {
  const shared = usePlatformIntegrations();
  const [localFlags, setLocalFlags] = useState<IntegrationFlags | null>(null);
  const [localError, setLocalError] = useState(false);

  useEffect(() => {
    if (shared !== undefined) return;
    void (async () => {
      try {
        const { res, json } = await oneaiFetch<Record<string, unknown>>("/api/platform/meta");
        if (!res.ok) {
          setLocalError(true);
          return;
        }
        const integ = json.integrations;
        if (integ && typeof integ === "object" && !Array.isArray(integ)) {
          setLocalFlags(integ as IntegrationFlags);
        } else {
          setLocalError(true);
        }
      } catch {
        setLocalError(true);
      }
    })();
  }, [shared]);

  const error = shared !== undefined ? shared.error : localError;
  const flags = shared !== undefined ? shared.integrations : localFlags;
  const pending =
    shared !== undefined
      ? shared.loading && shared.integrations === null && !shared.error
      : localFlags === null && !localError;

  return (
    <section
      className={`rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 ${className}`}
      aria-label="외부 데이터 연결 상태"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">{heading}</p>
        {error ? (
          <p className="text-xs text-slate-500">메타를 불러오지 못했습니다. API 주소를 확인해 주세요.</p>
        ) : pending || flags == null ? (
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
