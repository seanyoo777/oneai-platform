import type { Metadata } from "next";
import { IntegrationStrip } from "@/components/integration-strip";
import { ScanPageLive } from "@/components/scan-page-live";

export const metadata: Metadata = {
  title: "Scan",
  description: "국내주식 스캔·검색기 결과 — 서버 더미 유니버스 기준."
};

export default function ScanPage() {
  return (
    <>
      <IntegrationStrip className="mb-section" heading="Scan · live feeds" />
      <ScanPageLive />
    </>
  );
}
