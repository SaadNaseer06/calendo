"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrand } from "@/components/brand-provider";
import { STATUS_COLORS } from "@/lib/constants";
import type { Post } from "@/types";

export default function DashboardPage() {
  const { activeBrand, loading: brandsLoading } = useBrand();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", activeBrand?.id, month, year],
    queryFn: async () => {
      if (!activeBrand) return [];
      const res = await fetch(
        `/api/posts?brandId=${activeBrand.id}&month=${month}&year=${year}`
      );
      const json = (await res.json()) as { data: Post[] | null };
      return json.data ?? [];
    },
    enabled: !!activeBrand,
  });

  const statusCounts = (posts ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
    fill: STATUS_COLORS[name as keyof typeof STATUS_COLORS] ?? "#6366F1",
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
        <div className="p-6"><Skeleton className="h-40 w-full" /></div>
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
              <p className="text-[var(--text-secondary)]">Create your first brand to get started.</p>
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
        <Link href="/ai-studio">
          <Button size="sm">Generate AI Plan</Button>
        </Link>
      </Topbar>
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
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
              <CardTitle className="text-sm text-[var(--text-secondary)]">Active brand</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-xl font-bold">{activeBrand.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">{activeBrand.niche}</p>
            </CardContent>
          </Card>
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[var(--text-secondary)]">Period</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-xl font-bold">{format(now, "MMMM yyyy")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
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
          <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader>
              <CardTitle className="font-heading text-base">Posts by platform</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
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

        <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
          <CardHeader>
            <CardTitle className="font-heading text-base">Recent posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(posts ?? []).slice(-5).reverse().map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-[var(--cal-border)] px-3 py-2 text-sm"
              >
                <span>{p.title}</span>
                <span className="text-[var(--text-secondary)]">
                  {format(new Date(p.scheduledAt), "MMM d")} · {p.status}
                </span>
              </div>
            ))}
            {!posts?.length && (
              <p className="text-sm text-[var(--text-secondary)]">No activity yet. Open the calendar to add posts.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
