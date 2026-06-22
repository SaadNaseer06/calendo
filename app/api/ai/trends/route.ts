import { z } from "zod";
import { groqChat, parseGroqJson } from "@/lib/groq";
import { TREND_ANALYSIS_PROMPT } from "@/lib/prompts";
import { getGoogleTrends, getRedditTrends } from "@/lib/trends";
import { requireSession, jsonResponse, jsonError } from "@/lib/api";
import type { TrendAnalysis } from "@/types";

const schema = z.object({
  niche: z.string(),
  brandVoice: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const body = schema.parse(await req.json());
    const [google, reddit] = await Promise.all([
      getGoogleTrends(),
      getRedditTrends(body.niche),
    ]);

    const userMessage = `
Brand niche: ${body.niche}
Brand voice: ${body.brandVoice ?? "professional"}
Google Trends: ${google.join("; ")}
Reddit trends: ${reddit.join("; ")}
`;

    const raw = await groqChat(TREND_ANALYSIS_PROMPT, userMessage, 2048);
    const analysis = parseGroqJson<TrendAnalysis>(raw);

    return jsonResponse({
      googleTrends: google.slice(0, 5),
      redditTrends: reddit.slice(0, 5),
      analysis,
    });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to analyze trends", 500);
  }
}
