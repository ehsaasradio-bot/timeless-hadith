# AlHudah Quran Platform — AI-Powered Search & Chat System Reference Guide

**Version 1.0** | Hybrid Vector + Full-Text Search with OpenAI GPT-4o-mini  
**Target Stack:** Cloudflare Workers (proxy) + OpenAI API + Supabase pgvector + Web Speech API

---

## TABLE OF CONTENTS

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Cloudflare Worker (API Proxy)](#2-cloudflare-worker-api-proxy)
3. [OpenAI Integration](#3-openai-integration)
4. [Supabase Functions (Search Backend)](#4-supabase-functions-search-backend)
5. [Frontend Implementation (search.html)](#5-frontend-implementation-searchhtml)
6. [AI Search JavaScript Module](#6-ai-search-javascript-module)
7. [Embedding Generation & Data Population](#7-embedding-generation--data-population)
8. [Web Speech API (Voice Search)](#8-web-speech-api-voice-search)
9. [Search Suggestions & Examples](#9-search-suggestions--examples)
10. [Rate Limiting & Cost Control](#10-rate-limiting--cost-control)
11. [Deployment & Monitoring](#11-deployment--monitoring)
12. [Troubleshooting & Edge Cases](#12-troubleshooting--edge-cases)

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### 1.1 Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│ USER INTERACTION LAYER (Frontend - search.html)                      │
│                                                                       │
│  Input: Text query or voice → Debounce 500ms → Validation            │
│  Optional: Web Speech API converts audio to text                      │
│  Display loading spinner                                             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ POST /api/ai-search
┌─────────────────────────────────────────────────────────────────────┐
│ CLOUDFLARE WORKER (API Proxy) — Secure middleware                   │
│                                                                       │
│  1. Validate input (strip whitespace, check length 5-1000 chars)     │
│  2. Rate limit check (10 req/min per IP)                             │
│  3. Call OpenAI to generate embedding vector                         │
│  4. Call Supabase RPC for vector similarity search                   │
│  5. Call Supabase RPC for full-text search                           │
│  6. Merge and rank results (weighted scoring)                        │
│  7. Call OpenAI GPT-4o-mini with grounded context                    │
│  8. Return structured response                                       │
│  9. Error handling + graceful degradation                            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────────┐
        │ OpenAI API       │  │ Supabase PostgreSQL  │
        │                  │  │                      │
        │ • Embeddings     │  │ • Vector search RPC  │
        │ • GPT-4o-mini    │  │ • Full-text search   │
        │                  │  │ • Result ranking     │
        └──────────────────┘  └──────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ RESPONSE LAYER (Frontend)                                            │
│                                                                       │
│  Render: AI Answer Card                                              │
│          Numbered Source Verse Cards (up to 10)                      │
│          Citations with Surah:Ayah references                        │
│          Click handlers → Navigate to full Surah page                │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Design Principles

| Principle | Implementation |
|-----------|-----------------|
| **Security** | OpenAI key never exposed to client; all calls proxy through Cloudflare Worker |
| **Performance** | Vector search <200ms; full-text <100ms; AI answer gen <2s total |
| **Cost Control** | Rate limiting prevents token waste; embedding cache; common queries cached |
| **Accuracy** | Hybrid search (vector + FTS) captures semantic + keyword matches; AI grounded in DB only |
| **Responsiveness** | Debounce 500ms; show loading state; no UI blocking |
| **Fallback** | If OpenAI fails, return search results only; if Supabase fails, serve cached results |

---

## 2. CLOUDFLARE WORKER (API PROXY)

### 2.1 Why a Cloudflare Worker?

**Problem:** OpenAI API key cannot be safely exposed to the browser (frontend JavaScript).

**Solution:** Use a Cloudflare Worker as a secure proxy:
- Intercepts requests from the frontend
- Calls OpenAI with the hidden API key
- Returns results to frontend without exposing credentials
- Adds rate limiting and request validation

**Additional Benefits:**
- Cloudflare edge network is fast and near users
- Built-in caching reduces API calls
- DDoS protection included

### 2.2 Worker Project Structure

```
alhudah-worker/
├── src/
│   ├── index.js              # Main worker entry point
│   ├── openai.js             # OpenAI API wrapper
│   ├── supabase.js           # Supabase RPC wrapper
│   ├── search.js             # Search ranking logic
│   ├── validation.js         # Input validation
│   └── rate-limit.js         # Rate limiting (in-memory + KV)
├── wrangler.toml             # Worker config
├── package.json
└── README.md
```

### 2.3 Complete Worker Code: src/index.js

```javascript
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  AlHudah AI Search Worker — Cloudflare Worker                                ║
 * ║                                                                               ║
 * ║  Purpose: Secure proxy for OpenAI embeddings & chat completions              ║
 * ║  Features: Rate limiting, input validation, hybrid search orchestration      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import OpenAIService from './openai.js';
import SupabaseService from './supabase.js';
import { searchAndRank } from './search.js';
import { validateSearchQuery, sanitizeInput } from './validation.js';
import RateLimiter from './rate-limit.js';

// Initialize services
const openai = new OpenAIService(env.OPENAI_API_KEY);
const supabase = new SupabaseService(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
const rateLimiter = new RateLimiter(env.RATE_LIMIT_KV);

/**
 * Main handler for /api/ai-search endpoint
 * Accepts: POST with JSON body { query: "What does Quran say about patience?" }
 * Returns: { answer, verses: [...], status, duration_ms }
 */
export default {
  async fetch(request, env, ctx) {
    // 1. CORS headers
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // 2. Only accept POST
    if (request.method !== 'POST') {
      return respondError(405, 'Method not allowed. Use POST.');
    }

    // 3. Parse request
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return respondError(400, 'Invalid JSON body.');
    }

    const { query } = requestBody;
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const startTime = Date.now();

    // 4. INPUT VALIDATION
    const validationError = validateSearchQuery(query);
    if (validationError) {
      return respondError(400, validationError);
    }

    const sanitizedQuery = sanitizeInput(query);

    // 5. RATE LIMITING (10 requests per minute per IP)
    const rateLimitKey = `alhudah-search:${clientIP}`;
    const isAllowed = await rateLimiter.check(rateLimitKey, 10, 60); // 10 req/60s

    if (!isAllowed) {
      return respondError(
        429,
        'Rate limit exceeded. Max 10 requests per minute.'
      );
    }

    try {
      // 6. GENERATE EMBEDDING for semantic search
      const embedding = await openai.generateEmbedding(sanitizedQuery);

      // 7. SUPABASE: VECTOR SIMILARITY SEARCH
      const vectorResults = await supabase.searchByVector(
        embedding,
        10, // match_count: get top 10
        0.7 // match_threshold: cosine similarity > 0.7
      );

      // 8. SUPABASE: FULL-TEXT SEARCH
      const textResults = await supabase.searchByText(sanitizedQuery, 10);

      // 9. MERGE AND RANK RESULTS
      const mergedResults = searchAndRank(vectorResults, textResults);

      // 10. PREPARE CONTEXT FOR AI ANSWER GENERATION
      const contextString = mergedResults
        .slice(0, 10) // Top 10 results
        .map(
          (v, idx) =>
            `${idx + 1}. (${v.surah_number}:${v.ayah_number}) ${v.text_english}`
        )
        .join('\n');

      // 11. CALL GPT-4o-mini TO GENERATE GROUNDED ANSWER
      const systemPrompt = `You are a knowledgeable Islamic scholar and Quranic expert for AlHudah.com.
Answer questions about the Quran using ONLY the provided verses below.
Always cite the exact Surah and Ayah numbers (e.g., 2:255, 39:42).
If the provided verses don't contain sufficient information, say so honestly.
Be respectful, accurate, and avoid sectarian bias.
Never invent or fabricate Quranic text.
Keep answers concise (150-250 words).`;

      const userPrompt = `User Question: ${sanitizedQuery}

Relevant Verses:
${contextString}

Please provide a thoughtful, accurate answer based only on the verses above.`;

      const aiAnswer = await openai.generateCompletion(
        systemPrompt,
        userPrompt,
        0.3, // low temperature for factuality
        500 // max_tokens
      );

      // 12. BUILD RESPONSE
      const response = {
        success: true,
        answer: aiAnswer,
        verses: mergedResults.slice(0, 10).map((v) => ({
          ayah_key: v.ayah_key,
          surah_number: v.surah_number,
          ayah_number: v.ayah_number,
          text_arabic: v.text_arabic,
          text_english: v.text_english,
          text_urdu: v.text_urdu || null,
          similarity_score: Math.round(v.score * 100) / 100,
          source: v.source, // 'vector' or 'text' or 'hybrid'
        })),
        metadata: {
          query: sanitizedQuery,
          result_count: mergedResults.length,
          duration_ms: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          rate_limit_remaining: 10 - (await rateLimiter.getCount(rateLimitKey)),
        },
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
          'Cache-Control': 'public, max-age=300', // Cache 5 minutes
        },
      });
    } catch (error) {
      console.error('AI Search Error:', error);

      // 13. GRACEFUL DEGRADATION: Return search results without AI answer
      try {
        const fallbackResults = await supabase.searchByText(
          sanitizedQuery,
          10
        );

        return new Response(
          JSON.stringify({
            success: false,
            answer: null,
            error:
              'AI service temporarily unavailable. Showing search results only.',
            verses: fallbackResults.slice(0, 10),
            metadata: {
              duration_ms: Date.now() - startTime,
              timestamp: new Date().toISOString(),
            },
          }),
          {
            status: 503,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
            },
          }
        );
      } catch (fallbackError) {
        return respondError(500, 'Search service temporarily unavailable.');
      }
    }
  },
};

/**
 * Helper: Format error response
 */
function respondError(status, message) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      status,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
```

### 2.4 OpenAI Service: src/openai.js

```javascript
/**
 * OpenAI API wrapper for embeddings and chat completions
 */

class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
    this.embeddingModel = 'text-embedding-3-small';
    this.chatModel = 'gpt-4o-mini';
  }

  /**
   * Generate embedding vector for a text query
   * Input: "What does the Quran say about patience?"
   * Output: [0.123, -0.456, 0.789, ...] (1536 dimensions)
   */
  async generateEmbedding(text) {
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.embeddingModel,
        input: text,
        encoding_format: 'float',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI Embedding Error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    return data.data[0].embedding; // Array of 1536 floats
  }

  /**
   * Generate AI answer using GPT-4o-mini
   * Provides context (grounded verses) and expects factual response
   */
  async generateCompletion(systemPrompt, userPrompt, temperature, maxTokens) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.chatModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI Chat Error (${response.status}): ${errorText}`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export default OpenAIService;
```

### 2.5 Supabase Service: src/supabase.js

```javascript
/**
 * Supabase PostgreSQL wrapper for hybrid search
 * Calls RPC functions to invoke search stored procedures
 */

class SupabaseService {
  constructor(supabaseUrl, serviceKey) {
    this.supabaseUrl = supabaseUrl;
    this.serviceKey = serviceKey;
  }

  /**
   * Call Supabase RPC: search_ayahs_by_embedding
   * Input: embedding vector (1536 dimensions)
   * Output: [{ayah_key, surah_number, ayah_number, text_arabic, text_english, similarity}]
   */
  async searchByVector(embedding, matchCount = 10, threshold = 0.7) {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/rpc/search_ayahs_by_embedding`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.serviceKey}`,
          'X-Client-Info': 'alhudah-worker',
        },
        body: JSON.stringify({
          query_embedding: embedding,
          match_count: matchCount,
          match_threshold: threshold,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Supabase Vector Search Error (${response.status}): ${errorText}`
      );
    }

    const results = await response.json();
    return results.map((r) => ({
      ...r,
      source: 'vector',
      score: r.similarity, // Similarity score 0-1
    }));
  }

  /**
   * Call Supabase RPC: search_ayahs_by_text
   * Input: text query (e.g., "patience", "mercy")
   * Output: [{ayah_key, surah_number, ayah_number, text_arabic, text_english, rank}]
   */
  async searchByText(query, resultLimit = 10) {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/rpc/search_ayahs_by_text`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.serviceKey}`,
          'X-Client-Info': 'alhudah-worker',
        },
        body: JSON.stringify({
          search_query: query,
          result_limit: resultLimit,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Supabase Full-Text Search Error (${response.status}): ${errorText}`
      );
    }

    const results = await response.json();
    return results.map((r, idx) => ({
      ...r,
      source: 'text',
      score: 1 - idx * 0.1, // Ranking: first result = 1.0, decreasing
    }));
  }
}

export default SupabaseService;
```

### 2.6 Search Ranking Logic: src/search.js

```javascript
/**
 * Merge vector and full-text search results
 * Weight vector results (semantic) more heavily than text results
 */

export function searchAndRank(vectorResults, textResults) {
  // Build maps for quick lookup
  const vectorMap = new Map(vectorResults.map((r) => [r.ayah_key, r]));
  const textMap = new Map(textResults.map((r) => [r.ayah_key, r]));

  // Weighted scoring: vector (0.7) + text (0.3)
  const combined = new Map();

  // Add vector results
  vectorResults.forEach((v) => {
    combined.set(v.ayah_key, {
      ...v,
      score: v.score * 0.7,
      sources: ['vector'],
    });
  });

  // Add/merge text results
  textResults.forEach((t) => {
    const key = t.ayah_key;
    if (combined.has(key)) {
      const existing = combined.get(key);
      existing.score += t.score * 0.3;
      existing.sources.push('text');
    } else {
      combined.set(key, {
        ...t,
        score: t.score * 0.3,
        sources: ['text'],
      });
    }
  });

  // Sort by combined score and return
  return Array.from(combined.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
```

### 2.7 Input Validation: src/validation.js

```javascript
/**
 * Validate and sanitize user search queries
 */

export function validateSearchQuery(query) {
  // Check required
  if (!query || typeof query !== 'string') {
    return 'Query is required and must be a string.';
  }

  const trimmed = query.trim();

  // Check length: 5-1000 characters
  if (trimmed.length < 5) {
    return 'Query must be at least 5 characters long.';
  }

  if (trimmed.length > 1000) {
    return 'Query must not exceed 1000 characters.';
  }

  // Check for injection (basic): no < > { } or SQL keywords
  if (/<|>|{|}|;|--|\/\*|\*\//.test(trimmed)) {
    return 'Invalid characters detected in query.';
  }

  return null; // Valid
}

/**
 * Sanitize input: trim, remove extra whitespace
 */
export function sanitizeInput(query) {
  return query
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .slice(0, 1000); // Enforce max length
}
```

### 2.8 Rate Limiting: src/rate-limit.js

```javascript
/**
 * Rate limiter using Cloudflare KV storage
 * Tracks requests per IP over a time window
 */

class RateLimiter {
  constructor(kvNamespace) {
    this.kv = kvNamespace;
  }

  /**
   * Check if request is allowed
   * Returns: true (allowed), false (rate limit exceeded)
   */
  async check(key, limit, windowSeconds) {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - windowSeconds;

    // Get counter from KV
    let counter = await this.kv.get(key);
    counter = counter ? JSON.parse(counter) : { count: 0, expires: now + windowSeconds };

    // If window expired, reset
    if (now >= counter.expires) {
      counter = { count: 0, expires: now + windowSeconds };
    }

    // Increment count
    counter.count++;

    // Save back to KV
    await this.kv.put(
      key,
      JSON.stringify(counter),
      { expirationTtl: windowSeconds }
    );

    return counter.count <= limit;
  }

  /**
   * Get current request count for a key
   */
  async getCount(key) {
    const counter = await this.kv.get(key);
    return counter ? JSON.parse(counter).count : 0;
  }
}

export default RateLimiter;
```

### 2.9 wrangler.toml Configuration

```toml
# ╔═══════════════════════════════════════════════════════════════╗
# ║  Cloudflare Worker Configuration for AlHudah AI Search        ║
# ╚═══════════════════════════════════════════════════════════════╝

name = "alhudah-ai-search-worker"
main = "src/index.js"
compatibility_date = "2024-12-01"

# Environment: Production
env = "production"

# Build configuration
build = { command = "npm run build", cwd = "." }

# Triggers
[triggers.crons]
# Optional: health check every 5 minutes
crons = ["*/5 * * * *"]

# Cloudflare KV namespace binding for rate limiting
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_KV_NAMESPACE_PREVIEW_ID"

# Environment variables (not secrets)
[vars]
SUPABASE_URL = "https://dwcsledifvnyrunxejzd.supabase.co"
ALLOWED_ORIGINS = "https://alhudah.com,https://alhudah.pages.dev,http://localhost:3000"

# Secrets (set via: wrangler secret put OPENAI_API_KEY)
# Secrets are NOT committed to the repo
# OPENAI_API_KEY = "" (set via CLI)
# SUPABASE_SERVICE_KEY = "" (set via CLI)

# Observability
[observability]
enabled = true

# Routes (optional, if using custom domain)
[[routes]]
pattern = "alhudah.com/api/ai-search"
zone_name = "alhudah.com"

[[routes]]
pattern = "*.alhudah.pages.dev/api/ai-search"
zone_name = "pages.dev"
```

### 2.10 package.json

```json
{
  "name": "alhudah-ai-search-worker",
  "version": "1.0.0",
  "description": "Cloudflare Worker for AlHudah AI-powered Quran search",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "build": "esbuild src/index.js --bundle --platform=node --format=esm --outfile=dist/worker.js",
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "node --test test/**/*.test.js"
  },
  "dependencies": {
    "wrangler": "^3.0.0"
  },
  "devDependencies": {
    "esbuild": "^0.19.0"
  }
}
```

### 2.11 Deployment Steps

```bash
# 1. Clone or create worker directory
cd alhudah-worker

# 2. Install dependencies
npm install

# 3. Authenticate with Cloudflare
wrangler login

# 4. Set secrets (will prompt for values)
wrangler secret put OPENAI_API_KEY
wrangler secret put SUPABASE_SERVICE_KEY

# 5. Deploy to Cloudflare
wrangler deploy

# 6. Get deployed URL
wrangler deployments list

# Output: https://alhudah-ai-search-worker.YOUR_ACCOUNT.workers.dev/

# 7. Test the worker
curl -X POST https://alhudah-ai-search-worker.YOUR_ACCOUNT.workers.dev/api/ai-search \
  -H "Content-Type: application/json" \
  -d '{"query": "What does Quran say about patience?"}'
```

---

## 3. OPENAI INTEGRATION

### 3.1 API Keys & Setup

**Obtain API Key:**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Click **"Billing"** → **"Usage"** to set up billing
4. Go to **"API keys"** → **"Create new secret key"**
5. Copy the key (starts with `sk-`)
6. Store securely in Cloudflare Worker secrets (never in code)

**Cost Estimate (April 2026 pricing):**
| Model | Cost | Usage |
|-------|------|-------|
| text-embedding-3-small | $0.02 per 1M tokens | ~1,000 searches = 1M tokens |
| gpt-4o-mini | $0.15 per 1M input tokens | ~2,000 searches @ 1000 chars avg = 1M tokens |
| **Total** | **~$0.20** | **per 1,000 searches** |

**Monthly Budget (10,000 searches):**
- Embeddings: $0.20
- Chat: $1.50
- **Total: ~$1.70/month**

### 3.2 Embedding Generation: text-embedding-3-small

**Purpose:** Convert text (user query or verse) into a numeric vector (1536 dimensions) that captures semantic meaning. Similar queries have similar vectors; dissimilar queries have dissimilar vectors.

**API Call Example:**

```javascript
async function generateEmbedding(query) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float',
    }),
  });

  const data = await response.json();
  return data.data[0].embedding; // Array of 1536 floats
}

// Example:
const embedding = await generateEmbedding('What does the Quran say about patience?');
console.log(embedding.length); // 1536
console.log(embedding[0]); // -0.023456789...
```

**Input:** Text string (up to 8,192 tokens ~32KB)  
**Output:** Array of 1536 floats  
**Cost:** $0.02 per 1 million input tokens (~50K queries per dollar)  
**Latency:** ~200ms

**Key Properties:**
- Deterministic: Same input always produces same embedding
- High-dimensional: 1536 dimensions capture nuanced meaning
- Normalized: Can use cosine similarity for comparison

### 3.3 Chat Completion: gpt-4o-mini

**Purpose:** Generate natural language answers to user questions, grounded in search results.

**System Prompt (For Quranic Answers):**

```
You are a knowledgeable Islamic scholar and Quranic expert for AlHudah.com.

Your role:
- Answer questions about the Quran using ONLY the provided verses
- Always cite the exact Surah and Ayah numbers (e.g., Surah 2, Ayah 255)
- If provided verses don't contain sufficient information, say so honestly
- Maintain respect and avoid sectarian bias
- Never invent, fabricate, or hallucinate Quranic text

Tone: Academic, respectful, authoritative, accessible
Length: Concise (150-250 words)

Format:
- Start with a direct answer to the question
- Provide relevant verse citations
- End with practical reflection or application
```

**API Call Example:**

```javascript
async function generateAnswer(systemPrompt, userPrompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Low creativity, high factuality
      max_tokens: 500,
      top_p: 0.9,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// Example usage:
const systemPrompt = `You are a knowledgeable Islamic scholar...`;
const userPrompt = `User Question: What does the Quran say about patience?

Relevant Verses:
1. (16:127) And endure patiently, [O Muhammad], and your patience is not but through Allah.
2. (2:155) And We will surely test you with something of fear and hunger and a loss of wealth and lives...

Please provide a thoughtful, accurate answer based only on the verses above.`;

const answer = await generateAnswer(systemPrompt, userPrompt);
console.log(answer);
```

**Parameters:**
| Parameter | Value | Reason |
|-----------|-------|--------|
| `model` | `gpt-4o-mini` | Fast, cost-effective, good quality |
| `temperature` | `0.3` | Low randomness; factual, consistent answers |
| `max_tokens` | `500` | Keeps answers concise |
| `top_p` | `0.9` | Reduces unlikely responses |

**Cost:** $0.15 per 1M input tokens (~65,000 queries per dollar)  
**Latency:** ~800ms-2s

### 3.4 Anti-Hallucination: Grounding Mechanism

**Problem:** LLMs can "hallucinate" (invent information not in training data or context).

**Solution:** Provide explicit context from database:

```javascript
// DON'T DO THIS (hallucination risk):
const prompt = `What does the Quran say about patience?`;
const answer = await openai.generateCompletion(prompt);
// ❌ Risk: Model may invent verses or incorrect citations

// DO THIS (grounded):
const verses = await supabase.search('patience');
const context = verses
  .map((v) => `(${v.surah}:${v.ayah}) ${v.text_english}`)
  .join('\n');

const prompt = `Based ONLY on these verses:
${context}

Answer: What does the Quran say about patience?`;
const answer = await openai.generateCompletion(prompt);
// ✓ Model can only reference provided verses
```

**Validation Strategy:**
1. Generate embedding for user query
2. Search database for matching verses
3. Pass only those verses to AI
4. AI generates answer citing only provided verses
5. Frontend displays both answer and source verses

---

## 4. SUPABASE FUNCTIONS (SEARCH BACKEND)

### 4.1 Vector Similarity Search RPC

**Function Name:** `search_ayahs_by_embedding`

**Purpose:** Find verses semantically similar to a user query using pgvector.

**SQL Implementation:**

```sql
CREATE OR REPLACE FUNCTION search_ayahs_by_embedding(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 10,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  ayah_key TEXT,
  surah_number INTEGER,
  ayah_number INTEGER,
  text_arabic TEXT,
  text_english TEXT,
  text_urdu TEXT,
  similarity FLOAT,
  juz INTEGER,
  page INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.ayah_key,
    a.surah_number,
    a.ayah_number,
    a.text_arabic,
    a.text_english,
    a.text_urdu,
    1 - (a.embedding <=> query_embedding) AS similarity,
    a.juz,
    a.page
  FROM ayahs a
  WHERE a.embedding IS NOT NULL
    AND 1 - (a.embedding <=> query_embedding) > match_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create index for fast vector search
CREATE INDEX IF NOT EXISTS idx_ayahs_embedding_ivfflat
ON ayahs USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**How It Works:**

1. Takes user query embedding (1536 dimensions)
2. Compares to all verse embeddings using cosine distance operator `<=>`
3. Converts distance to similarity: `1 - distance` (higher = more similar)
4. Filters by threshold (similarity > 0.7)
5. Returns top 10 most similar verses

**Example Usage (from Worker):**

```javascript
const queryEmbedding = await openai.generateEmbedding(
  'What does Quran say about patience?'
);

const results = await supabase.rpc('search_ayahs_by_embedding', {
  query_embedding: queryEmbedding,
  match_count: 10,
  match_threshold: 0.7,
});

// Returns:
// [
//   {
//     ayah_key: '16:127',
//     surah_number: 16,
//     ayah_number: 127,
//     text_english: 'And endure patiently...',
//     similarity: 0.89
//   },
//   ...
// ]
```

**Performance:**
- With IVFFlat index on 6,236 verses: <100ms
- Without index: <500ms (full table scan)

### 4.2 Full-Text Search RPC

**Function Name:** `search_ayahs_by_text`

**Purpose:** Find verses matching keyword queries (e.g., "mercy", "patience", "forgiveness").

**SQL Implementation:**

```sql
CREATE OR REPLACE FUNCTION search_ayahs_by_text(
  search_query TEXT,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  ayah_key TEXT,
  surah_number INTEGER,
  ayah_number INTEGER,
  text_arabic TEXT,
  text_english TEXT,
  text_urdu TEXT,
  rank FLOAT,
  juz INTEGER,
  page INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.ayah_key,
    a.surah_number,
    a.ayah_number,
    a.text_arabic,
    a.text_english,
    a.text_urdu,
    ts_rank(a.search_vector, plainto_tsquery('english', search_query)) AS rank,
    a.juz,
    a.page
  FROM ayahs a
  WHERE a.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(a.search_vector, plainto_tsquery('english', search_query)) DESC
  LIMIT result_limit;
END;
$$;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_ayahs_search_vector_gin
ON ayahs USING GIN(search_vector);
```

**How It Works:**

1. Takes keyword search query (e.g., "mercy")
2. Converts to PostgreSQL full-text search query format
3. Matches against pre-computed search vectors (tsvector) on each verse
4. Ranks by relevance (TF-IDF)
5. Returns top 10 results

**Example Usage:**

```javascript
const results = await supabase.rpc('search_ayahs_by_text', {
  search_query: 'mercy patience forgiveness',
  result_limit: 10,
});

// Returns verses matching any of: mercy, patience, forgiveness
```

**Search Vector Maintenance:**

When inserting/updating verses, maintain the `search_vector`:

```sql
-- Trigger to auto-generate search_vector
CREATE OR REPLACE FUNCTION update_ayah_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.text_english, '')), 'A') ||
    setweight(to_tsvector('arabic', COALESCE(NEW.text_arabic, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_ayah_search_vector
BEFORE INSERT OR UPDATE ON ayahs
FOR EACH ROW
EXECUTE FUNCTION update_ayah_search_vector();
```

### 4.3 Hybrid Search Function (Optional Advanced)

**Purpose:** Combine vector and full-text results into one ranked list.

```sql
CREATE OR REPLACE FUNCTION search_ayahs_hybrid(
  query_embedding VECTOR(1536),
  search_query TEXT,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  ayah_key TEXT,
  surah_number INTEGER,
  ayah_number INTEGER,
  text_arabic TEXT,
  text_english TEXT,
  text_urdu TEXT,
  combined_score FLOAT,
  source TEXT,
  juz INTEGER,
  page INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  vector_results RECORD;
  text_results RECORD;
BEGIN
  -- Vector results (weight 0.7)
  WITH vector_matches AS (
    SELECT
      a.ayah_key,
      a.surah_number,
      a.ayah_number,
      a.text_arabic,
      a.text_english,
      a.text_urdu,
      (1 - (a.embedding <=> query_embedding)) * 0.7 AS score,
      'vector'::TEXT AS source,
      a.juz,
      a.page,
      ROW_NUMBER() OVER (ORDER BY a.embedding <=> query_embedding) AS rn
    FROM ayahs a
    WHERE a.embedding IS NOT NULL
      AND 1 - (a.embedding <=> query_embedding) > 0.6
  ),
  -- Full-text results (weight 0.3)
  text_matches AS (
    SELECT
      a.ayah_key,
      a.surah_number,
      a.ayah_number,
      a.text_arabic,
      a.text_english,
      a.text_urdu,
      (ts_rank(a.search_vector, plainto_tsquery('english', search_query)) * 0.3) AS score,
      'text'::TEXT AS source,
      a.juz,
      a.page,
      ROW_NUMBER() OVER (ORDER BY ts_rank(a.search_vector, plainto_tsquery('english', search_query)) DESC) AS rn
    FROM ayahs a
    WHERE a.search_vector @@ plainto_tsquery('english', search_query)
  ),
  -- Merge and deduplicate
  merged AS (
    SELECT
      COALESCE(vm.ayah_key, tm.ayah_key) AS ayah_key,
      COALESCE(vm.surah_number, tm.surah_number) AS surah_number,
      COALESCE(vm.ayah_number, tm.ayah_number) AS ayah_number,
      COALESCE(vm.text_arabic, tm.text_arabic) AS text_arabic,
      COALESCE(vm.text_english, tm.text_english) AS text_english,
      COALESCE(vm.text_urdu, tm.text_urdu) AS text_urdu,
      COALESCE(vm.score, 0) + COALESCE(tm.score, 0) AS combined_score,
      CASE
        WHEN vm.ayah_key IS NOT NULL AND tm.ayah_key IS NOT NULL THEN 'hybrid'
        WHEN vm.ayah_key IS NOT NULL THEN 'vector'
        ELSE 'text'
      END AS source,
      COALESCE(vm.juz, tm.juz) AS juz,
      COALESCE(vm.page, tm.page) AS page
    FROM vector_matches vm
    FULL OUTER JOIN text_matches tm ON vm.ayah_key = tm.ayah_key
  )
  RETURN QUERY
  SELECT * FROM merged
  ORDER BY combined_score DESC
  LIMIT result_limit;
END;
$$;
```

---

## 5. FRONTEND IMPLEMENTATION (search.html)

### 5.1 HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Search — AlHudah Quran Platform</title>
    <meta
      name="description"
      content="Ask the Quran anything. AI-powered search with voice support."
    />
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body>
    <!-- Navigation (shared) -->
    <nav class="navbar">
      <a href="/" class="logo">AlHudah</a>
      <div class="nav-links">
        <a href="/search.html" class="active">Search</a>
        <a href="/quran.html">Quran</a>
        <a href="/about.html">About</a>
      </div>
    </nav>

    <!-- Hero Section with Search Card -->
    <section class="hero">
      <div class="container">
        <h1>Ask the Quran</h1>
        <p class="subtitle">
          Discover answers to your questions about Islamic teachings
        </p>

        <!-- Main Search Card -->
        <div class="ai-search-card">
          <form id="searchForm" class="search-form">
            <!-- Text Input -->
            <div class="input-wrapper">
              <input
                type="text"
                id="searchInput"
                class="search-input"
                placeholder="What does the Quran say about patience?"
                aria-label="Search the Quran"
              />

              <!-- Voice Input Button -->
              <button
                type="button"
                id="voiceBtn"
                class="voice-btn"
                aria-label="Search by voice"
                title="Click to speak your question"
              >
                <svg
                  class="mic-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M12 1a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                  />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <span class="recording-indicator" id="recordingIndicator"></span>
              </button>

              <!-- Submit Button -->
              <button
                type="submit"
                class="search-btn"
                id="submitBtn"
                aria-label="Search"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>

            <!-- Search Suggestions -->
            <div class="search-suggestions" id="suggestions">
              <p class="suggestions-label">Try asking:</p>
              <ul>
                <li>
                  <a href="#" class="suggestion"
                    >What does Quran say about patience?</a
                  >
                </li>
                <li>
                  <a href="#" class="suggestion"
                    >Verses about mercy and forgiveness</a
                  >
                </li>
                <li>
                  <a href="#" class="suggestion"
                    >What is the reward for charity?</a
                  >
                </li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Results Section (populated by JavaScript) -->
    <section class="results-section">
      <div class="container">
        <div id="resultsContainer" class="results-container"></div>
      </div>
    </section>

    <!-- Scripts -->
    <script src="/js/ai-search.js"></script>
    <script>
      // Initialize search module when DOM is ready
      document.addEventListener('DOMContentLoaded', () => {
        window.TH_AI.init({
          workerURL: '/api/ai-search',
          maxRetries: 3,
          retryDelay: 1000,
        });
      });
    </script>
  </body>
</html>
```

### 5.2 CSS Styling (search.html)

```css
/* ─────────────────────────────────────────────────────────────
   AI Search Styling
   ───────────────────────────────────────────────────────────── */

.hero {
  padding: 60px 20px;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  margin-bottom: 40px;
}

.ai-search-card {
  max-width: 760px;
  margin: 0 auto;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Input wrapper with voice button */
.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.search-input {
  flex: 1;
  padding: 14px 16px;
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  transition: all 0.2s ease;
  background: var(--input-bg);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
}

/* Voice button */
.voice-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  min-width: 50px;
  padding: 0;
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  background: var(--input-bg);
  color: var(--accent);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.voice-btn:hover {
  border-color: var(--accent);
  background: var(--accent-light);
}

.voice-btn.recording {
  border-color: var(--accent);
  background: var(--accent-light);
}

.mic-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

/* Recording indicator (pulsing dot) */
.recording-indicator {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0;
  right: 6px;
  top: 6px;
}

.voice-btn.recording .recording-indicator {
  animation: pulse 1s ease-in-out infinite;
  opacity: 1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Submit button */
.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  min-width: 50px;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: var(--accent);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
}

.search-btn:hover {
  background: var(--accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.4);
}

.search-btn:active {
  transform: translateY(0);
}

.search-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

/* Search suggestions */
.search-suggestions {
  padding: 20px 0;
  border-top: 1px solid var(--border-color);
}

.suggestions-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.search-suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion {
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  background: transparent;
  border-left: 3px solid transparent;
}

.suggestion:hover {
  background: var(--hover-bg);
  border-left-color: var(--accent);
  padding-left: 16px;
}

/* Results container */
.results-section {
  padding: 40px 20px;
}

.results-container {
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Loading state */
.ai-loading {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.ai-loading span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: ai-pulse 1.2s ease-in-out infinite;
}

.ai-loading span:nth-child(2) {
  animation-delay: 0.2s;
}

.ai-loading span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes ai-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Answer card */
.ai-answer {
  background: var(--card-bg);
  border-left: 4px solid var(--accent);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.ai-answer h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent);
  margin: 0 0 16px 0;
}

.ai-answer-text {
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-primary);
  margin: 0;
}

/* Source verses */
.source-verses {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.source-verses-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.verse-card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  cursor: pointer;
  border-left: 3px solid var(--accent);
}

.verse-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.verse-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.verse-ref {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.5px;
}

.verse-score {
  font-size: 12px;
  color: var(--text-secondary);
}

.verse-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-primary);
  margin: 0;
}

.verse-text-arabic {
  font-size: 16px;
  text-align: right;
  direction: rtl;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.verse-text-english {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* Error state */
.search-error {
  background: var(--error-light);
  border-left: 4px solid var(--error);
  color: var(--error-dark);
  padding: 18px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 40px 16px;
  }

  .ai-search-card {
    padding: 24px 16px;
  }

  .input-wrapper {
    gap: 8px;
  }

  .search-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .search-btn,
  .voice-btn {
    width: 44px;
    min-width: 44px;
  }

  .search-suggestions {
    display: none; /* Hide on mobile to save space */
  }

  .verse-card {
    padding: 14px;
  }

  .verse-text {
    font-size: 13px;
  }
}
```

---

## 6. AI SEARCH JAVASCRIPT MODULE

### 6.1 Complete ai-search.js Implementation

```javascript
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  AlHudah AI Search Module — Comprehensive Client-Side Search Handler          ║
 * ║                                                                               ║
 * ║  Exposes: window.TH_AI object with methods:                                  ║
 * ║    - init(config)      : Initialize the module                              ║
 * ║    - ask(query)        : Submit a search query                              ║
 * ║    - startVoice()      : Begin voice recording                              ║
 * ║    - clearResults()    : Clear displayed results                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  // Configuration with defaults
  let config = {
    workerURL: '/api/ai-search',
    maxRetries: 3,
    retryDelay: 1000,
    debounceDelay: 500,
    cacheResults: true,
    cacheExpiry: 3600000, // 1 hour
  };

  // State management
  const state = {
    isSearching: false,
    lastQuery: null,
    resultCache: new Map(),
    searchHistory: [],
    voiceRecognition: null,
    voiceIsActive: false,
  };

  /**
   * ─────────────────────────────────────────────────────────────────
   * 1. INITIALIZATION
   * ─────────────────────────────────────────────────────────────────
   */

  function init(userConfig = {}) {
    config = { ...config, ...userConfig };

    // Load search history from localStorage
    loadSearchHistory();

    // Wire up DOM events
    setupEventListeners();

    // Initialize Web Speech API
    initVoiceRecognition();

    console.log('[AlHudah AI Search] Module initialized', config);
  }

  function setupEventListeners() {
    const form = document.getElementById('searchForm');
    const input = document.getElementById('searchInput');
    const voiceBtn = document.getElementById('voiceBtn');
    const suggestions = document.querySelectorAll('.suggestion');

    // Form submission
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }

    // Input debounced search (optional auto-search)
    if (input) {
      input.addEventListener('input', debounce(handleInputChange, 300));
      input.addEventListener('keydown', handleInputKeydown);
    }

    // Voice button
    if (voiceBtn) {
      voiceBtn.addEventListener('click', toggleVoiceRecording);
    }

    // Suggestion clicks
    suggestions.forEach((link) => {
      link.addEventListener('click', handleSuggestionClick);
    });
  }

  /**
   * ─────────────────────────────────────────────────────────────────
   * 2. SEARCH SUBMISSION HANDLERS
   * ─────────────────────────────────────────────────────────────────
   */

  function handleFormSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('searchInput');
    const query = input.value.trim();

    if (!query) {
      showError('Please enter a search query.');
      return;
    }

    ask(query);
  }

  function handleInputChange(event) {
    // Optional: Auto-search as user types (set debounceDelay low)
    // Uncomment if you want live suggestions
    // const query = event.target.value.trim();
    // if (query.length >= 5) {
    //   ask(query, { showLoading: false });
    // }
  }

  function handleInputKeydown(event) {
    if (event.key === 'Enter') {
      handleFormSubmit(event);
    }
  }

  function handleSuggestionClick(event) {
    event.preventDefault();
    const query = event.currentTarget.textContent.trim();
    document.getElementById('searchInput').value = query;
    ask(query);
  }

  /**
   * ─────────────────────────────────────────────────────────────────
   * 3. MAIN SEARCH FUNCTION
   * ─────────────────────────────────────────────────────────────────
   */

  async function ask(query, options = {}) {
    const { showLoading = true, useCache = true } = options;

    // Validate query
    if (!query || typeof query !== 'string') {
      showError('Invalid search query.');
      return;
    }

    query = query.trim();

    if (query.length < 5) {
      showError('Search query must be at least 5 characters long.');
      return;
    }

    if (query.length > 1000) {
      showError('Search query must not exceed 1000 characters.');
      return;
    }

    // Prevent duplicate searches
    if (state.isSearching) {
      console.warn('Search already in progress');
      return;
    }

    state.isSearching = true;
    state.lastQuery = query;

    // Check cache
    if (useCache && state.resultCache.has(query)) {
      const cached = state.resultCache.get(query);
      if (Date.now() - cached.timestamp < config.cacheExpiry) {
        console.log('[Cache Hit]', query);
        displayResults(cached.data);
        state.isSearching = false;
        return;
      } else {
        state.resultCache.delete(query);
      }
    }

    // Show loading state
    if (showLoading) {
      showLoadingState();
    }

    try {
      // Make API call with retries
      const response = await fetchWithRetry(config.workerURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API error: ${response.status}`
        );
      }

      const data = await response.json();

      // Cache successful response
      if (config.cacheResults) {
        state.resultCache.set(query, {
          data,
          timestamp: Date.now(),
        });
      }

      // Add to search history
      addToSearchHistory(query);

      // Display results
      displayResults(data);

      // Log performance metrics
      if (data.metadata) {
        console.log(
          `[Search] ${data.metadata.result_count} results in ${data.metadata.duration_ms}ms`
        );
      }
    } catch (error) {
      console.error('[AI Search Error]', error);
      showError(error.message || 'Search failed. Please try again.');
    } finally {
      state.isSearching = false;
    }
  }

  /**
   * ─────────────────────────────────────────────────────────────────
   * 4. API CALL WITH RETRY LOGIC
   * ─────────────────────────────────────────────────────────────────
   */

  async function fetchWithRetry(url, options = {}, attempt = 1) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (attempt < config.maxRetries) {
        console.warn(
          `[Retry ${attempt}/${config.maxRetries}] Retrying in ${config.retryDelay}ms...`
        );
        await delay(config.retryDelay);
        return fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * ─────────────────────────────────────────────────────────────────
   * 5. RESULT RENDERING
   * ─────────────────────────────────────────────────────────────────
   */

  function displayResults(data) {
    const container = document.getElementById('resultsContainer');

    if (!container) {
      console.warn('[AI Search] Results container not found');
      return;
    }

    // Clear previous results
    container.innerHTML = '';

    if (!data.success && !data.verses) {
      showError(
        data.error ||
          'No results found. Try a different search query.'
      );
      return;
    }

    // Render AI answer (if available)
    if (data.answer) {
      const answerCard = createAnswerCard(data.answer);
      container.appendChild(answerCard);
    }

    // Render source verses
    if (data.verses && data.verses.length > 0) {
      const versesSection = createVersesSection(data.verses);
      container.appendChild(versesSection);
    } else if (data.answer) {
      // Answer exists but no verses (unlikely)
      const noVersesMsg = createMessage(
        'No source verses found for this answer.'
      );
      container.appendChild(noVersesMsg);
    }
  }

  function createAnswerCard(answer) {
    const card = document.createElement('div');
    card.className = 'ai-answer';
    card.innerHTML = `
      <h2>Answer from the Quran</h2>
      <p class="ai-answer-text">${escapeHTML(answer)}</p>
    `;
    return card;
  }

  function createVersesSection(verses) {
    const section = document.createElement('div');
    section.className = 'source-verses';

    const label = document.createElement('p');
    label.className = 'source-verses-label';
    label.textContent = `Source Verses (${verses.length})`;
    section.appendChild(label);

    verses.forEach((verse, index) => {
      const card = createVerseCard(verse, index + 1);
      section.appendChild(card);
    });

    return section;
  }

  function createVerseCard(verse, number) {
    const card = document.createElement('div');
    card.className = 'verse-card';
    card.setAttribute(
      'data-verse-key',
      verse.ayah_key
    );
    card.style.cursor = 'pointer';

    const ref = `${verse.surah_number}:${verse.ayah_number}`;
    const score = verse.similarity_score
      ? `(${Math.round(verse.similarity_score * 100)}% match)`
      : '';

    card.innerHTML = `
      <div class="verse-header">
        <span class="verse-ref">${ref}</span>
        <span class="verse-score">${score}</span>
      </div>
      ${
        verse.text_arabic
          ? `<p class="verse-text-arabic">${escapeHTML(verse.text_arabic)}</p>`
          : ''
      }
      ${
        verse.text_english
          ? `<p class="verse-text-english">${escapeHTML(verse.text_english)}</p>`
          : ''
      }
    `;

    // Click to navigate to full surah
    card.addEventListener('click', () => {
      navigateToSurah(verse.surah_number, verse.ayah_number);
    });

    return card;
  }

  function createMessage(text) {
    const msg = document.createElement('p');
    msg.style.cssText = `
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
      padding: 20px;
    `;
    msg.textContent = text;
    return msg;
  }

  /**
   * ─────────────────────────────────────────────────────────────────
   * 6. UI STATE MANAGEMENT
   * ─────────────────────────────────────────────────────────────────
   */

  function showLoadingState() {
    const container = document.getElementById('resultsContainer');
    if (container) {
      container.innerHTML = `
        <div class="ai-loading">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;
    }
  }

  function showError(message) {
    const container = document.getElementById('resultsContainer');
    if (container) {
      container.innerHTML = `<div class="search-error">${escapeHTML(message)}</div>`;
    }
  }

  function clearResults() {
    const container = document.getElementById('resultsContainer');
    if (container) {
      container.innerHTML = '';
    }
  }

  /**
   * ─────────────────────────────────────────────────────────────────
   * 7. VOICE RECOGNITION (WEB SPEECH API)
   * ─────────────────────────────────────────────────────────────────
   */

  function initVoiceRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[Voice] Web Speech API not supported');
      const voiceBtn = document.getElementById('voiceBtn');
      if (voiceBtn) {
        voiceBtn.disabled = true;
        voiceBtn.title = 'Voice input not supported in your browser';
      }
      return;
    }

    state.voiceRecognition = new SpeechRecognition();
    state.voiceRecognition.continuous = false;
    state.voiceRecognition.interimResults = true;
    state.voiceRecognition.language = 'en-US';

    state.voiceRecognition.onstart = () => {
      state.voiceIsActive = true;
      updateVoiceButtonUI();
    };

    state.voiceRecognition.onend = () => {
      state.voiceIsActive = false;
      updateVoiceButtonUI();
    };

    state.voiceRecognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      if (event.isFinal) {
        const input = document.getElementById('searchInput');
        if (input) {
          input.value = transcript;
          ask(transcript);
        }
      }
    };

    state.voiceRecognition.onerror = (event) => {
      console.error('[Voice Error]', event.error);
      showError(`Voice input error: ${event.error}`);
    };
  }

  function toggleVoiceRecording() {
    if (!state.voiceRecognition) {
      showError('Voice input not supported in your browser.');
      return;
    }

    if (state.voiceIsActive) {
      state.voiceRecognition.stop();
    } else {
      state.voiceRecognition.start();
    }
  }

  function updateVoiceButtonUI() {
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
      if (state.voiceIsActive) {
        voiceBtn.classList.add('recording');
      } else {
        voiceBtn.classList.remove('recording');
      }
    }
  }

  /**
   * ─────────────────────────────────────────────────────────────────
   * 8. SEARCH HISTORY & NAVIGATION
   * ─────────────────────────────────────────────────────────────────
   */

  function addToSearchHistory(query) {
    // Keep last 20 searches
    if (!state.searchHistory.includes(query)) {
      state.searchHistory.unshift(query);
      state.searchHistory = state.searchHistory.slice(0, 20);
      saveSearchHistory();
    }
  }

  function loadSearchHistory() {
    try {
      const saved = localStorage.getItem('alhudah_search_history');
      if (saved) {
        state.searchHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('[localStorage] Failed to load search history', error);
    }
  }

  function saveSearchHistory() {
    try {
      localStorage.setItem(
        'alhudah_search_history',
        JSON.stringify(state.searchHistory)
      );
    } catch (error) {
      console.warn('[localStorage] Failed to save search history', error);
    }
  }

  function navigateToSurah(surahNumber, ayahNumber = 1) {
    const url = `/quran.html?surah=${surahNumber}&ayah=${ayahNumber}`;
    window.location.href = url;
  }

  /**
   * ─────────────────────────────────────────────────────────────────
   * 9. UTILITY FUNCTIONS
   * ─────────────────────────────────────────────────────────────────
   */

  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * ─────────────────────────────────────────────────────────────────
   * 10. EXPORT PUBLIC API
   * ─────────────────────────────────────────────────────────────────
   */

  window.TH_AI = {
    init,
    ask,
    startVoice: toggleVoiceRecording,
    clearResults,
    getHistory: () => [...state.searchHistory],
    getConfig: () => ({ ...config }),
  };

  console.log('[AlHudah AI Search] Module loaded. Call TH_AI.init() to activate.');
})();
```

---

## 7. EMBEDDING GENERATION & DATA POPULATION

### 7.1 Batch Embedding Script (Node.js)

Purpose: Generate OpenAI embeddings for all 6,236 verses in Supabase.

```javascript
/**
 * generate-embeddings.js
 * Batch generate embeddings for all Quranic verses
 *
 * Usage:
 *   node generate-embeddings.js --resume
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = 'https://dwcsledifvnyrunxejzd.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const BATCH_SIZE = 20; // Verses per API call
const MODEL = 'text-embedding-3-small';
const LOG_FILE = './embedding-progress.log';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Generate embedding for a single verse
 */
