import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonResponse, jsonError } from "@/lib/api";
import { stringifyJsonArray } from "@/lib/json";
import { serializePost } from "@/lib/serializers";

const createSchema = z.object({
  brandId: z.string(),
  title: z.string().min(1),
  caption: z.string().optional(),
  hashtags: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  postType: z.string(),
  scheduledAt: z.string().datetime(),
  status: z.string().default("IDEA"),
  aiGenerated: z.boolean().default(false),
  designerNote: z.string().optional(),
  rationale: z.string().optional(),
});

const postItemSchema = z.object({
  title: z.string().min(1),
  caption: z.string().optional(),
  hashtags: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  postType: z.string(),
  scheduledAt: z.string().datetime(),
  status: z.string().default("IDEA"),
  aiGenerated: z.boolean().default(false),
  designerNote: z.string().optional(),
  rationale: z.string().optional(),
});

const bulkSchema = z.object({
  brandId: z.string(),
  posts: z.array(postItemSchema),
});

export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!brandId) return jsonError("brandId is required");

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, userId: session.user.id },
  });
  if (!brand) return jsonError("Brand not found", 404);

  const where: {
    brandId: string;
    scheduledAt?: { gte: Date; lte: Date };
  } = { brandId };

  if (month && year) {
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);
    where.scheduledAt = { gte: start, lte: end };
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
  });

  return jsonResponse(posts.map(serializePost));
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const json = await req.json();

    if (json.posts && Array.isArray(json.posts)) {
      const body = bulkSchema.parse(json);
      const brand = await prisma.brand.findFirst({
        where: { id: body.brandId, userId: session.user.id },
      });
      if (!brand) return jsonError("Brand not found", 404);

      const created = await prisma.$transaction(
        body.posts.map((p) =>
          prisma.post.create({
            data: {
              brandId: body.brandId,
              title: p.title,
              caption: p.caption,
              hashtags: stringifyJsonArray(p.hashtags),
              platforms: stringifyJsonArray(p.platforms),
              postType: p.postType,
              scheduledAt: new Date(p.scheduledAt),
              status: p.status,
              aiGenerated: p.aiGenerated,
              designerNote: p.designerNote,
              rationale: p.rationale,
            },
          })
        )
      );
      return jsonResponse(created.map(serializePost), 201);
    }

    const body = createSchema.parse(json);
    const brand = await prisma.brand.findFirst({
      where: { id: body.brandId, userId: session.user.id },
    });
    if (!brand) return jsonError("Brand not found", 404);

    const post = await prisma.post.create({
      data: {
        brandId: body.brandId,
        title: body.title,
        caption: body.caption,
        hashtags: stringifyJsonArray(body.hashtags),
        platforms: stringifyJsonArray(body.platforms),
        postType: body.postType,
        scheduledAt: new Date(body.scheduledAt),
        status: body.status,
        aiGenerated: body.aiGenerated,
        designerNote: body.designerNote,
        rationale: body.rationale,
      },
    });
    return jsonResponse(serializePost(post), 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Invalid request");
  }
}
