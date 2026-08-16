# Handoff — Madina Rashidova portfolio site (v5, rewritten) — continuing from this session

**This file replaces an older `handoff-5.md`** that was sitting in this same directory (dated Aug 16, describing an earlier "Alif Partners redesigned across ~6 rounds" session). That content is now historical — everything it described is several rounds behind what's live today. This is a full rewrite reflecting the actual current state, written because the user asked directly for a fresh handoff after a push to production.

**Where this file lives**: `/Users/madinarasidova/Library/Mobile Documents/com~apple~CloudDocs/Inter/madina-portfolio/handoff-5.md`. This is the WORK folder — the only place you should edit site files. See the next section for a correction to how earlier handoffs described the "deploy" situation.

---

## 🚨 READ THIS FIRST — the "two diverged copies" situation, corrected

Earlier handoffs (`handoff-3.md`/`handoff-4.md`, both in `/Users/madinarasidova/madina-portfolio-deploy/`, and the old `handoff-5.md`) described `.../madina-portfolio-deploy/` and this WORK folder as two unrelated copies that must never be merged, with deploy being an untouchable black box.

**That was incomplete.** Both directories are actually git clones of the **exact same GitHub remote** (`https://github.com/madinarashidova799-oss/madina-portfolio.git`, branch `main`). They are not two different products — they're two local checkouts of one repo that had simply drifted apart because each was pushed to/pulled from independently across many sessions.

This session discovered that WORK folder's local `main` was **4 commits behind `origin/main`**, while carrying its own large set of uncommitted changes (everything from many rounds of typography/spacing/result-card/about.html work). A real `git merge` was attempted (tested first on a disposable branch — see below), produced conflicts in exactly 5 files (`about.html` + all 4 case pages), and was resolved **in favor of the WORK folder's version** for all 5, because:
- All binary image assets and `index.html` were confirmed byte-identical between WORK's working tree and `origin/main` before resolving — nothing origin had was actually different there.
- Origin's 4 commits (`332b386`, `ff49300`, `c0ab597`, `a315018`) were earlier stages of the *same* redesign work that WORK folder had since carried much further (verified in-browser at every round).

**Current state**: WORK folder's `main` is merged, committed (`995e755`), and **pushed** to `origin/main` with the user's explicit go-ahead. `git status` is clean.

**What this means for the deploy folder now**: `/Users/madinarasidova/madina-portfolio-deploy/` is a separate local clone of the same remote, and as of this push it is **behind** `origin/main` by 2 commits (it was at `a315018`; origin is now at `995e755`). It has its own uncommitted junk (`.DS_Store`, `.github/skills/`, `assets/About me/`, `handoff-1/2/3.md`) unrelated to WORK folder's untracked files. **Still do not edit files there.** If anyone ever needs it in sync, that's a `git pull` in that directory specifically — not something done as a side effect of WORK folder work, and not something to do without asking first (pulling into a directory with its own untracked cruft could theoretically surface its own conflicts, though none are expected since deploy has no local file modifications, only untracked non-site files).

## Git state — pushed, live, working tree clean

