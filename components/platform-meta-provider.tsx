"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { IntegrationFlags } from "@/lib/integration-flags";
import type { PlatformMetaPayload } from "@/lib/platform-meta-types";
import { oneaiFetch } from "@/lib/oneai-api";

export type PlatformMetaState = {
  meta: PlatformMetaPayload | null;
  error: boolean;
  loading: boolean;
};

export type PlatformIntegrationsState = {
  integrations: IntegrationFlags | null;
  error: boolean;
  loading: boolean;
};

const PlatformMetaContext = createContext<PlatformMetaState | undefined>(undefined);

function parsePlatformMeta(json: Record<string, unknown>): PlatformMetaPayload | null {
  const integ = json.integrations;
  if (!(integ && typeof integ === "object" && !Array.isArray(integ))) return null;
  return json as PlatformMetaPayload;
}

export function PlatformMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<PlatformMetaPayload | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { res, json } = await oneaiFetch<Record<string, unknown>>("/api/platform/meta");
        if (cancelled) return;
        if (!res.ok) {
          setError(true);
          return;
        }
        const parsed = parsePlatformMeta(json as Record<string, unknown>);
        if (!parsed) {
          setError(true);
          return;
        }
        setMeta(parsed);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ meta, error, loading }), [meta, error, loading]);

  return <PlatformMetaContext.Provider value={value}>{children}</PlatformMetaContext.Provider>;
}

/** 전체 `GET /api/platform/meta` 페이로드 — footer·기능 게이트 등에 사용 */
export function usePlatformMeta(): PlatformMetaState | undefined {
  return useContext(PlatformMetaContext);
}

/** `integrations`만 필요할 때 (예: IntegrationStrip) */
export function usePlatformIntegrations(): PlatformIntegrationsState | undefined {
  const ctx = useContext(PlatformMetaContext);
  if (ctx === undefined) return undefined;
  return {
    integrations: ctx.meta?.integrations ?? null,
    error: ctx.error,
    loading: ctx.loading
  };
}
