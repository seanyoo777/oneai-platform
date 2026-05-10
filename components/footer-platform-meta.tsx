"use client";

import { usePlatformMeta } from "@/components/platform-meta-provider";

/** 공개 메타 로드 후 서비스 ID·API·패키지 버전 한 줄 표시 */
export function FooterPlatformMeta() {
  const state = usePlatformMeta();
  if (!state?.meta || state.error) return null;
  const { platformServiceId, apiVersion, serverPackageVersion } = state.meta;
  return (
    <p className="text-[11px] text-slate-600">
      <span className="font-mono text-slate-500">{platformServiceId}</span>
      {" · "}
      API {apiVersion} · 서버 {serverPackageVersion}
    </p>
  );
}
