# Handoff — Madina Rashidova portfolio site (v5) — continuing from handoff-4

**Written by**: the agent session that picked up `handoff-4.md`, closed out its remaining gaps (1920×1080 check, `about.html` critique), then did a full point-release redesign of the Alif Partners case study across ~6 successive rounds of user feedback, fixed a couple of real environment bugs along the way, and pushed everything to GitHub. Writing this because the conversation is long and a fresh agent will need to continue.

**Where this file lives**: same place as `handoff-4.md` — `/Users/madinarasidova/Documents/madina-portfolio/handoff-5.md`. **Not** in `/Users/madinarasidova/madina-portfolio-deploy/`. See the next section — it's unchanged and still the most important thing in this document.

---

## 🚨 READ THIS FIRST — two diverged local copies of the same repo (still true, still unresolved)

Exactly the situation `handoff-3.md`/`handoff-4.md` described, unchanged:

1. **`/Users/madinarasidova/madina-portfolio-deploy/`** — has the metrics-table/business-goal-block changes from `handoff-2.md`'s era. **Never open, edit, or touch this directory.** Not even to add a file.
2. **`/Users/madinarasidova/Documents/madina-portfolio/`** — **this is the only directory you should work in.** Everything below refers to this copy.

Neither copy has been merged with the other. This is a decision only the user (Мадина) can make. Do not attempt to merge them. Do not assume one supersedes the other.

## Git state — pushed, working tree otherwise clean

Last push this session: commit `2b7ef8c` ("Redesign Alif Partners case study and add scroll-aware nav across case pages"), pushed to `origin/main` at the user's **explicit** request ("запушь в github все последние изменения"). Before that, `origin/main` was at `6fd1896` (the last push from handoff-4's session). Branch is up to date with remote, nothing staged, nothing modified.

