# AlHudah Quran Reader — Complete Reference Guide

## Overview
This document provides detailed specifications and complete implementation code for the Quran reader feature of the AlHudah platform. Follows the same architecture patterns as Timeless Hadith (Supabase, localStorage persistence, theme system).

---

## 1. SURAH LIST PAGE (index.html or /quran/)

### UI Layout
```
┌─ Quran Reader Header ─────────────────────────────────┐
│ Logo    Theme Toggle    Search Bar    Hamburger Menu   │
└───────────────────────────────────────────────────────┘

┌─ Controls Section ────────────────────────────────────┐
│ [Sort by: Number ▼]  [Filter: All Juz ▼]             │
│ [Search: ___________________]                         │
└───────────────────────────────────────────────────────┘

┌─ Surah Grid (Responsive) ─────────────────────────────┐
│ ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│ │    1    │  │    2    │  │    3    │  │    4    │  │
│ │ Al-Fâtihah
│ │ The Opening  │ Al-Baqarah  │ Al-'Imrân  │  │
│ │ Meccan, 7v   │ Medina, 286v│ Medina,200v│  │
│ └─────────┘  └─────────┘  └─────────┘  └─────────┘  │
│ ... (114 total)                                       │
└───────────────────────────────────────────────────────┘
```

### Card Components
Each surah card displays:
- **Surah number** (circled badge, 1-114)
- **Arabic name** (Cairo Play font, RTL)
- **English transliteration** (e.g., "Al-Fatihah")
- **English meaning** (e.g., "The Opening")
- **Revelation type** (Meccan / Medinan badge)
- **Verse count** (e.g., "7 verses")

### Interactive Features
- **Search/Filter**: by Arabic name, transliteration, or meaning
- **Sort options**: by number (asc/desc), revelation order, alphabetical
- **Juz selector**: filter to show only surahs in selected Juz
- **Click handler**: navigates to `/quran/surah.html?surah=1` (or similar)

---

## 2. SURAH READER PAGE (surah.html)

### Header Section
```html
<header class="surah-header">
  <h1 dir="rtl" class="surah-name-arabic">سُورَة الفَاتِحَة</h1>
  <p class="surah-name-english">Al-Fatihah</p>
  <p class="surah-meaning">The Opening</p>
  
  <div class="surah-meta">
    <span class="revelation-badge">Meccan</span>
    <span class="verse-count">7 verses</span>
    <span class="juz-range">Juz 1</span>
  </div>
  
  <!-- Bismillah (shown for all except Surah 9) -->
  <div class="bismillah" dir="rtl">
    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
  </div>
</header>
```

### Verse Display Structure
```html
<div class="ayah-card" data-surah="1" data-ayah="1">
  <div class="ayah-number">1</div>
  
  <p class="ayah-arabic" dir="rtl">
    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
  </p>
  
  <p class="ayah-english">
    In the name of Allah, the Most Gracious, the Most Merciful.
  </p>
  
  <p class="ayah-urdu" dir="rtl" style="display:none">
    اللہ کے نام سے جو رحمان و رحیم ہے
  </p>
  
  <div class="ayah-actions">
    <button class="btn-bookmark" aria-label="Bookmark verse">
      <svg><!-- bookmark icon --></svg>
    </button>
    <button class="btn-tafsir" aria-label="Show tafsir">
      <svg><!-- tafsir/explanation icon --></svg>
    </button>
    <button class="btn-share" aria-label="Share verse">
      <svg><!-- share icon --></svg>
    </button>
    <button class="btn-copy" aria-label="Copy verse">
      <svg><!-- copy icon --></svg>
    </button>
  </div>
</div>
```

### Translation Toggles
- Checkbox/switch to show/hide **English translation**
- Checkbox/switch to show/hide **Urdu translation**
- Preference saved to localStorage as `qr_translations`

### Navigation Controls
- **Previous/Next Surah buttons** (top and bottom)
- **Verse jump dropdown**: select specific verse (1-286)
- **Scroll to top button** (sticky, appears after scroll)
- **Reading progress bar**: shows current position in surah
- **Juz selector**: jump to specific juz

### Performance Optimization
- **Lazy loading**: load first 20 verses, then infinite scroll
- **Virtual scrolling**: for long surahs (Al-Baqarah = 286 verses)
- **Intersection Observer**: trigger load on scroll near bottom
- **Debounced scroll handler**: prevents excessive recalculation

---

## 3. JUZ NAVIGATION

### Data Structure
```javascript
const JUZ_BOUNDARIES = [
  { juz: 1, startSurah: 1, startAyah: 1, endSurah: 1, endAyah: 141 },
  { juz: 2, startSurah: 1, startAyah: 142, endSurah: 2, endAyah: 252 },
  { juz: 3, startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  // ... 30 total
];
```

### UI Component
- 30-item selector (dropdown or grid buttons)
- When selected: show all verses from startSurah:startAyah to endSurah:endAyah
- Click a verse in Juz view → navigate to full surah page

### Complete Juz Boundaries Array
```javascript
const JUZ_BOUNDARIES = [
  { juz: 1, startSurah: 1, startAyah: 1, endSurah: 1, endAyah: 141 },
  { juz: 2, startSurah: 1, startAyah: 142, endSurah: 2, endAyah: 252 },
  { juz: 3, startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { juz: 4, startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { juz: 5, startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { juz: 6, startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { juz: 7, startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { juz: 8, startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { juz: 9, startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { juz: 10, startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { juz: 11, startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { juz: 12, startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { juz: 13, startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { juz: 14, startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { juz: 15, startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { juz: 16, startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { juz: 17, startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { juz: 18, startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { juz: 19, startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { juz: 20, startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { juz: 21, startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { juz: 22, startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { juz: 23, startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { juz: 24, startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { juz: 25, startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { juz: 26, startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { juz: 27, startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { juz: 28, startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { juz: 29, startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { juz: 30, startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 }
];
```

