import type { ReactNode } from "react";

export function PageHero({
  title,
  description,
  eyebrow,
  children,
  className = "",
  titleId
}: {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
  /** 섹션 `aria-labelledby` 등 접근성용 */
  titleId?: string;
}) {
  return (
    <header
      className={`relative mb-section overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0d14]/90 px-6 py-8 md:px-10 md:py-10 ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-bl from-emerald-500/25 via-emerald-600/10 to-transparent blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl"
        aria-hidden
      />
      <div className="relative space-y-3">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400/80">{eyebrow}</p>
        ) : null}
        <h1 id={titleId} className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {title}
        </h1>
        {description ? (
          <div className="max-w-2xl text-sm leading-relaxed text-slate-300 md:text-[15px]">{description}</div>
        ) : null}
        {children ? <div className="pt-1">{children}</div> : null}
      </div>
    </header>
  );
}
