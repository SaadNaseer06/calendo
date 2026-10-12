import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonResponse, jsonError } from "@/lib/api";
import { stringifyJsonArray } from "@/lib/json";
import { serializeBrand } from "@/lib/serializers";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  niche: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  brandVoice: z.string().nullable().optional(),
  contentPillars: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  logoUrl: z.string().nullable().optional(),
  websiteUrl: z.union([z.string().url(), z.literal("")]).nullable().optional(),
  ga4MeasurementId: z.string().nullable().optional(),
  ga4PropertyId: z.string().nullable().optional(),
});

async function getOwnedBrand(id: string, userId: string) {
  return prisma.brand.findFirst({ where: { id, userId } });
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  const brand = await getOwnedBrand(params.id, session.user.id);
  if (!brand) return jsonError("Brand not found", 404);
  return jsonResponse(serializeBrand(brand));
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  const existing = await getOwnedBrand(params.id, session.user.id);
  if (!existing) return jsonError("Brand not found", 404);

  try {
    const body = updateSchema.parse(await req.json());
    const brand = await prisma.brand.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.niche !== undefined ? { niche: body.niche } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.brandVoice !== undefined ? { brandVoice: body.brandVoice } : {}),
        ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl } : {}),
        ...(body.websiteUrl !== undefined ? { websiteUrl: body.websiteUrl || null } : {}),
        ...(body.ga4MeasurementId !== undefined
          ? { ga4MeasurementId: body.ga4MeasurementId || null }
          : {}),
        ...(body.ga4PropertyId !== undefined ? { ga4PropertyId: body.ga4PropertyId || null } : {}),
        ...(body.contentPillars
          ? { contentPillars: stringifyJsonArray(body.contentPillars) }
          : {}),
        ...(body.platforms ? { platforms: stringifyJsonArray(body.platforms) } : {}),
      },
    });
    return jsonResponse(serializeBrand(brand));
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

  const existing = await getOwnedBrand(params.id, session.user.id);
  if (!existing) return jsonError("Brand not found", 404);

  await prisma.brand.delete({ where: { id: params.id } });
  return jsonResponse({ deleted: true });
}
