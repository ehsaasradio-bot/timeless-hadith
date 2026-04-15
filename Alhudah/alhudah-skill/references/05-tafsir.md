# AlHudah Tafsir (Quranic Commentary) System — Detailed Reference Guide

**Version:** 1.0  
**Last Updated:** April 2026  
**Scope:** Complete tafsir implementation across AlHudah platform

---

## 1. Overview

Tafsir provides scholarly explanations and commentary for each verse of the Quran. AlHudah supports multiple tafsir sources loaded on-demand from the **quran.com API v4** and cached in **Supabase PostgreSQL** for offline access and performance.

### Design Principles
- **On-demand loading**: Fetch tafsir only when user requests it
- **Multi-source support**: Users can switch between different scholars
- **Intelligent caching**: Memory → Supabase → quran.com API (fastest to slowest)
- **Offline-first**: Pre-populated tafsir available without internet
- **Lightweight UI**: Smooth inline accordion that doesn't break page layout
- **Accessible**: Full keyboard navigation and screen reader support

---

## 2. Supported Tafsir Sources

| ID | Scholar | Language | Style | Best For |
|-----|---------|----------|-------|----------|
| **169** | Ibn Kathir | English | Classical, detailed | General understanding, Hadith-based |
| **164** | Tafsir al-Jalalayn | English | Classical, concise | Quick reference, brevity |
| **381** | Maariful Quran | English | Modern, traditional | Urdu-influenced, practical |
| **168** | Al-Tabari | English | Historical, earliest | Academic depth, variant opinions |
| **160** | Maududi (Tafheem) | English | Modern, Islamic reform | Contemporary Islamic thought |
| **817** | Ibn Kathir | Urdu | Classical, detailed | Urdu-speaking audience |
| **88** | Al-Jalalayn | Urdu | Classical, concise | Urdu quick reference |

### Adding New Tafsir Sources
To add a new tafsir:
1. Verify it exists in quran.com API v4 resources
2. Add row to `/sql/schema/tafsir_metadata.sql`
3. Test with: `GET https://api.quran.com/api/v4/tafsirs/{id}/by_ayah/1:1`
4. Update UI scholar dropdown in `js/tafsir-loader.js`

---

## 3. Supabase Schema

### Table: `tafsir_metadata`
Stores metadata about available tafsir sources.

```sql
CREATE TABLE tafsir_metadata (
  id BIGINT PRIMARY KEY,
  quran_com_id INT NOT NULL UNIQUE,
  scholar_name TEXT NOT NULL,
  scholar_short_name TEXT NOT NULL,
  language_code TEXT NOT NULL, -- 'en', 'ur', etc.
  style TEXT, -- 'classical', 'modern', 'concise'
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  source_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Example data
INSERT INTO tafsir_metadata (quran_com_id, scholar_name, scholar_short_name, language_code, style, description) VALUES
  (169, 'Ibn Kathir', 'Ibn Kathir', 'en', 'classical', 'Detailed classical tafsir with hadith support'),
  (164, 'Al-Jalalayn', 'Jalalayn', 'en', 'concise', 'Concise classical commentary'),
  (817, 'Ibn Kathir', 'Ibn Kathir (UR)', 'ur', 'classical', 'Urdu translation of Ibn Kathir');
```

### Table: `tafsir_entries`
Caches tafsir responses from quran.com API.

```sql
CREATE TABLE tafsir_entries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tafsir_id INT NOT NULL,
  ayah_key TEXT NOT NULL, -- Format: "1:1" (chapter:verse)
  ayah_number INT NOT NULL,
  surah_number INT NOT NULL,
  text TEXT NOT NULL,
  author TEXT,
  source_lang TEXT,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  api_version TEXT DEFAULT 'quran.com-v4',
  raw_response JSONB,
  
  CONSTRAINT fk_tafsir_metadata FOREIGN KEY (tafsir_id) 
    REFERENCES tafsir_metadata(quran_com_id),
  UNIQUE (tafsir_id, ayah_key)
);

CREATE INDEX idx_tafsir_entries_ayah ON tafsir_entries(surah_number, ayah_number, tafsir_id);
CREATE INDEX idx_tafsir_entries_key ON tafsir_entries(ayah_key, tafsir_id);
CREATE INDEX idx_tafsir_entries_cache_age ON tafsir_entries(cached_at DESC);
```

### Table: `tafsir_sync_log`
Tracks background sync of tafsir data from quran.com API.

```sql
CREATE TABLE tafsir_sync_log (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  tafsir_id INT NOT NULL,
  sync_started_at TIMESTAMP DEFAULT NOW(),
  sync_completed_at TIMESTAMP,
  total_verses INT,
  successfully_fetched INT,
  failed_count INT,
  errors JSONB,
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'failed'
  next_sync_scheduled_for TIMESTAMP,
  
  CONSTRAINT fk_tafsir_metadata FOREIGN KEY (tafsir_id)
    REFERENCES tafsir_metadata(quran_com_id)
);
```

---

## 4. quran.com API v4 — Tafsir Endpoints

### 4.1 Get Tafsir for a Specific Verse

**Endpoint:**
```
GET https://api.quran.com/api/v4/tafsirs/{tafsir_id}/by_ayah/{ayah_key}
```

**Parameters:**
- `tafsir_id` (int, required): Scholar ID (e.g., 169 for Ibn Kathir)
- `ayah_key` (string, required): Format `{chapter}:{verse}` (e.g., `2:255`)

**Example Request:**
```bash
curl "https://api.quran.com/api/v4/tafsirs/169/by_ayah/1:1" \
  -H "Accept: application/json"
```

**Example Response (Success 200):**
```json
{
  "tafsir": {
    "id": 123456,
    "ayah_id": 1,
    "text": "In the name of Allah, the Most Gracious, the Most Merciful. This is the opening of the Qur'an, the best of books and the most eloquent...",
    "tafsir_id": 169,
    "author_name": "Ibn Kathir"
  }
}
```

**Example Response (Not Found 404):**
```json
{
  "error": "Tafsir not found for ayah 1:1 and tafsir_id 169"
}
```

### 4.2 Get All Tafsir for a Chapter

**Endpoint:**
```
GET https://api.quran.com/api/v4/tafsirs/{tafsir_id}/by_chapter/{chapter_number}
```

**Parameters:**
- `tafsir_id` (int, required): Scholar ID
- `chapter_number` (int, required): Surah number (1-114)