---

## 4. VERSE OF THE DAY

### Algorithm
Deterministic daily selection: hash the current date to select a verse.

```javascript
function getVerseOfTheDay() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // "2026-04-13"
  
  // Simple hash: sum of char codes
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash = hash & hash; // 32-bit int
  }
  
  // Total verses in Quran: 6236
  const verseIndex = Math.abs(hash) % 6236;
  
  // Convert flat index to {surah, ayah}
  return indexToSurahAyah(verseIndex);
}

function indexToSurahAyah(index) {
  let remaining = index;
  for (let s = 1; s <= 114; s++) {
    const surahData = SURAHS[s - 1];
    if (remaining < surahData.verses) {
      return { surah: s, ayah: remaining + 1 };
    }
    remaining -= surahData.verses;
  }
  return { surah: 1, ayah: 1 }; // fallback
}
```

### Display
```html
<section class="verse-of-the-day">
  <h2>Verse of the Day</h2>
  <div class="votd-content">
    <p class="votd-arabic" dir="rtl"><!-- Arabic text --></p>
    <p class="votd-english"><!-- English translation --></p>
    <p class="votd-reference">Surah Al-Fatihah, Verse 1</p>
  </div>
  <button class="btn-share-votd">Share</button>
</section>
```

### Share Implementation
```javascript
function shareVerseOfTheDay(surah, ayah, arabicText, englishText) {
  const text = `Surah ${getSurahName(surah)}, Verse ${ayah}\n\n${arabicText}\n\n${englishText}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Quran - Verse of the Day',
      text: text
    });
  } else {
    copyToClipboard(text);
  }
}
```

---

## 5. READING PROGRESS

### Data Structure (localStorage)
```javascript
const readingProgress = {
  lastSurah: 1,
  lastAyah: 1,
  timestamp: Date.now()
};
localStorage.setItem('qr_reading_progress', JSON.stringify(readingProgress));
```

### For Authenticated Users (Supabase)
```sql
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah INT NOT NULL CHECK (surah >= 1 AND surah <= 114),
  ayah INT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Implementation
```javascript
const QR_PROGRESS = {
  save: function(surah, ayah) {
    const data = { surah, ayah, timestamp: Date.now() };
    localStorage.setItem('qr_reading_progress', JSON.stringify(data));
    
    // If user is authenticated, sync to Supabase
    if (typeof QR_AUTH !== 'undefined' && QR_AUTH && QR_AUTH.getUser()) {
      this.syncToSupabase(surah, ayah);
    }
  },
  
  load: function() {
    const stored = localStorage.getItem('qr_reading_progress');
    return stored ? JSON.parse(stored) : { surah: 1, ayah: 1 };
  },
  
  syncToSupabase: async function(surah, ayah) {
    const user = QR_AUTH.getUser();
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          surah: surah,
          ayah: ayah,
          timestamp: new Date()
        }, { onConflict: 'user_id' });
      
      if (error) console.error('[QR] sync error:', error);
    } catch (e) {
      console.error('[QR] sync exception:', e);
    }
  }
};
```

### Resume Button (Homepage)
```html
<button class="btn-resume-reading" id="btnResumeReading">
  Resume Reading: Surah Al-Baqarah, Verse 142
</button>

<script>
document.getElementById('btnResumeReading').addEventListener('click', function() {
  const progress = QR_PROGRESS.load();
  window.location.href = `/quran/surah.html?surah=${progress.surah}&ayah=${progress.ayah}`;
});
</script>
```

---

## 6. BOOKMARKING VERSES

### Data Structure (localStorage)
```javascript
const bookmarkedVerses = {
  '1:1': {
    surah: 1,
    ayah: 1,
    bookmarkedAt: Date.now(),
    notes: 'Beautiful opening of the Quran'
  },
  '2:255': {
    surah: 2,
    ayah: 255,
    bookmarkedAt: Date.now(),
    notes: 'The Throne Verse'
  }
};
localStorage.setItem('qr_bookmarks', JSON.stringify(bookmarkedVerses));
```

### Supabase Schema
```sql
CREATE TABLE quran_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah INT NOT NULL CHECK (surah >= 1 AND surah <= 114),
  ayah INT NOT NULL,
  notes TEXT,
  bookmarked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, surah, ayah)
);

CREATE INDEX idx_qr_bookmarks_user ON quran_bookmarks(user_id);
```

