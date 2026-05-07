#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Timeless Hadith Shop — WooCommerce MCP server
   Local stdio MCP that exposes Orders / Products / Customers
   tools backed by the WooCommerce REST API v3.

   Auth: Consumer Key + Secret via Basic over HTTPS (WC standard).
   Secrets read from .env (never committed).

   Tool naming: wc_<resource>_<action>  (consistent prefix so the
   agent can find them quickly).
───────────────────────────────────────────────────────────── */

'use strict';

const fs   = require('fs');
const path = require('path');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  ListToolsRequestSchema,
  CallToolRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');

/* ── tiny .env loader (no dependency) ── */
(function loadDotEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
})();

const WC_URL    = (process.env.WC_URL || '').replace(/\/+$/, '');
const WC_KEY    = process.env.WC_KEY || '';
const WC_SECRET = process.env.WC_SECRET || '';
const WC_TIMEOUT = parseInt(process.env.WC_TIMEOUT_MS || '15000', 10);

if (!WC_URL || !WC_KEY || !WC_SECRET) {
  process.stderr.write(
    'FATAL: WC_URL / WC_KEY / WC_SECRET must be set in .env or environment.\n' +
    '       Copy .env.example to .env and fill in your WooCommerce REST keys.\n'
  );
  process.exit(1);
}

/* ── WooCommerce REST client ─────────────────────────────────
   Wraps fetch with Basic auth, JSON parsing, and useful errors.
   WooCommerce uses Consumer Key/Secret as username/password.
──────────────────────────────────────────────────────────── */
const AUTH_HEADER = 'Basic ' + Buffer.from(WC_KEY + ':' + WC_SECRET).toString('base64');

async function wcRequest(method, endpoint, opts = {}) {
  const params = opts.params || {};
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(String(v)))
    .join('&');

  const url = WC_URL + '/wp-json/wc/v3/' + endpoint.replace(/^\/+/, '') + (qs ? '?' + qs : '');
  const headers = {
    'Authorization': AUTH_HEADER,
    'Accept': 'application/json',
    'User-Agent': 'timeless-woocommerce-mcp/0.1'
  };
  const init = { method, headers };
  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
    headers['Content-Type'] = 'application/json';
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), WC_TIMEOUT);
  init.signal = ctrl.signal;

  let res;
  try {
    res = await fetch(url, init);
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('Timeout after ' + WC_TIMEOUT + 'ms hitting ' + url);
    throw new Error('Network error: ' + e.message + ' — check WC_URL is reachable.');
  }
  clearTimeout(timer);

  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch (e) {
    throw new Error('Non-JSON response (HTTP ' + res.status + '): ' + text.slice(0, 300));
  }

  if (!res.ok) {
    const code = (json && json.code) || ('http_' + res.status);
    const msg  = (json && json.message) || res.statusText;
    let hint = '';
    if (res.status === 401) hint = ' Hint: check WC_KEY / WC_SECRET, and confirm the key has Read/Write permission.';
    else if (res.status === 404) hint = ' Hint: confirm WC_URL points to the WordPress root and WooCommerce is active.';
    else if (res.status === 403) hint = ' Hint: the API key user may lack permission for this resource.';
    throw new Error('WooCommerce ' + code + ': ' + msg + hint);
  }

  // Surface pagination headers for list endpoints
  const total      = res.headers.get('x-wp-total');
  const totalPages = res.headers.get('x-wp-totalpages');
  return { data: json, total: total ? Number(total) : undefined, totalPages: totalPages ? Number(totalPages) : undefined };
}

/* ── shape helpers — strip noisy fields so agent sees concise data ── */
function shapeOrder(o) {
  return {
    id: o.id,
    number: o.number,
    status: o.status,
    date_created: o.date_created,
    total: o.total,
    currency: o.currency,
    payment_method: o.payment_method_title,
    customer_id: o.customer_id,
    customer: o.billing ? {
      name: ((o.billing.first_name || '') + ' ' + (o.billing.last_name || '')).trim(),
      email: o.billing.email,
      phone: o.billing.phone,
      country: o.billing.country
    } : null,
    line_items: (o.line_items || []).map((li) => ({
      product_id: li.product_id,
      name: li.name,
      quantity: li.quantity,
      total: li.total,
      sku: li.sku
    })),
    customer_note: o.customer_note || ''
  };
}
function shapeProduct(p) {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    status: p.status,
    type: p.type,
    price: p.price,
    regular_price: p.regular_price,
    sale_price: p.sale_price,
    on_sale: p.on_sale,
    stock_status: p.stock_status,
    stock_quantity: p.stock_quantity,
    manage_stock: p.manage_stock,
    permalink: p.permalink,
    categories: (p.categories || []).map((c) => c.name),
    short_description: (p.short_description || '').replace(/<[^>]+>/g, '').trim().slice(0, 300)
  };
}
function shapeCustomer(c) {
  return {
    id: c.id,
    email: c.email,
    name: ((c.first_name || '') + ' ' + (c.last_name || '')).trim(),
    username: c.username,
    date_created: c.date_created,
    role: c.role,
    is_paying_customer: c.is_paying_customer,
    orders_count: c.orders_count,
    total_spent: c.total_spent,
    billing_country: c.billing && c.billing.country
  };
}

