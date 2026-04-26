// app/api/webhook/route.ts
// POST /api/webhook — Stripe webhook handler
//
// ONLY this endpoint may set orders.status = 'paid'.
// All other status transitions (shipped, delivered, etc.) go through admin routes.
//
// Env vars required:
//   STRIPE_SECRET_KEY         — sk_test_...
//   STRIPE_WEBHOOK_SECRET     — whsec_... (from Stripe dashboard → Webhooks)
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Stripe CLI local testing:
//   stripe listen --forward-to localhost:3000/api/webhook

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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

// ─── Webhook POST ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // 1. Read raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  // 2. Verify Stripe signature (edge-compatible async API)
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Signature verification failed';
    console.error('[webhook] signature error:', msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  // 3. Handle relevant events
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case 'checkout.session.expired': {
        await handleSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
      }

      // Acknowledge but do nothing for other events
      default:
        break;
    }
  } catch (err) {
    console.error(`[webhook] handler error for ${event.type}:`, err);
    // Return 500 so Stripe retries the event
    return NextResponse.json(
      { error: 'Handler failed — Stripe will retry' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ─── checkout.session.completed ───────────────────────────────────────────────
// Payment captured. Flip the order status from 'pending' → 'paid'.
// If the order row is missing (unlikely), create it from session data.

async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdmin();

  // Locate the order by Stripe session ID
  const { data: existing, error: fetchErr } = await supabase
    .from('orders')
    .select('id, status')
    .eq('stripe_session_id', session.id)
    .maybeSingle();

  if (fetchErr) {
    throw new Error('DB fetch error: ' + fetchErr.message);
  }

  if (existing) {
    // Guard: only update if still pending (idempotent — safe to retry)
    if (existing.status === 'pending') {
      const updatePayload: Record<string, unknown> = {
        status: 'paid',
        paid_at: new Date().toISOString(),
      };

      // Capture customer contact from Stripe if available
      if (session.customer_details?.email) {
        updatePayload.customer_email = session.customer_details.email;
      }
      if (session.customer_details?.name) {
        updatePayload.customer_name = session.customer_details.name;
      }

      // Capture shipping address if provided
      if (session.shipping_details?.address) {
        const addr = session.shipping_details.address;
        updatePayload.shipping_address = {
          name: session.shipping_details.name,
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          postal_code: addr.postal_code,
          country: addr.country,
        };
      }

      const { error: updErr } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', existing.id);

      if (updErr) throw new Error('Failed to mark order paid: ' + updErr.message);

      console.log(`[webhook] order ${existing.id} marked paid (session ${session.id})`);
    } else {
      // Already processed — idempotent, log and return
      console.log(`[webhook] order ${existing.id} already has status '${existing.status}', skipping`);
    }
  } else {
    // No pending order found — this can happen if the /api/checkout insert failed.
    // Create the order record now from Stripe session data.
    console.warn(`[webhook] no order found for session ${session.id} — creating from session data`);

    // Retrieve full session with line items from Stripe
    const stripe = getStripe();
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items'],
    });

    const lineItems = fullSession.line_items?.data ?? [];
    const itemsSnapshot = lineItems.map((li) => ({
      title: li.description ?? '',
      price: li.amount_total ? li.amount_total / 100 / (li.quantity ?? 1) : 0,
      quantity: li.quantity ?? 1,
      line_total: li.amount_total ? li.amount_total / 100 : 0,
    }));

    const total = fullSession.amount_total ? fullSession.amount_total / 100 : 0;

    const insertPayload: Record<string, unknown> = {
      status: 'paid',
      stripe_session_id: session.id,
      items: itemsSnapshot,
      total,
      currency: fullSession.currency ?? 'usd',
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    if (session.customer_details?.email) {
      insertPayload.customer_email = session.customer_details.email;
    }
    if (session.customer_details?.name) {
      insertPayload.customer_name = session.customer_details.name;
    }
    if (session.shipping_details?.address) {
      const addr = session.shipping_details.address;
      insertPayload.shipping_address = {
        name: session.shipping_details.name,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country,
      };
    }

    const { error: insErr } = await supabase.from('orders').insert(insertPayload);
    if (insErr) throw new Error('Failed to insert order from webhook: ' + insErr.message);

    console.log(`[webhook] created order from webhook for session ${session.id}`);
  }
}

// ─── checkout.session.expired ────────────────────────────────────────────────
// Session timed out without payment. Mark order as cancelled so it
// doesn't clutter the admin panel as "pending" forever.

async function handleSessionExpired(session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('stripe_session_id', session.id)
    .eq('status', 'pending'); // Only cancel if still pending (idempotent)

  if (error) {
    console.error(`[webhook] failed to cancel expired session ${session.id}:`, error.message);
    // Don't throw — expiry is non-critical
  } else {
    console.log(`[webhook] pending order cancelled for expired session ${session.id}`);
  }
}
