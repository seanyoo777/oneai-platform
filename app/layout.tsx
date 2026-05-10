import type { Metadata } from "next";
import "./globals.css";
import { FooterNotice } from "@/components/footer-notice";
import { MainNav } from "@/components/main-nav";
import { getSiteOrigin } from "@/lib/site-origin";

const siteOrigin = getSiteOrigin();

export const metadata: Metadata = {
  ...(siteOrigin ? { metadataBase: new URL(`${siteOrigin}/`) } : {}),
  title: {
    default: "OneAI",
    template: "%s · OneAI"
  },
  description: "AI 기반 통합 투자정보 플랫폼 MVP",
  openGraph: {
    title: "OneAI",
    description: "AI 기반 통합 투자정보 플랫폼 MVP",
    locale: "ko_KR",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "OneAI",
    description: "AI 기반 통합 투자정보 플랫폼 MVP"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-emerald-700 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          본문으로 건너뛰기
        </a>
        <MainNav />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-shell px-4 py-6 pb-12 outline-none md:px-8"
        >
          {children}
        </main>
        <FooterNotice />
      </body>
    </html>
  );
}
