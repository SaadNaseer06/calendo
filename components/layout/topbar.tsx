"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrand } from "@/components/brand-provider";
import { Skeleton } from "@/components/ui/skeleton";

export function Topbar({ title, children }: { title: string; children?: React.ReactNode }) {
  const { brands, activeBrand, setActiveBrandId, loading } = useBrand();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--cal-border)] bg-[var(--bg-surface)] px-6">
      <h1 className="font-heading text-xl font-semibold text-[var(--text-primary)]">{title}</h1>
      <div className="flex items-center gap-3">
        {loading ? (
          <Skeleton className="h-9 w-40" />
        ) : brands.length > 0 ? (
          <Select value={activeBrand?.id ?? ""} onValueChange={(v) => v && setActiveBrandId(v)}>
            <SelectTrigger className="w-48 border-[var(--cal-border)] bg-[var(--bg-elevated)]">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        {children}
      </div>
    </header>
  );
}
