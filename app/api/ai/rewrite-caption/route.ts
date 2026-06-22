import { z } from "zod";
import { groqChat, parseGroqJson } from "@/lib/groq";
import { CAPTION_REWRITE_PROMPT } from "@/lib/prompts";
import { requireSession, jsonResponse, jsonError } from "@/lib/api";
import type { CaptionRewriteResult } from "@/types";

const schema = z.object({
  caption: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const body = schema.parse(await req.json());
    const raw = await groqChat(CAPTION_REWRITE_PROMPT, body.caption, 2048);
    const result = parseGroqJson<CaptionRewriteResult>(raw);
    return jsonResponse(result);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to rewrite caption", 500);
  }
}
