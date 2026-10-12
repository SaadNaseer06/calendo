export type SeoCheckStatus = "pass" | "warn" | "fail";

export interface SeoCheck {
  id: string;
  label: string;
  status: SeoCheckStatus;
  message: string;
  recommendation?: string;
}

export interface SeoPageAudit {
  url: string;
  score: number;
  checks: SeoCheck[];
  fetchedAt: string;
}

export interface SeoSiteAudit {
  baseUrl: string;
  overallScore: number;
  pages: SeoPageAudit[];
  summary: {
    pass: number;
    warn: number;
    fail: number;
  };
  auditedAt: string;
}

export interface WebsiteTrafficDay {
  date: string;
  sessions: number;
  users: number;
  pageViews: number;
}

export interface WebsiteTrafficReport {
  source: "ga4" | "unconfigured";
  propertyId: string | null;
  days: WebsiteTrafficDay[];
  totals: {
    sessions: number;
    users: number;
    pageViews: number;
  };
  topPages: { path: string; views: number }[];
  message?: string;
}

export interface WebsiteAnalyticsOverview {
  websiteUrl: string | null;
  ga4MeasurementId: string | null;
  ga4PropertyId: string | null;
  ga4Configured: boolean;
  traffic: WebsiteTrafficReport;
  seo: SeoSiteAudit | null;
  lastSnapshotAt: string | null;
}
