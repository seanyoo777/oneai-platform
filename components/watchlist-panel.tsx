"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/card";
import { ONEAI_USER_TOKEN_KEY } from "@/lib/auth-storage";
import { oneaiErrorHint, oneaiFetch } from "@/lib/oneai-api";

type WatchItem = {
  id: string;
  symbol: string;
  market: string;
  note?: string | null;
  addedAt?: string;
};

type PlatformMeta = {
  features?: { watchlist?: boolean };
};

/** `/api/platform/meta` 의 features.watchlist === false 이면 패널 미표시 */
export function WatchlistPanel({ token }: { token: string | null }) {
  const [gate, setGate] = useState<"pending" | "off" | "on">("pending");
  const [listLoading, setListLoading] = useState(false);
  const [items, setItems] = useState<WatchItem[]>([]);
  const [symbol, setSymbol] = useState("");
  const [market, setMarket] = useState("crypto");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void oneaiFetch<PlatformMeta>("/api/platform/meta").then(({ res, json }) => {
      if (res.ok && json?.features?.watchlist === false) {
        setGate("off");
        return;
      }
      setGate("on");
    });
  }, []);

  const load = useCallback(async () => {
    if (gate !== "on") return;
    setMessage("");
    const t = token || localStorage.getItem(ONEAI_USER_TOKEN_KEY) || "";
    if (!t) {
      setItems([]);
      setListLoading(false);
      setMessage("로그인 후 관심종목을 사용할 수 있습니다.");
      return;
    }
    setListLoading(true);
    try {
      const { res, json } = await oneaiFetch<{ ok?: boolean; items?: WatchItem[]; message?: string }>(
        "/api/me/watchlist",
        { accessToken: t }
      );
      if (!res.ok) {
        setMessage(oneaiErrorHint(json, res, "불러오기 실패"));
        return;
      }
      if (Array.isArray(json.items)) setItems(json.items);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "연결 실패");
    } finally {
      setListLoading(false);
    }
  }, [token, gate]);

  useEffect(() => {
    if (gate === "on") void load();
  }, [gate, load]);

  async function saveNext(next: WatchItem[]) {
    if (gate !== "on") return;
    setMessage("");
    const t = token || localStorage.getItem(ONEAI_USER_TOKEN_KEY) || "";
    if (!t) {
      setMessage("로그인이 필요합니다.");
      return;
    }
    try {
      const { res, json } = await oneaiFetch<{ ok?: boolean; items?: WatchItem[]; message?: string }>(
        "/api/me/watchlist",
        {
          method: "PUT",
          body: JSON.stringify({
            items: next.map(({ symbol: s, market: m, note: n }) => ({ symbol: s, market: m, note: n ?? null }))
          }),
          accessToken: t
        }
      );
      if (!res.ok) {
        setMessage(oneaiErrorHint(json, res, "저장 실패"));
        return;
      }
      if (Array.isArray(json.items)) setItems(json.items);
      setMessage("저장했습니다.");
      setSymbol("");
      setNote("");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "연결 실패");
    }
  }

  function addRow() {
    const s = symbol.trim().toUpperCase();
    if (!s) {
      setMessage("종목 심볼을 입력하세요.");
      return;
    }
    const m = market.trim().toLowerCase();
    const dup = items.some((it) => it.symbol === s && it.market === m);
    if (dup) {
      setMessage("이미 같은 시장에 등록된 종목입니다.");
      return;
    }
    const next = [...items, { id: `${s}:${m}`, symbol: s, market: m, note: note.trim() || null }];
    void saveNext(next);
  }

  function removeRow(id: string) {
    void saveNext(items.filter((it) => it.id !== id));
  }

  if (gate === "off") {
    return null;
  }

  if (gate === "pending") {
    return (
      <Card
        title="관심종목"
        description={
          <span role="status" aria-live="polite">
            플랫폼 설정 확인 중…
          </span>
        }
      />
    );
  }

  const cardDescription =
    listLoading ? (
      <span role="status" aria-live="polite">
        서버 목록 불러오는 중…
      </span>
    ) : (
      "종목·시장 단위로 서버에 저장 (최대 100개)"
    );

  return (
    <Card title="관심종목" description={cardDescription}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          className="rounded bg-slate-900 p-2 text-sm disabled:opacity-50"
          placeholder="심볼 (예: BTC, AAPL)"
          value={symbol}
          disabled={listLoading}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <select
          className="rounded bg-slate-900 p-2 text-sm disabled:opacity-50"
          value={market}
          disabled={listLoading}
          onChange={(e) => setMarket(e.target.value)}
        >
          <option value="crypto">암호화폐</option>
          <option value="kr">국내주식</option>
          <option value="us">미국주식</option>
          <option value="futures">선물</option>
          <option value="global">기타</option>
        </select>
        <input
          className="rounded bg-slate-900 p-2 text-sm disabled:opacity-50 sm:col-span-2 lg:col-span-2"
          placeholder="메모 (선택)"
          value={note}
          disabled={listLoading}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-emerald-700 px-3 py-1 text-sm disabled:opacity-50"
          disabled={listLoading}
          onClick={() => void addRow()}
        >
          추가
        </button>
        <button
          type="button"
          className="rounded bg-slate-700 px-3 py-1 text-sm disabled:opacity-50"
          disabled={listLoading}
          onClick={() => void load()}
        >
          새로고침
        </button>
      </div>
      {message ? (
        <p className="mt-2 text-sm text-slate-300" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-700 px-3 py-2"
            >
              <span className="font-medium text-slate-100">
                {it.symbol}{" "}
                <span className="text-slate-400">
                  · {it.market}
                  {it.note ? ` · ${it.note}` : ""}
                </span>
              </span>
              <button
                type="button"
                className="rounded bg-red-900/60 px-2 py-0.5 text-xs text-red-100 disabled:opacity-50"
                disabled={listLoading}
                onClick={() => removeRow(it.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      ) : !listLoading ? (
        <p className="mt-4 text-sm text-slate-500">등록된 관심종목이 없습니다.</p>
      ) : null}
    </Card>
  );
}
