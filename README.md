# Calendo

AI-powered Social Media Marketing Management platform — plan content on a calendar, generate posts with Groq AI, export for designers, and share read-only links.

**100% free stack** — no paid APIs required for development.

## Quick start

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Fill in (minimum for local dev):

- `NEXTAUTH_SECRET` — any random string for local dev
- `GROQ_API_KEY` — [console.groq.com](https://console.groq.com) (free, optional for AI features)

3. Initialize database:

```bash
npx prisma db push
```

4. Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Email sign-in (NextAuth credentials — no password, dev-friendly)
- Multi-brand dashboard
- Monthly calendar with drag-and-drop rescheduling
- AI Studio: monthly plans, single posts, caption rewriter, trend scout
- CSV export and shareable designer links
- Dark editorial UI (Syne + DM Sans)

## Tech stack

Next.js 14 · Prisma · SQLite (local) / Supabase (prod) · Groq · Tailwind · shadcn/ui · TanStack Query

## Production

- Deploy on [Vercel](https://vercel.com)
- Use Supabase PostgreSQL — set `DATABASE_URL` and change `provider` in `prisma/schema.prisma` to `postgresql`
- Add all env vars from `.env.example`

---

*From content chaos to calendar clarity.*