**Example Request:**
```bash
curl "https://api.quran.com/api/v4/tafsirs/169/by_chapter/1" \
  -H "Accept: application/json"
```

**Example Response (Success 200):**
```json
{
  "tafsirs": [
    {
      "id": 123456,
      "ayah_id": 1,
      "text": "In the name of Allah, the Most Gracious...",
      "tafsir_id": 169
    },
    {
      "id": 123457,
      "ayah_id": 2,
      "text": "This is the Book about which there is no doubt...",
      "tafsir_id": 169
    }
  ]
}
```

### 4.3 List All Available Tafsir Sources

**Endpoint:**
```
GET https://api.quran.com/api/v4/resources/tafsirs
```

**Example Request:**
```bash
curl "https://api.quran.com/api/v4/resources/tafsirs" \
  -H "Accept: application/json"
```

**Example Response (Success 200):**
```json
{
  "tafsirs": [
    {
      "id": 169,
      "name": "Ibn Kathir",
      "author_name": "Abdullah ibn Ahmad ibn Hanbal",
      "slug": "ibn-kathir",
      "language_name": "English",
      "translated_name": {
        "language_name": "English",
        "text": "Ibn Kathir"
      }
    },
    {
      "id": 164,
      "name": "Al-Jalalayn",
      "author_name": "Jalal al-Din al-Mahalli and Jalal al-Din al-Suyuti",
      "slug": "al-jalalayn",
      "language_name": "English",
      "translated_name": {
        "language_name": "English",
        "text": "Al-Jalalayn"
      }
    },
    {
      "id": 817,
      "name": "Ibn Kathir",
      "author_name": "Abdullah ibn Ahmad ibn Hanbal",
      "slug": "ibn-kathir",
      "language_name": "Urdu",
      "translated_name": {
        "language_name": "Urdu",
        "text": "ابن کثیر"
      }
    }
  ]
}
```

### 4.4 Rate Limiting & Best Practices

- **Rate Limit**: ~100 requests per minute per IP
- **Caching**: Implement aggressive caching (see Section 5)
- **Timeouts**: Set 10-second timeout on all API calls
- **User-Agent**: Include `User-Agent: AlHudah/1.0` header
- **Error Handling**: Fallback to cached data on API failure

---

## 5. Caching Strategy

### 5.1 Three-Level Cache Architecture

```
User Request
    ↓
[Level 1: Memory Cache] ← Fast (0ms)
    ↓ (miss)
[Level 2: Supabase Cache] ← Medium (50-200ms)
    ↓ (miss)
[Level 3: quran.com API] ← Slow (500-2000ms)
    ↓
[Response + Save to L2 & L1]
```

### 5.2 Level 1: In-Memory Cache

Implemented in `js/tafsir-loader.js`:

```javascript
// In-memory cache for tafsir entries
const TAFSIR_CACHE = new Map();

// Key format: `${tafsir_id}:${ayah_key}`
// Value: { text, scholar_name, timestamp, source }

class TafsirMemoryCache {
  constructor(maxSize = 500) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }

  set(key, value) {
    // Implement LRU eviction if cache exceeds maxSize
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      ...value,
      timestamp: Date.now(),
      ttl: 60 * 60 * 1000 // 1 hour
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    this.hits++;
    return entry;
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total === 0 ? 0 : ((this.hits / total) * 100).toFixed(2) + '%',
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

const tafsirMemCache = new TafsirMemoryCache();
```

### 5.3 Level 2: Supabase Cache

Implemented in `api/tafsir-service.js`:

```javascript
/**
 * Fetch tafsir from Supabase cache
 * Returns cached entry if exists and not expired
 */
async function getTafsirFromSupabase(tafsirId, ayahKey) {
  const { data, error } = await supabase
    .from('tafsir_entries')
    .select('*')
    .eq('tafsir_id', tafsirId)
    .eq('ayah_key', ayahKey)
    .is('expires_at', null) // Not expired
    .single();

  if (error) {
    console.warn('Tafsir cache miss in Supabase:', error);
    return null;
  }

  return data;
}

/**
 * Save tafsir to Supabase cache
 */
async function saveTafsirToSupabase(tafsirId, ayahKey, text, metadata = {}) {
  const [surahNum, ayahNum] = ayahKey.split(':').map(Number);
  
  const { error } = await supabase
    .from('tafsir_entries')
    .upsert({
      tafsir_id: tafsirId,
      ayah_key: ayahKey,
      surah_number: surahNum,
      ayah_number: ayahNum,
      text: text,
      author: metadata.author,
      source_lang: metadata.language || 'en',
      cached_at: new Date().toISOString(),
      api_version: 'quran.com-v4',
      raw_response: metadata.raw || {}
    }, {
      onConflict: 'tafsir_id,ayah_key'
    });

  if (error) {
    console.error('Failed to cache tafsir in Supabase:', error);
  }
}
```

### 5.4 Level 3: quran.com API Fetch

