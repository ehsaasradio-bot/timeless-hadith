'use client';

// components/shop/ShopHeader.tsx
// Sticky premium coin-shop header — light-blue glassmorphism

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import type { SortOption, FilterState } from '@/types/shop';
import { getCartCount } from '@/lib/cart';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular',    label: 'Most Popular'       },
  { value: 'newest',     label: 'Newest First'        },
  { value: 'price-asc',  label: 'Price: Low to High'  },
  { value: 'price-desc', label: 'Price: High to Low'  },
  { value: 'rating',     label: 'Highest Rated'       },
];

const CATEGORY_FILTERS = ['All', 'Silver', 'Gold', 'Copper', 'Bronze'];

interface ShopHeaderProps {
  onFilterChange?: (filters: FilterState) => void;
  /** Optional override; otherwise the header derives its own count from
   *  localStorage and `cart:updated` events dispatched by lib/cart.ts. */
  cartCount?: number;
  wishlistCount?: number;
}

export default function ShopHeader({ onFilterChange, cartCount: cartCountProp, wishlistCount = 0 }: ShopHeaderProps) {
  const [scrolled, setScrolled]           = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOpen, setSortOpen]           = useState(false);
  const [activeSort, setActiveSort]       = useState<SortOption>('popular');
  /** Derived cart count — kept in sync with localStorage + cross-tab updates. */
  const [liveCartCount, setLiveCartCount] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  // The prop overrides everything if explicitly provided (e.g., by a test or
  // a server-rendered initial value). Otherwise we trust the live store.
  const cartCount = cartCountProp ?? liveCartCount;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ─── Live cart count ────────────────────────────────────────────────────
  // Reads the initial count on mount, then re-reads whenever:
  //   - a `cart:updated` CustomEvent fires (same-tab — dispatched by lib/cart)
  //   - the browser fires a `storage` event (cross-tab sync)
  //   - the page becomes visible again (other tab may have added items)
  useEffect(() => {
    const sync = () => setLiveCartCount(getCartCount());

    // Seed from localStorage immediately to avoid a flash of 0.
    sync();

    const onCartUpdated = () => sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === 'th_coin_cart') sync();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') sync();
    };

    window.addEventListener('cart:updated', onCartUpdated);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('cart:updated', onCartUpdated);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    onFilterChange?.({
      category: cat === 'All' ? null : cat,
      priceMin: null,
      priceMax: null,
      sort: activeSort,
      search: searchQuery,
    });
  };

  const handleSortSelect = (sort: SortOption) => {
    setActiveSort(sort);
    setSortOpen(false);
    onFilterChange?.({
      category: activeCategory === 'All' ? null : activeCategory,
      priceMin: null,
      priceMax: null,
      sort,
      search: searchQuery,
    });
  };

  return (
    <m.header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-blue-100'
          : 'bg-[#F8FAFF]'
      }`}
      initial={false}
    >
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo / Back to site */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Back to Timeless Hadith"
          >
            {/* Coin icon */}
            <svg viewBox="0 0 28 28" width="28" height="28" fill="none" aria-hidden="true"
              className="text-blue-600 group-hover:opacity-80 transition-opacity">
              <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.8" opacity="0.25" />
              <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="1.4" />
              <text x="14" y="18.5" textAnchor="middle" fontSize="9" fontWeight="700"
                fill="currentColor" fontFamily="system-ui">₵</text>
            </svg>
            <span className="text-[15px] font-semibold text-[#1C1C1E] tracking-tight">
              Timeless Hadith
            </span>
          </Link>

          {/* Center: Shop label */}
          <span className="hidden sm:block text-[13px] font-medium text-blue-600 tracking-widest uppercase">
            Coin Shop
          </span>

          {/* Right: Search, Wishlist, Cart */}
          <div className="flex items-center gap-1">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="relative p-2.5 rounded-xl hover:bg-blue-50 transition-colors"
              aria-label="Open search"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="7.5" cy="7.5" r="5.5" stroke="#3A3A3C" strokeWidth="1.6" />
                <path d="M11.5 11.5L15 15" stroke="#3A3A3C" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            {/* Wishlist */}
            <Link
              href="/shop/wishlist"
              className="relative p-2.5 rounded-xl hover:bg-blue-50 transition-colors"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path
                  d="M9 14.5S2 10.5 2 5.5A3.5 3.5 0 0 1 9 4.05 3.5 3.5 0 0 1 16 5.5C16 10.5 9 14.5 9 14.5Z"
                  stroke="#3A3A3C"
                  strokeWidth="1.6"
                  fill={wishlistCount > 0 ? '#C9A84C' : 'none'}
                />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C9A84C] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/shop/cart"
              className="relative flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-xl hover:bg-blue-700 transition-colors ml-1"
              aria-label={`Cart (${cartCount} items)`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M1 1h2l2.5 7.5h6.5L14 4H4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="7" cy="13.5" r="1" fill="currentColor" />
                <circle cx="12" cy="13.5" r="1" fill="currentColor" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="w-4 h-4 bg-[#C9A84C] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Search panel */}
      <AnimatePresence>
        {searchOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-blue-100"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="relative">
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]"
                  aria-hidden="true"
                >
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search silver eagles, maple leafs, gold bullion..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-blue-100 rounded-xl text-[14px] text-[#1C1C1E] placeholder:text-[#999] focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  aria-label="Search coins"
                />
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Category filter strip + Sort */}
      <div className="border-t border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Category pills — scrollable on mobile.
                Use <ul>/<li> for valid list semantics; <button> keeps its
                implicit button role + aria-pressed for the toggle state. */}
            <ul
              className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide flex-1 list-none m-0 p-0"
              aria-label="Filter by metal"
            >
              {CATEGORY_FILTERS.map((cat) => (
                <li key={cat} className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  aria-pressed={activeCategory === cat}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-[#3A3A3C] hover:bg-blue-100'
                  }`}
                >
                  {cat}
                </button>
                </li>
              ))}
            </ul>

            {/* Sort dropdown — uses proper listbox/option semantics:
                <ul role="listbox"> contains <li role="option"> wrapping
                a <button>. role="option" must NOT live on a <button>. */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#3A3A3C] hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 4h10M4 7h6M6 10h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Sort
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                  stroke="currentColor"
                  className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <path d="M2 3l3 4 3-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <m.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    role="listbox"
                    aria-label="Sort coins"
                    className="absolute right-0 top-full mt-1 min-w-[180px] bg-white border border-blue-100 rounded-xl shadow-lg shadow-blue-600/10 overflow-hidden z-50 list-none m-0 p-1"
                  >
                    {SORT_OPTIONS.map((s) => (
                      <li key={s.value} role="option" aria-selected={activeSort === s.value}>
                        <button
                          type="button"
                          onClick={() => handleSortSelect(s.value)}
                          className={`w-full text-left px-3 py-2 text-[13px] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                            activeSort === s.value
                              ? 'bg-blue-50 text-blue-600 font-semibold'
                              : 'text-[#3A3A3C] hover:bg-blue-50'
                          }`}
                        >
                          {s.label}
                        </button>
                      </li>
                    ))}
                  </m.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
