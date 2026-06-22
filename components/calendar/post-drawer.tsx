"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PLATFORMS,
  PLATFORM_COLORS,
  POST_TYPES,
  STATUSES,
  STATUS_COLORS,
  type Platform,
  type PostStatus,
} from "@/lib/constants";
import type { Post } from "@/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "border-[var(--cal-border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-none placeholder:text-[var(--text-secondary)]/70 focus-visible:border-[var(--accent-brand)] focus-visible:ring-2 focus-visible:ring-[var(--accent-glow)]";

const labelClass =
  "text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]";

interface PostDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Partial<Post> | null;
  brandId: string;
  defaultDate?: Date;
  onSaved: () => void;
}

function FieldGroup({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <Label className={labelClass}>{label}</Label>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  activeStyle,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeStyle?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? activeStyle : undefined}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "border-transparent shadow-sm"
          : "border-[var(--cal-border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]/40 hover:text-[var(--text-primary)]"
      )}
    >
      {children}
    </button>
  );
}

export function PostDrawer({
  open,
  onOpenChange,
  post,
  brandId,
  defaultDate,
  onSaved,
}: PostDrawerProps) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [postType, setPostType] = useState("STATIC");
  const [status, setStatus] = useState("IDEA");
  const [scheduledAt, setScheduledAt] = useState("");
  const [designerNote, setDesignerNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title ?? "");
      setCaption(post.caption ?? "");
      setHashtags(post.hashtags ?? []);
      setPlatforms(post.platforms ?? []);
      setPostType(post.postType ?? "STATIC");
      setStatus(post.status ?? "IDEA");
      setDesignerNote(post.designerNote ?? "");
      if (post.scheduledAt) {
        const d = new Date(post.scheduledAt);
        setScheduledAt(format(d, "yyyy-MM-dd'T'HH:mm"));
      } else if (defaultDate) {
        setScheduledAt(format(defaultDate, "yyyy-MM-dd'T'09:00"));
      }
    } else if (defaultDate) {
      setScheduledAt(format(defaultDate, "yyyy-MM-dd'T'09:00"));
      setTitle("");
      setCaption("");
      setHashtags([]);
      setPlatforms([]);
      setPostType("STATIC");
      setStatus("IDEA");
      setDesignerNote("");
    }
  }, [post, defaultDate, open]);

  const save = async () => {
    if (!title || !scheduledAt) {
      toast.error("Title and date are required");
      return;
    }
    setSaving(true);
    const payload = {
      brandId,
      title,
      caption,
      hashtags,
      platforms,
      postType,
      scheduledAt: new Date(scheduledAt).toISOString(),
      status,
      designerNote,
      aiGenerated: post?.aiGenerated ?? false,
      rationale: post?.rationale,
    };

    try {
      const res = await fetch(post?.id ? `/api/posts/${post.id}` : "/api/posts", {
        method: post?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error: string | null };
      if (json.error) throw new Error(json.error);
      toast.success("Post saved");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!post?.id) return;
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    const json = (await res.json()) as { error: string | null };
    if (json.error) toast.error(json.error);
    else {
      toast.success("Post deleted");
      onSaved();
      onOpenChange(false);
    }
  };

  const duplicate = async () => {
    if (!post?.id) return;
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brandId,
        title: `${title} (copy)`,
        caption,
        hashtags,
        platforms,
        postType,
        scheduledAt: new Date(scheduledAt).toISOString(),
        status: "IDEA",
        designerNote,
      }),
    });
    toast.success("Post duplicated");
    onSaved();
  };

  const regenerate = async () => {
    if (!brandId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ai/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: "general",
          platform: platforms[0] ?? "INSTAGRAM",
          postType,
          topic: title,
        }),
      });
      const json = (await res.json()) as {
        data: {
          title: string;
          caption: string;
          hashtags: string[];
          designerNote: string;
          rationale: string;
        } | null;
        error: string | null;
      };
      if (json.error || !json.data) throw new Error(json.error ?? "Failed");
      setTitle(json.data.title);
      setCaption(json.data.caption);
      setHashtags(json.data.hashtags);
      setDesignerNote(json.data.designerNote);
      toast.success("Regenerated with AI");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setSaving(false);
    }
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim();
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag.startsWith("#") ? tag : `#${tag}`]);
    }
    setHashtagInput("");
  };

  const togglePlatform = (p: string) => {
    setPlatforms(platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p]);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className={cn(
          "flex h-full w-full flex-col gap-0 border-l border-[var(--cal-border)] p-0 sm:max-w-xl",
          "bg-[var(--bg-surface)]/95 shadow-2xl backdrop-blur-xl"
        )}
      >
        {/* Header */}
        <SheetHeader className="shrink-0 space-y-0 border-b border-[var(--cal-border)] bg-[var(--bg-surface)]/90 px-6 py-5 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle className="font-heading text-xl font-bold tracking-tight text-[var(--text-primary)]">
                {post?.id ? "Edit Post" : "New Post"}
              </SheetTitle>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {post?.id ? "Update content and schedule" : "Add a post to your calendar"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-[var(--cal-border)] p-2 text-[var(--text-secondary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <FieldGroup label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(fieldClass, "h-10")}
              placeholder="Post headline..."
            />
          </FieldGroup>

          <FieldGroup label="Caption">
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={5}
              className={cn(fieldClass, "min-h-[120px] resize-y")}
              placeholder="Write your caption with emojis and CTA..."
            />
          </FieldGroup>

          <FieldGroup label="Platforms">
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const color = PLATFORM_COLORS[p as Platform];
                const active = platforms.includes(p);
                return (
                  <Chip
                    key={p}
                    active={active}
                    onClick={() => togglePlatform(p)}
                    activeStyle={{
                      backgroundColor: `${color}22`,
                      color,
                      borderColor: `${color}55`,
                    }}
                  >
                    {p}
                  </Chip>
                );
              })}
            </div>
          </FieldGroup>

          <FieldGroup label="Post type">
            <div className="flex flex-wrap gap-2">
              {POST_TYPES.map((t) => (
                <Chip
                  key={t}
                  active={postType === t}
                  onClick={() => setPostType(t)}
                  activeStyle={{
                    backgroundColor: "var(--accent-glow)",
                    color: "var(--accent-brand)",
                    borderColor: "var(--accent-brand)",
                  }}
                >
                  {t}
                </Chip>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label="Scheduled">
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className={cn(fieldClass, "h-10 [color-scheme:dark]")}
            />
          </FieldGroup>

          <FieldGroup label="Status">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const color = STATUS_COLORS[s as PostStatus];
                const active = status === s;
                return (
                  <Chip
                    key={s}
                    active={active}
                    onClick={() => setStatus(s)}
                    activeStyle={{
                      backgroundColor: `${color}22`,
                      color,
                      borderColor: `${color}66`,
                    }}
                  >
                    {s}
                  </Chip>
                );
              })}
            </div>
          </FieldGroup>

          <FieldGroup label="Designer note">
            <Textarea
              value={designerNote}
              onChange={(e) => setDesignerNote(e.target.value)}
              rows={3}
              className={cn(fieldClass, "resize-y")}
              placeholder="Visual direction for your designer..."
            />
          </FieldGroup>

          {post?.rationale && (
            <div className="rounded-xl border border-[var(--accent-brand)]/30 bg-[var(--accent-glow)] p-4">
              <p className={labelClass}>AI rationale</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
                {post.rationale}
              </p>
            </div>
          )}

          <FieldGroup label="Hashtags">
            <div className="flex gap-2">
              <Input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
                className={cn(fieldClass, "h-10 flex-1")}
                placeholder="#yourtag"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addHashtag}
                className="h-10 shrink-0 border-[var(--cal-border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-base)]"
              >
                Add
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {hashtags.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHashtags(hashtags.filter((x) => x !== h))}
                    className="rounded-full border border-[var(--accent-brand)]/30 bg-[var(--accent-glow)] px-2.5 py-1 text-xs font-medium text-[var(--accent-brand)] transition hover:border-[var(--accent-brand)]"
                  >
                    {h}
                    <span className="ml-1 opacity-60">×</span>
                  </button>
                ))}
              </div>
            )}
          </FieldGroup>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 border-t border-[var(--cal-border)] bg-[var(--bg-surface)]/95 px-6 py-4 backdrop-blur-md">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={save}
              disabled={saving}
              className="bg-[var(--accent-brand)] text-white hover:bg-[var(--accent-brand)]/90"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            {post?.id && (
              <>
                <Button
                  variant="secondary"
                  onClick={duplicate}
                  className="border-[var(--cal-border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                >
                  Duplicate
                </Button>
                <Button
                  variant="secondary"
                  onClick={regenerate}
                  disabled={saving}
                  className="border-[var(--cal-border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-[var(--accent-brand)]" />
                  Regenerate
                </Button>
                <Button variant="destructive" onClick={remove} className="ml-auto">
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
