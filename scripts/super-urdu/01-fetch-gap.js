#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Super Urdu — Step 1: Fetch the gap
   Pulls every hadith where `urdu` IS NULL from Supabase and
   writes data/urdu-gap.csv for downstream drafting + review.

   Read-only. Uses the public anon key — safe to commit.
   Run:  node scripts/super-urdu/01-fetch-gap.js
───────────────────────────────────────────────────────────── */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

const SB_URL  = 'https://dwcsledifvnyrunxejzd.supabase.co';
const SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Y3NsZWRpZnZueXJ1bnhlanpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTgwNzgsImV4cCI6MjA5MDUzNDA3OH0.Aww8QcExJF1tPwMPvqP5q0_avc3YJclqsFJcXptlnZo';

const OUT_DIR = path.join(__dirname, 'data');
const OUT_CSV = path.join(OUT_DIR, 'urdu-gap.csv');
const OUT_JSON = path.join(OUT_DIR, 'urdu-gap.json');

const COLS = ['id', 'hadith_number', 'book_name_en', 'narrator', 'text_en', 'text_ar'];

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      headers: {
        'apikey': SB_ANON,
        'Authorization': 'Bearer ' + SB_ANON,
        'Accept': 'application/json'
      }
    }, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => {
        if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode + ': ' + body));
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Bad JSON: ' + e.message)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const url = SB_URL + '/rest/v1/hadiths'
    + '?urdu=is.null'
    + '&select=' + COLS.join(',')
    + '&order=id.asc'
    + '&limit=2000';

  console.log('Fetching gap rows from Supabase…');
  const rows = await get(url);
  console.log('  → ' + rows.length + ' rows missing Urdu');

  fs.writeFileSync(OUT_JSON, JSON.stringify(rows, null, 2), 'utf8');

  const lines = [COLS.join(',')];
  for (const r of rows) lines.push(COLS.map((c) => csvEscape(r[c])).join(','));
  fs.writeFileSync(OUT_CSV, lines.join('\n') + '\n', 'utf8');

  console.log('Wrote ' + OUT_CSV + ' (' + fs.statSync(OUT_CSV).size + ' bytes)');
  console.log('Wrote ' + OUT_JSON);
  console.log('\nNext: run 02-draft-urdu.js to generate AI drafts.');
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
