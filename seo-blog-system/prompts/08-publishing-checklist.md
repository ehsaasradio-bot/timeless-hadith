# Prompt 08 — Publishing Checklist
## Role: Managing Editor + Quality Gate

This is the final gate before a blog post goes live on timelesshadith.com.
Run every check. Do not approve publication if any CRITICAL item fails.

---

## Input
- Final HTML file: blogs/{{SLUG}}.html
- Source post: blogs/final.md
- SEO audit from Prompt 05

---

## CRITICAL Checks (must pass — block publication if any fail)

- [ ] All hadith references include collection name and hadith number
- [ ] No invented or unverifiable Islamic claims
- [ ] Arabic terms have transliteration + English translation on first use
- [ ] Prophet's honorific (ﷺ) appears after every mention of "the Prophet"
- [ ] Primary keyword in title, meta description, H1, and first 100 words
- [ ] Canonical URL is correct
- [ ] Schema JSON-LD is present and valid (BlogPosting + BreadcrumbList minimum)
- [ ] No broken internal links
- [ ] No broken images (or placeholders clearly marked for replacement)
- [ ] Theme toggle JS is present and functional
- [ ] Page renders correctly in both light and dark mode
- [ ] Mobile layout is not broken (check viewport meta and responsive CSS)
- [ ] No secrets, API keys, or credentials in the HTML source
- [ ] No noindex meta tag (unless intentionally excluded from search)

---

## IMPORTANT Checks (fix before publication — soft blocks)

- [ ] Word count is 1,800–2,500
- [ ] Reading level is Grade 7–9
- [ ] At least 3 internal links added
- [ ] OG tags (og:title, og:description, og:image) present
- [ ] Twitter card tags present
- [ ] Featured image alt text is descriptive
- [ ] FAQ section present (for PAA targeting)
- [ ] CTA is clear and relevant
- [ ] Author/editorial byline present
- [ ] Date published displayed on page

---

## NICE TO HAVE (log for future improvement)

- [ ] External authority links (sunnah.com, islamweb.net)
- [ ] Social share buttons
- [ ] Related posts section
- [ ] Estimated read time shown
- [ ] Urdu translation available

---

## Final Approval Output

```
PUBLISHING DECISION: APPROVED / BLOCKED
CRITICAL FAILURES: ...
IMPORTANT WARNINGS: ...
NICE-TO-HAVE NOTES: ...
ESTIMATED PUBLISH DATE: ...
RECOMMENDED SOCIAL CAPTION (Twitter/X, 280 chars): ...
RECOMMENDED SOCIAL CAPTION (Facebook/LinkedIn, 400 chars): ...
```
