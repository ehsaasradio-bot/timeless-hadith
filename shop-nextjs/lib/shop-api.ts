// lib/shop-api.ts
// Typed data-access layer — all Supabase queries in one place
// Used by API route handlers; never imported client-side

import { supabasePublic, getSupabaseAdmin } from './supabase-server';
import type { Product, Category, Review } from '@/types/shop';

// ─── Type helpers ─────────────────────────────────────────────────────────────

export interface DbProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  currency: string;
  badge: string | null;
  tags: string[];
  sku: string;
  is_active: boolean;
  is_digital: boolean;
  free_shipping: boolean;
  created_at: string;
  shop_categories: { slug: string; title: string } | null;
  shop_product_images: { url: string; alt_text: string; sort_order: number; is_primary: boolean }[];
  shop_inventory: { quantity_on_hand: number; quantity_reserved: number } | null;
}

export interface DbOrder {
  id: string;
  order_number: string;
  status: string;
  customer_email: string;
  customer_name: string;
  total: number;
  currency: string;
  payment_status: string;
  created_at: string;
  shop_order_items: {
    product_title: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    is_digital: boolean;
  }[];
}

function mapDbProductToProduct(row: DbProduct): Product {
  const images = (row.shop_product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({ src: img.url, alt: img.alt_text, width: 800, height: 800 }));

  const inv = row.shop_inventory;
  const available = inv ? inv.quantity_on_hand - inv.quantity_reserved : 0;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    currency: row.currency,
    images: images.length > 0 ? images : [{ src: '/shop/placeholder.jpg', alt: row.title, width: 800, height: 800 }],
    category: row.shop_categories?.title ?? '',
    categorySlug: row.shop_categories?.slug ?? '',
    rating: 4.8, // will come from reviews aggregate in a future query
    reviewCount: 0,
    badge: (row.badge as Product['badge']) ?? undefined,
    tags: row.tags ?? [],
    inStock: available > 0 || row.is_digital,
    isDigital: row.is_digital,
    freeShipping: row.free_shipping,
    sku: row.sku,
  };
}

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
  limit?: number;
  offset?: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<{ data: Product[]; total: number }> {
  const { category, search, sort = 'popular', limit = 24, offset = 0 } = filters;

  let query = supabasePublic
    .from('shop_products')
    .select(`
      *,
      shop_categories ( slug, title ),
      shop_product_images ( url, alt_text, sort_order, is_primary ),
      shop_inventory ( quantity_on_hand, quantity_reserved )
    `, { count: 'exact' })
    .eq('is_active', true);

  if (category) {
    query = query.eq('shop_categories.slug', category);
  }

  if (search) {
    // Full-text search
    query = query.textSearch(
      'title',
      search,
      { type: 'websearch', config: 'english' }
    );
  }

  // Sorting
  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    default: // 'popular' — use sort_order as proxy
      query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('[shop-api] getProducts error:', error);
    return { data: [], total: 0 };
  }

  return {
    data: (data as DbProduct[]).map(mapDbProductToProduct),
    total: count ?? 0,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabasePublic
    .from('shop_products')
    .select(`
      *,
      shop_categories ( slug, title ),
      shop_product_images ( url, alt_text, sort_order, is_primary ),
      shop_inventory ( quantity_on_hand, quantity_reserved )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return mapDbProductToProduct(data as DbProduct);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabasePublic
    .from('shop_categories')
    .select('*, shop_products(count)')
    .eq('is_active', true)
    .order('sort_order');

  if (error || !data) return [];

  return data.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    title: cat.title,
    description: cat.description ?? '',
    image: {
      src: cat.image_url ?? `/shop/categories/${cat.slug}.jpg`,
      alt: cat.image_alt ?? cat.title,
      width: 600,
      height: 800,
    },
    productCount: (cat.shop_products as { count: number }[])?.[0]?.count ?? 0,
    featured: cat.featured,
  }));
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function getReviews(productId?: string, limit = 20): Promise<Review[]> {
  let query = supabasePublic
    .from('shop_reviews')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    authorName: r.author_name,
    authorLocation: r.author_location ?? '',
    rating: r.rating,
    title: r.title,
    body: r.body,
    date: r.created_at,
    verified: r.is_verified,
    productId: r.product_id,
  }));
}

export async function submitReview(payload: {
  productId: string;
  authorName: string;
  authorEmail: string;
  authorLocation?: string;
  rating: number;
  title: string;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabasePublic.from('shop_reviews').insert({
    product_id: payload.productId,
    author_name: payload.authorName,
    author_email: payload.authorEmail,
    author_location: payload.authorLocation,
    rating: payload.rating,
    title: payload.title,
    body: payload.body,
    is_approved: false, // pending admin approval
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export async function getOrCreateCart(sessionId: string) {
  // Try to get existing cart
  let { data: cart } = await supabasePublic
    .from('shop_carts')
    .select('id')
    .eq('session_id', sessionId)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!cart) {
    const { data, error } = await supabasePublic
      .from('shop_carts')
      .insert({ session_id: sessionId })
      .select('id')
      .single();

    if (error) throw new Error('Failed to create cart: ' + error.message);
    cart = data;
  }

  return cart!.id as string;
}

export async function getCartItems(cartId: string) {
  const { data, error } = await supabasePublic
    .from('shop_cart_items')
    .select(`
      id, quantity, added_at,
      shop_products (
        id, slug, title, price, original_price, currency, is_digital, free_shipping,
        shop_product_images ( url, alt_text, is_primary )
      )
    `)
    .eq('cart_id', cartId);

  if (error) return [];
  return data ?? [];
}

export async function upsertCartItem(cartId: string, productId: string, quantity: number) {
  if (quantity <= 0) {
    return supabasePublic
      .from('shop_cart_items')
      .delete()
      .eq('cart_id', cartId)
      .eq('product_id', productId);
  }

  return supabasePublic.from('shop_cart_items').upsert(
    { cart_id: cartId, product_id: productId, quantity },
    { onConflict: 'cart_id,product_id' }
  );
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;
  items: { productId: string; quantity: number }[];
  discountCode?: string;
}

export async function createOrder(payload: CreateOrderPayload) {
  const supabase = getSupabaseAdmin();

  // Fetch products to get current prices
  const productIds = payload.items.map((i) => i.productId);
  const { data: products, error: pErr } = await supabase
    .from('shop_products')
    .select('id, title, sku, price, is_digital, is_active')
    .in('id', productIds);

  if (pErr || !products) throw new Error('Failed to fetch products');

  // Check all products are active
  const inactive = products.filter((p) => !p.is_active);
  if (inactive.length > 0) throw new Error('One or more products are no longer available');

  // Build line items
  const lineItems = payload.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product ${item.productId} not found`);
    const lineTotal = Number(product.price) * item.quantity;
    return {
      product_id: item.productId,
      product_title: product.title,
      product_sku: product.sku,
      quantity: item.quantity,
      unit_price: Number(product.price),
      line_total: lineTotal,
      is_digital: product.is_digital,
    };
  });

  const subtotal = lineItems.reduce((s, i) => s + i.line_total, 0);
  const shippingCost = lineItems.every((i) => i.is_digital) ? 0 : subtotal >= 75 ? 0 : 9.99;
  const total = subtotal + shippingCost;

  // Insert order
  const { data: order, error: oErr } = await supabase
    .from('shop_orders')
    .insert({
      customer_email: payload.customerEmail,
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      shipping_name: payload.shippingName,
      shipping_address: payload.shippingAddress,
      shipping_city: payload.shippingCity,
      shipping_state: payload.shippingState,
      shipping_zip: payload.shippingZip,
      shipping_country: payload.shippingCountry ?? 'US',
      subtotal,
      shipping_cost: shippingCost,
      total,
      currency: 'USD',
      status: 'confirmed',
      payment_status: 'pending',
    })
    .select('id, order_number')
    .single();

  if (oErr || !order) throw new Error('Failed to create order: ' + oErr?.message);

  // Insert order items (triggers inventory reservation)
  const { error: iErr } = await supabase.from('shop_order_items').insert(
    lineItems.map((item) => ({ ...item, order_id: order.id }))
  );

  if (iErr) {
    // Roll back order
    await supabase.from('shop_orders').delete().eq('id', order.id);
    throw new Error('Failed to insert order items: ' + iErr.message);
  }

  return { orderId: order.id, orderNumber: order.order_number, subtotal, shippingCost, total };
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export async function subscribeToNewsletter(email: string, interests: string[] = [], firstName?: string) {
  const { error } = await supabasePublic.from('shop_newsletter_subscribers').upsert(
    { email, interests, first_name: firstName, is_active: true, source: 'shop' },
    { onConflict: 'email' }
  );
  if (error) throw new Error(error.message);
}

