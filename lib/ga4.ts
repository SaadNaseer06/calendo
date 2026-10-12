import type { WebsiteTrafficDay, WebsiteTrafficReport } from "@/types/analytics";
import { subDays, format } from "date-fns";

interface Ga4Credentials {
  propertyId: string;
  clientEmail: string;
  privateKey: string;
}

function getGa4Credentials(): Ga4Credentials | null {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  const clientEmail = process.env.GA4_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();

  if (!propertyId || !clientEmail || !privateKey) return null;
  return { propertyId, clientEmail, privateKey };
}

function unconfiguredReport(message: string): WebsiteTrafficReport {
  return {
    source: "unconfigured",
    propertyId: process.env.GA4_PROPERTY_ID ?? null,
    days: [],
    totals: { sessions: 0, users: 0, pageViews: 0 },
    topPages: [],
    message,
  };
}

async function getAccessToken(creds: Ga4Credentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({
      iss: creds.clientEmail,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  ).toString("base64url");

  const crypto = await import("crypto");
  const signInput = `${header}.${claim}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(signInput)
    .sign(creds.privateKey, "base64url");

  const jwt = `${signInput}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`GA4 auth failed: ${err}`);
  }

  const json = (await tokenRes.json()) as { access_token: string };
  return json.access_token;
}

export function isGa4Configured(): boolean {
  return getGa4Credentials() !== null;
}

export async function fetchWebsiteTraffic(daysBack = 14): Promise<WebsiteTrafficReport> {
  const creds = getGa4Credentials();
  if (!creds) {
    return unconfiguredReport(
      "Connect Google Analytics 4 by adding GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, and GA4_PRIVATE_KEY to your environment. Add NEXT_PUBLIC_GA_MEASUREMENT_ID to start tracking Calendo traffic immediately."
    );
  }

  try {
    const token = await getAccessToken(creds);
    const startDate = format(subDays(new Date(), daysBack), "yyyy-MM-dd");
    const endDate = format(new Date(), "yyyy-MM-dd");

    const runReport = async (body: Record<string, unknown>) => {
      const res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${creds.propertyId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`GA4 report failed: ${err}`);
      }
      return res.json() as Promise<{
        rows?: { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] }[];
      }>;
    };

    const dailyReport = await runReport({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const days: WebsiteTrafficDay[] = (dailyReport.rows ?? []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? "";
      const formatted =
        rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;
      return {
        date: formatted,
        sessions: Number(row.metricValues?.[0]?.value ?? 0),
        users: Number(row.metricValues?.[1]?.value ?? 0),
        pageViews: Number(row.metricValues?.[2]?.value ?? 0),
      };
    });

    const topPagesReport = await runReport({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 8,
    });

    const topPages = (topPagesReport.rows ?? []).map((row) => ({
      path: row.dimensionValues?.[0]?.value ?? "/",
      views: Number(row.metricValues?.[0]?.value ?? 0),
    }));

    const totals = days.reduce(
      (acc, d) => ({
        sessions: acc.sessions + d.sessions,
        users: acc.users + d.users,
        pageViews: acc.pageViews + d.pageViews,
      }),
      { sessions: 0, users: 0, pageViews: 0 }
    );

    return {
      source: "ga4",
      propertyId: creds.propertyId,
      days,
      totals,
      topPages,
    };
  } catch (e) {
    return unconfiguredReport(e instanceof Error ? e.message : "Failed to load GA4 traffic");
  }
}
