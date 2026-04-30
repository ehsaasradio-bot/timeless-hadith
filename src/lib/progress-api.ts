/* Timeless Hadith — Frontend Progress API Client
   TypeScript client for all progress/dashboard/competition API calls.
   Import in React components or convert to progress-api.js for plain HTML pages.
*/

export interface MarkReadParams {
  accessToken:    string;
  hadithId:       string;
  collectionName?: string;
  bookName?:       string;
  chapterName?:    string;
  hadithNumber?:   string;
}

export interface MarkReadResult {
  success:          boolean;
  alreadyRead:      boolean;
  pointsEarned?:    number;
  coinsEarned?:     number;
  totalHadithRead?: number;
  totalPoints?:     number;
  virtualCoins?:    number;
  trophiesCount?:   number;
  currentLevel?:    number;
  message?:         string;
}

export async function markHadithAsRead(params: MarkReadParams): Promise<MarkReadResult> {
  const res = await fetch("/api/progress/mark-read", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      Authorization:   `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify({
      hadith_id:       params.hadithId,
      collection_name: params.collectionName,
      book_name:       params.bookName,
      chapter_name:    params.chapterName,
      hadith_number:   params.hadithNumber,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error((err as any)?.error ?? "Failed to mark Hadith as read");
  }

  return res.json();
}

export async function getDashboardSummary(accessToken: string) {
  const res = await fetch("/api/dashboard/summary", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error((err as any)?.error ?? "Failed to load dashboard");
  }

  return res.json();
}

export async function getLeaderboard(accessToken: string) {
  const res = await fetch("/api/competition/leaderboard", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error((err as any)?.error ?? "Failed to load leaderboard");
  }

  return res.json();
}

export async function getCompanyLeaderboard(accessToken: string) {
  const res = await fetch("/api/competition/company-leaderboard", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error((err as any)?.error ?? "Failed to load company leaderboard");
  }

  return res.json();
}
