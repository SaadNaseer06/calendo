import type { MetadataRoute } from "next";
import { getSiteBaseUrl } from "@/lib/site-routes";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/login"],
        disallow: ["/dashboard", "/calendar", "/ai-studio", "/brands", "/analytics", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
