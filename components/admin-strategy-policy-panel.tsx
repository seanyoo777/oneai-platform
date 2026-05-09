"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/card";

type PolicyRow = {
  id: string;
  name: string;
  score: number;
  maxDrawdown: number;
  trades: number;
  action: string;
  reasons: string[];
};

type ActionLog = {
  strategyId: string;
  action: string;
  note: string;
  processedAt: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";

function adminHeaders() {
  const headers: Record<string, string> = {};
  if (adminToken) headers.Authorization = `Bearer ${adminToken}`;
  return headers;
}

export function AdminStrategyPolicyPanel() {
  const [rows, setRows] = useState<PolicyRow[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => rows.filter((r) => r.action === "disable_pending_admin_review").length,
    [rows]
  );

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [policyRes, logRes] = await Promise.all([
        fetch(`${apiBase}/api/research/strategy-policy`),
        fetch(`${apiBase}/api/admin/strategies/action-history`, { headers: adminHeaders() })
      ]);
      if (!policyRes.ok || !logRes.ok) {
        throw new Error("정책 데이터를 불러오지 못했습니다.");
      }
      const policyJson = await policyRes.json();
      const logJson = await logRes.json();
      setRows(policyJson.results ?? []);
      setLogs(logJson ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  async function submitAction(strategyId: string, action: "approve_disable" | "reactivate") {
    try {
      await fetch(`${apiBase}/api/admin/strategies/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders() },
        body: JSON.stringify({
          strategyId,
          action,
          note: action === "approve_disable" ? "관리자 비활성화 승인" : "관리자 재활성화 승인"
        })
      });
      await loadData();
    } catch {
      setError("관리자 액션 처리에 실패했습니다.");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="space-y-4">
      <Card title="전략 정책 판정 결과">
        <p className="mb-3 text-sm text-slate-300">검토 대기 전략: {pendingCount}건</p>
        {loading ? <p className="text-sm text-slate-400">불러오는 중...</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="rounded-md bg-slate-900 p-3 text-sm">
              <p className="font-medium">{row.name}</p>
              <p className="text-slate-300">
                점수 {row.score} / MDD {row.maxDrawdown}% / 표본 {row.trades}
              </p>
              <p className="text-slate-400">사유: {row.reasons.length ? row.reasons.join(", ") : "정상 범위"}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded bg-red-700 px-2 py-1 text-xs"
                  onClick={() => submitAction(row.id, "approve_disable")}
                  type="button"
                >
                  비활성화 승인
                </button>
                <button
                  className="rounded bg-blue-700 px-2 py-1 text-xs"
                  onClick={() => submitAction(row.id, "reactivate")}
                  type="button"
                >
                  재활성화
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="관리자 액션 이력">
        <div className="space-y-1 text-sm text-slate-300">
          {!adminToken ? <p className="text-amber-300">NEXT_PUBLIC_ADMIN_TOKEN 미설정 시 관리자 API 호출이 제한됩니다.</p> : null}
          {logs.length === 0 ? <p>아직 처리 이력이 없습니다.</p> : null}
          {logs.map((log, i) => (
            <p key={`${log.strategyId}-${log.processedAt}-${i}`}>
              {log.processedAt} · {log.strategyId} · {log.action}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}
