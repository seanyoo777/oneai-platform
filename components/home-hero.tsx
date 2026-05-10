import Link from "next/link";

/** 메인 전용 — 프리미엄 투자 플랫폼형 히어로 */
export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#070a10]/90 px-5 py-10 md:px-12 md:py-14"
      aria-labelledby="home-hero-title"
    >
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-emerald-500/12 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-[120%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600/[0.07] via-transparent to-emerald-500/[0.06]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/85 md:text-xs">
          Integrated Market Workspace
        </p>
        <h1
          id="home-hero-title"
          className="mt-4 text-[26px] font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-[40px]"
        >
          글로벌 시장 인텔리전스를 한 화면에서
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400 md:text-base">
          시세·시그널·리서치·뉴스를 실시간으로 통합해 의사결정 속도를 높입니다.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/market"
            className="inline-flex min-h-11 w-full max-w-[220px] items-center justify-center rounded-lg bg-gradient-to-r from-emerald-600/90 to-teal-600/85 px-6 text-sm font-medium text-white shadow-glow-mint transition hover:brightness-110 sm:w-auto"
          >
            시장 개요
          </Link>
          <Link
            href="/signal"
            className="inline-flex min-h-11 w-full max-w-[220px] items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-6 text-sm font-medium text-slate-200 shadow-sm transition hover:border-cyan-400/35 hover:bg-white/[0.07] hover:text-white hover:shadow-glow-blue sm:w-auto"
          >
            시그널 브리프
          </Link>
        </div>
      </div>

      <div className="relative mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-px border border-white/[0.06] bg-white/[0.06] md:grid-cols-4">
        {[
          { k: "Coverage", v: "글로벌 멀티 에셋" },
          { k: "Signals", v: "전략 기반 알림" },
          { k: "Research", v: "리스크 조정 리포트" },
          { k: "Latency", v: "실시간 파이프라인" }
        ].map((row) => (
          <div key={row.k} className="bg-[#070a10]/95 px-4 py-3 text-center md:py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">{row.k}</p>
            <p className="mt-1 text-xs font-medium text-slate-300 md:text-sm">{row.v}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
