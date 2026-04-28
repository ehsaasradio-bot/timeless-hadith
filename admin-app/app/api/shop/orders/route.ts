// app/api/shop/orders/route.ts
// POST /api/shop/orders — create a new order

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/shop-api';
import { sendOrderConfirmation } from '@/lib/email';

// Basic email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { customerEmail, customerName, items } = body;

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json({ error: 'Valid customer email is required' }, { status: 400 });
    }
    if (!customerName?.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must have at least one item' }, { status: 400 });
    }
    for (const item of items) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity < 1) {
        return NextResponse.json({ error: 'Each item requires productId and quantity >= 1' }, { status: 400 });
      }
    }

    // Create the order
    const result = await createOrder({
      customerEmail,
      customerName: customerName.trim(),
      customerPhone: body.customerPhone,
      shippingName: body.shippingName,
      shippingAddress: body.shippingAddress,
      shippingCity: body.shippingCity,
      shippingState: body.shippingState,
      shippingZip: body.shippingZip,
      shippingCountry: body.shippingCountry ?? 'US',
      items,
    });

    // Send confirmation email (fire and forget — don't block response)
    sendOrderConfirmation({
      orderNumber: result.orderNumber,
      customerName,
      customerEmail,
      items: body.items, // will enrich with titles from DB in a real flow
      subtotal: result.subtotal,
      shippingCost: result.shippingCost,
      total: result.total,
      currency: 'USD',
      shippingAddress: body.shippingAddress
        ? `${body.shippingName ?? customerName}, ${body.shippingAddress}, ${body.shippingCity} ${body.shippingState} ${body.shippingZip}, ${body.shippingCountry ?? 'US'}`
        : undefined,
    }).catch((e) => console.error('[orders] email failed:', e));

    return NextResponse.json({
      ok: true,
      orderNumber: result.orderNumber,
      orderId: result.orderId,
      total: result.total,
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create order';
    console.error('[POST /api/shop/orders]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
