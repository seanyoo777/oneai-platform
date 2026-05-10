"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { AuthPanel } from "@/components/auth-panel";
import { IntegrationStrip } from "@/components/integration-strip";
import { PageHero } from "@/components/page-hero";
import { WatchlistPanel } from "@/components/watchlist-panel";

export default function MePage() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const onSessionChange = useCallback((t: string | null) => setSessionToken(t), []);

  return (
    <>
      <IntegrationStrip className="mb-section" heading="Account · live feeds" />
      <div className="flex flex-col gap-section">
        <PageHero
          eyebrow="Account"
          title="내 정보"
          description={
            <>
              요금·입금·지갑 연결은{" "}
              <Link href="/membership" className="font-medium text-cyan-400/90 hover:text-cyan-300 hover:underline">
                멤버십
              </Link>
              페이지에서 확인할 수 있습니다.
            </>
          }
        />
        <AuthPanel onSessionChange={onSessionChange} />
        <WatchlistPanel token={sessionToken} />
      </div>
    </>
  );
}
