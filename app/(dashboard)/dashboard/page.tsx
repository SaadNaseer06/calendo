"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, isWithinInterval, startOfDay } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Calendar, Sparkles } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useBrand } from "@/components/brand-provider";
import { STATUS_COLORS, type PostStatus } from "@/lib/constants";
import type { Post } from "@/types";

export default function DashboardPage() {
  const { activeBrand, loading: brandsLoading } = useBrand();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const weekEnd = addDays(startOfDay(now), 7);

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["posts", activeBrand?.id, month, year],
    queryFn: async () => {
      if (!activeBrand) return [];
      const res = await fetch(
        `/api/posts?brandId=${activeBrand.id}&month=${month}&year=${year}`
      );
      const json = (await res.json()) as { data: Post[] | null; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to load posts");
      return json.data ?? [];
    },
    enabled: !!activeBrand,
  });

  const upcoming = (posts ?? [])
    .filter((p) => {
      const d = new Date(p.scheduledAt);
      return isWithinInterval(d, { start: startOfDay(now), end: weekEnd }) && p.status !== "PUBLISHED";
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const needsAttention = (posts ?? []).filter((p) =>
    ["IDEA", "DESIGNING"].includes(p.status)
  ).length;

  const statusCounts = (posts ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    fill: STATUS_COLORS[name as PostStatus] ?? "#6366F1",
  }));

  const platformCounts = (posts ?? []).reduce<Record<string, number>>((acc, p) => {
    for (const pl of p.platforms) acc[pl] = (acc[pl] ?? 0) + 1;
    return acc;
  }, {});

  const platformData = Object.entries(platformCounts).map(([name, count]) => ({
    name,
    count,
  }));

  if (brandsLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <Topbar title="Dashboard" />
        <div className="p-6">
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!activeBrand) {
    return (
      <div className="flex flex-1 flex-col">
        <Topbar title="Dashboard" />
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="max-w-md border-[var(--cal-border)] bg-[var(--bg-surface)] p-8 text-center">
            <CardTitle className="font-heading">Welcome to Calendo</CardTitle>
            <CardContent className="mt-4 space-y-4 p-0">
              <p className="text-[var(--text-secondary)]">
                Create your first brand to start planning content.
              </p>
              <Link href="/brands">
                <Button>Create Brand</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Topbar title="Dashboard">
        <div className="flex gap-2">
          <Link href="/calendar">
            <Button size="sm" variant="secondary">
              <Calendar className="mr-1 h-3 w-3" /> Calendar
            </Button>
          </Link>
          <Link href="/ai-studio">
            <Button size="sm">
              <Sparkles className="mr-1 h-3 w-3" /> AI Studio
            </Button>
          </Link>
        </div>
      </Topbar>
      <div className="space-y-6 p-6">
        {isError && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="py-4 text-sm text-red-400">
              Could not load posts. Try refreshing the page.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">Posts this month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                {isLoading ? "—" : (posts?.length ?? 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">Due this week</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                {isLoading ? "—" : upcoming.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">Needs attention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-3xl font-bold">
                {isLoading ? "—" : needsAttention}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">IDEA or DESIGNING</p>
            </CardContent>
          </Card>
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">Active brand</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-xl font-bold">{activeBrand.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">{activeBrand.niche}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader>
              <CardTitle className="font-heading text-base">Upcoming this week</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">
                  No posts scheduled this week.{" "}
                  <Link href="/ai-studio" className="text-[var(--accent-brand)] hover:underline">
                    Generate some
                  </Link>
                </p>
              ) : (
                upcoming.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    href={`/calendar?postId=${p.id}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--cal-border)] px-3 py-2 text-sm transition hover:border-[var(--accent-brand)]/40 hover:bg-[var(--bg-elevated)]"
                  >
                    <span className="truncate">{p.title}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{p.status}</Badge>
                      <span className="text-[var(--text-secondary)]">
                        {format(new Date(p.scheduledAt), "EEE MMM d")}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader>
              <CardTitle className="font-heading text-base">Posts by status</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              {statusData.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">No posts yet</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
          <CardHeader>
            <CardTitle className="font-heading text-base">Posts by platform</CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            {platformData.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No posts yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData}>
                  <XAxis dataKey="name" tick={{ fill: "#8896B3", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#8896B3", fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
