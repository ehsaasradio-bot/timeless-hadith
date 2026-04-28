// POST /api/seo/ai — AI-powered SEO tools
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import {
  rewriteTitle, rewriteMetaDesc, suggestInternalLinks,
  generateWeeklyPlan, suggestBlogIdeas, generateFaqSchema,
} from '@/lib/seo/openai-seo';

type AiAction = 'rewrite_title' | 'rewrite_meta' | 'internal_links' | 'weekly_plan' | 'blog_ideas' | 'faq_schema';

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local.' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }

  const action = body.action as AiAction;
  if (!action) return NextResponse.json({ error: 'action is required.' }, { status: 400 });

  try {
    switch (action) {
      case 'rewrite_title': {
        const result = await rewriteTitle(String(body.title ?? ''), String(body.keyword ?? ''), String(body.context ?? ''));
        return NextResponse.json({ result });
      }
      case 'rewrite_meta': {
        const result = await rewriteMetaDesc(String(body.meta ?? ''), String(body.keyword ?? ''), String(body.title ?? ''));
        return NextResponse.json({ result });
      }
      case 'internal_links': {
        const result = await suggestInternalLinks(String(body.pageTitle ?? ''), String(body.keyword ?? ''), (body.sitePages as string[]) ?? []);
        return NextResponse.json({ result });
      }
      case 'weekly_plan': {
        const result = await generateWeeklyPlan(Number(body.healthScore ?? 0), (body.topIssues as { title: string; severity: string }[]) ?? [], String(body.domain ?? ''));
        return NextResponse.json({ result });
      }
      case 'blog_ideas': {
        const result = await suggestBlogIdeas(String(body.keyword ?? ''), String(body.domain ?? ''));
        return NextResponse.json({ result });
      }
      case 'faq_schema': {
        const result = await generateFaqSchema(String(body.topic ?? ''), String(body.keyword ?? ''));
        return NextResponse.json({ result });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI request failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
