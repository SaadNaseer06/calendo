"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORMS, POST_TYPES } from "@/lib/constants";
import type { Brand, SinglePostResult } from "@/types";

interface PostGeneratorProps {
  brand: Brand;
  prefilledTopic?: string;
  onAddToCalendar: (result: SinglePostResult) => void;
}

export function PostGenerator({ brand, prefilledTopic, onAddToCalendar }: PostGeneratorProps) {
  const [platform, setPlatform] = useState(brand.platforms[0] ?? "INSTAGRAM");
  const [postType, setPostType] = useState("CAROUSEL");
  const [topic, setTopic] = useState(prefilledTopic ?? "");
  const [tone, setTone] = useState("engaging");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SinglePostResult | null>(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: brand.niche,
          brandVoice: brand.brandVoice,
          platform,
          postType,
          topic,
          tone,
        }),
      });
      const json = (await res.json()) as { data: SinglePostResult | null; error: string | null };
      if (json.error || !json.data) throw new Error(json.error ?? "Failed");
      setResult(json.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-[var(--cal-border)] bg-[var(--bg-surface)] p-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Post type</Label>
          <Select value={postType} onValueChange={(v) => v && setPostType(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {POST_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Topic / keyword</Label>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Optional" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Tone</Label>
          <Input value={tone} onChange={(e) => setTone(e.target.value)} />
        </div>
        <Button onClick={generate} disabled={loading} className="md:col-span-2">
          {loading ? "Generating..." : "Generate Post"}
        </Button>
      </div>

      {result && (
        <Card className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
          <CardHeader>
            <CardTitle className="font-heading">{result.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--text-secondary)]">
            <p className="whitespace-pre-wrap text-[var(--text-primary)]">{result.caption}</p>
            <p>{result.hashtags.join(" ")}</p>
            <p><strong>Designer:</strong> {result.designerNote}</p>
            <p><strong>Best time:</strong> {result.bestTimeToPost}</p>
            <Button onClick={() => onAddToCalendar(result)}>Add to Calendar</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
