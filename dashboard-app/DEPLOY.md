# Deploy guide — dashboard-app

One-time setup. After this, every push to `main` auto-deploys via
Cloudflare Pages.

## 1. Create the Cloudflare Pages project

1. Open https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Pick the `ehsaasradio-bot/timeless-hadith` repo → **Begin setup**.
3. Configure:

   | Field | Value |
   |---|---|
   | Project name | `timeless-hadith-dashboard` |
   | Production branch | `main` |
   | Framework preset | Next.js |
   | Build command | `npm run build:cf` |
   | Build output directory | `.vercel/output/static` |
   | Root directory (advanced) | `dashboard-app` |
   | Environment variable: `NODE_VERSION` | `20` |

4. **Environment variables (Production):**

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://dwcsledifvnyrunxejzd.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (Supabase dashboard → Settings → API → anon public) |
   | `NODE_VERSION` | `20` |

5. **Save and Deploy.** First build takes 3–5 min.
6. Default URL: `https://timeless-hadith-dashboard.pages.dev`. Open it — root redirects to `/dashboard`.

## 2. Add the custom domain

1. Same project → **Custom domains** → **Set up a custom domain**.
2. Enter `app.timelesshadith.com` → **Continue** → **Activate domain**.
3. Cloudflare auto-creates the CNAME (`app` → `timeless-hadith-dashboard.pages.dev`).
4. Wait 1–5 min for SSL → "Active" badge.
5. Test: open `https://app.timelesshadith.com/dashboard`.

## 3. Apply the Supabase migration

1. Open https://supabase.com/dashboard/project/dwcsledifvnyrunxejzd/sql/new
2. Paste contents of `supabase/migrations/008_reading_dashboard.sql`.
3. **Run** (Ctrl+Enter). Expected: "Success. No rows returned."
4. Verify under **Database → Tables → schema public**: eight new tables exist
   with RLS enabled.

The migration uses `CREATE … IF NOT EXISTS` and `DROP POLICY IF EXISTS`
everywhere — safe to re-run if needed.

## 4. Smoke test

| URL | Expected |
|---|---|
| `https://app.timelesshadith.com/` | Redirects to `/dashboard` |
| `https://app.timelesshadith.com/dashboard` | Dashboard renders |
| `https://app.timelesshadith.com/dashboard/progress` | Progress page |
| `https://app.timelesshadith.com/dashboard/recommendations` | Recommendations grid |
| `https://timelesshadith.com/dashboard.html` | Redirects to dashboard |
| `https://timelesshadith.com/` (signed in) | Top nav shows "My Reader" |
| `https://timelesshadith.com/` (signed out) | Top nav has no "My Reader" |

## Common issues

- **Build fails on `@/src/...` imports** — `tsconfig.json` `paths` should be `"@/*": ["./*"]`. Verify the file matches what's committed.
- **Custom domain stuck "Verifying"** — confirm CNAME `app → timeless-hadith-dashboard.pages.dev` exists in **Websites → timelesshadith.com → DNS**.
- **`/dashboard` renders blank** — open the browser console; nine times out of ten it's a missing env var on Cloudflare.
- **Migration error "policy already exists"** — re-run the same SQL; the file is idempotent.
