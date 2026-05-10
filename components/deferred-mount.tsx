"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type DeferredMountProps = {
  children: ReactNode;
  /** 뷰포트보다 먼저 로드할 여백 (예: 스크롤 직전에 패널 준비) */
  rootMargin?: string;
  /** 로드 전 최소 높이로 레이아웃 점프 완화 */
  minHeight?: number;
  idleHint?: string;
};

/**
 * 관리자 등 긴 페이지에서 초기 API 호출 수를 줄입니다.
 * 화면에 가까워졌을 때만 자식을 마운트하므로 useEffect 기반 fetch가 그때 실행됩니다.
 */
export function DeferredMount({
  children,
  rootMargin = "280px 0px",
  minHeight = 100,
  idleHint = "스크롤하면 이 섹션을 불러옵니다."
}: DeferredMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || active) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) {
          setActive(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [active, rootMargin]);

  return (
    <div
      ref={ref}
      className={active ? undefined : "rounded-lg border border-dashed border-slate-800/80 bg-slate-950/30"}
      style={{ minHeight: active ? undefined : minHeight }}
    >
      {active ? (
        children
      ) : (
        <p
          className="flex min-h-[inherit] items-center justify-center px-4 py-8 text-center text-sm text-slate-500"
          role="status"
          aria-live="polite"
        >
          {idleHint}
        </p>
      )}
    </div>
  );
}
