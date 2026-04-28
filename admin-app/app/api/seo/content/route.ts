// POST /api/seo/content — Yoast-style content analysis
export const runtime = 'nodejs';

import { analyzeContent } from '@/lib/seo/content-optimizer';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { ContentAnalysisInput } from '@/lib/seo/types';

export async function POST(req: NextRequest) {
  let body: ContentAnalysisInput;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }

  if (!body.pageUrl) return NextResponse.json({ error: 'pageUrl is required.' }, { status: 400 });
  if (!body.focusKeyword) return NextResponse.json({ error: 'focusKeyword is required.' }, { status: 400 });

  try {
    const result = await analyzeContent(body);

    // Persist to Supabase
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await db.from('seo_content_scores').insert({
      page_url:           body.pageUrl,
      focus_keyword:      body.focusKeyword,
      secondary_keywords: body.secondaryKeywords ?? [],
      overall_score:      result.overallScore,
      title_score:        Math.round(result.titleAnalysis.reduce((s, f) => s + f.score, 0) / result.titleAnalysis.length),
      meta_score:         Math.round(result.metaAnalysis.reduce((s, f) => s + f.score, 0) / result.metaAnalysis.length),
      content_score:      Math.round(result.contentAnalysis.reduce((s, f) => s + f.score, 0) / result.contentAnalysis.length),
      keyword_score:      Math.round(result.keywordAnalysis.reduce((s, f) => s + f.score, 0) / result.keywordAnalysis.length),
      social_score:       Math.round(result.socialAnalysis.reduce((s, f) => s + f.score, 0) / result.socialAnalysis.length),
      analysis_json:      result,
    });

    return NextResponse.json({ result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
