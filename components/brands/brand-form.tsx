"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTENT_PILLARS, NICHES, PLATFORMS } from "@/lib/constants";
import type { Brand } from "@/types";
import { cn } from "@/lib/utils";

interface BrandFormProps {
  initial?: Partial<Brand>;
  onSubmit: (data: {
    name: string;
    niche: string;
    description?: string;
    brandVoice?: string;
    logoUrl?: string;
    websiteUrl?: string;
    ga4MeasurementId?: string;
    ga4PropertyId?: string;
    contentPillars: string[];
    platforms: string[];
  }) => Promise<void>;
  submitLabel?: string;
}

export function BrandForm({ initial, onSubmit, submitLabel = "Save Brand" }: BrandFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [niche, setNiche] = useState(initial?.niche ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [brandVoice, setBrandVoice] = useState(initial?.brandVoice ?? "");
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial?.websiteUrl ?? "");
  const [ga4MeasurementId, setGa4MeasurementId] = useState(initial?.ga4MeasurementId ?? "");
  const [ga4PropertyId, setGa4PropertyId] = useState(initial?.ga4PropertyId ?? "");
  const [pillars, setPillars] = useState<string[]>(initial?.contentPillars ?? []);
  const [platforms, setPlatforms] = useState<string[]>(initial?.platforms ?? []);
  const [loading, setLoading] = useState(false);

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name,
        niche,
        description: description || undefined,
        brandVoice: brandVoice || undefined,
        logoUrl: logoUrl || undefined,
        websiteUrl: websiteUrl || undefined,
        ga4MeasurementId: ga4MeasurementId || undefined,
        ga4PropertyId: ga4PropertyId || undefined,
        contentPillars: pillars,
        platforms,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Brand name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-[var(--bg-elevated)]" />
      </div>
      <div className="space-y-2">
        <Label>Niche</Label>
        <Select value={niche} onValueChange={(v) => v && setNiche(v)}>
          <SelectTrigger className="bg-[var(--bg-elevated)]">
            <SelectValue placeholder="Select niche" />
          </SelectTrigger>
          <SelectContent>
            {NICHES.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-[var(--bg-elevated)]" />
      </div>
      <div className="space-y-2">
        <Label>Brand voice</Label>
        <Input
          value={brandVoice}
          onChange={(e) => setBrandVoice(e.target.value)}
          placeholder="e.g. fun and witty"
          className="bg-[var(--bg-elevated)]"
        />
      </div>
      <div className="space-y-2">
        <Label>Logo URL (optional)</Label>
        <Input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
          className="bg-[var(--bg-elevated)]"
        />
      </div>
      <div className="space-y-2">
        <Label>Website URL</Label>
        <Input
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://yourcompany.com"
          className="bg-[var(--bg-elevated)]"
        />
      </div>
      <div className="space-y-2">
        <Label>GA4 Measurement ID (optional)</Label>
        <Input
          value={ga4MeasurementId}
          onChange={(e) => setGa4MeasurementId(e.target.value)}
          placeholder="G-XXXXXXXXXX"
          className="bg-[var(--bg-elevated)]"
        />
      </div>
      <div className="space-y-2">
        <Label>GA4 Property ID (optional)</Label>
        <Input
          value={ga4PropertyId}
          onChange={(e) => setGa4PropertyId(e.target.value)}
          placeholder="123456789"
          className="bg-[var(--bg-elevated)]"
        />
      </div>
      <div className="space-y-2">
        <Label>Content pillars</Label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_PILLARS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggle(pillars, p, setPillars)}
              className={cn(
                "rounded-full px-3 py-1 text-xs border transition",
                pillars.includes(p)
                  ? "border-[var(--accent-brand)] bg-[var(--accent-glow)] text-[var(--accent-brand)]"
                  : "border-[var(--cal-border)] text-[var(--text-secondary)]"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Platforms</Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggle(platforms, p, setPlatforms)}
              className={cn(
                "rounded-full px-3 py-1 text-xs border transition",
                platforms.includes(p)
                  ? "border-[var(--accent-brand)] bg-[var(--accent-glow)] text-[var(--accent-brand)]"
                  : "border-[var(--cal-border)] text-[var(--text-secondary)]"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={loading || !name || !niche} className="w-full">
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
