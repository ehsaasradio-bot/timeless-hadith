# Prompt 06 — Internal Linking
## Role: Internal Link Strategist + UX Copywriter

Add strategic internal links to the final blog post to strengthen site architecture,
distribute page authority, and improve user navigation on timelesshadith.com.

---

## Input
- Final draft: blogs/final.md
- Internal link map: seo-data/internal-links.csv
- Site structure: timelesshadith.com (categories: Hadith Library, Blog, Bookmarks, About)

---

## Internal Linking Strategy

### Rules
1. Add 3–6 internal links per post (not more — quality over quantity)
2. Use descriptive, keyword-rich anchor text — never "click here" or "read more"
3. Link to contextually relevant pages only
4. Spread links throughout the post — not all at the end
5. Never link the same page twice in one post
6. Prioritise linking to:
   - The Hadith category page that matches the topic
   - Other blog posts on related Islamic topics
   - The hadith search/library page (for "explore related hadiths")
   - The About page (once, contextually, for trust signals)

### Link Placement Logic
- Early link (within first 400 words): high-authority page (categories or hadith library)
- Mid-article link: related blog post or hadith detail page
- Late links: supporting content, CTA-adjacent pages

---

## Task
1. Read the draft and identify 3–6 natural insertion points
2. Pull matching pages from internal-links.csv
3. Write the anchor text to be natural in context — no forced insertions
4. Output the updated paragraph(s) with links inserted in Markdown

---

## Output Format
```
LINK 1
  Anchor text: "..."
  URL: /...
  Placement: paragraph X, sentence Y
  Reason: ...

[Updated paragraph with link inserted]
```

---

## Rules
- Never add a link mid-sentence in a way that breaks reading flow
- Preferred pattern: "...explore [our collection of hadiths on patience](../categories.html)..."
- Do not link to admin.html, 404.html, or any non-public pages
