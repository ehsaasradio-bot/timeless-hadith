# scripts/repair-html

One-off repair tooling for the May 2026 NUL-truncation incident.

## What happened

Six root HTML files were silently corrupted in commit `575ee60` (Reader rewrite, 2026-05-05). Each file ended with **111 NUL bytes** mid-tag, losing all script tags and closing markup that came after the truncation point. Browsers tolerate the malformed HTML, so the site appeared to work — but several scripts (`urdu-toggle.js`, `sw-register.js`, `nav-widgets.js`, Cloudflare analytics, drawer-sync) silently failed to load on those pages.

Affected files: `category.html`, `bookmarks.html`, `about.html`, `categories.html`, `blog.html`, `prayer-times.html`.

User-facing symptom: the Urdu translation accordion button did nothing on category and bookmark pages because `urdu-toggle.js` wasn't being loaded.

## How the repair worked

1. Restored each file from the last known-clean revision `baf8e71` (2026-05-03) via shell redirection (`git show baf8e71:<file> > <file>`). This avoided the temp-file rename path that triggers the original Windows-mount truncation.
2. Re-applied the `d474d9a` "Reader landing nav" diff via `apply-reader-nav.cjs` — a small Node transform that does targeted string substitutions and writes to STDOUT, then redirected back to disk.
3. Bumped service worker version (`th-v16` → `th-v17`) so cached HTML re-fetches.

## Root cause (suspected)

Git operations that use the "write to temp file → atomic rename" pattern (e.g., `git apply`, `git checkout` of large files) appear to truncate at exactly 111 bytes from the end on this Windows mount, padding the rest with NULs. Direct shell redirection (`>`) writes in place to the existing inode and works fine.

If you see this corruption pattern recur:
- Don't use `git apply` or `git checkout -- <file>` directly.
- Use `git show <sha>:<file> > <file>` instead.
- Verify with `tr -cd '\0' < <file> | wc -c` (should be 0).

## Files

- `apply-reader-nav.cjs` — Node CommonJS script that adds the d474d9a Reader/Dashboard nav links to a passed-in HTML file and prints to stdout.
- `package.json` — pins this folder to CommonJS (the parent `scripts/package.json` declares ESM).
