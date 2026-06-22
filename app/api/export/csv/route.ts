import { prisma } from "@/lib/prisma";
import { requireSession, jsonError } from "@/lib/api";
import { serializePost } from "@/lib/serializers";
import { postsToCsv } from "@/lib/export";

export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!brandId || !month || !year) {
    return jsonError("brandId, month, and year are required");
  }

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, userId: session.user.id },
  });
  if (!brand) return jsonError("Brand not found", 404);

  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);

  const posts = await prisma.post.findMany({
    where: { brandId, scheduledAt: { gte: start, lte: end } },
    orderBy: { scheduledAt: "asc" },
  });

  const csv = postsToCsv(posts.map(serializePost));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="calendo-${y}-${m}.csv"`,
    },
  });
}