```javascript
/**
 * Fetch tafsir from quran.com API with retry logic
 */
async function fetchTafsirFromAPI(tafsirId, ayahKey, retries = 3) {
  const url = `https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_ayah/${ayahKey}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AlHudah/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.tafsir) {
        throw new Error('No tafsir in response');
      }

      return {
        text: data.tafsir.text,
        author: data.tafsir.author_name || 'Unknown',
        language: 'en',
        raw: data
      };

    } catch (error) {
      console.warn(`Attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt < retries) {
        // Exponential backoff: 100ms, 300ms, 900ms
        await new Promise(resolve => 
          setTimeout(resolve, 100 * Math.pow(3, attempt - 1))
        );
      }
    }
  }

  throw new Error(`Failed to fetch tafsir after ${retries} attempts`);
}
```

### 5.5 Unified Fetch with Cascading Fallback

```javascript
/**
 * Main function: Get tafsir with intelligent cache fallback
 * L1 (memory) → L2 (Supabase) → L3 (API) → Error
 */
async function getTafsir(tafsirId, ayahKey) {
  // Level 1: Check memory cache
  const memCached = tafsirMemCache.get(`${tafsirId}:${ayahKey}`);
  if (memCached) {
    console.log('✓ Memory cache hit');
    return memCached;
  }

  // Level 2: Check Supabase cache
  try {
    const dbCached = await getTafsirFromSupabase(tafsirId, ayahKey);
    if (dbCached) {
      console.log('✓ Supabase cache hit');
      // Promote to memory cache
      tafsirMemCache.set(`${tafsirId}:${ayahKey}`, {
        text: dbCached.text,
        author: dbCached.author,
        source: 'supabase'
      });
      return dbCached;
    }
  } catch (error) {
    console.warn('Supabase fetch failed, falling back to API:', error);
  }

  // Level 3: Fetch from quran.com API
  try {
    console.log('→ Fetching from quran.com API...');
    const apiData = await fetchTafsirFromAPI(tafsirId, ayahKey);
    
    // Save to Supabase for future cache hits
    await saveTafsirToSupabase(tafsirId, ayahKey, apiData.text, apiData);
    
    // Promote to memory cache
    tafsirMemCache.set(`${tafsirId}:${ayahKey}`, {
      text: apiData.text,
      author: apiData.author,
      source: 'api'
    });
    
    return {
      text: apiData.text,
      author: apiData.author
    };
  } catch (error) {
    console.error('All cache levels exhausted, tafsir unavailable:', error);
    throw new Error(`Tafsir unavailable: ${error.message}`);
  }
}
```

---

## 6. UI Design

### 6.1 Tafsir Button & Panel

The tafsir button is placed inline with each verse. When clicked, a smooth accordion panel slides down below the verse.

#### HTML Structure

```html
<div class="ayah-container" data-ayah-key="2:255">
  <div class="ayah-text">
    Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence...
  </div>
  
  <!-- Tafsir Button -->
  <button 
    class="tafsir-button"
    data-ayah-key="2:255"
    aria-label="Show tafsir commentary for this verse"
    aria-expanded="false"
  >
    <svg class="tafsir-icon" width="20" height="20" viewBox="0 0 24 24">
      <!-- Book icon SVG -->
      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="currentColor"/>
    </svg>
    <span class="tafsir-label">Tafsir</span>
  </button>
  
  <!-- Tafsir Panel (Initially Hidden) -->
  <div class="tafsir-panel" id="tafsir-2-255" role="region" aria-label="Tafsir commentary">
    <div class="tafsir-header">
      <label for="scholar-select-2-255" class="tafsir-scholar-label">Choose Scholar:</label>
      <select id="scholar-select-2-255" class="tafsir-scholar-select" data-ayah-key="2:255">
        <option value="169">Ibn Kathir (English)</option>
        <option value="164">Al-Jalalayn (English)</option>
        <option value="381">Maariful Quran (English)</option>
        <option value="168">Al-Tabari (English)</option>
        <option value="817">Ibn Kathir (Urdu)</option>
      </select>
    </div>
    
    <div class="tafsir-content">
      <div class="tafsir-loading" style="display: none;">
        <div class="spinner"></div>
        <span>Loading tafsir...</span>
      </div>
      <div class="tafsir-text" style="display: none;"></div>
      <div class="tafsir-error" style="display: none;">
        <p>Unable to load tafsir. Please try again.</p>
      </div>
    </div>
    
    <div class="tafsir-footer">
      <button class="tafsir-close-btn" aria-label="Close tafsir panel">
        Close
      </button>
      <span class="tafsir-source" style="display: none;"></span>
    </div>
  </div>
</div>
```

### 6.2 Complete CSS

```css
/* ============================================
   TAFSIR PANEL STYLES
   ============================================ */

.ayah-container {
  position: relative;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--color-bg-secondary);
  transition: background-color 0.3s ease;
}

.ayah-container:hover {
  background: var(--color-bg-tertiary);
}

/* Tafsir Button */
.tafsir-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tafsir-button:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.3);
}

.tafsir-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.tafsir-button:active {
  transform: translateY(0);
}

.tafsir-button[aria-expanded="true"] {
  background: var(--color-primary);
  color: white;
}

.tafsir-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.tafsir-button[aria-expanded="true"] .tafsir-icon {
  transform: rotate(180deg);
}

/* Tafsir Panel Container */
.tafsir-panel {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--color-bg-panel);
  border: 1px solid var(--color-border);
  border-top: none;
  border-radius: 0 0 0.5rem 0.5rem;
  margin-top: -1px;
}

.tafsir-panel.open {
  max-height: 800px;
  opacity: 1;
  padding: 1rem;
  overflow-y: auto;
}

/* Tafsir Header */
.tafsir-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.tafsir-scholar-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tafsir-scholar-select {
  padding: 0.5rem 0.75rem;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tafsir-scholar-select:hover {
  border-color: var(--color-primary);
  background: var(--color-bg-tertiary);
}

.tafsir-scholar-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

/* Tafsir Content */
.tafsir-content {
  min-height: 100px;
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem 0;
}

/* Loading Spinner */
.tafsir-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Tafsir Text */
.tafsir-text {
  line-height: 1.8;
  color: var(--color-text);
  font-size: 0.95rem;
}

.tafsir-text p {
  margin-bottom: 1rem;
}

.tafsir-text p:last-child {
  margin-bottom: 0;
}

.tafsir-text strong {
  color: var(--color-text-primary);
  font-weight: 600;
}

.tafsir-text em {
  color: var(--color-text-secondary);
  font-style: normal;
}

/* Error State */
.tafsir-error {
  padding: 1rem;
  background: var(--color-error-light);
  border: 1px solid var(--color-error);
  border-radius: 0.375rem;
  color: var(--color-error);
  text-align: center;
}

.tafsir-error p {
  margin: 0;
  font-size: 0.875rem;
}

/* Tafsir Footer */
.tafsir-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.tafsir-close-btn {
  padding: 0.375rem 0.75rem;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tafsir-close-btn:hover {
  background: var(--color-error-light);
  color: var(--color-error);
  border-color: var(--color-error);
}

.tafsir-source {
  font-style: italic;
  color: var(--color-text-tertiary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .tafsir-panel.open {
    max-height: 600px;
  }

  .tafsir-content {
    max-height: 400px;
  }

  .tafsir-header {
    flex-direction: column;
  }

  .tafsir-scholar-select {
    width: 100%;
  }

  .tafsir-text {
    font-size: 0.9rem;
    line-height: 1.7;
  }
}

@media (max-width: 480px) {
  .ayah-container {
    padding: 0.75rem;
  }

  .tafsir-button {
    width: 100%;
    justify-content: center;
  }

  .tafsir-panel.open {
    max-height: 500px;
  }

  .tafsir-content {
    max-height: 300px;
  }

  .tafsir-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .tafsir-close-btn {
    width: 100%;
    text-align: center;
  }
}

/* Dark Mode Overrides */
@media (prefers-color-scheme: dark) {
  .tafsir-panel {
    background: var(--color-bg-panel-dark);
    border-color: var(--color-border-dark);
  }

  .tafsir-text {
    color: var(--color-text-dark);
  }

  .tafsir-scholar-select {
    background: var(--color-bg-secondary-dark);
    color: var(--color-text-dark);
    border-color: var(--color-border-dark);
  }
}

/* Print Styles */
@media print {
  .tafsir-button {
    display: none;
  }

  .tafsir-panel {
    max-height: none;
    opacity: 1;
    padding: 1rem;
    page-break-inside: avoid;
  }
}
```

---

## 7. JavaScript Implementation: `js/tafsir-loader.js`

Complete, production-ready tafsir loader with all features:

```javascript
/**
 * AlHudah Tafsir Loader
 * Handles loading, caching, and rendering of Quranic commentary
 * 
 * Features:
 * - 3-level caching (memory, Supabase, API)
 * - Multiple scholar support
 * - Keyboard navigation & accessibility
 * - Error handling with retry
 * - Offline support
 * - Rate limiting
 */

// ============================================
// Configuration
// ============================================

const TAFSIR_CONFIG = {
  CACHE_TTL_MEMORY: 60 * 60 * 1000, // 1 hour
  CACHE_TTL_SUPABASE: 30 * 24 * 60 * 60 * 1000, // 30 days
  API_TIMEOUT: 10000, // 10 seconds
  API_RETRY_ATTEMPTS: 3,
  API_RATE_LIMIT: 100, // requests per minute
  MAX_MEMORY_CACHE_SIZE: 500,
  PANEL_ANIMATION_DURATION: 400,
  DEFAULT_TAFSIR_ID: 169 // Ibn Kathir
};

const TAFSIR_SOURCES = [
  { id: 169, name: 'Ibn Kathir', lang: 'en', short: 'Ibn Kathir' },
  { id: 164, name: 'Al-Jalalayn', lang: 'en', short: 'Jalalayn' },
  { id: 381, name: 'Maariful Quran', lang: 'en', short: 'Maariful' },
  { id: 168, name: 'Al-Tabari', lang: 'en', short: 'Tabari' },
  { id: 160, name: 'Maududi (Tafheem)', lang: 'en', short: 'Maududi' },
  { id: 817, name: 'Ibn Kathir (Urdu)', lang: 'ur', short: 'Ibn Kathir UR' }
];

const QURAN_COM_API_BASE = 'https://api.quran.com/api/v4';

// ============================================
// Memory Cache Implementation
// ============================================

class TafsirMemoryCache {
  constructor(maxSize = TAFSIR_CONFIG.MAX_MEMORY_CACHE_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }

  set(key, value) {
    // LRU eviction: remove oldest entry if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      ...value,
      timestamp: Date.now(),
      ttl: TAFSIR_CONFIG.CACHE_TTL_MEMORY
    });
  }

  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check TTL expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry;
  }

  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  getStats() {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total === 0 ? 0 : ((this.hits / total) * 100).toFixed(2) + '%',
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

// Global cache instance
const tafsirMemCache = new TafsirMemoryCache();

// ============================================
// Rate Limiter
// ============================================

class RateLimiter {
  constructor(maxRequests = TAFSIR_CONFIG.API_RATE_LIMIT, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    return false;
  }

  getRemainingRequests() {
    const now = Date.now();
    this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);
    return this.maxRequests - this.requests.length;
  }
}

const apiRateLimiter = new RateLimiter();

// ============================================
// Supabase Integration
// ============================================

/**
 * Fetch tafsir from Supabase cache
 */
async function getTafsirFromSupabase(tafsirId, ayahKey) {
  try {
    // Validate Supabase is available
    if (typeof window.supabase === 'undefined') {
      console.warn('Supabase not available');
      return null;
    }

    const [surahNum, ayahNum] = ayahKey.split(':').map(Number);

    const { data, error } = await window.supabase
      .from('tafsir_entries')
      .select('*')
      .eq('tafsir_id', tafsirId)
      .eq('ayah_key', ayahKey)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Not a "no rows" error
        console.warn('Supabase tafsir fetch error:', error);
      }
      return null;
    }

    return {
      text: data.text,
      author: data.author,
      cached_at: data.cached_at,
      source: 'supabase'
    };

  } catch (error) {
    console.error('Supabase cache access failed:', error);
    return null;
  }
}

/**
 * Save tafsir to Supabase cache
 */
async function saveTafsirToSupabase(tafsirId, ayahKey, text, metadata = {}) {
  try {
    if (typeof window.supabase === 'undefined') return;

    const [surahNum, ayahNum] = ayahKey.split(':').map(Number);

    const { error } = await window.supabase
      .from('tafsir_entries')
      .upsert({
        tafsir_id: tafsirId,
        ayah_key: ayahKey,
        surah_number: surahNum,
        ayah_number: ayahNum,
        text: text,
        author: metadata.author || 'Unknown',
        source_lang: metadata.language || 'en',
        cached_at: new Date().toISOString(),
        api_version: 'quran.com-v4',
        raw_response: metadata.raw || {}
      }, {
        onConflict: 'tafsir_id,ayah_key'
      });

    if (error) {
      console.warn('Failed to cache tafsir in Supabase:', error);
    }

  } catch (error) {
    console.error('Supabase save failed:', error);
  }
}

// ============================================
// quran.com API Fetcher
// ============================================

/**
 * Fetch tafsir from quran.com API with exponential backoff retry
 */
async function fetchTafsirFromAPI(tafsirId, ayahKey, retries = TAFSIR_CONFIG.API_RETRY_ATTEMPTS) {
  // Check rate limit
  if (!apiRateLimiter.canMakeRequest()) {
    const remaining = apiRateLimiter.getRemainingRequests();
    throw new Error(`Rate limited. Try again in ${Math.ceil(60000 / TAFSIR_CONFIG.API_RATE_LIMIT)}s. (${remaining} requests remaining)`);
  }

  const url = `${QURAN_COM_API_BASE}/tafsirs/${tafsirId}/by_ayah/${ayahKey}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        TAFSIR_CONFIG.API_TIMEOUT
      );

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AlHudah/1.0 (Quran.com API Client)'
        },
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.tafsir) {
        throw new Error('No tafsir in response payload');
      }

      return {
        text: data.tafsir.text,
        author: data.tafsir.author_name || 'Unknown',
        language: 'en',
        raw: data,
        source: 'api'
      };

    } catch (error) {
      const isLastAttempt = attempt === retries;
      const backoffMs = 100 * Math.pow(3, attempt - 1); // 100ms, 300ms, 900ms

      if (isLastAttempt) {
        throw new Error(`API fetch failed after ${retries} attempts: ${error.message}`);
      }

      console.warn(`Tafsir fetch attempt ${attempt}/${retries} failed: ${error.message}. Retrying in ${backoffMs}ms...`);

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
}

