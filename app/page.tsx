import type { Metadata } from "next";
import Link from "next/link";
import { HomeCmsSection } from "@/components/home-cms-section";
import { HomeDashboardLive } from "@/components/home-dashboard-live";
import { HomeHero } from "@/components/home-hero";
import { IntegrationStrip } from "@/components/integration-strip";

export const metadata: Metadata = {
  title: "홈",
  description: "통합 시세·시그널·리서치·뉴스 워크스페이스."
};

const quickLinks = [
  { href: "/market", label: "Market" },
  { href: "/signal", label: "Signal" },
  { href: "/scan", label: "Scan" },
  { href: "/news", label: "News" },
  { href: "/research", label: "Research" },
  { href: "/membership", label: "멤버십" }
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col gap-section">
      <HomeHero />

      <IntegrationStrip />

      <nav
        aria-label="서비스 바로가기"
        className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-y border-white/[0.06] py-4 text-[13px]"
      >
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-slate-500 transition hover:text-cyan-400/90 hover:underline-offset-4"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <HomeCmsSection />

      <HomeDashboardLive />
    </div>
  );
}
