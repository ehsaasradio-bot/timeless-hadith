-- ─────────────────────────────────────────────────────────────
-- Hadith AI Search MVP — Step 1: Database schema
-- Target: Supabase Postgres (pgvector >= 0.5)
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.
-- ─────────────────────────────────────────────────────────────

-- 1. Extensions --------------------------------------------------
create extension if not exists vector;
create extension if not exists pgcrypto;  -- for gen_random_uuid()

-- 2. documents ---------------------------------------------------
-- One row per source PDF (or logical source book).
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  author        text,
  source        text,                     -- e.g. "Sahih al-Bukhari"
  language      text default 'en',        -- 'en' | 'ar' | 'ur' | ...
  filename      text,                     -- original upload name
  storage_path  text,                     -- Supabase Storage object path
  total_pages   int,
  total_chunks  int default 0,
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists documents_source_idx   on public.documents (source);
create index if not exists documents_language_idx on public.documents (language);

-- 3. document_chunks ---------------------------------------------
-- One row per embedded text chunk.
create table if not exists public.document_chunks (
  id             bigserial primary key,
  document_id    uuid not null references public.documents(id) on delete cascade,
  chunk_index    int not null,                    -- 0-based within document
  content        text not null,
  tokens         int,
  chapter        text,                             -- optional metadata slot
  hadith_number  text,                             -- optional metadata slot
  language       text default 'en',
  metadata       jsonb default '{}'::jsonb,
  embedding      vector(1536),                     -- text-embedding-3-small
  created_at     timestamptz not null default now()
);

create index if not exists chunks_document_id_idx on public.document_chunks (document_id);
create index if not exists chunks_language_idx    on public.document_chunks (language);

-- 4. Vector index (HNSW, cosine distance) ------------------------
-- HNSW gives better recall than ivfflat and does not require
-- retraining as rows are added. Safe for a small-to-medium MVP.
create index if not exists chunks_embedding_hnsw_idx
  on public.document_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- 5. match_chunks() search function ------------------------------
-- Returns the top-K most similar chunks for a query embedding.
-- Uses cosine similarity (1 - cosine_distance). Optional filters
-- for language and minimum similarity threshold.
create or replace function public.match_chunks (
  query_embedding  vector(1536),
  match_count      int     default 6,
  min_similarity   float   default 0.0,
  filter_language  text    default null
)
returns table (
  id             bigint,
  document_id    uuid,
  chunk_index    int,
  content        text,
  chapter        text,
  hadith_number  text,
  language       text,
  metadata       jsonb,
  source         text,
  title          text,
  similarity     float
)
language sql stable
as $$
  select
    c.id,
    c.document_id,
    c.chunk_index,
    c.content,
    c.chapter,
    c.hadith_number,
    c.language,
    c.metadata,
    d.source,
    d.title,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where c.embedding is not null
    and (filter_language is null or c.language = filter_language)
    and (1 - (c.embedding <=> query_embedding)) >= min_similarity
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- 6. updated_at trigger on documents -----------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists documents_touch_updated_at on public.documents;
create trigger documents_touch_updated_at
  before update on public.documents
  for each row execute function public.touch_updated_at();

-- 7. Row Level Security ------------------------------------------
-- Lock both tables down. Only the service-role key (used server-side
-- by the Cloudflare Worker) can read/write. The anon key cannot.
alter table public.documents       enable row level security;
alter table public.document_chunks enable row level security;

-- No policies are created intentionally. With RLS on and no
-- policies, only the service_role bypasses RLS. Add public read
-- policies later if/when you want browser reads.
