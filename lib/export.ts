import Papa from "papaparse";
import type { Post } from "@/types";
import { format } from "date-fns";

export function postsToCsv(posts: Post[]): string {
  const rows = posts.map((p) => ({
    Date: format(new Date(p.scheduledAt), "yyyy-MM-dd HH:mm"),
    Title: p.title,
    Caption: p.caption ?? "",
    Hashtags: p.hashtags.join(" "),
    Platforms: p.platforms.join(", "),
    "Post Type": p.postType,
    Status: p.status,
    "Designer Note": p.designerNote ?? "",
  }));
  return Papa.unparse(rows);
}

export function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
