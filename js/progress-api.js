/* Timeless Hadith — Progress API Client (browser JS)
   Plain JS version of src/lib/progress-api.ts for use in HTML pages.
*/
window.ProgressAPI = (function () {
  'use strict';

  function _getToken() {
    try {
      var s = JSON.parse(localStorage.getItem('th_supabase_session') || 'null');
      return s && s.access_token ? s.access_token : null;
    } catch (e) { return null; }
  }

  async function markHadithAsRead({ hadithId, collectionName, bookName, chapterName, hadithNumber }) {
    var token = _getToken();
    if (!token) throw new Error('Not signed in');

    var res = await fetch('/api/progress/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        hadith_id:       hadithId,
        collection_name: collectionName || null,
        book_name:       bookName       || null,
        chapter_name:    chapterName    || null,
        hadith_number:   hadithNumber   || null,
      }),
    });

    if (!res.ok) {
      var err = await res.json().catch(() => ({}));
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
      var err = await res.json().catch(() => ({}));
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
      var err = await res.json().catch(() => ({}));
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
      var err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to load company leaderboard');
    }
    return res.json();
  }

  return { markHadithAsRead, getDashboardSummary, getLeaderboard, getCompanyLeaderboard };
})();
