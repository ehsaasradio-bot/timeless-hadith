-- ─────────────────────────────────────────────────────────────
-- Timeless Hadith — Blog Posts Table
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.blog_posts (
  id            bigserial primary key,
  title         text not null,
  slug          text not null unique,
  category      text not null default 'general',
  content       text not null default '',
  excerpt       text not null default '',
  meta_title    text,
  meta_desc     text,
  status        text not null default 'draft'
                  check (status in ('draft', 'scheduled', 'published')),
  scheduled_at  timestamptz,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists blog_posts_status_idx   on public.blog_posts (status);
create index if not exists blog_posts_category_idx on public.blog_posts (category);
create index if not exists blog_posts_slug_idx     on public.blog_posts (slug);

-- updated_at auto-touch trigger (reuses touch_updated_at from schema 001 if exists)
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists blog_posts_touch_updated_at on public.blog_posts;
create trigger blog_posts_touch_updated_at
  before update on public.blog_posts
  for each row execute function public.touch_updated_at();

-- RLS: allow anon to read published posts; service_role has full access
alter table public.blog_posts enable row level security;

drop policy if exists "public read published" on public.blog_posts;
create policy "public read published"
  on public.blog_posts for select
  using (status = 'published');
