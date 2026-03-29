// ═══════════════════════════════════════════════════════════════════════════════
//  js/firebase-auth.js  —  Firebase Authentication · Timeless Hadith
//  ES Module · Firebase SDK v10 (modular) via CDN · No build step required
//
//  HOW TO USE
//  ──────────
//  Add ONE line to every HTML page, just before </body>:
//    <script type="module" src="js/firebase-auth.js"></script>
//
//  (Replace the existing Google Identity Services line on each page:)
//    ❌  <script src="https://accounts.google.com/gsi/client" async defer></script>
//      <script type="module" src="js/firebase-auth.js"></script>
// ═══════════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────────────────
//  FIREBASE PROJECT SETUP  (one-time — do this before pasting your config)
// ───────────────────────────────────────────────────────────────────────────────
//
//  1. CREATE A PROJECT
//     → https://console.firebase.google.com/
//     → Click "Add project" · give it a name (e.g. "timeless-hadith") · Continue
//     → Disable Google Analytics if you don't need it · Create project
//
//  2. ENABLE GOOGLE SIGN-IN
//     → Left sidebar: Build → Authentication → Get started
//     → Sign-in method tab → Google → Enable
//     → Set a "Project support email" → Save
//
//  3. ADD AUTHORISED DOMAINS  (critical for GitHub Pages)
//     → Authentication → Settings → Authorised domains → Add domain
//     → Add both:
//         localhost
//         YOUR-USERNAME.github.io          ← your GitHub Pages domain
//         timelesshadith.com               ← your custom domain (if any)
//
//  4. REGISTER YOUR WEB APP & GET CONFIG
//     → Project Overview (home icon) → click "</>" (Web) icon → Register app
//     → Copy the firebaseConfig object shown → paste below (Step 1)
//     → No need to install Firebase CLI or set up Hosting
//
//  5. SECURITY RULES (for future Firestore use)
//     → Build → Firestore Database → Create database → Start in production mode
//     → Rules tab → replace with rules that let only signed-in users read/write
//       their own data (scaffolding provided at the bottom of this file)
// ───────────────────────────────────────────────────────────────────────────────


// ══════════════════════════════════════════════════════════════════════════════
//  STEP 1 — PASTE YOUR FIREBASE CONFIG HERE
//  Find it in: Firebase Console → Project Settings (⚙️) → Your apps → SDK setup
// ══════════════════════════════════════════════════════════════════════════════
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",                      // e.g. "AIzaSyC_abc123..."
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",   // e.g. "timeless-hadith.firebaseapp.com"
  projectId:         "YOUR_PROJECT_ID",                   // e.g. "timeless-hadith"
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",          // 12-digit number
  appId:             "YOUR_APP_ID"                        // "1:xxx:web:yyy"
  // measurementId: "G-XXXXXXXXXX"                        // Only if using Analytics
};
// ══════════════════════════════════════════════════════════════════════════════


// ── Firebase SDK — Modular v10 via CDN ────────────────────────────────────────
//    Pinned to 10.14.1 for stability. To upgrade, change the version number
//    in ALL four imports below (keep them in sync).
//    Latest release notes: https://firebase.google.com/support/release-notes/js
import { initializeApp }
  from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';


// ── Initialise Firebase ───────────────────────────────────────────────────────
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google provider — requests profile + email scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
// Forces the account picker every time (good for shared devices / multi-account)
googleProvider.setCustomParameters({ prompt: 'select_account' });


// ══════════════════════════════════════════════════════════════════════════════
//  getCurrentUser()
//  ─────────────────
//  Returns the currently signed-in Firebase User object, or null.
//  Reuse this anywhere in your codebase for bookmarks, Firestore, etc.
//
//  Properties available on the user object:
//    user.uid          — unique Firebase user ID (use as Firestore document key)
//    user.displayName  — full name from Google account
//    user.email        — email address
//    user.photoURL     — URL of Google profile photo
//    user.emailVerified
//
//  Usage from any other script (non-module):
//    const user = window.getCurrentUser();
//    if (user) { console.log(user.uid, user.email); }
// ══════════════════════════════════════════════════════════════════════════════
export function getCurrentUser() {
  return auth.currentUser;
}

