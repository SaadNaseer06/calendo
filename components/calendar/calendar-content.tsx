"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { addMonths, format, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { DayPostsDialog } from "@/components/calendar/day-posts-dialog";
import { PostDrawer } from "@/components/calendar/post-drawer";
import { useBrand } from "@/components/brand-provider";
import { PLATFORMS, STATUSES, type PostStatus } from "@/lib/constants";
import type { Post } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CalendarContent() {
  const { activeBrand } = useBrand();
  const searchParams = useSearchParams();
  const postIdParam = searchParams.get("postId");
  const [month, setMonth] = useState(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Partial<Post> | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<PostStatus | "ALL">("ALL");
  const [platformFilter, setPlatformFilter] = useState<string>("ALL");
  const [overflowDate, setOverflowDate] = useState<Date | null>(null);
  const [overflowPosts, setOverflowPosts] = useState<Post[]>([]);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const queryClient = useQueryClient();

  const m = month.getMonth() + 1;
  const y = month.getFullYear();

  const { data: posts = [], refetch } = useQuery({
    queryKey: ["posts", activeBrand?.id, m, y],
    queryFn: async () => {
      if (!activeBrand) return [];
      const res = await fetch(`/api/posts?brandId=${activeBrand.id}&month=${m}&year=${y}`);
      const json = (await res.json()) as { data: Post[] | null };
      return json.data ?? [];
    },
    enabled: !!activeBrand,
  });

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (platformFilter !== "ALL" && !p.platforms.includes(platformFilter as Post["platforms"][number])) {
        return false;
      }
      return true;
    });
  }, [posts, statusFilter, platformFilter]);

  useEffect(() => {
    if (!postIdParam || !posts.length) return;
    const match = posts.find((p) => p.id === postIdParam);
    if (match) {
      setSelectedPost(match);
      setDefaultDate(undefined);
      setDrawerOpen(true);
    }
  }, [postIdParam, posts]);

  const openNew = (date: Date) => {
    setSelectedPost(null);
    setDefaultDate(date);
    setDrawerOpen(true);
  };

  const openEdit = (post: Post) => {
    setSelectedPost(post);
    setDefaultDate(undefined);
    setDrawerOpen(true);
  };

  const openOverflow = (date: Date, dayPosts: Post[]) => {
    setOverflowDate(date);
    setOverflowPosts(dayPosts);
    setOverflowOpen(true);
  };

  const reschedule = async (postId: string, newDate: Date) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: newDate.toISOString() }),
      });
      const json = (await res.json()) as { error: string | null };
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed to reschedule");
      void refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reschedule");
      void refetch();
    }
  };

  const exportCsv = () => {
    if (!activeBrand) return;
    window.open(`/api/export/csv?brandId=${activeBrand.id}&month=${m}&year=${y}`, "_blank");
  };

  const shareLink = async () => {
    if (!activeBrand) return;
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: activeBrand.id, month: m, year: y }),
    });
    const json = (await res.json()) as { data: { url: string } | null; error: string | null };
    if (json.data?.url) {
      void navigator.clipboard.writeText(json.data.url);
      toast.success("Share link copied");
    } else toast.error(json.error ?? "Failed");
  };

  if (!activeBrand) {
    return (
      <div className="flex flex-1 flex-col">
        <Topbar title="Calendar" />
        <div className="flex flex-1 items-center justify-center text-[var(--text-secondary)]">
          <Link href="/brands" className="text-[var(--accent-brand)] hover:underline">
            Create a brand
          </Link>{" "}
          to use the calendar.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title="Calendar">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setMonth(subMonths(month, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[120px] text-center text-sm font-medium">
            {format(month, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Link href="/ai-studio">
            <Button size="sm" variant="secondary">
              AI Generate
            </Button>
          </Link>
          <Button size="sm" variant="secondary" onClick={exportCsv}>
            <Download className="mr-1 h-3 w-3" /> CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={shareLink}>
            <Share2 className="mr-1 h-3 w-3" /> Share
          </Button>
        </div>
      </Topbar>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--cal-border)] px-4 py-2">
        <span className="text-xs font-medium text-[var(--text-secondary)]">Status:</span>
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs transition",
            statusFilter === "ALL"
              ? "border-[var(--accent-brand)] bg-[var(--accent-glow)] text-[var(--accent-brand)]"
              : "border-[var(--cal-border)] text-[var(--text-secondary)]"
          )}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs transition",
              statusFilter === s
                ? "border-[var(--accent-brand)] bg-[var(--accent-glow)] text-[var(--accent-brand)]"
                : "border-[var(--cal-border)] text-[var(--text-secondary)]"
            )}
          >
            {s}
          </button>
        ))}
        <span className="ml-2 text-xs font-medium text-[var(--text-secondary)]">Platform:</span>
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="rounded-md border border-[var(--cal-border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-xs text-[var(--text-primary)]"
        >
          <option value="ALL">All</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <CalendarGrid
          month={month}
          posts={filteredPosts}
          onDayClick={openNew}
          onPostClick={openEdit}
          onReschedule={reschedule}
          onOverflowClick={openOverflow}
        />
      </div>

      <DayPostsDialog
        date={overflowDate}
        posts={overflowPosts}
        open={overflowOpen}
        onOpenChange={setOverflowOpen}
        onPostClick={openEdit}
      />

      <PostDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        post={selectedPost}
        brandId={activeBrand.id}
        brand={activeBrand}
        defaultDate={defaultDate}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ["posts"] });
        }}
      />
    </div>
  );
}
