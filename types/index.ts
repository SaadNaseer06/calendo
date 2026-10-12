import type { Platform, PostStatus, PostType } from "@/lib/constants";

export interface Brand {
  id: string;
  name: string;
  niche: string;
  description: string | null;
  brandVoice: string | null;
  contentPillars: string[];
  platforms: string[];
  logoUrl: string | null;
  websiteUrl: string | null;
  ga4MeasurementId: string | null;
  ga4PropertyId: string | null;
  userId: string;
  createdAt: string;
}

export interface Post {
  id: string;
  brandId: string;
  title: string;
  caption: string | null;
  hashtags: string[];
  platforms: Platform[];
  postType: PostType;
  scheduledAt: string;
  status: PostStatus;
  aiGenerated: boolean;
  designerNote: string | null;
  rationale: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedPlanPost {
  day: number;
  title: string;
  caption: string;
  hashtags: string[];
  platforms: string[];
  postType: string;
  designerNote: string;
  rationale: string;
}

export interface MonthlyPlan {
  trendInsights: string[];
  posts: GeneratedPlanPost[];
}

export interface SinglePostResult {
  title: string;
  caption: string;
  hashtags: string[];
  designerNote: string;
  bestTimeToPost: string;
  rationale: string;
}

export interface CaptionRewriteResult {
  professional: string;
  casual: string;
  viral: string;
  storytelling: string;
}

export interface TrendItem {
  topic: string;
  why: string;
  howToUse: string;
  urgency: "hot" | "warm" | "evergreen";
}

export interface TrendAnalysis {
  trends: TrendItem[];
}
