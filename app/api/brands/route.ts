import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonResponse, jsonError } from "@/lib/api";
import { stringifyJsonArray } from "@/lib/json";
import { serializeBrand } from "@/lib/serializers";

const createSchema = z.object({
  name: z.string().min(1),
  niche: z.string().min(1),
  description: z.string().optional(),
  brandVoice: z.string().optional(),
  contentPillars: z.array(z.string()).default([]),
  platforms: z.array(z.string()).default([]),
  logoUrl: z.string().optional(),
});

export async function GET() {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  const brands = await prisma.brand.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return jsonResponse(brands.map(serializeBrand));
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const body = createSchema.parse(await req.json());
    const brand = await prisma.brand.create({
      data: {
        ...body,
        contentPillars: stringifyJsonArray(body.contentPillars),
        platforms: stringifyJsonArray(body.platforms),
        userId: session.user.id,
      },
    });
    return jsonResponse(serializeBrand(brand), 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Invalid request");
  }
}
