import type { Metadata } from "next";
import { IntegrationStrip } from "@/components/integration-strip";
import { SignalPageLive } from "@/components/signal-page-live";

export const metadata: Metadata = {
  title: "Signal",
  description: "투자 참고용 시그널 — API 우선 표시."
};

export default function SignalPage() {
  return (
    <>
      <IntegrationStrip className="mb-section" heading="Signal · live feeds" />
      <SignalPageLive />
    </>
  );
}