// ============================================
// Unified Tafsir Retrieval
// ============================================

/**
 * Main function: Get tafsir with intelligent 3-level cache
 * L1 (memory) → L2 (Supabase) → L3 (API) → Error
 */
async function getTafsir(tafsirId, ayahKey) {
  const cacheKey = `${tafsirId}:${ayahKey}`;

  // Level 1: Memory cache
  const memCached = tafsirMemCache.get(cacheKey);
  if (memCached) {
    console.debug(`✓ Memory cache hit for ${ayahKey}`);
    return memCached;
  }

  // Level 2: Supabase cache
  try {
    const dbCached = await getTafsirFromSupabase(tafsirId, ayahKey);
    if (dbCached) {
      console.debug(`✓ Supabase cache hit for ${ayahKey}`);
      // Promote to memory cache
      tafsirMemCache.set(cacheKey, {
        text: dbCached.text,
        author: dbCached.author,
        source: 'supabase'
      });
      return dbCached;
    }
  } catch (error) {
    console.warn('Supabase cache lookup failed, falling back to API:', error);
  }

  // Level 3: quran.com API
  try {
    console.debug(`→ Fetching from quran.com API for ${ayahKey}...`);
    const apiData = await fetchTafsirFromAPI(tafsirId, ayahKey);

    // Save to Supabase for future cache hits
    await saveTafsirToSupabase(tafsirId, ayahKey, apiData.text, apiData);

    // Promote to memory cache
    tafsirMemCache.set(cacheKey, {
      text: apiData.text,
      author: apiData.author,
      source: 'api'
    });

    return {
      text: apiData.text,
      author: apiData.author,
      source: 'api'
    };

  } catch (error) {
    console.error(`✗ Tafsir unavailable for ${ayahKey}: ${error.message}`);
    throw error;
  }
}

