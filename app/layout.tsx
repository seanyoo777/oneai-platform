import type { Metadata } from "next";
import "./globals.css";
import { FooterNotice } from "@/components/footer-notice";
import { MainNav } from "@/components/main-nav";

export const metadata: Metadata = {
  title: "OneAI",
  description: "AI 기반 통합 투자정보 플랫폼 MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <MainNav />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <FooterNotice />
      </body>
    </html>
  );
}
