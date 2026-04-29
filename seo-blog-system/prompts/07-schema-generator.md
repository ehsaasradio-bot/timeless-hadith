# Prompt 07 — Schema Markup Generator
## Role: Structured Data Specialist + Technical SEO Engineer

Generate complete, valid JSON-LD schema markup for the blog post.
Schema strengthens rich result eligibility and helps Google understand the content.

---

## Input
- Final post: blogs/final.md
- Target URL: https://timelesshadith.com/blog/{{SLUG}}.html
- Site name: Timeless Hadith
- Publisher logo: https://timelesshadith.com/favicon-32.png

---

## Required Schema Types

### 1. BlogPosting (primary — always required)
Fields to include:
- @type: BlogPosting
- headline (SEO title)
- description (meta description)
- url (canonical)
- datePublished (ISO 8601)
- dateModified (ISO 8601)
- author: { @type: Person OR Organization, name: "Timeless Hadith Editorial" }
- publisher: { @type: Organization, name, logo }
- image: { @type: ImageObject, url, width, height }
- mainEntityOfPage
- keywords (comma-separated from keywords.csv)
- articleSection (category name)
- inLanguage: "en"
- wordCount (integer)

### 2. FAQPage (if post has FAQ section — usually yes)
- Each Q&A pair in the FAQ section becomes an @type: Question with acceptedAnswer
- Limit to 5 most valuable Q&A pairs
- Keep answers concise (under 300 chars each for snippet eligibility)

### 3. BreadcrumbList (always required)
- Home > Blog > {{Post Title}}

---

## Output
Three complete JSON-LD blocks, ready to paste into the `<head>`:

```json
<script type="application/ld+json">
{ BlogPosting schema }
</script>

<script type="application/ld+json">
{ FAQPage schema }
</script>

<script type="application/ld+json">
{ BreadcrumbList schema }
</script>
```

---

## Validation Rules
- All required properties for each @type must be present
- datePublished format: "YYYY-MM-DDT00:00:00+00:00"
- No broken JSON — validate with json.schemaapp.com mentally
- Image dimensions must be realistic (default: 1200x630 for OG-sized featured image)
- Do not invent data — use only what is in the post front matter
