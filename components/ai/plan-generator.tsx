"use client";

import { useState } from "react";
import { setDate } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseApiResponse } from "@/lib/parse-api-response";
import type { Brand } from "@/types";
import type { GeneratedPlanPost, MonthlyPlan } from "@/types";

interface PlanGeneratorProps {
  brand: Brand;
  month: number;
  year: number;
  onSaved: () => void;
}

export function PlanGenerator({ brand, month, year, onSaved }: PlanGeneratorProps) {
  const [postsPerWeek, setPostsPerWeek] = useState(5);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<MonthlyPlan | null>(null);

  const generate = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const res = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: brand.id,
          niche: brand.niche,
          brandVoice: brand.brandVoice ?? "engaging",
          contentPillars: brand.contentPillars,
          platforms: brand.platforms,
          postsPerWeek,
          month,
          year,
        }),
      });
      const json = await parseApiResponse<MonthlyPlan>(res);
      if (!res.ok || json.error || !json.data) {
        throw new Error(json.error ?? `Request failed (${res.status})`);
      }
      setPlan(json.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    if (!plan) return;
    const posts = plan.posts.map((p: GeneratedPlanPost) => {
      const scheduled = setDate(new Date(year, month - 1, 1), p.day);
      scheduled.setHours(10, 0, 0, 0);
      return {
        title: p.title,
        caption: p.caption,
        hashtags: p.hashtags,
        platforms: p.platforms,
        postType: p.postType,
        scheduledAt: scheduled.toISOString(),
        status: "PLANNED",
        aiGenerated: true,
        designerNote: p.designerNote,
        rationale: p.rationale,
      };
    });

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: brand.id, month, year, posts }),
    });
    const json = (await res.json()) as { error: string | null };
    if (json.error) toast.error(json.error);
    else {
      toast.success("Plan saved to calendar");
      onSaved();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border border-[var(--cal-border)] bg-[var(--bg-surface)] p-6">
        <div>
          <Label>Posts per week: {postsPerWeek}</Label>
          <input
            type="range"
            min={3}
            max={7}
            step={1}
            value={postsPerWeek}
            onChange={(e) => setPostsPerWeek(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--accent-brand)]"
          />
        </div>
        <Button onClick={generate} disabled={loading}>
          {loading ? "Generating..." : "Generate Plan"}
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {plan && (
        <div className="space-y-4">
          {plan.trendInsights?.length > 0 && (
            <div className="rounded-lg border border-[var(--cal-border)] p-4">
              <h3 className="font-heading text-sm font-semibold">Trend insights</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-[var(--text-secondary)]">
                {plan.trendInsights.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {plan.posts.map((p) => (
              <Card key={p.day} className="border-[var(--cal-border)] bg-[var(--bg-elevated)]">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">
                    Day {p.day} — {p.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3 text-xs text-[var(--text-secondary)]">
                  <p className="line-clamp-2">{p.caption}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button onClick={saveAll}>Save All to Calendar</Button>
        </div>
      )}
    </div>
  );
}
