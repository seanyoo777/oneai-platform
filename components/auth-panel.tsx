"use client";

import { useState } from "react";
import { Card } from "@/components/card";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

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
  createdAt: string;
};

const tokenKey = "oneai_user_token";

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [message, setMessage] = useState("");
  const [me, setMe] = useState<MeUser | null>(null);

  async function register() {
    setMessage("");
    const res = await fetch(`${apiBase}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nickname, referredBy })
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message ?? "회원가입 실패");
      return;
    }
    localStorage.setItem(tokenKey, json.token);
    setMe(json.user);
    setMessage("회원가입 완료");
  }

  async function login() {
    setMessage("");
    const res = await fetch(`${apiBase}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message ?? "로그인 실패");
      return;
    }
    localStorage.setItem(tokenKey, json.token);
    setMe(json.user);
    setMessage("로그인 완료");
  }

  async function loadMe() {
    setMessage("");
    const token = localStorage.getItem(tokenKey) || "";
    if (!token) {
      setMessage("먼저 로그인하세요.");
      return;
    }
    const res = await fetch(`${apiBase}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.message ?? "내 정보 조회 실패");
      return;
    }
    setMe(json.user);
    setMessage("내 정보 조회 완료");
  }

  return (
    <div className="space-y-4">
      <Card title="회원 인증" description="이메일 회원가입 / 로그인">
        <div className="grid gap-2 md:grid-cols-2">
          <input
            className="rounded bg-slate-900 p-2 text-sm"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="rounded bg-slate-900 p-2 text-sm"
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            className="rounded bg-slate-900 p-2 text-sm"
            placeholder="닉네임(회원가입 시)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <input
            className="rounded bg-slate-900 p-2 text-sm"
            placeholder="추천인 코드(선택)"
            value={referredBy}
            onChange={(e) => setReferredBy(e.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="rounded bg-blue-700 px-3 py-1 text-sm" onClick={register} type="button">
            회원가입
          </button>
          <button className="rounded bg-slate-700 px-3 py-1 text-sm" onClick={login} type="button">
            로그인
          </button>
          <button className="rounded bg-indigo-700 px-3 py-1 text-sm" onClick={loadMe} type="button">
            내 정보 불러오기
          </button>
        </div>
        {message ? <p className="mt-2 text-sm text-slate-300">{message}</p> : null}
      </Card>

      {me ? (
        <Card title={`${me.nickname} (${me.email})`}>
          <ul className="space-y-1 text-sm text-slate-300">
            <li>가입일자: {me.createdAt}</li>
            <li>내 추천코드: {me.referralCode}</li>
            <li>추천인: {me.referredBy || "없음"}</li>
            <li>추천인 가입 수: {me.referralCount}</li>
            <li>회원등급: {me.role}</li>
            <li>멤버십 상태: {me.membershipType}</li>
            <li>VIP 만료일: {me.membershipExpiresAt || "없음"}</li>
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
