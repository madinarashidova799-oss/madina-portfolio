# Portfolio redesign — "Scroll Poster Sequence"

## Context

Current site: `index.html` (single static file, no build step, deployed to GitHub Pages from this repo). Dark terminal/dev aesthetic — fixed 380px left sidebar (name, physics-chip tag pile, live MSK clock, coordinates, "open to work" status, contacts, experience) plus a right-hand 2×2 grid of expandable case-study cards (Alif Partners, EAJ Trader, 360 Tracker, Namaste).

Problems this redesign solves:
- The "about me" content is boxed into a narrow sidebar and reads as secondary to the work grid.
- The 4 case studies look like generic, uniform cards — not distinctive or memorable.
- (Carried over from the prior technical audit, in scope for this work): 21.6 MB of unoptimized images with zero lazy-loading, ~68s cold load.

Inspiration (screenshotted and reviewed): vldklsnkv.me, anatolyzenkov.com, romina.design/playground, emnuel.xyz. Direction chosen: bold/graphic energy closest to anatolyzenkov.com, kept on a dark base, most closely realized as a full-viewport "scroll poster sequence" (emnuel/anatolyzenkov-style full-bleed sections rather than a card grid).

All existing copy (bio line, experience entries, case-study narrative text, persona cards, outcome lists) is preserved verbatim — this is a presentation/structure redesign, not a content rewrite.

## Architecture

Single scrolling page, `scroll-snap-type: y mandatory` on the page container, composed of 6 full-viewport (`100vh`) sections in order:

1. **Hero** — id `hero`
2. **Case 01 — Alif Partners** — id `case-01`
3. **Case 02 — EAJ Trader** — id `case-02`
4. **Case 03 — 360 Tracker** — id `case-03`
5. **Case 04 — Namaste** — id `case-04`
6. **Experience & contact** — id `outro` (closing chapter; carries the 3-entry experience timeline + contacts + CV link, previously in the sidebar)

A persistent **indicator nav** (fixed, right edge) shows 6 dots/numbers (0, 01–04, 05) across all sections; clicking one scrolls to that section (`scrollIntoView` or anchor jump). Current section is highlighted via `IntersectionObserver`.

Still a single HTML file: all 6 sections, the indicator nav, and existing lightbox markup live in `index.html`. No routing, no build step, no framework — same authoring model as today (inline `<style>`, inline `<script>`, vanilla JS).

## Components

### Hero section
- Large custom display treatment of "Мадина Рашидова" as the dominant visual element (varied weight/kerning per the bold-graphic direction), composed with the profile illustration (`assets/hero-portrait.png`, 1086×1448, transparent background — already isolated, no masking needed).
- Physics-chip tag pile (existing Matter.js setup, reused) expanded to roam the full hero viewport instead of the current 195px-tall boxed container; chips restyled as bold filled/colored pills (tinted from the 4 case accent colors, previewing the work below) instead of thin mono-bordered outlines.
- Live status badge (MSK clock + coordinates + "open to work" pulse) condensed into one compact graphic badge, corner-positioned — same live data as today, new visual treatment (not monospace-terminal styled).
- Contact row: Telegram, Email, CV — same three links as today, simple inline row (no card container).
- Experience is **not** in the hero — moved to the `outro` section (see below).

