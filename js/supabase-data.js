/* ─────────────────────────────────────────────────────────────
   Timeless Hadith — Supabase Data Layer
   Replaces static data.js — connects to 7,277 hadiths in Supabase
   Same TH API surface: categories, getCat, getHadiths, findHadith
   Plus async helpers: TH.init(), TH.loadHadiths(slug), TH.getFeatured()
───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Category enrichment metadata ──────────────────────────
     Keyed by book number. When you have the full JSON file,
     add all 97 entries here. Fields override Supabase defaults.
  ──────────────────────────────────────────────────────────── */
  var CATEGORY_META = {
    97: {
      slug: "tawheed",
      title: "Oneness, Uniqueness of Allah (Tawheed)",
      arabicTitle: "\u0643\u062a\u0627\u0628 \u0627\u0644\u062a\u0648\u062d\u064a\u062f",
      seoTitle: "Tawheed \u2013 Sahih al-Bukhari",
      metaDescription: "Learn authentic hadith on the oneness of Allah, divine uniqueness, and core Islamic belief in tawheed.",
      h1: "Oneness, Uniqueness of Allah (Tawheed)",
      shortDescription: "Allah\u2019s oneness, uniqueness, and core belief are explained clearly.",
      contentBlock: "This section focuses on tawheed, affirming the oneness and uniqueness of Allah as the foundation of Islamic belief.",
      keywords: ["tawheed", "oneness of Allah", "Islamic creed", "sahih bukhari tawheed"]
    }
  };

  /* ── Supabase credentials (anon / public read-only) ── */
  var _SB   = 'https://dwcsledifvnyrunxejzd.supabase.co';
  var _ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Y3NsZWRpZnZueXJ1bnhlanpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTgwNzgsImV4cCI6MjA5MDUzNDA3OH0.Aww8QcExJF1tPwMPvqP5q0_avc3YJclqsFJcXptlnZo';
  var _HDR  = { 'apikey': _ANON, 'Authorization': 'Bearer ' + _ANON };

  /* Supabase PostgREST caps rows at 1000 by default.
     We work around this by firing all pages in parallel. */
  var PAGE_SIZE   = 1000;
  var TOTAL_ROWS  = 8000; /* slightly above 7,277 — adjust if DB grows */

  /* ── Low-level fetch ── */
  function _api(path) {
    return fetch(_SB + '/rest/v1/' + path, { headers: _HDR }).then(function (r) {
      if (!r.ok) throw new Error('Supabase ' + r.status + ': ' + path);
      return r.json();
    });
  }

  /* ── Map a Supabase row → TH hadith object ── */
  function _mapHadith(h) {
    return {
      id:           String(h.id),
      arabic:       h.text_ar       || '',
      english:      h.text_en       || '',
      narrator:     h.narrator      || '',
      source:       h.book_name_en  || 'Sahih al-Bukhari',
      number:       h.hadith_number || h.in_book_ref || '',
      authenticity: 'Sahih',
      subcategory:  h.chapter_en    || ''
    };
  }

  /* ── Public TH namespace ── */
  window.TH = {

    /* Populated after init() resolves */
    categories: [],
    hadiths:    {},
    narrators:  [],

    _initPromise: null,

    /* ────────────────────────────────────────────────────────
       TH.init()
       Loads all 97 books from Supabase and builds TH.categories.
       Fires all pages in parallel to bypass the 1,000-row cap.
       Safe to call multiple times — returns the same promise.
    ──────────────────────────────────────────────────────── */
    init: function () {
      if (this._initPromise) return this._initPromise;

      var self = this;

      /* Build array of offsets: 0, 1000, 2000 … up to TOTAL_ROWS */
      var offsets = [];
      for (var off = 0; off < TOTAL_ROWS; off += PAGE_SIZE) {
        offsets.push(off);
      }

      /* Fire all pages in parallel — each fetches 3 small columns only */
      this._initPromise = Promise.all(
        offsets.map(function (offset) {
          return _api(
            'hadiths?select=book_number,book_name_en,book_name_ar' +
            '&order=book_number.asc' +
            '&limit=' + PAGE_SIZE +
            '&offset=' + offset
          ).catch(function () { return []; }); /* one failing page doesn't break the rest */
        })
      ).then(function (pages) {

        /* Merge all pages into a book map */
        var bmap = {};
        pages.forEach(function (rows) {
          rows.forEach(function (h) {
            var n = h.book_number;
            if (!bmap[n]) {
              bmap[n] = {
                num:   n,
                en:    h.book_name_en || ('Book ' + n),
                ar:    h.book_name_ar || '',
                count: 0
              };
            }
            bmap[n].count++;
          });
        });

        self.categories = Object.values(bmap)
          .sort(function (a, b) { return a.num - b.num; })
          .map(function (b) {
            var m = CATEGORY_META[b.num] || {};
            return {
              bookNumber:      b.num,
              slug:            m.slug || ('book-' + b.num),
              title:           m.title || b.en,
              arabicTitle:     m.arabicTitle || b.ar || '',
              desc:            m.shortDescription || b.ar || b.en,
              count:           b.count,
              seoTitle:        m.seoTitle || '',
              metaDescription: m.metaDescription || '',
              h1:              m.h1 || m.title || b.en,
              contentBlock:    m.contentBlock || '',
              keywords:        m.keywords || []
            };
          });

        if (self.categories.length === 0) {
          console.warn('[TH] init: no categories built — check Supabase column names and table permissions.');
        }

      }).catch(function (err) {
        console.error('[TH] init failed:', err);
      });

      return this._initPromise;
    },

    /* ────────────────────────────────────────────────────────
       TH.loadHadiths(slug)
       Fetches all hadiths for one book and caches in TH.hadiths.
       Returns a promise that resolves with the hadiths array.
    ──────────────────────────────────────────────────────── */
    loadHadiths: function (slug) {
      var self = this;
      if (self.hadiths[slug] && self.hadiths[slug].length > 0) {
        return Promise.resolve(self.hadiths[slug]);
      }

      var bookNum = parseInt(slug.replace('book-', ''), 10);
      if (isNaN(bookNum)) {
        self.hadiths[slug] = [];
        return Promise.resolve([]);
      }

      return _api(
        'hadiths?book_number=eq.' + bookNum +
        '&order=id.asc&limit=1000' +
        '&select=id,hadith_number,chapter_en,narrator,text_en,text_ar,book_name_en,in_book_ref'
      ).then(function (rows) {
        self.hadiths[slug] = rows.map(_mapHadith);
        return self.hadiths[slug];
      }).catch(function (err) {
        console.error('[TH] loadHadiths failed for', slug, err);
        self.hadiths[slug] = [];
        return [];
      });
    },

    /* ────────────────────────────────────────────────────────
       TH.getFeatured(count)
       Fetches curated well-known hadiths for the homepage.
       Returns a promise with fully-populated hadith objects.
       Only returns results with actual text content — never
       overwrites the static fallback with empty Supabase rows.
    ──────────────────────────────────────────────────────── */
    getFeatured: function (count) {
      /* Curated well-known hadith IDs from Sahih al-Bukhari */
      var seeds = [1, 8, 13, 10, 54, 2, 4, 50, 6, 25];
      var ids = seeds.slice(0, count).join(',');
      return _api(
        'hadiths?id=in.(' + ids + ')' +
        '&select=id,hadith_number,chapter_en,narrator,text_en,text_ar,book_name_en,in_book_ref'
      ).then(function (rows) {
        var mapped = rows.map(function (h) {
          return {
            arabic:   h.text_ar  || '',
            text:     h.text_en  ? ('\u201c' + h.text_en + '\u201d') : '',
            meta:     h.narrator ? ('Narrated by ' + h.narrator + ' \u2014 ') : '',
            source:   (h.book_name_en || 'Sahih al-Bukhari') + (h.hadith_number ? ' ' + h.hadith_number : ''),
            category: h.chapter_en || ''
          };
        });
        /* Only return rows that actually have English text.
           If none pass the check, return [] so the static fallback is kept. */
        var valid = mapped.filter(function (h) { return h.text && h.text.length > 4; });
        return valid.length > 0 ? valid : [];
      }).catch(function () { return []; });
    },

    /* ────────────────────────────────────────────────────────
       TH.search(query, limit)
       Full-text search across all hadiths using Supabase ilike.
    ──────────────────────────────────────────────────────── */
    search: function (query, limit) {
      limit = limit || 20;
      var q = encodeURIComponent(query);
      return _api(
        'hadiths?or=(text_en.ilike.*' + q + '*,narrator.ilike.*' + q + '*)' +
        '&select=id,hadith_number,chapter_en,narrator,text_en,text_ar,book_name_en,in_book_ref' +
        '&order=id.asc&limit=' + limit
      ).then(function (rows) {
        return rows.map(_mapHadith);
      }).catch(function () { return []; });
    },

    /* ────────────────────────────────────────────────────────
       Synchronous helpers (require init/loadHadiths to have run)
    ──────────────────────────────────────────────────────── */
    getCat: function (slug) {
      return this.categories.find(function (c) { return c.slug === slug; });
    },

    getHadiths: function (slug) {
      return this.hadiths[slug] || [];
    },

    findHadith: function (id) {
      var self = this;
      var slugs = Object.keys(self.hadiths);
      for (var i = 0; i < slugs.length; i++) {
        var h = self.hadiths[slugs[i]].find(function (h) { return h.id === id; });
        if (h) return { hadith: h, slug: slugs[i], cat: self.getCat(slugs[i]) };
      }
      return null;
    }

  };

})();
