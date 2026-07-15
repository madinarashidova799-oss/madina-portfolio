# Portfolio redesign — "Quiet Grid" (v2, supersedes "Scroll Poster Sequence")

## Revision note

This replaces the original "Scroll Poster Sequence" design in this same file. After that direction was prototyped (see the hero mockup work), the user reviewed two new references (emnuel.xyz/me, cerpow.com) and rejected the bold/graphic full-viewport-poster approach as too loud. This version keeps the dark base but is calmer throughout, and changes the work section from full-viewport posters to an image-first grid that links out to separate case pages. Everything under "Explicitly out of scope" and the content-preservation rule from v1 still holds.

## Context

Current site: `index.html` (single static file, no build step, deployed to GitHub Pages from this repo). Dark terminal/dev aesthetic — fixed 380px left sidebar (name, physics-chip tag pile, live MSK clock, coordinates, "open to work" status, contacts, experience) plus a right-hand 2×2 grid of expandable case-study cards (Alif Partners, EAJ Trader, 360 Tracker, Namaste).

Problems this redesign solves:
- The "about me" content is boxed into a narrow sidebar and reads as secondary to the work grid.
- The 4 case studies look like generic, uniform cards — not distinctive or memorable.
- (Carried over from the prior technical audit, in scope for this work): 21.6 MB of unoptimized images with zero lazy-loading, ~68s cold load.

