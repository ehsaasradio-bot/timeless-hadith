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

/* ── CORS helper ── */
function _json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: {
      'Content-Type':                'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control':               'no-store'
    }
  });
}

/* ── Handle OPTIONS pre-flight ── */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

/* ── Reshape a single Worker citation → frontend hadith card ── */
function _toHadithCard(c) {
  var hadithNumber = c.hadith_number ? ' #' + c.hadith_number : '';
  var source       = (c.source || 'Sahih al-Bukhari') + hadithNumber;

  /* The Worker now returns full `content` (not just preview).
     The content may include leading "Chapter: ..." / "Narrator: ..." lines
     that we already surface via the dedicated fields — strip them from the
     body so the card is clean. */
  var body = String(c.content || c.preview || '')
    .replace(/^Chapter:\s.*\n?/i, '')
    .replace(/^Narrator:\s.*\n?/i, '')
    .trim();

  return {
    id:       String(c.chunk_id || ''),
    english:  body,
    arabic:   '', /* vector chunks are English-only for MVP */
    narrator: c.narrator || '',
    source:   source,
    chapter:  c.chapter || ''
  };
}

/* ── Handle POST ── */
export async function onRequestPost(context) {
  var env = context.env;

  /* 1. Parse request body */
  var body;
  try { body = await context.request.json(); }
  catch (e) { return _json({ error: 'Invalid JSON body.' }, 400); }

  var query = String(body.query || '').trim();
  if (!query)              return _json({ error: 'query is required.' }, 400);
  if (query.length > 500)  return _json({ error: 'query too long (max 500 chars).' }, 400);

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
    }, 502);
  }

  /* 4. Parse Worker response */
  var workerData;
  try {
    workerData = await workerRes.json();
  } catch (e) {
    return _json({ error: 'AI service returned an invalid response.' }, 502);
  }

  /* 5. Surface Worker errors verbatim (with safe status) */
  if (!workerRes.ok || workerData.error) {
    return _json(
      { error: workerData.error || ('AI service error: ' + workerRes.status) },
      workerRes.ok ? 502 : workerRes.status
    );
  }

  /* 6. Reshape Worker citations → frontend hadith cards */
  var citations = Array.isArray(workerData.citations) ? workerData.citations : [];
  var hadiths   = citations.map(_toHadithCard);

  /* 7. Return the shape the existing widget expects */
  return _json({
    answer:  workerData.answer || 'Unable to generate an answer.',
    hadiths: hadiths
  });
}
