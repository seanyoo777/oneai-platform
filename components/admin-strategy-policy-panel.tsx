"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/card";
import { getPublicAdminToken } from "@/lib/admin-env";
import { oneaiErrorHint, oneaiFetch } from "@/lib/oneai-api";

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

const adminToken = getPublicAdminToken();

type PolicyApiResponse = {
  ok?: boolean;
  results?: PolicyRow[];
};

export function AdminStrategyPolicyPanel() {
  const [rows, setRows] = useState<PolicyRow[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uiLocked = loading || actionBusy;

  const pendingCount = useMemo(
    () => rows.filter((r) => r.action === "disable_pending_admin_review").length,
    [rows]
  );

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [policy, logsFetch] = await Promise.all([
        oneaiFetch<PolicyApiResponse>("/api/research/strategy-policy"),
        oneaiFetch<{ entries?: ActionLog[] } | ActionLog[]>("/api/admin/strategies/action-history", {
          accessToken: adminToken || null
        })
      ]);
      if (!policy.res.ok) {
        throw new Error(oneaiErrorHint(policy.json as Record<string, unknown>, policy.res, "정책 조회 실패"));
      }
      if (!logsFetch.res.ok) {
        throw new Error(
          oneaiErrorHint(logsFetch.json as Record<string, unknown>, logsFetch.res, "액션 이력 조회 실패")
        );
      }
      const policyJson = policy.json;
      const logJson = logsFetch.json;
      setRows(policyJson.results ?? []);
      let history: ActionLog[] = [];
      if (Array.isArray(logJson)) {
        history = logJson;
      } else if (logJson && typeof logJson === "object" && Array.isArray(logJson.entries)) {
        history = logJson.entries;
      }
      setLogs(history);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  async function submitAction(strategyId: string, action: "approve_disable" | "reactivate") {
    setActionBusy(true);
    setError(null);
    try {
      const { res, json } = await oneaiFetch<Record<string, unknown>>("/api/admin/strategies/action", {
        method: "POST",
        body: JSON.stringify({
          strategyId,
          action,
          note: action === "approve_disable" ? "관리자 비활성화 승인" : "관리자 재활성화 승인"
        }),
        accessToken: adminToken || null
      });
      if (!res.ok) {
        setError(oneaiErrorHint(json, res, "관리자 액션 실패"));
        return;
      }
      await loadData();
    } catch {
      setError("관리자 액션 처리에 실패했습니다.");
    } finally {
      setActionBusy(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="space-y-4">
      <Card title="전략 정책 판정 결과">
        <p className="mb-3 text-sm text-slate-300">검토 대기 전략: {pendingCount}건</p>
        {loading ? (
          <p className="text-sm text-slate-400" role="status" aria-live="polite">
            불러오는 중…
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-red-300" role="status" aria-live="polite">
            {error}
          </p>
        ) : null}
        <div className="space-y-2" aria-busy={uiLocked}>
          {rows.map((row) => (
            <div key={row.id} className="rounded-md bg-slate-900 p-3 text-sm">
              <p className="font-medium">{row.name}</p>
              <p className="text-slate-300">
                점수 {row.score} / MDD {row.maxDrawdown}% / 표본 {row.trades}
              </p>
              <p className="text-slate-400">사유: {row.reasons.length ? row.reasons.join(", ") : "정상 범위"}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded bg-red-700 px-2 py-1 text-xs disabled:opacity-50"
                  disabled={uiLocked}
                  onClick={() => void submitAction(row.id, "approve_disable")}
                  type="button"
                >
                  비활성화 승인
                </button>
                <button
                  className="rounded bg-blue-700 px-2 py-1 text-xs disabled:opacity-50"
                  disabled={uiLocked}
                  onClick={() => void submitAction(row.id, "reactivate")}
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
          {!loading && logs.length === 0 ? <p>아직 처리 이력이 없습니다.</p> : null}
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
