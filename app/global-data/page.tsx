import type { Metadata } from "next";
import { IntegrationStrip } from "@/components/integration-strip";
import { GlobalDataPageLive } from "@/components/global-data-page-live";

export const metadata: Metadata = {
  title: "Global Data",
  description: "글로벌 데이터 커버리지 메타 — 서버 범위 안내."
};

export default function GlobalDataPage() {
  return (
    <>
      <IntegrationStrip className="mb-section" heading="Global Data · live feeds" />
      <GlobalDataPageLive />
    </>
  );
}
