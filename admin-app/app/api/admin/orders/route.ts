// app/api/admin/orders/route.ts
// GET   /api/admin/orders?status=pending&limit=50&offset=0
// PATCH /api/admin/orders { id, status, trackingNumber, carrier }

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminGetOrders, adminUpdateOrderStatus } from '@/lib/shop-api';
import { sendEmail, buildOrderShippedEmail } from '@/lib/email';

const VALID_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const { data, total } = await adminGetOrders(status, limit, offset);
    return NextResponse.json({ data, total });
  } catch (err) {
    console.error('[GET /api/admin/orders]', err);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status, trackingNumber, carrier, notes } = body;

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }

    const extraFields: Record<string, unknown> = {};
    if (trackingNumber) extraFields.tracking_number = trackingNumber;
    if (carrier) extraFields.carrier = carrier;
    if (notes) extraFields.notes = notes;
    if (status === 'shipped') extraFields.shipped_at = new Date().toISOString();

    const order = await adminUpdateOrderStatus(id, status, extraFields);

    // If marked as shipped and has tracking, send email
    if (status === 'shipped' && trackingNumber && order.customer_email) {
      sendEmail({
        to: order.customer_email,
        subject: `Your order ${order.order_number} has shipped!`,
        html: buildOrderShippedEmail({
          orderNumber: order.order_number,
          customerName: order.customer_name,
          trackingNumber,
          carrier: carrier ?? 'Standard',
        }),
      }).catch((e) => console.error('[orders] shipping email failed:', e));
    }

    return NextResponse.json(order);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update order';
    console.error('[PATCH /api/admin/orders]', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
