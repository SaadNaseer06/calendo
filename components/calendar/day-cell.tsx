"use client";

import { Droppable } from "@hello-pangea/dnd";
import { format, isSameMonth, isToday } from "date-fns";
import type { Post } from "@/types";
import { PostCard } from "@/components/calendar/post-card";
import { cn } from "@/lib/utils";

interface DayCellProps {
  date: Date;
  month: Date;
  posts: Post[];
  onDayClick: (date: Date) => void;
  onPostClick: (post: Post) => void;
}

export function DayCell({ date, month, posts, onDayClick, onPostClick }: DayCellProps) {
  const dayId = format(date, "yyyy-MM-dd");
  const inMonth = isSameMonth(date, month);
  const visible = posts.slice(0, 3);
  const overflow = posts.length - visible.length;

  return (
    <Droppable droppableId={dayId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          onClick={() => onDayClick(date)}
          className={cn(
            "min-h-[100px] border border-[var(--cal-border)] p-1.5 transition",
            inMonth ? "bg-[var(--bg-surface)]" : "bg-[var(--bg-base)]/50 opacity-50",
            snapshot.isDraggingOver && "bg-[var(--accent-glow)]",
            isToday(date) && "ring-1 ring-[var(--accent-brand)]"
          )}
        >
          <div className="mb-1 flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-medium",
                isToday(date) ? "text-[var(--accent-brand)]" : "text-[var(--text-secondary)]"
              )}
            >
              {format(date, "d")}
            </span>
          </div>
          <div className="space-y-1">
            {visible.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} onClick={() => onPostClick(post)} />
            ))}
            {overflow > 0 && (
              <p className="text-center text-[10px] text-[var(--text-secondary)]">+{overflow} more</p>
            )}
          </div>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}