async function generateEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input: text,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Generate embeddings for a batch of verses
 */
async function generateBatchEmbeddings(verses) {
  const embeddings = [];

  for (const verse of verses) {
    try {
      const embedding = await generateEmbedding(
        verse.text_english || verse.text_arabic
      );
      embeddings.push({
        id: verse.id,
        embedding,
      });

      process.stdout.write('.');
    } catch (error) {
      console.error(`Failed to embed verse ${verse.id}:`, error.message);
    }
  }

  return embeddings;
}

/**
 * Save embeddings to Supabase
 */
async function saveEmbeddings(embeddings) {
  for (const { id, embedding } of embeddings) {
    const { error } = await supabase
      .from('ayahs')
      .update({ embedding })
      .eq('id', id);

    if (error) {
      console.error(`Failed to save embedding for verse ${id}:`, error.message);
    }
  }
}

/**
 * Load progress from log file
 */
function loadProgress() {
  if (!fs.existsSync(LOG_FILE)) {
    return { lastId: 0, totalProcessed: 0, startTime: Date.now() };
  }

  const content = fs.readFileSync(LOG_FILE, 'utf-8');
  const lastLine = content.split('\n').pop();
  const match = lastLine.match(/lastId: (\d+), processed: (\d+)/);

  if (match) {
    return {
      lastId: parseInt(match[1]),
      totalProcessed: parseInt(match[2]),
      startTime: Date.now(),
    };
  }

  return { lastId: 0, totalProcessed: 0, startTime: Date.now() };
}

