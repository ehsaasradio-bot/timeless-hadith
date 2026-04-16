# AlHudah Quran Platform — Database Reference Guide
**Version 1.0** | Supabase PostgreSQL with quran.com API v4 Integration

---

## Overview

The AlHudah platform uses a **hybrid architecture**:
- **Core Data:** Supabase PostgreSQL (114 surahs, 6,236 ayahs, translations, tafsir)
- **Extended Data:** quran.com API v4 (additional translations, metadata enrichment)
- **Search:** Full-text search (Supabase tsvector) + AI semantic search (pgvector embeddings)
- **Auth:** Supabase Auth with Row-Level Security (RLS)

This guide covers every table, index, function, policy, and data population method in complete, production-ready SQL.

---

## 1. Database Schema

### 1.1 Table: `surahs` (114 chapters)

Stores metadata for all 114 surahs of the Quran.

```sql
CREATE TABLE surahs (
  id SERIAL PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,          -- 1-114 (unique identifier)
  name_arabic TEXT NOT NULL,               -- الفاتحة (with diacritics)
  name_english TEXT NOT NULL,              -- Al-Fatihah
  name_transliteration TEXT NOT NULL,      -- Al-Fatihah (Romanized)
  meaning TEXT NOT NULL,                   -- The Opening
  revelation_type TEXT NOT NULL,           -- 'meccan' OR 'medinan'
  total_ayahs INTEGER NOT NULL,            -- Number of verses (1-286)
  juz_start INTEGER,                       -- Starting juz number (1-30)
  juz_end INTEGER,                         -- Ending juz number
  page_start INTEGER,                      -- First page (Madani mushaf standard)
  page_end INTEGER,                        -- Last page (Madani mushaf standard)
  slug TEXT UNIQUE NOT NULL,               -- al-fatihah (URL-safe version)
  
  -- SEO fields
  seo_title TEXT,                          -- Meta title (60 chars)
  meta_description TEXT,                   -- Meta description (160 chars)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for surahs table
CREATE INDEX idx_surahs_number ON surahs(number);
CREATE INDEX idx_surahs_slug ON surahs(slug);
CREATE INDEX idx_surahs_revelation_type ON surahs(revelation_type);
CREATE INDEX idx_surahs_juz_start ON surahs(juz_start);
```

**Data Source:** quran.com API v4 endpoint `/chapters` (GET /api/v4/chapters)

**Example Row:**
```
id: 1
number: 1
name_arabic: الفاتحة
name_english: Al-Fatihah
name_transliteration: Al-Fatihah
meaning: The Opening
revelation_type: meccan
total_ayahs: 7
juz_start: 1
juz_end: 1
page_start: 1
page_end: 1
slug: al-fatihah
seo_title: Surah Al-Fatihah - Chapter 1 of the Quran
meta_description: Read Surah Al-Fatihah (The Opening) - the first and most important chapter of the Quran.
```

---

### 1.2 Table: `ayahs` (6,236 verses)

Core verse data with full-text search and AI embeddings.

```sql
CREATE TABLE ayahs (
  id SERIAL PRIMARY KEY,
  surah_number INTEGER NOT NULL,           -- Foreign key to surahs
  ayah_number INTEGER NOT NULL,            -- Verse number within surah (1-286)
  ayah_key TEXT UNIQUE NOT NULL,           -- Canonical key: "1:1", "2:255" etc.
  text_arabic TEXT NOT NULL,               -- Full Arabic text with tashkeel
  text_english TEXT,                       -- Sahih International translation
  text_urdu TEXT,                          -- Urdu translation (Mufti Taqi Usmani)
  text_transliteration TEXT,               -- Optional: Roman transliteration
  
  -- Structural metadata
  juz INTEGER NOT NULL,                    -- Juz (1-30)
  hizb INTEGER,                            -- Hizb (1-60)
  hizb_quarter INTEGER,                    -- Quarter of hizb (0-3)
  page INTEGER,                            -- Madani mushaf page
  
  -- Sajda (prostration) markers
  sajda BOOLEAN DEFAULT FALSE,
  sajda_type TEXT,                         -- 'obligatory' OR 'recommended' OR NULL
  
  -- Full-text search vector
  search_vector TSVECTOR,                  -- Generated from text_arabic + text_english
  
  -- AI semantic search (pgvector)
  embedding VECTOR(1536),                  -- OpenAI ada-002 embedding
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Composite foreign key + unique constraint
  CONSTRAINT fk_ayah_surah FOREIGN KEY (surah_number) REFERENCES surahs(number),
  CONSTRAINT uq_ayah_position UNIQUE(surah_number, ayah_number)
);

-- Indexes for ayahs table
CREATE INDEX idx_ayahs_ayah_key ON ayahs(ayah_key);
CREATE INDEX idx_ayahs_surah_number ON ayahs(surah_number);
CREATE INDEX idx_ayahs_juz ON ayahs(juz);
CREATE INDEX idx_ayahs_page ON ayahs(page);
CREATE INDEX idx_ayahs_sajda ON ayahs(sajda) WHERE sajda = TRUE;
CREATE INDEX idx_ayahs_hizb ON ayahs(hizb, hizb_quarter);

-- Full-text search index (GIN for TSVECTOR)
CREATE INDEX idx_ayahs_search_vector ON ayahs USING GIN(search_vector);

-- Vector search index (IVFFlat for faster similarity search)
-- Note: pgvector must be installed first: CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX idx_ayahs_embedding_ivfflat ON ayahs 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

**Data Sources:**
- Arabic text: tanzil.net (Uthmani script, clean download)
- English: quran.com API v4 translation ID 131 (Sahih International)
- Urdu: quran.com API v4 translation ID 234 (Mufti Taqi Usmani)

**Example Row:**
```
id: 1
surah_number: 1
ayah_number: 1
ayah_key: 1:1
text_arabic: الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
text_english: All the praises and thanks be to Allah, the Lord of the worlds
text_urdu: تمام تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا رب ہے
juz: 1
hizb: 1
hizb_quarter: 0
page: 1
sajda: FALSE
search_vector: 'alhamd':1 'allah':2 'lord':3...
embedding: [0.001, -0.045, 0.032, ...] (1536-dimensional vector)
```

---

### 1.3 Table: `tafsir_entries` (Quranic Exegesis)

Verse-by-verse explanations from multiple scholarly sources.

```sql
CREATE TABLE tafsir_entries (
  id SERIAL PRIMARY KEY,
  ayah_key TEXT NOT NULL,                  -- "1:1", "2:255" etc.
  scholar TEXT NOT NULL,                   -- Canonical identifier: 'ibn-kathir', 'jalalayn', 'tabari'
  scholar_name TEXT NOT NULL,              -- Display name: "Ibn Kathir", "Jalalayn", "Al-Tabari"
  scholar_full_name TEXT,                  -- Full name: "Abdullah ibn Muhammad al-Qurashi"
  language TEXT DEFAULT 'en',              -- 'en', 'ar', 'ur'
  text TEXT NOT NULL,                      -- Tafsir explanation (may be very long)
  source TEXT,                             -- Source reference: "https://quran.com", etc.
  source_url TEXT,                         -- Direct link to full tafsir
  
  -- Metadata
  is_short_summary BOOLEAN DEFAULT FALSE,  -- Short summary vs. full commentary
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key constraint
  CONSTRAINT fk_tafsir_ayah FOREIGN KEY (ayah_key) REFERENCES ayahs(ayah_key),
  CONSTRAINT uq_tafsir_entry UNIQUE(ayah_key, scholar, language)
);

