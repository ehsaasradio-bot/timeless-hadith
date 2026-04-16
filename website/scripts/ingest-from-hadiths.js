// ─────────────────────────────────────────────────────────────
// Timeless Hadith — Ingestion from existing `hadiths` table
//
// What this does:
//   1. Connects to Supabase using the service role key
//   2. Ensures a single "Sahih al-Bukhari" row exists in `documents`
//   3. Pulls every row from the existing `hadiths` table (paginated)
//   4. Skips rows already embedded (idempotent — safe to re-run)
//   5. Generates OpenAI embeddings in batches
//   6. Inserts one chunk per hadith into `document_chunks`
//
// Run:
//   cd scripts
//   npm install
//   cp .env.example .env    (and fill in values)
//   node ingest-from-hadiths.js --dry-run     ← test, no writes, no API cost
//   node ingest-from-hadiths.js --limit=10    ← embed just 10 rows as a smoke test
//   node ingest-from-hadiths.js               ← full run
//
// Cost (one-time, full run of ~7,277 hadiths): roughly $0.02–$0.05.
// ─────────────────────────────────────────────────────────────

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ──────────────────────────── config ────────────────────────────

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_KEY        = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY      = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL     = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

const DOCUMENT_TITLE      = 'Sahih al-Bukhari';
const DOCUMENT_AUTHOR     = 'Imam Muhammad al-Bukhari';
const DOCUMENT_SOURCE     = 'sunnah.com';
const DOCUMENT_LANGUAGE   = 'en';

const SOURCE_TABLE        = 'hadiths';
const SOURCE_PAGE_SIZE    = 500;       // rows pulled from `hadiths` per page
const EMBED_BATCH_SIZE    = 100;       // texts sent to OpenAI per API call
const INSERT_BATCH_SIZE   = 100;       // rows inserted into `document_chunks` per call

// ──────────────────────────── CLI flags ─────────────────────────

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const LIMIT_ARG = [...args].find(a => a.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1], 10) : null;

// ──────────────────────────── guards ────────────────────────────

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('\n[FATAL] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('        Copy scripts/.env.example → scripts/.env and fill in values.\n');
  process.exit(1);
}
if (!DRY_RUN && !OPENAI_API_KEY) {
  console.error('\n[FATAL] Missing OPENAI_API_KEY in .env (required unless --dry-run)\n');
  process.exit(1);
}

// ──────────────────────────── clients ───────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// ──────────────────────────── helpers ───────────────────────────

function log(...parts) {
  const ts = new Date().toISOString().split('T')[1].slice(0, 8);
  console.log(`[${ts}]`, ...parts);
}

function buildEmbedText(h) {
  // Combine the most useful fields into a single, retrieval-friendly string.
  // We embed English only for MVP. Arabic can be added later as a second pass.
  const parts = [];
  if (h.chapter_en) parts.push(`Chapter: ${h.chapter_en}`);
  if (h.narrator)   parts.push(`Narrator: ${h.narrator}`);
  if (h.text_en)    parts.push(h.text_en);
  return parts.join('\n').trim();
}

function buildChunkMetadata(h) {
  return {
    source_table: SOURCE_TABLE,
    source_row_id: h.id ?? null,
    book_number:   h.book_number ?? null,
    hadith_number: h.hadith_number ?? null,
    chapter_en:    h.chapter_en ?? null,
    chapter_ar:    h.chapter_ar ?? null,
    narrator:      h.narrator ?? null,
    has_arabic:    !!h.text_ar,
  };
}

async function ensureDocumentRow() {
  log(`Ensuring parent document row: "${DOCUMENT_TITLE}"`);
  const { data: existing, error: selErr } = await supabase
    .from('documents')
    .select('id, total_chunks')
    .eq('title', DOCUMENT_TITLE)
    .maybeSingle();
  if (selErr) throw selErr;

  if (existing) {
    log(`  Found existing document ${existing.id}`);
    return existing.id;
  }

  if (DRY_RUN) {
    log('  [dry-run] Would insert new documents row.');
    return '00000000-0000-0000-0000-000000000000';
  }

  const { data: inserted, error: insErr } = await supabase
    .from('documents')
    .insert({
      title:    DOCUMENT_TITLE,
      author:   DOCUMENT_AUTHOR,
      source:   DOCUMENT_SOURCE,
      language: DOCUMENT_LANGUAGE,
      metadata: { origin: 'hadiths_table', ingested_at: new Date().toISOString() },
    })
    .select('id')
    .single();
  if (insErr) throw insErr;
  log(`  Inserted new document ${inserted.id}`);
  return inserted.id;
}