Inspiration reviewed across two rounds:
- Round 1: vldklsnkv.me, anatolyzenkov.com, romina.design/playground, emnuel.xyz (root). Produced the v1 bold-graphic direction, since superseded.
- Round 2 (this version): emnuel.xyz/**me** (the About page specifically — warm, first-person tone; a plain "Timeline" list; a personal "On Loop" section; heavy negative space) and cerpow.com (a dark, dense grid of small square shot thumbnails that reveal a caption on hover, click-through to more detail).

Direction chosen: dark base retained (confirmed explicitly — the user did not want to switch to emnuel's light/white background), calmer and quieter than v1 (no bold shadow-duplicate typography, no bright filled-color pill chips), warmer personal tone in copy, work presented as an image-first grid with hover captions (cerpow-style) that links to dedicated per-case pages rather than expanding inline. No personal "outside of work" section for now (considered and explicitly deferred, not forgotten).

All existing copy (bio line, experience entries, case-study narrative text, persona cards, outcome lists) is preserved verbatim — this is a presentation/structure redesign, not a content rewrite.

## Architecture

**This is now a multi-page static site** (still no build step, no framework — just more hand-authored HTML files):

- `index.html` — hero/about + the 2×2 work grid + experience + contacts. Single page, normal scroll (no scroll-snap, no full-viewport sections — that was v1-specific and is dropped).
- `case-alif-partners.html`, `case-eaj-trader.html`, `case-360-tracker.html`, `case-namaste.html` — one page per case study, each carrying that case's full existing detail content (context, research, persona grid, problem statement, solution, outcome card, images), restyled but not rewritten.

Shared assets (fonts, base tokens, lightbox script) live in a small shared `<style>`/`<script>` block duplicated across the 5 pages (consistent with the project's existing no-build, no-partials authoring model — there is no templating system to share includes, and introducing one is out of scope).

## Components

### Hero / about (on `index.html`)
- Name and role, calm typographic treatment — no shadow-duplicate/offset effect, no aggressive weight jump. Warm, first-person tone in the bio line (copy adjustment, not just layout — still needs the user's actual wording, see Open Items).
- Profile illustration (`assets/hero-portrait.png`, 1086×1448, transparent) stays, composed quietly — no bold accent glow behind it.
- Tag row (prototyped and confirmed): quiet outline chips (thin border, transparent background, muted mono text) laid out as a normal static `flex-wrap` row — no filled bright pills, no full-viewport roam. **The Matter.js physics simulation from v1 is dropped entirely**, replaced by a lightweight cursor-proximity effect: a `mousemove` listener over the tag row reads each chip's live `getBoundingClientRect()` and nudges it a few px away from the cursor (plus a subtle highlight state) when the cursor passes within ~110px, with no rigid-body engine and no CDN dependency. This was a deliberate fallback after the physics engine proved unreliable across environments (chips repeatedly collapsed to position (0,0) because of viewport/layout-timing edge cases) — the simpler cursor-repel effect has no equivalent failure mode since it re-measures on every mouse event instead of once at load, and it fits the calmer direction better regardless.
- Live status badge (MSK clock, coordinates, "open to work") stays, condensed, quiet styling (matches the rest of the calm palette, not a bright accent-colored pill).
- Contacts: Telegram, Email, CV — simple inline row, unchanged.
- Experience timeline (3 entries) stays on `index.html` (no longer needs to be split into a separate "outro" full-viewport section, since scroll-snap sections are gone — it's just the next block on a normally-scrolling page).

### Work grid (on `index.html`)
- 2×2 grid, one tile per case (Alif Partners, EAJ Trader, 360 Tracker, Namaste).
- Default state: **image only** — the case cover image, no visible text.
- Hover state: overlay reveals case name + date/duration (cerpow-style caption-on-hover).
- Each tile is a link (`<a>`) to that case's dedicated page — click navigates away, no inline expand/accordion anymore (removes the v1/current `toggleCase()` JS entirely).
- Touch devices (no hover): caption is always visible in a lighter/smaller form under the image, since there's no hover state to reveal it on tap-only devices — this needs to look intentional, not like a broken hover state.

### Case pages (`case-*.html`, ×4)
- Each page carries that case's full existing detail content verbatim (all numbered blocks: context, research, personas, solution, outcome), restyled to the calmer palette.
- Each case keeps a distinguishing accent color from a small fixed palette (one per case), but **muted/desaturated** rather than the bright saturated colors from v1 — used sparingly (a heading accent, the outcome-list checkmarks, links), not as a loud background wash.
- Simple back-to-work link/nav at the top (and/or bottom) of each case page, since there's no shared header/nav component across pages.
- Lightbox behavior for process images (click to enlarge) carries over unchanged from the current site.

## Data flow / interactions

Still fully static, no backend. UI state is local to each page:
- Hover on a grid tile → CSS-only caption reveal (no JS needed beyond what's already there).
- Click on a grid tile → normal navigation to the case's own HTML page.
- Physics-chip mouse-repel and clock tick — same mechanism as today, just restyled.
- Lightbox open/close on case pages — same mechanism as today (`openLightbox`/`closeLightbox`), duplicated per case page.

## Accessibility & motion

- `prefers-reduced-motion: reduce` still disables the tag row's cursor-repel effect and any pulse/reveal animation, same as before.
- Touch-device caption fallback (see Work grid, above) is itself an accessibility concern: hover-only content is invisible to touch and to keyboard-only navigation, so the caption must also be reachable/visible on focus (`:focus-within` alongside `:hover`) for keyboard users tabbing through the grid links.
- Carries forward the outstanding fixes from the prior technical audit, unchanged from v1: real `<h1>` for the name, fix low-contrast text (body 3.7:1 and gradient-tag 1.9:1), add the missing image `alt`, add `<meta name="description">` (now needed on all 5 pages, not just one).

## Performance

- Unchanged from v1: every case cover + process image gets compressed/converted (largest offender `namaste-cover.png` at 6.2 MB), `loading="lazy"` + explicit `width`/`height` on everything below the fold. Still required scope, not optional.
- Splitting into 5 pages is itself a performance improvement over v1's single-page approach: a visitor only downloads one case's process images at a time (on that case's own page) instead of all 4 cases' images on first load.

## Mobile (< 768px)

- Grid likely drops to 1 column (single case per row) — standard responsive collapse, no special interaction needed since there's no scroll-snap sequence to adapt anymore.
- Touch caption fallback (always-visible, smaller caption under each image) applies here primarily, since mobile is all touch.
- The tag row is a normal wrapping flex row at every width, so it needs no special mobile handling; the cursor-repel effect simply has no effect on touch (no `mousemove`), which is fine — it was always a cosmetic extra, not load-bearing content.

## Testing / verification plan

- Manual pass covering: grid hover caption reveal and focus-visible fallback, grid tile navigation to each of the 4 case pages, back-navigation from a case page, tag-row cursor-repel behavior, clock tick, lightbox on each case page, `prefers-reduced-motion` behavior, responsive collapse at mobile widths.
- Re-run the `impeccable audit` / Puppeteer performance scan across all 5 pages (not just the homepage) to confirm load-time and contrast findings are resolved on every page, not only the entry point.

## Open items before implementation

- **Warmer copy pass**: the user wants a "warmer, first-person tone" (per the emnuel.xyz/me reference) but hasn't supplied new wording yet. The existing bio line and case narratives are professional/neutral in register. Needs a short conversation with the user about what to actually change in the copy itself before or during implementation — this spec covers structure/visuals, not the rewritten sentences.
- **Muted accent hex values**: as in v1, the 4 case accent colors (now desaturated/muted rather than bright) and the shared brand accent aren't pinned to specific hex values here — implementation-time visual-craft decision, constrained to: distinct per case, muted/quiet (not saturated), legible at WCAG AA against `--bg: #0a0a0a` / `--surface: #151515`.
- **Case page shared layout**: since there's no templating system, the 5 pages will share a copy-pasted base (fonts, tokens, lightbox script). If this duplication becomes hard to maintain, that's a signal for a future follow-up (e.g. a tiny build step), not something to solve in this pass.

## Explicitly out of scope

- No content/copy rewrites beyond the warmer-tone pass noted above as an open item — case narratives, persona/outcome text, experience entries otherwise carry over verbatim.
- No build tooling / framework migration — stays hand-authored static HTML/CSS/JS, just more files than before.
- No new case studies added or removed — same 4 cases.
- No personal "outside of work" section (considered, explicitly deferred by the user).
- No CMS, no backend, no analytics changes.
