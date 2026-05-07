# Timeless Hadith Shop — WooCommerce MCP

A small local MCP server that lets Claude talk directly to your WooCommerce store at `shop.timelesshadith.com`. No third-party automation platform, no per-operation cost — just Node.js running on your machine, talking to your store's REST API.

## Why this exists

You started by trying [Make.com](https://make.com) as a bridge, but the UX was painful (no Add Connection button on the free plan, scenarios are 5+ clicks deep). This MCP cuts out the middleman: Claude → this server → WooCommerce REST API. Faster, free, only the tools you actually want.

## Tools exposed (11 total)

### Orders
- `wc_orders_list` — list with filters (status, date range, customer, search). Paginated.
- `wc_orders_get` — get one order with full details.
- `wc_orders_update_status` — change status (e.g., processing → completed). **Triggers WooCommerce email notifications.**
- `wc_orders_add_note` — add a note (internal or customer-visible).

### Products
- `wc_products_list` — list with filters (status, stock, category, SKU, search). Paginated.
- `wc_products_get` — get one product.
- `wc_products_update` — update price, stock, status, sale price, etc.
- `wc_products_low_stock` — convenience: out-of-stock + low-stock items below a threshold.

### Customers
- `wc_customers_list` — list with filters (search, email, role).
- `wc_customers_get` — get one customer with order history summary.

### Diagnostic
- `wc_ping` — verify auth + connectivity. Run this first if other tools fail.

Each tool has the right MCP annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`) so Claude knows which ones are safe to call freely vs. which need user confirmation.

## Setup

### 1. Install dependencies

```bash
cd scripts/woocommerce-mcp
npm install
```

This installs `@modelcontextprotocol/sdk` (the only dependency).

### 2. Configure secrets

```bash
cp .env.example .env
# then edit .env and fill in:
#   WC_URL=https://shop.timelesshadith.com
#   WC_KEY=ck_...     ← from WooCommerce → Settings → Advanced → REST API
#   WC_SECRET=cs_...  ← same place, shown once on key creation
```

The `.env` file is in `.gitignore`. Never commit it.

### 3. Verify the server boots

```bash
npm start
# or
node index.js
```

You should see on stderr:
```
timeless-woocommerce-mcp listening on stdio. Store: https://shop.timelesshadith.com
```

The server is now waiting for JSON-RPC messages on stdin. Press `Ctrl+C` to stop. (This is correct stdio MCP behavior — it doesn't print anything else; the host application drives it.)

## Wiring it into Claude

### Option A — Claude Desktop (Mac/Windows)

Edit your `claude_desktop_config.json`:

- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add the `woocommerce` entry inside `mcpServers`:

```json
{
  "mcpServers": {
    "woocommerce": {
      "command": "node",
      "args": [
        "C:\\Users\\mubas\\Documents\\Claude\\Projects\\Haith\\scripts\\woocommerce-mcp\\index.js"
      ]
    }
  }
}
```

The server will read `.env` from its own directory automatically. Restart Claude Desktop. You should see the WooCommerce tools available in the next session.

### Option B — Cowork (this app)

In Cowork's settings, find the **Custom MCP** section (or similar — exact label depends on the build) and add:

- **Name:** `woocommerce`
- **Command:** `node`
- **Args:** `C:\Users\mubas\Documents\Claude\Projects\Haith\scripts\woocommerce-mcp\index.js`

If Cowork supports passing env inline, paste the `WC_URL` / `WC_KEY` / `WC_SECRET` there instead of using `.env`. Either works.

### Verifying the install

In a fresh Claude conversation, ask:

> "Use wc_ping to check if you can talk to my WooCommerce store."

A successful response looks like:
```json
{
  "ok": true,
  "store_url": "https://shop.timelesshadith.com",
  "api": "wc/v3",
  "sample_order_count": 1,
  "total_orders_in_store": 47
}
```

If you get HTTP 401 → the keys are wrong or expired.
If you get HTTP 404 → the URL doesn't point at a WooCommerce store, or `wc/v3` is disabled.
If you get a network error → check Cloudflare WAF isn't blocking `/wp-json/wc/v3/*`.

## Example prompts once it's running

- "Show me the last 10 orders, grouped by status."
- "Which products are out of stock or have stock below 5?"
- "Find the customer with email someone@example.com and show their order history."
- "Mark order 1234 as completed."
- "Add an internal note to order 1234 saying 'Customer asked for express shipping next time.'"
- "Bump the regular price of product 42 to 39.99."
- "List orders placed in the last 7 days that are still 'processing'."

## Security notes

- The MCP runs **locally on your machine only**. Nothing in this code phones home.
- Secrets live in `.env` which is gitignored — they never enter the repo.
- All HTTP traffic uses HTTPS to your store.
- The Consumer Key uses Read/Write scope; it can update orders and products. Be deliberate when asking Claude to make changes — the `destructiveHint: true` annotation on `wc_orders_update_status` and `wc_products_update` flags those tools so Claude pauses for confirmation in most clients.
- If you ever lose track of where the key is being used, **revoke it** in `WooCommerce → Settings → Advanced → REST API` and generate a new one. Update `.env`, restart the MCP.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `FATAL: WC_URL / WC_KEY / WC_SECRET must be set` | `.env` missing or unreadable | Copy `.env.example` → `.env` and fill in keys |
| `WooCommerce woocommerce_rest_authentication_error` | Bad/revoked keys | Regenerate REST API key in WP admin |
| `Network error: ENOTFOUND` | Typo in `WC_URL` | Use full URL with `https://`, no trailing slash |
| `Timeout after 15000ms` | Slow store or wrong subdomain | Increase `WC_TIMEOUT_MS` in `.env` or check site is up |
| Tool appears in Claude but does nothing | MCP not actually launched | Check Claude Desktop logs; verify the path in `claude_desktop_config.json` exists |

## Future tools (not yet built)

If you outgrow these, easy adds:
- WordPress posts (uses `wp/v2` API instead of `wc/v3`) — list/create/update blog posts, set featured image
- Coupons — list/create/update WooCommerce coupons
- Reports — sales, top sellers, customer LTV
- Webhooks — register webhooks for real-time order events

Just say the word.
