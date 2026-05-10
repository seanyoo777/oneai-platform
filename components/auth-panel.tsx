"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import { ONEAI_REFRESH_TOKEN_KEY, ONEAI_USER_TOKEN_KEY } from "@/lib/auth-storage";
import { CLIPBOARD_COPY_FAILED_KO, copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { getOneaiApiBaseUrl, oneaiErrorHint, oneaiFetch } from "@/lib/oneai-api";

const inputClass =
  "w-full rounded-lg border border-white/[0.08] bg-[#080b12]/90 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50";

const btnPrimary =
  "inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600/90 to-teal-700/90 px-4 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:opacity-50";

const btnSecondary =
  "inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07] disabled:opacity-50";

type MeUser = {
  id: string;
  email: string;
  nickname: string;
  referralCode: string;
  referredBy?: string | null;
  referralCount: number;
  role: string;
  membershipType: string;
  membershipExpiresAt?: string | null;
  walletAddress?: string | null;
  walletNetwork?: string | null;
  createdAt: string;
};

type AuthPanelProps = {
  onSessionChange?: (accessToken: string | null) => void;
};

export function AuthPanel({ onSessionChange }: AuthPanelProps = {}) {
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [message, setMessage] = useState("");
  const [me, setMe] = useState<MeUser | null>(null);
  const [walletCopied, setWalletCopied] = useState(false);
  const [walletCopyHint, setWalletCopyHint] = useState<string | null>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem(ONEAI_USER_TOKEN_KEY);
      onSessionChange?.(t || null);
    } catch {
      onSessionChange?.(null);
    }
  }, [onSessionChange]);

  async function register() {
    setBusy(true);
    setMessage("");
    const payload = {
      email: email.trim(),
      password,
      nickname: nickname.trim(),
      referredBy: referredBy.trim()
    };
    try {
      const { res, json } = await oneaiFetch<{
        message?: string;
        token?: string;
        refreshToken?: string;
        user?: MeUser;
      }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        setMessage(oneaiErrorHint(json, res, "회원가입 실패"));
        return;
      }
      if (json.token) localStorage.setItem(ONEAI_USER_TOKEN_KEY, json.token);
      if (json.refreshToken) localStorage.setItem(ONEAI_REFRESH_TOKEN_KEY, json.refreshToken);
      if (json.token) onSessionChange?.(json.token);
      if (json.user) setMe(json.user);
      setMessage("회원가입이 완료되었습니다.");
    } catch (e) {
      setMessage(
        e instanceof Error
          ? `연결 실패: ${e.message}. API 주소(${getOneaiApiBaseUrl()})를 확인해 주세요.`
          : "연결 실패"
      );
    } finally {
      setBusy(false);
    }
  }

  async function login() {
    setBusy(true);
    setMessage("");
    try {
      const { res, json } = await oneaiFetch<{
        message?: string;
        token?: string;
        refreshToken?: string;
        user?: MeUser;
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password })
      });
      if (!res.ok) {
        setMessage(oneaiErrorHint(json, res, "로그인 실패"));
        return;
      }
      if (json.token) localStorage.setItem(ONEAI_USER_TOKEN_KEY, json.token);
      if (json.refreshToken) localStorage.setItem(ONEAI_REFRESH_TOKEN_KEY, json.refreshToken);
      if (json.token) onSessionChange?.(json.token);
      if (json.user) setMe(json.user);
      setMessage("로그인되었습니다.");
    } catch (e) {
      setMessage(
        e instanceof Error
          ? `연결 실패: ${e.message}. API 주소(${getOneaiApiBaseUrl()})를 확인해 주세요.`
          : "연결 실패"
      );
    } finally {
      setBusy(false);
    }
  }

  async function loadMe() {
    setBusy(true);
    setMessage("");
    const token = localStorage.getItem(ONEAI_USER_TOKEN_KEY) || "";
    if (!token) {
      setMessage("먼저 로그인해 주세요.");
      setBusy(false);
      return;
    }
    try {
      const { res, json } = await oneaiFetch<{ message?: string; user?: MeUser }>("/api/auth/me", {
        accessToken: token
      });
      if (!res.ok) {
        setMessage(oneaiErrorHint(json, res, "내 정보 조회 실패"));
        return;
      }
      if (json.user) setMe(json.user);
      onSessionChange?.(token);
      setMessage("프로필을 불러왔습니다.");
    } catch (e) {
      setMessage(e instanceof Error ? `연결 실패: ${e.message}` : "연결 실패");
    } finally {
      setBusy(false);
    }
  }

  async function copyWalletAddress(addr: string) {
    setWalletCopyHint(null);
    const ok = await copyTextToClipboard(addr);
    if (ok) {
      setWalletCopied(true);
      window.setTimeout(() => setWalletCopied(false), 2000);
    } else {
      setWalletCopyHint(CLIPBOARD_COPY_FAILED_KO);
    }
  }

  return (
    <div className="flex flex-col gap-section">
      <Card
        title="계정"
        description={
          busy ? (
            <span role="status" aria-live="polite">
              처리 중…
            </span>
          ) : (
            "이메일 기반 로그인 및 회원 등록"
          )
        }
      >
        <div className="mx-auto w-full max-w-sm space-y-4" aria-busy={busy}>
          <input
            className={inputClass}
            placeholder="이메일"
            value={email}
            disabled={busy}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className={inputClass}
            placeholder="비밀번호"
            type="password"
            value={password}
            disabled={busy}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <input
            className={inputClass}
            placeholder="닉네임 (신규 가입 시)"
            value={nickname}
            disabled={busy}
            onChange={(e) => setNickname(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="추천 코드 (선택)"
            value={referredBy}
            disabled={busy}
            onChange={(e) => setReferredBy(e.target.value)}
          />

          <div className="flex flex-col gap-3 pt-1">
            <button className={btnPrimary} onClick={() => void login()} disabled={busy} type="button">
              로그인
            </button>
            <button className={btnSecondary} onClick={() => void register()} disabled={busy} type="button">
              회원가입
            </button>
            <button
              className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/[0.06] px-4 text-sm font-medium text-cyan-200/90 transition hover:border-cyan-400/40 disabled:opacity-50"
              onClick={() => void loadMe()}
              disabled={busy}
              type="button"
            >
              프로필 새로고침
            </button>
          </div>
        </div>

        {message ? (
          <p className="mx-auto mt-6 max-w-sm text-center text-sm text-slate-400" role="status" aria-live="polite">
            {message}
          </p>
        ) : null}
      </Card>

      {me ? (
        <Card title={`${me.nickname}`} description={me.email}>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
              <span className="text-slate-500">가입일</span>
              <span className="text-slate-200">{me.createdAt}</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
              <span className="text-slate-500">추천 코드</span>
              <span className="font-mono text-slate-200">{me.referralCode}</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
              <span className="text-slate-500">추천인</span>
              <span className="text-slate-200">{me.referredBy || "—"}</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
              <span className="text-slate-500">추천 가입 수</span>
              <span className="text-slate-200">{me.referralCount}</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
              <span className="text-slate-500">등급</span>
              <span className="text-slate-200">{me.role}</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
              <span className="text-slate-500">멤버십</span>
              <span className="text-slate-200">{me.membershipType}</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-white/[0.05] py-2">
              <span className="text-slate-500">VIP 만료</span>
              <span className="text-slate-200">{me.membershipExpiresAt || "—"}</span>
            </li>
            <li className="py-2">
              {me.walletAddress ? (
                <div className="rounded-lg border border-white/[0.06] bg-[#080b12]/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wide text-slate-500">
                      연결 지갑
                      {me.walletNetwork ? (
                        <span className="font-normal normal-case text-slate-500"> ({me.walletNetwork})</span>
                      ) : null}
                    </span>
                    <button
                      type="button"
                      className="rounded-md border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-200 hover:bg-white/[0.1]"
                      aria-label={walletCopied ? "복사 완료" : "주소 복사"}
                      onClick={() => void copyWalletAddress(me.walletAddress!)}
                    >
                      {walletCopied ? "복사됨" : "복사"}
                    </button>
                  </div>
                  <code className="mt-2 block break-all text-xs text-emerald-400/90">{me.walletAddress}</code>
                  {walletCopyHint ? (
                    <p className="mt-2 text-xs text-amber-400/90" role="status" aria-live="polite">
                      {walletCopyHint}
                    </p>
                  ) : null}
                </div>
              ) : (
                <span className="text-slate-500">연결 지갑 없음</span>
              )}
            </li>
            <li className="text-xs text-slate-600">
              VIP·입금 안내는{" "}
              <Link href="/membership" className="text-cyan-400/90 underline-offset-2 hover:underline">
                멤버십
              </Link>
              에서 확인할 수 있습니다.
            </li>
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
