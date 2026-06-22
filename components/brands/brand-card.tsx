"use client";

import Link from "next/link";
import type { Brand } from "@/types";
import { PLATFORM_COLORS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const platformLabels: Record<string, string> = {
  INSTAGRAM: "IG",
  LINKEDIN: "IN",
  FACEBOOK: "FB",
  TWITTER: "X",
  TIKTOK: "TT",
};

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)] transition hover:border-[var(--accent-brand)]/40">
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-heading text-lg">
          {brand.name}
          <Badge variant="secondary" className="font-normal">
            {brand.niche}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {brand.brandVoice && (
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
            Voice: {brand.brandVoice}
          </p>
        )}
        <div className="flex gap-2">
          {brand.platforms.map((p) => {
            const color = PLATFORM_COLORS[p as keyof typeof PLATFORM_COLORS];
            const label = platformLabels[p] ?? p.slice(0, 2);
            return (
              <div
                key={p}
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                style={{ backgroundColor: `${color}22`, color }}
              >
                {label}
              </div>
            );
          })}
        </div>
        <Link
          href={`/brands/${brand.id}/settings`}
          className="text-sm text-[var(--accent-brand)] hover:underline"
        >
          Settings →
        </Link>
      </CardContent>
    </Card>
  );
}