// Expose globally so non-module scripts (app.js, bookmarks, etc.) can call it
window.getCurrentUser = getCurrentUser;


// ── DOM element references ────────────────────────────────────────────────────
//    These IDs match the existing HTML structure across all pages of the site
const btnLogin      = document.getElementById('btn-login');
const btnLogout     = document.getElementById('btn-logout');
const avatarWrap    = document.getElementById('nav-avatar-wrap');
const avatarImg     = document.getElementById('nav-avatar-img');
const avatarInitial = document.getElementById('nav-avatar-initial');


// ══════════════════════════════════════════════════════════════════════════════
//  INJECT STYLES  (spinner + toast — injected once, avoids a separate CSS file)
// ══════════════════════════════════════════════════════════════════════════════
(function injectAuthStyles() {
  if (document.getElementById('th-firebase-styles')) return; // guard: inject once
  const style = document.createElement('style');
  style.id = 'th-firebase-styles';
  style.textContent = `

    /* ── Spinner animation (used on loading state of the sign-in button) ── */
    @keyframes th-spin {
      to { transform: rotate(360deg); }
    }

    /* ── Toast notification (non-blocking error messages) ── */
    .th-auth-toast {
      position: fixed;
      bottom: 88px;               /* clears the cookie banner if still visible */
      left: 50%;
      transform: translateX(-50%);
      background: var(--ink, #1d1d1f);
      color: var(--bg, #fff);
      font-family: var(--font, -apple-system, "Helvetica Neue", sans-serif);
      font-size: 13px;
      font-weight: 500;
      letter-spacing: -0.1px;
      padding: 10px 22px;
      border-radius: 100px;
      z-index: 9999;
      white-space: nowrap;
      pointer-events: none;
      animation:
        th-toast-in  0.3s ease         both,
        th-toast-out 0.3s ease 3.2s    forwards;
    }
    [data-theme="dark"] .th-auth-toast {
      background: var(--surface, #f5f5f7);
      color: var(--ink, #1d1d1f);
    }
    @keyframes th-toast-in {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0);    }
    }
    @keyframes th-toast-out {
      from { opacity: 1; }
      to   { opacity: 0; }
    }

    /* ── Login button loading state ── */
    #btn-login[disabled] {
      opacity: 0.7;
      cursor: default;
    }
    #btn-login .th-spinner {
      display: inline-block;
      width: 13px; height: 13px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: th-spin 0.65s linear infinite;
      flex-shrink: 0;
    }

    /* ── Avatar: tooltip on hover ── */
    #nav-avatar-wrap[title]:hover::after {
      content: attr(title);
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--ink, #1d1d1f);
      color: var(--bg, #fff);
      font-size: 11px;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 8px;
      white-space: nowrap;
      pointer-events: none;
      z-index: 300;
    }
    #nav-avatar-wrap { position: relative; }

  `;
  document.head.appendChild(style);
})();


// ══════════════════════════════════════════════════════════════════════════════
//  LOADING STATE
//  Disables the sign-in button and shows a spinner while auth is in progress
// ══════════════════════════════════════════════════════════════════════════════
function setSignInLoading(isLoading) {
  if (!btnLogin) return;

  if (isLoading) {
    btnLogin.disabled = true;
    // Cache the original label so we can restore it after
    btnLogin.dataset.label = btnLogin.textContent.trim();
    btnLogin.innerHTML = `<span class="th-spinner" aria-hidden="true"></span> Signing in&hellip;`;
  } else {
    btnLogin.disabled = false;
    // Restore original label from cache, or fall back to "Sign in"
    btnLogin.textContent = btnLogin.dataset.label || 'Sign in';
    delete btnLogin.dataset.label;
  }
}


// ══════════════════════════════════════════════════════════════════════════════
//  TOAST HELPER  — brief, non-blocking error message (no modal, no disruption)
// ══════════════════════════════════════════════════════════════════════════════
function showToast(message) {
  // Remove any existing toast first
  const prev = document.querySelector('.th-auth-toast');
  if (prev) prev.remove();

  const toast = document.createElement('div');
  toast.className = 'th-auth-toast';
  toast.setAttribute('role', 'alert');          // announced by screen readers
  toast.setAttribute('aria-live', 'assertive');
  toast.textContent = message;
  document.body.appendChild(toast);

  // Auto-remove after animation completes (~3.5s)
  setTimeout(() => toast.remove(), 3600);
}


