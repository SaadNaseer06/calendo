"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Globe, RefreshCw, Search, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrand } from "@/components/brand-provider";
import type { SeoCheckStatus, WebsiteAnalyticsOverview } from "@/types/analytics";
import Link from "next/link";

function statusColor(status: SeoCheckStatus): string {
  if (status === "pass") return "#10B981";
  if (status === "warn") return "#F59E0B";
  return "#EF4444";
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div
      className="flex h-20 w-20 items-center justify-center rounded-full border-4 font-heading text-2xl font-bold"
      style={{ borderColor: color, color }}
    >
      {score}
    </div>
  );
}

export default function AnalyticsPage() {
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const [auditing, setAuditing] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics", activeBrand?.id],
    queryFn: async () => {
      if (!activeBrand) return null;
      const res = await fetch(`/api/analytics?brandId=${activeBrand.id}`);
      const json = (await res.json()) as { data: WebsiteAnalyticsOverview | null; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to load analytics");
      return json.data;
    },
    enabled: !!activeBrand,
  });

  const runAudit = async (scope: "app" | "website" | "both") => {
    if (!activeBrand) return;
    setAuditing(true);
    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: activeBrand.id, scope }),
      });
      const json = (await res.json()) as { data: WebsiteAnalyticsOverview | null; error?: string };
      if (!res.ok || !json.data) throw new Error(json.error ?? "Audit failed");
      queryClient.setQueryData(["analytics", activeBrand.id], json.data);
      toast.success("SEO audit complete");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Audit failed");
    } finally {
      setAuditing(false);
    }
  };

  if (!activeBrand) {
    return (
      <div className="flex flex-1 flex-col">
        <Topbar title="Analytics" />
        <div className="flex flex-1 items-center justify-center text-[var(--text-secondary)]">
          <Link href="/brands" className="text-[var(--accent-brand)] hover:underline">
            Create a brand
          </Link>{" "}
          to view analytics.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Topbar title="Analytics">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={auditing}
            onClick={() => runAudit("both")}
          >
            <Search className="mr-1 h-3 w-3" />
            {auditing ? "Auditing..." : "Run SEO Audit"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={isLoading}
            onClick={() => void queryClient.invalidateQueries({ queryKey: ["analytics"] })}
          >
            <RefreshCw className="mr-1 h-3 w-3" /> Refresh
          </Button>
        </div>
      </Topbar>

      <div className="space-y-6 p-6">
        {isError && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="py-4 text-sm text-red-400">Could not load analytics.</CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">Sessions (14d)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                {isLoading ? "—" : data?.traffic.totals.sessions ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">Users (14d)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                {isLoading ? "—" : data?.traffic.totals.users ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">Page views (14d)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                {isLoading ? "—" : data?.traffic.totals.pageViews ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">SEO score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                {isLoading ? "—" : data?.seo?.overallScore ?? "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {data?.traffic.source === "unconfigured" && (
          <Card className="border-[var(--accent-brand)]/30 bg-[var(--accent-glow)]">
            <CardContent className="flex items-start gap-3 py-4 text-sm">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-brand)]" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">Website traffic not connected</p>
                <p className="mt-1 text-[var(--text-secondary)]">{data.traffic.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!data?.websiteUrl && (
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-[var(--accent-brand)]" />
                <div>
                  <p className="font-medium">Add your company website</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Set a website URL in brand settings to audit your live site SEO.
                  </p>
                </div>
              </div>
              <Link href={`/brands/${activeBrand.id}/settings`}>
                <Button size="sm">Brand Settings</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader>
              <CardTitle className="font-heading text-base">Website traffic</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : !data?.traffic.days.length ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  No traffic data yet. Connect GA4 to see sessions over time.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.traffic.days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: "#8896B3", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#8896B3", fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sessions" stroke="#6366F1" fill="#6366F133" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader>
              <CardTitle className="font-heading text-base">Top pages</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : !data?.traffic.topPages.length ? (
                <p className="text-sm text-[var(--text-secondary)]">No page data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.traffic.topPages} layout="vertical">
                    <XAxis type="number" tick={{ fill: "#8896B3", fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="path"
                      width={100}
                      tick={{ fill: "#8896B3", fontSize: 10 }}
                    />
                    <Tooltip />
                    <Bar dataKey="views" fill="#6366F1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              {data?.seo && <ScoreRing score={data.seo.overallScore} />}
              <div>
                <CardTitle className="font-heading text-base">SEO audit</CardTitle>
                <p className="text-sm text-[var(--text-secondary)]">
                  {data?.lastSnapshotAt
                    ? `Last run ${new Date(data.lastSnapshotAt).toLocaleString()}`
                    : "Run an audit to check Calendo and your website"}
                </p>
                {data?.seo && (
                  <div className="mt-2 flex gap-2">
                    <Badge variant="secondary">{data.seo.summary.pass} pass</Badge>
                    <Badge variant="secondary">{data.seo.summary.warn} warn</Badge>
                    <Badge variant="secondary">{data.seo.summary.fail} fail</Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={auditing} onClick={() => runAudit("app")}>
                Audit Calendo
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={auditing || !data?.websiteUrl}
                onClick={() => runAudit("website")}
              >
                Audit Website
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : !data?.seo ? (
              <p className="text-sm text-[var(--text-secondary)]">
                Click &quot;Run SEO Audit&quot; to analyze page titles, meta descriptions, headings, and more.
              </p>
            ) : (
              data.seo.pages.map((page) => (
                <div
                  key={page.url}
                  className="rounded-xl border border-[var(--cal-border)] bg-[var(--bg-elevated)] p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{page.url}</p>
                    <Badge style={{ backgroundColor: `${statusColor(page.score >= 80 ? "pass" : page.score >= 60 ? "warn" : "fail")}22` }}>
                      {page.score}/100
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {page.checks.map((check) => (
                      <div key={check.id} className="flex items-start gap-2 text-xs">
                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: statusColor(check.status) }}
                        />
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{check.label}</p>
                          <p className="text-[var(--text-secondary)]">{check.message}</p>
                          {check.recommendation && (
                            <p className="text-[var(--accent-brand)]">{check.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