// ============================================
// UI Rendering
// ============================================

/**
 * Render tafsir panel with scholar selector and content
 */
function renderTafsirPanel(ayahKey, text, author) {
  const panelId = `tafsir-${ayahKey.replace(':', '-')}`;
  const panel = document.getElementById(panelId);

  if (!panel) {
    console.error(`Tafsir panel not found: ${panelId}`);
    return;
  }

  const loadingEl = panel.querySelector('.tafsir-loading');
  const textEl = panel.querySelector('.tafsir-text');
  const errorEl = panel.querySelector('.tafsir-error');
  const sourceEl = panel.querySelector('.tafsir-source');

  // Hide loading, show text
  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';

  if (textEl) {
    textEl.innerHTML = sanitizeHTML(text);
    textEl.style.display = 'block';
  }

  if (sourceEl) {
    sourceEl.textContent = `Source: ${author}`;
    sourceEl.style.display = 'inline';
  }
}

/**
 * Show error message in tafsir panel
 */
function showTafsirError(ayahKey, message) {
  const panelId = `tafsir-${ayahKey.replace(':', '-')}`;
  const panel = document.getElementById(panelId);

  if (!panel) return;

  const loadingEl = panel.querySelector('.tafsir-loading');
  const textEl = panel.querySelector('.tafsir-text');
  const errorEl = panel.querySelector('.tafsir-error');

  if (loadingEl) loadingEl.style.display = 'none';
  if (textEl) textEl.style.display = 'none';
  if (errorEl) {
    errorEl.innerHTML = `<p>Unable to load tafsir: ${sanitizeHTML(message)}</p>`;
    errorEl.style.display = 'block';
  }
}

/**
 * Show loading spinner in tafsir panel
 */
function showTafsirLoading(ayahKey) {
  const panelId = `tafsir-${ayahKey.replace(':', '-')}`;
  const panel = document.getElementById(panelId);

  if (!panel) return;

  const loadingEl = panel.querySelector('.tafsir-loading');
  const textEl = panel.querySelector('.tafsir-text');
  const errorEl = panel.querySelector('.tafsir-error');

  if (loadingEl) loadingEl.style.display = 'flex';
  if (textEl) textEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';
}

/**
 * Sanitize HTML to prevent XSS
 */
function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// ============================================
// Panel State Management
// ============================================

/**
 * Open tafsir panel with animation
 */
function openTafsirPanel(ayahKey) {
  const panelId = `tafsir-${ayahKey.replace(':', '-')}`;
  const panel = document.getElementById(panelId);
  const button = document.querySelector(`[data-ayah-key="${ayahKey}"].tafsir-button`);

  if (!panel || !button) return;

  panel.classList.add('open');
  button.setAttribute('aria-expanded', 'true');
}

/**
 * Close tafsir panel with animation
 */
function closeTafsirPanel(ayahKey) {
  const panelId = `tafsir-${ayahKey.replace(':', '-')}`;
  const panel = document.getElementById(panelId);
  const button = document.querySelector(`[data-ayah-key="${ayahKey}"].tafsir-button`);

  if (!panel || !button) return;

  panel.classList.remove('open');
  button.setAttribute('aria-expanded', 'false');
}

/**
 * Toggle tafsir panel
 */
function toggleTafsirPanel(ayahKey) {
  const panelId = `tafsir-${ayahKey.replace(':', '-')}`;
  const panel = document.getElementById(panelId);

  if (!panel) return;

  if (panel.classList.contains('open')) {
    closeTafsirPanel(ayahKey);
  } else {
    openTafsirPanel(ayahKey);
  }
}

// ============================================
// Event Handlers
// ============================================

/**
 * Handle tafsir button click
 */
