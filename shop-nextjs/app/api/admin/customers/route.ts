export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminGetCustomers, adminGetCustomerOrders } from '@/lib/shop-api';

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  const params = new URL(request.url).searchParams;
  const email = params.get('email');
  const search = params.get('search') ?? undefined;
  try {
    if (email) {
      return NextResponse.json(await adminGetCustomerOrders(email));
    }
    return NextResponse.json(await adminGetCustomers(search));
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
