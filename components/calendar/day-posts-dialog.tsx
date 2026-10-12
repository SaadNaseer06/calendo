"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, type PostStatus } from "@/lib/constants";
import type { Post } from "@/types";

interface DayPostsDialogProps {
  date: Date | null;
  posts: Post[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostClick: (post: Post) => void;
}

export function DayPostsDialog({
  date,
  posts,
  open,
  onOpenChange,
  onPostClick,
}: DayPostsDialogProps) {
  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--cal-border)] bg-[var(--bg-surface)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {format(date, "EEEE, MMMM d")}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {posts.map((post) => {
            const statusColor = STATUS_COLORS[post.status as PostStatus];
            return (
              <button
                key={post.id}
                type="button"
                onClick={() => {
                  onPostClick(post);
                  onOpenChange(false);
                }}
                className="flex w-full items-start justify-between gap-3 rounded-lg border border-[var(--cal-border)] px-3 py-2.5 text-left transition hover:border-[var(--accent-brand)]/40 hover:bg-[var(--bg-elevated)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                    {post.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {format(new Date(post.scheduledAt), "h:mm a")} · {post.postType}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: `${statusColor}22`,
                    color: statusColor,
                  }}
                >
                  {post.status}
                </Badge>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
