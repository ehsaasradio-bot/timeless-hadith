// ─────────────────────────────────────────────────────────────
// Timeless Hadith — Cloudflare Worker chat endpoint
//
// Responsibilities:
//   POST /api/chat   → answer a user question using retrieval + grounded OpenAI
//   GET  /api/health → simple liveness probe
//   OPTIONS *        → CORS preflight
//
// Architecture (one request):
//   1. Validate body
//   2. Embed the question  (OpenAI text-embedding-3-small)
//   3. Retrieve top-N chunks from Supabase via RPC `match_chunks`
//   4. Build a grounded prompt with inline citations
//   5. Call OpenAI chat completion
//   6. Return JSON: { answer, citations, latency_ms }
//
// Secrets (set via `wrangler secret put`):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   OPENAI_API_KEY
//
// CORS:
//   Allowed origins are controlled by the `ALLOWED_ORIGINS` var in wrangler.toml
// ─────────────────────────────────────────────────────────────

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHAT_MODEL      = 'gpt-4o-mini';
const MATCH_COUNT     = 6;     // how many chunks to retrieve
const MIN_SIMILARITY  = 0.25;  // floor — filters out irrelevant matches
const MAX_QUESTION_LEN = 500;

// ─────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = buildCorsHeaders(origin, env);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return json({ ok: true, service: 'timeless-hadith-worker', time: new Date().toISOString() }, 200, corsHeaders);
      }

      if (url.pathname === '/api/chat' && request.method === 'POST') {
        return await handleChat(request, env, corsHeaders);
      }

      return json({ error: 'not_found', path: url.pathname }, 404, corsHeaders);
    } catch (err) {
      console.error('[worker-error]', err?.stack || err);
      return json({ error: 'server_error', message: err?.message || String(err) }, 500, corsHeaders);
    }
  },
};

// ─────────────────────────────────────────────────────────────
// Route: POST /api/chat
// ─────────────────────────────────────────────────────────────
async function handleChat(request, env, corsHeaders) {
  const started = Date.now();

  // 1. Parse and validate
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400, corsHeaders);
  }

  const question = (body?.question || '').toString().trim();
  if (!question) {
    return json({ error: 'question_required' }, 400, corsHeaders);
  }
  if (question.length > MAX_QUESTION_LEN) {
    return json({ error: 'question_too_long', limit: MAX_QUESTION_LEN }, 400, corsHeaders);
  }

  // Guard: required secrets
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.OPENAI_API_KEY) {
    return json({ error: 'server_misconfigured', detail: 'missing_secrets' }, 500, corsHeaders);
  }

  // 2. Embed the question
  const embedding = await embedText(env.OPENAI_API_KEY, question);

  // 3. Retrieve top-N matching chunks from Supabase
  const matches = await retrieveChunks(env, embedding);
  if (!matches || matches.length === 0) {
    return json(
      {
        answer: "I couldn't find anything in the hadith collection that matches your question. Try rephrasing it or asking about a specific topic, narrator, or chapter.",
        citations: [],
        latency_ms: Date.now() - started,
      },
      200,
      corsHeaders
    );
  }

  // 4. Build grounded prompt
  const { systemPrompt, userPrompt, citations } = buildGroundedPrompt(question, matches);

  // 5. Ask OpenAI
  const answer = await chatCompletion(env.OPENAI_API_KEY, systemPrompt, userPrompt);

  // 6. Return
  return json(
    {
      answer,
      citations,
      latency_ms: Date.now() - started,
    },
    200,
    corsHeaders
  );
}

// ─────────────────────────────────────────────────────────────
// OpenAI — embedding
// ─────────────────────────────────────────────────────────────
async function embedText(apiKey, text) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`openai_embeddings_failed: ${res.status} ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.data?.[0]?.embedding;
}

// ─────────────────────────────────────────────────────────────
// Supabase — retrieval via match_chunks RPC
// ─────────────────────────────────────────────────────────────
async function retrieveChunks(env, queryEmbedding) {
  const url = `${env.SUPABASE_URL}/rest/v1/rpc/match_chunks`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      match_count: MATCH_COUNT,
      min_similarity: MIN_SIMILARITY,
      filter_language: 'en',
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`supabase_rpc_failed: ${res.status} ${errText.slice(0, 200)}`);
  }
  return await res.json();
}

// ─────────────────────────────────────────────────────────────
// Prompt assembly
// ─────────────────────────────────────────────────────────────
function buildGroundedPrompt(question, matches) {
  // Build citation objects AND the numbered context the model sees.
  const citations = matches.map((m, i) => ({
    index: i + 1,
    chunk_id: m.id,
    similarity: Number((m.similarity || 0).toFixed(3)),
    chapter: m.chapter || null,
    hadith_number: m.hadith_number || null,
    narrator: m?.metadata?.narrator || null,
    source: m.source || 'Sahih al-Bukhari',
    content: m.content || '',
    preview: (m.content || '').slice(0, 220),
    // Pass through metadata fields needed to build internal Timeless Hadith
    // deep links (category.html?cat=book-<N>&h=<id>).
    source_row_id: m?.metadata?.source_row_id || null,
    book_number:   m?.metadata?.book_number   || null,
  }));

  const contextBlock = matches
    .map((m, i) => {
      const tag = `[${i + 1}]`;
      const header = [
        m.chapter ? `Chapter: ${m.chapter}` : null,
        m.hadith_number ? `Hadith No.: ${m.hadith_number}` : null,
      ]
        .filter(Boolean)
        .join(' | ');
      return `${tag} ${header}\n${m.content}`;
    })
    .join('\n\n');

  const systemPrompt = [
    'You are a respectful, accurate assistant for the Timeless Hadith website.',
    'You answer questions strictly using the provided hadith excerpts from Sahih al-Bukhari.',
    'Rules:',
    '  1. Never invent hadiths, narrators, numbers, or rulings. Only use what is in the excerpts.',
    '  2. When you reference information, cite the excerpt with its bracket number, e.g. [1] or [2][3].',
    '  3. If the excerpts do not contain an answer, say so plainly and suggest rephrasing.',
    '  4. Keep answers concise, respectful, and clearly written. No filler, no AI-style hedging.',
    '  5. Preserve Islamic honorifics naturally when a narrator or Prophet is mentioned.',
    '  6. Do not add disclaimers about being an AI. Do not add legal or religious rulings beyond what the text states.',
  ].join('\n');

  const userPrompt = [
    `Question: ${question}`,
    '',
    'Relevant hadith excerpts:',
    contextBlock,
    '',
    'Answer the question using only these excerpts and cite them with their bracket numbers.',
  ].join('\n');

  return { systemPrompt, userPrompt, citations };
}

// ─────────────────────────────────────────────────────────────
// OpenAI — chat completion
// ─────────────────────────────────────────────────────────────
async function chatCompletion(apiKey, systemPrompt, userPrompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      temperature: 0.2,
      max_tokens: 600,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`openai_chat_failed: ${res.status} ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function buildCorsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // If origin is in the allow-list, echo it back. Otherwise fall back to the first allowed origin.
  const allow = allowed.includes(origin) ? origin : (allowed[0] || '*');

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  });
}
