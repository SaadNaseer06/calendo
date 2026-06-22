"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Brand, TrendItem } from "@/types";

interface TrendScoutProps {
  brand: Brand;
  onUseTrend: (topic: string) => void;
}

export function TrendScout({ brand, onUseTrend }: TrendScoutProps) {
  const [loading, setLoading] = useState(true);
  const [googleTrends, setGoogleTrends] = useState<string[]>([]);
  const [redditTrends, setRedditTrends] = useState<string[]>([]);
  const [trends, setTrends] = useState<TrendItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/trends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            niche: brand.niche,
            brandVoice: brand.brandVoice,
          }),
        });
        const json = (await res.json()) as {
          data: {
            googleTrends: string[];
            redditTrends: string[];
            analysis: { trends: TrendItem[] };
          } | null;
          error: string | null;
        };
        if (json.error || !json.data) throw new Error(json.error ?? "Failed");
        setGoogleTrends(json.data.googleTrends);
        setRedditTrends(json.data.redditTrends);
        setTrends(json.data.analysis.trends);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load trends");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [brand]);

  const urgencyBadge = (u: TrendItem["urgency"]) => {
    if (u === "hot") return "🔥 Hot";
    if (u === "warm") return "🌡 Warm";
    return "🌿 Evergreen";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--cal-border)] p-4">
          <h3 className="font-heading text-sm font-semibold">Google Trends</h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
            {googleTrends.map((t) => (
              <li key={t}>• {t}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--cal-border)] p-4">
          <h3 className="font-heading text-sm font-semibold">Reddit ({brand.niche})</h3>
          <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
            {redditTrends.map((t) => (
              <li key={t} className="line-clamp-1">• {t}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="space-y-3">
        {trends.map((t) => (
          <div
            key={t.topic}
            className="rounded-xl border border-[var(--cal-border)] bg-[var(--bg-surface)] p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t.topic}</Badge>
              <Badge variant="secondary">{urgencyBadge(t.urgency)}</Badge>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{t.why}</p>
            <p className="mt-1 text-sm text-[var(--text-primary)]">{t.howToUse}</p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onClick={() => onUseTrend(t.topic)}
            >
              Use This Trend →
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
