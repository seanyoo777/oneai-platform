import type { IntegrationFlags } from "@/lib/integration-flags";

/** `GET /api/platform/meta`의 `features` 객체 */
export type PlatformPublicFeatures = {
  cms: boolean;
  watchlist: boolean;
  aiRecommendationLog: boolean;
  adminRbac: boolean;
};

/** `GET /api/platform/meta` 본문 (서버 `platform-public` 조합) */
export type PlatformMetaPayload = {
  platformServiceId: string;
  apiVersion: string;
  serverPackageVersion: string;
  features: PlatformPublicFeatures;
  integrations: IntegrationFlags;
  time: string;
};
