import type { Metadata } from "next";
import { ResearchPageLive } from "@/components/research-page-live";

export const metadata: Metadata = {
  title: "Research",
  description: "전략 성과 점수·정책 자동 판정 — 참고용 지표."
};

export default function ResearchPage() {
  return <ResearchPageLive />;
}
