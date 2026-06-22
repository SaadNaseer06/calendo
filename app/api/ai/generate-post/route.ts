import { z } from "zod";
import { groqChat, parseGroqJson } from "@/lib/groq";
import { SINGLE_POST_PROMPT } from "@/lib/prompts";
import { requireSession, jsonResponse, jsonError } from "@/lib/api";
import type { SinglePostResult } from "@/types";

const schema = z.object({
  niche: z.string(),
  brandVoice: z.string().optional(),
  platform: z.string(),
  postType: z.string(),
  topic: z.string().optional(),
  tone: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const body = schema.parse(await req.json());
    const userMessage = `
Niche: ${body.niche}
Brand voice: ${body.brandVoice ?? "engaging and authentic"}
Platform: ${body.platform}
Post type: ${body.postType}
Topic: ${body.topic ?? "general brand content"}
Tone: ${body.tone ?? "balanced"}
`;

    const raw = await groqChat(SINGLE_POST_PROMPT, userMessage, 2048);
    const result = parseGroqJson<SinglePostResult>(raw);
    return jsonResponse(result);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to generate post", 500);
  }
}
