"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import { LivePageSubtitle } from "@/components/live-page-subtitle";
import { PageHero } from "@/components/page-hero";
import { news as dummyNews } from "@/lib/dummy-data";
import { oneaiFetch } from "@/lib/oneai-api";

type NewsRow = {
  id: string;
  category: string;
  title: string;
  summary: string;
};

export function NewsPageLive() {
  const [items, setItems] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { res, json } = await oneaiFetch<{ ok?: boolean; news?: Record<string, unknown>[] }>("/api/news");
      if (res.ok && json?.ok && Array.isArray(json.news) && json.news.length > 0) {
        setItems(
          json.news.map((item, i) => ({
            id: typeof item.id === "string" ? item.id : `n-${i}`,
            category: String(item.category ?? "뉴스"),
            title: String(item.title ?? ""),
            summary: String(item.summary ?? "")
          }))
        );
      } else {
        setItems(dummyNews.map((n) => ({ id: n.id, category: n.category, title: n.title, summary: n.summary })));
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="News" title="OneAI News" description="큐레이션된 시장 뉴스와 요약입니다.">
        <LivePageSubtitle loading={loading} readyLabel="API 우선, 실패 시 더미" />
      </PageHero>
      <Card title="AI 뉴스 분석 센터">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 shadow-inner shadow-black/15">
              <p className="text-xs text-slate-400">{item.category}</p>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-slate-300">{item.summary}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