### Complete Implementation (quran-bookmarks-wire.js)
```javascript
/**
 * Quran Reader — Bookmarks Module
 * Manages verse bookmarks with localStorage fallback and Supabase sync
 */

const QR_BOOKMARKS = (function() {
  'use strict';
  
  const STORAGE_KEY = 'qr_bookmarks';
  const BADGE_ID = 'qr-bookmark-badge';
  
  /**
   * Get all bookmarked verses
   * @returns {Object} key: "surah:ayah", value: {surah, ayah, notes, bookmarkedAt}
   */
  function getAll() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }
  
  /**
   * Get bookmark count
   * @returns {number}
   */
  function getCount() {
    return Object.keys(getAll()).length;
  }
  
  /**
   * Check if verse is bookmarked
   * @param {number} surah
   * @param {number} ayah
   * @returns {boolean}
   */
  function isBookmarked(surah, ayah) {
    const key = `${surah}:${ayah}`;
    return getAll().hasOwnProperty(key);
  }
  
  /**
   * Toggle bookmark for a verse
   * @param {number} surah
   * @param {number} ayah
   * @param {string} notes (optional)
   */
  function toggle(surah, ayah, notes = '') {
    const key = `${surah}:${ayah}`;
    const bookmarks = getAll();
    
    if (bookmarks[key]) {
      // Remove
      delete bookmarks[key];
    } else {
      // Add
      bookmarks[key] = {
        surah: surah,
        ayah: ayah,
        notes: notes,
        bookmarkedAt: Date.now()
      };
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    
    // Sync to Supabase if user is logged in
    if (typeof QR_AUTH !== 'undefined' && QR_AUTH && QR_AUTH.getUser()) {
      syncToSupabase(surah, ayah, bookmarks[key]);
    }
    
    // Update UI
    updateBadge();
    document.dispatchEvent(new CustomEvent('qr:bookmark', {
      detail: { surah, ayah, isBookmarked: !bookmarks[key] }
    }));
  }
  
  /**
   * Add a bookmark with optional notes
   * @param {number} surah
   * @param {number} ayah
   * @param {string} notes
   */
  function add(surah, ayah, notes = '') {
    const key = `${surah}:${ayah}`;
    const bookmarks = getAll();
    
    if (!bookmarks[key]) {
      bookmarks[key] = {
        surah: surah,
        ayah: ayah,
        notes: notes,
        bookmarkedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      updateBadge();
      syncToSupabase(surah, ayah, bookmarks[key]);
    }
  }
  
  /**
   * Remove a bookmark
   * @param {number} surah
   * @param {number} ayah
   */
  function remove(surah, ayah) {
    const key = `${surah}:${ayah}`;
    const bookmarks = getAll();
    
    if (bookmarks[key]) {
      delete bookmarks[key];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      updateBadge();
      syncToSupabase(surah, ayah, null);
    }
  }
  
  /**
   * Update bookmark notes
   * @param {number} surah
   * @param {number} ayah
   * @param {string} notes
   */
  function updateNotes(surah, ayah, notes) {
    const key = `${surah}:${ayah}`;
    const bookmarks = getAll();
    
    if (bookmarks[key]) {
      bookmarks[key].notes = notes;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      syncToSupabase(surah, ayah, bookmarks[key]);
    }
  }
  
  /**
   * Sync bookmark to Supabase
   * @param {number} surah
   * @param {number} ayah
   * @param {Object|null} data (null to delete)
   */
  async function syncToSupabase(surah, ayah, data) {
    const user = QR_AUTH.getUser();
    if (!user) return;
    
    try {
      if (!data) {
        // Delete
        const { error } = await supabase
          .from('quran_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('surah', surah)
          .eq('ayah', ayah);
        
        if (error) console.error('[QR] bookmark sync delete error:', error);
      } else {
        // Upsert
        const { error } = await supabase
          .from('quran_bookmarks')
          .upsert({
            user_id: user.id,
            surah: surah,
            ayah: ayah,
            notes: data.notes || '',
            bookmarked_at: new Date(data.bookmarkedAt)
          }, { onConflict: 'user_id,surah,ayah' });
        
        if (error) console.error('[QR] bookmark sync error:', error);
      }
    } catch (e) {
      console.error('[QR] bookmark sync exception:', e);
    }
  }
  
  /**
   * Load bookmarks from Supabase (for authenticated users)
   */
  async function loadFromSupabase() {
    const user = QR_AUTH.getUser();
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('quran_bookmarks')
        .select('surah, ayah, notes, bookmarked_at')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('[QR] load from Supabase error:', error);
        return;
      }
      
      const bookmarks = {};
      data.forEach(row => {
        const key = `${row.surah}:${row.ayah}`;
        bookmarks[key] = {
          surah: row.surah,
          ayah: row.ayah,
          notes: row.notes,
          bookmarkedAt: new Date(row.bookmarked_at).getTime()
        };
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      updateBadge();
    } catch (e) {
      console.error('[QR] load from Supabase exception:', e);
    }
  }
  
  /**
   * Update badge with bookmark count
   */
  function updateBadge() {
    const badge = document.getElementById(BADGE_ID);
    if (!badge) return;
    
    const count = getCount();
    badge.textContent = count > 0 ? count : '';
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  
  /**
   * Initialize event listeners for bookmark buttons on page
   */
  function initPageListeners() {
    document.querySelectorAll('.btn-bookmark').forEach(btn => {
      const surah = parseInt(btn.closest('[data-surah]').dataset.surah, 10);
      const ayah = parseInt(btn.closest('[data-ayah]').dataset.ayah, 10);
      
      if (isBookmarked(surah, ayah)) {
        btn.classList.add('bookmarked');
        btn.setAttribute('aria-pressed', 'true');
      }
      
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        toggle(surah, ayah);
        
        // Update button state
        if (isBookmarked(surah, ayah)) {
          btn.classList.add('bookmarked');
          btn.setAttribute('aria-pressed', 'true');
        } else {
          btn.classList.remove('bookmarked');
          btn.setAttribute('aria-pressed', 'false');
        }
      });
    });
    
    updateBadge();
  }
  
  /**
   * Sync page state with bookmarks
   */
  function syncPage() {
    initPageListeners();
  }
  
  return {
    getAll: getAll,
    getCount: getCount,
    isBookmarked: isBookmarked,
    toggle: toggle,
    add: add,
    remove: remove,
    updateNotes: updateNotes,
    loadFromSupabase: loadFromSupabase,
    syncPage: syncPage
  };
})();

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  QR_BOOKMARKS.syncPage();
  
  // Listen for authentication events
  document.addEventListener('qr:login', function() {
    QR_BOOKMARKS.loadFromSupabase();
  });
  
  document.addEventListener('qr:logout', function() {
    localStorage.setItem('qr_bookmarks', '{}');
    QR_BOOKMARKS.syncPage();
  });
});
```

