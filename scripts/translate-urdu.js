/**
 * Timeless Hadith — Urdu Translation Script
 *
 * Translates English hadith text to Urdu using OpenAI GPT-4o-mini
 * and writes it back to the `urdu` column in Supabase.
 *
 * Usage:
 *   node translate-urdu.js                  # translate all (skip already done)
 *   node translate-urdu.js --limit=50       # translate only 50 rows
 *   node translate-urdu.js --dry-run        # preview without writing to DB
 *   node translate-urdu.js --book=1         # translate only book_number 1
 *
 * Environment variables (create a .env file in /scripts/):
 *   SUPABASE_URL=https://dwcsledifvnyrunxejzd.supabase.co
 *   SUPABASE_SERVICE_KEY=<your service role key>
 *   OPENAI_API_KEY=<your OpenAI key>
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/* ── Config ── */
const BATCH_SIZE = 20;          // rows fetched per DB query
const CONCURRENCY = 5;          // parallel OpenAI calls
const RETRY_LIMIT = 3;          // retries on transient failures
const DELAY_BETWEEN_BATCHES = 500; // ms pause between batches (rate-limit safety)

/* ── CLI args ── */
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const LIMIT = (() => {
  const m = args.find(a => a.startsWith('--limit='));
  return m ? parseInt(m.split('=')[1], 10) : Infinity;
})();
const BOOK_FILTER = (() => {
  const m = args.find(a => a.startsWith('--book='));
  return m ? parseInt(m.split('=')[1], 10) : null;
})();

/* ── Clients ── */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ── Translation prompt ── */
const SYSTEM_PROMPT = `You are an expert Islamic scholar and Urdu translator. Translate the following English hadith text into fluent, natural Urdu using proper Islamic terminology.

Rules:
- Use authentic Islamic Urdu terminology (e.g., نبی کریم ﷺ, صحابہ کرام, حضرت)
- Keep the meaning exact — do not add, remove, or interpret
- Use proper Urdu script with correct diacritics where standard
- Do not add transliteration or English text
- Do not add quotation marks, brackets, or any formatting
- Return ONLY the Urdu translation, nothing else`;

/* ── Translate one hadith ── */
async function translateOne(textEn) {
  for (let attempt = 1; attempt <= RETRY_LIMIT; attempt++) {
    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: textEn }
        ]
      });
      return res.choices[0].message.content.trim();
    } catch (err) {
      if (attempt === RETRY_LIMIT) throw err;
      console.warn(`  ⚠ Retry ${attempt}/${RETRY_LIMIT} — ${err.message}`);
      await sleep(2000 * attempt);
    }
  }
}

/* ── Write back to Supabase ── */
async function saveUrdu(id, urduText) {
  if (DRY_RUN) return;
  const { error } = await supabase
    .from('hadiths')
    .update({ urdu: urduText })
    .eq('id', id);
  if (error) throw new Error(`DB write failed for id=${id}: ${error.message}`);
}

/* ── Process a chunk in parallel ── */
async function processChunk(rows) {
  const promises = rows.map(async (row) => {
    if (!row.text_en || row.text_en.trim() === '') {
      console.log(`  [${row.id}] Skipped — empty English text`);
      return;
    }
    try {
      const urdu = await translateOne(row.text_en);
      await saveUrdu(row.id, urdu);
      console.log(`  [${row.id}] Hadith #${row.hadith_number} — Done (${urdu.substring(0, 40)}...)`);
    } catch (err) {
      console.error(`  [${row.id}] FAILED — ${err.message}`);
    }
  });
  await Promise.all(promises);
}

/* ── Helper ── */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ── Main ── */
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log(' Timeless Hadith — Urdu Translation Script');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no DB writes)' : 'LIVE'}`);
  console.log(`Limit: ${LIMIT === Infinity ? 'All rows' : LIMIT}`);
  if (BOOK_FILTER) console.log(`Book filter: ${BOOK_FILTER}`);
  console.log('');

  let totalTranslated = 0;
  let offset = 0;

  while (totalTranslated < LIMIT) {
    // Fetch rows that don't have urdu yet
    let query = supabase
      .from('hadiths')
      .select('id, hadith_number, book_number, text_en')
      .is('urdu', null)
      .order('id', { ascending: true })
      .range(offset, offset + BATCH_SIZE - 1);

    if (BOOK_FILTER) {
      query = query.eq('book_number', BOOK_FILTER);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error('DB fetch error:', error.message);
      break;
    }

    if (!rows || rows.length === 0) {
      console.log('\nNo more rows to translate. Done!');
      break;
    }

    // Trim to limit
    const remaining = LIMIT - totalTranslated;
    const batch = rows.slice(0, Math.min(rows.length, remaining));

    console.log(`Batch: ${batch.length} rows (ids ${batch[0].id}–${batch[batch.length - 1].id})`);

    // Process in chunks of CONCURRENCY
    for (let i = 0; i < batch.length; i += CONCURRENCY) {
      const chunk = batch.slice(i, i + CONCURRENCY);
      await processChunk(chunk);
    }

    totalTranslated += batch.length;

    // If we got fewer rows than batch size, we're done
    if (rows.length < BATCH_SIZE) break;

    // Don't increase offset — we query where urdu IS NULL,
    // so completed rows drop out automatically

    await sleep(DELAY_BETWEEN_BATCHES);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log(` Finished! Translated: ${totalTranslated} hadiths`);
  console.log('═══════════════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
