# Timeless Hadith — Project Methodology Whitepaper

A self-contained Apple-clean HTML report that documents how the Timeless Hadith
platform was built, every mistake along the way, and how to rebuild it from zero
using Claude Co-worker.

## What's in this folder

```
docs/project-methodology-report/
├── index.html      The whitepaper itself (open this in a browser)
├── styles.css      All styling, including print/PDF rules
├── assets/         (Optional) Reserved for future diagrams/screenshots
└── README.md       You are reading this
```

The report is a single static HTML page — no build step, no dependencies.
It works offline and is safe to email, archive, or print.

## How to open it

### macOS
1. In Finder, navigate to this folder.
2. Double-click `index.html`. It will open in your default browser.

### Windows
1. In File Explorer, navigate to this folder.
2. Double-click `index.html`. It will open in your default browser.

### From the terminal
```bash
# macOS
open docs/project-methodology-report/index.html

# Windows
start docs\project-methodology-report\index.html

# Linux
xdg-open docs/project-methodology-report/index.html
```

## How to save it as a PDF

The report has dedicated `@media print` rules — page breaks, link expansion,
toned-down gradients — so it exports cleanly without any extra tools.

### Chrome or Edge (recommended — best PDF output)
1. Open `index.html` in the browser.
2. Press **Ctrl + P** (Windows / Linux) or **Cmd + P** (macOS).
3. In the **Destination** dropdown, choose **Save as PDF**.
4. **Layout:** Portrait
5. **Paper size:** A4 (or Letter — both work)
6. **Margins:** Default
7. **Scale:** Default (or 100%)
8. **Options:**
   - Headers and footers — *off* (cleaner result)
   - Background graphics — **on** (essential — keeps the cover page colors,
     severity badges, and chart fills)
9. Click **Save**, name the file `timeless-hadith-methodology.pdf`, and pick
   a location.

### Safari
1. Open `index.html`.
2. **File &rarr; Export as PDF...**
3. Pick a filename and save.

### Firefox
1. Open `index.html`.
2. Press **Ctrl + P** / **Cmd + P**.
3. **Destination:** Save to PDF.
4. Make sure **Print backgrounds** is enabled under "More settings".

## Recommended print settings (summary)

| Setting              | Value                                 |
| -------------------- | ------------------------------------- |
| Paper size           | A4 or Letter                          |
| Orientation          | Portrait                              |
| Margins              | Default (CSS already sets 18mm/16mm)  |
| Scale                | 100% / Default                        |
| Background graphics  | **ON** (must be enabled)              |
| Headers / footers    | OFF                                   |

## What to do if the PDF looks wrong

| Symptom                                | Fix                                                                   |
| -------------------------------------- | --------------------------------------------------------------------- |
| Cover page colors missing              | Enable **Background graphics** in the print dialog                    |
| Sections cut mid-paragraph             | Choose **Default** margins, not "None"                                |
| Code blocks overflow the page          | Switch to A4; if it still overflows, set scale to 95%                 |
| Tiny text                              | Set scale to 100%                                                     |
| Links not clickable in the PDF         | Use Chrome/Edge "Save as PDF"; Safari sometimes flattens links        |
| Page break inside a card               | Already handled by `page-break-inside: avoid` — refresh the page once |

## Updating the report

Edit `index.html` directly. The CSS uses semantic class names so changes are
local and predictable:

- Section wrappers: `<section id="...">`
- Severity badges: `.badge.badge--critical|--high|--medium|--low|--info`
- Cards: `.card`, `.card.elev`
- Charts: `.chart`, `.bar-row`
- Timeline: `.timeline`, `.timeline__item`
- Architecture diagram: `.arch`, `.arch__row`, `.arch__node`

## Notes

- The report is **noindex, nofollow** — it should not be submitted to search
  engines.
- All real secrets, tokens and API keys are shown as `[REDACTED]`. The document
  is safe to share with anyone you'd trust to read the README of this repo.
- The methodology section explicitly notes when something could not be confirmed
  from the project files.

---

Prepared April 2026 &middot; Version 1.0
