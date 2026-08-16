# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences evaluated roughly equally on the same pages:

- **Hiring managers and recruiters** assessing Madina Rashidova for full-time product/UX designer roles.
- **Prospective freelance/agency clients** assessing her for contract or project-based design work.

Both groups are doing the same job: deciding, from the case studies and experience history, whether she can be trusted to own a real product problem end to end.

## Product Purpose

A personal portfolio site for Madina Rashidova, a product designer with experience in fintech, banking, and mobile products (Alif Bank, Профинанс/FIBO Group, Foreesco Group). It exists to get her hired or hired-as-contractor by demonstrating real project work through detailed case studies (Alif Partners, EAJ Trader, 360 Tracker, Namaste), plus an About page and CV. Success is a recruiter or client callback driven by what they read here.

## Positioning

The mechanism the site argues for is **end-to-end ownership**: she doesn't just deliver polished screens — she takes products from research/problem framing through decisions to a shipped, measured outcome. Each case study is structured to show that arc explicitly (hypothesis → decisions → result → metrics → conclusion), not just a gallery of final UI.

## Operating Context

- Case studies document real client/employer engagements, each with a facts block (duration, team composition and her role, users, platforms) and a dedicated hypothesis section, ending in a split Result / Metrics / Conclusion.
- Fintech/banking domain context recurs across the work (Alif Bank marketplace/partners tooling, EAJ Trader, a banking-adjacent tracker product).
- Visitors read in either Russian or English via a manual language toggle; the whole reading experience must work identically in both.

## Capabilities and Constraints

- **Stack:** static, no-build multi-page site — plain HTML/CSS/JS, no framework or bundler, deployed to GitHub Pages. No shared includes/partials exist yet: nav, language toggle, and shared scripts are duplicated per page, so any shared-chrome change must be repeated by hand across all pages.
- **i18n is load-bearing, not cosmetic:** every user-facing string ships as paired `<span data-lang="ru">` / `<span data-lang="en">` siblings, toggled via `assets/i18n.js`. New copy must always ship both languages together — never RU-only or EN-only.
- **Pages:** `index.html` (home: hero, work grid, experience, footer), `about.html`, `case-alif-partners.html`, `case-eaj-trader.html`, `case-360-tracker.html`, `case-namaste.html`.
- Only `case-alif-partners.html` currently has the fuller case-study copy (facts block, hypothesis section, split result/metrics/conclusion); the other three case pages carry the newer visual grid but older, shorter copy. Expanding them to match is a known open task, not to be done speculatively without being asked.
- No custom illustration assets exist yet beyond the current tool-icon set and photos already in `assets/`; a spec for new illustrations (logo marks, case hero banners, square crops, mobile screens) was given to Madina but nothing has been delivered — don't assume new asset files exist without checking `assets/`.

## Brand Commitments

- Name and title are fixed: "Мадина Рашидова — Продуктовый дизайнер" / "Madina Rashidova — Product Designer."
- Bilingual RU/EN presentation is a hard requirement, not a nice-to-have.

## Evidence on Hand

- All facts, numbers, team/role/duration/platform details, and outcomes currently written into the four case studies are real and final — verified truth, not placeholder copy. Future work may rewrite framing/prose around them but must never invent or alter the underlying facts or metrics.
- Real employment history exists in the Experience section (Профинанс/FIBO Group 2024–present, Foreesco Group 2024–2025 part-time, Alif Bank 2022–2024 as UX/UI Designer) and should be treated as authoritative alongside the case studies.

## Product Principles

- Every page must justify itself to both a recruiter skimming for signal and a client evaluating for hire — don't optimize copy or structure for only one audience.
- Process over polish: the case-study structure (hypothesis → decisions → result → metrics → conclusion) is the product's core credibility mechanism and should be preserved and reinforced, not flattened back into a screenshot gallery.
- Treat case-study facts and metrics as immutable source material; craft can change how they're presented, never what they say.
- RU and EN are one product, not two — any content or structural change ships in both languages simultaneously.
