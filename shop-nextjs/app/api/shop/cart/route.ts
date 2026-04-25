// app/api/shop/cart/route.ts
// GET  /api/shop/cart              — get cart items (session_id in cookie)
// POST /api/shop/cart              — add/update item { productId, quantity }
// DELETE /api/shop/cart?productId= — remove item

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCart, getCartItems, upsertCartItem } from '@/lib/shop-api';

const CART_COOKIE = 'th_cart_session';

function getSessionId(request: NextRequest): string | null {
  return request.cookies.get(CART_COOKIE)?.value ?? null;
}

function newSessionId(): string {
  return `sess_${crypto.randomUUID().replace(/-/g, '')}`;
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ items: [], cartId: null });
    }

    const cartId = await getOrCreateCart(sessionId);
    const items = await getCartItems(cartId);
    return NextResponse.json({ items, cartId });
  } catch (err) {
    console.error('[GET /api/shop/cart]', err);
    return NextResponse.json({ error: 'Failed to load cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'productId and quantity required' }, { status: 400 });
    }

    let sessionId = getSessionId(request);
    const isNewSession = !sessionId;
    if (!sessionId) sessionId = newSessionId();

    const cartId = await getOrCreateCart(sessionId);
    await upsertCartItem(cartId, productId, quantity);
    const items = await getCartItems(cartId);

    const response = NextResponse.json({ ok: true, items, cartId });

    if (isNewSession) {
      response.cookies.set(CART_COOKIE, sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (err) {
    console.error('[POST /api/shop/cart]', err);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const sessionId = getSessionId(request);

    if (!productId || !sessionId) {
      return NextResponse.json({ error: 'productId and session required' }, { status: 400 });
    }

    const cartId = await getOrCreateCart(sessionId);
    await upsertCartItem(cartId, productId, 0); // quantity 0 = remove
    const items = await getCartItems(cartId);

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error('[DELETE /api/shop/cart]', err);
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}
