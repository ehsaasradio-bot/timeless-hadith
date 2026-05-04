/* Timeless Hadith — Progress API Client (browser JS)
   Plain JS version of src/lib/progress-api.ts for use in HTML pages.

   Two namespaces are exposed on window.ProgressAPI:

     1. Legacy worker-backed methods (unchanged):
          ProgressAPI.markHadithAsRead({...})
          ProgressAPI.getDashboardSummary()
          ProgressAPI.getLeaderboard()
          ProgressAPI.getCompanyLeaderboard()
        These still hit the Cloudflare Worker at /api/* and are kept
        as-is so existing callers (competition.html) do not break.

     2. Supabase-direct methods under ProgressAPI.db.*:
          ProgressAPI.db.markRead(hadithId, source)
          ProgressAPI.db.dashboardSummary()
          ProgressAPI.db.leaderboard({ limit })
          ProgressAPI.db.companyLeaderboard({ limit })
          ProgressAPI.db.collectionProgress()
          ProgressAPI.db.dailyActivity({ days })
          ProgressAPI.db.achievements()
          ProgressAPI.db.recentReads({ limit })
        These call the Supabase REST endpoint directly using the
        signed-in user's JWT. Backed by migration 001's tables, views,
        and the mark_hadith_as_read RPC.
*/
window.ProgressAPI = (function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     Shared session token reader (used by both legacy worker calls
     and new Supabase-direct calls).
  ──────────────────────────────────────────────────────────── */
  function _getToken() {
    try {
      var s = JSON.parse(localStorage.getItem('th_supabase_session') || 'null');
      return s && s.access_token ? s.access_token : null;
    } catch (e) { return null; }
  }

  /* ============================================================
     LEGACY WORKER-BACKED METHODS (unchanged)
     Kept for backwards compatibility with competition.html and any
     other caller already in production. Do not modify without
     coordinating with the Cloudflare Worker.
  ============================================================ */

  async function markHadithAsRead(args) {
    var token = _getToken();
    if (!token) throw new Error('Not signed in');
    args = args || {};

    var res = await fetch('/api/progress/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        hadith_id:       args.hadithId,
        collection_name: args.collectionName || null,
        book_name:       args.bookName       || null,
        chapter_name:    args.chapterName    || null,
        hadith_number:   args.hadithNumber   || null,
      }),
    });

    if (!res.ok) {
      var err = await res.json().catch(function () { return {}; });
      throw new Error(err.error || 'Failed to mark Hadith as read');
    }
    return res.json();
  }

  async function getDashboardSummary() {
    var token = _getToken();
    if (!token) throw new Error('Not signed in');

    var res = await fetch('/api/dashboard/summary', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!res.ok) {
      var err = await res.json().catch(function () { return {}; });
      throw new Error(err.error || 'Failed to load dashboard');
    }
    return res.json();
  }

  async function getLeaderboard() {
    var token = _getToken();
    if (!token) throw new Error('Not signed in');

    var res = await fetch('/api/competition/leaderboard', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!res.ok) {
      var err = await res.json().catch(function () { return {}; });
      throw new Error(err.error || 'Failed to load leaderboard');
    }
    return res.json();
  }

  async function getCompanyLeaderboard() {
    var token = _getToken();
    if (!token) throw new Error('Not signed in');

    var res = await fetch('/api/competition/company-leaderboard', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (!res.ok) {
      var err = await res.json().catch(function () { return {}; });
      throw new Error(err.error || 'Failed to load company leaderboard');
    }
    return res.json();
  }

  /* ============================================================
     SUPABASE-DIRECT METHODS (ProgressAPI.db.*)
     New surface introduced for reader.html, dashboard.html, and
     the competition.html extension. Backed by migration 001:
       - RPC: public.mark_hadith_as_read(p_hadith_id, p_source)
       - Views: user_leaderboard, company_leaderboard,
                user_collection_progress, user_daily_reading_activity
       - Tables: user_stats, hadith_progress, achievements,
                 user_achievements
     RLS scopes own-row reads to the signed-in user automatically.
  ============================================================ */

  /* Same project + anon key as supabase-auth.js / supabase-data.js.
     The anon key is required for PostgREST gateway routing; the JWT
     in Authorization is what RLS evaluates against auth.uid(). */
  var SB_URL  = 'https://dwcsledifvnyrunxejzd.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Y3NsZWRpZnZueXJ1bnhlanpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTgwNzgsImV4cCI6MjA5MDUzNDA3OH0.Aww8QcExJF1tPwMPvqP5q0_avc3YJclqsFJcXptlnZo';

  /* Build headers for an authenticated request. Returns null if the
     user is not signed in — callers should treat this as "not signed
     in" and prompt for login rather than calling. */
  function _authHeaders(extra) {
    var token = _getToken();
    if (!token) return null;
    var h = {
      'apikey':        SB_ANON,
      'Authorization': 'Bearer ' + token
    };
    if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) h[k] = extra[k];
    return h;
  }

  /* Common error-extraction so frontend gets a readable message. */
  async function _readError(res, fallback) {
    var body = await res.json().catch(function () { return null; });
    if (body && (body.message || body.error || body.hint)) {
      return new Error(body.message || body.error || body.hint);
    }
    return new Error(fallback + ' (HTTP ' + res.status + ')');
  }

  /* ── RPC: mark_hadith_as_read ────────────────────────────── */
  /* Returns the RPC's jsonb summary directly:
       { already_read, new_points, new_coins,
         total_hadiths, total_points, total_coins,
         streak_days, level, trophies, newly_unlocked: [...] }
     The RPC normalises p_source to one of:
       reader | category | dashboard | competition | import
     Anything else collapses to 'reader' server-side. */
  async function markRead(hadithId, source) {
    var headers = _authHeaders({ 'Content-Type': 'application/json' });
    if (!headers) throw new Error('Not signed in');

    var idNum = parseInt(hadithId, 10);
    if (!isFinite(idNum) || idNum <= 0) {
      throw new Error('Invalid hadith id: ' + hadithId);
    }

    var res = await fetch(SB_URL + '/rest/v1/rpc/mark_hadith_as_read', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        p_hadith_id: idNum,
        p_source:    source || 'reader'
      })
    });

    if (!res.ok) throw await _readError(res, 'Failed to mark hadith as read');
    return res.json();
  }

  /* ── View: user_leaderboard ──────────────────────────────── */
  async function leaderboard(opts) {
    opts = opts || {};
    var limit = Math.max(1, Math.min(parseInt(opts.limit, 10) || 100, 500));

    var headers = _authHeaders();
    if (!headers) throw new Error('Not signed in');

    var url = SB_URL + '/rest/v1/user_leaderboard'
            + '?select=*&order=rank.asc&limit=' + limit;

    var res = await fetch(url, { headers: headers });
    if (!res.ok) throw await _readError(res, 'Failed to load leaderboard');
    return res.json();
  }

  /* ── View: company_leaderboard ───────────────────────────── */
  async function companyLeaderboard(opts) {
    opts = opts || {};
    var limit = Math.max(1, Math.min(parseInt(opts.limit, 10) || 100, 500));

    var headers = _authHeaders();
    if (!headers) throw new Error('Not signed in');

    var url = SB_URL + '/rest/v1/company_leaderboard'
            + '?select=*&order=rank.asc&limit=' + limit;

    var res = await fetch(url, { headers: headers });
    if (!res.ok) throw await _readError(res, 'Failed to load company leaderboard');
    return res.json();
  }

  /* ── View: user_collection_progress (RLS scopes to caller) ── */
  async function collectionProgress() {
    var headers = _authHeaders();
    if (!headers) throw new Error('Not signed in');

    var url = SB_URL + '/rest/v1/user_collection_progress'
            + '?select=*&order=book_number.asc';

    var res = await fetch(url, { headers: headers });
    if (!res.ok) throw await _readError(res, 'Failed to load collection progress');
    return res.json();
  }

  /* ── View: user_daily_reading_activity (RLS scopes to caller) ──
     opts.days: number of trailing days to include (default 30, max 365). */
  async function dailyActivity(opts) {
    opts = opts || {};
    var days = Math.max(1, Math.min(parseInt(opts.days, 10) || 30, 365));

    var headers = _authHeaders();
    if (!headers) throw new Error('Not signed in');

    /* Compute YYYY-MM-DD threshold in UTC to match the view's date column. */
    var d = new Date();
    d.setUTCDate(d.getUTCDate() - (days - 1));
    var since = d.toISOString().slice(0, 10);

    var url = SB_URL + '/rest/v1/user_daily_reading_activity'
            + '?select=*&day=gte.' + since
            + '&order=day.asc';

    var res = await fetch(url, { headers: headers });
    if (!res.ok) throw await _readError(res, 'Failed to load daily activity');
    return res.json();
  }

  /* ── achievements catalogue + which the user has unlocked ──
     Returns the merged shape:
       [{ id, name, description, icon, threshold_type, threshold_value,
          points_reward, coins_reward, sort_order,
          unlocked: boolean, unlocked_at: timestamptz | null }, ...] */
  async function achievementsList() {
    var headers = _authHeaders();
    if (!headers) throw new Error('Not signed in');

    var allUrl  = SB_URL + '/rest/v1/achievements?select=*&order=sort_order.asc';
    var mineUrl = SB_URL + '/rest/v1/user_achievements?select=achievement_id,unlocked_at';

    var pair = await Promise.all([
      fetch(allUrl,  { headers: headers }),
      fetch(mineUrl, { headers: headers })
    ]);

    if (!pair[0].ok) throw await _readError(pair[0], 'Failed to load achievements');
    if (!pair[1].ok) throw await _readError(pair[1], 'Failed to load unlocked achievements');

    var all  = await pair[0].json();
    var mine = await pair[1].json();

    var unlockedMap = Object.create(null);
    mine.forEach(function (r) { unlockedMap[r.achievement_id] = r.unlocked_at; });

    return all.map(function (a) {
      var ua = unlockedMap[a.id];
      return Object.assign({}, a, {
        unlocked:    !!ua,
        unlocked_at: ua || null
      });
    });
  }

  /* ── Recent reads — last N hadiths the user marked, with full
        hadith content. Two requests: one to hadith_progress, one to
        hadiths to enrich. (No FK between them so PostgREST resource
        embedding is not available.) */
  async function recentReads(opts) {
    opts = opts || {};
    var limit = Math.max(1, Math.min(parseInt(opts.limit, 10) || 10, 100));

    var headers = _authHeaders();
    if (!headers) throw new Error('Not signed in');

    var progUrl = SB_URL + '/rest/v1/hadith_progress'
                + '?select=hadith_id,source,read_at'
                + '&order=read_at.desc'
                + '&limit=' + limit;

    var progRes = await fetch(progUrl, { headers: headers });
    if (!progRes.ok) throw await _readError(progRes, 'Failed to load recent reads');
    var prog = await progRes.json();
    if (!prog.length) return [];

    var ids = prog.map(function (p) { return p.hadith_id; }).join(',');
    var hadUrl = SB_URL + '/rest/v1/hadiths'
               + '?id=in.(' + ids + ')'
               + '&select=id,hadith_number,chapter_en,narrator,text_en,text_ar,book_name_en,in_book_ref,urdu';

    var hadRes = await fetch(hadUrl, { headers: headers });
    if (!hadRes.ok) throw await _readError(hadRes, 'Failed to load hadith details for recent reads');
    var hadiths = await hadRes.json();

    var byId = Object.create(null);
    hadiths.forEach(function (h) { byId[h.id] = h; });

    return prog.map(function (p) {
      return {
        hadith_id: p.hadith_id,
        source:    p.source,
        read_at:   p.read_at,
        hadith:    byId[p.hadith_id] || null
      };
    });
  }

  /* ── Composite dashboard summary — one call, multiple parallel
        reads. Dashboard pages should call this once on load. */
  async function dashboardSummary(opts) {
    opts = opts || {};
    var token = _getToken();
    if (!token) throw new Error('Not signed in');

    /* Fire all reads in parallel. Catch each so a single missing
       result doesn't fail the whole dashboard — return null for the
       failing slot and let the UI degrade gracefully. */
    var headers = _authHeaders();
    var statsUrl = SB_URL + '/rest/v1/user_stats?select=*&limit=1';

    function safe(p) { return p.then(function (v) { return v; }, function () { return null; }); }

    var results = await Promise.all([
      safe(fetch(statsUrl, { headers: headers }).then(function (r) {
        if (!r.ok) throw new Error('stats');
        return r.json().then(function (rows) { return rows[0] || null; });
      })),
      safe(recentReads({ limit: opts.recentLimit || 10 })),
      safe(collectionProgress()),
      safe(dailyActivity({ days: opts.activityDays || 30 })),
      safe(achievementsList())
    ]);

    return {
      stats:        results[0],
      recentReads:  results[1] || [],
      collections:  results[2] || [],
      dailyActivity:results[3] || [],
      achievements: results[4] || []
    };
  }

  /* ============================================================
     PUBLIC EXPORTS
  ============================================================ */
  return {
    /* Legacy worker-backed (unchanged signatures) */
    markHadithAsRead:     markHadithAsRead,
    getDashboardSummary:  getDashboardSummary,
    getLeaderboard:       getLeaderboard,
    getCompanyLeaderboard:getCompanyLeaderboard,

    /* Supabase-direct namespace */
    db: {
      markRead:            markRead,
      leaderboard:         leaderboard,
      companyLeaderboard:  companyLeaderboard,
      collectionProgress:  collectionProgress,
      dailyActivity:       dailyActivity,
      achievements:        achievementsList,
      recentReads:         recentReads,
      dashboardSummary:    dashboardSummary
    }
  };
})();
