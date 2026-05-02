// lib/kv.ts
// Cloudflare Workers KV adapter with an in-memory fallback for local dev.
//
// In production (Cloudflare Pages), the KV namespace is bound via
// `wrangler.toml` under [[kv_namespaces]] and exposed on the global
// `process.env.<BINDING>` at the edge runtime. In `next dev`, no KV binding
// exists, so we fall back to a process-local Map. The fallback is NOT durable
// across restarts and NOT shared between edge instances — it exists only so
// development and previews don't crash. Production safety depends on KV being
// configured (see DEPLOY.md).

export interface KVStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

// ─── In-memory dev fallback ────────────────────────────────────────────────

type Entry = { value: string; expiresAt: number | null };

class InMemoryKV implements KVStore {
  private store = new Map<string, Entry>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async put(key: string, value: string, opts?: { expirationTtl?: number }) {
    const expiresAt =
      opts?.expirationTtl ? Date.now() + opts.expirationTtl * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key: string) {
    this.store.delete(key);
  }
}

// Single dev-fallback instance per node process. Re-used between requests in
// `next dev` so logins persist across reloads.
const devFallback = new InMemoryKV();

// ─── Production binding lookup ─────────────────────────────────────────────

/**
 * Returns the configured KV store. In Cloudflare Pages production, the binding
 * named SHOP_KV is exposed on `process.env.SHOP_KV`. Locally, we return the
 * in-memory fallback and emit a single warning per process.
 */
let warned = false;
export function getKV(): KVStore {
  // process.env.<BINDING> on the edge is the actual KVNamespace, NOT a string.
  const binding = (process.env as unknown as { SHOP_KV?: KVStore }).SHOP_KV;
  if (binding && typeof binding.get === 'function') {
    return binding;
  }
  if (!warned) {
    console.warn(
      '[kv] SHOP_KV binding not found — falling back to in-memory store. ' +
        'This is fine for local dev. Production MUST bind SHOP_KV in wrangler.toml.',
    );
    warned = true;
  }
  return devFallback;
}