- Branch: `main`, up to date with `origin/main`.
- Last commit: `995e755eb8080d9809fe5da928a2544090be1c9e` — "Merge origin/main: keep local redesign as authoritative for case pages and about.html".
- One commit below it, `9ac1b51` ("TEMP snapshot for merge-conflict test"), is a real commit in history now (it's what got merged) — the message is inaccurate-sounding but harmless; it's exactly the round-4 typography/spacing/result-card/about.html work described below. Not worth rewriting history to fix a commit message.
- **GitHub Actions**: "Deploy static site to Pages" workflow ran on this push and completed successfully (all green, ~13s). Confirmed the live site actually serves the new content (spot-checked `about.html` and `case-eaj-trader.html` for round-4 markup).
- **Live site**: https://madinarashidova799-oss.github.io/madina-portfolio/
- Note: `gh api repos/.../pages` reports a stale `status: errored` field — that's a leftover from an old Jekyll-style build attempt dated 2026-07-02, unrelated to this repo's current `build_type: workflow` deploys. Don't be alarmed by it; the actual Actions runs are what matter, and they're green.
- **Do not commit or push again without the user explicitly asking.** She's asked and given explicit go-ahead twice this session (once for the merge commit, once for the push) — treat each as a one-time approval, not standing permission.

**Untracked files present in WORK folder** (deliberately left untracked, not site content):
- `.impeccable/` — Impeccable skill's local config + one stale critique file (`.impeccable/critique/2026-08-10T12-41-39Z__about-html.md`, run against a much older version of `about.html` — do not treat its findings as current).
- `.DS_Store`, `assets/process/.DS_Store` — macOS cruft.
- `assets/eaj trader new.png` — a stray file with spaces in its name, not referenced anywhere, flagged by an earlier session as possibly a leftover duplicate. Still not deleted; not this agent's call without asking.
- `handoff-4.md`, `handoff-5.md` (this file) — session handoffs, not site content.
- `portfolio_cases_rewrite.md`, `Тексты кейсов.docx` — the user's own source-copy documents, not generated by any agent session.
- `PRODUCT.md`/`DESIGN.md` — these ARE tracked and current (`PRODUCT.md` updated by the merge this session; `DESIGN.md` last touched Aug 10, unrelated to this round's work).

## What was done this session (do not redo)

A single large combined instruction asked for two things: (A) a shared typography/spacing/result-card pass across all 4 case pages, and (B) a full rework of `about.html`. Both were completed and verified in-browser at 1440/1024/768/390px before any git activity.

### A. Shared changes applied identically across all 4 case pages
(`case-alif-partners.html`, `case-eaj-trader.html`, `case-namaste.html`, `case-360-tracker.html`)

- **Typography rescale** (single project H1 stays dominant, everything else pulled back):
  - `h1.case-title`: `clamp(44px, 4.5vw, 68px)`, weight 700, line-height 1.02 (was up to 96px).
  - `.case-headline` (task line under the H1): `clamp(24px, 2.2vw, 34px)` desktop/tablet, weight 600; **`@media (max-width:560px)` override to `clamp(25px, 6vw, 30px)`** — added specifically because the base clamp floors at 24px on mobile, 1px under the user's stated 25–30px mobile range. Small but deliberate fix, don't remove it thinking it's redundant.
  - `.detail-head h2` (section heading): `clamp(25px, 2vw, 32px)`, weight 600, line-height 1.2.
  - `.detail-kicker` (section subtitle): `clamp(18px, 1.4vw, 22px)`.
  - `.case-dek` / `.detail-block p` (body text): `clamp(17px, 1.15vw, 20px)`, line-height 1.55.
- **Spacing rhythm**: `.detail-block` margin-top (between major sections) changed to `clamp(80px, 8vw, 120px)` desktop with a `@media (max-width:720px)` override to `clamp(56px, 10vw, 72px)` mobile (was a flat `clamp(96px,9vw,128px)` with no mobile-specific step-down). `.detail-head` margin-bottom to `clamp(24px, 2.4vw, 32px)` (was a flat 48px). Paragraph `margin-bottom` to `clamp(20px, 2vw, 24px)` (was flat 18px).
- **Result cards — colored border removed everywhere**: `.result-card` no longer has any `border-top`/border in the page's accent color (was yellow on Alif, blue on EAJ, navy on Namaste, violet on 360 Tracker). The accent now lives as a small 16×2px line via `.result-card__label::before`, next to the "Показатель" label — never a border around the card. Verified computed `border-top-color` is the neutral glass rgba on all 4 pages.
- **Alif Partners only**: removed two redundant `<p class="detail-kicker">` subtitles that just repeated content already in the adjacent text — "Партнёр ведёт заказ сам, банк проверяет" (under "Гипотеза") and "Админка вокруг реальной работы партнёра" (under "Решение"). Checked every other kicker on all 4 pages for the same pattern; none of the others were judged to be pure duplicates, so nothing else was removed — don't assume more need pruning without a fresh look.
- **EAJ Trader only**: the old `.concept-check` block (a two-column "Карточки / Таблица" comparison sitting above the slider, duplicating text visible in the slider itself) was deleted entirely and replaced with a single compact caption directly above `.compare-slider`: "Проверка концепций · 5 участников" — 16–18px, weight 500, color `var(--accent-blue)` (#1B60D9), 12–16px gap to the slider frame. The slider itself (drag, arrow keys, both images) was untouched and re-verified working (drove it programmatically, confirmed `--pos` custom property updates).

### B. `about.html` rework
- `h1.about-title` rescaled to the same case-page H1 scale: `clamp(44px, 4.5vw, 68px)`, weight 700 (was up to 80px).
- Photo collage: trimmed from 4 hand-drawn arrows + 4 captions down to **exactly one** — a single graphite curved arrow pointing at the portrait photo, with the caption "это я". The other 3 arrows/captions (работа/люди/природа) and all their CSS were deleted. The `IntersectionObserver`-driven entrance animation (photo offset+rotation → arrow stroke-draw → caption clip-path reveal) was re-verified working with the reduced element count.
- "За пределами макетов" section: rewritten to the user's shorter 2-paragraph copy, laid out as a two-column grid — text left, two compact Telegram cards stacked right on desktop (`.outside-grid`, `minmax(0,1fr) minmax(240px,320px)` at `≥900px`), single column with cards below text on mobile.
- Telegram cards (`.tg-card--earworm` / `.tg-card--designer`) fully restyled: flat solid backgrounds (`#FDE058` / `#7C9DCB`, no gradients), no avatar images/circles, equal height (`min-height:208px`), whole card clickable, hover lifts 3px with a stronger shadow. Confirmed both have high text/background contrast (≈13:1 and ≈10:1 respectively) and are keyboard-focusable (they're real `<a>` elements).

### One noteworthy real bug fix, carried over from an earlier round of this same body of work (already live, just worth knowing about if you touch `case-360-tracker.html`'s tables again)
The `.compare-table th, .compare-table td` rule needed `position: relative`, otherwise the visually-hidden `.sr-only` "Да"/"Нет" accessibility spans inside table cells (no positioned ancestor) resolved their containing block against the viewport instead of their own cell, escaped the table's `overflow-x:auto` clipping, and inflated the whole page's `scrollWidth` on mobile. Fixed, verified `scrollWidth === innerWidth` at 390px. If this rule ever gets refactored, keep the `position: relative` or re-verify mobile scrollWidth by hand.

## ⚠️ Unfinished — the user's most recent substantive request, interrupted by the push/handoff ask

Right before asking for the push, the user sent a **full typography audit request**, invoking `/impeccable`, `/anthropic-skills:copy-editing`, and `/anthropic-skills:copywriting` together, framed as: "Проведи полный аудит типографики портфолио, ориентируясь на принципы Impeccable... Не делай локальные исправления отдельных экранов. Создай единую типографическую систему и примени её ко всем кейсам и странице «Обо мне»." Her message cut off mid-sentence at "1. Иерархия заголовков" / "На странице кейса должен быть только один H1... Название проекта остаётся самым заметным элементом, но не должно занимать половину экрана."

The `impeccable` skill was invoked and returned its routing/setup instructions (context.mjs, playbook selection, etc.), but **no audit work was actually done** — the user's very next message pivoted straight to "push everything, write a handoff," and everything since has been git/deploy work, not the audit.

**This is very likely still what she wants next.** Two things worth noting if you pick this up:
1. Her stated H1 requirement ("only one H1, stays prominent, never half the screen") is **already satisfied** by this session's typography rescale (h1 caps at 68px, single H1 per case page) — so a chunk of what she's asking for may already be done. Confirm with her rather than assuming, since her message was cut off and might have had more specific asks after item 1.
2. Run `node .agents/skills/impeccable/scripts/context.mjs` (per the skill's own setup step) before doing anything else if you do pick this up — it loads `PRODUCT.md`/`DESIGN.md`/surface briefs and tells you which playbook to load. Don't skip it because "it looks like a one-liner."

## Key facts worth not re-deriving

- Site is static HTML/CSS/JS, no build step. Every page has its own inline `<style>` block(s); shared JS is `assets/i18n.js`, `assets/case-nav.js`, `assets/lightbox.js`, `assets/typography.js` + `assets/typography.css` (nbsp/orphan/widow handling — this file only touches wrapping/breaking, never font-size/color/spacing, so it can't fight page-level tokens).
- i18n: `data-lang="ru"/"en"` sibling spans, toggled via `html.lang-en` class set by `assets/i18n.js`, persisted in `localStorage['site-lang']`.
- Cyclical case order: Alif Partners → EAJ Trader → Namaste → 360 Tracker → Alif Partners.
- Never use em/en dashes in user-facing text (checked and enforced across every round of this project).
- CSS specificity gotcha specific to this codebase: a generic rule like `.detail-block p { margin-bottom: 18px }` will silently beat a same-specificity single-class override. Fix pattern used throughout: scope overrides with the parent class too (e.g. `.result-card .result-card__desc`, `.detail-block .slider-caption`).
- Local preview: `python3 -m http.server <port>` from this exact WORK folder path, then verify with the Browser-pane tools (`resize_window`, `javascript_tool` for computed-style checks — don't just eyeball screenshots for spacing/sizing, measure with `getComputedStyle()`/`getBoundingClientRect()`). `window.scrollTo(x,y)` (two-arg form) is silently overridden by the site's `html{scroll-behavior:smooth}` — use `window.scrollTo({top,behavior:'instant'})` instead.
- **Never commit, push, or touch the deploy folder without the user's explicit, per-instance go-ahead** — this remains the standing rule regardless of what got approved earlier in any session.
