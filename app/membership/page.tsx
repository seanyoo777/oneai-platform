import type { Metadata } from "next";
import { IntegrationStrip } from "@/components/integration-strip";
import { MembershipPageLive } from "@/components/membership-page-live";

export const metadata: Metadata = {
  title: "멤버십",
  description: "VIP 플랜·입금 견적·지갑 연결 — 금액은 서버 단일 진실."
};

export default function MembershipPage() {
  return (
    <>
      <IntegrationStrip className="mb-section" heading="Membership · live feeds" />
      <MembershipPageLive />
    </>
  );
}