// ─── Admin — Products ─────────────────────────────────────────────────────────

export async function adminGetAllProducts() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_products')
    .select(`
      *,
      shop_categories ( slug, title ),
      shop_inventory ( quantity_on_hand, quantity_reserved, low_stock_threshold )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpsertProduct(product: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_products')
    .upsert(product)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteProduct(productId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('shop_products').delete().eq('id', productId);
  if (error) throw new Error(error.message);
}

export async function adminUpdateInventory(productId: string, quantity: number, reason = 'adjustment') {
  const supabase = getSupabaseAdmin();

  // Get current inventory
  const { data: inv } = await supabase
    .from('shop_inventory')
    .select('quantity_on_hand')
    .eq('product_id', productId)
    .single();

  const delta = quantity - (inv?.quantity_on_hand ?? 0);

  await supabase.from('shop_inventory').upsert(
    { product_id: productId, quantity_on_hand: quantity },
    { onConflict: 'product_id' }
  );

  if (delta !== 0) {
    await supabase.from('shop_inventory_log').insert({
      product_id: productId,
      delta,
      reason,
    });
  }
}

// ─── Admin — Orders ───────────────────────────────────────────────────────────

export async function adminGetOrders(status?: string, limit = 50, offset = 0) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('shop_orders')
    .select('*, shop_order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: data as DbOrder[], total: count ?? 0 };
}

export async function adminUpdateOrderStatus(orderId: string, status: string, extraFields: Record<string, unknown> = {}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_orders')
    .update({ status, ...extraFields })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── Admin — Stats ────────────────────────────────────────────────────────────

export async function adminGetDashboardStats() {
  const supabase = getSupabaseAdmin();

  const [ordersRes, productsRes, subscribersRes, lowStockRes] = await Promise.all([
    supabase.from('shop_orders').select('total, status, created_at', { count: 'exact' }),
    supabase.from('shop_products').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('shop_newsletter_subscribers').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('shop_inventory')
      .select('product_id, quantity_on_hand, low_stock_threshold, shop_products(title, sku)')
      .filter('quantity_on_hand', 'lte', 5),
  ]);

  const orders = ordersRes.data ?? [];
  const revenue = orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
    .reduce((sum, o) => sum + Number(o.total), 0);

  // Revenue last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const recentRevenue = orders
    .filter((o) => o.created_at > thirtyDaysAgo && o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total), 0);

  return {
    totalOrders: ordersRes.count ?? 0,
    totalRevenue: revenue,
    recentRevenue,
    totalProducts: productsRes.count ?? 0,
    totalSubscribers: subscribersRes.count ?? 0,
    lowStockItems: lowStockRes.data ?? [],
    ordersByStatus: orders.reduce((acc: Record<string, number>, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {}),
  };
}

// ─── Admin — Categories ───────────────────────────────────────────────────────

export async function adminGetAllCategories() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_categories')
    .select('*, shop_products(count)')
    .order('sort_order');
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpsertCategory(category: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_categories')
    .upsert(category)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteCategory(categoryId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('shop_categories').delete().eq('id', categoryId);
  if (error) throw new Error(error.message);
}

// ─── Admin — Reviews ──────────────────────────────────────────────────────────

export async function adminGetAllReviews(filter?: 'pending' | 'approved') {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('shop_reviews')
    .select('*, shop_products(title, slug)')
    .order('created_at', { ascending: false });
  if (filter === 'pending')  query = query.eq('is_approved', false);
  if (filter === 'approved') query = query.eq('is_approved', true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateReview(reviewId: string, fields: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_reviews')
    .update(fields)
    .eq('id', reviewId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteReview(reviewId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('shop_reviews').delete().eq('id', reviewId);
  if (error) throw new Error(error.message);
}

// ─── Admin — Customers ────────────────────────────────────────────────────────

export async function adminGetCustomers(search?: string, limit = 50, offset = 0) {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('shop_orders')
    .select('customer_email, customer_name, total, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (search) query = query.ilike('customer_email', `%${search}%`);
  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);

  // Group by email
  const map = new Map<string, { name: string; email: string; orderCount: number; totalSpent: number; lastOrder: string }>();
  for (const row of data ?? []) {
    const existing = map.get(row.customer_email);
    if (existing) {
      existing.orderCount++;
      existing.totalSpent += Number(row.total);
      if (row.created_at > existing.lastOrder) existing.lastOrder = row.created_at;
    } else {
      map.set(row.customer_email, {
        name: row.customer_name,
        email: row.customer_email,
        orderCount: 1,
        totalSpent: Number(row.total),
        lastOrder: row.created_at,
      });
    }
  }
  return { data: Array.from(map.values()), total: count ?? 0 };
}

export async function adminGetCustomerOrders(email: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_orders')
    .select('*, shop_order_items(*)')
    .eq('customer_email', email)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// ─── Admin — Coupons ──────────────────────────────────────────────────────────

export async function adminGetAllCoupons() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_discount_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpsertCoupon(coupon: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_discount_codes')
    .upsert(coupon)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteCoupon(couponId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('shop_discount_codes').delete().eq('id', couponId);
  if (error) throw new Error(error.message);
}

// ─── Admin — Settings ─────────────────────────────────────────────────────────

export async function adminGetSettings() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('shop_settings').select('*').eq('id', 1).single();
  return data ?? {};
}

export async function adminUpdateSettings(settings: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('shop_settings')
    .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ─── Admin — Analytics ────────────────────────────────────────────────────────

export interface AnalyticsPeriod {
  gross_revenue: number;
  refunds: number;
  coupons: number;
  taxes: number;
  shipping: number;
  net_revenue: number;
  order_count: number;
}

export interface DailyStat {
  date: string;
  orders: number;
  gross_revenue: number;
  refunds: number;
  coupons: number;
  taxes: number;
  shipping: number;
  net_revenue: number;
}

function buildPeriod(rows: { total: number; status: string; shipping_cost: number; discount_amount: number }[]): AnalyticsPeriod {
  let gross = 0, refunds = 0, coupons = 0, shipping = 0;
  for (const r of rows) {
    if (r.status === 'refunded') { refunds += Number(r.total); continue; }
    if (r.status === 'cancelled') continue;
    gross    += Number(r.total);
    coupons  += Number(r.discount_amount);
    shipping += Number(r.shipping_cost);
  }
  return {
    gross_revenue: gross,
    refunds,
    coupons,
    taxes: 0,
    shipping,
    net_revenue: gross - refunds - coupons,
    order_count: rows.filter(r => r.status !== 'cancelled').length,
  };
}

export async function adminGetAnalytics(from: string, to: string) {
  const supabase = getSupabaseAdmin();

  // Calculate previous period (same duration, shifted back)
  const fromDate = new Date(from);
  const toDate   = new Date(to);
  const duration = toDate.getTime() - fromDate.getTime();
  const prevTo   = new Date(fromDate.getTime() - 1).toISOString();
  const prevFrom = new Date(fromDate.getTime() - duration).toISOString();

  const [currRes, prevRes, dailyRes] = await Promise.all([
    // Current period totals
    supabase.from('shop_orders')
      .select('total, status, shipping_cost, discount_amount')
      .gte('created_at', from).lte('created_at', to),

    // Previous period totals
    supabase.from('shop_orders')
      .select('total, status, shipping_cost, discount_amount')
      .gte('created_at', prevFrom).lte('created_at', prevTo),

    // Daily breakdown for current period
    supabase.from('shop_orders')
      .select('total, status, shipping_cost, discount_amount, created_at')
      .gte('created_at', from).lte('created_at', to)
      .order('created_at', { ascending: true }),
  ]);

  // Build daily stats map
  const dayMap = new Map<string, { orders: number; gross: number; refunds: number; coupons: number; shipping: number }>();

  // Pre-fill all dates in range so chart has no gaps
  const cursor = new Date(from);
  while (cursor <= toDate) {
    const key = cursor.toISOString().slice(0, 10);
    dayMap.set(key, { orders: 0, gross: 0, refunds: 0, coupons: 0, shipping: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const r of dailyRes.data ?? []) {
    const key = r.created_at.slice(0, 10);
    const d   = dayMap.get(key) ?? { orders: 0, gross: 0, refunds: 0, coupons: 0, shipping: 0 };
    if (r.status === 'cancelled') { dayMap.set(key, d); continue; }
    if (r.status === 'refunded') { d.refunds += Number(r.total); dayMap.set(key, d); continue; }
    d.orders++;
    d.gross    += Number(r.total);
    d.coupons  += Number(r.discount_amount);
    d.shipping += Number(r.shipping_cost);
    dayMap.set(key, d);
  }

  const daily: DailyStat[] = Array.from(dayMap.entries()).map(([date, d]) => ({
    date,
    orders: d.orders,
    gross_revenue: d.gross,
    refunds: d.refunds,
    coupons: d.coupons,
    taxes: 0,
    shipping: d.shipping,
    net_revenue: d.gross - d.refunds - d.coupons,
  }));

  return {
    current:  buildPeriod(currRes.data ?? []),
    previous: buildPeriod(prevRes.data ?? []),
    daily,
    range: { from, to, prevFrom, prevTo },
  };
}
