"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import { LivePageSubtitle } from "@/components/live-page-subtitle";
import { oneaiFetch } from "@/lib/oneai-api";
import { marketSummary as dummyMarket, news as dummyNews, signals as dummySignals } from "@/lib/dummy-data";
import { fmtLiveChange, fmtLiveValue, type SummaryRow } from "@/lib/live-formatters";

type SignalPreview = { id: string; symbol: string; strategyName: string; confidenceScore: number };
type NewsPreview = { id: string; title: string; summary: string };

export function HomeDashboardLive() {
  const [loading, setLoading] = useState(true);
  const [marketLive, setMarketLive] = useState(false);
  const [signalsLive, setSignalsLive] = useState(false);
  const [newsLive, setNewsLive] = useState(false);
  const [market, setMarket] = useState<SummaryRow[]>([]);
  const [signals, setSignals] = useState<SignalPreview[]>([]);
  const [news, setNews] = useState<NewsPreview[]>([]);

  useEffect(() => {
    void (async () => {
      const [mRes, sRes, nRes] = await Promise.all([
        oneaiFetch<{ ok?: boolean; summary?: SummaryRow[] }>("/api/market/summary"),
        oneaiFetch<{ ok?: boolean; signals?: Record<string, unknown>[] }>("/api/signals"),
        oneaiFetch<{ ok?: boolean; news?: Record<string, unknown>[] }>("/api/news")
      ]);

      if (mRes.res.ok && mRes.json?.ok && Array.isArray(mRes.json.summary) && mRes.json.summary.length > 0) {
        setMarket(mRes.json.summary);
        setMarketLive(true);
      } else {
        setMarket(dummyMarket.map((x) => ({ name: x.name, value: x.value, change: x.change })));
        setMarketLive(false);
      }

      if (sRes.res.ok && sRes.json?.ok && Array.isArray(sRes.json.signals) && sRes.json.signals.length > 0) {
        setSignalsLive(true);
        setSignals(
          sRes.json.signals.map((sig, i) => ({
            id: typeof sig.id === "string" ? sig.id : `sig-${i}`,
            symbol: String(sig.symbol ?? ""),
            strategyName: String(sig.strategyName ?? ""),
            confidenceScore: typeof sig.confidenceScore === "number" ? sig.confidenceScore : 0
          }))
        );
      } else {
        setSignalsLive(false);
        setSignals(
          dummySignals.map((s) => ({
            id: s.id,
            symbol: s.symbol,
            strategyName: s.strategyName,
            confidenceScore: s.confidenceScore
          }))
        );
      }

      if (nRes.res.ok && nRes.json?.ok && Array.isArray(nRes.json.news) && nRes.json.news.length > 0) {
        setNewsLive(true);
        setNews(
          nRes.json.news.map((item, i) => ({
            id: typeof item.id === "string" ? item.id : `n-${i}`,
            title: String(item.title ?? ""),
            summary: String(item.summary ?? item.description ?? "")
          }))
        );
      } else {
        setNewsLive(false);
        setNews(dummyNews.map((n) => ({ id: n.id, title: n.title, summary: n.summary })));
      }

      setLoading(false);
    })();
  }, []);

  const allLive = marketLive && signalsLive && newsLive;

  return (
    <div className="flex flex-col gap-section">
      <div>
        <LivePageSubtitle
          loading={loading}
          readyLabel={allLive ? "실시간 데이터 연동" : "참고용 표시 · 네트워크 확인"}
        />
      </div>
      <div className="grid gap-section md:grid-cols-2 lg:grid-cols-3">
        <Card
          title="오늘의 시장 요약"
          description={
            loading ? undefined : marketLive ? "서버 시세 요약" : "샘플 시세 표시"
          }
        >
          <ul className="space-y-1 text-sm text-slate-300">
            {market.map((m) => (
              <li key={m.name} className="flex justify-between gap-2">
                <span>{m.name}</span>
                <span className="text-right">
                  <span className="font-medium text-white">{fmtLiveValue(m.value)}</span>
                  {m.change !== undefined && m.change !== null && String(m.change) !== "" ? (
                    <span
                      className={`ml-2 ${
                        typeof m.change === "number"
                          ? m.change < 0
                            ? "text-red-400"
                            : "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      {fmtLiveChange(m.change)}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="AI 시장 브리핑" description="위험관리 중심 분석">
          <p className="text-sm text-slate-300">
            이벤트 리스크는 중간 수준입니다. 변동성이 높아 손절 기준과 포지션 크기 제한이 권장됩니다.
          </p>
        </Card>
        <Card
          title="실시간 HOT 종목"
          description={
            loading ? undefined : signalsLive ? "참고용 시그널 (서버)" : "샘플 시그널 표시"
          }
        >
          <ul className="space-y-2 text-sm">
            {signals.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-slate-700/50 bg-slate-900/70 px-3 py-2 text-slate-200 shadow-inner shadow-black/10"
              >
                {s.symbol} · {s.strategyName} · 강도 {s.confidenceScore}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-section lg:grid-cols-2">
        <Card
          title="중요 뉴스"
          description={loading ? undefined : newsLive ? "서버 뉴스 하이라이트" : "샘플 뉴스 표시"}
        >
          <ul className="space-y-2 text-sm text-slate-300">
            {news.map((n) => (
              <li key={n.id}>
                <p className="font-medium text-white">{n.title}</p>
                <p>{n.summary}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="멤버십 안내" description="무료 / 레퍼럴 / VIP">
          <p className="text-sm text-slate-300">
            무료회원은 기본 뉴스와 일부 시그널이 제공되며, VIP회원은 실시간 전체 시그널과 전략 연구소를 이용할 수
            있습니다.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/membership" className="font-medium text-cyan-400/90 underline-offset-2 hover:underline">
              멤버십·VIP
            </Link>
            <span className="text-slate-600"> · </span>
            <Link href="/me" className="font-medium text-cyan-400/90 underline-offset-2 hover:underline">
              계정
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
