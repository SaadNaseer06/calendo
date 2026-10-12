# Deploy Calendo on Vercel + Supabase

Push to GitHub → Vercel builds & hosts the app → Prisma talks to **Supabase PostgreSQL**.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Open **Project Settings → Database**
3. Copy connection strings:

| Env var | Which string | Notes |
| --- | --- | --- |
| `DATABASE_URL` | **Transaction** pooler (port `6543`) | Add `?pgbouncer=true` if not present |
| `DIRECT_URL` | **Session** pooler or **Direct** (port `5432`) | Used by `prisma db push` / migrations |

Example shapes (yours will differ):

```bash
# Pooled — app runtime (Vercel serverless)
DATABASE_URL="postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct — schema sync / migrations
DIRECT_URL="postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
```

4. Push the schema once from your machine:

```bash
# Put the two URLs in .env (see .env.example), then:
npx prisma db push
npm run db:seed   # optional demo user: demo@calendo.app
```

## 2. Connect the GitHub repo to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New… → Project**
2. Import `bmybrand/calendo` (GitHub account connected to your Vercel team)
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `.` (default)
5. **Do not** override the Build Command — `package.json` already runs:

   `prisma generate && prisma db push && next build`

6. Add Environment Variables (Production + Preview):

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Supabase pooled URL |
| `DIRECT_URL` | Supabase direct URL |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://YOUR_PROJECT.vercel.app` (update after first deploy if needed) |
| `NEXT_PUBLIC_APP_URL` | same as `NEXTAUTH_URL` |
| `GROQ_API_KEY` | optional, for AI Studio |

7. Click **Deploy**

After the first deploy, if the URL differs from what you set, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the real `https://….vercel.app` (or your custom domain) and redeploy.

## 3. Custom domain (optional)

Vercel → Project → **Settings → Domains** → add your domain and follow DNS instructions.

## 4. Local development against Supabase

```bash
cp .env.example .env
# paste DATABASE_URL + DIRECT_URL from Supabase
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

SQLite is no longer used — one Postgres database for local + production (use a separate Supabase branch/project for prod if you prefer).

## 5. CI

GitHub Actions (`.github/workflows/ci.yml`) runs **lint + build** on every PR/push.  
**Vercel** owns production deploys when the GitHub integration is connected (every push to `master` / `main`).

## Troubleshooting

| Issue | Fix |
| --- | --- |
| `Can't reach database server` | Check password URL-encoding; confirm project is not paused |
| `prepared statement already exists` | Use pooled `DATABASE_URL` with `?pgbouncer=true` and a separate `DIRECT_URL` |
| NextAuth redirect / CSRF errors | `NEXTAUTH_URL` must exactly match the public site URL (`https://…`) |
| Empty DB after deploy | Run `npx prisma db push` and `npm run db:seed` locally against that DB, or rely on the build-time `db push` |
