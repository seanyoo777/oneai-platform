"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/card";
import { getPublicAdminToken } from "@/lib/admin-env";
import { oneaiErrorHint, oneaiFetch } from "@/lib/oneai-api";

const adminToken = getPublicAdminToken();

type RecRow = {
  id: string;
  channel: string;
  kind: string;
  summary?: Record<string, unknown> | null;
  modelVersion?: string | null;
  createdAt: string;
};

export function AdminAiRecLogPanel() {
  const [logs, setLogs] = useState<RecRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const { res, json } = await oneaiFetch<{ ok?: boolean; logs?: RecRow[] }>(
        "/api/admin/ai-recommendation-logs?limit=80",
        { accessToken: adminToken || null }
      );
      if (!res.ok) {
        setMessage(oneaiErrorHint(json as Record<string, unknown>, res, "로그 조회 실패"));
        return;
      }
      if (Array.isArray(json.logs)) setLogs(json.logs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card
      title="AI·시그널 서빙 로그"
      description={
        loading ? (
          <span role="status" aria-live="polite">
            로그 동기화 중…
          </span>
        ) : (
          "캐시 갱신 시점마다 요약이 기록됩니다. 전문 본문은 저장하지 않습니다."
        )
      }
    >
      {!adminToken ? <p className="mb-2 text-sm text-amber-300">NEXT_PUBLIC_ADMIN_TOKEN 필요</p> : null}
      {message ? (
        <p className="mb-2 text-sm text-slate-300" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
      <button
        type="button"
        className="mb-3 rounded bg-slate-700 px-3 py-1 text-sm disabled:opacity-50"
        disabled={loading}
        onClick={() => void load()}
      >
        새로고침
      </button>
      <ul className="max-h-80 space-y-2 overflow-y-auto text-xs text-slate-300" aria-busy={loading}>
        {!loading && logs.length === 0 ? (
          <li>기록이 없습니다. /signal 페이지 등에서 시그널 API가 호출되면 쌓입니다.</li>
        ) : null}
        {logs.map((row) => (
          <li key={row.id} className="rounded border border-slate-800 bg-slate-950 p-2 font-mono">
            <span className="text-slate-500">{row.createdAt}</span> · {row.channel} ·{" "}
            <span className="text-emerald-400">{row.kind}</span>
            {row.modelVersion ? <span className="text-slate-500"> · {row.modelVersion}</span> : null}
            <pre className="mt-1 whitespace-pre-wrap break-all text-[11px] text-slate-400">
              {JSON.stringify(row.summary ?? {}, null, 0)}
            </pre>
          </li>
        ))}
      </ul>
    </Card>
  );
}
