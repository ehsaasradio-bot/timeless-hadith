/**
 * Hadith Recommendation Engine — foundation.
 *
 * Pure scoring logic over user signals. Returns mock results today, but the
 * shape of `getRecommendations` is the same shape we'll use once we wire in:
 *   - Supabase reading_progress / bookmarks / notes
 *   - OpenAI embeddings (vector similarity)
 *
 * Scoring (all additive, capped at 100):
 *   - Same topic as user reads / bookmarks: +30
 *   - Unfinished collection user is reading: +25
 *   - Bookmarked topic: +20
 *   - Short daily reading slot (<= 30 min): +10
 *   - New narrator (not in recentNarrators): +10
 */

import {
  sampleRecommendations,
  type RecommendedHadith,
} from "@/src/lib/dashboard/mock-data";

export type ProgressSignal = {
  collection: string;
  topic: string;
  pct: number;
};

export type BookmarkSignal = { topic: string };
export type NoteSignal = { topic: string };

export type RecommendationInputs = {
  userId: string;
  progress?: ProgressSignal[];
  bookmarks?: BookmarkSignal[];
  notes?: NoteSignal[];
  preferredTopics?: string[];
  recentNarrators?: string[];
  /** Average daily minutes spent reading. Used to bias short-form picks. */
  dailyMinutes?: number;
  /** Limit number of returned recommendations. */
  limit?: number;
};

/**
 * Score a candidate hadith against a user's signals.
 * Pure & deterministic — safe to run in RSCs.
 */
export function scoreCandidate(
  candidate: RecommendedHadith,
  inputs: RecommendationInputs,
): number {
  let score = 0;

  const topicsInPlay = new Set<string>(
    [
      ...(inputs.preferredTopics ?? []),
      ...(inputs.progress?.map((p) => p.topic) ?? []),
      ...(inputs.bookmarks?.map((b) => b.topic) ?? []),
      ...(inputs.notes?.map((n) => n.topic) ?? []),
    ].map((t) => t.toLowerCase()),
  );

  // +30 if topic overlaps anything the user is engaging with
  if (topicsInPlay.has(candidate.topic.toLowerCase())) {
    score += 30;
  }

  // +25 if candidate continues an unfinished collection
  const unfinished =
    inputs.progress?.some(
      (p) =>
        p.collection.toLowerCase() === candidate.collection.toLowerCase() &&
        p.pct < 100,
    ) ?? false;
  if (unfinished) score += 25;

  // +20 for bookmarked topic match
  const bookmarkedTopic =
    inputs.bookmarks?.some(
      (b) => b.topic.toLowerCase() === candidate.topic.toLowerCase(),
    ) ?? false;
  if (bookmarkedTopic) score += 20;

  // +10 for short-form-friendly picks when daily reading time is small
  if ((inputs.dailyMinutes ?? 0) <= 30 && candidate.english.length < 140) {
    score += 10;
  }

  // +10 for narrator novelty (here we approximate via collection diversity)
  const recent = new Set((inputs.recentNarrators ?? []).map((s) => s.toLowerCase()));
  if (!recent.has(candidate.collection.toLowerCase())) {
    score += 10;
  }

  return Math.min(100, score);
}

/**
 * Main entry point. Today: mock-backed. Tomorrow: backed by:
 *   - Supabase: reading_progress, bookmarks, notes (see migration 008)
 *   - OpenAI embeddings: vector cosine similarity over hadith corpus
 *
 * The function is async to keep the call site stable across both modes.
 */
export async function getRecommendations(
  inputs: RecommendationInputs,
): Promise<RecommendedHadith[]> {
  // TODO(ai): Replace mock-backed pool with Supabase query that pulls a
  // candidate set, optionally filtered by `preferredTopics` and recent reading.
  //
  // Example (pseudocode):
  //   const supabase = createServerClient();
  //   const { data: candidates } = await supabase
  //     .from("hadith_index")
  //     .select("id, collection, hadith_number, topic, arabic, english")
  //     .in("topic", inputs.preferredTopics ?? [])
  //     .limit(80);
  const pool = sampleRecommendations;

  // TODO(ai): For each candidate, fetch its embedding and compute cosine
  // similarity against the user's averaged interest embedding (built from
  // recent reads/bookmarks). Add similarity * 40 to the score.
  //
  // import { OpenAI } from "openai";
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const userVec = await getUserInterestEmbedding(inputs);
  // const candidateVecs = await getCandidateEmbeddings(pool.map((p) => p.id));
  // ...combine cosine(userVec, candidateVec) * 40 with rule-based score below.

  const scored = pool
    .map((c) => ({
      ...c,
      score: scoreCandidate(c, inputs),
    }))
    .sort((a, b) => b.score - a.score);

  // TODO(ai): Apply diversity reranking so we don't return 4 of the same
  // collection. A simple MMR pass over (score, similarity) works well.

  return scored.slice(0, inputs.limit ?? 12);
}

export type { RecommendedHadith };
