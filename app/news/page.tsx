import type { Metadata } from "next";
import { NewsPageLive } from "@/components/news-page-live";

export const metadata: Metadata = {
  title: "News",
  description: "AI 뉴스 분석 — 서버 뉴스 API 우선."
};

export default function NewsPage() {
  return <NewsPageLive />;
}
