import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-origin";

/** 검색·공유용 공개 라우트 (관리자·프리뷰 제외) */
const PUBLIC_PATHS = [
  "/",
  "/exchange",
  "/global-data",
  "/market",
  "/me",
  "/membership",
  "/news",
  "/research",
  "/scan",
  "/signal",
  "/system-trading"
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  if (!origin) {
    return [];
  }
  const now = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: path === "/" ? `${origin}/` : `${origin}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7
  }));
}
