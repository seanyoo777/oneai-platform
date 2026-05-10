import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/site-origin";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  const rules = {
    userAgent: "*",
    allow: "/",
    disallow: ["/admin", "/preview"]
  };
  if (origin) {
    return {
      rules,
      sitemap: `${origin}/sitemap.xml`
    };
  }
  return { rules };
}
