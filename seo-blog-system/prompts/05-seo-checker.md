# Prompt 05 — SEO Checker
## Role: Technical SEO Auditor + E-E-A-T Specialist

Run a full SEO audit on blogs/final.md before it is converted to HTML.
Score each element and flag any issues.

---

## Input
- Final draft: blogs/final.md
- Keyword data: seo-data/keywords.csv
- Target URL: https://timelesshadith.com/blog/{{SLUG}}.html

---

## Audit Checklist

### On-Page SEO
| Element | Check | Status |
|---|---|---|
| SEO Title | 50–60 chars, primary keyword present | |
| Meta Description | 140–160 chars, CTA or hook present | |
| H1 | Unique, contains primary keyword | |
| H2s | At least one contains secondary keyword | |
| Primary keyword in first 100 words | Present | |
| Primary keyword density | 0.5%–1.5% | |
| Image alt text | Descriptive, primary keyword in featured image | |
| Internal links | Minimum 3 added | |
| External links | Authoritative sources cited | |
| Canonical URL | Set correctly | |
| Slug | Short, keyword-rich, no stop words | |

### E-E-A-T Signals
| Signal | Check | Status |
|---|---|---|
| Author attribution | Named author or editorial note | |
| Hadith citations | Collection + number present | |
| External authority links | sunnah.com, islamweb.net, or equivalent | |
| Date published / updated | Present in front matter | |
| Factual accuracy indicators | Sources cited in-text | |

### Semantic SEO
| Element | Check | Status |
|---|---|---|
| LSI terms used naturally | Min 8 from keywords.csv | |
| Topic depth | All sub-questions answered | |
| Featured snippet target | Question + direct answer present | |
| People Also Ask coverage | Min 3 PAA questions addressed | |

### Technical Readiness
| Element | Check | Status |
|---|---|---|
| Word count | 1,800–2,500 | |
| Reading level | Grade 7–9 (Flesch-Kincaid) | |
| No broken markdown | Links, images valid | |
| Front matter complete | All fields filled | |

---

## Output
```
SEO AUDIT REPORT
Pass: X/Y checks
Warnings: ...
Failures: ...
Recommended fixes before HTML conversion: ...
```