// ══════════════════════════════════════════════════════════════════════════════
//  UPDATE AUTH UI
//  Called by onAuthStateChanged on every page load and every auth state change.
//  Keeps the nav in sync with the current user session.
// ══════════════════════════════════════════════════════════════════════════════
function updateAuthUI(user) {
  // Guard: elements may not exist on every page (custom 404, etc.)
  if (!btnLogin) return;

  if (user) {
    // ── User is signed in ───────────────────────────────────────────────────
    btnLogin.style.display  = 'none';
    if (btnLogout)  btnLogout.style.display  = 'inline-flex';
    if (avatarWrap) avatarWrap.style.display = 'flex';

    // Profile photo (from Google account)
    if (user.photoURL && avatarImg) {
      avatarImg.src              = user.photoURL;
      avatarImg.alt              = `${user.displayName || 'User'}'s avatar`;
      avatarImg.style.display    = 'block';
      // Graceful fallback if image fails to load
      avatarImg.onerror = () => {
        avatarImg.style.display = 'none';
        if (avatarInitial) {
          avatarInitial.textContent   = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
          avatarInitial.style.display = 'block';
        }
      };
      if (avatarInitial) avatarInitial.style.display = 'none';
    } else if (avatarInitial) {
      // No photo URL — show first letter of name
      avatarInitial.textContent   = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
      avatarInitial.style.display = 'block';
      if (avatarImg) avatarImg.style.display = 'none';
    }

    // Tooltip on avatar shows name and email
    if (avatarWrap && user.displayName) {
      avatarWrap.setAttribute('title', `${user.displayName}\nClick to sign out`);
    }

    // ── Notify the rest of the app (app.js, bookmarks.js, etc.) ────────────
    //    The custom event carries the Firebase User object as event.detail.user
    document.dispatchEvent(new CustomEvent('th:login', {
      bubbles: true,
      detail:  { user }
    }));

  } else {
    // ── User is signed out ──────────────────────────────────────────────────
    btnLogin.style.display = 'inline-flex';
    if (btnLogout)  btnLogout.style.display  = 'none';
    if (avatarWrap) {
      avatarWrap.style.display = 'none';
      avatarWrap.removeAttribute('title');
    }

    // Clear avatar
    if (avatarImg)     { avatarImg.src = ''; avatarImg.style.display = 'none'; }
    if (avatarInitial) { avatarInitial.textContent = ''; avatarInitial.style.display = 'none'; }

    // ── Notify the rest of the app ──────────────────────────────────────────
    document.dispatchEvent(new CustomEvent('th:logout', { bubbles: true }));
  }
}


// ══════════════════════════════════════════════════════════════════════════════
//  SIGN IN WITH GOOGLE
//  Uses a popup window — works on all browsers without redirecting away from page
// ══════════════════════════════════════════════════════════════════════════════
async function signInWithGoogle() {
  setSignInLoading(true);

  try {
    const result = await signInWithPopup(auth, googleProvider);
    // result.user → Firebase User object
    // result.credential → OAuth credential (access token, etc.)
    // onAuthStateChanged fires automatically → updateAuthUI(user) is called
    // No extra work needed here — the listener handles everything

  } catch (error) {
    // Map Firebase error codes → user-friendly messages
    // Full list: https://firebase.google.com/docs/auth/admin/errors
    const friendlyMessages = {
      'auth/popup-closed-by-user':
        null,                        // User deliberately closed — no toast needed
      'auth/popup-blocked':
        'Popup was blocked. Please allow popups for this site, then try again.',
      'auth/network-request-failed':
        'Network error. Please check your connection and try again.',
      'auth/too-many-requests':
        'Too many attempts. Please wait a moment and try again.',
      'auth/user-disabled':
        'This account has been disabled. Please contact support.',
      'auth/account-exists-with-different-credential':
        'An account with this email already exists using a different sign-in method.',
      'auth/cancelled-popup-request':
        null,                        // Another popup was opened — ignore silently
      'auth/internal-error':
        'An internal error occurred. Please try again.',
    };

    const msg = friendlyMessages[error.code];
    if (msg) {
      showToast(msg);
    } else if (!Object.prototype.hasOwnProperty.call(friendlyMessages, error.code)) {
      // Unexpected error — log for debugging but don't show raw Firebase error to user
      console.warn('[TH Firebase Auth] Unexpected sign-in error:', error.code, error.message);
      showToast('Could not sign in. Please try again.');
    }

  } finally {
    // Always re-enable the button, even if sign-in was cancelled or failed
    setSignInLoading(false);
  }
}


