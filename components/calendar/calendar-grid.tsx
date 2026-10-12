"use client";

import { useMemo } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Post } from "@/types";
import { DayCell } from "@/components/calendar/day-cell";

interface CalendarGridProps {
  month: Date;
  posts: Post[];
  onDayClick: (date: Date) => void;
  onPostClick: (post: Post) => void;
  onReschedule: (postId: string, newDate: Date) => void;
  onOverflowClick?: (date: Date, posts: Post[]) => void;
}

export function CalendarGrid({
  month,
  posts,
  onDayClick,
  onPostClick,
  onReschedule,
  onOverflowClick,
}: CalendarGridProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of posts) {
      const key = format(new Date(post.scheduledAt), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(post);
      map.set(key, list);
    }
    return map;
  }, [posts]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const postId = result.draggableId;
    const destDay = result.destination.droppableId;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const old = new Date(post.scheduledAt);
    const [y, m, d] = destDay.split("-").map(Number);
    const newDate = new Date(y, m - 1, d, old.getHours(), old.getMinutes());
    if (!isSameDay(old, newDate)) onReschedule(postId, newDate);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-7 gap-0">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="border border-[var(--cal-border)] bg-[var(--bg-elevated)] py-2 text-center text-xs font-medium text-[var(--text-secondary)]"
          >
            {d}
          </div>
        ))}
        {days.map((date) => (
          <DayCell
            key={date.toISOString()}
            date={date}
            month={month}
            posts={postsByDay.get(format(date, "yyyy-MM-dd")) ?? []}
            onDayClick={onDayClick}
            onPostClick={onPostClick}
            onOverflowClick={onOverflowClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
