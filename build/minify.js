/**
 * Timeless Hadith — JS Minification Build Script
 * Run: npm run build
 * Output: dist/js/*.js (minified, ready for production)
 *
 * Cloudflare Pages build command:
 *   npm install && npm run build
 * Output directory: . (root — HTML files reference dist/js/ directly)
 */

const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

const FILES = [
  'js/supabase-data.js',
  'js/app.js',
  'js/supabase-auth.js',
  'js/ai-search.js',
];

const TERSER_OPTIONS = {
  compress: {
    drop_console: false, // keep console.warn/error for debugging
    passes: 2,
  },
  mangle: true,
  format: {
    comments: false,
  },
};

async function buildAll() {
  let totalBefore = 0, totalAfter = 0;
  const outDir = path.join(__dirname, '..', 'dist', 'js');
  fs.mkdirSync(outDir, { recursive: true });

  for (const file of FILES) {
    const inPath = path.join(__dirname, '..', file);
    const outPath = path.join(__dirname, '..', 'dist', file);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const code = fs.readFileSync(inPath, 'utf8');
    const result = await minify(code, TERSER_OPTIONS);
    fs.writeFileSync(outPath, result.code, 'utf8');

    const before = Buffer.byteLength(code);
    const after = Buffer.byteLength(result.code);
    const saving = ((1 - after / before) * 100).toFixed(0);
    totalBefore += before;
    totalAfter += after;
    console.log(`  ✓ ${file}: ${(before/1024).toFixed(1)}KB → ${(after/1024).toFixed(1)}KB (-${saving}%)`);
  }

  const totalSaving = ((1 - totalAfter / totalBefore) * 100).toFixed(0);
  console.log(`\nTotal: ${(totalBefore/1024).toFixed(1)}KB → ${(totalAfter/1024).toFixed(1)}KB (-${totalSaving}%)`);
  console.log('Build complete → dist/js/');
}

buildAll().catch(err => { console.error('Build failed:', err); process.exit(1); });
