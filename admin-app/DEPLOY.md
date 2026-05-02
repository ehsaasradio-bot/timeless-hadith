# Timeless Hadith Shop — Deployment Guide

## Step 1: Run the Supabase Schema

1. Go to: https://supabase.com/dashboard/project/dwcsledifvnyrunxejzd/sql/new
2. Paste the contents of `supabase/migrations/001_shop_schema.sql`
3. Click **Run**

This creates all tables, indexes, triggers, and RLS policies.

---

## Step 2: Get Your Supabase Keys

Go to: https://supabase.com/dashboard/project/dwcsledifvnyrunxejzd/settings/api

Copy:
- **URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Set Up Resend (Free Email)

1. Go to: https://resend.com → Create account → Create API key
2. Add your sending domain or use Resend's sandbox (`onboarding@resend.dev`) for testing
3. Copy the API key → `RESEND_API_KEY`

---

## Step 4: Generate Admin Password

In PowerShell or Terminal:

```powershell
# PowerShell
[System.Web.Security.Membership]::GeneratePassword(32, 4)
# or simpler:
-join ((48..122) | Get-Random -Count 32 | % {[char]$_})
```

Save this as `ADMIN_SECRET` — you'll need it to log in to the admin panel.

---

## Step 5: Create a Cloudflare Pages Project

1. Go to: https://dash.cloudflare.com → Workers & Pages → Create
2. Choose **Pages** → **Connect to Git**
3. Select your GitHub repo (`ehsaasradio-bot/timeless-hadith`)
4. Settings:
   - **Project name:** `timeless-hadith-shop`
   - **Production branch:** `main`
   - **Root directory:** `admin-app`
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Build output directory:** `.vercel/output/static`
   - **Node.js version:** `20`

---

## Step 6: Add Environment Variables in Cloudflare

Go to: Pages → timeless-hadith-shop → Settings → Environment Variables

Add all of these as **Production** secrets (also add to Preview if you want):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dwcsledifvnyrunxejzd.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your service role key |
| `ADMIN_SECRET` | your generated admin password |
| `RESEND_API_KEY` | `re_xxxx...` |
| `EMAIL_FROM` | `shop@timelesshadith.com` |
| `ADMIN_EMAIL` | `ehsaasradio@gmail.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://timelesshadith.com` |

---

## Step 7: Add GitHub Secrets (for CI/CD)

Go to: GitHub repo → Settings → Secrets → Actions → New secret

| Secret | Where to find it |
|---|---|
| `CF_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template, add Pages:Edit |
| `CF_ACCOUNT_ID` | Cloudflare → Workers & Pages → Overview (right sidebar) |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `ADMIN_SECRET` | your generated admin password |
| `RESEND_API_KEY` | Resend dashboard |

---

## Step 8: Local Development

```bash
cd admin-app

# Install
npm install

# Create env file
cp .env.example .env.local
# Fill in .env.local with your values

# Run locally
npm run dev
# → http://localhost:3000/shop

# Build for Cloudflare (test the edge build)
npm run build:cf

# Preview edge build locally
npm run preview
```

---

## Step 9: First Deploy

Push to main branch:

```powershell
cd C:\Users\mubas\Documents\Claude\Projects\Haith
git add admin-app/
git commit -m "feat(shop): add Next.js shop with Supabase backend and Cloudflare Pages deployment"
git push origin main
```

GitHub Actions will build and deploy automatically.

---

## Step 10: Add Products via Admin Panel

Once deployed, go to:
`https://timeless-hadith-shop.pages.dev/shop/admin`

1. Enter your `ADMIN_SECRET` password
2. Navigate to **Products** → **Add Product**
3. Fill in title, price, SKU, category
4. Set stock quantity (for physical products)
5. Click **Create Product**

Your product will appear live at `/shop` immediately.

---

## Custom Domain (Optional)

To use `timelesshadith.com/shop` instead of the `.pages.dev` URL:

1. Cloudflare Pages → timeless-hadith-shop → Custom Domains → Add Domain
2. Enter `timelesshadith.com` (already on Cloudflare DNS)
3. Cloudflare auto-configures the CNAME

Or use a subdomain: `shop.timelesshadith.com`

---

## Architecture Summary

```
User Browser
    │
    ▼
Cloudflare Pages Edge (CDN)
    ├── /shop           → Static + Edge Server Components
    ├── /api/shop/*     → Edge Route Handlers (read operations)
    ├── /api/admin/*    → Edge Route Handlers (write operations, protected)
    └── /shop/admin/*   → Admin UI (client-side, auth-gated)
                │
                ▼
        Supabase PostgreSQL
        dwcsledifvnyrunxejzd.supabase.co
        ├── shop_products
        ├── shop_categories
        ├── shop_inventory
        ├── shop_orders + shop_order_items
        ├── shop_carts + shop_cart_items
        ├── shop_reviews
        └── shop_newsletter_subscribers
                │
                ▼
           Resend (Emails)
           Order confirmations, shipping alerts,
           newsletter welcome, low stock alerts
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/shop/products` | List products (filter, sort, search) |
| GET | `/api/shop/products/:slug` | Single product |
| GET | `/api/shop/categories` | All active categories |
| GET | `/api/shop/cart` | Get cart (session cookie) |
| POST | `/api/shop/cart` | Add/update cart item |
| DELETE | `/api/shop/cart?productId=` | Remove item |
| POST | `/api/shop/orders` | Create order |
| GET | `/api/shop/reviews` | Get approved reviews |
| POST | `/api/shop/reviews` | Submit review (pending approval) |
| POST | `/api/shop/newsletter` | Subscribe to newsletter |
| POST | `/api/admin/login` | Admin sign in (sets cookie) |
| DELETE | `/api/admin/login` | Admin sign out |
| GET | `/api/admin/stats` | Dashboard stats |
| GET/POST/PUT/DELETE | `/api/admin/products` | Manage products |
| GET/PATCH | `/api/admin/orders` | Manage orders |