**Untracked files present, deliberately left untracked** (same convention as handoff-4, now also covering one new item):
- `.claude/`, `.impeccable/` — tool-internal config, not site content.
- `.DS_Store` — macOS cruft.
- `handoff-4.md`, `handoff-5.md` (this file) — session handoffs, not site content. Don't commit them.
- `assets/eaj trader new.png` — **a stray duplicate, almost certainly a leftover from a botched `cp` in an earlier session.** It has spaces in its filename, sits directly in `assets/` (not `assets/process/`), is not referenced by any HTML, and is byte-*different* from the correct, in-use `assets/eaj-trader-cover.png` despite being nearly the same size. Flagged to the user this session; not deleted (wanted a human decision first, since its origin/purpose wasn't 100% certain). Safe to delete once confirmed unneeded — just isn't this agent's call to make unilaterally.

**Do not commit or push without the user explicitly asking again** — the same one-time-approval rule as always applies. She asked once this session and got a direct yes/no exchange before it happened; that authorization does not extend to future changes.

## What's already done since handoff-4 (do not redo)

### 1. Closed out handoff-4's open gaps
- **1920×1080 breakpoint** — checked live across all four homepage project scenes (Alif/EAJ/Namaste/Tracker). Clean, no overlaps.
- **`about.html` full critique** — ran the Impeccable dual-agent critique (`18/24`, "Good"). Implemented all P1–P3 findings: added a stats rail (since 2022 / 4 cases / 3 domains) to fix desktop dead-space, added one-line descriptors to the four case links, de-duplicated the "Опыт" text against the homepage accordion (now links to a new `index.html#experience` anchor instead of restating imprecise dates), gave "Связаться" its own visual weight, fixed a missing `:focus-visible` on the nav wordmark, added list semantics to the tools tags, added a `prefers-reduced-motion` block. Caught and fixed a real bug of my own along the way: `flex-shrink: 0` on `.about-page` caused horizontal overflow at mobile widths — fixed with `min-width: 0; flex: 1 1 auto`.
- Sitewide Inter-font "AI-slop" detector flag — **deliberately not touched**. Font changes need explicit user sign-off per `DESIGN.md`'s own rule; flagged, not silently fixed.

### 2. EAJ Trader cover — replaced, then fully re-composed (two separate user requests)
- First: the actual photo file was replaced (`assets/eaj-trader-cover.png`, sourced from `Портфолио/reference/Eaj trader new.png`).
- Then the user asked for a structural redesign, not just a new photo: EAJ's homepage scene now abandons the shared full-bleed-photo-with-overlay-text pattern the other three project scenes use. It's a real two-column split (image ~62%, text ~38%, `object-fit: contain`, pure `#000` background matched to the photo's own sampled-flat-black background) on desktop, and a contain-fit (not cover) image-top/text-below split on mobile — see `index.html`'s `.project-showcase--eaj` rules, all scoped to that one project, other three scenes untouched.

### 3. Case-page fixed nav — real bug found and fixed sitewide (all 4 case pages)
The top nav (`.site-nav`) is a permanently-opaque fixed pill with no scroll awareness — on a long case page it will eventually sit on top of *any* content as the user scrolls, not just the one spot a user screenshot happened to catch (an Alif Partners metrics card, mid-word-clipped). Fixed properly, not spot-patched: `.site-nav` now hides on scroll-down and reappears on scroll-up/near-top, implemented once in shared `assets/case-nav.js` (`initNavAutoHide`) plus matching CSS in each of the 4 case pages' own `<style>` blocks (`.site-nav.is-nav-hidden`). Keyboard-focus safeguard included — focusing into the nav while hidden un-hides it. Homepage nav (`index.html`) was **not** touched; this is case-pages-only.

### 4. Alif Partners case study — the bulk of this session, across ~6 rounds of iterative feedback
All changes are scoped to `case-alif-partners.html` only; no other case page was touched in this round.

- **Context metrics** (`70 000+` / `500+` / `$1 млрд`): rebuilt as a real `grid` (was `flex`), bigger numbers, bigger padding, `40px` gap from the preceding text (desktop; `32px`/`24px` at tablet/mobile), 3→auto-fit→1 column adaptive collapse.
- **Removed** the stale image in the Context section (`alif-context.png`, deleted from disk, no longer referenced anywhere).
- **7 process images replaced** with real product screenshots the user supplied from `~/Desktop/Портфолио/Alif partners/`: Table.png→Исследование, "Новая структура амдминки.png" (note: the *source* file has a typo in its own name; the destination asset was named correctly) →04, Chat.png (later replaced again with "Chat new.png", then again with an even-newer "Chat.png" — **the file at `assets/process/alif-chat.png` is current as of this session's last edit**) →05, Товар.png→06, add.png→07, Доставки.png→08, Mobile.png→09. All seven arrived with transparent backgrounds (real window-capture crops with baked-in drop shadows) — added a shared `.detail-media-frame` treatment (and padding on the existing `.detail-pair-media`) so they sit on a `--surface` card instead of floating with naked transparency. Two now-orphaned old assets (`alif-interviews.png`, `alif-solution.png`) deleted from disk.
- **Full auto-layout spacing pass**: `.detail-block` sections now `96–128px` apart (was `56px`), `.detail-head` margin-bottom standardized to `48px`, text→media gap floored at `32–40px` via `.detail-media-frame`/`.detail-pair` margins.
- **"Результат" section — went through three distinct designs in one session, each superseding the last**:
  1. First: a lead claim + subtitle inside a bordered/backgrounded card, plus 3 result cards + a "Граница решения" note.
  2. User called the card "too empty/bulky" → rebuilt as an editorial two-column composition (thesis left ~58%, explanation right ~37%, no box at all).
  3. User then asked to remove the two-column composition entirely → now it's **one plain paragraph** after the "Результат" heading, nothing else. The 3 result cards and the "Граница решения" note (from round 1) were **never touched** across any of these three redesigns and are still there, unchanged.
  4. Final follow-up: that one paragraph originally had a manually-set `20–24px` font size; the user asked to remove that and make it typographically identical to the rest of the case's body paragraphs. Done — it now inherits `.detail-block p`'s styling with zero overrides except spacing (see gotcha below).
- **"Ожидаемый эффект" → "Как измерить эффект"**: renamed, rewritten intro text, the old 5-item checklist-style list replaced with a `2×2` grid of 4 metric cards (`.metric-grid`/`.metric-card`). These cards *also* went through a reorder: originally accent-pill-then-caption, now caption-then-accent-pill per explicit user request, with exact gap values (`32px` sentence→caption, `10px` caption→accent) verified programmatically, not eyeballed.
- **Section 12 "Вывод" — deleted entirely** (heading, text, dividers, the old bottom `← Все работы` link), along with its now-dead `.case-conclusion` CSS rule.
- **Bottom floating nav rebuilt**: added a new "Главная страница" pill (`.case-home`, same glass/shape/sizing as the existing `.case-like`/`.case-next`, left-arrow glyph reusing the sitewide plain-text-arrow convention, not a new icon), placed first in the dock. Order is now Главная → Нравится → Следующий кейс. Added `flex-wrap` to `.case-floating-nav` as a safety net — it visibly wraps to 2 lines at ~1024px tablet width in exchange for zero horizontal scroll at any width, which is correct per the brief ("переходить в вертикальное расположение или корректно переноситься").

### 5. FIX-REPORT.md
Got a "Раунд 4" addendum documenting the EAJ-cover/Namaste-hover/auto-layout/orbit/em-dash/accordion work from *handoff-4's* session (it was stale — said the cover swap hadn't happened, which was no longer true by the time I picked this up). This session's own Alif Partners work was **not** added to `FIX-REPORT.md` — that file tracks homepage/sitewide rounds, and this session's work was entirely scoped to one case page; if the user wants a written record of it, it'd make more sense as its own addendum than jammed into the existing "Раунд 4" structure.

## Real bugs found this session (useful pattern-matching for next time)

1. **Flex/grid containers never collapse margins between children** — normal CSS margin-collapsing (adjacent-sibling margins merge to the larger value) only happens in *normal block flow*. The moment a container is `display: flex` or `display: grid`, that stops applying, and margins on adjacent children **add together** instead. This bit me twice: once between `.metric-card__sentence` and `.metric-card__caption` (got `50px` instead of the requested `32px` because the generic `.detail-block p { margin-bottom: 18px }` rule was *also* matching that `<p>` and stacking with my new `margin-top`), and once in an earlier `.result-summary` card version with the same root cause. **If you add spacing via margin inside a flex/grid container on this page, check whether the element is also a `<p>` matched by the generic `.detail-block p` rule** — it very likely is, and its `margin-bottom: 18px` will silently stack unless neutralized.
2. **CSS specificity trap, same root cause**: `.detail-block p` has specificity `(0,1,1)` (one class + one type selector). A single-class override like `.metric-card__sentence { margin-bottom: 0; }` at `(0,1,0)` **loses** to it regardless of source order. Fix used throughout this session: scope the override with the parent class too, e.g. `.metric-card .metric-card__sentence { margin-bottom: 0; ... }` (`(0,2,0)`, unambiguously wins). Same pattern was needed for `.result-lead__text` and now `.detail-head.detail-head--tight`.
3. **The local static server (`python3 -m http.server 8000`) went stale mid-session** — started returning `404` for *every* path, including `/`, even though the files on disk were completely correct and `lsof` reported the right `cwd`. Best working theory: the server's cwd handle got orphaned (classic Unix gotcha — a process's cwd can become a dangling reference if the directory it points to gets removed/recreated while the process is alive, even if a new directory with the identical path is created immediately after). Fix was just to kill and restart the server (`kill <pid>`, then `cd .../madina-portfolio && python3 -m http.server 8000 &` again) — instant fix, no data was ever at risk since it's a read-only static file server. **If `curl -sI localhost:8000/` (or any known-good file) 404s and the files definitely exist, don't debug the site — restart the server.**
4. **The Browser pane aggressively caches images by URL, and separately, individual tabs in this session occasionally got stuck rendering a tiny/broken frame** (screenshots came back correctly proportioned but at ~40% scale in a mostly-blank canvas, even though `window.innerWidth`, root font-size, and all computed styles queried as completely normal). Fix for image caching: append a throwaway `?v=N` query string when navigating after an asset swap. Fix for the stuck-tiny-render tab: don't debug it, just open a **new** tab (`tabs_create` + `navigate`) — it rendered correctly immediately. Both of these are almost certainly this specific tool's quirks, not anything about the site.

## What's likely still worth doing (not urgent, not requested yet — just visible gaps)

- **The stray `assets/eaj trader new.png`** flagged above — worth deleting once the user confirms it's not needed for anything.
- **`prefers-reduced-motion`** is, as in every prior round, still only verified by reading the CSS/JS gate logic, never by an actual OS-level toggle in this browser tool. Keep stating this limitation honestly.
- **A dedicated critique pass has now been done for the homepage and `about.html`**, but the 4 case-study pages themselves (`case-eaj-trader.html`, `case-namaste.html`, `case-360-tracker.html` specifically — `case-alif-partners.html` just got extensively hand-edited, which isn't the same as a structured critique) have never had one. Worth asking the user if they want that next, given how much iteration Alif Partners alone needed once someone actually looked closely.
- **FIX-REPORT.md has no record of this session's Alif Partners work.** Mentioned above — flag it, don't add it speculatively.

## Key facts worth not re-deriving (still true from handoff-3/4, plus updates)

- Site is static HTML/CSS/JS, no build step, no shared external CSS file — every page has its own inline `<style>` block(s). Shared JS: `assets/i18n.js`, `assets/case-nav.js` (now also owns the case-page nav-hide-on-scroll behavior), `assets/lightbox.js`.
- i18n: `data-lang="ru"/"en"` sibling spans (inline content) + `data-lang-block="ru"/"en"` (block-level content) — both driven by `html.lang-en`, toggled by `assets/i18n.js`, persisted in `localStorage['site-lang']`.
- Cyclical case order (unchanged): Alif Partners → EAJ Trader → Namaste → 360 Tracker → Alif Partners.
- `index.html` now has an `id="experience"` anchor on `.experience` (with `scroll-margin-top` matching the existing fixed-nav safe-area token) — `about.html` links to `index.html#experience` instead of restating employer dates.
- To preview locally: `python3 -m http.server 8000` from the project root (check it's actually alive with `curl -sI localhost:8000/` before assuming it is — see gotcha #3 above), then this environment's Browser-pane `preview_start`/`navigate`. Append `?v=<anything>` after any asset/image swap to dodge browser image caching. Prefer opening a **fresh tab** over reusing one that's misbehaving.
- Verify scroll-position-dependent CSS via the `document.documentElement.style.marginTop` hack, not real scroll — this remains true across every single round of this project in this specific browser tool. For anything gap/spacing-sensitive, don't just eyeball a screenshot — measure with `getBoundingClientRect()` / `getComputedStyle()` and diff against the literal pixel target the user gave. Two of this session's bugs (see above) would have shipped wrong if only checked visually.
