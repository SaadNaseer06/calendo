import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/lib/site-routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
