#!/usr/bin/env node
/* Apply the d474d9a Reader-nav diff to a single HTML file (read from
   baf8e71). Writes to STDOUT — shell-redirect to file to avoid the
   Windows-mount temp-file rename corruption.

   Usage:  node apply-reader-nav.js <file.html> > <file.html>.tmp
           mv <file.html>.tmp <file.html>      # NO — also corrupts
   Instead use:  node apply-reader-nav.js <file.html> | tee <file.html> > /dev/null

   Or simplest: in-place via process substitution from bash:
     content=$(node apply-reader-nav.js f.html); printf "%s" "$content" > f.html
*/

'use strict';

const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('usage: apply-reader-nav.js <html-file>'); process.exit(1); }

const NL = '\n';
let s = fs.readFileSync(file, 'utf8');

const orig = s;
let changes = 0;
function subOnce(needle, repl, label) {
  const i = s.indexOf(needle);
  if (i === -1) {
    process.stderr.write('  [skip] not found: ' + label + NL);
    return;
  }
  s = s.slice(0, i) + repl + s.slice(i + needle.length);
  changes++;
}

/* ── Top navbar: insert Reader before the first nav <li> ── */
subOnce(
  '<ul class="nav-links">\n      <li><a href="categories.html"',
  '<ul class="nav-links">\n      <li><a href="reader.html">Reader</a></li>\n      <li><a href="categories.html"',
  'top-nav add Reader'
);

/* ── Top navbar: replace external My Reader with My Reader + My Dashboard ── */
subOnce(
  '<li class="nav-authed-only" hidden><a href="https://app.timelesshadith.com/dashboard" target="_blank" rel="noopener">My Reader</a></li>',
  '<li class="nav-authed-only" hidden><a href="read.html">My Reader</a></li>\n      <li class="nav-authed-only" hidden><a href="dashboard.html">My Dashboard</a></li>',
  'top-nav swap My Reader + add My Dashboard'
);

/* ── Mobile drawer: insert Reader after Home (try both indent variants) ── */
const drawerVariants = [
  /* 4-space indent (most files) */
  ['<a href="index.html">Home</a>\n    <a href="categories.html"',
   '<a href="index.html">Home</a>\n    <a href="reader.html">Reader</a>\n    <a href="categories.html"'],
  /* 2-space indent (prayer-times.html) */
  ['<a href="index.html">Home</a>\n  <a href="categories.html"',
   '<a href="index.html">Home</a>\n    <a href="reader.html">Reader</a>\n  <a href="categories.html"']
];
let drawerHit = false;
for (const [needle, repl] of drawerVariants) {
  if (s.indexOf(needle) !== -1) {
    subOnce(needle, repl, 'drawer add Reader');
    drawerHit = true; break;
  }
}
if (!drawerHit) process.stderr.write('  [skip] drawer needle not found' + NL);

/* ── Mobile drawer: replace external My Reader (try both indent variants) ── */
const drawerMyReader = [
  ['<a href="https://app.timelesshadith.com/dashboard" class="nav-authed-only" hidden target="_blank" rel="noopener">My Reader</a>',
   '<a href="read.html" class="nav-authed-only" hidden>My Reader</a>\n    <a href="dashboard.html" class="nav-authed-only" hidden>My Dashboard</a>']
];
for (const [needle, repl] of drawerMyReader) {
  if (s.indexOf(needle) !== -1) {
    subOnce(needle, repl, 'drawer swap My Reader + add My Dashboard');
    break;
  }
}

/* ── Footer (only categories.html): insert Reader after Home ── */
subOnce(
  '<li><a href="index.html">Home</a></li>\n        <li><a href="categories.html">Browse</a></li>',
  '<li><a href="index.html">Home</a></li>\n      <li><a href="reader.html">Reader</a></li>\n        <li><a href="categories.html">Browse</a></li>',
  'footer add Reader (categories only)'
);

process.stderr.write('  ' + path.basename(file) + ': ' + changes + ' changes; ' +
                     (orig.length) + ' → ' + (s.length) + ' bytes' + NL);
process.stdout.write(s);