-- Indexes for tafsir_entries
CREATE INDEX idx_tafsir_ayah_key ON tafsir_entries(ayah_key);
CREATE INDEX idx_tafsir_scholar ON tafsir_entries(scholar);
CREATE INDEX idx_tafsir_language ON tafsir_entries(language);
CREATE INDEX idx_tafsir_scholar_language ON tafsir_entries(scholar, language);
```

**Available Tafsirs (from quran.com API v4):**
| Scholar | ID | Language |
|---------|----|----|
| Ibn Kathir | 169 | English |
| Jalalayn | 170 | English |
| Al-Tabari | 172 | English |
| Ibn Kathir (Arabic) | 174 | Arabic |
| Wahidi | 168 | English |

**Example Row:**
```
id: 1
ayah_key: 1:1
scholar: ibn-kathir
scholar_name: Ibn Kathir
scholar_full_name: Abdullah ibn Muhammad al-Qurashi
language: en
text: "This verse establishes the foundation of Islamic creed...
       Allah deserves all praise and thanks as He is the Lord..."
source: https://quran.com
is_short_summary: FALSE
```

---

### 1.4 Table: `bookmarks` (User Reading Lists)

Authenticated user bookmarks with optional personal notes.

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,                   -- Supabase auth.users.id
  ayah_key TEXT NOT NULL,                  -- Reference to ayahs table
  note TEXT,                               -- Optional personal note (max 500 chars)
  is_pinned BOOLEAN DEFAULT FALSE,         -- User-prioritized bookmarks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_bookmark_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookmark_ayah FOREIGN KEY (ayah_key) REFERENCES ayahs(ayah_key),
  CONSTRAINT uq_bookmark_per_user UNIQUE(user_id, ayah_key)
);

-- Indexes for bookmarks
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_ayah_key ON bookmarks(ayah_key);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
CREATE INDEX idx_bookmarks_is_pinned ON bookmarks(is_pinned) WHERE is_pinned = TRUE;
```

**Row-Level Security:** Users can only read/write their own bookmarks (see section 3).

**Example Row:**
```
id: 550e8400-e29b-41d4-a716-446655440000
user_id: 550e8400-e29b-41d4-a716-446655440001
ayah_key: 2:255
note: The Ayat al-Kursi - remember to reflect on this during evening dua
is_pinned: TRUE
created_at: 2026-04-01 10:30:00
```

---

### 1.5 Table: `reading_progress` (User Session State)

Tracks where each user last read in the Quran.

```sql
CREATE TABLE reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,                   -- Supabase auth.users.id
  surah_number INTEGER NOT NULL,           -- Current surah (1-114)
  ayah_number INTEGER NOT NULL,            -- Current ayah
  percentage_complete DECIMAL(5, 2),       -- 0.00 - 100.00
  total_read INTEGER DEFAULT 0,            -- Count of ayahs read
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_surah FOREIGN KEY (surah_number) REFERENCES surahs(number),
  CONSTRAINT uq_progress_per_user UNIQUE(user_id)
);

-- Indexes for reading_progress
CREATE INDEX idx_progress_user_id ON reading_progress(user_id);
CREATE INDEX idx_progress_surah_number ON reading_progress(surah_number);
CREATE INDEX idx_progress_updated_at ON reading_progress(updated_at DESC);
```

**Row-Level Security:** Users can only read/write their own progress (see section 3).

**Example Row:**
```
id: 660e8400-e29b-41d4-a716-446655440000
user_id: 550e8400-e29b-41d4-a716-446655440001
surah_number: 2
ayah_number: 50
percentage_complete: 5.42
total_read: 338
updated_at: 2026-04-13 15:22:00
```

---

### 1.6 Table: `user_preferences` (Customization Settings)

User display and reading preferences.