/**
 * Save progress to log file
 */
function saveProgress(lastId, totalProcessed) {
  const entry = `[${new Date().toISOString()}] lastId: ${lastId}, processed: ${totalProcessed}\n`;
  fs.appendFileSync(LOG_FILE, entry);
}

/**
 * Main function: Process all verses
 */
async function main() {
  const resume = process.argv.includes('--resume');
  const progress = resume ? loadProgress() : { lastId: 0, totalProcessed: 0, startTime: Date.now() };

  console.log(`Starting embedding generation (${resume ? 'resuming' : 'fresh start'})...`);
  console.log(`Model: ${MODEL}`);
  console.log(`Batch size: ${BATCH_SIZE}`);

  // Estimate costs
  const totalVerses = 6236;
  const estimatedCalls = Math.ceil(totalVerses / BATCH_SIZE);
  const avgTokensPerVerse = 50;
  const costPerMillion = 2; // cents
  const estimatedCost = ((estimatedCalls * BATCH_SIZE * avgTokensPerVerse) / 1000000) * costPerMillion;

  console.log(`\nEstimate:`);
  console.log(`  API calls: ${estimatedCalls}`);
  console.log(`  Estimated cost: $${(estimatedCost / 100).toFixed(2)}`);
  console.log(`  Time estimate: ${Math.ceil(estimatedCalls / 20)} minutes\n`);

  try {
    // Fetch verses not yet embedded
    let { data: verses, error } = await supabase
      .from('ayahs')
      .select('id, text_arabic, text_english')
      .gt('id', progress.lastId)
      .is('embedding', null)
      .order('id', { ascending: true })
      .limit(BATCH_SIZE * 10); // Fetch multiple batches

    if (error) throw error;

    let totalProcessed = progress.totalProcessed;

    while (verses.length > 0) {
      // Process in batches
      for (let i = 0; i < verses.length; i += BATCH_SIZE) {
        const batch = verses.slice(i, i + BATCH_SIZE);

        console.log(
          `\nProcessing batch (verses ${batch[0].id}-${batch[batch.length - 1].id})...`
        );

        const embeddings = await generateBatchEmbeddings(batch);
        await saveEmbeddings(embeddings);

        totalProcessed += embeddings.length;
        const lastId = batch[batch.length - 1].id;
        saveProgress(lastId, totalProcessed);

        console.log(` ✓ Saved ${embeddings.length} embeddings`);
      }

      // Fetch next batch
      const lastId = verses[verses.length - 1].id;
      ({ data: verses, error } = await supabase
        .from('ayahs')
        .select('id, text_arabic, text_english')
        .gt('id', lastId)
        .is('embedding', null)
        .order('id', { ascending: true })
        .limit(BATCH_SIZE * 10));

      if (error) throw error;
    }

    const elapsed = Date.now() - progress.startTime;
    console.log(`\n✓ Embedding generation complete!`);
    console.log(`Total processed: ${totalProcessed} verses`);
    console.log(`Time elapsed: ${Math.round(elapsed / 1000)} seconds`);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
```

**Running the script:**

```bash
# Set environment variables
export OPENAI_API_KEY="sk-..."
export SUPABASE_SERVICE_KEY="eyJ..."

# Run initial embedding
node generate-embeddings.js

# Resume if interrupted
node generate-embeddings.js --resume
```

---

## 8. WEB SPEECH API (VOICE SEARCH)

### 8.1 Complete Voice Implementation

Already included in `ai-search.js` (Section 6.1). Key features:

- **Browser Support Check:** Auto-detects `SpeechRecognition` or `webkitSpeechRecognition`
- **Start/Stop Toggle:** Click microphone icon to begin/end recording
- **Real-Time Transcript:** Updates input field as you speak
- **Auto-Submit:** Submits search when speech ends
- **Visual Feedback:** Pulsing indicator while recording
- **Error Handling:** Shows error message if permission denied or no speech detected

### 8.2 Voice Customization Options

```javascript
// In initVoiceRecognition():
state.voiceRecognition.language = 'en-US'; // Change language
state.voiceRecognition.continuous = false; // Stop after silence
state.voiceRecognition.interimResults = true; // Show interim text
```

**Supported Languages:**
- `en-US`: English (US)
- `en-GB`: English (UK)
- `ar-SA`: Arabic (Saudi Arabia)
- `ur-PK`: Urdu (Pakistan)
- [Full list](https://www.google.com/intl/en/chrome/demos/speech.html)

---

## 9. SEARCH SUGGESTIONS & EXAMPLES

### 9.1 Pre-Defined Question List

Add to search.html `<ul id="suggestionsContainer">`:

```html
<ul>
  <li><a href="#" class="suggestion">What does the Quran say about patience?</a></li>
  <li><a href="#" class="suggestion">Verses about mercy and forgiveness</a></li>
  <li><a href="#" class="suggestion">What is the reward for charity in Islam?</a></li>
  <li><a href="#" class="suggestion">How does the Quran describe paradise?</a></li>
  <li><a href="#" class="suggestion">Guidance on dealing with anger</a></li>
  <li><a href="#" class="suggestion">What does the Quran say about kindness to parents?</a></li>
  <li><a href="#" class="suggestion">Verses about trust in Allah</a></li>
  <li><a href="#" class="suggestion">How to maintain a strong connection with Islam</a></li>
  <li><a href="#" class="suggestion">Guidance on seeking knowledge</a></li>
  <li><a href="#" class="suggestion">What the Quran says about honesty</a></li>
  <li><a href="#" class="suggestion">Verses about hope and despair</a></li>
  <li><a href="#" class="suggestion">Guidance on family relationships</a></li>
  <li><a href="#" class="suggestion">What does the Quran teach about justice?</a></li>
  <li><a href="#" class="suggestion">Verses about perseverance and struggle</a></li>
  <li><a href="#" class="suggestion">How to find peace in difficult times</a></li>
  <li><a href="#" class="suggestion">Guidance on earning halal income</a></li>
  <li><a href="#" class="suggestion">What the Quran says about unity</a></li>
  <li><a href="#" class="suggestion">Verses about humility and modesty</a></li>
  <li><a href="#" class="suggestion">Guidance on managing fear and worry</a></li>
  <li><a href="#" class="suggestion">What does the Quran say about reflection?</a></li>
</ul>
```

---

## 10. RATE LIMITING & COST CONTROL

### 10.1 Rate Limiting Strategy

**Two-Tier Approach:**

| Level | Limit | Purpose |
|-------|-------|---------|
| **Frontend** | Debounce 500ms + disable button during request | Prevent accidental double-submits |
| **Cloudflare Worker** | 10 requests per minute per IP | Prevent abuse; controlled API costs |

**Implementation (in worker):**

```javascript
// Cloudflare KV: tracks requests per IP
const rateLimitKey = `alhudah-search:${clientIP}`;
const isAllowed = await rateLimiter.check(rateLimitKey, 10, 60);

if (!isAllowed) {
  return respondError(429, 'Rate limit exceeded. Max 10 requests per minute.');
}
```

**For Paid Tiers:**

Upgrade limits in production:

```javascript
// Development: 10 req/min
// Staging: 50 req/min
// Production: 100+ req/min (with authentication)

const limits = {
  'development': { max: 10, window: 60 },
  'production': { max: 100, window: 60 },
};
```

### 10.2 Cost Optimization

**Monthly Budget (10,000 searches):**

| Component | Calls | Cost |
|-----------|-------|------|
| Embeddings | 10,000 | ~$0.20 |
| Chat (GPT-4o-mini) | 10,000 | ~$1.50 |
| Supabase (free tier) | unlimited | $0 |
| Cloudflare Worker | unlimited | $0 (included) |
| **Total** | | **~$1.70/month** |

**Cost-Saving Tactics:**

1. **Cache Common Queries:** Store results for popular searches (localStorage + KV)
2. **Batch Embeddings:** Generate once; reuse for similar queries
3. **Use text-embedding-3-small:** 10x cheaper than ada-002
4. **Use gpt-4o-mini:** 90% cheaper than gpt-4-turbo
5. **Monitor Usage:** Set Cloudflare Worker alerts

### 10.3 Monitoring & Alerts

```javascript
// In worker error handler:
if (isHighCostOperation) {
  // Log to external monitoring service
  await logToMonitoring({
    service: 'ai-search',
    cost: estimatedCost,
    query,
    timestamp: new Date().toISOString(),
  });
}
```

---

## 11. DEPLOYMENT & MONITORING

### 11.1 Deployment Checklist

```markdown
### Pre-Deployment

- [ ] Test worker locally: `wrangler dev`
- [ ] Test with sample queries
- [ ] Verify embeddings exist in Supabase
- [ ] Set rate limits appropriately
- [ ] Configure CORS headers
- [ ] Set secrets (OPENAI_API_KEY, SUPABASE_SERVICE_KEY)

### Deployment Steps

1. Build and deploy worker:
   ```bash
   wrangler deploy
   ```

2. Verify deployment:
   ```bash
   curl -X POST https://alhudah-worker.workers.dev/api/ai-search \
     -H "Content-Type: application/json" \
     -d '{"query": "What does Quran say about patience?"}'
   ```

3. Monitor logs:
   ```bash
   wrangler tail
   ```

4. Set up alerts in Cloudflare dashboard

### Post-Deployment

- [ ] Monitor error rates
- [ ] Track latency
- [ ] Review cost reports
- [ ] Gather user feedback
```

### 11.2 Monitoring & Logging

```javascript
// Log request metrics to external service (e.g., LogRocket, Sentry)
async function logMetrics(data) {
  const payload = {
    service: 'alhudah-ai-search',
    query: data.query,
    resultCount: data.result_count,
    duration: data.duration_ms,
    success: data.success,
    timestamp: new Date().toISOString(),
  };

  // Send to monitoring service
  await fetch('https://logs.example.com/api/logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).catch((e) => console.error('Logging failed:', e));
}
```

---

## 12. TROUBLESHOOTING & EDGE CASES

### 12.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **Worker returns 401** | Missing OPENAI_API_KEY | `wrangler secret put OPENAI_API_KEY` |
| **Empty embedding vector** | Verse text is empty | Check data integrity in Supabase |
| **Search returns 0 results** | No embeddings generated | Run embedding generation script |
| **Voice doesn't work** | Browser doesn't support Web Speech | Fallback to text input (already handled) |
| **Slow search (>5s)** | Vector index not created | `CREATE INDEX idx_ayahs_embedding_ivfflat...` |
| **High API costs** | Too many searches | Enable result caching; review rate limits |
| **Rate limit 429 error** | Too many requests too fast | Increase debounce delay; upgrade plan |

### 12.2 Performance Optimization

```javascript
// Enable service worker caching (in search.html)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Cache strategy: Cache results for 5 minutes
const CACHE_NAME = 'alhudah-search-v1';
```

### 12.3 Security Hardening

- Always use HTTPS for API calls
- Never expose OpenAI key to frontend
- Validate input server-side (already done in worker)
- Use Supabase RLS for data access control
- Implement CSRF tokens if form-based (already CORS-safe)

---

## QUICK START CHECKLIST

```markdown
## To Deploy AlHudah AI Search:

1. **Clone Repository**
   ```bash
   git clone https://github.com/ehsaasradio-bot/alhudah
   cd alhudah
   ```

2. **Set Up Cloudflare Worker**
   ```bash
   cd alhudah-worker
   npm install
   wrangler login
   wrangler secret put OPENAI_API_KEY
   wrangler secret put SUPABASE_SERVICE_KEY
   wrangler deploy
   ```

3. **Generate Embeddings**
   ```bash
   node scripts/generate-embeddings.js
   ```

4. **Deploy Frontend**
   ```bash
   git push origin main
   # Auto-deploys to Cloudflare Pages
   ```

5. **Test Live**
   - Visit: https://alhudah.com/search.html
   - Try a search query
   - Verify results display with answer + verses

## Cost Estimate
- OpenAI: ~$1.70/month (10,000 searches)
- Cloudflare: Free tier
- Supabase: Free tier
- **Total: ~$2/month**
```

---

**End of Reference Guide. For production deployment, follow the deployment checklist in Section 11.1.**
