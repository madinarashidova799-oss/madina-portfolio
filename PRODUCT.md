# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: recruiters and hiring managers at fintech/banking and product companies, both Russian-speaking/CIS and international, evaluating Madina Rashidova for full-time in-house product design roles. Secondary: potential freelance/contract clients.

## Product Purpose

A personal portfolio for Madina Rashidova, a product designer with fintech/banking experience. It exists to support an active full-time job search (the site shows an "Open to work" badge) by presenting case studies and experience that let a hiring manager quickly assess her fit.

## Positioning

Specializes in designing complex administrative interfaces and products handling large volumes of data, with domain depth in fintech, banking, and trading. Each case study is framed around a concrete operational or business outcome (reduced call-center load, an MVP shipped in a fixed timeframe, a validated monetization model) rather than visuals alone — that outcome-first framing is the differentiator from a generalist portfolio.

## Operating Context

Bilingual RU/EN site with a language toggle driven by paired `data-ru`/`data-en` attributes on markup and `assets/i18n.js`. Deployed as a static site via GitHub Pages (`.github/workflows/pages.yml`, `.nojekyll`). Structure: `index.html` (home/work grid), `about.html`, four case-study pages, and a downloadable CV (`cv.pdf`).

## Capabilities and Constraints

Static HTML/CSS/JS, no build framework or backend/CMS. Content lives directly in HTML with `data-ru`/`data-en` attribute pairs for language switching. Any new page or component must carry both language variants to stay consistent with this pattern.

## Brand Commitments

Name: Мадина Рашидова / Madina Rashidova. Positioned as a product designer with fintech/banking experience.

## Evidence on Hand

Four real case studies with named employers and specific engagement details — confirmed accurate by the user; future work may restyle presentation but must not alter or invent facts:

- **Alif Partners** — Alif Bank, Web + Mobile, 4 months. Redesigned the partner admin panel for Alif Bank's partner network; reduced call-center/moderator load and increased partner self-service on key operations.
- **EAJ Trader** — Web, MVP in 2 months. Trader's personal dashboard MVP built from scratch; defined key user segments and an architecture for fast, frequent financial operations.
- **360 Tracker** — iOS, MVP in 6 months. Family-safety app MVP (geolocation, emergency alerts, quick communication); concept validated through usability testing and a freemium monetization model.
- **Namaste** — iOS, MVP in 3 months. Yoga/meditation app MVP — concept, identity, and interfaces, from competitor analysis to the core workout scenario, built closely with engineering.

Work experience: Профинанс / FIBO Group — Product Designer, 2024–present. Foreesco Group — Product Designer (part-time), 2024–2025. Alif Bank — UX/UI Designer, 2022–2024.

Assets on hand: real headshot/hero photography (`assets/hero-real-photo.png`, `assets/photo.jpg`), case-study cover images, tool icons (Blender, Claude Code, Codex, Figma, GPT, Illustrator, Notion, Photoshop, Tilda), company logos, downloadable CV (`cv.pdf`).

## Product Principles

- Outcome-first: every case study leads with a concrete result, not just visuals — preserve that framing in any redesign.
- Depth over breadth: fintech/banking and data-heavy admin UI is the differentiator; don't dilute into a generalist "does everything" portfolio.
- Bilingual parity: RU and EN are equally primary audiences — no page, case study, or feature should exist in only one language.
- Facts are immutable: employers, timelines, and outcomes are real; future work may reframe or restyle but never invent or alter them.