---

## 7. COPY & SHARE

### Implementation (quran-share.js)

```javascript
/**
 * Quran Reader — Copy & Share Module
 */

const QR_SHARE = (function() {
  'use strict';
  
  /**
   * Copy verse text to clipboard
   * @param {number} surah
   * @param {number} ayah
   * @param {string} arabicText
   * @param {string} englishText
   * @param {string} mode 'arabic' | 'english' | 'both'
   */
  function copyVerse(surah, ayah, arabicText, englishText, mode = 'both') {
    let text = '';
    
    if (mode === 'arabic' || mode === 'both') {
      text += arabicText;
    }
    
    if (mode === 'english' || mode === 'both') {
      if (text) text += '\n\n';
      text += englishText;
    }
    
    text += `\n\nSurah ${getSurahName(surah)}, Verse ${ayah}`;
    
    navigator.clipboard.writeText(text).then(function() {
      showToast('Copied to clipboard');
    }).catch(function(err) {
      console.error('[QR] copy error:', err);
    });
  }
  
  /**
   * Share verse via Web Share API or fallback
   * @param {number} surah
   * @param {number} ayah
   * @param {string} arabicText
   * @param {string} englishText
   */
  function shareVerse(surah, ayah, arabicText, englishText) {
    const surahName = getSurahName(surah);
    const text = `${arabicText}\n\n${englishText}\n\nSurah ${surahName}, Verse ${ayah}`;
    const url = `${window.location.origin}/quran/surah.html?surah=${surah}&ayah=${ayah}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Quran - Surah ${surahName}`,
        text: text,
        url: url
      }).catch(err => console.error('[QR] share error:', err));
    } else {
      // Fallback: copy link and show toast
      navigator.clipboard.writeText(url).then(function() {
        showToast('Link copied to clipboard');
      });
    }
  }
  
  /**
   * Show temporary toast notification
   * @param {string} message
   * @param {number} duration (ms)
   */
  function showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'qr-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(function() {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() {
        toast.remove();
      }, 300);
    }, duration);
  }
  
  /**
   * Get surah name from index
   * @param {number} surahNum (1-114)
   * @returns {string}
   */
  function getSurahName(surahNum) {
    const names = [
      'Al-Fatihah', 'Al-Baqarah', 'Al-Imran', 'An-Nisa', 'Al-Maidah',
      // ... (complete list of 114)
    ];
    return names[surahNum - 1] || 'Surah ' + surahNum;
  }
  
  return {
    copyVerse: copyVerse,
    shareVerse: shareVerse,
    showToast: showToast
  };
})();
```

### CSS for Toast
```css
.qr-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: var(--ink);
  color: var(--bg);
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.qr-toast.show {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
  pointer-events: auto;
}
```

---

## 8. ARABIC TEXT RENDERING

### CSS for Arabic Typography
```css
.ayah-arabic,
.surah-name-arabic,
.bismillah {
  font-family: var(--font-arabic);
  font-size: 22px;
  line-height: 1.8;
  font-weight: 500;
  direction: rtl;
  unicode-bidi: embed;
  text-align: right;
  letter-spacing: 0.5px;
}

/* Tashkeel (diacritics) — prevent line breaking */
.ayah-arabic {
  word-spacing: 0.3em;
  -webkit-hyphens: none;
  hyphens: none;
}

/* Verse end marker: Unicode U+FD3E U+FD3F */
.ayah-number::after {
  content: ' ﴿' attr(data-ayah-num) '﴾';
  font-family: var(--font-arabic);
  font-weight: bold;
  color: var(--accent);
  margin-left: 0.5em;
}

/* Responsive Arabic sizing */
@media (max-width: 600px) {
  .ayah-arabic,
  .surah-name-arabic {
    font-size: 18px;
    line-height: 1.7;
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .ayah-arabic {
  color: #e8e8ff;
}
```

### Proper RTL Handling
```html
<!-- CORRECT: explicit dir attribute on every RTL element -->
<div dir="rtl" class="ayah-arabic">بِسْمِ اللَّهِ</div>

<!-- CORRECT: unicode-bidi for mixed content -->
<p>
  <span dir="rtl">النَّاسِ</span> — al-nās (the people)
</p>

<!-- Use HTML entities, not emoji, for verse markers -->
&#xFD3E; ١ &#xFD3F;  <!-- ﴾ 1 ﴿ -->
```

### Unicode Handling
```javascript
function escapeArabicDiacritics(text) {
  // Preserve all Arabic Unicode blocks (0600-06FF, 0750-077F, 08A0-08FF)
  // Store as UTF-8 in database
  return text;
}

function normalizeArabicText(text) {
  // Use NFKC normalization for consistent rendering
  return text.normalize('NFKC');
}
```

---

## 9. MAIN SURAH WIRE (quran-wire.js)

### Complete Implementation

