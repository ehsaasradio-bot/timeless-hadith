// POST /api/seo/audit  — start a new audit
// GET  /api/seo/audit  — list recent audits
// NOTE: Node.js runtime (NOT edge) — heavy crawling required

export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';
import { runAudit } from '@/lib/seo/auditor';
import { generateAuditRecommendations } from '@/lib/seo/openai-seo';
import { NextRequest, NextResponse } from 'next/server';

function supa() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Rate limiting: simple in-memory store (reset on deploy)
const auditCooldowns = new Map<string, number>();
const COOLDOWN_MS = 60_000; // 1 min between audits per IP

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const lastAudit = auditCooldowns.get(ip) ?? 0;
  if (Date.now() - lastAudit < COOLDOWN_MS) {
    return NextResponse.json({ error: 'Rate limit: wait 60 seconds between audits.' }, { status: 429 });
  }

  let body: { url?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }

  const rawUrl = body.url?.trim();
  if (!rawUrl) return NextResponse.json({ error: 'URL is required.' }, { status: 400 });

  // Validate URL
  let parsedUrl: URL;
  try { parsedUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`); }
  catch { return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 }); }

  // Block localhost / private ranges
  const blocked = ['localhost', '127.', '192.168.', '10.', '0.0.0.0'];
  if (blocked.some(b => parsedUrl.hostname.includes(b))) {
    return NextResponse.json({ error: 'Cannot audit private/localhost addresses.' }, { status: 400 });
  }

  auditCooldowns.set(ip, Date.now());

  const db = supa();

  // Upsert site
  const { data: site } = await db.from('seo_sites')
    .upsert({ domain: parsedUrl.hostname, name: parsedUrl.hostname }, { onConflict: 'domain' })
    .select('id').single();

  // Create audit record
  const { data: auditRow } = await db.from('seo_audits').insert({
    site_id: site?.id ?? null,
    url: parsedUrl.href,
    status: 'running',
    started_at: new Date().toISOString(),
  }).select('id').single();

  if (!auditRow) return NextResponse.json({ error: 'Failed to create audit record.' }, { status: 500 });

  const auditId = auditRow.id;

  // Run audit (async — but we wait here since it's a normal API call, not background job)
  try {
    const result = await runAudit(parsedUrl.href);

    // Persist issues
    if (result.issues.length > 0) {
      await db.from('seo_audit_issues').insert(
        result.issues.map(i => ({
          audit_id:       auditId,
          category:       i.category,
          severity:       i.severity,
          title:          i.title,
          description:    i.description,
          affected_url:   i.affectedUrl ?? null,
          recommendation: i.recommendation,
        }))
      );
    }

    // AI recommendations (non-blocking — best effort)
    let aiRecs: Awaited<ReturnType<typeof generateAuditRecommendations>> = [];
    if (process.env.OPENAI_API_KEY) {
      try {
        aiRecs = await generateAuditRecommendations({
          url: result.url,
          issues: result.issues,
          summary: result.summary,
        });
        if (aiRecs.length > 0) {
          await db.from('seo_recommendations').insert(
            aiRecs.map(r => ({
              audit_id:       auditId,
              type:           r.type,
              priority:       r.priority,
              title:          r.title,
              recommendation: r.suggestion,
              rationale:      r.rationale,
              ai_generated:   true,
            }))
          );
        }
      } catch (e) {
        console.warn('[SEO] AI recommendations failed:', e);
      }
    }

    // Update audit record as complete
    await db.from('seo_audits').update({
      status:          'complete',
      health_score:    result.healthScore,
      seo_score:       result.seoScore,
      pages_crawled:   result.pagesCrawled,
      issues_critical: result.summary.critical,
      issues_high:     result.summary.high,
      issues_medium:   result.summary.medium,
      issues_low:      result.summary.low,
      completed_at:    new Date().toISOString(),
    }).eq('id', auditId);

    return NextResponse.json({ auditId, result, aiRecommendations: aiRecs });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    await db.from('seo_audits').update({ status: 'failed', error_message: msg }).eq('id', auditId);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const db = supa();
  const { data, error } = await db.from('seo_audits')
    .select('*, seo_sites(domain, name)')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ audits: data ?? [] });
}
