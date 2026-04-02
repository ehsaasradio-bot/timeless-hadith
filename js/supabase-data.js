/* ─────────────────────────────────────────────────────────────
   Timeless Hadith — Supabase Data Layer
   Replaces static data.js — connects to 7,277 hadiths in Supabase
   Same TH API surface: categories, getCat, getHadiths, findHadith
   Plus async helpers: TH.init(), TH.loadHadiths(slug)
───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Supabase credentials (anon / public read-only) ── */
  var _SB   = 'https://dwcsledifvnyrunxejzd.supabase.co';
  var _ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Y3NsZWRpZnZueXJ1bnhlanpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTgwNzgsImV4cCI6MjA5MDUzNDA3OH0.Aww8QcExJF1tPwMPvqP5q0_avc3YJclqsFJcXptlnZo';
  var _HDR  = { 'apikey': _ANON, 'Authorization': 'Bearer ' + _ANON };

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
       Safe to call multiple times — returns the same promise.
    ──────────────────────────────────────────────────────── */
    init: function () {
      if (this._initPromise) return this._initPromise;

      var self = this;
      this._initPromise = _api(
        'hadiths?select=book_number,book_name_en,book_name_ar&order=book_number.asc&limit=10000'
      ).then(function (rows) {

        /* Aggregate rows → one entry per book */
        var bmap = {};
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

        self.categories = Object.values(bmap)
          .sort(function (a, b) { return a.num - b.num; })
          .map(function (b) {
            return {
              slug:  'book-' + b.num,
              title: b.en,
              desc:  b.ar || b.en,
              count: b.count
            };
          });

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
       Returns a promise with `count` curated or random hadiths
       for the homepage featured section.
    ──────────────────────────────────────────────────────── */
    getFeatured: function (count) {
      /* Curated well-known hadith IDs from Sahih al-Bukhari */
      var seeds = [1, 8, 13, 10, 54, 2, 4, 50, 6, 25];
      var ids = seeds.slice(0, count).join(',');
      return _api(
        'hadiths?id=in.(' + ids + ')' +
        '&select=id,hadith_number,chapter_en,narrator,text_en,text_ar,book_name_en,in_book_ref'
      ).then(function (rows) {
        return rows.map(function (h) {
          return {
            arabic:   h.text_ar || '',
            text:     '\u201c' + (h.text_en || '') + '\u201d',
            meta:     h.narrator ? 'Narrated by ' + h.narrator + ' \u2014 ' : '',
            source:   (h.book_name_en || 'Sahih al-Bukhari') + ' ' + (h.hadith_number || ''),
            category: h.chapter_en || ''
          };
        });
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
