# Timeless Hadith — Dashboard

Personal Hadith reading dashboard. Next.js 15 + Tailwind + Supabase. Deploys
to Cloudflare Pages at `app.timelesshadith.com`.

Sister projects in this repo:
- `../` — static marketing site (timelesshadith.com)
- `../admin-app/` — shop (shop.timelesshadith.com)

## Routes

| Path | What |
|---|---|
| `/` | Redirects to `/dashboard` |
| `/dashboard` | Main dashboard (stats, analytics, continue reading, narrators, progress, daily hadith) |
| `/dashboard/progress` | Per-collection progress detail |
| `/dashboard/recommendations` | AI-style recommendations grid |

## Local development

```powershell
cd dashboard-app
npm install
npm run dev
# http://localhost:3000/dashboard
```

## Type-check + production build

```powershell
npm run type-check    # tsc --noEmit
npm run build         # next build
npm run build:cf      # next build && @cloudflare/next-on-pages
```

## Environment variables

Local `.env.local` (not committed):

```
NEXT_PUBLIC_SUPABASE_URL=https://dwcsledifvnyrunxejzd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard>
# OPENAI_API_KEY=...   # only when wiring real recommendations
```

In Cloudflare Pages, set the same vars under
**Settings → Environment variables → Production**.

## Database

Schema lives in `supabase/migrations/008_reading_dashboard.sql`. Apply it
once via the Supabase SQL editor:

https://supabase.com/dashboard/project/dwcsledifvnyrunxejzd/sql/new

The migration is idempotent — safe to re-run.

Tables created:

- `reading_profiles`, `reading_progress`, `reading_sessions`
- `dashboard_bookmarks`, `dashboard_notes`, `dashboard_daily_goals`
- `reading_achievements`, `ai_recommendations`

All tables have RLS enabled and per-user policies (`auth.uid() = user_id`).

## Recommendation engine

`src/lib/recommendations/getRecommendations.ts` is the entry point.
Currently mock-backed. Search for `// TODO(ai):` to find the spots where
Supabase queries and OpenAI embeddings plug in.

## Folder layout

```
dashboard-app/
├── app/
│   ├── dashboard/                # the three dashboard routes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # / → /dashboard
├── src/
│   ├── components/dashboard/     # 11 dashboard components
│   └── lib/
│       ├── dashboard/mock-data.ts
│       ├── design/tokens.ts      # Apple-style tokens (colors, glass, shadows)
│       └── recommendations/getRecommendations.ts
├── supabase/migrations/008_reading_dashboard.sql
└── (config: package.json, tsconfig.json, tailwind.config.ts, next.config.ts, wrangler.toml, postcss.config.js)
```
