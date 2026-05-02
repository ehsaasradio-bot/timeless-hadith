// GET /api/seo/audit/[id] — fetch single audit with issues + recommendations
export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [{ data: audit, error }, { data: issues }, { data: recs }] = await Promise.all([
    db.from('seo_audits').select('*, seo_sites(domain, name)').eq('id', id).single(),
    db.from('seo_audit_issues').select('*').eq('audit_id', id).order('severity'),
    db.from('seo_recommendations').select('*').eq('audit_id', id).order('priority'),
  ]);

  if (error || !audit) return NextResponse.json({ error: 'Audit not found.' }, { status: 404 });

  return NextResponse.json({ audit, issues: issues ?? [], recommendations: recs ?? [] });
}
