"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CaptionRewriteResult } from "@/types";

export function CaptionRewriter() {
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CaptionRewriteResult | null>(null);

  const rewrite = async () => {
    if (!caption.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/rewrite-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      });
      const json = (await res.json()) as { data: CaptionRewriteResult | null; error: string | null };
      if (json.error || !json.data) throw new Error(json.error ?? "Failed");
      setResults(json.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const tones = results
    ? [
        { key: "professional", label: "Professional", text: results.professional },
        { key: "casual", label: "Casual", text: results.casual },
        { key: "viral", label: "Viral", text: results.viral },
        { key: "storytelling", label: "Storytelling", text: results.storytelling },
      ]
    : [];

  return (
    <div className="space-y-6">
      <Textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Paste your caption..."
        rows={5}
        className="bg-[var(--bg-surface)]"
      />
      <Button onClick={rewrite} disabled={loading || !caption.trim()}>
        {loading ? "Rewriting..." : "Rewrite Caption"}
      </Button>
      <div className="grid gap-4 md:grid-cols-2">
        {tones.map((t) => (
          <Card key={t.key} className="border-[var(--cal-border)] bg-[var(--bg-surface)]">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm font-heading">{t.label}</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => copy(t.text)}>
                Copy
              </Button>
            </CardHeader>
            <CardContent className="text-sm text-[var(--text-secondary)]">{t.text}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
