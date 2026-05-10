"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { IntegrationFlags } from "@/lib/integration-flags";
import { oneaiFetch } from "@/lib/oneai-api";

export type PlatformIntegrationsState = {
  integrations: IntegrationFlags | null;
  error: boolean;
  loading: boolean;
};

const PlatformIntegrationsContext = createContext<PlatformIntegrationsState | undefined>(undefined);

export function PlatformMetaProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState<IntegrationFlags | null>(null);
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
        const integ = json.integrations;
        if (integ && typeof integ === "object" && !Array.isArray(integ)) {
          setIntegrations(integ as IntegrationFlags);
        } else {
          setError(true);
        }
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

  const value = useMemo(
    () => ({ integrations, error, loading }),
    [integrations, error, loading]
  );

  return <PlatformIntegrationsContext.Provider value={value}>{children}</PlatformIntegrationsContext.Provider>;
}

/** Returns `undefined` only when used outside `PlatformMetaProvider`. */
export function usePlatformIntegrations(): PlatformIntegrationsState | undefined {
  return useContext(PlatformIntegrationsContext);
}