```sql
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,                   -- Supabase auth.users.id
  
  -- Display preferences
  font_size INTEGER DEFAULT 16,            -- 12-24 pixels
  theme TEXT DEFAULT 'light',              -- 'light', 'dark', 'sepia'
  arabic_font TEXT DEFAULT 'amiri',        -- 'amiri', 'noto-naskh', 'traditional'
  english_font TEXT DEFAULT 'inter',       -- 'inter', 'georgia', 'times-new-roman'
  
  -- Reading mode
  reading_mode TEXT DEFAULT 'side-by-side', -- 'side-by-side', 'above-below', 'arabic-only'
  show_translations BOOLEAN DEFAULT TRUE,
  show_transliteration BOOLEAN DEFAULT FALSE,
  show_tafsir BOOLEAN DEFAULT TRUE,
  
  -- Language preference
  ui_language TEXT DEFAULT 'en',           -- 'en', 'ar', 'ur'
  tafsir_language TEXT DEFAULT 'en',
  
  -- Notifications
  daily_reminder_enabled BOOLEAN DEFAULT FALSE,
  daily_reminder_time TIME,                -- 08:00:00
  notification_email BOOLEAN DEFAULT TRUE,
  
  -- Privacy
  profile_visibility TEXT DEFAULT 'private', -- 'public', 'private'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_prefs_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT uq_prefs_per_user UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_prefs_user_id ON user_preferences(user_id);
```

---

## 2. Indexes — Complete Reference

### 2.1 Indexes on `surahs`

```sql
-- Primary lookup by surah number
CREATE INDEX idx_surahs_number ON surahs(number);

-- URL routing
CREATE INDEX idx_surahs_slug ON surahs(slug);

-- Filtering by revelation type
CREATE INDEX idx_surahs_revelation_type ON surahs(revelation_type);

-- Range queries on juz
CREATE INDEX idx_surahs_juz_start ON surahs(juz_start);
CREATE INDEX idx_surahs_juz_end ON surahs(juz_end);
```

### 2.2 Indexes on `ayahs`

```sql
-- Canonical key for verse lookup
CREATE INDEX idx_ayahs_ayah_key ON ayahs(ayah_key);

-- Surah filtering
CREATE INDEX idx_ayahs_surah_number ON ayahs(surah_number);

-- Juz/Page navigation
CREATE INDEX idx_ayahs_juz ON ayahs(juz);
CREATE INDEX idx_ayahs_page ON ayahs(page);
CREATE INDEX idx_ayahs_hizb ON ayahs(hizb, hizb_quarter);

-- Sajda markers (partial index — only true values)
CREATE INDEX idx_ayahs_sajda ON ayahs(sajda) WHERE sajda = TRUE;

-- Full-text search (GIN index for TSVECTOR)
CREATE INDEX idx_ayahs_search_vector ON ayahs USING GIN(search_vector);

-- Vector similarity search (pgvector with IVFFlat)
-- Must have: CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX idx_ayahs_embedding_ivfflat ON ayahs 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Alternative: HNSW index (faster but requires more memory)
-- CREATE INDEX idx_ayahs_embedding_hnsw ON ayahs 
-- USING hnsw (embedding vector_cosine_ops) 
-- WITH (m = 16, ef_construction = 64);
```

### 2.3 Indexes on `tafsir_entries`

```sql
-- Verse lookup
CREATE INDEX idx_tafsir_ayah_key ON tafsir_entries(ayah_key);

-- Scholar filter
CREATE INDEX idx_tafsir_scholar ON tafsir_entries(scholar);

-- Language filter
CREATE INDEX idx_tafsir_language ON tafsir_entries(language);

-- Combined scholar + language (common query pattern)
CREATE INDEX idx_tafsir_scholar_language ON tafsir_entries(scholar, language);
```

### 2.4 Indexes on `bookmarks`

```sql
-- User's bookmarks
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- Find bookmark for specific verse
CREATE INDEX idx_bookmarks_ayah_key ON bookmarks(ayah_key);

-- Reverse lookup: which users bookmarked this verse
CREATE INDEX idx_bookmarks_ayah_user ON bookmarks(ayah_key, user_id);

-- Sort by creation date
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Pinned items (partial index)
CREATE INDEX idx_bookmarks_is_pinned ON bookmarks(is_pinned) WHERE is_pinned = TRUE;

-- User's pinned items (composite)
CREATE INDEX idx_bookmarks_user_pinned ON bookmarks(user_id, is_pinned) 
WHERE is_pinned = TRUE;
```

### 2.5 Indexes on `reading_progress`

```sql
-- User lookup
CREATE INDEX idx_progress_user_id ON reading_progress(user_id);

-- Surah filtering
CREATE INDEX idx_progress_surah_number ON reading_progress(surah_number);

-- Leaderboard: most recently active
CREATE INDEX idx_progress_updated_at ON reading_progress(updated_at DESC);
```

---

## 3. Row-Level Security (RLS) Policies

### 3.1 Enable RLS on All Tables

```sql
ALTER TABLE surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tafsir_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
```

### 3.2 RLS Policies for `surahs` (Public Read)

```sql
-- Public read access
CREATE POLICY "Allow public read on surahs" ON surahs
FOR SELECT
TO authenticated, anon
USING (TRUE);

-- No public write
CREATE POLICY "Deny public write on surahs" ON surahs
FOR INSERT
TO authenticated, anon
WITH CHECK (FALSE);

CREATE POLICY "Deny public update on surahs" ON surahs
FOR UPDATE
TO authenticated, anon
USING (FALSE);

CREATE POLICY "Deny public delete on surahs" ON surahs
FOR DELETE
TO authenticated, anon
USING (FALSE);
```

### 3.3 RLS Policies for `ayahs` (Public Read)

