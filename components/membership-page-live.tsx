"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import { PageHero } from "@/components/page-hero";
import { ONEAI_USER_TOKEN_KEY } from "@/lib/auth-storage";
import { CLIPBOARD_COPY_FAILED_KO, copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { oneaiErrorHint, oneaiFetch } from "@/lib/oneai-api";

function planLabel(code: string): string {
  if (code === "vip_30d") return "VIP 30일";
  if (code === "vip_90d") return "VIP 90일";
  if (code === "vip_365d") return "VIP 365일";
  return code;
}

const FALLBACK_CATALOG: { planCode: string; days: number; amountUsdt: number }[] = [
  { planCode: "vip_30d", days: 30, amountUsdt: 100 },
  { planCode: "vip_90d", days: 90, amountUsdt: 270 },
  { planCode: "vip_365d", days: 365, amountUsdt: 960 }
];

type QuotePayload = {
  planCode?: string;
  days?: number;
  amountUsdt?: number;
  note?: string;
  depositAddress?: string;
};

export function MembershipPageLive() {
  const [token, setToken] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<Record<string, QuotePayload | null>>({});
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletNetwork, setWalletNetwork] = useState("evm");
  const [walletMsg, setWalletMsg] = useState<string | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [linkedWallet, setLinkedWallet] = useState<string | null>(null);
  const [catalogPlans, setCatalogPlans] = useState<{ planCode: string; days: number; amountUsdt: number }[]>([]);
  const [depositCopied, setDepositCopied] = useState(false);
  const [depositCopyHint, setDepositCopyHint] = useState<string | null>(null);
  const [walletCopied, setWalletCopied] = useState(false);
  const [walletCopyHint, setWalletCopyHint] = useState<string | null>(null);

  function readToken() {
    try {
      return localStorage.getItem(ONEAI_USER_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    void (async () => {
      const { res, json } = await oneaiFetch<{
        ok?: boolean;
        plans?: { planCode: string; days: number; amountUsdt: number }[];
      }>("/api/payments/membership/catalog");
      if (res.ok && json?.ok && Array.isArray(json.plans)) setCatalogPlans(json.plans);
    })();
  }, []);

  useEffect(() => {
    setToken(readToken());
    const onFocus = () => setToken(readToken());
    const onStorage = (e: StorageEvent) => {
      if (e.key === ONEAI_USER_TOKEN_KEY) setToken(e.newValue);
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setQuotes({});
      setDepositAddress(null);
      setQuoteError(null);
      return;
    }

    void (async () => {
      setLoadingQuotes(true);
      setQuoteError(null);
      const next: Record<string, QuotePayload | null> = {};
      let dep: string | null = null;

      try {
        const errs: string[] = [];
        const codes = (catalogPlans.length ? catalogPlans : FALLBACK_CATALOG).map((p) => p.planCode);
        await Promise.all(
          codes.map(async (code) => {
            const { res, json } = await oneaiFetch<{
              ok?: boolean;
              quote?: QuotePayload;
              depositAddress?: string;
              message?: string;
            }>(`/api/payments/membership/quote?planCode=${encodeURIComponent(code)}`, {
              accessToken: token
            });
            if (!res.ok) {
              next[code] = null;
              errs.push(oneaiErrorHint(json, res, "견적 조회 실패"));
              return;
            }
            if (json?.ok && json.quote) {
              next[code] = json.quote;
              if (!dep && typeof json.depositAddress === "string") dep = json.depositAddress;
              if (!dep && typeof json.quote.depositAddress === "string") dep = json.quote.depositAddress;
            } else {
              next[code] = null;
            }
          })
        );
        setQuotes(next);
        setDepositAddress(dep);
        const anyOk = codes.some((code) => next[code] != null);
        setQuoteError(anyOk ? null : errs[0] ?? "견적을 가져오지 못했습니다.");
      } finally {
        setLoadingQuotes(false);
      }
    })();
  }, [token, catalogPlans]);

  useEffect(() => {
    if (!token) {
      setLinkedWallet(null);
      return;
    }
    void (async () => {
      const { res, json } = await oneaiFetch<{ ok?: boolean; user?: { walletAddress?: string | null } }>(
        "/api/auth/me",
        { accessToken: token }
      );
      if (res.ok && json?.user?.walletAddress) {
        setLinkedWallet(String(json.user.walletAddress));
      } else {
        setLinkedWallet(null);
      }
    })();
  }, [token]);

  async function connectWallet() {
    if (!token) return;
    const addr = walletAddress.trim();
    if (!addr) {
      setWalletMsg("지갑 주소를 입력하세요.");
      return;
    }
    setWalletLoading(true);
    setWalletMsg(null);
    try {
      const { res, json } = await oneaiFetch<{ ok?: boolean; message?: string; user?: { walletAddress?: string | null } }>(
        "/api/payments/wallet/connect",
        {
          method: "POST",
          body: JSON.stringify({ walletAddress: addr, walletNetwork }),
          accessToken: token
        }
      );
      if (!res.ok) {
        setWalletMsg(oneaiErrorHint(json as Record<string, unknown>, res, "지갑 연결 실패"));
        return;
      }
      const w = json?.user?.walletAddress;
      setLinkedWallet(w ? String(w) : addr);
      setWalletMsg("연결되었습니다. 입금 확인 시 서버에서 멤버십이 연장됩니다.");
      setWalletAddress("");
    } catch (e) {
      setWalletMsg(e instanceof Error ? e.message : "연결 실패");
    } finally {
      setWalletLoading(false);
    }
  }

  async function copyClipboard(text: string, mode: "deposit" | "wallet") {
    setDepositCopyHint(null);
    setWalletCopyHint(null);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      if (mode === "deposit") {
        setDepositCopied(true);
        window.setTimeout(() => setDepositCopied(false), 2000);
      } else {
        setWalletCopied(true);
        window.setTimeout(() => setWalletCopied(false), 2000);
      }
    } else if (mode === "deposit") {
      setDepositCopyHint(CLIPBOARD_COPY_FAILED_KO);
    } else {
      setWalletCopyHint(CLIPBOARD_COPY_FAILED_KO);
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Membership"
        title="멤버십"
        description="등급 안내와 VIP 입금 견적(로그인 시 서버 확정 금액)입니다."
      />

      <Card
        title="VIP 플랜 요금 (공개)"
        description={
          catalogPlans.length ? (
            <>
              <code className="font-mono text-xs text-slate-400">GET /api/payments/membership/catalog</code>
              {" — 금액은 서버 단일 진실"}
            </>
          ) : (
            "카탈로그 API를 불러오지 못해 기본 표만 표시합니다."
          )
        }
      >
        <div className="grid gap-2 sm:grid-cols-3">
          {(catalogPlans.length ? catalogPlans : FALLBACK_CATALOG).map((p) => (
            <div key={p.planCode} className="rounded-md bg-slate-900 p-3 text-sm">
              <p className="font-medium text-white">{planLabel(p.planCode)}</p>
              <p className="mt-1 text-slate-300">
                {p.days}일 · <span className="text-emerald-300">{p.amountUsdt} USDT</span>
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="무료회원">
          <p className="text-sm text-slate-300">기본 뉴스, 일부 시그널, 기본 차트, 제한된 검색 제공</p>
        </Card>
        <Card title="레퍼럴회원">
          <p className="text-sm text-slate-300">추천 가입 수에 따라 무료 기능 확대, 검색 사용량 증가</p>
        </Card>
        <Card title="VIP회원">
          <p className="text-sm text-slate-300">실시간 전체 시그널, AI 분석, 백테스트, 알림, VIP 리포트</p>
        </Card>
      </div>

      <Card
        title="VIP 입금 견적"
        description={
          <>
            금액·입금 주소는 서버 단일 진실 (
            <code className="font-mono text-xs text-slate-400">/api/payments/membership/quote</code>) · 로그인 필요
          </>
        }
      >
        {!token ? (
          <p className="text-sm text-slate-300">
            견적을 보려면 로그인하세요.{" "}
            <Link href="/me" className="text-blue-400 underline-offset-2 hover:underline">
              내 정보
            </Link>
            에서 로그인 후 다시 오거나 창 포커스를 주면 토큰이 반영됩니다.
          </p>
        ) : loadingQuotes ? (
          <p className="text-sm text-slate-500" role="status" aria-live="polite">
            견적 불러오는 중…
          </p>
        ) : quoteError ? (
          <p className="text-sm text-amber-300" role="status" aria-live="polite">
            {quoteError}
          </p>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              {(catalogPlans.length ? catalogPlans : FALLBACK_CATALOG).map(
                (p) => {
                  const code = p.planCode;
                  const label = planLabel(code);
                  const q = quotes[code];
                  return (
                  <div key={code} className="rounded-md bg-slate-900 p-3 text-sm">
                    <p className="font-medium text-white">{label}</p>
                    {q ? (
                      <>
                        <p className="mt-1 text-slate-300">
                          {typeof q.days === "number" ? `${q.days}일` : "—"} ·{" "}
                          <span className="text-emerald-300">
                            {typeof q.amountUsdt === "number" ? `${q.amountUsdt} USDT` : "—"}
                          </span>
                        </p>
                        {q.note ? <p className="mt-2 text-xs text-slate-500">{q.note}</p> : null}
                      </>
                    ) : (
                      <p className="mt-1 text-slate-500">견적 없음</p>
                    )}
                  </div>
                );
              })}
            </div>
            {depositAddress ? (
              <div className="mt-4 rounded-md border border-slate-700 bg-slate-950/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">입금 주소 (USDT)</p>
                  <button
                    type="button"
                    className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-600"
                    aria-label={depositCopied ? "입금 주소 복사 완료" : "VIP 입금 주소 클립보드에 복사"}
                    onClick={() => void copyClipboard(depositAddress, "deposit")}
                  >
                    {depositCopied ? "복사됨" : "주소 복사"}
                  </button>
                </div>
                <p className="mt-1 break-all font-mono text-sm text-slate-200">{depositAddress}</p>
                {depositCopyHint ? (
                  <p className="mt-2 text-xs text-amber-400" role="status" aria-live="polite">
                    {depositCopyHint}
                  </p>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </Card>

      {token ? (
        <Card
          title="지갑 연결 (USDT 입금 식별)"
          description={
            <>
              <code className="font-mono text-xs text-slate-400">POST /api/payments/wallet/connect</code>
              {" — MVP 온체인 입금과 매칭용"}
            </>
          }
        >
          {linkedWallet ? (
            <div className="mb-3 rounded-md border border-slate-700 bg-slate-950/50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">등록된 지갑</p>
                <button
                  type="button"
                  className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-600"
                  aria-label={walletCopied ? "등록 지갑 주소 복사 완료" : "등록 지갑 주소 클립보드에 복사"}
                  onClick={() => void copyClipboard(linkedWallet, "wallet")}
                >
                  {walletCopied ? "복사됨" : "주소 복사"}
                </button>
              </div>
              <code className="mt-1 block break-all text-sm text-emerald-300">{linkedWallet}</code>
              {walletCopyHint ? (
                <p className="mt-2 text-xs text-amber-400" role="status" aria-live="polite">
                  {walletCopyHint}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mb-3 text-sm text-slate-500">등록된 지갑 없음</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end" aria-busy={walletLoading}>
            <input
              className="flex-1 rounded bg-slate-900 p-2 font-mono text-sm disabled:opacity-50"
              placeholder="0x… 지갑 주소"
              value={walletAddress}
              disabled={walletLoading}
              onChange={(e) => setWalletAddress(e.target.value)}
              autoComplete="off"
            />
            <select
              className="rounded bg-slate-900 p-2 text-sm disabled:opacity-50"
              value={walletNetwork}
              disabled={walletLoading}
              onChange={(e) => setWalletNetwork(e.target.value)}
            >
              <option value="evm">EVM</option>
            </select>
            <button
              type="button"
              className="rounded bg-indigo-700 px-4 py-2 text-sm disabled:opacity-50"
              disabled={walletLoading}
              onClick={() => void connectWallet()}
            >
              {walletLoading ? "처리 중…" : "연결"}
            </button>
          </div>
          {walletMsg ? (
            <p className="mt-2 text-sm text-slate-400" role="status" aria-live="polite">
              {walletMsg}
            </p>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