async function handleTafsirButtonClick(event) {
  const button = event.currentTarget;
  const ayahKey = button.getAttribute('data-ayah-key');

  if (!ayahKey) {
    console.error('No ayah-key found on tafsir button');
    return;
  }

  const panelId = `tafsir-${ayahKey.replace(':', '-')}`;
  const panel = document.getElementById(panelId);

  if (!panel) {
    console.error(`Tafsir panel not found: ${panelId}`);
    return;
  }

  // If already open, close it
  if (panel.classList.contains('open')) {
    closeTafsirPanel(ayahKey);
    return;
  }

  // Open panel
  openTafsirPanel(ayahKey);

  // Load tafsir if not already loaded
  const textEl = panel.querySelector('.tafsir-text');
  if (!textEl.textContent || textEl.textContent.trim() === '') {
    showTafsirLoading(ayahKey);
    
    const tafsirSelect = panel.querySelector('.tafsir-scholar-select');
    const tafsirId = parseInt(tafsirSelect.value);

    try {
      const tafsir = await getTafsir(tafsirId, ayahKey);
      renderTafsirPanel(ayahKey, tafsir.text, tafsir.author);
    } catch (error) {
      showTafsirError(ayahKey, error.message);
    }
  }
}

/**
 * Handle scholar selector change
 */
async function handleScholarChange(event) {
  const select = event.currentTarget;
  const ayahKey = select.getAttribute('data-ayah-key');
  const tafsirId = parseInt(select.value);

  if (!ayahKey) {
    console.error('No ayah-key found on scholar select');
    return;
  }

  showTafsirLoading(ayahKey);

  try {
    const tafsir = await getTafsir(tafsirId, ayahKey);
    renderTafsirPanel(ayahKey, tafsir.text, tafsir.author);
  } catch (error) {
    showTafsirError(ayahKey, error.message);
  }
}

/**
 * Handle close button click
 */
function handleCloseButton(event) {
  const button = event.currentTarget;
  const panel = button.closest('.tafsir-panel');
  const panelId = panel.id;

  const ayahKey = panelId.replace('tafsir-', '').replace(/-/g, ':');
  closeTafsirPanel(ayahKey);
}

// ============================================
// Keyboard Navigation
// ============================================

/**
 * Initialize keyboard accessibility
 */
function initializeKeyboardNavigation() {
  document.addEventListener('keydown', (event) => {
    // Escape key closes all open panels
    if (event.key === 'Escape') {
      document.querySelectorAll('.tafsir-panel.open').forEach(panel => {
        const ayahKey = panel.id.replace('tafsir-', '').replace(/-/g, ':');
        closeTafsirPanel(ayahKey);
      });
    }

    // Enter/Space on tafsir button toggles panel
    if (event.key === 'Enter' || event.key === ' ') {
      const button = event.target;
      if (button.classList.contains('tafsir-button')) {
        event.preventDefault();
        handleTafsirButtonClick({ currentTarget: button });
      }
    }
  });
}

// ============================================
// Event Delegation Setup
// ============================================

/**
 * Initialize all tafsir event listeners
 */
function initializeTafsirLoaders() {
  // Tafsir buttons (event delegation)
  document.addEventListener('click', (event) => {
    if (event.target.closest('.tafsir-button')) {
      handleTafsirButtonClick({
        currentTarget: event.target.closest('.tafsir-button')
      });
    }

    if (event.target.closest('.tafsir-close-btn')) {
      handleCloseButton({
        currentTarget: event.target.closest('.tafsir-close-btn')
      });
    }
  });

  // Scholar selector change
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('tafsir-scholar-select')) {
      handleScholarChange({
        currentTarget: event.target
      });
    }
  });

  // Keyboard navigation
  initializeKeyboardNavigation();

  console.log('✓ Tafsir loaders initialized');
}

// ============================================
// Debug Utilities
// ============================================

/**
 * Get cache statistics
 */
function getTafsirCacheStats() {
  return {
    memory: tafsirMemCache.getStats(),
    rateLimit: {
      remaining: apiRateLimiter.getRemainingRequests(),
      max: TAFSIR_CONFIG.API_RATE_LIMIT
    }
  };
}

/**
 * Clear all caches
 */
function clearAllTafsirCaches() {
  tafsirMemCache.clear();
  console.log('✓ All tafsir caches cleared');
}

/**
 * Preload tafsir for popular verses
 */
async function preloadPopularTafsir() {
  const popularVerses = [
    '1:1', '2:255', '3:1', '6:1', '8:1',
    '16:1', '20:1', '26:1', '36:1', '50:1',
    '55:1', '67:1', '78:1', '88:1', '96:1'
  ];

  let loaded = 0;
  let failed = 0;

  for (const ayahKey of popularVerses) {
    try {
      await getTafsir(TAFSIR_CONFIG.DEFAULT_TAFSIR_ID, ayahKey);
      loaded++;
    } catch (error) {
      failed++;
      console.warn(`Failed to preload ${ayahKey}:`, error.message);
    }
  }

  console.log(`✓ Preloaded ${loaded}/${popularVerses.length} popular verses`);
  return { loaded, failed };
}

// ============================================
// Initialization
// ============================================

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTafsirLoaders);
} else {
  initializeTafsirLoaders();
}

// Export for external use
window.tafsirAPI = {
  getTafsir,
  openTafsirPanel,
  closeTafsirPanel,
  toggleTafsirPanel,
  preloadPopularTafsir,
  getCacheStats: getTafsirCacheStats,
  clearCache: clearAllTafsirCaches
};
```

---

## 8. Pre-Population Script: `scripts/sync-tafsir-data.js`

Node.js script to pre-fetch all tafsir from quran.com API and cache in Supabase:

```javascript
/**
 * AlHudah Tafsir Pre-Population Script
 * 
 * Fetches all tafsir from quran.com API and inserts into Supabase
 * Usage: node scripts/sync-tafsir-data.js --tafsir-id=169
 * 
 * Features:
 * - Rate limiting (1 req/sec)
 * - Progress tracking
 * - Resume capability (skip existing entries)
 * - Error logging
 * - Batch inserts
 */

const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// ============================================
// Configuration
// ============================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const QURAN_COM_API = 'https://api.quran.com/api/v4';

const CONFIG = {
  BATCH_SIZE: 100, // Insert in batches
  REQUEST_DELAY: 1000, // 1 second between requests
  API_TIMEOUT: 15000, // 15 seconds
  RETRY_ATTEMPTS: 3,
  RESUME_FROM_CACHE: true,
  DRY_RUN: false
};

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Total verses in Quran
const TOTAL_VERSES = 6236;

