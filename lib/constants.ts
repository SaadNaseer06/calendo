export const PLATFORMS = [
  "INSTAGRAM",
  "TIKTOK",
  "LINKEDIN",
  "FACEBOOK",
  "TWITTER",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_COLORS: Record<Platform, string> = {
  INSTAGRAM: "#E1306C",
  TIKTOK: "#000000",
  LINKEDIN: "#0A66C2",
  FACEBOOK: "#1877F2",
  TWITTER: "#1DA1F2",
};

export const POST_TYPES = ["REEL", "CAROUSEL", "STATIC", "STORY", "THREAD"] as const;
export type PostType = (typeof POST_TYPES)[number];

export const STATUSES = ["IDEA", "PLANNED", "DESIGNING", "READY", "PUBLISHED"] as const;
export type PostStatus = (typeof STATUSES)[number];

export const STATUS_COLORS: Record<PostStatus, string> = {
  IDEA: "#6B7280",
  PLANNED: "#F59E0B",
  DESIGNING: "#8B5CF6",
  READY: "#10B981",
  PUBLISHED: "#06B6D4",
};

export const CONTENT_PILLARS = [
  "Education",
  "Promotion",
  "Entertainment",
  "BehindTheScenes",
  "Community",
  "Inspiration",
] as const;

export const NICHES = [
  "Fashion",
  "Tech",
  "Food",
  "Fitness",
  "Real Estate",
  "Beauty",
  "Travel",
  "Business",
  "Gaming",
  "Finance",
] as const;
