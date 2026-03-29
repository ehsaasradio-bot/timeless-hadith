# CLAUDE.md
## Auto-Executing Workflow with Auto Commit + Ask Before Push
## Project: Hadith Website Enhancement, SEO Optimization, and Safe Git Workflow
---
# 1. ROLE
You are a senior:
- Full-stack developer
- UI/UX designer
- Front-end engineer
- SEO specialist
- Accessibility reviewer
- Performance optimizer
- Git workflow executor
Your responsibility is to analyze, modify, validate, commit, and prepare this repository for a safe push workflow.
---
# 2. EXECUTION MODE
You must not stop at planning only.
You must:
1. Analyze the repository
2. Identify the relevant files
3. Implement the requested changes
4. Validate the changes
5. Create structured git commits automatically
6. Stop before push and ask for approval
7. Generate a final implementation report file in the repo
You are allowed to create commits automatically after each validated phase.
You are **not allowed to push automatically**.
You must always pause and ask for confirmation before any push to GitHub or remote branch.
---
# 3. SAFE GIT RULES
## Commit Rules
- Create logical commits after each major validated phase
- Use professional, conventional-style commit messages
- Stage only relevant files
- Avoid noisy or tiny meaningless commits
- Group related changes cleanly
## Push Rules
- Never push without explicit approval
- After all implementation and local commits are complete:
  - summarize all commits created
  - summarize changed files
  - summarize branch status
  - ask whether to push
- If approval is given, push only the active working branch
- Do not force-push unless the repo policy explicitly requires it and approval is given
## Safety Rules
- Never commit secrets, tokens, credentials, or `.env` values
- Never commit unnecessary temporary files
- Never overwrite unrelated user work without checking git status first
- If unexpected uncommitted changes exist, inspect and separate them carefully before staging
---
# 4. PRODUCT OBJECTIVE
Implement the following website changes:
## Theme
- Set landing page to Light Theme by default
- Add Light / Dark theme toggle
- Persist theme preference
- Apply theme consistently across all pages
## Branding
- Replace the website logo with the provided new logo
- Update navbar/mobile/header/favicon branding as applicable
## Cleanup
- Remove emojis from the entire website
- Remove italic fonts globally
## Bookmark UX
- Add a rounded dynamic bookmark count badge
- Update count live when bookmarks are added or removed
## Featured Hadith
- Mobile: horizontal swipe/scroll
- Web: forward and back buttons with smooth movement
## Category Page
- Replace bookmark and camera/share icons with the provided reference icons
- Remove the text:
  - Both
  - عربي
  - English
  beside the search bar
- Rebalance spacing after removal
## About Us
- Create or rewrite the About Us page
- Make it engaging, professional, respectful, and SEO-optimized
## SEO
- Optimize the entire website for SEO:
  - titles
  - meta descriptions
  - OG tags
  - structured data
  - image alt text
  - semantic HTML
  - internal linking
  - mobile performance
  - accessibility basics
## Final Report
- Generate a final report file summarizing:
  - changes made
  - issues fixed
  - SEO improvements
  - UX improvements
  - recommendations
---
# 5. GLOBAL PRODUCT RULES
## UX / Design Rules
- Maintain a premium Apple-style visual direction
- Keep the site minimal, clean, modern, and polished
- Remove all emojis across the website
- Remove italic fonts globally
- Preserve responsiveness across mobile, tablet, and desktop
- Preserve existing working functionality unless explicitly changed
- Do not introduce unnecessary clutter
## Technical Rules
- Reuse existing components where possible
- Avoid duplicated code
- Keep code modular and maintainable
- Do not break routing, assets, imports, or existing flows
- Ensure all changes are production-ready
- Ensure bookmark logic, theme logic, and rendering remain stable
---
# 6. PHASED EXECUTION WORKFLOW
Claude must execute in this order.
---
# PHASE 0 — REPOSITORY ANALYSIS
## Actions
1. Inspect repository structure
2. Detect framework / stack automatically
3. Locate:
   - entry files
   - shared layouts/components
   - theme logic
   - logo references
   - bookmark logic
   - featured hadith section
   - category page
   - about page route/content
   - SEO/meta handling
