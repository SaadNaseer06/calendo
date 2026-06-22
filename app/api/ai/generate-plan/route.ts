import { z } from "zod";
import { groqChat, parseGroqJson } from "@/lib/groq";
import { MONTHLY_PLAN_PROMPT } from "@/lib/prompts";
import { getGoogleTrends, getRedditTrends } from "@/lib/trends";
import { requireSession, jsonResponse, jsonError } from "@/lib/api";
import type { MonthlyPlan } from "@/types";

const schema = z.object({
  brandId: z.string(),
  niche: z.string(),
  brandVoice: z.string(),
  contentPillars: z.array(z.string()),
  platforms: z.array(z.string()),
  postsPerWeek: z.number().min(1).max(7),
  month: z.number(),
  year: z.number(),
});

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return jsonError("Unauthorized", 401);

  try {
    const body = schema.parse(await req.json());
    const [redditTrends, googleTrends] = await Promise.all([
      getRedditTrends(body.niche),
      getGoogleTrends(),
    ]);
    const trendTopics = [...redditTrends, ...googleTrends].filter(Boolean);

    const userMessage = `
Brand niche: ${body.niche}
Brand voice: ${body.brandVoice}
Content pillars: ${body.contentPillars.join(", ")}
Platforms: ${body.platforms.join(", ")}
Posts per week: ${body.postsPerWeek}
Month: ${body.month}/${body.year}
Current trending topics in this niche: ${trendTopics.length ? trendTopics.join("; ") : "No live trends available — use general niche best practices"}

Generate exactly ${body.postsPerWeek * 4} posts spread across the month (not 30). Keep hashtags to 8-12 per post.
`;

    const raw = await groqChat(MONTHLY_PLAN_PROMPT, userMessage, 4096);
    const plan = parseGroqJson<MonthlyPlan>(raw);
    return jsonResponse(plan);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to generate plan", 500);
  }
}
