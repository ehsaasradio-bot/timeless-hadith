// app/api/shop/newsletter/route.ts
// POST /api/shop/newsletter — subscribe to newsletter
//
// Rate-limit: 1 successful submission per IP per minute. Backed by Cloudflare
// KV (lib/kv.ts) so the limit is shared across all edge instances. Falls back
// to a per-process in-memory store in local dev — see lib/kv.ts.

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/shop-api';
import { sendEmail, buildNewsletterConfirmEmail } from '@/lib/email';
import { getKV } from '@/lib/kv';

const RATE_LIMIT_PREFIX = 'rl:newsletter:';
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 submission per IP per minute

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const kv = getKV();
    const rlKey = RATE_LIMIT_PREFIX + ip;

    // KV-backed rate limit — durable across every edge instance.
    const last = await kv.get(rlKey);
    if (last) {
      return NextResponse.json(
        { error: 'Please wait before subscribing again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(RATE_LIMIT_WINDOW_SECONDS),
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    const body = await request.json();
    const { email, interests, firstName } = body;

    // Validate
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }
    if (interests && !Array.isArray(interests)) {
      return NextResponse.json({ error: 'Interests must be an array.' }, { status: 400 });
    }

    await subscribeToNewsletter(email, interests ?? [], firstName);

    // Send welcome email (fire and forget — never block the response on email).
    sendEmail({
      to: email,
      subject: 'Welcome to Timeless Hadith — you\'re in.',
      html: buildNewsletterConfirmEmail(email),
    }).catch((e) => console.error('[newsletter] email failed:', e));

    // Set the rate-limit marker AFTER a successful subscription so failed/
    // invalid attempts don't lock out a real signup retry.
    await kv.put(rlKey, String(Date.now()), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });

    return NextResponse.json(
      { ok: true, message: 'Subscribed successfully.' },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Subscription failed';
    console.error('[POST /api/shop/newsletter]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
