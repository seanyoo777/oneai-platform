"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/card";
import { getPublicAdminToken } from "@/lib/admin-env";
import { getOneaiApiBaseUrl, oneaiErrorHint, oneaiFetch } from "@/lib/oneai-api";

const adminToken = getPublicAdminToken();

type CmsItem = {
  id: string;
  kind: string;
  sortOrder: number;
  published: boolean;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  linkUrl?: string | null;
  badge?: string | null;
};

const KINDS = [
  { value: "banner", label: "배너" },
  { value: "curated_article", label: "기사" },
  { value: "featured_pick", label: "추천종목" },
  { value: "event", label: "이벤트" }
];

export function AdminCmsPanel() {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [message, setMessage] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [kindFilter, setKindFilter] = useState("");
  const [form, setForm] = useState({
    kind: "banner",
    title: "",
    subtitle: "",
    body: "",
    linkUrl: "",
    badge: "",
    published: true,
    sortOrder: 0
  });

  const load = useCallback(async (opts?: { keepMessage?: boolean }): Promise<boolean> => {
    setListLoading(true);
    if (!opts?.keepMessage) {
      setMessage("");
    }
    try {
      const q = kindFilter ? `?kind=${encodeURIComponent(kindFilter)}` : "";
      const { res, json } = await oneaiFetch<{ ok?: boolean; items?: CmsItem[]; message?: string }>(
        `/api/admin/cms/items${q}`,
        { accessToken: adminToken || null }
      );
      if (!res.ok) {
        setMessage(oneaiErrorHint(json, res, "CMS 목록 조회 실패"));
        return false;
      }
      if (Array.isArray(json.items)) setItems(json.items);
      return true;
    } finally {
      setListLoading(false);
    }
  }, [kindFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const uiLocked = listLoading || actionBusy;

  async function createItem() {
    setActionBusy(true);
    setMessage("");
    try {
      const { res, json } = await oneaiFetch<{ ok?: boolean; message?: string }>("/api/admin/cms/items", {
        method: "POST",
        body: JSON.stringify({
          kind: form.kind,
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || null,
          body: form.body.trim() || null,
          linkUrl: form.linkUrl.trim() || null,
          badge: form.badge.trim() || null,
          published: form.published,
          sortOrder: Number(form.sortOrder)
        }),
        accessToken: adminToken || null
      });
      if (!res.ok) {
        setMessage(oneaiErrorHint(json, res, "생성 실패"));
        return;
      }
      setForm((f) => ({ ...f, title: "", subtitle: "", body: "", linkUrl: "", badge: "" }));
      const reloaded = await load({ keepMessage: true });
      if (reloaded) {
        setMessage("항목을 추가했습니다.");
      }
    } finally {
      setActionBusy(false);
    }
  }

  async function togglePublished(item: CmsItem) {
    setActionBusy(true);
    setMessage("");
    try {
      const { res, json } = await oneaiFetch<{ ok?: boolean; message?: string }>(`/api/admin/cms/items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ published: !item.published }),
        accessToken: adminToken || null
      });
      if (!res.ok) {
        setMessage(oneaiErrorHint(json, res, "상태 변경 실패"));
        return;
      }
      await load();
    } finally {
      setActionBusy(false);
    }
  }

  async function deleteItem(id: string) {
    if (typeof window !== "undefined" && !window.confirm("삭제할까요?")) return;
    setActionBusy(true);
    setMessage("");
    try {
      const { res, json } = await oneaiFetch<{ ok?: boolean; message?: string }>(`/api/admin/cms/items/${id}`, {
        method: "DELETE",
        accessToken: adminToken || null
      });
      if (!res.ok) {
        setMessage(oneaiErrorHint(json, res, "삭제 실패"));
        return;
      }
      await load();
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <Card
      title="콘텐츠 관리 (배너·기사·추천·이벤트)"
      description={
        uiLocked ? (
          <span role="status" aria-live="polite">
            {listLoading ? "목록 동기화 중…" : "요청 처리 중…"}
          </span>
        ) : (
          "저장 후 공개 API / 홈에 반영됩니다."
        )
      }
    >
      {!adminToken ? (
        <p className="mb-3 text-sm text-amber-300">NEXT_PUBLIC_ADMIN_TOKEN과 서버 ONEAI_ADMIN_TOKEN을 맞춰 주세요.</p>
      ) : null}
      <p className="mb-3 text-xs text-slate-500">API 베이스: {getOneaiApiBaseUrl()}</p>
      {message ? (
        <p className="mb-3 text-sm text-slate-300" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-end gap-2 border-b border-slate-800 pb-4" aria-busy={uiLocked}>
        <label className="text-xs text-slate-400">
          종류 필터
          <select
            className="ml-2 rounded bg-slate-900 p-2 text-sm disabled:opacity-50"
            value={kindFilter}
            disabled={uiLocked}
            onChange={(e) => setKindFilter(e.target.value)}
          >
            <option value="">전체</option>
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="rounded bg-slate-700 px-3 py-1 text-sm disabled:opacity-50"
          disabled={uiLocked}
          onClick={() => void load()}
        >
          새로고침
        </button>
      </div>

      <div className="mb-6 grid gap-2 rounded-md bg-slate-950 p-3 md:grid-cols-2">
        <p className="md:col-span-2 text-sm font-medium text-slate-200">빠른 추가</p>
        <select
          className="rounded bg-slate-900 p-2 text-sm disabled:opacity-50"
          value={form.kind}
          disabled={uiLocked}
          onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value }))}
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <input
          className="rounded bg-slate-900 p-2 text-sm disabled:opacity-50"
          placeholder="제목"
          value={form.title}
          disabled={uiLocked}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <input
          className="rounded bg-slate-900 p-2 text-sm disabled:opacity-50 md:col-span-2"
          placeholder="부제 / 요약"
          value={form.subtitle}
          disabled={uiLocked}
          onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
        />
        <textarea
          className="rounded bg-slate-900 p-2 text-sm disabled:opacity-50 md:col-span-2"
          placeholder="본문 (선택)"
          rows={2}
          value={form.body}
          disabled={uiLocked}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
        />
        <input
          className="rounded bg-slate-900 p-2 text-sm disabled:opacity-50"
          placeholder="링크 (/path 또는 https://)"
          value={form.linkUrl}
          disabled={uiLocked}
          onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
        />
        <input
          className="rounded bg-slate-900 p-2 text-sm disabled:opacity-50"
          placeholder="배지 텍스트"
          value={form.badge}
          disabled={uiLocked}
          onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
        />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.published}
            disabled={uiLocked}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          />
          공개
        </label>
        <input
          type="number"
          className="rounded bg-slate-900 p-2 text-sm disabled:opacity-50"
          placeholder="정렬"
          value={form.sortOrder}
          disabled={uiLocked}
          onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
        />
        <button
          type="button"
          className="rounded bg-emerald-700 px-3 py-2 text-sm disabled:opacity-50 md:col-span-2"
          disabled={uiLocked}
          onClick={() => void createItem()}
        >
          추가
        </button>
      </div>

      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.id} className="flex flex-wrap items-start justify-between gap-2 rounded-md bg-slate-900 p-3">
            <div>
              <span className="mr-2 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{it.kind}</span>
              <span className="font-medium text-white">{it.title}</span>
              {it.subtitle ? <p className="text-slate-400">{it.subtitle}</p> : null}
              <p className="text-xs text-slate-500">id: {it.id}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded bg-slate-700 px-2 py-1 text-xs disabled:opacity-50"
                disabled={uiLocked}
                onClick={() => void togglePublished(it)}
              >
                {it.published ? "공개 중" : "숨김"}
              </button>
              <button
                type="button"
                className="rounded bg-red-900/60 px-2 py-1 text-xs text-red-100 disabled:opacity-50"
                disabled={uiLocked}
                onClick={() => void deleteItem(it.id)}
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
