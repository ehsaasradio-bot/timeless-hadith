/* ─────────────────────────────────────────────────────────────────
   Timeless Hadith — AI Search  (Cloudflare Pages Function)
   Route: POST /api/ai-search

   Environment variables (set in Cloudflare Pages → Settings → Env):
     OPENAI_API_KEY   — required (secret)
     SUPABASE_ANON_KEY — optional (falls back to the public anon key)

   Flow:
     1. Accept { query } from the browser
     2. Search Supabase hadiths table with ilike (top 5)
     3. Send question + context to GPT-4o-mini
     4. Return { answer, hadiths[] }
───────────────────────────────────────────────────────────────── */

/* ── Supabase public anon key (safe to hard-code — read-only) ── */
var SB_URL  = 'https://dwcsledifvnyrunxejzd.supabase.co';
var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Y3NsZWRpZnZueXJ1bnhlanpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTgwNzgsImV4cCI6MjA5MDUzNDA3OH0.Aww8QcExJF1tPwMPvqP5q0_avc3YJclqsFJcXptlnZo';

/* ── Allowed origin (H-02: restrict CORS to own domain) ── */
var ALLOWED_ORIGIN = 'https://timelesshadith.com';

/* ── In-memory rate limiting (M-04) ── */
/* Note: Cloudflare Workers are ephemeral — for persistent rate limiting
   enable Cloudflare Rate Limiting rules in the dashboard:
   Dashboard → Security → WAF → Rate Limiting → 20 req/min per IP on /api/ai-search */
var _ratemap = new Map();
var RATE_LIMIT = 20;         // requests per window
var RATE_WINDOW = 60 * 1000; // 1 minute

function _checkRateLimit(ip) {
  var now = Date.now();
  var key = ip || 'unknown';
  var entry = _ratemap.get(key) || { count: 0, reset: now + RATE_WINDOW };
  if (now > entry.reset) { entry = { count: 0, reset: now + RATE_WINDOW }; }
  entry.count++;
  _ratemap.set(key, entry);
  return entry.count <= RATE_LIMIT;
}

/* ── CORS helper ── */
function _cors(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'Content-Type':                'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Vary':                        'Origin'
    }
  });
}

/* ── Handle OPTIONS pre-flight ── */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

/* ── Handle POST ── */
export async function onRequestPost(context) {
  var env = context.env;

  /* M-04: Rate-limit check */
  var clientIP =
    context.request.headers.get('CF-Connecting-IP') ||
    context.request.headers.get('X-Forwarded-For') ||
    'unknown';
  if (!_checkRateLimit(clientIP)) {
    return _cors({ error: 'Too many requests. Please wait a moment and try again.' }, 429);
  }

  /* 0. Parse request body */
  var body;
  try { body = await context.request.json(); }
  catch (e) { return _cors({ error: 'Invalid JSON body.' }, 400); }

  var query = String(body.query || '').trim();
  if (!query)          return _cors({ error: 'query is required.' }, 400);
  if (query.length > 500) return _cors({ error: 'query too long (max 500 chars).' }, 400);

  /* 1. Resolve secrets */
  var sbKey      = env.SUPABASE_ANON_KEY || SB_ANON;
  var openaiKey  = env.OPENAI_API_KEY;

  if (!openaiKey) {
    return _cors({ error: 'AI service not configured — OPENAI_API_KEY missing.' }, 503);
  }

  /* 2. Search Supabase for relevant hadiths (ilike, top 5) */
  var sbHdr = { 'apikey': sbKey, 'Authorization': 'Bearer ' + sbKey };
  var sbPath =
    '/rest/v1/hadiths' +
    '?or=(text_en.ilike.*' + encodeURIComponent(query) + '*' +
         ',narrator.ilike.*' + encodeURIComponent(query) + '*)' +
    '&select=id,hadith_number,chapter_en,narrator,text_en,text_ar,book_name_en,in_book_ref' +
    '&order=id.asc&limit=5';

  var hadiths = [];
  try {
    var sbRes = await fetch(SB_URL + sbPath, { headers: sbHdr });
    if (sbRes.ok) hadiths = await sbRes.json();
  } catch (e) {
    /* non-fatal — proceed with empty context */
  }

  /* 3. Build GPT context */
  var contextText;
  if (hadiths.length > 0) {
    contextText = hadiths.map(function (h, i) {
      return (
        '[' + (i + 1) + '] ' +
        (h.book_name_en || 'Sahih al-Bukhari') +
        (h.hadith_number ? ' #' + h.hadith_number : '') +
        (h.chapter_en    ? ' — ' + h.chapter_en    : '') +
        '\nNarrated by ' + (h.narrator || 'Unknown') + ': ' +
        (h.text_en || '(text unavailable)')
      );
    }).join('\n\n');
  } else {
    contextText = 'No hadiths were found in the database matching this exact query.';
  }

  /* 4. Call OpenAI GPT-4o-mini */
  var systemPrompt =
    'You are a respectful Islamic scholar assistant specialising in Sahih al-Bukhari. ' +
    'Answer the user\'s question using ONLY the hadith context provided — ' +
    'do not invent or paraphrase hadith text. ' +
    'Keep your answer concise (2–4 sentences). ' +
    'Reference hadith numbers when helpful (e.g. "Hadith #6"). ' +
    'If the context does not contain relevant information, say so honestly and suggest ' +
    'trying different search terms.';

  var userPrompt = 'Question: ' + query + '\n\nRelevant hadiths:\n\n' + contextText;

  var oaRes;
  try {
    oaRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + openaiKey,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        model:       'gpt-4o-mini',
        max_tokens:  420,
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt   }
        ]
      })
    });
  } catch (e) {
    return _cors({ error: 'OpenAI request failed: ' + e.message }, 502);
  }

  if (!oaRes.ok) {
    var errText = await oaRes.text().catch(function () { return ''; });
    return _cors({ error: 'OpenAI error ' + oaRes.status + ': ' + errText }, 502);
  }

  var oaData;
  try { oaData = await oaRes.json(); }
  catch (e) { return _cors({ error: 'OpenAI response parse error.' }, 502); }

  var answer = (
    oaData.choices &&
    oaData.choices[0] &&
    oaData.choices[0].message &&
    oaData.choices[0].message.content
  ) || 'Unable to generate an answer.';

  /* 5. Return answer + source hadiths */
  return _cors({
    answer: answer,
    hadiths: hadiths.map(function (h) {
      return {
        id:       String(h.id || ''),
        english:  h.text_en  || '',
        arabic:   h.text_ar  || '',
        narrator: h.narrator || '',
        source:   (h.book_name_en || 'Sahih al-Bukhari') +
                  (h.hadith_number ? ' #' + h.hadith_number : ''),
        chapter:  h.chapter_en || ''
      };
    })
  });
}