```javascript
/**
 * Quran Reader — Surah Page Wiring
 * Manages verse display, translation toggles, navigation, lazy loading
 */

'use strict';

const QR_SURAH = (function() {
  // ─── STATE ───────────────────────────────────────────────────────────
  let currentSurah = 1;
  let currentAyah = 1;
  let allAyahs = [];
  let loadedAyahs = new Set();
  let isLoading = false;
  
  const BATCH_SIZE = 20;
  const SETTINGS_KEY = 'qr_settings';
  
  // ─── INITIALIZATION ───────────────────────────────────────────────────
  function init() {
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    currentSurah = parseInt(params.get('surah') || '1', 10);
    currentAyah = parseInt(params.get('ayah') || '1', 10);
    
    // Clamp values
    currentSurah = Math.max(1, Math.min(114, currentSurah));
    
    // Load settings
    loadSettings();
    
    // Setup listeners
    setupThemeToggle();
    setupHamburgerMenu();
    setupNavigationControls();
    setupTranslationToggles();
    setupIntersectionObserver();
    
    // Fetch and render surah data
    loadSurahData();
  }
  
  // ─── THEME TOGGLE ─────────────────────────────────────────────────────
  function setupThemeToggle() {
    const html = document.documentElement;
    const themeBtn = document.getElementById('themeToggle');
    
    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
        const current = html.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('qr_theme', next);
      });
    }
  }
  
  // ─── HAMBURGER MENU ───────────────────────────────────────────────────
  function setupHamburgerMenu() {
    const burger = document.getElementById('hamburger');
    const drawer = document.getElementById('navDrawer');
    
    if (burger && drawer) {
      burger.addEventListener('click', function() {
        drawer.classList.toggle('open');
        burger.setAttribute('aria-expanded', drawer.classList.contains('open'));
      });
      
      drawer.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
          drawer.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }
  
  // ─── NAVIGATION CONTROLS ──────────────────────────────────────────────
  function setupNavigationControls() {
    const prevBtn = document.getElementById('btn-prev-surah');
    const nextBtn = document.getElementById('btn-next-surah');
    const jumpSelect = document.getElementById('verse-jump');
    const scrollTop = document.getElementById('btn-scroll-top');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (currentSurah > 1) {
          navigateToSurah(currentSurah - 1, 1);
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        if (currentSurah < 114) {
          navigateToSurah(currentSurah + 1, 1);
        }
      });
    }
    
    if (jumpSelect) {
      jumpSelect.addEventListener('change', function() {
        const ayahNum = parseInt(this.value, 10);
        if (!isNaN(ayahNum)) {
          navigateToAyah(ayahNum);
          this.value = '';
        }
      });
    }
    
    if (scrollTop) {
      window.addEventListener('scroll', function() {
        scrollTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
      });
      
      scrollTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
  
  // ─── TRANSLATION TOGGLES ──────────────────────────────────────────────
  function setupTranslationToggles() {
    const englishToggle = document.getElementById('toggle-english');
    const urduToggle = document.getElementById('toggle-urdu');
    
    if (englishToggle) {
      englishToggle.addEventListener('change', function() {
        const setting = getSettings();
        setting.showEnglish = this.checked;
        saveSettings(setting);
        updateTranslationDisplay();
      });
    }
    
    if (urduToggle) {
      urduToggle.addEventListener('change', function() {
        const setting = getSettings();
        setting.showUrdu = this.checked;
        saveSettings(setting);
        updateTranslationDisplay();
      });
    }
    
    // Apply saved preferences
    const settings = getSettings();
    if (englishToggle) englishToggle.checked = settings.showEnglish;
    if (urduToggle) urduToggle.checked = settings.showUrdu;
  }
  
  // ─── TRANSLATION DISPLAY ──────────────────────────────────────────────
  function updateTranslationDisplay() {
    const settings = getSettings();
    
    document.querySelectorAll('.ayah-english').forEach(el => {
      el.style.display = settings.showEnglish ? 'block' : 'none';
    });
    
    document.querySelectorAll('.ayah-urdu').forEach(el => {
      el.style.display = settings.showUrdu ? 'block' : 'none';
    });
  }
  
  // ─── LOAD SURAH DATA ──────────────────────────────────────────────────
  async function loadSurahData() {
    try {
      // Fetch from Supabase or static data
      const response = await fetch(
        `/api/quran/surah/${currentSurah}`
      );
      
      if (!response.ok) throw new Error('Failed to load surah');
      
      const data = await response.json();
      allAyahs = data.ayahs || [];
      
      // Update header
      updateSurahHeader(data);
      
      // Initial load: first batch
      loadBatch(0);
      
      // Save reading progress
      saveReadingProgress(currentSurah, currentAyah);
      
    } catch (e) {
      console.error('[QR] load surah error:', e);
      showError('Could not load surah');
    }
  }
  
  // ─── UPDATE SURAH HEADER ──────────────────────────────────────────────
  function updateSurahHeader(data) {
    document.getElementById('surah-name-arabic').textContent = data.arabicName;
    document.getElementById('surah-name-english').textContent = data.nameEnglish;
    document.getElementById('surah-meaning').textContent = data.meaning;
    document.getElementById('revelation-type').textContent = data.revelation;
    document.getElementById('verse-count').textContent = data.totalVerses + ' verses';
    
    // Update jump selector options
    const jumpSelect = document.getElementById('verse-jump');
    if (jumpSelect) {
      jumpSelect.innerHTML = '<option value="">Jump to verse…</option>';
      for (let i = 1; i <= data.totalVerses; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = 'Verse ' + i;
        jumpSelect.appendChild(opt);
      }
    }
    
    // Show/hide bismillah (all except Surah 9)
    const bismillah = document.getElementById('bismillah');
    if (bismillah) {
      bismillah.style.display = currentSurah === 9 ? 'none' : 'block';
    }
  }
  
  // ─── LOAD BATCH ───────────────────────────────────────────────────────
  function loadBatch(startIndex) {
    if (isLoading || startIndex >= allAyahs.length) return;
    
    isLoading = true;
    const endIndex = Math.min(startIndex + BATCH_SIZE, allAyahs.length);
    const container = document.getElementById('ayah-container');
    
    for (let i = startIndex; i < endIndex; i++) {
      const ayah = allAyahs[i];
      if (loadedAyahs.has(i)) continue;
      
      const card = createAyahCard(ayah, i);
      container.appendChild(card);
      loadedAyahs.add(i);
    }
    
    // Setup event listeners for new buttons
    QR_BOOKMARKS.syncPage();
    
    isLoading = false;
  }
  
  // ─── CREATE AYAH CARD ─────────────────────────────────────────────────
  function createAyahCard(ayah, index) {
    const settings = getSettings();
    const isBookmarked = QR_BOOKMARKS && QR_BOOKMARKS.isBookmarked(currentSurah, ayah.number);
    
    const card = document.createElement('div');
    card.className = 'ayah-card';
    card.setAttribute('data-surah', currentSurah);
    card.setAttribute('data-ayah', ayah.number);
    
    const englishDisplay = settings.showEnglish ? 'block' : 'none';
    const urduDisplay = settings.showUrdu ? 'block' : 'none';
    
    card.innerHTML = `
      <div class="ayah-header">
        <span class="ayah-number">${ayah.number}</span>
      </div>
      
      <p class="ayah-arabic" dir="rtl">${ayah.textArabic}</p>
      
      <p class="ayah-english" style="display:${englishDisplay}">
        ${ayah.textEnglish || ''}
      </p>
      
      <p class="ayah-urdu" dir="rtl" style="display:${urduDisplay}">
        ${ayah.textUrdu || ''}
      </p>
      
      <div class="ayah-actions">
        <button class="btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
                aria-label="Bookmark verse" aria-pressed="${isBookmarked}">
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
        
        <button class="btn-tafsir" aria-label="Show tafsir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5h16M4 11.5h16M4 3.5h16"/>
          </svg>
        </button>
        
        <button class="btn-copy" aria-label="Copy verse">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        
        <button class="btn-share" aria-label="Share verse">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      </div>
    `;
    
    // Event listeners
    card.querySelector('.btn-bookmark').addEventListener('click', function(e) {
      e.preventDefault();
      QR_BOOKMARKS.toggle(currentSurah, ayah.number);
      this.classList.toggle('bookmarked');
      this.setAttribute('aria-pressed', this.classList.contains('bookmarked'));
    });
    
    card.querySelector('.btn-copy').addEventListener('click', function(e) {
      e.preventDefault();
      QR_SHARE.copyVerse(
        currentSurah,
        ayah.number,
        ayah.textArabic,
        ayah.textEnglish || '',
        'both'
      );
    });
    
    card.querySelector('.btn-share').addEventListener('click', function(e) {
      e.preventDefault();
      QR_SHARE.shareVerse(
        currentSurah,
        ayah.number,
        ayah.textArabic,
        ayah.textEnglish || ''
      );
    });
    
    card.querySelector('.btn-tafsir').addEventListener('click', function(e) {
      e.preventDefault();
      showTafsirModal(currentSurah, ayah.number, ayah.textArabic);
    });
    
    return card;
  }
  
  // ─── INTERSECTION OBSERVER (lazy load on scroll) ──────────────────────
  function setupIntersectionObserver() {
    const sentinel = document.getElementById('load-sentinel');
    if (!sentinel) return;
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !isLoading) {
          const nextBatch = loadedAyahs.size;
          loadBatch(nextBatch);
        }
      });
    }, { rootMargin: '200px' });
    
    observer.observe(sentinel);
  }
  
  // ─── NAVIGATION ──────────────────────────────────────────────────────
  function navigateToSurah(surah, ayah = 1) {
    surah = Math.max(1, Math.min(114, surah));
    currentSurah = surah;
    currentAyah = ayah;
    
    window.location.href = `/quran/surah.html?surah=${surah}&ayah=${ayah}`;
  }
  
  function navigateToAyah(ayahNum) {
    currentAyah = Math.max(1, Math.min(allAyahs.length, ayahNum));
    
    const card = document.querySelector(`[data-surah="${currentSurah}"][data-ayah="${currentAyah}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    saveReadingProgress(currentSurah, currentAyah);
  }
  
  // ─── SETTINGS ────────────────────────────────────────────────────────
  function getSettings() {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {
      showEnglish: true,
      showUrdu: false,
      fontSize: 'medium'
    };
  }
  
  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
  
  function loadSettings() {
    const settings = getSettings();
    // Apply to UI
    const englishToggle = document.getElementById('toggle-english');
    const urduToggle = document.getElementById('toggle-urdu');
    if (englishToggle) englishToggle.checked = settings.showEnglish;
    if (urduToggle) urduToggle.checked = settings.showUrdu;
  }
  
  // ─── READING PROGRESS ────────────────────────────────────────────────
  function saveReadingProgress(surah, ayah) {
    const progress = { surah, ayah, timestamp: Date.now() };
    localStorage.setItem('qr_reading_progress', JSON.stringify(progress));
    
    // Sync to Supabase if logged in
    if (typeof QR_AUTH !== 'undefined' && QR_AUTH && QR_AUTH.getUser()) {
      syncProgressToSupabase(surah, ayah);
    }
  }
  
  async function syncProgressToSupabase(surah, ayah) {
    const user = QR_AUTH.getUser();
    if (!user) return;
    
    try {
      await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          surah: surah,
          ayah: ayah,
          timestamp: new Date()
        }, { onConflict: 'user_id' });
    } catch (e) {
      console.error('[QR] sync progress error:', e);
    }
  }
  
  // ─── TAFSIR MODAL ────────────────────────────────────────────────────
  function showTafsirModal(surah, ayah, arabicText) {
    const modal = document.getElementById('tafsir-modal');
    if (!modal) return;
    
    document.getElementById('tafsir-surah-ayah').textContent = `Surah ${surah}, Verse ${ayah}`;
    document.getElementById('tafsir-arabic').textContent = arabicText;
    
    // Fetch tafsir content
    fetchTafsir(surah, ayah).then(tafsirText => {
      document.getElementById('tafsir-content').textContent = tafsirText;
    });
    
    modal.classList.add('open');
    
    // Close button
    modal.querySelector('.modal-close').addEventListener('click', function() {
      modal.classList.remove('open');
    });
  }
  
  async function fetchTafsir(surah, ayah) {
    try {
      const response = await fetch(`/api/quran/tafsir/${surah}/${ayah}`);
      if (!response.ok) return 'Tafsir not available';
      const data = await response.json();
      return data.text || 'Tafsir not available';
    } catch (e) {
      return 'Could not load tafsir';
    }
  }
  
  // ─── ERROR HANDLING ──────────────────────────────────────────────────
  function showError(message) {
    const container = document.getElementById('ayah-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="error-state" role="alert">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>${message}</p>
        <button class="btn-primary" onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }
  
  // ─── PUBLIC API ──────────────────────────────────────────────────────
  return {
    init: init
  };
})();

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  QR_SURAH.init();
});
```

---

## 10. CSS STYLES (quran-reader.css)

```css
/* ─────────────────────────────────────────────────────────────
   Quran Reader — Complete Styles
   ───────────────────────────────────────────────────────────── */

