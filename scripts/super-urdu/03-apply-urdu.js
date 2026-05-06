#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Super Urdu — Step 3: Apply approved Urdu translations
   Reads data/urdu-approved.csv and PATCHes Supabase rows where
   approved=y. Uses `urdu_final` if non-empty, otherwise falls
   back to `urdu_draft`.

   SAFETY: Defaults to DRY RUN. You MUST pass --commit to write.

   Env vars (loaded from scripts/super-urdu/.env if present):
     SUPABASE_SERVICE_ROLE_KEY   required (do NOT commit)
     SUPABASE_URL                optional, defaults to project URL
     BATCH_SIZE                  optional, default 1 (Supabase REST
                                 PATCH is per-row; we throttle).

   Run:  node scripts/super-urdu/03-apply-urdu.js               (dry run)
         node scripts/super-urdu/03-apply-urdu.js --commit      (real)
───────────────────────────────────────────────────────────── */

'use strict';

const fs    = require('fs');
const path  = require('path');
const https = require('https');

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

const SB_URL = process.env.SUPABASE_URL || 'https://dwcsledifvnyrunxejzd.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const COMMIT = process.argv.includes('--commit');

if (!SB_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not set.');
  console.error('       Add it to scripts/super-urdu/.env (this file is in .gitignore).');
  process.exit(1);
}

const DATA_DIR = path.join(__dirname, 'data');
const IN_CSV   = path.join(DATA_DIR, 'urdu-approved.csv');
const LOG_PATH = path.join(DATA_DIR, 'apply-log.json');

if (!fs.existsSync(IN_CSV)) {
  console.error('ERROR: ' + IN_CSV + ' not found.');
  console.error('       Create it from urdu-drafts.csv after review (set approved=y).');
  process.exit(1);
}

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

function patchRow(id, urdu) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ urdu: urdu });
    const url  = SB_URL + '/rest/v1/hadiths?id=eq.' + encodeURIComponent(id);
    const req = https.request(url, {
      method: 'PATCH',
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Prefer': 'return=representation'
      }
    }, (res) => {
      let buf = '';
      res.on('data', (d) => buf += d);
      res.on('end', () => {
        if (res.statusCode >= 400) return reject(new Error('HTTP ' + res.statusCode + ': ' + buf.slice(0, 300)));
        try {
          const arr = JSON.parse(buf);
          if (!Array.isArray(arr) || arr.length === 0) {
            return reject(new Error('No row returned for id=' + id + ' (does it exist?)'));
          }
          resolve(arr[0]);
        } catch (e) {
          reject(new Error('Bad response for id=' + id + ': ' + e.message));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const text  = fs.readFileSync(IN_CSV, 'utf8');
  const table = parseCsv(text);
  const header = table.shift();
  const idxOf = (name) => header.indexOf(name);

  for (const required of ['id', 'urdu_draft', 'approved']) {
    if (idxOf(required) === -1) {
      console.error('ERROR: column "' + required + '" missing from ' + IN_CSV);
      process.exit(1);
    }
  }

  const rows = table.map((r) => ({
    id:          r[idxOf('id')],
    urdu_draft:  r[idxOf('urdu_draft')],
    urdu_final:  idxOf('urdu_final') >= 0 ? r[idxOf('urdu_final')] : '',
    approved:    String(r[idxOf('approved')]).trim().toLowerCase()
  }));

  const toApply = rows.filter((r) => r.approved === 'y' || r.approved === 'yes' || r.approved === '1');
  const skipped = rows.length - toApply.length;

  console.log('Approved rows: ' + toApply.length + ' / ' + rows.length + ' (skipped ' + skipped + ')');
  console.log('Mode: ' + (COMMIT ? 'COMMIT (will write to Supabase)' : 'DRY RUN (pass --commit to write)'));
  console.log('');

  if (toApply.length === 0) {
    console.log('Nothing to apply.');
    return;
  }

  if (!COMMIT) {
    console.log('First 3 approved rows preview:');
    for (const r of toApply.slice(0, 3)) {
      const u = r.urdu_final || r.urdu_draft;
      console.log('  id=' + r.id + '  →  ' + u.slice(0, 80) + (u.length > 80 ? '…' : ''));
    }
    console.log('\nRe-run with --commit to write these ' + toApply.length + ' translations to Supabase.');
    return;
  }

  const log = { startedAt: new Date().toISOString(), succeeded: [], failed: [] };
  let done = 0;
  for (const r of toApply) {
    const urdu = (r.urdu_final && r.urdu_final.trim()) ? r.urdu_final : r.urdu_draft;
    try {
      await patchRow(r.id, urdu);
      log.succeeded.push(r.id);
    } catch (e) {
      log.failed.push({ id: r.id, error: e.message });
      console.error('  id=' + r.id + ' FAILED: ' + e.message);
    }
    done++;
    if (done % 25 === 0 || done === toApply.length) {
      console.log('  ' + done + '/' + toApply.length + ' (failed=' + log.failed.length + ')');
    }
    // gentle throttle
    await new Promise((res) => setTimeout(res, 80));
  }

  log.finishedAt = new Date().toISOString();
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), 'utf8');
  console.log('\nDone. Succeeded: ' + log.succeeded.length + '  Failed: ' + log.failed.length);
  console.log('Log: ' + LOG_PATH);
})().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