/* ── tool definitions (schemas + handlers) ─────────────────── */
const TOOLS = [
  // ── ORDERS ────────────────────────────────────────────────
  {
    name: 'wc_orders_list',
    description: 'List WooCommerce orders. Supports filters by status, date range, customer. Paginated.',
    inputSchema: {
      type: 'object',
      properties: {
        status:   { type: 'string', description: 'Filter by status: any, pending, processing, on-hold, completed, cancelled, refunded, failed.', default: 'any' },
        per_page: { type: 'integer', description: 'Results per page (1–100).', default: 20, minimum: 1, maximum: 100 },
        page:     { type: 'integer', description: 'Page number (1-indexed).', default: 1, minimum: 1 },
        after:    { type: 'string',  description: 'ISO 8601 date — only orders created after this.' },
        before:   { type: 'string',  description: 'ISO 8601 date — only orders created before this.' },
        customer: { type: 'integer', description: 'Filter by customer ID.' },
        search:   { type: 'string',  description: 'Free-text search across order fields.' },
        orderby:  { type: 'string',  description: 'date | id | total | modified', default: 'date' },
        order:    { type: 'string',  description: 'asc | desc', default: 'desc' }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (a) => {
      const r = await wcRequest('GET', 'orders', { params: a });
      return { orders: r.data.map(shapeOrder), total: r.total, total_pages: r.totalPages, page: a.page || 1 };
    }
  },
  {
    name: 'wc_orders_get',
    description: 'Get a single order by ID with full details (line items, billing, shipping, notes).',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'integer', description: 'Order ID.' } },
      required: ['id']
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (a) => {
      const r = await wcRequest('GET', 'orders/' + a.id);
      return shapeOrder(r.data);
    }
  },
  {
    name: 'wc_orders_update_status',
    description: 'Change an order\'s status (e.g., processing → completed). Triggers WooCommerce email notifications.',
    inputSchema: {
      type: 'object',
      properties: {
        id:     { type: 'integer', description: 'Order ID.' },
        status: { type: 'string',  description: 'New status: pending, processing, on-hold, completed, cancelled, refunded, failed.' }
      },
      required: ['id', 'status']
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (a) => {
      const r = await wcRequest('PUT', 'orders/' + a.id, { body: { status: a.status } });
      return { id: r.data.id, status: r.data.status, updated: true };
    }
  },
  {
    name: 'wc_orders_add_note',
    description: 'Add a note to an order. Customer notes are emailed to the customer; private notes are internal only.',
    inputSchema: {
      type: 'object',
      properties: {
        id:       { type: 'integer', description: 'Order ID.' },
        note:     { type: 'string',  description: 'The note text.' },
        customer: { type: 'boolean', description: 'true = customer-visible (emailed); false = internal note.', default: false }
      },
      required: ['id', 'note']
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    handler: async (a) => {
      const r = await wcRequest('POST', 'orders/' + a.id + '/notes', { body: { note: a.note, customer_note: !!a.customer } });
      return { id: r.data.id, order_id: a.id, customer_note: r.data.customer_note, date_created: r.data.date_created };
    }
  },

  // ── PRODUCTS ──────────────────────────────────────────────
  {
    name: 'wc_products_list',
    description: 'List products with filters (status, stock, category, search). Paginated.',
    inputSchema: {
      type: 'object',
      properties: {
        per_page:     { type: 'integer', description: 'Results per page (1–100).', default: 20, minimum: 1, maximum: 100 },
        page:         { type: 'integer', description: 'Page number.', default: 1, minimum: 1 },
        search:       { type: 'string',  description: 'Free-text search across name/SKU/description.' },
        status:       { type: 'string',  description: 'any | publish | draft | pending | private', default: 'publish' },
        stock_status: { type: 'string',  description: 'instock | outofstock | onbackorder' },
        category:     { type: 'string',  description: 'Category ID (numeric, as string).' },
        sku:          { type: 'string',  description: 'Filter by exact SKU.' },
        orderby:      { type: 'string',  description: 'date | id | title | price | popularity | rating', default: 'date' },
        order:        { type: 'string',  description: 'asc | desc', default: 'desc' }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (a) => {
      const r = await wcRequest('GET', 'products', { params: a });
      return { products: r.data.map(shapeProduct), total: r.total, total_pages: r.totalPages, page: a.page || 1 };
    }
  },
  {
    name: 'wc_products_get',
    description: 'Get a single product by ID with full details.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'integer', description: 'Product ID.' } },
      required: ['id']
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (a) => {
      const r = await wcRequest('GET', 'products/' + a.id);
      return shapeProduct(r.data);
    }
  },
  {
    name: 'wc_products_update',
    description: 'Update product fields (price, stock, status, sale price, etc.). Only the provided fields are changed.',
    inputSchema: {
      type: 'object',
      properties: {
        id:             { type: 'integer', description: 'Product ID.' },
        regular_price:  { type: 'string',  description: 'Regular price as decimal string, e.g. "29.99".' },
        sale_price:     { type: 'string',  description: 'Sale price as decimal string. Empty string clears the sale.' },
        stock_quantity: { type: 'integer', description: 'Stock count (requires manage_stock=true on the product).' },
        stock_status:   { type: 'string',  description: 'instock | outofstock | onbackorder' },
        status:         { type: 'string',  description: 'publish | draft | pending | private' },
        name:           { type: 'string',  description: 'Product title.' },
        short_description: { type: 'string', description: 'Short description (HTML allowed).' }
      },
      required: ['id']
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (a) => {
      const { id, ...body } = a;
      const r = await wcRequest('PUT', 'products/' + id, { body });
      return shapeProduct(r.data);
    }
  },
  {
    name: 'wc_products_low_stock',
    description: 'Convenience: list products with low or out-of-stock status. Faster than filtering wc_products_list manually.',
    inputSchema: {
      type: 'object',
      properties: {
        threshold: { type: 'integer', description: 'Treat stock_quantity ≤ threshold as low (only applies to stock-managed products).', default: 5, minimum: 0 },
        per_page:  { type: 'integer', description: 'Max results.', default: 50, minimum: 1, maximum: 100 }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (a) => {
      // Pull all out-of-stock + on-backorder + manage_stock products and filter
      const [outOfStock, all] = await Promise.all([
        wcRequest('GET', 'products', { params: { stock_status: 'outofstock', per_page: a.per_page } }),
        wcRequest('GET', 'products', { params: { per_page: a.per_page, orderby: 'date', order: 'desc' } })
      ]);
      const lowQty = all.data
        .filter((p) => p.manage_stock && typeof p.stock_quantity === 'number' && p.stock_quantity <= a.threshold && p.stock_status !== 'outofstock');
      return {
        out_of_stock: outOfStock.data.map(shapeProduct),
        low_stock:    lowQty.map(shapeProduct),
        threshold:    a.threshold
      };
    }
  },

  // ── CUSTOMERS ─────────────────────────────────────────────
  {
    name: 'wc_customers_list',
    description: 'List customers. Paginated. Use search/email filters for lookups.',
    inputSchema: {
      type: 'object',
      properties: {
        per_page: { type: 'integer', description: 'Results per page (1–100).', default: 20, minimum: 1, maximum: 100 },
        page:     { type: 'integer', description: 'Page number.', default: 1, minimum: 1 },
        search:   { type: 'string',  description: 'Free-text search across email, name, username.' },
        email:    { type: 'string',  description: 'Filter by exact email.' },
        role:     { type: 'string',  description: 'WordPress role: customer, subscriber, administrator, etc.', default: 'customer' },
        orderby:  { type: 'string',  description: 'id | name | registered_date', default: 'registered_date' },
        order:    { type: 'string',  description: 'asc | desc', default: 'desc' }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (a) => {
      const r = await wcRequest('GET', 'customers', { params: a });
      return { customers: r.data.map(shapeCustomer), total: r.total, total_pages: r.totalPages, page: a.page || 1 };
    }
  },
  {
    name: 'wc_customers_get',
    description: 'Get a single customer by ID with full profile and order history summary.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'integer', description: 'Customer ID.' } },
      required: ['id']
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (a) => {
      const r = await wcRequest('GET', 'customers/' + a.id);
      return shapeCustomer(r.data);
    }
  },

  // ── DIAGNOSTIC ────────────────────────────────────────────
  {
    name: 'wc_ping',
    description: 'Ping the WooCommerce REST API to verify auth + connectivity. Use this first if other calls fail.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async () => {
      // The /system_status endpoint requires admin scope, so use a lightweight read.
      const r = await wcRequest('GET', 'orders', { params: { per_page: 1 } });
      return {
        ok: true,
        store_url: WC_URL,
        api: 'wc/v3',
        sample_order_count: r.data.length,
        total_orders_in_store: r.total
      };
    }
  }
];

/* ── MCP server wiring ─────────────────────────────────────── */
const server = new Server(
  { name: 'timeless-woocommerce-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ handler, ...rest }) => rest)
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) {
    return {
      isError: true,
      content: [{ type: 'text', text: 'Unknown tool: ' + name }]
    };
  }
  try {
    const result = await tool.handler(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: 'Tool ' + name + ' failed: ' + err.message }]
    };
  }
});

(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('timeless-woocommerce-mcp listening on stdio. Store: ' + WC_URL + '\n');
})().catch((e) => {
  process.stderr.write('Fatal: ' + e.message + '\n');
  process.exit(1);
});
