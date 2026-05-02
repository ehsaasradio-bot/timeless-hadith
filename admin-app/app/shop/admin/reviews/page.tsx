'use client';
// app/shop/admin/reviews/page.tsx — Review moderation

import { useEffect, useState, useCallback } from 'react';

interface AdminReview {
  id: string;
  author_name: string;
  author_email: string;
  author_location: string | null;
  rating: number;
  title: string;
  body: string;
  is_approved: boolean;
  is_verified: boolean;
  created_at: string;
  shop_products: { title: string; slug: string } | null;
}

const STARS = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const url = `/api/admin/reviews${filter !== 'all' ? `?filter=${filter}` : ''}`;
    const res = await fetch(url);
    if (res.ok) setReviews(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const approve = async (id: string, approved: boolean) => {
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_approved: approved }),
    });
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
    setDeleteConfirm(null);
    fetchReviews();
  };

  const pending = reviews.filter(r => !r.is_approved).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[1.6rem] font-bold text-[#1C1C1E] tracking-tight">Reviews</h1>
          <p className="text-[13px] text-[#888] mt-1">
            {reviews.length} reviews
            {pending > 0 && <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-[11px] font-bold rounded-full">{pending} pending</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[12px] font-semibold capitalize transition-colors ${filter === f ? 'bg-[#0D4A3C] text-white' : 'bg-white border border-[#E8DDD0] text-[#3A3A3C] hover:bg-[#FAF7F2]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-[#0D4A3C] border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className={`bg-white rounded-2xl border p-5 ${review.is_approved ? 'border-[#E8DDD0]' : 'border-orange-200 bg-orange-50/30'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-amber-500 text-[14px] tracking-tight">{STARS(review.rating)}</span>
                    <span className="font-semibold text-[13px] text-[#1C1C1E]">{review.title}</span>
                    {!review.is_approved && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">Pending</span>
                    )}
                    {review.is_verified && (
                      <span className="px-2 py-0.5 bg-[#0D4A3C]/10 text-[#0D4A3C] text-[10px] font-bold rounded-full">Verified</span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#3A3A3C] leading-relaxed mb-3">{review.body}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#888] flex-wrap">
                    <span className="font-medium text-[#555]">{review.author_name}</span>
                    {review.author_location && <span>· {review.author_location}</span>}
                    <span>· {formatDate(review.created_at)}</span>
                    {review.shop_products && (
                      <span>· <span className="text-[#0D4A3C]">{review.shop_products.title}</span></span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {review.is_approved ? (
                    <button onClick={() => approve(review.id, false)}
                      className="px-3 py-1.5 border border-[#E8DDD0] text-[12px] text-[#888] rounded-lg hover:bg-[#FAF7F2] whitespace-nowrap">
                      Unapprove
                    </button>
                  ) : (
                    <button onClick={() => approve(review.id, true)}
                      className="px-3 py-1.5 bg-[#0D4A3C] text-white text-[12px] font-semibold rounded-lg hover:bg-[#1A6B54] whitespace-nowrap">
                      Approve
                    </button>
                  )}
                  {deleteConfirm === review.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => deleteReview(review.id)} className="px-2 py-1 bg-red-600 text-white text-[11px] rounded-lg">Yes</button>
                      <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 border text-[11px] rounded-lg">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(review.id)}
                      className="px-3 py-1.5 border border-red-200 text-[12px] text-red-500 rounded-lg hover:bg-red-50 whitespace-nowrap">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-12 text-center text-[13px] text-[#888]">
              No reviews found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