// ══════════════════════════════════════════════════════════════════════════════
//  SIGN OUT
// ══════════════════════════════════════════════════════════════════════════════
async function signOutUser() {
  try {
    await signOut(auth);
    // onAuthStateChanged fires automatically → updateAuthUI(null) is called

  } catch (error) {
    console.warn('[TH Firebase Auth] Sign-out error:', error.message);
    showToast('Could not sign out. Please try again.');
  }
}


// ══════════════════════════════════════════════════════════════════════════════
//  WIRE EVENT LISTENERS
//  Runs on DOMContentLoaded. Overrides any onclick attributes from the HTML
//  (the legacy TH_AUTH.showLoginModal / TH_AUTH.logout calls become no-ops).
// ══════════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // Sign-in button
  if (btnLogin) {
    btnLogin.onclick = null;                                    // clear legacy onclick
    btnLogin.addEventListener('click', signInWithGoogle);
  }

  // Sign-out button
  if (btnLogout) {
    btnLogout.onclick = null;
    btnLogout.addEventListener('click', signOutUser);
  }

  // Avatar wrap — clicking it also signs out
  // (In a future iteration this could open a profile dropdown instead)
  if (avatarWrap) {
    avatarWrap.onclick = null;
    avatarWrap.addEventListener('click',   signOutUser);
    avatarWrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        signOutUser();
      }
    });
  }

});


// ══════════════════════════════════════════════════════════════════════════════
//  AUTH STATE LISTENER  ← the engine of the whole system
//
//  Fires immediately on every page load with the persisted session (if any),
//  and again whenever the user signs in or out.
//  Firebase persists sessions in IndexedDB — users stay signed in across
//  page refreshes and browser restarts automatically.
// ══════════════════════════════════════════════════════════════════════════════
onAuthStateChanged(auth, (user) => {
  updateAuthUI(user);
});


// ══════════════════════════════════════════════════════════════════════════════
//  EXPORTS  (for use in other ES modules, e.g. a future bookmarks.js module)
// ══════════════════════════════════════════════════════════════════════════════
export { auth, signInWithGoogle, signOutUser };


// ══════════════════════════════════════════════════════════════════════════════
//  FUTURE: FIRESTORE INTEGRATION SCAFFOLDING
//  ──────────────────────────────────────────
//  When you're ready to add cloud-synced bookmarks:
//
//  1. Enable Firestore in Firebase Console → Build → Firestore Database
//     → Create database → Start in production mode → Choose a region
//
//  2. Set security rules (Rules tab):
//
//     rules_version = '2';
//     service cloud.firestore {
//       match /databases/{database}/documents {
//         match /users/{userId}/bookmarks/{hadithId} {
//           allow read, write: if request.auth != null
//                              && request.auth.uid == userId;
//         }
//       }
//     }
//
//  3. Uncomment and add to this file:
//
//  import { getFirestore, doc, setDoc, deleteDoc, getDocs, collection }
//    from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
//
//  const db = getFirestore(app);
//
//  export async function addBookmark(hadithId) {
//    const user = getCurrentUser();
//    if (!user) return;
//    await setDoc(
//      doc(db, 'users', user.uid, 'bookmarks', hadithId),
//      { savedAt: new Date().toISOString() },
//      { merge: true }
//    );
//  }
//
//  export async function removeBookmark(hadithId) {
//    const user = getCurrentUser();
//    if (!user) return;
//    await deleteDoc(doc(db, 'users', user.uid, 'bookmarks', hadithId));
//  }
//
//  export async function getBookmarks() {
//    const user = getCurrentUser();
//    if (!user) return [];
//    const snapshot = await getDocs(
//      collection(db, 'users', user.uid, 'bookmarks')
//    );
//    return snapshot.docs.map(d => d.id);  // array of hadithIds
//  }
// ══════════════════════════════════════════════════════════════════════════════