```sql
-- Public read access
CREATE POLICY "Allow public read on ayahs" ON ayahs
FOR SELECT
TO authenticated, anon
USING (TRUE);

-- No public write
CREATE POLICY "Deny public write on ayahs" ON ayahs
FOR INSERT
TO authenticated, anon
WITH CHECK (FALSE);

CREATE POLICY "Deny public update on ayahs" ON ayahs
FOR UPDATE
TO authenticated, anon
USING (FALSE);

CREATE POLICY "Deny public delete on ayahs" ON ayahs
FOR DELETE
TO authenticated, anon
USING (FALSE);
```

### 3.4 RLS Policies for `tafsir_entries` (Public Read)

```sql
-- Public read access
CREATE POLICY "Allow public read on tafsir_entries" ON tafsir_entries
FOR SELECT
TO authenticated, anon
USING (TRUE);

-- Admin-only write (restrict with service role in application code)
CREATE POLICY "Deny public write on tafsir_entries" ON tafsir_entries
FOR INSERT
TO authenticated, anon
WITH CHECK (FALSE);
```

### 3.5 RLS Policies for `bookmarks` (User-Specific)

```sql
-- Users can only read their own bookmarks
CREATE POLICY "Users can read own bookmarks" ON bookmarks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create bookmarks
CREATE POLICY "Users can create bookmarks" ON bookmarks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookmarks
CREATE POLICY "Users can update own bookmarks" ON bookmarks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Anon users cannot access bookmarks
CREATE POLICY "Deny anon access to bookmarks" ON bookmarks
FOR ALL
TO anon
USING (FALSE);
```

### 3.6 RLS Policies for `reading_progress` (User-Specific)

```sql
-- Users can read their own progress
CREATE POLICY "Users can read own reading_progress" ON reading_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert reading_progress" ON reading_progress
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own reading_progress" ON reading_progress
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users cannot delete progress (soft-delete via update instead)
CREATE POLICY "Deny delete on reading_progress" ON reading_progress
FOR DELETE
TO authenticated
USING (FALSE);

-- Anon users cannot access progress
CREATE POLICY "Deny anon access to reading_progress" ON reading_progress
FOR ALL
TO anon
USING (FALSE);
```

### 3.7 RLS Policies for `user_preferences` (User-Specific)

```sql
-- Users can read their own preferences
CREATE POLICY "Users can read own preferences" ON user_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert preferences
CREATE POLICY "Users can insert preferences" ON user_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON user_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Deny delete on preferences
CREATE POLICY "Deny delete on user_preferences" ON user_preferences
FOR DELETE
TO authenticated
USING (FALSE);
```

---

## 4. Full-Text Search Setup (TSVECTOR)

### 4.1 Enable pgvector Extension

