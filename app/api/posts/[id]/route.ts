import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonResponse, jsonError } from "@/lib/api";
import { stringifyJsonArray } from "@/lib/json";
import { serializePost } from "@/lib/serializers";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  caption: z.string().nullable().optional(),
  hashtags: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  postType: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.string().optional(),
  designerNote: z.string().nullable().optional(),
  rationale: z.string().nullable().optional(),
});

async function getOwnedPost(id: string, userId: string) {
  return prisma.post.findFirst({
    where: { id, brand: { userId } },
    include: { brand: true },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  const existing = await getOwnedPost(params.id, session.user.id);
  if (!existing) return jsonError("Post not found", 404);

  try {
    const body = updateSchema.parse(await req.json());
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.caption !== undefined ? { caption: body.caption } : {}),
        ...(body.postType !== undefined ? { postType: body.postType } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.designerNote !== undefined ? { designerNote: body.designerNote } : {}),
        ...(body.rationale !== undefined ? { rationale: body.rationale } : {}),
        ...(body.scheduledAt ? { scheduledAt: new Date(body.scheduledAt) } : {}),
        ...(body.hashtags ? { hashtags: stringifyJsonArray(body.hashtags) } : {}),
        ...(body.platforms ? { platforms: stringifyJsonArray(body.platforms) } : {}),
      },
    });
    return jsonResponse(serializePost(post));
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Invalid request");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  const existing = await getOwnedPost(params.id, session.user.id);
  if (!existing) return jsonError("Post not found", 404);

  await prisma.post.delete({ where: { id: params.id } });
  return jsonResponse({ deleted: true });
}
