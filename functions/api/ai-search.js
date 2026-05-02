/* ─────────────────────────────────────────────────────────────────
   Timeless Hadith — AI Search  (Cloudflare Pages Function)
   Route: POST /api/ai-search

   Role: thin proxy that forwards the browser's query to the upgraded
   Cloudflare Worker (`/api/chat`) which performs vector retrieval over
   Sahih al-Bukhari and generates a grounded answer.

   The frontend widget (js/ai-search.js) sends:
     { query: "..." }
   and expects:
     { answer: "...", hadiths: [{id, english, arabic, narrator, source, chapter}] }

   The Worker sends/receives a slightly different shape:
     request:  { question: "..." }
     response: { answer: "...", citations: [...], latency_ms: 1234 }

   This function is responsible for translating between those two shapes
   so the existing frontend widget never has to change.

   Environment variables (optional — set in Cloudflare Pages → Settings → Env):
     WORKER_URL — override the default Worker base URL if needed
───────────────────────────────────────────────────────────────── */

/* ── Default Worker endpoint (public URL, safe to hard-code) ── */
var DEFAULT_WORKER_URL = 'https://timeless-hadith-worker.ehsaasradio.workers.dev';

/* ── CORS allow-list (mirrors the Worker allow-list) ── */
var ALLOWED_ORIGINS = [
  'https://timelesshadith.com',
  'https://www.timelesshadith.com',
  'https://timeless-hadith.pages.dev'
];

function _getAllowedOrigin(request) {
  var origin = request.headers.get('Origin') || '';
  return ALLOWED_ORIGINS.indexOf(origin) !== -1 ? origin : ALLOWED_ORIGINS[0];
}

/* ── CORS helper ── */
function _json(body, status, request) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'Content-Type':                'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': _getAllowedOrigin(request),
      'Vary':                        'Origin',
      'Cache-Control':               'no-store'
    }
  });
}

/* ── Handle OPTIONS pre-flight ── */
export async function onRequestOptions(context) {
  var origin = _getAllowedOrigin(context.request);
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary':                         'Origin'
    }
  });
}

/* ── Reshape a single Worker citation → frontend hadith card ── */
function _toHadithCard(c) {
  var rawNumber   = c.hadith_number ? String(c.hadith_number).trim() : '';
  var sourceLabel = (c.source || 'Sahih al-Bukhari') + (rawNumber ? ' #' + rawNumber : '');

  /* Build an INTERNAL deep link to the hadith on timelesshadith.com itself.
     Pattern: /category.html?cat=book-<book_number>&h=<source_row_id>
     This routes the reader into category.html, which supports ?h=<id>
     deep-linking: it opens the correct page and scroll-flashes the card. */
  var rowId      = c.source_row_id != null ? String(c.source_row_id) : '';
  var bookNumber = c.book_number   != null ? String(c.book_number)   : '';

  var url;
  if (rowId && bookNumber) {
    url = '/category.html?cat=book-' + encodeURIComponent(bookNumber) +
          '&h='    + encodeURIComponent(rowId);
  } else if (rowId) {
    /* Fall back to categories index if we somehow lack the book number */
    url = '/categories.html';
  } else {
    url = '/categories.html';
  }

  /* The Worker now returns full `content` (not just preview).
     The content may include leading "Chapter: ..." / "Narrator: ..." lines
     that we already surface via the dedicated fields — strip them from the
     body so the card is clean. */
  var body = String(c.content || c.preview || '')
    .replace(/^Chapter:\s.*\n?/i, '')
    .replace(/^Narrator:\s.*\n?/i, '')
    .trim();

  return {
    id:            String(c.chunk_id || ''),
    english:       body,
    arabic:        '', /* vector chunks are English-only for MVP */
    narrator:      c.narrator || '',
    source:        sourceLabel,
    source_short:  c.source || 'Sahih al-Bukhari',
    hadith_number: rawNumber,
    chapter:       c.chapter || '',
    book_number:   bookNumber,
    source_row_id: rowId,
    url:           url
  };
}

/* ── Simple in-memory rate limiter (per-IP, resets each cold-start) ──
   Limits: 10 requests per 60-second window per IP address.
   For production-scale limiting use Cloudflare KV or Durable Objects. */
var _rl = new Map();
var RL_LIMIT  = 10;   // max requests
var RL_WINDOW = 60000; // ms (1 minute)

function _checkRateLimit(ip) {
  var now    = Date.now();
  var record = _rl.get(ip);
  if (!record || now - record.start > RL_WINDOW) {
    _rl.set(ip, { start: now, count: 1 });
    return false; // not limited
  }
  record.count++;
  return record.count > RL_LIMIT; // true = rate-limited
}

/* ── Handle POST ── */
export async function onRequestPost(context) {
  var env = context.env;
  var req = context.request;

  /* 0. Rate limiting — 10 req / 60 s per IP */
  var ip = req.headers.get('CF-Connecting-IP') ||
           req.headers.get('X-Forwarded-For')  || 'unknown';
  if (_checkRateLimit(ip)) {
    return _json({ error: 'Too many requests. Please wait a moment before searching again.' }, 429, req);
  }

  /* 1. Parse request body */
  var body;
  try { body = await req.json(); }
  catch (e) { return _json({ error: 'Invalid JSON body.' }, 400, req); }

  var query = String(body.query || '').trim();
  if (!query)              return _json({ error: 'query is required.' }, 400, req);
  if (query.length > 500)  return _json({ error: 'query too long (max 500 chars).' }, 400, req);

  /* 2. Resolve Worker URL */
  var workerBase = (env && env.WORKER_URL) || DEFAULT_WORKER_URL;
  var workerUrl  = workerBase.replace(/\/$/, '') + '/api/chat';

  /* 3. Forward to Worker */
  var workerRes;
  try {
    workerRes = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ question: query })
    });
  } catch (e) {
    return _json({
      error: 'AI service is unreachable. Please try again in a moment.'
    }, 502, req);
  }

  /* 4. Parse Worker response */
  var workerData;
  try {
    workerData = await workerRes.json();
  } catch (e) {
    return _json({ error: 'AI service returned an invalid response.' }, 502, req);
  }

  /* 5. Surface Worker errors with user-friendly messages */
  if (!workerRes.ok || workerData.error) {
    var rawError = workerData.error || '';
    var rawMsg   = workerData.message || '';
    var userMsg;

    if (rawMsg.indexOf('openai_embeddings_failed: 401') !== -1 ||
        rawMsg.indexOf('openai_chat_failed: 401') !== -1) {
      userMsg = 'AI service authentication error. The site admin needs to update the API key.';
    } else if (rawError === 'server_misconfigured') {
      userMsg = 'AI search is not fully configured yet. Please check back soon.';
    } else if (workerRes.status === 429) {
      userMsg = 'Too many requests. Please wait a moment before searching again.';
    } else if (rawMsg.indexOf('supabase_rpc_failed') !== -1) {
      userMsg = 'Could not search the hadith database. Please try again in a moment.';
    } else {
      userMsg = 'AI search encountered an error. Please try again later.';
    }

    return _json({ error: userMsg }, workerRes.ok ? 502 : workerRes.status, req);
  }

  /* 6. Reshape Worker citations → frontend hadith cards */
  var citations = Array.isArray(workerData.citations) ? workerData.citations : [];
  var hadiths   = citations.map(_toHadithCard);

  /* 7. Return the shape the existing widget expects */
  return _json({
    answer:  workerData.answer || 'Unable to generate an answer.',
    hadiths: hadiths
  }, 200, req);
}
