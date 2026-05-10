"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/card";
import { DeferredMount } from "@/components/deferred-mount";
import { AdminPanelSkeleton } from "@/components/admin-panel-skeleton";
import { usePlatformMeta } from "@/components/platform-meta-provider";

const AdminCmsPanel = dynamic(
  () => import("@/components/admin-cms-panel").then((m) => ({ default: m.AdminCmsPanel })),
  { ssr: false, loading: () => <AdminPanelSkeleton label="콘텐츠 관리" /> }
);

const AdminAiRecLogPanel = dynamic(
  () => import("@/components/admin-ai-rec-log-panel").then((m) => ({ default: m.AdminAiRecLogPanel })),
  { ssr: false, loading: () => <AdminPanelSkeleton label="AI·시그널 로그" /> }
);

const AdminStrategyPolicyPanel = dynamic(
  () => import("@/components/admin-strategy-policy-panel").then((m) => ({ default: m.AdminStrategyPolicyPanel })),
  { ssr: false, loading: () => <AdminPanelSkeleton label="전략 정책" /> }
);

function FeatureOffCard({ title, envVar }: { title: string; envVar: string }) {
  return (
    <Card title={title} description="서버에서 이 기능이 비활성화되어 있습니다.">
      <p className="text-sm text-slate-400">
        환경 변수 <code className="rounded bg-slate-900 px-1 font-mono text-xs text-emerald-300/90">{envVar}</code> 를 끈 상태입니다.
      </p>
    </Card>
  );
}

export function AdminDeferredPanels() {
  const state = usePlatformMeta();

  const cmsOff = Boolean(state && !state.loading && state.meta?.features?.cms === false);
  const aiLogOff = Boolean(state && !state.loading && state.meta?.features?.aiRecommendationLog === false);

  return (
    <>
      {cmsOff ? (
        <FeatureOffCard title="콘텐츠 관리" envVar="ONEAI_FEATURE_CMS" />
      ) : (
        <DeferredMount minHeight={120} idleHint="콘텐츠 관리(배너·기사 등)는 여기로 오면 불러옵니다.">
          <AdminCmsPanel />
        </DeferredMount>
      )}

      {aiLogOff ? (
        <FeatureOffCard title="AI·시그널 로그" envVar="ONEAI_FEATURE_AI_REC_LOG" />
      ) : (
        <DeferredMount minHeight={100} idleHint="AI·시그널 서빙 로그는 스크롤 후 로드됩니다.">
          <AdminAiRecLogPanel />
        </DeferredMount>
      )}

      <DeferredMount minHeight={120} idleHint="전략 정책·액션 이력은 스크롤 후 로드됩니다.">
        <AdminStrategyPolicyPanel />
      </DeferredMount>
    </>
  );
}