async function fetchAlreadyEmbeddedRowIds(documentId) {
  // Idempotency: collect every metadata.source_row_id already present for this document.
  log('Scanning existing document_chunks for already-embedded rows…');
  const seen = new Set();
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const to = from + PAGE - 1;
    const { data, error } = await supabase
      .from('document_chunks')
      .select('metadata')
      .eq('document_id', documentId)
      .range(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const row of data) {
      const id = row?.metadata?.source_row_id;
      if (id != null) seen.add(String(id));
    }
    if (data.length < PAGE) break;
    from += PAGE;
  }
  log(`  Already embedded: ${seen.size} rows`);
  return seen;
}

async function fetchHadithsPage(from, to) {
  const { data, error } = await supabase
    .from(SOURCE_TABLE)
    .select('*')
    .order('id', { ascending: true })
    .range(from, to);
  if (error) throw error;
  return data || [];
}

async function embedBatch(texts) {
  if (DRY_RUN) {
    // Return dummy zero vectors in dry-run mode.
    return texts.map(() => new Array(1536).fill(0));
  }
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return res.data.map(d => d.embedding);
}

async function insertChunks(rows) {
  if (DRY_RUN) {
    log(`  [dry-run] Would insert ${rows.length} chunks.`);
    return;
  }
  const { error } = await supabase.from('document_chunks').insert(rows);
  if (error) throw error;
}

async function updateDocumentTotal(documentId, total) {
  if (DRY_RUN) return;
  const { error } = await supabase
    .from('documents')
    .update({ total_chunks: total, updated_at: new Date().toISOString() })
    .eq('id', documentId);
  if (error) throw error;
}

// ──────────────────────────── main ──────────────────────────────

async function main() {
  const t0 = Date.now();
  log('─────────────────────────────────────────────');
  log('Timeless Hadith ingestion');
  log(`  Mode:      ${DRY_RUN ? 'DRY-RUN (no writes, no API calls)' : 'LIVE'}`);
  log(`  Limit:     ${LIMIT ? LIMIT + ' rows' : 'all rows'}`);
  log(`  Model:     ${EMBEDDING_MODEL}`);
  log(`  Supabase:  ${SUPABASE_URL}`);
  log('─────────────────────────────────────────────');

  const documentId   = await ensureDocumentRow();
  const alreadyDone  = DRY_RUN ? new Set() : await fetchAlreadyEmbeddedRowIds(documentId);

  let processed = 0;
  let skipped   = 0;
  let inserted  = 0;
  let from      = 0;
  let pendingText   = [];
  let pendingSource = [];

  async function flushPending() {
    if (pendingText.length === 0) return;
    const embeddings = await embedBatch(pendingText);
    const toInsert = pendingSource.map((h, i) => ({
      document_id:    documentId,
      chunk_index:    Number(h.id ?? (from + i)),
      content:        pendingText[i],
      tokens:         null,
      chapter:        h.chapter_en ?? null,
      hadith_number:  h.hadith_number != null ? String(h.hadith_number) : null,
      language:       'en',
      metadata:       buildChunkMetadata(h),
      embedding:      embeddings[i],
    }));

    // Insert in smaller sub-batches to stay within request size limits.
    for (let i = 0; i < toInsert.length; i += INSERT_BATCH_SIZE) {
      await insertChunks(toInsert.slice(i, i + INSERT_BATCH_SIZE));
    }
    inserted += toInsert.length;
    pendingText = [];
    pendingSource = [];
    log(`  ✓ Inserted batch — running total: ${inserted}`);
  }

  while (true) {
    const to = from + SOURCE_PAGE_SIZE - 1;
    const page = await fetchHadithsPage(from, to);
    if (page.length === 0) break;

    for (const h of page) {
      if (LIMIT && processed >= LIMIT) break;
      processed += 1;

      const rowKey = String(h.id ?? '');
      if (alreadyDone.has(rowKey)) { skipped += 1; continue; }

      const text = buildEmbedText(h);
      if (!text || text.length < 10) { skipped += 1; continue; }

      pendingText.push(text);
      pendingSource.push(h);

      if (pendingText.length >= EMBED_BATCH_SIZE) {
        await flushPending();
      }
    }

    log(`Page ${from}–${from + page.length - 1}: seen ${processed} | inserted ${inserted} | skipped ${skipped}`);

    if (LIMIT && processed >= LIMIT) break;
    if (page.length < SOURCE_PAGE_SIZE) break;
    from += SOURCE_PAGE_SIZE;
  }

  await flushPending();

  // Update total_chunks on the documents row
  if (!DRY_RUN) {
    const { count, error } = await supabase
      .from('document_chunks')
      .select('id', { count: 'exact', head: true })
      .eq('document_id', documentId);
    if (error) throw error;
    await updateDocumentTotal(documentId, count || 0);
    log(`Updated documents.total_chunks = ${count || 0}`);
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  log('─────────────────────────────────────────────');
  log(`Done in ${secs}s`);
  log(`  Processed: ${processed}`);
  log(`  Inserted:  ${inserted}`);
  log(`  Skipped:   ${skipped}`);
  log('─────────────────────────────────────────────');
}

main().catch(err => {
  console.error('\n[FATAL]', err?.message || err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});
