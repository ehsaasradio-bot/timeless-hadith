#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Super Urdu — Step 2: Draft Urdu translations (AI)
   Reads data/urdu-gap.csv and writes data/urdu-drafts.csv with
   an additional `urdu_draft` column (and an empty `approved` /
   `urdu_final` column for human review).

   Calls OpenAI (gpt-4o-mini by default) per row. The system
   prompt is tuned for faithful, scholarly Islamic Urdu — NOT
   loose paraphrase.

   IMPORTANT — These drafts MUST be reviewed by a qualified
   Urdu/Arabic speaker before they are written to Supabase.
   See README.md for the review workflow.

   Env vars (loaded from scripts/super-urdu/.env if present):
     OPENAI_API_KEY    required
     OPENAI_MODEL      optional, default 'gpt-4o-mini'
     CONCURRENCY       optional, default 4
     LIMIT             optional, only draft first N rows (smoke test)

   Run:   node scripts/super-urdu/02-draft-urdu.js
   Smoke: LIMIT=3 node scripts/super-urdu/02-draft-urdu.js
───────────────────────────────────────────────────────────── */

'use strict';

const fs    = require('fs');
const path  = require('path');
const https = require('https');

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

const OPENAI_KEY   = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const CONCURRENCY  = Math.max(1, parseInt(process.env.CONCURRENCY || '4', 10));
const LIMIT        = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : null;

if (!OPENAI_KEY) {
  console.error('ERROR: OPENAI_API_KEY not set. Add it to scripts/super-urdu/.env');
  console.error('       Example .env line:  OPENAI_API_KEY=sk-...');
  process.exit(1);
}

const DATA_DIR = path.join(__dirname, 'data');
const IN_CSV   = path.join(DATA_DIR, 'urdu-gap.csv');
const OUT_CSV  = path.join(DATA_DIR, 'urdu-drafts.csv');

if (!fs.existsSync(IN_CSV)) {
  console.error('ERROR: ' + IN_CSV + ' not found. Run 01-fetch-gap.js first.');
  process.exit(1);
}

/* ── CSV parser (RFC-4180-ish, handles quoted multiline) ── */
function parseCsv(text) {
  const out = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); out.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); out.push(row); }
  if (out.length && out[out.length - 1].length === 1 && out[out.length - 1][0] === '') out.pop();
  return out;
}

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

const SYSTEM_PROMPT = [
  'You are a careful, scholarly translator producing Urdu translations of authentic',
  'Sahih al-Bukhari hadith for a public Islamic reference website (timelesshadith.com).',
  '',
  'Strict requirements:',
  '1. Translate the ENGLISH narration faithfully into clear, natural literary Urdu.',
  '   The Arabic text is provided as ground truth — if the English seems off, prefer',
  '   the meaning conveyed by the Arabic.',
  '2. Use respectful Islamic conventions:',
  '   - For the Prophet Muhammad write: نبی کریم ﷺ  (do not write his name without ﷺ).',
  '   - For Allah write: اللہ تعالیٰ where appropriate.',
  '   - For companions use رضی اللہ عنہ / رضی اللہ عنہا.',
  '3. Do NOT add commentary, explanations, footnotes, or scholar opinions. Translate',
  '   only what the hadith says.',
  '4. Do NOT invent details, names, places, or dates that are not in the source.',
  '5. Preserve the original sentence structure where possible. Keep proper nouns',
  '   transliterated in standard Urdu form.',
  '6. Output ONLY the Urdu translation as a single block of text. No prefixes, no',
  '   labels, no quotation marks around the whole thing, no markdown.'
].join('\n');

function buildUserPrompt(row) {
  return [
    'Hadith reference: ' + row.book_name_en + ', #' + row.hadith_number,
    '',
    'Narrator (English):',
    row.narrator || '(not provided)',
    '',
    'English narration:',
    row.text_en || '(not provided)',
    '',
    'Arabic text (ground truth — use to disambiguate meaning):',
    row.text_ar || '(not provided)',
    '',
    'Produce the Urdu translation now.'
  ].join('\n');
}

function openaiChat(messages) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: OPENAI_MODEL,
      messages: messages,
      temperature: 0.2
    });
    const req = https.request('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + OPENAI_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let buf = '';
      res.on('data', (d) => buf += d);
      res.on('end', () => {
        if (res.statusCode >= 400) return reject(new Error('OpenAI ' + res.statusCode + ': ' + buf.slice(0, 400)));
        try {
          const j = JSON.parse(buf);
          resolve(j.choices[0].message.content.trim());
        } catch (e) {
          reject(new Error('Bad OpenAI JSON: ' + e.message));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function draftRow(row) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user',   content: buildUserPrompt(row) }
  ];
  // simple retry: 2 tries
  for (let attempt = 1; attempt <= 2; attempt++) {
    try { return await openaiChat(messages); }
    catch (e) {
      if (attempt === 2) throw e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
}

(async () => {
  const text = fs.readFileSync(IN_CSV, 'utf8');
  const table = parseCsv(text);
  const header = table.shift();
  const rows = table.map((r) => {
    const o = {};
    header.forEach((h, i) => o[h] = r[i] || '');
    return o;
  });

  const work = LIMIT ? rows.slice(0, LIMIT) : rows;
  console.log('Drafting Urdu for ' + work.length + ' hadiths via ' + OPENAI_MODEL +
              ' (concurrency=' + CONCURRENCY + ')…');

  const results = new Array(work.length);
  let cursor = 0, done = 0, failed = 0;

  async function worker(wid) {
    while (true) {
      const idx = cursor++;
      if (idx >= work.length) return;
      const row = work[idx];
      try {
        const urdu = await draftRow(row);
        results[idx] = Object.assign({}, row, { urdu_draft: urdu, approved: '', urdu_final: '' });
      } catch (e) {
        failed++;
        results[idx] = Object.assign({}, row, { urdu_draft: '', approved: '', urdu_final: '', _error: e.message });
        console.error('  [' + row.id + '] FAILED: ' + e.message);
      }
      done++;
      if (done % 10 === 0 || done === work.length) {
        console.log('  ' + done + '/' + work.length + ' (failed=' + failed + ')');
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));

  const outCols = ['id','hadith_number','book_name_en','narrator','text_en','text_ar','urdu_draft','approved','urdu_final'];
  const lines = [outCols.join(',')];
  for (const r of results) lines.push(outCols.map((c) => csvEscape(r[c])).join(','));
  fs.writeFileSync(OUT_CSV, lines.join('\n') + '\n', 'utf8');

  console.log('\nWrote ' + OUT_CSV);
  console.log('Failed rows: ' + failed + ' / ' + work.length);
  console.log('\nNext steps:');
  console.log('  1. Review every row in urdu-drafts.csv.');
  console.log('  2. Set approved=y for rows you accept (urdu_final blank → uses urdu_draft).');
  console.log('  3. For rows you edit, put the corrected text in urdu_final and set approved=y.');
  console.log('  4. Save as urdu-approved.csv, then run 03-apply-urdu.js.');
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