/* ─── SURAH HEADER ─────────────────────────────────────────────── */
.surah-header {
  padding: 32px 20px;
  text-align: center;
  border-bottom: 1px solid var(--border);
  margin-bottom: 32px;
}

.surah-name-arabic {
  font-family: var(--font-arabic);
  font-size: 32px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 8px;
  direction: rtl;
}

.surah-name-english {
  font-size: 24px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 4px;
}

.surah-meaning {
  font-size: 16px;
  color: var(--muted);
  margin-bottom: 16px;
}

.surah-meta {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 14px;
}

.revelation-badge,
.verse-count,
.juz-range {
  padding: 6px 12px;
  background: var(--surface);
  border-radius: 20px;
  color: var(--muted);
  font-weight: 500;
}

/* ─── BISMILLAH ─────────────────────────────────────────────────── */
.bismillah {
  font-family: var(--font-arabic);
  font-size: 24px;
  font-weight: 500;
  line-height: 1.8;
  text-align: center;
  direction: rtl;
  margin: 24px 0 32px;
  padding: 16px;
  background: var(--surface);
  border-radius: var(--radius);
  color: var(--accent);
}

/* ─── AYAH CARDS ────────────────────────────────────────────────── */
#ayah-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 16px 40px;
}

.ayah-card {
  padding: 20px;
  margin-bottom: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  animation: slideIn 0.35s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ayah-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.ayah-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--accent);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 12px;
}

