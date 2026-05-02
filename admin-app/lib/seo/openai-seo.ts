// ═══════════════════════════════════════════════════════════════
// SEO OpenAI Integration
// Requires: OPENAI_API_KEY in .env.local
// ═══════════════════════════════════════════════════════════════

import type { AuditResult, AiSuggestion, AiRewriteResult } from './types';

const OPENAI_API = 'https://api.openai.com/v1/chat/completions';
const MODEL      = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

async function chat(system: string, user: string, maxTokens = 800): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch(OPENAI_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user },
      ],
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI error ${res.status}: ${(err as Record<string,unknown>).error ?? res.statusText}`);
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message?.content?.trim() ?? '';
}

const SYSTEM = `You are an expert SEO consultant with 15 years of experience.
You give practical, actionable advice in clear human language.
Avoid jargon. Be direct. Format responses as clean JSON only — no markdown, no preamble.`;

// ── Generate audit recommendations ─────────────────────────────
export async function generateAuditRecommendations(audit: Pick<AuditResult, 'url' | 'issues' | 'summary'>): Promise<AiSuggestion[]> {
  const topIssues = audit.issues
    .filter(i => i.severity === 'critical' || i.severity === 'high')
    .slice(0, 8)
    .map(i => `[${i.severity.toUpperCase()}] ${i.title}: ${i.description}`);

  const prompt = `
Site: ${audit.url}
Issues (${audit.summary.critical} critical, ${audit.summary.high} high):
${topIssues.join('\n')}

Return a JSON array of 5 prioritised SEO recommendations. Each item:
{ "type": string, "priority": 1-5, "title": string, "suggestion": string, "rationale": string }
Types: technical | metadata | content | links | performance`;

  const raw = await chat(SYSTEM, prompt, 1000);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
}

// ── Rewrite SEO title ───────────────────────────────────────────
export async function rewriteTitle(current: string, keyword: string, context: string): Promise<AiRewriteResult> {
  const prompt = `Current title: "${current}"
Focus keyword: "${keyword}"
Page context: ${context}

Return JSON: { "original": string, "rewritten": string, "explanation": string }
Rules: 50-60 chars, keyword near start, compelling and click-worthy.`;

  const raw = await chat(SYSTEM, prompt, 300);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { original: current, rewritten: current, explanation: 'Could not generate rewrite.' };
  }
}

// ── Rewrite meta description ────────────────────────────────────
export async function rewriteMetaDesc(current: string, keyword: string, title: string): Promise<AiRewriteResult> {
  const prompt = `Title: "${title}"
Current meta: "${current}"
Focus keyword: "${keyword}"

Return JSON: { "original": string, "rewritten": string, "explanation": string }
Rules: 120-160 chars, keyword included, ends with a CTA, improves CTR.`;

  const raw = await chat(SYSTEM, prompt, 300);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return { original: current, rewritten: current, explanation: 'Could not generate rewrite.' };
  }
}

// ── Suggest internal links ──────────────────────────────────────
export async function suggestInternalLinks(pageTitle: string, keyword: string, sitePages: string[]): Promise<string[]> {
  const prompt = `Target page: "${pageTitle}" (keyword: "${keyword}")
Site pages: ${sitePages.slice(0, 20).join(', ')}

Return JSON array of 3-5 internal linking opportunities with anchor text.
Format: ["anchor text → /page-url", ...]`;

  const raw = await chat(SYSTEM, prompt, 400);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return [];
  }
}

// ── Generate weekly action plan ─────────────────────────────────
export async function generateWeeklyPlan(
  healthScore: number,
  topIssues: { title: string; severity: string }[],
  siteDomain: string
): Promise<string> {
  const prompt = `Site: ${siteDomain}
Health score: ${healthScore}/100
Top issues: ${topIssues.slice(0, 5).map(i => `[${i.severity}] ${i.title}`).join(', ')}

Write a concise weekly SEO action plan (plain text, 5 bullet points max).
Each bullet: action + expected impact. No markdown headers.`;

  return chat(SYSTEM, prompt, 600);
}

// ── Suggest blog ideas ──────────────────────────────────────────
export async function suggestBlogIdeas(keyword: string, domain: string): Promise<string[]> {
  const prompt = `Site: ${domain}, Niche keyword: "${keyword}"

Return JSON array of 6 blog post title ideas that would rank well.
Format: ["title 1", "title 2", ...]
Mix: how-to, listicle, comparison, case study styles.`;

  const raw = await chat(SYSTEM, prompt, 400);
  try {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return [];
  }
}

// ── Generate FAQ schema ─────────────────────────────────────────
export async function generateFaqSchema(topic: string, keyword: string): Promise<string> {
  const prompt = `Topic: "${topic}", keyword: "${keyword}"

Generate valid JSON-LD FAQ schema with 4 question-answer pairs.
Return ONLY the JSON-LD object (no markdown, no explanation).`;

  return chat(SYSTEM, prompt, 600);
}
