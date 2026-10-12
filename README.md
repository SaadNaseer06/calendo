# Calendo

AI-powered Social Media Marketing Management platform — plan content on a calendar, generate posts with Groq AI, export for designers, and share read-only links.

**100% free stack** — no paid APIs required for development.

## Quick start

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Fill in (minimum for local dev):

- `NEXTAUTH_SECRET` — any random string for local dev
- `DATABASE_URL` + `DIRECT_URL` — from your [Supabase](https://supabase.com) project (Database → Connection string)
- `GROQ_API_KEY` — [console.groq.com](https://console.groq.com) (free, optional for AI features)

3. Initialize database:

```bash
npx prisma db push
npm run db:seed
```

The seed creates a demo user (`demo@calendo.app`) with sample brand and posts for the current month.

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Analytics & SEO

1. Open **Analytics** in the sidebar.
2. Add your **Website URL** in Brand Settings.
3. Click **Run SEO Audit** to scan Calendo and your website (titles, meta, H1, Open Graph, etc.).
4. Optional — connect GA4 for live traffic:
   - Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to track Calendo usage
   - Set `GA4_PROPERTY_ID`, `GA4_CLIENT_EMAIL`, `GA4_PRIVATE_KEY` for traffic charts

## Features

- Email sign-in (NextAuth credentials — no password, dev-friendly)
- Multi-brand dashboard
- Monthly calendar with drag-and-drop rescheduling
- AI Studio: monthly plans, single posts, caption rewriter, trend scout
- CSV export and shareable designer links
- Calendar filters by status and platform
- Dashboard with upcoming posts and attention alerts
- Demo seed data for quick onboarding
- Website traffic (Google Analytics 4) + full-site SEO audit
- Dark editorial UI (Syne + DM Sans)

## Tech stack

Next.js 14 · Prisma · Supabase PostgreSQL · Groq · Tailwind · shadcn/ui · TanStack Query · Vercel

## Production (Vercel + Supabase)

See **[DEPLOY.md](./DEPLOY.md)** for the full checklist.

Short version:

1. Create a Supabase project and copy `DATABASE_URL` (pooler) + `DIRECT_URL` (direct)
2. Import [`bmybrand/calendo`](https://github.com/bmybrand/calendo) into [Vercel](https://vercel.com)
3. Add env vars from `.env.example` (use your `https://….vercel.app` URL for auth)
4. Deploy — every push to `master`/`main` ships automatically

---

*From content chaos to calendar clarity.*
