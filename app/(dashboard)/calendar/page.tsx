import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarContent } from "@/components/calendar/calendar-content";

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 flex-col p-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="mt-4 h-[400px] w-full" />
        </div>
      }
    >
      <CalendarContent />
    </Suspense>
  );
}
