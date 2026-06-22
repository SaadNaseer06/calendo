import { z } from "zod";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonResponse, jsonError } from "@/lib/api";

const schema = z.object({
  brandId: z.string(),
  month: z.number().min(1).max(12),
  year: z.number(),
});

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const body = schema.parse(await req.json());
    const brand = await prisma.brand.findFirst({
      where: { id: body.brandId, userId: session.user.id },
    });
    if (!brand) return jsonError("Brand not found", 404);

    const share = await prisma.shareToken.create({
      data: {
        brandId: body.brandId,
        month: body.month,
        year: body.year,
        expiresAt: addDays(new Date(), 30),
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return jsonResponse({
      token: share.token,
      url: `${baseUrl}/share/${share.token}`,
      expiresAt: share.expiresAt.toISOString(),
    });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Invalid request");
  }
}
