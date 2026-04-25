// app/api/shop/newsletter/route.ts
// POST /api/shop/newsletter — subscribe to newsletter

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/shop-api';
import { sendEmail, buildNewsletterConfirmEmail } from '@/lib/email';

// Simple in-memory rate limiting (resets per edge instance)
// For production, use Cloudflare KV or Upstash Redis
const recentSubmissions = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 1 submission per IP per minute

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown';
    const lastSubmit = recentSubmissions.get(ip);
    if (lastSubmit && Date.now() - lastSubmit < RATE_LIMIT_MS) {
      return NextResponse.json({ error: 'Please wait before subscribing again.' }, { status: 429 });
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

    // Send welcome email (fire and forget)
    sendEmail({
      to: email,
      subject: 'Welcome to Timeless Hadith — you\'re in.',
      html: buildNewsletterConfirmEmail(email),
    }).catch((e) => console.error('[newsletter] email failed:', e));

    recentSubmissions.set(ip, Date.now());

    return NextResponse.json({ ok: true, message: 'Subscribed successfully.' }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Subscription failed';
    console.error('[POST /api/shop/newsletter]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