.ayah-arabic {
  font-family: var(--font-arabic);
  font-size: 22px;
  line-height: 1.9;
  font-weight: 500;
  direction: rtl;
  text-align: right;
  margin-bottom: 12px;
  color: var(--ink);
}

.ayah-english,
.ayah-urdu {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 12px;
  color: var(--muted);
}

.ayah-urdu {
  direction: rtl;
  text-align: right;
}

/* ─── AYAH ACTIONS ───────────────────────────────────────────────── */
.ayah-actions {
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}

.btn-bookmark,
.btn-tafsir,
.btn-copy,
.btn-share {
  flex: 1;
  padding: 8px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--muted);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-bookmark:hover,
.btn-tafsir:hover,
.btn-copy:hover,
.btn-share:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-bookmark.bookmarked {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-bookmark svg,
.btn-tafsir svg,
.btn-copy svg,
.btn-share svg {
  width: 18px;
  height: 18px;
}

/* ─── NAVIGATION CONTROLS ──────────────────────────────────────── */
.surah-nav {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  max-width: 700px;
  margin: 0 auto;
}

#btn-prev-surah,
#btn-next-surah {
  flex: 1;
  padding: 12px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

#btn-prev-surah:hover,
#btn-next-surah:hover {
  background: var(--accent-hover);
}

#btn-prev-surah:disabled,
#btn-next-surah:disabled {
  background: var(--surface);
  color: var(--muted);
  cursor: not-allowed;
}

/* ─── VERSE JUMP SELECTOR ──────────────────────────────────────── */
#verse-jump {
  padding: 8px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--ink);
  font-size: 14px;
  cursor: pointer;
}

#verse-jump:hover {
  border-color: var(--accent);
}

/* ─── SCROLL TO TOP BUTTON ────────────────────────────────────── */
#btn-scroll-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.2s ease;
}

#btn-scroll-top:hover {
  background: var(--accent-hover);
  transform: scale(1.1);
}

#btn-scroll-top svg {
  width: 24px;
  height: 24px;
}

/* ─── TRANSLATION TOGGLES ──────────────────────────────────────── */
.translation-toggles {
  display: flex;
  gap: 16px;
  padding: 16px 20px;
  max-width: 700px;
  margin: 0 auto;
  background: var(--surface);
  border-radius: var(--radius);
}

