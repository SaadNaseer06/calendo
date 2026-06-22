"use client";

import { Draggable } from "@hello-pangea/dnd";
import type { Post } from "@/types";
import { PLATFORM_COLORS, STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  index: number;
  onClick?: () => void;
}

export function PostCard({ post, index, onClick }: PostCardProps) {
  const borderColor =
    PLATFORM_COLORS[post.platforms[0] as keyof typeof PLATFORM_COLORS] ?? "#6366F1";
  const statusColor = STATUS_COLORS[post.status];

  return (
    <Draggable draggableId={post.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className={cn(
            "cursor-pointer rounded-md border border-[var(--cal-border)] bg-[var(--bg-elevated)] px-2 py-1.5 text-left text-xs transition-all",
            snapshot.isDragging && "opacity-80 shadow-lg",
            !snapshot.isDragging && "hover:-translate-y-0.5 hover:shadow-md"
          )}
          style={{ borderLeftWidth: 3, borderLeftColor: borderColor, ...provided.draggableProps.style }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            <span className="truncate font-medium text-[var(--text-primary)]">{post.title}</span>
          </div>
          <span className="mt-0.5 inline-block rounded bg-[var(--bg-surface)] px-1 text-[10px] text-[var(--text-secondary)]">
            {post.postType}
          </span>
        </div>
      )}
    </Draggable>
  );
}
