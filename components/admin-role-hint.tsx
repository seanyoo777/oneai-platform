"use client";

import { useEffect, useState } from "react";
import { getPublicAdminToken } from "@/lib/admin-env";
import { oneaiFetch } from "@/lib/oneai-api";

const adminToken = getPublicAdminToken();

/** 배포된 관리자 토큰의 역할을 표시 — RBAC 토큰 분리 시 디버깅에 유용 */
export function AdminRoleHint() {
  const [role, setRole] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!adminToken) return;
    void (async () => {
      const { res, json } = await oneaiFetch<{ ok?: boolean; role?: string; message?: string }>(
        "/api/admin/session",
        { accessToken: adminToken }
      );
      if (!res.ok) {
        setErr(json.message ?? `HTTP ${res.status}`);
        return;
      }
      if (json.role) setRole(json.role);
    })();
  }, []);

  if (!adminToken) return null;
  if (err) {
    return (
      <p className="text-xs text-amber-400" role="status" aria-live="polite">
        관리자 세션 확인 실패: {err} — 토큰과 <code className="text-slate-400">NEXT_PUBLIC_API_BASE_URL</code>를 확인하세요.
      </p>
    );
  }
  if (!role) {
    return (
      <p className="text-xs text-slate-600" role="status" aria-live="polite">
        관리자 역할 확인 중…
      </p>
    );
  }

  return (
    <p className="text-xs text-slate-500" role="status" aria-live="polite">
      연결된 관리자 역할: <code className="rounded bg-slate-800 px-1 text-slate-300">{role}</code>
    </p>
  );
}
