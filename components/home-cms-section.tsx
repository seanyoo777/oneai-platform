"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { oneaiFetch } from "@/lib/oneai-api";

type CmsItem = {
  id: string;
  kind: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  linkUrl?: string | null;
  badge?: string | null;
};

type PublicCms = {
  ok?: boolean;
  banners?: CmsItem[];
  articles?: CmsItem[];
  featuredPicks?: CmsItem[];
  events?: CmsItem[];
};

type PlatformMeta = {
  ok?: boolean;
  features?: { cms?: boolean };
};

function LinkOrSpan({ href, children }: { href?: string | null; children: ReactNode }) {
  if (href && href.startsWith("/")) {
    return (
      <Link href={href} className="text-emerald-400/95 underline-offset-2 hover:text-emerald-300 hover:underline">
        {children}
      </Link>
    );
  }
  if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
    return (
      <a href={href} className="text-emerald-400/95 underline-offset-2 hover:text-emerald-300 hover:underline" target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return <>{children}</>;
}

export function HomeCmsSection() {
  const [cms, setCms] = useState<PublicCms | null>(null);

  useEffect(() => {
    void (async () => {
      const meta = await oneaiFetch<PlatformMeta>("/api/platform/meta");
      if (meta.res.ok && meta.json?.features?.cms === false) {
        return;
      }
      const { res, json } = await oneaiFetch<PublicCms>("/api/cms/public");
      if (res.ok && json && typeof json === "object") setCms(json);
    })();
  }, []);

  if (!cms?.ok) return null;

  const banners = cms.banners ?? [];
  const articles = cms.articles ?? [];
  const events = cms.events ?? [];
  const picks = cms.featuredPicks ?? [];

  if (!banners.length && !events.length && !picks.length && !articles.length) return null;

  return (
    <section className="space-y-4">
      {banners.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {banners.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-600/50 bg-gradient-to-br from-slate-900/90 to-slate-800/80 p-4 shadow-lg shadow-black/20 ring-1 ring-white/[0.04]"
            >
              <div className="flex flex-wrap items-center gap-2">
                {b.badge ? (
                  <span className="rounded bg-amber-900/50 px-2 py-0.5 text-xs text-amber-200">{b.badge}</span>
                ) : null}
                <h2 className="text-lg font-semibold text-white">
                  <LinkOrSpan href={b.linkUrl}>{b.title}</LinkOrSpan>
                </h2>
              </div>
              {b.subtitle ? <p className="mt-1 text-sm text-slate-300">{b.subtitle}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {articles.length > 0 ? (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 shadow-md shadow-black/20 ring-1 ring-white/[0.03]">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">큐레이션 기사</h3>
          <ul className="space-y-3 text-sm">
            {articles.map((a) => (
              <li key={a.id}>
                <p className="font-medium text-white">{a.title}</p>
                {a.subtitle ? <p className="text-slate-400">{a.subtitle}</p> : null}
                {a.body ? <p className="mt-1 text-slate-300 line-clamp-3">{a.body}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {(picks.length > 0 || events.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {picks.length > 0 ? (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 shadow-md ring-1 ring-white/[0.03]">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">추천 종목 · 테마</h3>
              <ul className="space-y-2 text-sm text-slate-200">
                {picks.map((p) => (
                  <li key={p.id}>
                    <span className="font-medium text-white">{p.title}</span>
                    {p.subtitle ? <span className="text-slate-400"> — {p.subtitle}</span> : null}
                    {p.linkUrl ? (
                      <span className="ml-2">
                        <LinkOrSpan href={p.linkUrl}>바로가기</LinkOrSpan>
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {events.length > 0 ? (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 shadow-md ring-1 ring-white/[0.03]">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">이벤트 · 공지</h3>
              <ul className="space-y-2 text-sm text-slate-200">
                {events.map((e) => (
                  <li key={e.id}>
                    <span className="font-medium text-white">
                      <LinkOrSpan href={e.linkUrl}>{e.title}</LinkOrSpan>
                    </span>
                    {e.subtitle ? <p className="text-slate-400">{e.subtitle}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