```sql
-- Enable vector support for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pgvector methods for hybrid search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 4.2 Auto-Update Search Vector Trigger

```sql
-- Function to generate search vector from Arabic + English text
CREATE OR REPLACE FUNCTION update_ayah_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('arabic', COALESCE(NEW.text_arabic, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.text_english, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.text_transliteration, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT
CREATE TRIGGER trigger_update_ayah_search_vector_insert
BEFORE INSERT ON ayahs
FOR EACH ROW
EXECUTE FUNCTION update_ayah_search_vector();

-- Trigger on UPDATE
CREATE TRIGGER trigger_update_ayah_search_vector_update
BEFORE UPDATE OF text_arabic, text_english, text_transliteration ON ayahs
FOR EACH ROW
EXECUTE FUNCTION update_ayah_search_vector();

-- Manually update existing rows (if needed after adding this trigger)
UPDATE ayahs SET search_vector = 
  setweight(to_tsvector('arabic', COALESCE(text_arabic, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(text_english, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(text_transliteration, '')), 'C')
WHERE search_vector IS NULL;
```

### 4.3 Full-Text Search Function

```sql
-- Simple full-text search with ranking
CREATE OR REPLACE FUNCTION search_ayahs_fts(query TEXT)
RETURNS TABLE(
  id INTEGER,
  surah_number INTEGER,
  ayah_number INTEGER,
  ayah_key TEXT,
  text_arabic TEXT,
  text_english TEXT,
  text_urdu TEXT,
  juz INTEGER,
  page INTEGER,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.surah_number,
    a.ayah_number,
    a.ayah_key,
    a.text_arabic,
    a.text_english,
    a.text_urdu,
    a.juz,
    a.page,
    ts_rank(a.search_vector, to_tsquery('english', query)) AS rank
  FROM ayahs a
  WHERE a.search_vector @@ to_tsquery('english', query)
  ORDER BY rank DESC, a.surah_number, a.ayah_number
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM search_ayahs_fts('mercy & justice');
-- SELECT * FROM search_ayahs_fts('prayer | dua');
```

### 4.4 Advanced Full-Text Search with Filters

```sql
-- Full-text search with surah/juz/page filters
CREATE OR REPLACE FUNCTION search_ayahs_advanced(
  query TEXT,
  p_surah_number INTEGER DEFAULT NULL,
  p_juz INTEGER DEFAULT NULL,
  p_page INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
  id INTEGER,
  surah_number INTEGER,
  ayah_number INTEGER,
  ayah_key TEXT,
  text_arabic TEXT,
  text_english TEXT,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.surah_number,
    a.ayah_number,
    a.ayah_key,
    a.text_arabic,
    a.text_english,
    ts_rank(a.search_vector, to_tsquery('english', query)) AS rank
  FROM ayahs a
  WHERE a.search_vector @@ to_tsquery('english', query)
    AND (p_surah_number IS NULL OR a.surah_number = p_surah_number)
    AND (p_juz IS NULL OR a.juz = p_juz)
    AND (p_page IS NULL OR a.page = p_page)
  ORDER BY rank DESC, a.surah_number, a.ayah_number
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM search_ayahs_advanced('mercy', p_surah_number := 2, p_limit := 50);
-- SELECT * FROM search_ayahs_advanced('justice', p_juz := 15);
```

---

## 5. Vector Search Setup (pgvector + OpenAI Embeddings)

### 5.1 Create Embedding Column (Already in Schema)

```sql
-- Added to ayahs table:
-- embedding VECTOR(1536)  -- OpenAI ada-002 embedding (1536 dimensions)

-- Create index for vector similarity
CREATE INDEX idx_ayahs_embedding_ivfflat ON ayahs 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

### 5.2 Generate Embeddings (Function for Backend)

```sql
-- Function to retrieve embeddings for a verse (call from backend with OpenAI API)
CREATE OR REPLACE FUNCTION get_ayah_embedding(p_ayah_key TEXT)
RETURNS VECTOR(1536) AS $$
BEGIN
  RETURN (SELECT embedding FROM ayahs WHERE ayah_key = p_ayah_key);
END;
$$ LANGUAGE plpgsql;

-- Update ayah embeddings (called from backend after OpenAI API response)
CREATE OR REPLACE FUNCTION update_ayah_embedding(
  p_ayah_key TEXT,
  p_embedding VECTOR(1536)
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ayahs 
  SET embedding = p_embedding, updated_at = NOW()
  WHERE ayah_key = p_ayah_key;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 5.3 Vector Similarity Search Function

```sql
-- Find similar verses based on semantic meaning
CREATE OR REPLACE FUNCTION search_ayahs_semantic(
  p_embedding VECTOR(1536),
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  id INTEGER,
  surah_number INTEGER,
  ayah_number INTEGER,
  ayah_key TEXT,
  text_arabic TEXT,
  text_english TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.surah_number,
    a.ayah_number,
    a.ayah_key,
    a.text_arabic,
    a.text_english,
    (a.embedding <=> p_embedding) AS similarity  -- Cosine distance (lower is more similar)
  FROM ayahs a
  WHERE a.embedding IS NOT NULL
  ORDER BY a.embedding <=> p_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Example (backend would call with embedding from OpenAI):
-- SELECT * FROM search_ayahs_semantic('[0.001, -0.045, ...]'::vector, 10);
```

### 5.4 Hybrid Search (Full-Text + Vector)

```sql
-- Combine full-text and semantic search for best results
CREATE OR REPLACE FUNCTION search_ayahs_hybrid(
  query TEXT,
  p_embedding VECTOR(1536),
  p_fts_weight FLOAT DEFAULT 0.4,
  p_semantic_weight FLOAT DEFAULT 0.6,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  id INTEGER,
  surah_number INTEGER,
  ayah_number INTEGER,
  ayah_key TEXT,
  text_arabic TEXT,
  text_english TEXT,
  combined_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH fts_results AS (
    SELECT 
      a.id,
      a.surah_number,
      a.ayah_number,
      a.ayah_key,
      a.text_arabic,
      a.text_english,
      (ts_rank(a.search_vector, to_tsquery('english', query)) / 
       NULLIF((SELECT MAX(ts_rank(search_vector, to_tsquery('english', query))) 
               FROM ayahs WHERE search_vector @@ to_tsquery('english', query)), 0)) AS fts_score
    FROM ayahs a
    WHERE a.search_vector @@ to_tsquery('english', query)
  ),
  semantic_results AS (
    SELECT 
      a.id,
      a.surah_number,
      a.ayah_number,
      a.ayah_key,
      a.text_arabic,
      a.text_english,
      (1.0 / (1.0 + (a.embedding <=> p_embedding))) AS semantic_score
    FROM ayahs a
    WHERE a.embedding IS NOT NULL
    ORDER BY a.embedding <=> p_embedding
    LIMIT p_limit * 3
  )
  SELECT 
    COALESCE(fts.id, sem.id),
    COALESCE(fts.surah_number, sem.surah_number),
    COALESCE(fts.ayah_number, sem.ayah_number),
    COALESCE(fts.ayah_key, sem.ayah_key),
    COALESCE(fts.text_arabic, sem.text_arabic),
    COALESCE(fts.text_english, sem.text_english),
    (COALESCE(fts.fts_score, 0) * p_fts_weight + 
     COALESCE(sem.semantic_score, 0) * p_semantic_weight) AS combined_score
  FROM fts_results fts
  FULL OUTER JOIN semantic_results sem ON fts.ayah_key = sem.ayah_key
  ORDER BY combined_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Example:
-- SELECT * FROM search_ayahs_hybrid('mercy and compassion', '[0.001, ...]'::vector, 0.4, 0.6, 20);
```

---

## 6. Data Population Methods

### 6.1 Method 1: Populate Surahs from quran.com API v4

**Endpoint:** `GET https://api.quran.com/api/v4/chapters`

**Node.js Script:**

```javascript
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const QURAN_API = 'https://api.quran.com/api/v4';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function populateSurahs() {
  try {
    console.log('Fetching surahs from quran.com API...');
    const response = await axios.get(`${QURAN_API}/chapters`);
    const chapters = response.data.chapters;

    console.log(`Retrieved ${chapters.length} chapters`);

    const surahsData = chapters.map(ch => ({
      number: ch.chapter_number,
      name_arabic: ch.name_arabic,
      name_english: ch.name_english,
      name_transliteration: ch.translated_name?.text || ch.name_english,
      meaning: ch.translated_name?.text || '',
      revelation_type: ch.revelation_type, // 'meccan' or 'medinan'
      total_ayahs: ch.verses_count,
      juz_start: ch.juz_number_start,
      juz_end: ch.juz_number_end,
      page_start: ch.page_number_start,
      page_end: ch.page_number_end,
      slug: ch.name_english.toLowerCase().replace(/\s+/g, '-'),
      seo_title: `Surah ${ch.name_english} - Chapter ${ch.chapter_number} of the Quran`,
      meta_description: `Read Surah ${ch.name_english} (Chapter ${ch.chapter_number}) of the Quran with translations and tafsir.`,
    }));

    // Insert in batches
    const batchSize = 50;
    for (let i = 0; i < surahsData.length; i += batchSize) {
      const batch = surahsData.slice(i, i + batchSize);
      const { error } = await supabase
        .from('surahs')
        .upsert(batch, { onConflict: 'number' });

      if (error) {
        console.error(`Error inserting batch ${i / batchSize}:`, error);
      } else {
        console.log(`Inserted batch ${i / batchSize + 1}`);
      }
    }

    console.log('✓ Surahs population complete');
  } catch (error) {
    console.error('Error populating surahs:', error.message);
  }
}

populateSurahs();
```

---

### 6.2 Method 2: Populate Ayahs from tanzil.net + quran.com API

**Primary Source (Arabic):** Download from tanzil.net/download
**Translations:** quran.com API v4

**Node.js Script:**

```javascript
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const QURAN_API = 'https://api.quran.com/api/v4';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// quran.com translation IDs
const TRANSLATION_IDS = {
  SAHIH_INTL: 131,    // Sahih International (English)
  MUFTI_TAQI: 234,    // Mufti Taqi Usmani (Urdu)
};

// Simple JSON parser for tanzil.net Uthmani format
async function parseTanzilJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  return data;
}

async function fetchTranslations(surahNumber, ayahNumber) {
  try {
    const translations = {};

    // Fetch Sahih International
    const engResponse = await axios.get(
      `${QURAN_API}/quran/verses/translations/${TRANSLATION_IDS.SAHIH_INTL}?chapter_number=${surahNumber}&verse_number=${ayahNumber}`
    );
    if (engResponse.data.verses?.[0]) {
      translations.english = engResponse.data.verses[0].translation.text;
    }

    // Fetch Urdu (Mufti Taqi Usmani)
    const urduResponse = await axios.get(
      `${QURAN_API}/quran/verses/translations/${TRANSLATION_IDS.MUFTI_TAQI}?chapter_number=${surahNumber}&verse_number=${ayahNumber}`
    );
    if (urduResponse.data.verses?.[0]) {
      translations.urdu = urduResponse.data.verses[0].translation.text;
    }

    return translations;
  } catch (error) {
    console.error(`Error fetching translations for ${surahNumber}:${ayahNumber}`, error.message);
    return {};
  }
}

async function populateAyahs(tanzilFilePath) {
  try {
    console.log('Parsing Tanzil Arabic text...');
    const tanzilData = await parseTanzilJSON(tanzilFilePath);

    let totalAyahs = 0;
    let processedAyahs = 0;

    for (const [surahKey, verses] of Object.entries(tanzilData)) {
      const surahNumber = parseInt(surahKey);

      for (const [ayahIndex, arabicText] of Object.entries(verses)) {
        const ayahNumber = parseInt(ayahIndex) + 1;
        const ayahKey = `${surahNumber}:${ayahNumber}`;

        // Fetch translations
        console.log(`Fetching translations for ${ayahKey}...`);
        const translations = await fetchTranslations(surahNumber, ayahNumber);

        // Get juz/hizb info (from Madani mapping)
        const { juz, hizb, hizb_quarter, page } = getMadaniMetadata(
          surahNumber,
          ayahNumber
        );

        const ayahData = {
          surah_number: surahNumber,
          ayah_number: ayahNumber,
          ayah_key: ayahKey,
          text_arabic: arabicText,
          text_english: translations.english || null,
          text_urdu: translations.urdu || null,
          juz,
          hizb,
          hizb_quarter,
          page,
          sajda: checkSajda(surahNumber, ayahNumber).is_sajda,
          sajda_type: checkSajda(surahNumber, ayahNumber).type,
        };

        // Insert in batches
        const { error } = await supabase
          .from('ayahs')
          .upsert([ayahData], { onConflict: 'ayah_key' });

        if (error) {
          console.error(`Error inserting ${ayahKey}:`, error);
        } else {
          processedAyahs++;
          if (processedAyahs % 100 === 0) {
            console.log(`Processed ${processedAyahs} ayahs...`);
          }
        }

        totalAyahs++;

        // Respect API rate limits
        await delay(100);
      }
    }

    console.log(`✓ Populated ${processedAyahs} / ${totalAyahs} ayahs`);
  } catch (error) {
    console.error('Error populating ayahs:', error.message);
  }
}

// Helper: Get Madani mushaf juz/hizb/page info
function getMadaniMetadata(surahNumber, ayahNumber) {
  // Load from a pre-computed mapping (tanzil-data or quran.com metadata)
  // This is a placeholder — actual implementation uses mapping files
  return {
    juz: 1,
    hizb: 1,
    hizb_quarter: 0,
    page: 1,
  };
}

// Helper: Check if verse has sajda
function checkSajda(surahNumber, ayahNumber) {
  // Pre-computed list of sajda verses
  const sajdaVersesObligatory = [
    [7, 206],
    [13, 15],
    [16, 49],
    [19, 58],
    [22, 18],
    [25, 60],
    [27, 26],
    [32, 15],
    [38, 24],
    [41, 37],
    [53, 62],
    [84, 21],
    [96, 19],
  ];

  const sajdaVersesRecommended = [
    [9, 15],
    [14, 35],
    [23, 109],
    [29, 15],
    [37, 24],
    [40, 35],
    [76, 26],
    [82, 17],
  ];

  for (const [s, a] of sajdaVersesObligatory) {
    if (s === surahNumber && a === ayahNumber) {
      return { is_sajda: true, type: 'obligatory' };
    }
  }

  for (const [s, a] of sajdaVersesRecommended) {
    if (s === surahNumber && a === ayahNumber) {
      return { is_sajda: true, type: 'recommended' };
    }
  }

  return { is_sajda: false, type: null };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run
const tanzilPath = './quran-uthmani.json'; // Download from tanzil.net
populateAyahs(tanzilPath);
```

---

### 6.3 Method 3: CSV Bulk Import

**CSV Format:**

```csv
surah_number,ayah_number,text_arabic,text_english,text_urdu,juz,page
1,1,"الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ","All the praises and thanks be to Allah, the Lord of the worlds","تمام تعریفیں اللہ کے لیے ہیں",1,1
1,2,"الرَّحْمَٰنِ الرَّحِيمِ","The Most Gracious, the Most Merciful","بہت مہربان، بے انتہا رحم والے",1,1
```

**Supabase Dashboard Steps:**

1. Go to SQL Editor
2. Create table if not exists (see schema above)
3. Go to Table > Ayahs > Insert > Import from CSV
4. Select file → Map columns → Confirm

**Node.js Alternative:**

```javascript
import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function importFromCSV(csvPath) {
  const rows = [];
  
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      rows.push({
        surah_number: parseInt(row.surah_number),
        ayah_number: parseInt(row.ayah_number),
        ayah_key: `${row.surah_number}:${row.ayah_number}`,
        text_arabic: row.text_arabic,
        text_english: row.text_english,
        text_urdu: row.text_urdu,
        juz: parseInt(row.juz),
        page: parseInt(row.page),
      });
    })
    .on('end', async () => {
      const { error } = await supabase.from('ayahs').insert(rows);
      if (error) console.error('CSV import error:', error);
      else console.log(`✓ Imported ${rows.length} rows`);
    });
}

importFromCSV('./quran-ayahs.csv');
```

---

### 6.4 Method 4: Admin UI Form Entry

**Simple HTML Form:**

```html
<form id="ayah-form">
  <label>Surah Number
    <input type="number" name="surah_number" min="1" max="114" required>
  </label>
  
  <label>Ayah Number
    <input type="number" name="ayah_number" min="1" required>
  </label>
  
  <label>Arabic Text
    <textarea name="text_arabic" required></textarea>
  </label>
  
  <label>English Translation
    <textarea name="text_english"></textarea>
  </label>
  
  <label>Urdu Translation
    <textarea name="text_urdu"></textarea>
  </label>
  
  <label>Juz
    <input type="number" name="juz" min="1" max="30" required>
  </label>
  
  <label>Page
    <input type="number" name="page" required>
  </label>
  
  <button type="submit">Save Ayah</button>
</form>

<script>
document.getElementById('ayah-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const ayahData = {
    surah_number: parseInt(formData.get('surah_number')),
    ayah_number: parseInt(formData.get('ayah_number')),
    ayah_key: `${formData.get('surah_number')}:${formData.get('ayah_number')}`,
    text_arabic: formData.get('text_arabic'),
    text_english: formData.get('text_english'),
    text_urdu: formData.get('text_urdu'),
    juz: parseInt(formData.get('juz')),
    page: parseInt(formData.get('page')),
  };
  
  const { error } = await supabase.from('ayahs').upsert([ayahData]);
  if (error) {
    alert('Error: ' + error.message);
  } else {
    alert('✓ Ayah saved');
    e.target.reset();
  }
});
</script>
```

---

### 6.5 Generate OpenAI Embeddings (Scheduled Function)

**Supabase Edge Function (deno):**

```typescript
// supabase/functions/generate-embeddings/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Get ayahs without embeddings
    const { data: ayahsToEmbed } = await supabase
      .from('ayahs')
      .select('id, ayah_key, text_english')
      .is('embedding', null)
      .limit(100);

    if (!ayahsToEmbed || ayahsToEmbed.length === 0) {
      return new Response(JSON.stringify({ message: 'No ayahs to embed' }), {
        status: 200,
      });
    }

    let embedded = 0;

    for (const ayah of ayahsToEmbed) {
      const embedding = await generateEmbedding(ayah.text_english || '');

      await supabase
        .from('ayahs')
        .update({ embedding })
        .eq('ayah_key', ayah.ayah_key);

      embedded++;
      console.log(`Embedded ${embedded}/${ayahsToEmbed.length}`);

      // Rate limiting: OpenAI allows ~3,500 RPM on free tier
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    return new Response(
      JSON.stringify({ message: `Generated ${embedded} embeddings` }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
```

**Deploy:**

```bash
supabase functions deploy generate-embeddings --no-verify-jwt
```

**Trigger Periodically:**

```sql
-- Create cron trigger (requires Supabase paid tier for pg_cron)
SELECT cron.schedule('generate-embeddings', '0 2 * * *', 'SELECT http_post(''https://YOUR_PROJECT.supabase.co/functions/v1/generate-embeddings'')');
```

---

## 7. Tafsir Data Population

### 7.1 Populate Tafsir from quran.com API

**API Endpoints:**
- Ibn Kathir (ID 169): `/tafsirs/169/by_ayah/{ayah_key}`
- Jalalayn (ID 170): `/tafsirs/170/by_ayah/{ayah_key}`
- Wahidi (ID 168): `/tafsirs/168/by_ayah/{ayah_key}`

**Node.js Script:**

```javascript
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const QURAN_API = 'https://api.quran.com/api/v4';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

const TAFSIR_IDS = {
  'ibn-kathir': 169,
  'jalalayn': 170,
  'wahidi': 168,
};

async function populateTafsir() {
  try {
    // Get all ayahs
    const { data: ayahs } = await supabase
      .from('ayahs')
      .select('ayah_key')
      .limit(6236);

    let inserted = 0;

    for (const ayah of ayahs) {
      for (const [scholarKey, tafsirId] of Object.entries(TAFSIR_IDS)) {
        try {
          const response = await axios.get(
            `${QURAN_API}/tafsirs/${tafsirId}/by_ayah/${ayah.ayah_key}`
          );

          if (response.data.tafsir) {
            const tafsirData = {
              ayah_key: ayah.ayah_key,
              scholar: scholarKey,
              scholar_name: {
                'ibn-kathir': 'Ibn Kathir',
                'jalalayn': 'Jalalayn',
                'wahidi': 'Wahidi',
              }[scholarKey],
              language: 'en',
              text: response.data.tafsir.text,
              source: 'quran.com',
              source_url: `https://quran.com/${ayah.ayah_key}/tafsirs/${tafsirId}`,
            };

            const { error } = await supabase
              .from('tafsir_entries')
              .upsert([tafsirData], {
                onConflict: 'ayah_key,scholar,language',
              });

            if (!error) {
              inserted++;
            } else {
              console.error(`Error inserting tafsir for ${ayah.ayah_key}:`, error);
            }
          }

          await delay(50); // Rate limit
        } catch (error) {
          console.error(`Error fetching tafsir for ${ayah.ayah_key}:`, error.message);
        }
      }

      if (inserted % 100 === 0) {
        console.log(`Inserted ${inserted} tafsir entries...`);
      }
    }

    console.log(`✓ Populated ${inserted} tafsir entries`);
  } catch (error) {
    console.error('Error populating tafsir:', error.message);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

populateTafsir();
```

---

## 8. Database Maintenance & Operations

### 8.1 Index Monitoring

```sql
-- Check index sizes
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Check unused indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

### 8.2 Query Performance Monitoring

```sql
-- Slow queries (queries taking > 1 second)
SELECT 
  query,
  calls,
  mean_exec_time,
  max_exec_time,
  stddev_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;

-- Reset statistics (if needed)
SELECT pg_stat_statements_reset();
```

### 8.3 Backup Strategy

**Supabase Backups:**
- Automated daily backups (included in paid plans)
- Retain last 7 days
- Download from Supabase dashboard: Database > Backups

**Manual Backup (pg_dump):**

```bash
# Export entire database
pg_dump postgresql://user:password@host:5432/dbname > backup.sql

# Export specific table
pg_dump -t ayahs postgresql://user:password@host:5432/dbname > ayahs-backup.sql

# Restore
psql postgresql://user:password@host:5432/dbname < backup.sql
```

### 8.4 Reindex If Necessary

```sql
-- Reindex a specific table
REINDEX TABLE ayahs;

-- Reindex specific index
REINDEX INDEX idx_ayahs_search_vector;

-- Full database reindex (maintenance-heavy; do during low traffic)
REINDEX DATABASE dbname;
```

### 8.5 Analyze & Optimize

```sql
-- Update table statistics (helps query planner)
ANALYZE ayahs;
ANALYZE bookmarks;
ANALYZE reading_progress;

-- Check table size
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 9. Quick Reference: Essential Queries

### 9.1 Get Full Verse with Translations

```sql
SELECT 
  s.name_english,
  a.ayah_number,
  a.text_arabic,
  a.text_english,
  a.text_urdu
FROM ayahs a
JOIN surahs s ON a.surah_number = s.number
WHERE a.ayah_key = '2:255'
LIMIT 1;
```

### 9.2 Search by Keyword (Full-Text)

```sql
SELECT * FROM search_ayahs_fts('mercy');
```

### 9.3 Search Semantically (Vector)

```sql
-- Requires embedding from OpenAI first
SELECT * FROM search_ayahs_semantic('[0.001, -0.045, ...]'::vector, 10);
```

### 9.4 Hybrid Search

```sql
SELECT * FROM search_ayahs_hybrid('mercy', '[0.001, ...]'::vector, 0.4, 0.6, 20);
```

### 9.5 Get User's Bookmarks

```sql
SELECT 
  a.ayah_key,
  s.name_english,
  a.ayah_number,
  a.text_arabic,
  a.text_english,
  b.note
FROM bookmarks b
JOIN ayahs a ON b.ayah_key = a.ayah_key
JOIN surahs s ON a.surah_number = s.number
WHERE b.user_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY b.is_pinned DESC, b.created_at DESC;
```

### 9.6 Get Verses with Sajda

```sql
SELECT 
  s.name_english,
  a.ayah_number,
  a.sajda_type
FROM ayahs a
JOIN surahs s ON a.surah_number = s.number
WHERE a.sajda = TRUE
ORDER BY a.surah_number, a.ayah_number;
```

### 9.7 Get All Tafsir for Verse

```sql
SELECT 
  scholar_name,
  text,
  source
FROM tafsir_entries
WHERE ayah_key = '2:255'
ORDER BY scholar;
```

### 9.8 User Reading Statistics

```sql
SELECT 
  rp.user_id,
  s.name_english,
  rp.surah_number,
  rp.percentage_complete,
  rp.total_read,
  rp.updated_at
FROM reading_progress rp
JOIN surahs s ON rp.surah_number = s.number
WHERE rp.user_id = '550e8400-e29b-41d4-a716-446655440001';
```

---

## 10. Environment Variables (Supabase)

Store these securely in Cloudflare Pages or .env file (never commit):

```env
SUPABASE_URL=https://dwcsledifvnyrunxejzd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
QURAN_COM_API_KEY=optional
```

---

## 11. Deployment Checklist

- [ ] All tables created with correct schema
- [ ] All indexes created (FTS and vector)
- [ ] RLS policies enabled and tested
- [ ] Surahs populated from quran.com API
- [ ] Ayahs populated from tanzil.net + translations
- [ ] Tafsir entries populated from quran.com
- [ ] Embeddings generated (for semantic search)
- [ ] Search functions tested
- [ ] Hybrid search tested
- [ ] Backups configured and tested
- [ ] Monitoring queries set up
- [ ] API rate limiting handled gracefully
- [ ] Error handling and retries implemented
- [ ] Production database optimized (ANALYZE)

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-13  
**Maintainer:** AlHudah Platform Team