### Case poster sections (×4)
- Each section gets one accent color from a small fixed 4-color palette (assigned one per case, consistent every time that case's content is shown — in the collapsed poster, the expanded detail view, and its indicator-nav dot).
- Poster (collapsed) state: oversized chapter numeral ("01".."04") bleeding off-edge as background typography, case name in large display type, the existing one-line meta (client · platform · duration) and `/tag` line, the existing 2 metric tiles, and an expand affordance ("Смотреть процесс" / arrow) replacing today's "Читать процесс" toggle label.
- Expand interaction: clicking the poster (or the affordance) reveals the full existing case-detail markup for that case (all numbered `detail-block`s: context, research, persona grid, problem statement, solution, outcome card, images) directly beneath the poster, within the same section — content and structure unchanged from today's case-detail HTML, restyled to the new accent color instead of the old gold `--accent`.
- While a case is expanded, page-level `scroll-snap-type` is toggled off (JS adds a class to `<html>` that sets `scroll-snap-type: none`) so the long-form case detail reads as normal free scroll. A "Свернуll" (collapse) control restores `scroll-snap-type: y mandatory` and returns the user to the poster.
- This directly extends the existing `toggleCase(id)` JS function; no new interaction model, just a scroll-snap toggle added to it.

### Indicator nav
- Fixed-position column of 6 dots (or numerals), right edge, all viewport sizes down to the mobile breakpoint.
- Below 768px width: collapses to a thin horizontal progress bar (not per-dot clickable targets) to avoid a cramped touch target column on small screens.
- Uses `IntersectionObserver` on the 6 sections to mark the active dot; click scrolls to the section via `scrollIntoView({behavior: 'smooth'})`.

### Outro section (experience + contact)
- Existing 3-entry experience timeline (Профинанс/FIBO Group, Foreesco Group, Alif Bank — dates and role text unchanged) plus a repeat of the contact row and CV link, styled as the closing full-viewport chapter, numbered "05" in the same system as the case posters (but without a case accent color — uses the shared brand accent).

## Data flow / interactions

- No backend, no data fetching — this remains a fully static file. "Data flow" here is UI state only:
  - `IntersectionObserver` → indicator-nav active-dot state (read-only, derived from scroll position).
  - Click on indicator dot → `scrollIntoView` (writes scroll position).
  - Click on a poster/expand-affordance → toggles that case's `open` class + toggles page-level `scroll-snap-type` (existing `toggleCase()` extended).
  - Mouse move over hero → Matter.js repel force on chip bodies (existing behavior, reused as-is, just over a larger bounding area).
  - `setInterval` clock tick (existing behavior, unchanged, restyled).

## Accessibility & motion

- `prefers-reduced-motion: reduce` continues to disable: physics-chip simulation (chips render statically instead), the hero name reveal animation, and the "open to work" pulse — same pattern as today's CSS/JS already does for the existing chips/typewriter/pill.
- Scroll-snap itself is not disabled under reduced-motion (it's not an autoplaying animation), but the smooth-scroll behavior for indicator-nav clicks (`scrollIntoView({behavior:'smooth'})`) falls back to instant jump under reduced-motion.
- Carries forward the outstanding fixes identified in the prior technical audit as part of this redesign (not optional/deferred): add a real `<h1>` for the name (current heading hierarchy skips straight to h4), fix the two low-contrast issues (body text 3.7:1 and gradient-tag text 1.9:1), add the missing image `alt`, add a `<meta name="description">`.

## Performance

- Every case cover + process image is re-exported/compressed (target: well under the current per-image weights, largest offender today is `namaste-cover.png` at 6.2 MB) and converted to WebP where it reduces size without visible quality loss.
- All below-the-fold images (everything except the hero photo) get `loading="lazy"` and explicit `width`/`height` attributes to prevent layout shift.
- This is required scope for this redesign, since the new full-bleed poster covers make image weight even more load-bearing than in the current grid layout.

## Mobile (< 768px)

- Sections remain full-viewport, scroll-snap stays on (this is a normal, well-understood mobile pattern — vertical Stories-style scrolling).
- Indicator nav collapses to a bottom progress bar (see above).
- Hero chip scatter area is bounded to the visible hero viewport on mobile rather than allowed to roam full width, to avoid chips drifting off-screen and to keep the Matter.js simulation cheap on low-powered devices.

## Testing / verification plan

- Manual pass in a local preview (desktop + mobile viewport widths) covering: scroll-snap sequencing through all 6 sections, indicator-nav click-to-scroll and active-state tracking, expand/collapse of all 4 cases (verifying scroll-snap correctly suspends/resumes), physics-chip drag/repel behavior, clock tick, lightbox open/close on process images, `prefers-reduced-motion` behavior (chips static, no pulse, instant scroll jump).
- Re-run the `impeccable audit` / anti-pattern + Puppeteer performance scan used in the prior audit to confirm the load-time and contrast findings are resolved, not just visually addressed.
- Visual check of all 4 case accent colors against the dark background for contrast (headline/number text, metric values, links) at WCAG AA.

## Open items before implementation

- ~~Photo resolution~~ — resolved. Hero uses `assets/hero-portrait.png` (1086×1448, transparent background, stylized illustration supplied by the user), not the old `assets/photo.jpg` (240×240, unused, left in place). Already background-isolated, no clip-path/mask workaround needed.
- **Exact accent hex values**: the 4 case-accent colors and the shared brand accent are not pinned to specific hex values in this spec — they're a visual-craft decision made during implementation, constrained to: distinct per case, legible (WCAG AA) as text/number color against the existing dark background tokens (`--bg: #0a0a0a`, `--surface: #151515`).

## Explicitly out of scope

- No content/copy rewrites (bio line, case narratives, persona/outcome text, experience entries all carry over verbatim).
- No build tooling / framework migration — stays a hand-authored static HTML/CSS/JS file.
- No new case studies added or removed — same 4 cases.
- No CMS, no backend, no analytics changes.
