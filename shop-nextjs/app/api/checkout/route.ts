// app/api/checkout/route.ts
// POST /api/checkout — create a Stripe Checkout Session
//
// Security model:
//   - Prices are ALWAYS fetched server-side from `products` table (never trusted from client)
//   - Uses products.stripe_price_id if set; falls back to price_data for test flexibility
//   - Creates a pending row in `orders` (status = 'pending') before redirecting
//   - Only the Stripe webhook can flip status → 'paid'
//
// Env vars required (set in Cloudflare Pages dashboard, never in code):
//   STRIPE_SECRET_KEY         — sk_test_...
//   NEXT_PUBLIC_SITE_URL      — https://timelesshadith.com
//   NEXT_PUBLIC_SUPABASE_URL  — https://dwcsledifvnyrunxejzd.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY — service-role key (server only)

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItemPayload {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number; // used only for display; server re-fetches from DB
    images: { src: string; alt: string }[];
  };
  quantity: number;
}

interface DbProduct {
  id: string;
  name: string;             // original NOT NULL column in user's products table
  title: string | null;     // added by migration 002 — may be null on first run
  price: number;            // numeric(10,2) — confirmed by user
  images: string[];         // text[] — confirmed by user
  stripe_price_id: string | null;  // confirmed by user
  is_active?: boolean;
  is_digital?: boolean;
  free_shipping?: boolean;
}

/** Resolve the display name: prefer title (alias), fall back to name (original column). */
function productDisplayName(db: DbProduct): string {
  return db.title?.trim() || db.name;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not set');
  return createClient(url, key, { auth: { persistSession: false } });
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://timelesshadith.com').replace(/\/$/, '');
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { items?: CartItemPayload[] };
    const cartItems = body.items;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Extract unique product IDs from cart
    const productIds = [...new Set(cartItems.map((i) => i.product.id))];

    // 2. Fetch prices + stripe_price_id server-side from `products` table.
    //    Only select columns that are guaranteed to exist per the user's schema.
    //    Optional columns (is_active, is_digital, free_shipping) are selected
    //    but handled gracefully if NULL (migration 002 adds them with defaults).
    const supabase = getSupabaseAdmin();
    const { data: dbProducts, error: dbErr } = await supabase
      .from('products')
      .select('id, name, title, price, images, stripe_price_id, is_active, is_digital, free_shipping')
      .in('id', productIds);

    if (dbErr) {
      console.error('[checkout] supabase error:', dbErr);
      return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 });
    }

    if (!dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: 'No matching products found' }, { status: 400 });
    }

    const productMap = new Map<string, DbProduct>(
      (dbProducts as DbProduct[]).map((p) => [p.id, p])
    );

    // 3. Validate all cart items exist in DB
    for (const item of cartItems) {
      if (!productMap.has(item.product.id)) {
        return NextResponse.json(
          { error: `Product not found: ${item.product.id}` },
          { status: 400 }
        );
      }
      if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
        return NextResponse.json(
          { error: 'Invalid quantity for product ' + item.product.id },
          { status: 400 }
        );
      }
    }

    // 4. Build Stripe line_items using server-side prices
    const stripe = getStripe();
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cartItems.map((item) => {
      const db = productMap.get(item.product.id)!;
      const unitAmountCents = Math.round(Number(db.price) * 100);

      // Use pre-created Stripe Price if available; else build price_data dynamically
      if (db.stripe_price_id) {
        return {
          price: db.stripe_price_id,
          quantity: item.quantity,
        };
      }

      // Fallback — construct price_data (useful for test mode with no pre-created prices)
      // products.images is text[] — db.images[0] is a raw URL string.
      const rawImage = Array.isArray(db.images) && db.images.length > 0 ? db.images[0] : null;
      const imageUrl = rawImage
        ? rawImage.startsWith('http')
          ? rawImage
          : `${siteUrl()}${rawImage}`
        : undefined;

      return {
        price_data: {
          currency: 'usd',
          unit_amount: unitAmountCents,
          product_data: {
            name: productDisplayName(db),
            ...(imageUrl ? { images: [imageUrl] } : {}),
            metadata: { product_id: db.id },
          },
        },
        quantity: item.quantity,
      };
    });

    // 5. Calculate order total server-side (for the pending order row)
    const subtotal = cartItems.reduce((sum, item) => {
      const db = productMap.get(item.product.id)!;
      return sum + Number(db.price) * item.quantity;
    }, 0);

    // is_digital defaults to false if column not yet populated
    const allDigital = cartItems.every((item) => productMap.get(item.product.id)?.is_digital === true);
    const shipping = allDigital ? 0 : subtotal >= 200 ? 0 : 9.99;
    const total = subtotal + shipping;

    // 6. Determine shipping requirement for Stripe
    const hasPhysical = !allDigital;

    // 7. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      ...(hasPhysical
        ? {
            shipping_address_collection: {
              allowed_countries: [
                'US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR', 'AE', 'SA', 'SG', 'JP', 'MY',
              ],
            },
          }
        : {}),
      success_url: `${siteUrl()}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/shop/cancel`,
      // metadata carries the order reference so the webhook can find it
      metadata: {
        // order_id will be set after DB insert (see step 8)
        // We pass a temporary placeholder — the webhook uses stripe_session_id lookup
        source: 'shop',
      },
      payment_intent_data: {
        metadata: { source: 'timeless-hadith-shop' },
      },
    });

    // 8. Create a pending order in `orders` table AFTER session is confirmed
    //    This links the Stripe session to our DB record.
    //    Snapshot the items as jsonb — no foreign key coupling needed.
    const itemsSnapshot = cartItems.map((item) => {
      const db = productMap.get(item.product.id)!;
      return {
        product_id: item.product.id,
        title: productDisplayName(db),
        price: Number(db.price),
        quantity: item.quantity,
        line_total: Number(db.price) * item.quantity,
        // images is text[] — first element is the primary image URL
        image: Array.isArray(db.images) && db.images.length > 0 ? String(db.images[0]) : null,
      };
    });

    const { error: orderErr } = await supabase.from('orders').insert({
      status: 'pending',
      stripe_session_id: session.id,
      items: itemsSnapshot,      // jsonb
      subtotal,
      shipping_cost: shipping,
      total,
      currency: 'usd',
      created_at: new Date().toISOString(),
    });

    if (orderErr) {
      // Order row failed — log but don't block the user from paying.
      // The webhook will still fire; without an order row it will create one.
      console.error('[checkout] failed to insert pending order:', orderErr.message);
    }

    // 9. Return the Stripe-hosted checkout URL
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    console.error('[POST /api/checkout]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
