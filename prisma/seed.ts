import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@calendo.app";

const posts = [
  {
    day: 2,
    title: "Welcome to the team — who we are",
    caption: "Meet the people behind the brand. Real faces, real stories. 💼✨",
    hashtags: ["#TeamCulture", "#BehindTheScenes", "#CompanyLife"],
    platforms: ["LINKEDIN", "INSTAGRAM"],
    postType: "CAROUSEL",
    status: "PUBLISHED",
    designerNote: "Team photo grid, warm tones, brand logo watermark",
  },
  {
    day: 5,
    title: "3 tips for better productivity",
    caption: "Small habits, big results. Save this for Monday morning 📌",
    hashtags: ["#ProductivityTips", "#WorkSmart", "#BusinessGrowth"],
    platforms: ["LINKEDIN"],
    postType: "STATIC",
    status: "READY",
    designerNote: "Clean infographic, 3 numbered tips, brand colors",
  },
  {
    day: 8,
    title: "Client success story spotlight",
    caption: "Results speak louder than words. Here's how we helped [Client] grow 40% 🚀",
    hashtags: ["#CaseStudy", "#ClientSuccess", "#Results"],
    platforms: ["LINKEDIN", "FACEBOOK"],
    postType: "CAROUSEL",
    status: "DESIGNING",
    designerNote: "Before/after metrics slide + quote card",
  },
  {
    day: 10,
    title: "Quick reel — day in the office",
    caption: "POV: a normal Tuesday at HQ ☕👩‍💻",
    hashtags: ["#OfficeLife", "#Reels", "#TeamVibes"],
    platforms: ["INSTAGRAM", "TIKTOK"],
    postType: "REEL",
    status: "PLANNED",
    designerNote: "15s vertical clip, trending audio, text overlays",
  },
  {
    day: 12,
    title: "Industry news roundup",
    caption: "What happened in our space this week — our take in 60 seconds 🗞️",
    hashtags: ["#IndustryNews", "#Trends", "#Insights"],
    platforms: ["LINKEDIN", "TWITTER"],
    postType: "THREAD",
    status: "PLANNED",
    designerNote: "Thread graphic header + link preview card",
  },
  {
    day: 14,
    title: "Product feature highlight",
    caption: "Did you know you can do THIS with our platform? Game changer 🔥",
    hashtags: ["#ProductUpdate", "#FeatureFriday", "#SaaS"],
    platforms: ["INSTAGRAM", "LINKEDIN"],
    postType: "REEL",
    status: "IDEA",
    designerNote: "Screen recording demo with captions",
  },
  {
    day: 16,
    title: "Ask us anything — Q&A",
    caption: "Drop your questions below 👇 We'll answer the top 5 in Stories!",
    hashtags: ["#AMA", "#Community", "#Engagement"],
    platforms: ["INSTAGRAM"],
    postType: "STORY",
    status: "IDEA",
    designerNote: "Poll sticker + question box template",
  },
  {
    day: 18,
    title: "Motivational Monday quote",
    caption: "\"Consistency beats intensity.\" — showing up every day wins 🏆",
    hashtags: ["#MondayMotivation", "#Inspiration", "#GrowthMindset"],
    platforms: ["INSTAGRAM", "LINKEDIN", "FACEBOOK"],
    postType: "STATIC",
    status: "PLANNED",
    designerNote: "Bold typography on gradient background",
  },
  {
    day: 20,
    title: "Webinar registration open",
    caption: "Free masterclass next week — link in bio to save your spot 🎓",
    hashtags: ["#Webinar", "#FreeTraining", "#LearnWithUs"],
    platforms: ["LINKEDIN", "FACEBOOK"],
    postType: "STATIC",
    status: "DESIGNING",
    designerNote: "Event banner with date, time, speaker headshots",
  },
  {
    day: 22,
    title: "User-generated content repost",
    caption: "Love seeing how YOU use our product! Tag us to get featured 📸",
    hashtags: ["#UGC", "#CommunityLove", "#Repost"],
    platforms: ["INSTAGRAM"],
    postType: "STATIC",
    status: "IDEA",
    designerNote: "Repost template frame with @mention",
  },
  {
    day: 24,
    title: "Monthly stats & milestones",
    caption: "This month by the numbers 📊 Thank you for being part of the journey!",
    hashtags: ["#Milestone", "#Growth", "#ThankYou"],
    platforms: ["LINKEDIN", "INSTAGRAM"],
    postType: "CAROUSEL",
    status: "PLANNED",
    designerNote: "Animated counter slides, celebratory confetti accent",
  },
  {
    day: 26,
    title: "Behind the scenes — content creation",
    caption: "How we plan an entire month of content in one afternoon 🎬",
    hashtags: ["#BTS", "#ContentCreation", "#SocialMediaTips"],
    platforms: ["INSTAGRAM", "TIKTOK"],
    postType: "REEL",
    status: "IDEA",
    designerNote: "Split screen: planning tool + filming setup",
  },
  {
    day: 28,
    title: "Weekend reading list",
    caption: "5 articles that changed how we think about marketing 📚",
    hashtags: ["#ReadingList", "#Marketing", "#WeekendReads"],
    platforms: ["LINKEDIN", "TWITTER"],
    postType: "STATIC",
    status: "PLANNED",
    designerNote: "Minimal list graphic with article thumbnails",
  },
];

async function main() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: "Demo User" },
    create: { email: DEMO_EMAIL, name: "Demo User" },
  });

  const existingBrand = await prisma.brand.findFirst({
    where: { userId: user.id, name: "Acme Corp" },
  });

  const brand =
    existingBrand ??
    (await prisma.brand.create({
      data: {
        userId: user.id,
        name: "Acme Corp",
        niche: "Business",
        description: "B2B software company helping teams grow through smart automation.",
        brandVoice: "Professional but approachable — expert, clear, and human",
        contentPillars: JSON.stringify([
          "Education",
          "Promotion",
          "BehindTheScenes",
          "Community",
        ]),
        platforms: JSON.stringify(["INSTAGRAM", "LINKEDIN", "FACEBOOK", "TIKTOK"]),
        logoUrl: null,
        websiteUrl: "https://example.com",
        ga4MeasurementId: null,
        ga4PropertyId: null,
      },
    }));

  await prisma.post.deleteMany({ where: { brandId: brand.id } });

  for (const p of posts) {
    const scheduled = new Date(year, month, p.day, 10, 0, 0, 0);
    await prisma.post.create({
      data: {
        brandId: brand.id,
        title: p.title,
        caption: p.caption,
        hashtags: JSON.stringify(p.hashtags),
        platforms: JSON.stringify(p.platforms),
        postType: p.postType,
        scheduledAt: scheduled,
        status: p.status,
        aiGenerated: false,
        designerNote: p.designerNote,
        rationale: "Seeded demo content for onboarding",
      },
    });
  }

  console.log(`Seeded demo user: ${DEMO_EMAIL}`);
  console.log(`Seeded brand: ${brand.name} with ${posts.length} posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
