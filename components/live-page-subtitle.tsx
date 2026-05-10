"use client";

import type { ReactNode } from "react";

type LivePageSubtitleProps = {
  loading: boolean;
  /** 로딩 완료 후 표시할 안내 문구 */
  readyLabel: string;
  loadingLabel?: string;
  /** `readyLabel` 뒤에 붙는 보조 텍스트·숫자 (로딩 중에는 렌더하지 않음) */
  children?: ReactNode;
};

/** 라이브 데이터 페이지 상단 부제 — 로딩 상태를 스크린리더에 알림 */
export function LivePageSubtitle({
  loading,
  readyLabel,
  loadingLabel = "불러오는 중…",
  children
}: LivePageSubtitleProps) {
  return (
    <div
      className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400"
      role="status"
      aria-live="polite"
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${loading ? "animate-pulse bg-amber-400" : "bg-emerald-400"}`}
        aria-hidden
      />
      <span>
        {loading ? loadingLabel : (
          <>
            {readyLabel}
            {children}
          </>
        )}
      </span>
    </div>
  );
}
