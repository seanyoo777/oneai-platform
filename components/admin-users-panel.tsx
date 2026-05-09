"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/card";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "";

type UserRow = {
  id: string;
  email: string;
  nickname: string;
  referralCode: string;
  referralCount: number;
  role: string;
  membershipType: string;
  membershipExpiresAt?: string | null;
  createdAt: string;
};

export function AdminUsersPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [message, setMessage] = useState("");
  const [vipDateByUserId, setVipDateByUserId] = useState<Record<string, string>>({});

  async function loadUsers() {
    setMessage("");
    const res = await fetch(`${apiBase}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message ?? "회원 목록 조회 실패");
      return;
    }
    setUsers(json);
    setVipDateByUserId((prev) => {
      const next = { ...prev };
      for (const u of json as UserRow[]) {
        if (!next[u.id]) {
          next[u.id] = u.membershipExpiresAt ? String(u.membershipExpiresAt).slice(0, 10) : "";
        }
      }
      return next;
    });
  }

  async function updateUser(userId: string, role: string, membershipType: string, membershipExpiresAt: string) {
    setMessage("");
    const res = await fetch(`${apiBase}/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ role, membershipType, membershipExpiresAt })
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message ?? "회원 수정 실패");
      return;
    }
    setMessage(`수정 완료: ${json.user.email}`);
    await loadUsers();
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <Card title="회원 관리 (실동작)">
      {!adminToken ? <p className="mb-2 text-sm text-amber-300">NEXT_PUBLIC_ADMIN_TOKEN을 설정해주세요.</p> : null}
      {message ? <p className="mb-2 text-sm text-slate-300">{message}</p> : null}
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="rounded-md bg-slate-900 p-3 text-sm">
            <p className="font-medium">
              {user.nickname} ({user.email})
            </p>
            <p className="text-slate-400">
              추천코드 {user.referralCode} / 추천수 {user.referralCount}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                className="rounded bg-slate-700 px-2 py-1 text-xs"
                onClick={() => updateUser(user.id, "free_member", "free", "")}
                type="button"
              >
                무료회원
              </button>
              <button
                className="rounded bg-blue-700 px-2 py-1 text-xs"
                onClick={() => updateUser(user.id, "referral_member", "referral", "")}
                type="button"
              >
                레퍼럴회원
              </button>
              <button
                className="rounded bg-yellow-700 px-2 py-1 text-xs"
                onClick={() =>
                  updateUser(
                    user.id,
                    "vip_member",
                    "vip",
                    vipDateByUserId[user.id] || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10)
                  )
                }
                type="button"
              >
                VIP 적용
              </button>
              <button
                className="rounded bg-red-700 px-2 py-1 text-xs"
                onClick={() => updateUser(user.id, "admin", user.membershipType, user.membershipExpiresAt || "")}
                type="button"
              >
                관리자
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                className="rounded bg-slate-800 p-1 text-xs"
                value={vipDateByUserId[user.id] || ""}
                onChange={(e) => setVipDateByUserId((prev) => ({ ...prev, [user.id]: e.target.value }))}
              />
              <button
                className="rounded bg-emerald-700 px-2 py-1 text-xs"
                onClick={() => updateUser(user.id, user.role, user.membershipType, vipDateByUserId[user.id] || "")}
                type="button"
              >
                만료일만 저장
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