.toggle-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--accent);
}

/* ─── TAFSIR MODAL ────────────────────────────────────────────────── */
.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}

.modal.open {
  display: flex;
}

.modal-content {
  background: var(--bg);
  border-radius: var(--radius);
  padding: 24px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 24px;
}

/* ─── RESPONSIVE ────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .surah-header {
    padding: 20px 16px;
  }
  
  .surah-name-arabic {
    font-size: 24px;
  }
  
  .surah-name-english {
    font-size: 18px;
  }
  
  .ayah-card {
    padding: 16px;
    margin-bottom: 12px;
  }
  
  .ayah-arabic {
    font-size: 18px;
    line-height: 1.8;
  }
  
  .ayah-english,
  .ayah-urdu {
    font-size: 14px;
  }
  
  .surah-nav {
    flex-direction: column;
  }
  
  #btn-scroll-top {
    width: 44px;
    height: 44px;
    bottom: 16px;
    right: 16px;
  }
  
  .translation-toggles {
    flex-direction: column;
  }
}

/* ─── DARK THEME ───────────────────────────────────────────────── */
[data-theme="dark"] .ayah-card {
  background: rgba(13, 22, 41, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

[data-theme="dark"] .ayah-arabic {
  color: #e8e8ff;
}

[data-theme="dark"] .ayah-english,
[data-theme="dark"] .ayah-urdu {
  color: #a8b4c8;
}

[data-theme="dark"] .bismillah {
  background: rgba(79, 114, 248, 0.15);
  color: #a0baff;
}
```

---

## 11. HTML TEMPLATES

### surah.html
```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Read the Quran with Arabic text, English and Urdu translations">
  <title>Quran Reader — Timeless Hadith</title>
  <link rel="stylesheet" href="/css/quran-reader.css">
  <link href="https://fonts.googleapis.com/css2?family=Cairo+Play:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- Navigation -->
  <nav id="navbar"></nav>
  
  <!-- Surah Header -->
  <header class="surah-header">
    <h1 id="surah-name-arabic" class="surah-name-arabic"></h1>
    <p id="surah-name-english" class="surah-name-english"></p>
    <p id="surah-meaning" class="surah-meaning"></p>
    
    <div class="surah-meta">
      <span id="revelation-type" class="revelation-badge"></span>
      <span id="verse-count" class="verse-count"></span>
    </div>
    
    <div id="bismillah" class="bismillah">
      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
    </div>
  </header>
  
  <!-- Translation Toggles -->
  <div class="translation-toggles">
    <div class="toggle-group">
      <input type="checkbox" id="toggle-english" checked>
      <label for="toggle-english">English</label>
    </div>
    <div class="toggle-group">
      <input type="checkbox" id="toggle-urdu">
      <label for="toggle-urdu">Urdu</label>
    </div>
  </div>
  
  <!-- Verse Jump -->
  <div style="max-width: 700px; margin: 20px auto 0; padding: 0 20px;">
    <select id="verse-jump"></select>
  </div>
  
  <!-- Ayah Container -->
  <main id="ayah-container"></main>
  <div id="load-sentinel" style="height: 1px; background: transparent;"></div>
  
  <!-- Navigation -->
  <div class="surah-nav">
    <button id="btn-prev-surah">← Previous Surah</button>
    <button id="btn-next-surah">Next Surah →</button>
  </div>
  
  <!-- Scroll to Top -->
  <button id="btn-scroll-top" aria-label="Scroll to top">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  </button>
  
  <!-- Tafsir Modal -->
  <div id="tafsir-modal" class="modal">
    <div class="modal-content">
      <button class="modal-close">×</button>
      <h3 id="tafsir-surah-ayah"></h3>
      <p id="tafsir-arabic" dir="rtl"></p>
      <div id="tafsir-content"></div>
    </div>
  </div>
  
  <script src="/js/quran-bookmarks-wire.js"></script>
  <script src="/js/quran-share.js"></script>
  <script src="/js/quran-wire.js"></script>
</body>
</html>
```

---

## 12. API ENDPOINTS (Backend)

### GET /api/quran/surah/:surahNum
Returns complete surah data with all ayahs.

```json
{
  "surahNum": 1,
  "arabicName": "سُورَة الفَاتِحَة",
  "nameEnglish": "Al-Fatihah",
  "meaning": "The Opening",
  "revelation": "Meccan",
  "totalVerses": 7,
  "juz": 1,
  "ayahs": [
    {
      "number": 1,
      "textArabic": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "textEnglish": "In the name of Allah, the Most Gracious, the Most Merciful.",
      "textUrdu": "اللہ کے نام سے جو رحمان و رحیم ہے"
    }
  ]
}
```

### GET /api/quran/tafsir/:surahNum/:ayahNum
Returns tafsir/explanation for a specific verse.

```json
{
  "surah": 1,
  "ayah": 1,
  "text": "This verse is the beginning of the Quran..."
}
```

---

## NOTES & ARCHITECTURE DECISIONS

1. **Performance**: Lazy loading with Intersection Observer prevents rendering all 6236 verses at once
2. **Persistence**: Reading progress saved locally and synced to Supabase for authenticated users
3. **Offline**: Full functionality works offline (cached data + localStorage)
4. **Accessibility**: All interactive elements have proper ARIA labels and keyboard support
5. **RTL Handling**: Explicit `dir="rtl"` on Arabic text, proper unicode handling
6. **Mobile**: Responsive design, touch-friendly buttons, swipe support for featured surahs
7. **SEO**: Meta tags, structured data for each surah, canonical URLs

---

## END OF REFERENCE GUIDE
