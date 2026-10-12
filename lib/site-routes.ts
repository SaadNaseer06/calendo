import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Public routes included in sitemap and SEO audits */
export const PUBLIC_SITE_ROUTES = ["/login"] as const;

/** App routes audited for technical SEO (noindex dashboard — still checked for metadata) */
export const APP_SITE_ROUTES = [
  "/login",
  "/dashboard",
  "/calendar",
  "/ai-studio",
  "/brands",
  "/analytics",
] as const;

export function getSiteBaseUrl(): string {
  return baseUrl.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteBaseUrl()}${normalized}`;
}

export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_SITE_ROUTES.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === "/login" ? "monthly" : "weekly",
    priority: path === "/login" ? 1 : 0.7,
  }));
}
