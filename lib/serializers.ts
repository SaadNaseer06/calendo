import type { Brand as PrismaBrand, Post as PrismaPost } from "@prisma/client";
import { parseJsonArray } from "@/lib/json";
import type { Brand, Post } from "@/types";
import type { Platform, PostStatus, PostType } from "@/lib/constants";

export function serializeBrand(b: PrismaBrand): Brand {
  return {
    id: b.id,
    name: b.name,
    niche: b.niche,
    description: b.description,
    brandVoice: b.brandVoice,
    contentPillars: parseJsonArray(b.contentPillars),
    platforms: parseJsonArray(b.platforms),
    logoUrl: b.logoUrl,
    websiteUrl: b.websiteUrl,
    ga4MeasurementId: b.ga4MeasurementId,
    ga4PropertyId: b.ga4PropertyId,
    userId: b.userId,
    createdAt: b.createdAt.toISOString(),
  };
}

export function serializePost(p: PrismaPost): Post {
  return {
    id: p.id,
    brandId: p.brandId,
    title: p.title,
    caption: p.caption,
    hashtags: parseJsonArray(p.hashtags),
    platforms: parseJsonArray(p.platforms) as Platform[],
    postType: p.postType as PostType,
    scheduledAt: p.scheduledAt.toISOString(),
    status: p.status as PostStatus,
    aiGenerated: p.aiGenerated,
    designerNote: p.designerNote,
    rationale: p.rationale,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