4. Review current git status
5. Review current branch
6. Identify files that need modification
## Git Action
- Do not commit in this phase
## Output
Create a short internal implementation plan, then continue automatically.
---
# PHASE 1 — THEME SYSTEM
## Actions
- Set Light Theme as default on first load
- Add a Light/Dark mode toggle
- Persist theme preference using localStorage or existing preference logic
- Apply theming consistently across site pages
- Prevent theme flicker if possible
## Validation
- Light theme is default for first-time visitors
- Toggle works correctly
- Refresh preserves selected theme
- Shared components render correctly in both modes
## Git Commit
After validation, commit with a message similar to:
- `feat(theme): add persistent light/dark theme toggle with light default`
Then continue automatically.
---
# PHASE 2 — LOGO UPDATE
## Actions
- Replace old logo with provided logo asset
- Update all relevant placements
- Update favicon if applicable
- Verify appearance in both themes
## Validation
- No broken asset paths
- Proper scaling and alignment
- Good contrast in light and dark modes
## Git Commit
After validation, commit with a message similar to:
- `feat(branding): replace logo assets and update site branding`
Then continue automatically.
---
# PHASE 3 — GLOBAL VISUAL CLEANUP
## Actions
- Remove all emojis from the site
- Remove italic fonts globally
- Standardize typography for a cleaner premium UI
## Validation
- Search for remaining emoji characters where possible
- Search for italic styles/classes/tags
- Confirm UI remains polished and consistent
## Git Commit
After validation, commit with a message similar to:
- `style(ui): remove emojis and italic typography across site`
Then continue automatically.
---
# PHASE 4 — BOOKMARK COUNTER BADGE
## Actions
- Add rounded bookmark count badge
- Ensure dynamic updates on add/remove
- Preserve authentication behavior
- Ensure desktop and mobile compatibility
## Validation
- Add bookmark increments badge
- Remove bookmark decrements badge
- Refresh preserves correct state
- No regression in login/logout behavior
## Git Commit
After validation, commit with a message similar to:
- `feat(bookmarks): add dynamic bookmark counter badge`
Then continue automatically.
---
# PHASE 5 — FEATURED HADITH INTERACTION
## Actions
- Add mobile horizontal swipe/scroll behavior
- Add desktop forward/back controls
- Ensure clean alignment and smooth movement
## Validation
- Mobile swipe works naturally
- Desktop controls work correctly
- No visual overflow bugs
## Git Commit
After validation, commit with a message similar to:
- `feat(featured-hadith): improve horizontal navigation for mobile and desktop`
Then continue automatically.
---
# PHASE 6 — CATEGORY PAGE REFINEMENT
## Actions
- Replace bookmark icon with provided reference icon
- Replace camera/share icon with provided reference icon
- Remove `Both عربي English` beside the search bar
- Rebalance layout spacing after removal
## Validation
- Icons display correctly
- Layout remains balanced
- Actions remain functional
## Git Commit
After validation, commit with a message similar to:
- `refactor(category-page): update action icons and simplify search controls`
Then continue automatically.
---
# PHASE 7 — ABOUT US PAGE
## Actions
- Create or rewrite About Us page
- Make it respectful, engaging, modern, and SEO-optimized
- Include mission, vision, authentic hadith value, user trust, learning, and reflection
## Validation
- Content matches overall site tone
- Heading structure is strong
- SEO quality is improved
- Internal linking is added where relevant
## Git Commit
After validation, commit with a message similar to:
- `feat(content): add seo-optimized about us page`
Then continue automatically.
---
# PHASE 8 — SEO OPTIMIZATION
## Actions
- Improve page titles
- Improve meta descriptions
- Improve OG metadata
- Add structured data where relevant
- Improve alt text
- Improve semantic HTML
- Improve internal linking
- Improve accessibility basics and mobile SEO where feasible
## Validation
- Key pages have metadata
- Important images have alt text
- Important pages are indexable
- No obvious SEO regressions introduced
## Git Commit
After validation, commit with a message similar to:
- `feat(seo): optimize metadata, schema, semantics, and accessibility`
Then continue automatically.
---
# PHASE 9 — FINAL QA / PERFORMANCE PASS
## Actions
- Check desktop/tablet/mobile layouts
- Check spacing, typography, icon consistency, and theme consistency
- Check broken links, broken images, and console issues
- Remove dead code introduced during edits
- Ensure maintainability
## Validation
- No major regressions
- UI remains stable and polished
- Codebase remains clean
## Git Commit
If this phase introduces changes, commit with a message similar to:
- `chore(qa): final polish, cleanup, and responsiveness fixes`
Then continue automatically.
---
# PHASE 10 — FINAL REPORT FILE
## Actions
Create a markdown file such as:
`reports/website-seo-performance-report.md`
## Report Must Include
- Summary of completed work
- UI/UX improvements
- SEO improvements
- Technical improvements
- Issues fixed
- Recommendations for next steps
## Git Commit
After validation, commit with a message similar to:
- `docs(report): add website seo and performance implementation report`
Then continue automatically.
---
# 7. STOP POINT — ASK BEFORE PUSH
After all changes are implemented and all local commits are completed, stop and present:
## Required Summary
- active branch name
- git status summary
- list of commits created in order
- list of major files changed
- report file location
- note whether the branch is ahead of remote
## Required Question
Ask clearly:
**"All requested changes have been implemented and committed locally. Would you like me to push these commits to the remote GitHub branch now?"**
Do not push until approval is explicitly given.
---
# 8. COMMIT MESSAGE STANDARD
Use messages in this style:
- `feat(theme): add persistent light/dark toggle`
- `feat(branding): replace site logo`
- `style(ui): remove emojis and italics`
- `feat(bookmarks): add bookmark badge counter`
- `feat(featured-hadith): improve horizontal navigation`
- `refactor(category-page): simplify search controls`
- `feat(content): create about us page`
- `feat(seo): improve metadata and schema`
- `chore(qa): final cleanup and polish`
- `docs(report): add final implementation report`
Rules:
- keep messages professional
- use conventional commit style where practical
- avoid vague messages like `update files`
---
# 9. FINAL COMPLETION CHECKLIST
Before stopping to ask for push approval, verify:
- [ ] Landing page defaults to Light Theme
- [ ] Light/Dark toggle works and persists
- [ ] New logo is applied correctly
- [ ] Emojis removed globally
- [ ] Italic fonts removed globally
- [ ] Bookmark counter badge works
- [ ] Featured Hadith horizontal navigation works
- [ ] Category page icons updated
- [ ] `Both عربي English` removed beside search
- [ ] About Us page created or improved
- [ ] Website SEO optimized
- [ ] Final report added
- [ ] Changes committed locally
- [ ] Push has NOT happened yet
- [ ] No major regressions introduced
---
# 10. FINAL RESPONSE FORMAT
At the stop point, provide:
- concise implementation summary
- files changed
- commits created
- report location
- current branch status
- explicit push approval question
Do not stop after planning only.
Do not push automatically.
Implement fully, commit locally, and then ask before push.
