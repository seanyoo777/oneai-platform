import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "내 정보",
  description: "회원 프로필·관심종목 — 로그인 후 서버와 동기화됩니다."
};

export default function MeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
