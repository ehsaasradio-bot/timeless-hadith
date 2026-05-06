# Super Urdu — Filling the Urdu Translation Gap

The frontend Urdu accordion on every hadith card is fully built and live. Of the 7,277 hadiths in Supabase, **6,972 already have Urdu translations** populated. This workflow fills the remaining **305-row gap** using a three-step pipeline: fetch the gap, draft with AI, review by hand, then write the approved rows back to Supabase.

> **Anti-AI-slop guardrail (per `CLAUDE.md` §4):** AI-generated Urdu drafts are **not authoritative**. Every row must be reviewed by a qualified Urdu/Arabic speaker before `03-apply-urdu.js` is run. The `approved` column in `urdu-drafts.csv` is the gate.

## Layout

```
scripts/super-urdu/
├── 01-fetch-gap.js     read-only Supabase query → data/urdu-gap.csv
├── 02-draft-urdu.js    OpenAI per row → data/urdu-drafts.csv
├── 03-apply-urdu.js    PATCH Supabase from data/urdu-approved.csv
├── .env.example        copy to .env, fill in your keys
├── .gitignore          keeps .env and review CSVs out of git
└── data/               working CSVs (ignored by git)
```

## One-time setup

```bash
cd scripts/super-urdu
cp .env.example .env
# then edit .env and add:
#   OPENAI_API_KEY=sk-...
#   SUPABASE_SERVICE_ROLE_KEY=eyJ...   (from Supabase dashboard → Settings → API)
```

Node 18+ is recommended (uses native `https`, no npm install required).

## Step 1 — Fetch the gap

```bash
node 01-fetch-gap.js
```

Pulls every row where `urdu IS NULL` from Supabase using the public **anon key only** (read-only, safe). Writes:

- `data/urdu-gap.csv` — the 305 missing rows with `id, hadith_number, book_name_en, narrator, text_en, text_ar`
- `data/urdu-gap.json` — same data, JSON form

You can re-run this any time the gap changes.

## Step 2 — Draft with AI

```bash
# Smoke-test first with 3 rows
LIMIT=3 node 02-draft-urdu.js

# Then full run
node 02-draft-urdu.js
```

Calls OpenAI (`gpt-4o-mini` by default — change with `OPENAI_MODEL=gpt-4o`) with a translation system prompt tuned for:

- Faithful translation of the English narration, with the Arabic as ground truth for disambiguation.
- Required honorifics: `نبی کریم ﷺ`, `اللہ تعالیٰ`, `رضی اللہ عنہ/ا`.
- No commentary, no invented details.

Writes `data/urdu-drafts.csv` with the original columns plus three new ones:

| column        | meaning                                                                                  |
|---------------|------------------------------------------------------------------------------------------|
| `urdu_draft`  | the AI's translation                                                                     |
| `approved`    | leave blank to skip; set to `y` to mark as ready to write                                 |
| `urdu_final`  | leave blank to use `urdu_draft` as-is; or paste your own corrected Urdu here             |

Cost estimate: ~305 rows × ~1.5k tokens each on `gpt-4o-mini` ≈ **\$0.10–0.20 total**.

## Step 3 — Review (manual)

Open `data/urdu-drafts.csv` in Excel / Google Sheets / Numbers. For each row:

1. Read `text_en` and `text_ar`.
2. Read `urdu_draft`.
3. If accurate → set `approved=y`, leave `urdu_final` blank.
4. If you want to fix it → put the correction in `urdu_final` and set `approved=y`.
5. If unsure → leave `approved` blank; the row will be skipped.

Save as `data/urdu-approved.csv` when done. (Same file structure, just renamed so you have an audit trail of "what AI produced" vs "what was approved".)

## Step 4 — Apply to Supabase

```bash
# Dry run (default) — shows what would be written, writes nothing
node 03-apply-urdu.js

# Real write
node 03-apply-urdu.js --commit
```

The script PATCHes one row at a time via Supabase REST using the **service role key** from your `.env` (gentle 80ms throttle between requests). It writes a per-run log to `data/apply-log.json` with success/failure per id.

## After it's done

Re-run the count to confirm:

```bash
node 01-fetch-gap.js   # should now print "0 rows missing Urdu"
```

The frontend (`js/supabase-data.js` line 63) already maps `h.urdu` → the hadith object — no frontend change required. The Urdu accordion will now show real translations instead of the "اردو ترجمہ جلد دستیاب ہوگا" coming-soon fallback.

## Why this design

- **Read and write keys are separated.** Step 1 uses the public anon key (committed). Step 3 uses the service role key (in `.env`, never committed). I never see the service role key.
- **Dry-run by default.** Step 3 will not touch the database without explicit `--commit`.
- **Human review is the gate, not a suggestion.** The `approved` column is required; rows without it are silently skipped.
- **Idempotent.** Re-running step 1 always reflects current gap. Re-running step 3 only writes rows still marked approved.