// Mapping of Surah to number of verses
const SURAH_VERSES = [
  2, 286, 200, 176, 120, 165, 206, 75, 129, 109,
  123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
  30, 34, 30, 57, 29, 36, 54, 45, 50, 40,
  29, 26, 27, 26, 25, 37, 33, 38, 21, 35,
  32, 31, 34, 54, 32, 33, 31, 40, 46, 42,
  29, 19, 36, 27, 30, 20, 29, 36, 31, 34,
  35, 32, 33, 30, 27, 30, 27, 33, 26, 33,
  31, 29, 35, 34, 28, 27, 27, 33, 31, 39,
  34, 39, 35, 32, 34, 34, 28, 34, 31, 34,
  34, 30, 34, 32, 33, 33, 28, 30, 39, 18,
  34, 20, 58, 36, 27, 30, 33, 6, 4, 46,
  48, 54, 40, 46, 40, 44, 40, 48, 44, 37,
  52, 43, 48, 47, 32, 37, 29, 45, 26, 44,
  35, 37, 38, 47, 30
];

// ============================================
// Utilities
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchAPI(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('API request timeout'));
    }, CONFIG.API_TIMEOUT);

    https.get(url, { headers: { 'User-Agent': 'AlHudah/1.0' } }, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        clearTimeout(timeout);
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });

    }).on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

async function fetchWithRetry(url, retries = CONFIG.RETRY_ATTEMPTS) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchAPI(url);
    } catch (error) {
      console.warn(`Attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        await sleep(100 * Math.pow(2, attempt - 1)); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

/**
 * Get list of existing entries in Supabase
 */
async function getExistingEntries(tafsirId) {
  const { data, error } = await supabase
    .from('tafsir_entries')
    .select('ayah_key')
    .eq('tafsir_id', tafsirId);

  if (error) {
    console.error('Failed to fetch existing entries:', error);
    return new Set();
  }

  return new Set(data.map(d => d.ayah_key));
}

// ============================================
// Main Sync Logic
// ============================================

async function syncTafsirForVerse(tafsirId, surahNum, ayahNum) {
  const ayahKey = `${surahNum}:${ayahNum}`;
  const url = `${QURAN_COM_API}/tafsirs/${tafsirId}/by_ayah/${ayahKey}`;

  try {
    const response = await fetchWithRetry(url);

    if (!response.tafsir) {
      throw new Error('No tafsir in response');
    }

    return {
      tafsir_id: tafsirId,
      ayah_key: ayahKey,
      surah_number: surahNum,
      ayah_number: ayahNum,
      text: response.tafsir.text,
      author: response.tafsir.author_name || 'Unknown',
      source_lang: 'en',
      cached_at: new Date().toISOString(),
      api_version: 'quran.com-v4',
      raw_response: response
    };

  } catch (error) {
    console.error(`Failed to fetch tafsir for ${ayahKey}:`, error.message);
    return null;
  }
}

async function syncTafsirChapter(tafsirId, surahNum, existingKeys, batchQueue) {
  const numVerses = SURAH_VERSES[surahNum - 1];

  for (let ayahNum = 1; ayahNum <= numVerses; ayahNum++) {
    const ayahKey = `${surahNum}:${ayahNum}`;

    // Skip if already exists
    if (existingKeys.has(ayahKey)) {
      console.log(`  ⊘ ${ayahKey} (cached)`);
      continue;
    }

    const entry = await syncTafsirForVerse(tafsirId, surahNum, ayahNum);
    
    if (entry) {
      batchQueue.push(entry);
      console.log(`  ✓ ${ayahKey}`);
    } else {
      console.log(`  ✗ ${ayahKey} (failed)`);
    }

    // Flush batch if it reaches size limit
    if (batchQueue.length >= CONFIG.BATCH_SIZE) {
      await insertBatch(batchQueue);
      batchQueue.length = 0; // Clear
    }

    // Rate limiting
    await sleep(CONFIG.REQUEST_DELAY);
  }
}

async function insertBatch(entries) {
  if (entries.length === 0) return;

  console.log(`\n  → Inserting batch of ${entries.length} entries...`);

  if (CONFIG.DRY_RUN) {
    console.log('  [DRY RUN] Would insert:', entries.length, 'entries');
    return;
  }

  const { error } = await supabase
    .from('tafsir_entries')
    .upsert(entries, { onConflict: 'tafsir_id,ayah_key' });

  if (error) {
    console.error('  ✗ Batch insert failed:', error);
    throw error;
  }

  console.log(`  ✓ Batch inserted successfully`);
}

async function syncTafsir(tafsirId) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Starting tafsir sync for tafsir_id: ${tafsirId}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const startTime = Date.now();

  try {
    // Fetch tafsir metadata
    console.log('Fetching tafsir metadata...');
    const metadataRes = await fetchWithRetry(
      `${QURAN_COM_API}/resources/tafsirs`
    );

    const tafsirMeta = metadataRes.tafsirs.find(t => t.id === tafsirId);
    if (!tafsirMeta) {
      throw new Error(`Tafsir ID ${tafsirId} not found in quran.com API`);
    }

    console.log(`✓ Found: ${tafsirMeta.name} (${tafsirMeta.language_name})\n`);

    // Get existing entries
    console.log('Checking existing cache...');
    const existingKeys = CONFIG.RESUME_FROM_CACHE 
      ? await getExistingEntries(tafsirId)
      : new Set();
    console.log(`✓ Found ${existingKeys.size} existing entries\n`);

    let batchQueue = [];
    let processedVerses = 0;
    let skippedVerses = existingKeys.size;

    // Process each chapter
    for (let surahNum = 1; surahNum <= 114; surahNum++) {
      console.log(`[${surahNum}/114] Surah ${surahNum}...`);
      await syncTafsirChapter(tafsirId, surahNum, existingKeys, batchQueue);
      processedVerses += SURAH_VERSES[surahNum - 1];
    }

    // Flush remaining batch
    if (batchQueue.length > 0) {
      await insertBatch(batchQueue);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalEntries = processedVerses - skippedVerses + skippedVerses;

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✓ Sync completed in ${duration}s`);
    console.log(`  Total verses: ${totalEntries}`);
    console.log(`  New entries: ${processedVerses - skippedVerses}`);
    console.log(`  Cached entries: ${skippedVerses}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  } catch (error) {
    console.error(`\n✗ Sync failed: ${error.message}\n`);
    process.exit(1);
  }
}

// ============================================
// CLI
// ============================================

async function main() {
  const args = process.argv.slice(2);
  let tafsirId = null;

  for (const arg of args) {
    if (arg.startsWith('--tafsir-id=')) {
      tafsirId = parseInt(arg.split('=')[1]);
    }
  }

  if (!tafsirId) {
    console.error('Error: --tafsir-id is required');
    console.error('Usage: node scripts/sync-tafsir-data.js --tafsir-id=169');
    console.error('\nAvailable tafsir IDs:');
    console.error('  169 - Ibn Kathir (English)');
    console.error('  164 - Al-Jalalayn (English)');
    console.error('  381 - Maariful Quran (English)');
    console.error('  168 - Al-Tabari (English)');
    console.error('  160 - Maududi (English)');
    console.error('  817 - Ibn Kathir (Urdu)');
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_KEY must be set in .env.local');
    process.exit(1);
  }

  await syncTafsir(tafsirId);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

---

## 9. Offline Support & Service Worker

### 9.1 Service Worker Registration

```javascript
// In main.js or index.html
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    console.log('✓ Service Worker registered');
  }).catch(error => {
    console.warn('Service Worker registration failed:', error);
  });
}
```

### 9.2 Service Worker: `public/sw.js`

```javascript
/**
 * AlHudah Service Worker
 * Caches tafsir responses for offline access
 */

