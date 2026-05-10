import type { Metadata } from "next";
import { MarketPageLive } from "@/components/market-page-live";

export const metadata: Metadata = {
  title: "Market",
  description: "시장 지표 요약 — 서버 API 우선, 실패 시 샘플 데이터."
};

export default function MarketPage() {
  return <MarketPageLive />;
}
