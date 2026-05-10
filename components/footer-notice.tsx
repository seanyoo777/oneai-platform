import Link from "next/link";
import { FooterPlatformMeta } from "@/components/footer-platform-meta";

export function FooterNotice() {
  return (
    <footer className="mt-section border-t border-white/[0.06] px-4 py-10 text-xs text-slate-500 md:px-8">
      <div className="mx-auto max-w-shell space-y-6">
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-slate-400" aria-label="바닥글 링크">
          <Link href="/" className="transition hover:text-slate-200">
            홈
          </Link>
          <Link href="/membership" className="transition hover:text-slate-200">
            요금·멤버십
          </Link>
          <Link href="/me" className="transition hover:text-slate-200">
            계정
          </Link>
          <span className="hidden text-slate-600 sm:inline" aria-hidden>
            |
          </span>
          <Link href="/admin" className="transition hover:text-slate-300">
            운영 콘솔
          </Link>
          <Link href="/preview/auth" className="text-slate-600 transition hover:text-slate-400">
            인증 UI
          </Link>
        </nav>
        <section aria-labelledby="footer-disclaimer-heading">
          <h2 id="footer-disclaimer-heading" className="sr-only">
            투자 유의사항
          </h2>
          <p className="max-w-3xl leading-relaxed">
            본 서비스는 투자정보 및 참고용 분석 데이터를 제공하며, 투자 결과를 보장하지 않습니다. 모든 투자 판단과 책임은
            이용자에게 있습니다.
          </p>
          <FooterPlatformMeta />
        </section>
      </div>
    </footer>
  );
}
