"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Topbar } from "@/components/layout/topbar";
import { PlanGenerator } from "@/components/ai/plan-generator";
import { PostGenerator } from "@/components/ai/post-generator";
import { CaptionRewriter } from "@/components/ai/caption-rewriter";
import { TrendScout } from "@/components/ai/trend-scout";
import { PostDrawer } from "@/components/calendar/post-drawer";
import { useBrand } from "@/components/brand-provider";
import type { Platform } from "@/lib/constants";
import type { SinglePostResult } from "@/types";
import Link from "next/link";

export default function AiStudioPage() {
  const { activeBrand } = useBrand();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("plan");
  const [prefilledTopic, setPrefilledTopic] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<import("@/types").Post> | null>(null);
  const now = new Date();

  const invalidatePosts = () => {
    void queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const handleAddToCalendar = (result: SinglePostResult) => {
    setDraft({
      title: result.title,
      caption: result.caption,
      hashtags: result.hashtags,
      designerNote: result.designerNote,
      rationale: result.rationale,
      aiGenerated: true,
      postType: "STATIC",
      platforms: (activeBrand?.platforms ?? ["INSTAGRAM"]) as Platform[],
      status: "IDEA",
      scheduledAt: new Date().toISOString(),
    });
    setDrawerOpen(true);
  };

  if (!activeBrand) {
    return (
      <div className="flex flex-1 flex-col">
        <Topbar title="AI Studio" />
        <div className="flex flex-1 items-center justify-center text-[var(--text-secondary)]">
          <Link href="/brands" className="text-[var(--accent-brand)] hover:underline">
            Create a brand
          </Link>{" "}
          first.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Topbar title="AI Studio" />
      <div className="p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-[var(--bg-surface)]">
            <TabsTrigger value="plan">Monthly Plan</TabsTrigger>
            <TabsTrigger value="post">Single Post</TabsTrigger>
            <TabsTrigger value="caption">Caption Rewriter</TabsTrigger>
            <TabsTrigger value="trends">Trend Scout</TabsTrigger>
          </TabsList>
          <TabsContent value="plan" className="mt-6">
            <PlanGenerator
              brand={activeBrand}
              month={now.getMonth() + 1}
              year={now.getFullYear()}
              onSaved={invalidatePosts}
            />
          </TabsContent>
          <TabsContent value="post" className="mt-6">
            <PostGenerator
              brand={activeBrand}
              prefilledTopic={prefilledTopic}
              onAddToCalendar={handleAddToCalendar}
            />
          </TabsContent>
          <TabsContent value="caption" className="mt-6">
            <CaptionRewriter />
          </TabsContent>
          <TabsContent value="trends" className="mt-6">
            <TrendScout
              brand={activeBrand}
              onUseTrend={(topic) => {
                setPrefilledTopic(topic);
                setTab("post");
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
      <PostDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        post={draft}
        brandId={activeBrand.id}
        brand={activeBrand}
        onSaved={() => {
          setDraft(null);
          invalidatePosts();
        }}
      />
    </div>
  );
}
