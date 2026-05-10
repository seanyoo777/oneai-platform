"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/card";
import { LivePageSubtitle } from "@/components/live-page-subtitle";
import { PageHero } from "@/components/page-hero";
import { oneaiFetch } from "@/lib/oneai-api";

const SCANNER_LABELS: Record<string, string> = {
  volume_surge: "거래량 폭증",
  breakout: "돌파",
  rsi_reversal: "RSI 역추세",
  flow_strength: "수급 강도",
  news_momentum: "뉴스 모멘텀",
  theme_strength: "테마",
  unusual_flow: "이상 수급·세력 흔적"
};

const FALLBACK_SCANNERS = [
  "거래량 폭증 검색기",
  "돌파 검색기",
  "RSI 검색기",
  "기관/외국인 수급 검색기",
  "뉴스 급등 검색기",
  "테마 검색기",
  "세력 흔적 탐지"
];

const SAMPLE_RESULTS = [
  {
    symbol: "000660",
    name: "SK하이닉스",
    signal: "거래량 폭증 / 돌파 / 뉴스 모멘텀",
    entryGuide: "전고점 재돌파 확인 시 참고",
    exitGuide: "손절 -2.5%, 분할 청산 +4%/+7%"
  },
  {
    symbol: "005930",
    name: "삼성전자",
    signal: "수급 강세 / 거래량 폭증",
    entryGuide: "장중 눌림 이후 재상승 시 참고",
    exitGuide: "손절 -2.0%, 목표 +3.5%"
  }
];

type ScanResult = {
  symbol?: string;
  name?: string;
  tags?: string[];
  price?: number;
  changeRate?: number;
};

export function ScanPageLive() {
  const [scannerLabels, setScannerLabels] = useState<string[]>(FALLBACK_SCANNERS);
  const [universeCount, setUniverseCount] = useState<number | null>(null);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [ovRes, rsRes] = await Promise.all([
        oneaiFetch<{
          ok?: boolean;
          scanners?: string[];
          universeCount?: number;
        }>("/api/scan/overview"),
        oneaiFetch<{ ok?: boolean; results?: ScanResult[] }>("/api/scan/results?type=all")
      ]);

      if (ovRes.res.ok && ovRes.json?.ok) {
        const ids = ovRes.json.scanners;
        if (Array.isArray(ids) && ids.length > 0) {
          setScannerLabels(ids.map((id) => SCANNER_LABELS[id] ?? id));
        }
        if (typeof ovRes.json.universeCount === "number") setUniverseCount(ovRes.json.universeCount);
      }

      if (rsRes.res.ok && rsRes.json?.ok && Array.isArray(rsRes.json.results) && rsRes.json.results.length > 0) {
        setResults(rsRes.json.results);
      } else {
        setResults(
          SAMPLE_RESULTS.map((s) => ({
            symbol: s.symbol,
            name: s.name,
            tags: s.signal.split(" / ")
          }))
        );
      }

      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Scan" title="OneAI Scan" description="스크리너로 종목을 발굴합니다.">
        <LivePageSubtitle loading={loading} readyLabel="검색기 목록·결과 — API 우선">
          {universeCount !== null ? ` · 유니버스 약 ${universeCount}종` : null}
        </LivePageSubtitle>
      </PageHero>

      <Card title="종목 발굴 검색기">
        <ul className="grid gap-2 md:grid-cols-2">
          {scannerLabels.map((scanner) => (
            <li key={scanner} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 text-sm shadow-inner shadow-black/15">
              {scanner}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="검색 결과" description="실데이터 연동 전에는 서버 더미 유니버스 기준">
        <div className="space-y-2">
          {results.map((item, idx) => (
            <div key={item.symbol ?? String(idx)} className="rounded-lg border border-slate-700/50 bg-slate-900/70 p-3 text-sm shadow-inner shadow-black/15">
              <p className="font-medium">
                {item.name ?? "—"} ({item.symbol ?? "—"})
              </p>
              {item.price !== undefined ? (
                <p className="text-slate-300">
                  가격 {item.price}
                  {typeof item.changeRate === "number" ? ` · 등락 ${item.changeRate}%` : ""}
                </p>
              ) : null}
              <p className="text-slate-300">
                신호:{" "}
                {Array.isArray(item.tags) && item.tags.length ? item.tags.join(" · ") : "—"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