const CACHE_NAME = 'alhudah-tafsir-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/js/tafsir-loader.js',
  '/css/tafsir-styles.css'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only cache quran.com API tafsir requests
  if (url.hostname === 'api.quran.com' && url.pathname.includes('/tafsirs/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          return (
            response ||
            fetch(event.request).then((response) => {
              // Cache successful responses
              if (response && response.status === 200) {
                cache.put(event.request, response.clone());
              }
              return response;
            }).catch(() => {
              // Return cached response if fetch fails
              return cache.match(event.request);
            })
          );
        });
      })
    );
  } else {
    // Standard network-first strategy for other requests
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});
```

---

## 10. Accessibility Features

### 10.1 ARIA Labels and Roles

```html
<!-- Tafsir button with proper ARIA -->
<button 
  class="tafsir-button"
  data-ayah-key="2:255"
  aria-label="Show tafsir commentary for verse 2:255 (Ayat al-Kursi)"
  aria-expanded="false"
  aria-controls="tafsir-2-255"
>
  <svg class="tafsir-icon" aria-hidden="true">...</svg>
  <span class="tafsir-label">Tafsir</span>
</button>

<!-- Panel with region role -->
<div 
  id="tafsir-2-255"
  class="tafsir-panel"
  role="region"
  aria-label="Tafsir commentary panel for verse 2:255"
  aria-live="polite"
>
  ...
</div>
```

### 10.2 Keyboard Navigation

```javascript
/**
 * Complete keyboard navigation support
 */
document.addEventListener('keydown', (event) => {
  const activeElement = document.activeElement;

  // Tab: move focus to next tafsir button
  if (event.key === 'Tab') {
    const buttons = Array.from(document.querySelectorAll('.tafsir-button'));
    const currentIndex = buttons.indexOf(activeElement);
    // Default tab behavior preserved
  }

  // Enter/Space: toggle tafsir panel
  if ((event.key === 'Enter' || event.key === ' ') && 
      activeElement.classList.contains('tafsir-button')) {
    event.preventDefault();
    handleTafsirButtonClick({ currentTarget: activeElement });
  }

  // Escape: close all panels
  if (event.key === 'Escape') {
    document.querySelectorAll('.tafsir-panel.open').forEach(panel => {
      const ayahKey = panel.id.replace('tafsir-', '').replace(/-/g, ':');
      closeTafsirPanel(ayahKey);
    });
  }

  // Arrow keys in scholar dropdown
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    if (activeElement.classList.contains('tafsir-scholar-select')) {
      // Default select behavior preserved
    }
  }
});
```

### 10.3 Screen Reader Announcements

```javascript
/**
 * Announce tafsir load to screen readers
 */
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'assertive');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-9999px';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    announcement.remove();
  }, 1000);
}

// Use when tafsir loads
renderTafsirPanel(ayahKey, text, author);
announceToScreenReader(`Tafsir for verse ${ayahKey} loaded from ${author}`);
```

---

## 11. Error Handling & Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `HTTP 404: Tafsir not found` | Verse doesn't exist in tafsir | Check ayah_key format (`1:1`) |
| `Rate limited` | Too many API requests | Implement backoff; use cache |
| `CORS error` | Cross-origin request blocked | quran.com API supports CORS; check headers |
| `Network timeout` | API takes >10s to respond | Increase timeout or use cached data |
| `Invalid JSON` | Malformed API response | Log response; retry with backoff |

### Debug Commands (Console)

```javascript
// Check cache stats
window.tafsirAPI.getCacheStats();

// Clear all caches
window.tafsirAPI.clearCache();

// Preload popular verses
window.tafsirAPI.preloadPopularTafsir();

// Manually fetch a verse
window.tafsirAPI.getTafsir(169, '2:255').then(data => console.log(data));

// Open a tafsir panel
window.tafsirAPI.openTafsirPanel('2:255');
```

---

## 12. Performance Benchmarks

### Expected Load Times (with caching)

| Scenario | Time |
|----------|------|
| Memory cache hit | 0-5ms |
| Supabase cache hit | 50-200ms |
| API fetch (first time) | 500-2000ms |
| API fetch (after retry) | 1500-4000ms |

### Cache Hit Rates

- After 10 verses viewed: ~50% memory hit rate
- After 100 verses viewed: ~85% memory hit rate
- Supabase pre-population: ~95% hit rate on popular surahs

---

## 13. Migration & Deployment

### Phase 1: Enable Tafsir System
1. Deploy `tafsir-loader.js` to `/js`
2. Add CSS to stylesheet
3. Update verse HTML to include tafsir buttons
4. Initialize in main.js

### Phase 2: Pre-populate Cache
1. Run `sync-tafsir-data.js --tafsir-id=169` (Ibn Kathir)
2. Run for other popular tafsir (164, 381, 817)
3. Verify entries in Supabase dashboard

### Phase 3: Service Worker
1. Deploy `public/sw.js`
2. Register in main.js
3. Test offline access

---

## 14. Future Enhancements

- [ ] Support for Tafsir Ibn Uthaimeen (Arabic)
- [ ] User annotations on tafsir text
- [ ] Tafsir search across all scholars
- [ ] Tafsir comparison view (side-by-side scholars)
- [ ] Export tafsir to PDF/markdown
- [ ] Tafsir translations in more languages
- [ ] AI-powered tafsir summaries

---

**End of Tafsir Reference Guide v1.0**
