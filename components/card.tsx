import type { ReactNode } from "react";

export function Card({
  title,
  description,
  children
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/[0.06] bg-[#0c1019]/80 p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.55)] backdrop-blur-sm transition-colors hover:border-white/[0.09]">
      <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
      {description != null && description !== "" ? (
        <div className="mt-2 text-xs font-normal text-slate-500">{description}</div>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
