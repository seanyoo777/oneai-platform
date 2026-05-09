import Link from "next/link";

const menus = [
  { href: "/", label: "홈" },
  { href: "/market", label: "OneAI Market" },
  { href: "/signal", label: "OneAI Signal" },
  { href: "/scan", label: "OneAI Scan" },
  { href: "/news", label: "OneAI News" },
  { href: "/research", label: "OneAI Research" },
  { href: "/system-trading", label: "시스템 트레이딩" },
  { href: "/exchange", label: "OneAI Exchange" },
  { href: "/global-data", label: "Global Data" },
  { href: "/preview/auth", label: "폼 미리보기" },
  { href: "/membership", label: "멤버십" },
  { href: "/me", label: "내 정보" },
  { href: "/admin", label: "관리자" }
];

export function MainNav() {
  return (
    <nav className="sticky top-0 z-10 border-b border-slate-800 bg-oneai-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-lg font-semibold text-oneai-silver">OneAI / 원에이아이</p>
          <p className="text-xs text-slate-400">모든 시장을 하나의 AI로</p>
        </div>
        <ul className="hidden gap-4 text-sm lg:flex">
          {menus.map((item) => (
            <li key={item.href}>
              <Link className="text-slate-300 transition hover:text-white" href={item.href}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
