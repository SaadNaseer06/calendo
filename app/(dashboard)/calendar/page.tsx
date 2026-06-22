"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addMonths, format, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { PostDrawer } from "@/components/calendar/post-drawer";
import { useBrand } from "@/components/brand-provider";
import type { Post } from "@/types";
import Link from "next/link";

export default function CalendarPage() {
  const { activeBrand } = useBrand();
  const [month, setMonth] = useState(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Partial<Post> | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();
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

  const reschedule = async (postId: string, newDate: Date) => {
    await fetch(`/api/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: newDate.toISOString() }),
    });
    void refetch();
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
          <Link href="/brands" className="text-[var(--accent-brand)] hover:underline">Create a brand</Link> to use the calendar.
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
            <Button size="sm" variant="secondary">AI Generate</Button>
          </Link>
          <Button size="sm" variant="secondary" onClick={exportCsv}>
            <Download className="mr-1 h-3 w-3" /> CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={shareLink}>
            <Share2 className="mr-1 h-3 w-3" /> Share
          </Button>
        </div>
      </Topbar>
      <div className="flex-1 overflow-auto p-4">
        <CalendarGrid
          month={month}
          posts={posts}
          onDayClick={openNew}
          onPostClick={openEdit}
          onReschedule={reschedule}
        />
      </div>
      <PostDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        post={selectedPost}
        brandId={activeBrand.id}
        defaultDate={defaultDate}
        onSaved={() => {
          void queryClient.invalidateQueries({ queryKey: ["posts"] });
        }}
      />
    </div>
  );
}
