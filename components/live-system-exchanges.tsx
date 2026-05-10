"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import { oneaiFetch } from "@/lib/oneai-api";

const FALLBACK_KEYS = ["binance", "bybit", "bitget", "okx"];

type ExchangeRow = {
  key: string;
  provider?: string;
  ready?: boolean;
  mode?: string;
  note?: string;
};

export function LiveSystemExchanges({
  title = "연결 상태",
  description
}: {
  title?: string;
  description?: ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [liveFromApi, setLiveFromApi] = useState(false);
  const [rows, setRows] = useState<ExchangeRow[]>([]);

  useEffect(() => {
    void (async () => {
      const { res, json } = await oneaiFetch<{ ok?: boolean; exchanges?: ExchangeRow[] }>(
        "/api/system-trading/exchanges"
      );
      if (res.ok && json?.ok && Array.isArray(json.exchanges) && json.exchanges.length > 0) {
        setLiveFromApi(true);
        setRows(json.exchanges);
      } else {
        setLiveFromApi(false);
        setRows(FALLBACK_KEYS.map((key) => ({ key, mode: "offline", ready: false, note: "API 응답 없음" })));
      }
      setLoading(false);
    })();
  }, []);

  const cardDescription: ReactNode = loading ? (
    <span role="status" aria-live="polite">
      불러오는 중…
    </span>
  ) : (
    <>
      {description != null && description !== "" ? (
        <>
          {description}
          {" · "}
        </>
      ) : null}
      {liveFromApi ? "서버 거래소 목록" : "샘플 슬롯 (API 미연결 또는 빈 목록)"}
    </>
  );

  return (
    <Card title={title} description={cardDescription}>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <div key={row.key} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 text-center text-sm shadow-inner shadow-black/15">
            <p className="font-medium capitalize">{row.key}</p>
            <p className="text-xs text-slate-400">{row.provider ?? row.mode ?? "—"}</p>
            <p className={`mt-1 text-xs ${row.ready ? "text-emerald-400" : "text-amber-400"}`}>
              {row.ready ? "ready" : "준비 전"}
            </p>
            {row.note ? <p className="mt-1 text-xs text-slate-500 line-clamp-2">{row.note}</p> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
