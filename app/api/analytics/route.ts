import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession, jsonResponse, jsonError } from "@/lib/api";
import { fetchWebsiteTraffic, isGa4Configured } from "@/lib/ga4";
import { auditCalendoApp, auditExternalWebsite } from "@/lib/seo-audit";
import type { WebsiteAnalyticsOverview } from "@/types/analytics";

const auditSchema = z.object({
  brandId: z.string(),
  scope: z.enum(["app", "website", "both"]).default("both"),
});

async function getOwnedBrand(id: string, userId: string) {
  return prisma.brand.findFirst({ where: { id, userId } });
}

export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  const brandId = new URL(req.url).searchParams.get("brandId");
  if (!brandId) return jsonError("brandId is required");

  const brand = await getOwnedBrand(brandId, session.user.id);
  if (!brand) return jsonError("Brand not found", 404);

  const latestSnapshot = await prisma.websiteSnapshot.findFirst({
    where: { brandId },
    orderBy: { capturedAt: "desc" },
  });

  const traffic = await fetchWebsiteTraffic();

  let seo = null;
  if (latestSnapshot) {
    try {
      seo = JSON.parse(latestSnapshot.seoReport) as WebsiteAnalyticsOverview["seo"];
    } catch {
      seo = null;
    }
  }

  const overview: WebsiteAnalyticsOverview = {
    websiteUrl: brand.websiteUrl,
    ga4MeasurementId: brand.ga4MeasurementId ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null,
    ga4PropertyId: brand.ga4PropertyId ?? process.env.GA4_PROPERTY_ID ?? null,
    ga4Configured: isGa4Configured() || !!brand.ga4PropertyId,
    traffic,
    seo,
    lastSnapshotAt: latestSnapshot?.capturedAt.toISOString() ?? null,
  };

  return jsonResponse(overview);
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const body = auditSchema.parse(await req.json());
    const brand = await getOwnedBrand(body.brandId, session.user.id);
    if (!brand) return jsonError("Brand not found", 404);

    const audits = [];

    if (body.scope === "app" || body.scope === "both") {
      audits.push(await auditCalendoApp());
    }

    if ((body.scope === "website" || body.scope === "both") && brand.websiteUrl) {
      audits.push(await auditExternalWebsite(brand.websiteUrl));
    }

    if (audits.length === 0) {
      return jsonError("Add a website URL in brand settings to audit your site.", 400);
    }

    const combined = audits.length === 1
      ? audits[0]
      : {
          baseUrl: brand.websiteUrl ?? audits[0].baseUrl,
          overallScore: Math.round(
            audits.reduce((sum, a) => sum + a.overallScore, 0) / audits.length
          ),
          pages: audits.flatMap((a) => a.pages),
          summary: audits.reduce(
            (acc, a) => ({
              pass: acc.pass + a.summary.pass,
              warn: acc.warn + a.summary.warn,
              fail: acc.fail + a.summary.fail,
            }),
            { pass: 0, warn: 0, fail: 0 }
          ),
          auditedAt: new Date().toISOString(),
        };

    const traffic = await fetchWebsiteTraffic();

    await prisma.websiteSnapshot.create({
      data: {
        brandId: brand.id,
        seoScore: combined.overallScore,
        seoReport: JSON.stringify(combined),
        trafficData: JSON.stringify(traffic),
      },
    });

    const overview: WebsiteAnalyticsOverview = {
      websiteUrl: brand.websiteUrl,
      ga4MeasurementId: brand.ga4MeasurementId ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null,
      ga4PropertyId: brand.ga4PropertyId ?? process.env.GA4_PROPERTY_ID ?? null,
      ga4Configured: isGa4Configured() || !!brand.ga4PropertyId,
      traffic,
      seo: combined,
      lastSnapshotAt: new Date().toISOString(),
    };

    return jsonResponse(overview);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Audit failed", 500);
  }
}
