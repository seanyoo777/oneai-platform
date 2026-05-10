"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** 단일 중앙 네비 — 미리보기·운영 도구는 푸터로 분리 */
const navItems: { href: string; label: string }[] = [
  { href: "/", label: "홈" },
  { href: "/market", label: "Market" },
  { href: "/signal", label: "Signal" },
  { href: "/scan", label: "Scan" },
  { href: "/news", label: "News" },
  { href: "/research", label: "Research" },
  { href: "/system-trading", label: "트레이딩" },
  { href: "/exchange", label: "Exchange" },
  { href: "/global-data", label: "Global" },
  { href: "/membership", label: "멤버십" },
  { href: "/me", label: "계정" }
];

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean) {
  const base =
    "relative whitespace-nowrap rounded-lg px-2.5 py-2 text-[12px] font-medium transition md:px-3 md:text-[13px]";
  if (active) {
    return `${base} text-white shadow-nav-active ring-1 ring-emerald-400/35 bg-emerald-500/[0.12]`;
  }
  return `${base} text-slate-400 hover:bg-white/[0.05] hover:text-white`;
}

export function MainNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#06080f]/85 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[72px] w-full max-w-shell items-center gap-3 px-4 md:h-20 md:gap-6 md:px-8">
        <div className="flex w-[132px] shrink-0 items-center md:w-[160px]">
          <Link href="/" className="group block leading-none">
            <span className="block bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-[22px] font-semibold tracking-tight text-transparent md:text-[26px]">
              OneAI
            </span>
            <span className="mt-0.5 hidden text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500 md:block">
              Markets
            </span>
          </Link>
        </div>

        <nav className="flex min-h-0 min-w-0 flex-1 justify-center" aria-label="주요 메뉴">
          <div className="-mx-1 max-w-full overflow-x-auto overflow-y-hidden px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex min-h-[44px] flex-nowrap items-center justify-center gap-0.5 md:min-h-[48px] md:gap-1">
              {navItems.map((item) => {
                const active = linkActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={navLinkClass(active)}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="flex w-[132px] shrink-0 items-center justify-end md:w-[160px]">
          <Link
            href="/me"
            className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-white md:px-3 md:text-xs"
          >
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
}
