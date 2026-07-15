# Quiet Grid Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `madina-portfolio-deploy` from a single-page dark/terminal site with an inline expand-in-place work grid into a calmer, warmer multi-page static site: a quiet hero + image-first 2×2 work grid on `index.html`, linking out to four dedicated case-study pages, with the outstanding image-weight and accessibility issues from the prior audit fixed along the way.

**Architecture:** Five hand-authored static HTML files (`index.html` + 4 `case-*.html` pages), each self-contained (no shared includes, no build step, no framework — consistent with the project's existing authoring model). A documented shared "page shell" (design tokens, fonts, lightbox script) is duplicated verbatim across all five files. All existing bio/experience/case-narrative copy is preserved verbatim; only structure, visuals, and image assets change.

**Tech Stack:** Plain HTML5 + CSS custom properties + vanilla JS. Google Fonts (Bricolage Grotesque, Spline Sans Mono) via `<link>`. No new runtime dependencies. Image optimization uses `sharp` as a one-time local authoring tool (not a site dependency).

## Global Constraints

- Dark base only: `--bg:#0a0a0a`, `--surface:#131313`, `--line:#232323`, `--text:#e8e6e2`, `--text-dim:#8f8b84`, `--text-dim-2:#625d56`, `--accent:#b8836a`, `--live:#34c759` (semantic "open to work" indicator — never repurposed as a decorative accent).
- No build tooling, no framework, no bundler, no CSS/JS shared-include mechanism — every page is a complete standalone file.
- All existing copy (bio line, experience entries, case narratives, persona/outcome text) carries over verbatim — no rewriting sentences.
- No personal "outside of work" section (explicitly deferred by the user).
- Every image below the fold gets `loading="lazy"` and explicit `width`/`height` attributes.
- Every page needs: a real `<h1>`, a `<meta name="description">`, and every `<img>` needs non-empty `alt` text.
- Text contrast must clear WCAG AA (4.5:1 body text, 3:1 large text/headings) against `--bg`/`--surface`.
- `prefers-reduced-motion: reduce` disables the tag-row cursor-repel effect, the "open to work" pulse, and the hero name typewriter reveal.
- The Matter.js physics chip pile from the old site is **not** carried over — replaced by the lightweight cursor-repel effect specified in Task 3.

---

## File structure

| File | Responsibility |
|---|---|
| `index.html` | Hero (tags, name, photo, status, bio, contacts), 2×2 work grid, experience timeline, footer |
| `case-alif-partners.html` | Full case detail for Alif Partners (accent: muted blue `#6b84b8`) |
| `case-eaj-trader.html` | Full case detail for EAJ Trader (accent: muted sage `#8a9a6b`) |
| `case-360-tracker.html` | Full case detail for 360 Tracker (accent: muted teal `#6ba39a`) |
| `case-namaste.html` | Full case detail for Namaste (accent: muted ochre `#b89a5a`) |
| `assets/*.png`, `assets/process/*.png` | Existing images, resized/recompressed in place (same filenames, no reference changes needed) |
| `assets/hero-portrait.png` | Already added in a prior session — hero illustration, used as-is |
| `cv.pdf` | Unchanged |

The old `index.html` (single-page, expand-in-place cards, sidebar) is fully replaced — its markup/CSS is not reused, but every sentence of its copy is transplanted into the new files.

---

## Task 1: Optimize image assets in place

**Files:**
- Modify (binary, in place, same filenames): `assets/alif-partners-cover.png`, `assets/eaj-trader-cover.png`, `assets/360-tracker-cover.png`, `assets/namaste-cover.png`, and all 22 files under `assets/process/*.png` / `assets/process/*.jpg`
- Create (temporary tooling, not committed): a local scratch directory with an `optimize-images.mjs` script

**Interfaces:**
- Consumes: nothing (this is the first task)
- Produces: every file under `assets/` at a width capped to 1600px and re-encoded, so every later task can assume images are already lightweight — no task after this one touches image bytes

- [ ] **Step 1: Install `sharp` as a one-off local tool (not a site dependency)**

Run in a scratch directory outside the repo (e.g. `/tmp/img-tools`):

```bash
mkdir -p /tmp/img-tools && cd /tmp/img-tools && npm init -y >/dev/null 2>&1 && npm install sharp --no-audit --no-fund
```

Expected: `sharp` installs without error (`added N packages`).

- [ ] **Step 2: Record the before size**

```bash
du -sh /Users/madinarasidova/madina-portfolio-deploy/assets
```

Expected: prints the current total (baseline was 21M in the prior audit — confirm it's still in that range before optimizing).

- [ ] **Step 3: Write the optimization script**

Create `/tmp/img-tools/optimize-images.mjs`:

```js
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/madinarasidova/madina-portfolio-deploy/assets';
const MAX_WIDTH = 1600;

function walk(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(full));
    else if (/\.(png|jpe?g)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const files = walk(ROOT).filter(f => !f.includes('hero-portrait'));

for (const file of files) {
  const buf = fs.readFileSync(file);
  const meta = await sharp(buf).metadata();
  const isPng = /\.png$/i.test(file);
  let pipeline = sharp(buf);
  if (meta.width > MAX_WIDTH) pipeline = pipeline.resize({ width: MAX_WIDTH });
  const out = isPng
    ? await pipeline.png({ quality: 82, compressionLevel: 9 }).toBuffer()
    : await pipeline.jpeg({ quality: 78, mozjpeg: true }).toBuffer();
  const before = buf.length, after = out.length;
  if (after < before) {
    fs.writeFileSync(file, out);
    console.log(path.basename(file), (before / 1024).toFixed(0) + 'KB ->', (after / 1024).toFixed(0) + 'KB');
  } else {
    console.log(path.basename(file), 'skipped (optimized version was not smaller)');
  }
}
```

- [ ] **Step 4: Run it**

```bash
cd /tmp/img-tools && node optimize-images.mjs
```

Expected: one line per file showing a size reduction (e.g. `namaste-cover.png 6188KB -> 380KB`); no thrown errors.

- [ ] **Step 5: Verify the total dropped and nothing broke**

```bash
du -sh /Users/madinarasidova/madina-portfolio-deploy/assets
node -e "
const sharp = require('/tmp/img-tools/node_modules/sharp');
const files = ['assets/alif-partners-cover.png','assets/eaj-trader-cover.png','assets/360-tracker-cover.png','assets/namaste-cover.png'];
(async () => {
  for (const f of files) {
    const m = await sharp('/Users/madinarasidova/madina-portfolio-deploy/' + f).metadata();
    console.log(f, m.width + 'x' + m.height, m.format);
  }
})();
"
```

Expected: total size well under 5M (down from 21M); each cover image opens with valid `width`/`height`/`format` (no corrupt files).

- [ ] **Step 6: Commit**

```bash
cd /Users/madinarasidova/madina-portfolio-deploy
git add assets/
git commit -m "Compress and downscale case-study images in place"
```

---

## Task 2: Establish the shared page shell (tokens, fonts, lightbox)

This task doesn't produce a shippable file on its own — it locks in the exact boilerplate every other task copies verbatim into its page (there is no include mechanism, so duplication here is intentional per the Global Constraints).

**Files:** none created yet — this is a reference block used by Tasks 3–9.

**Interfaces:**
- Consumes: nothing
- Produces: the `SHARED_HEAD` (fonts + tokens + reset + lightbox CSS) and `SHARED_LIGHTBOX_JS` blocks referenced by name in every later task. Any later task that says "paste `SHARED_HEAD`" means the exact block below.

- [ ] **Step 1: Write down `SHARED_HEAD`** (goes inside `<head>`, after `<title>`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Spline+Sans+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #0a0a0a;
    --surface: #131313;
    --line: #232323;
    --text: #e8e6e2;
    --text-dim: #8f8b84;
    --text-dim-2: #625d56;
    --accent: #b8836a;
    --live: #34c759;
    --mono: 'Spline Sans Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    --sans: 'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  a { color: inherit; text-decoration: none; }
  .page { max-width: 1180px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 56px); }

  /* lightbox (shared across every page that shows process images) */
  .lightbox {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(10, 10, 10, 0.94);
    display: flex; align-items: center; justify-content: center;
    padding: 48px; opacity: 0; pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .lightbox.open { opacity: 1; pointer-events: all; }
  .lightbox img {
    max-width: 100%; max-height: 100%; border-radius: 12px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
    transform: scale(0.96); transition: transform 0.3s ease;
  }
  .lightbox.open img { transform: scale(1); }
  .lightbox-close {
    position: absolute; top: 28px; right: 32px;
    width: 42px; height: 42px; border-radius: 50%;
    background: var(--surface); border: 1px solid var(--line);
    color: var(--text); font-size: 1.3rem; line-height: 1; cursor: pointer;
  }
</style>
```

- [ ] **Step 2: Write down `SHARED_LIGHTBOX_JS`** (goes at the end of `<body>`, inside a `<script>` tag, on every page that has process images with lightbox triggers)

```html
<div class="lightbox" id="lightbox">
  <button class="lightbox-close" onclick="closeLightbox()" aria-label="Закрыть">×</button>
  <img id="lightboxImg" src="" alt="">
</div>
```

```js
function openLightbox(e, src, alt) {
  e.stopPropagation();
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxImg').alt = alt;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('lightbox').addEventListener('click', function (e) {
  if (e.target.id === 'lightbox') closeLightbox();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeLightbox();
});
```

- [ ] **Step 3: Commit the plan checkpoint** (no site files changed yet, so nothing to commit — check this step off once both blocks above are copy-ready for Tasks 3–9)

---

## Task 3: Build `index.html` — hero section

**Files:**
- Create: `index.html` (this task writes the `<head>` + opening `<body>` + hero `<section>`; Tasks 4–5 append the rest of the same file)

**Interfaces:**
- Consumes: `SHARED_HEAD` from Task 2
- Produces: `index.html` existing on disk with a working hero section, ready for Task 4 to append the work grid after it

- [ ] **Step 1: Write `index.html` through the end of the hero section**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Мадина Рашидова — Продуктовый дизайнер</title>
<meta name="description" content="Мадина Рашидова — продуктовый дизайнер с опытом в fintech, banking и мобильных продуктах. Портфолио с разбором процесса: Alif Partners, EAJ Trader, 360 Tracker, Namaste.">
<!-- SHARED_HEAD from Task 2 goes here -->
<style>
  .hero { position: relative; padding: 96px 0 72px; }

  .chip-zone { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
  .physics-chip {
    font-family: var(--mono); font-size: 12px; font-weight: 500; letter-spacing: 0.3px;
    padding: 9px 16px; border-radius: 999px; background: transparent;
    border: 1px solid rgba(184, 131, 106, 0.35); color: var(--text-dim); white-space: nowrap;
    transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    will-change: transform;
  }
  .physics-chip.is-near { border-color: rgba(184, 131, 106, 0.7); color: var(--text); }

  .hero-main {
    position: relative; z-index: 2; display: flex; align-items: center;
    justify-content: space-between; gap: clamp(24px, 5vw, 64px);
    flex-wrap: wrap-reverse; width: 100%;
  }
  .hero-text { max-width: 560px; display: flex; flex-direction: column; gap: 18px; }
  .status-badge {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: var(--mono); font-size: 0.72rem; color: var(--text-dim-2); letter-spacing: 0.02em;
  }
  .live { display: inline-flex; align-items: center; gap: 7px; color: var(--live); }
  .radar-dot { position: relative; width: 6px; height: 6px; border-radius: 50%; background: var(--live); flex-shrink: 0; }
  .radar-ring { position: absolute; inset: 0; border-radius: 50%; background: var(--live); animation: radarPulse 2.4s ease-out infinite; }
  @keyframes radarPulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.4); opacity: 0; } }
  h1.hero-name {
    font-family: var(--sans); font-weight: 700; font-size: clamp(2.1rem, 4.4vw, 3.4rem);
    letter-spacing: -0.02em; line-height: 1.05; color: var(--text);
  }
  .type-cursor { display: inline-block; color: var(--text-dim-2); animation: cursorBlink 900ms step-end infinite; }
  @keyframes cursorBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  .hero-role { font-family: var(--mono); font-size: 0.85rem; color: var(--text-dim); }
  .hero-desc { font-size: 1.02rem; color: var(--text-dim); max-width: 46ch; }
  .hero-contacts { display: flex; gap: 24px; margin-top: 4px; }
  .hero-contacts a {
    font-family: var(--mono); font-size: 0.85rem; color: var(--text);
    padding-bottom: 3px; border-bottom: 1px solid var(--line);
    transition: color 0.2s ease, border-color 0.2s ease;
  }
  .hero-contacts a:hover { color: var(--accent); border-color: var(--accent); }
  .hero-photo-wrap { flex-shrink: 0; width: min(30vw, 280px); opacity: 0.96; }
  .hero-photo-wrap img { display: block; width: 100%; height: auto; }

  @media (prefers-reduced-motion: reduce) {
    .type-cursor, .radar-ring { animation: none; }
  }
</style>
</head>
<body>

  <div class="page">
    <section class="hero">
      <div class="chip-zone" id="tagRow">
        <div class="physics-chip">Product Designer</div>
        <div class="physics-chip">4+ Years Experience</div>
        <div class="physics-chip">Fintech</div>
        <div class="physics-chip">Banking</div>
        <div class="physics-chip">Trading</div>
        <div class="physics-chip">B2B / B2C</div>
        <div class="physics-chip">Design System</div>
      </div>

      <div class="hero-main">
        <div class="hero-text">
          <div class="status-badge">
            <span class="live"><span class="radar-dot"><span class="radar-ring"></span></span>open to work</span>
            <span>·</span>
            <span>MSK <span id="clock">00:00:00</span></span>
          </div>
          <h1 class="hero-name"><span id="heroNameText">Мадина Рашидова</span><span class="type-cursor" id="typeCursor">|</span></h1>
          <div class="hero-role">Product Designer</div>
          <p class="hero-desc">Привет — я проектирую сложные административные интерфейсы и продукты с большими объёмами данных. Ниже — несколько историй о том, как это получалось.</p>
          <div class="hero-contacts">
            <a href="https://t.me/Madina_Rashidova" target="_blank" rel="noopener">Telegram</a>
            <a href="mailto:madinarashidova799@gmail.com">Почта</a>
            <a href="cv.pdf" target="_blank">CV</a>
          </div>
        </div>
        <div class="hero-photo-wrap">
          <img src="assets/hero-portrait.png" alt="Мадина Рашидова" width="280" height="373">
        </div>
      </div>
    </section>
```

- [ ] **Step 2: Verify the hero renders with no console errors**

Serve the directory and check with a headless browser:

```bash
cd /Users/madinarasidova/madina-portfolio-deploy && npx --yes http-server . -p 8095 -c-1 &
sleep 1
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  await page.goto('http://localhost:8095/index.html', {waitUntil:'networkidle0'});
  const h1 = await page.\$eval('h1', el => el.textContent.trim());
  console.log('h1:', JSON.stringify(h1));
  console.log('errors:', JSON.stringify(errors));
  await browser.close();
})();
"
```

Expected: `h1: "Мадина Рашидова|"` (the `|` is the still-blinking type cursor span, which is expected before JS runs it down to nothing — this is the pre-JS static markup, acceptable) and `errors: []`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add quiet-style hero section to index.html"
```

---

## Task 4: Add the cursor-repel tag interaction, clock, and typewriter JS to `index.html`

**Files:**
- Modify: `index.html` (append `<script>` block before the eventual `</body>`, and add a temporary `</body></html>` at the end for now — Task 5 will move these closing tags to after the sections it appends)

**Interfaces:**
- Consumes: `#tagRow` (from Task 3), `#clock` / `#heroNameText` / `#typeCursor` (from Task 3)
- Produces: nothing new consumed by later tasks — this is a leaf behavior

- [ ] **Step 1: Append the script and temporary closing tags**

```html
  <script>
    function tick() {
      var el = document.getElementById('clock');
      if (!el) return;
      el.textContent = new Intl.DateTimeFormat('ru-RU', {
        timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(new Date());
    }
    tick();
    setInterval(tick, 1000);

    (function () {
      var textEl = document.getElementById('heroNameText');
      var cursorEl = document.getElementById('typeCursor');
      if (!textEl || !cursorEl) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { cursorEl.style.display = 'none'; return; }
      var fullText = textEl.textContent;
      textEl.textContent = '';
      var i = 0;
      function typeNext() {
        if (i < fullText.length) { textEl.textContent += fullText.charAt(i); i++; setTimeout(typeNext, 70); }
        else { setTimeout(function () { cursorEl.style.display = 'none'; }, 3000); }
      }
      typeNext();
    })();

    // Quiet cursor-repel for the tag row: chips nudge away from the cursor when it
    // passes near, no physics engine — reads live getBoundingClientRect() on every
    // mousemove, so there is no load-time layout measurement to race against.
    (function () {
      var zone = document.getElementById('tagRow');
      if (!zone) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var chips = Array.prototype.slice.call(zone.querySelectorAll('.physics-chip'));
      var radius = 110;
      var maxShift = 16;

      zone.addEventListener('mousemove', function (e) {
        chips.forEach(function (chip) {
          var r = chip.getBoundingClientRect();
          var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          var dx = cx - e.clientX, dy = cy - e.clientY;
          var dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < radius) {
            var strength = ((radius - dist) / radius) * maxShift;
            chip.style.transform = 'translate(' + (dx / dist) * strength + 'px,' + (dy / dist) * strength + 'px)';
            chip.classList.add('is-near');
          } else {
            chip.style.transform = '';
            chip.classList.remove('is-near');
          }
        });
      });
      zone.addEventListener('mouseleave', function () {
        chips.forEach(function (chip) { chip.style.transform = ''; chip.classList.remove('is-near'); });
      });
    })();
  </script>

</body>
</html>
```

- [ ] **Step 2: Verify the clock ticks and the tag row responds to the cursor**

```bash
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.setViewport({width:1280,height:800});
  await page.goto('http://localhost:8095/index.html', {waitUntil:'networkidle0'});
  const t1 = await page.\$eval('#clock', el => el.textContent);
  await new Promise(r => setTimeout(r, 1200));
  const t2 = await page.\$eval('#clock', el => el.textContent);
  console.log('clock ticked:', t1 !== t2, t1, t2);

  const chip = await page.\$('.physics-chip');
  const box = await chip.boundingBox();
  await page.mouse.move(box.x + box.width/2 + 20, box.y + box.height/2, {steps:5});
  await new Promise(r => setTimeout(r, 300));
  const isNear = await page.\$eval('.physics-chip', el => el.classList.contains('is-near'));
  console.log('chip reacted to cursor:', isNear);
  await browser.close();
})();
"
```

Expected: `clock ticked: true ...` (two different HH:MM:SS strings) and `chip reacted to cursor: true`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add clock, typewriter, and cursor-repel tag interaction"
```

---

## Task 5: Build the work grid section in `index.html`

**Files:**
- Modify: `index.html` — insert the work grid `<section>` between the hero section (Task 3) and the closing `<script>` (Task 4), and add the grid's CSS into the existing `<style>` block

**Interfaces:**
- Consumes: nothing new
- Produces: 4 `<a class="work-tile">` links pointing to `case-alif-partners.html`, `case-eaj-trader.html`, `case-360-tracker.html`, `case-namaste.html` — Tasks 6–9 must create files at exactly those paths

- [ ] **Step 1: Add the work grid CSS** (insert into the `<style>` block from Task 3, right before `</style>`)

```css
  .work { padding: 40px 0 96px; }
  .work-heading {
    font-family: var(--mono); font-size: 0.85rem; color: var(--text-dim);
    text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 24px;
    padding-bottom: 16px; border-bottom: 1px solid var(--line);
  }
  .work-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .work-tile {
    position: relative; display: block; border-radius: 10px; overflow: hidden;
    background: var(--surface); border: 1px solid var(--line); aspect-ratio: 4 / 3;
  }
  .work-tile img {
    display: block; width: 100%; height: 100%; object-fit: cover;
    object-position: top; transition: transform 0.5s ease;
  }
  .work-tile:hover img, .work-tile:focus-visible img { transform: scale(1.03); }
  .work-caption {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    justify-content: flex-end; padding: 18px 20px;
    background: linear-gradient(to top, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.35) 45%, transparent 75%);
    opacity: 0; transform: translateY(6px); transition: opacity 0.25s ease, transform 0.25s ease;
  }
  .work-tile:hover .work-caption, .work-tile:focus-visible .work-caption { opacity: 1; transform: translateY(0); }
  .work-caption .name { font-size: 1.05rem; font-weight: 700; color: var(--text); }
  .work-caption .meta { font-family: var(--mono); font-size: 0.78rem; color: var(--text-dim); margin-top: 2px; }

  @media (hover: none) and (pointer: coarse) {
    .work-tile { aspect-ratio: 4 / 3.6; }
    .work-caption { opacity: 1; transform: none; background: none; position: static; padding: 10px 2px 0; }
    .work-caption .name { font-size: 0.92rem; }
  }
  @media (max-width: 720px) {
    .work-grid { grid-template-columns: 1fr; }
  }
```

- [ ] **Step 2: Insert the work grid markup** (right after the hero `</section>` closing tag from Task 3, before the `<script>` from Task 4)

```html
    <section class="work">
      <div class="work-heading">Работы</div>
      <div class="work-grid">

        <a class="work-tile" href="case-alif-partners.html">
          <img src="assets/alif-partners-cover.png" alt="Alif Partners — админ-панель для партнёров банка" loading="lazy" width="800" height="600">
          <div class="work-caption">
            <div class="name">Alif Partners</div>
            <div class="meta">Alif Bank · Web + Mobile · 4 месяца</div>
          </div>
        </a>

        <a class="work-tile" href="case-eaj-trader.html">
          <img src="assets/eaj-trader-cover.png" alt="EAJ Trader — личный кабинет трейдера" loading="lazy" width="800" height="600">
          <div class="work-caption">
            <div class="name">EAJ Trader</div>
            <div class="meta">Web · MVP за 2 месяца</div>
          </div>
        </a>

        <a class="work-tile" href="case-360-tracker.html">
          <img src="assets/360-tracker-cover.png" alt="360 Tracker — приложение для отслеживания членов семьи" loading="lazy" width="800" height="600">
          <div class="work-caption">
            <div class="name">360 Tracker</div>
            <div class="meta">iOS · MVP за 6 месяцев</div>
          </div>
        </a>

        <a class="work-tile" href="case-namaste.html">
          <img src="assets/namaste-cover.png" alt="Namaste — приложение для йоги, фитнеса и медитации" loading="lazy" width="800" height="600">
          <div class="work-caption">
            <div class="name">Namaste</div>
            <div class="meta">iOS · MVP за 3 месяца</div>
          </div>
        </a>

      </div>
    </section>
```

Note: the actual pixel dimensions of the (now-optimized, Task 1) cover images may not be exactly 800×600 — check with `sips -g pixelWidth -g pixelHeight assets/alif-partners-cover.png` (etc.) after Task 1 and use the real numbers here so the `width`/`height` attributes don't cause layout-shift mismatches.

- [ ] **Step 3: Verify the grid — 4 tiles, correct hrefs, hover reveal, keyboard focus reveal**

```bash
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.setViewport({width:1280,height:900});
  await page.goto('http://localhost:8095/index.html', {waitUntil:'networkidle0'});

  const hrefs = await page.\$\$eval('.work-tile', els => els.map(e => e.getAttribute('href')));
  console.log('hrefs:', JSON.stringify(hrefs));

  const tile = await page.\$('.work-tile');
  const box = await tile.boundingBox();
  await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
  await new Promise(r => setTimeout(r, 300));
  const opacity = await page.\$eval('.work-tile .work-caption', el => getComputedStyle(el).opacity);
  console.log('caption opacity on hover:', opacity);

  await page.keyboard.press('Tab'); // focus first link/tab stop, may need a couple presses depending on tab order
  const focusedTag = await page.evaluate(() => document.activeElement.className);
  console.log('first focusable:', focusedTag);
  await browser.close();
})();
"
```

Expected: `hrefs` is exactly `["case-alif-partners.html","case-eaj-trader.html","case-360-tracker.html","case-namaste.html"]`; `caption opacity on hover: 1`.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add 2x2 work grid with hover captions to index.html"
```

---

## Task 6: Build the experience timeline + footer, finishing `index.html`

**Files:**
- Modify: `index.html` — insert an experience section right after the work grid `</section>` (before the closing `<script>`)

**Interfaces:**
- Consumes: nothing new
- Produces: a complete, shippable `index.html` (this is the last task that touches this file)

- [ ] **Step 1: Add experience CSS** (append to the `<style>` block)

```css
  .experience { padding: 0 0 96px; }
  .exp-item { padding: 16px 0; border-top: 1px solid var(--line); }
  .exp-item:first-child { border-top: none; }
  .exp-date { display: block; font-family: var(--mono); font-size: 0.78rem; color: var(--text-dim-2); }
  .exp-company { display: block; font-size: 1rem; font-weight: 700; margin-top: 4px; }
  .exp-role { display: block; font-size: 0.88rem; color: var(--text-dim); margin-top: 2px; }
  footer.page-footer {
    border-top: 1px solid var(--line); padding: 32px 0;
    font-family: var(--mono); font-size: 0.78rem; color: var(--text-dim-2);
  }
```

- [ ] **Step 2: Insert the experience + footer markup**

```html
    <section class="experience">
      <div class="work-heading">Опыт</div>
      <div class="exp-item">
        <span class="exp-date">2024 — сейчас</span>
        <span class="exp-company">Профинанс / FIBO Group</span>
        <span class="exp-role">Product Designer</span>
      </div>
      <div class="exp-item">
        <span class="exp-date">2024 — 2025</span>
        <span class="exp-company">Foreesco Group</span>
        <span class="exp-role">Product Designer · part-time</span>
      </div>
      <div class="exp-item">
        <span class="exp-date">2022 — 2024</span>
        <span class="exp-company">Alif Bank</span>
        <span class="exp-role">UX/UI Designer</span>
      </div>
    </section>
  </div>

  <footer class="page-footer">
    <div class="page">handmade with claude code · last update: 15.07.2026 · v2.0</div>
  </footer>
```

Note: the closing `</div>` above matches the `<div class="page">` opened at the start of Task 3's hero markup — the `.page` wrapper spans hero + work + experience, and the footer sits outside it (full-bleed background, indented content), matching the original site's footer pattern.

- [ ] **Step 3: Verify the complete page end-to-end**

```bash
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8095/index.html', {waitUntil:'networkidle0'});
  const expCount = await page.\$\$eval('.exp-item', els => els.length);
  const title = await page.title();
  const desc = await page.\$eval('meta[name=description]', el => el.content);
  console.log('exp items:', expCount, 'title:', title, 'desc set:', !!desc, 'errors:', errors);
  await browser.close();
})();
"
```

Expected: `exp items: 3`, a non-empty `title`, `desc set: true`, `errors: []`.

- [ ] **Step 4: Run a contrast check on the body text and dim text tokens**

```bash
node -e "
function luminance(hex) {
  const c = hex.replace('#','').match(/.{2}/g).map(h => {
    const v = parseInt(h,16)/255;
    return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
  });
  return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
}
function contrast(a,b) {
  const L1 = luminance(a)+0.05, L2 = luminance(b)+0.05;
  return (Math.max(L1,L2)/Math.min(L1,L2)).toFixed(2);
}
console.log('text on bg:', contrast('#e8e6e2','#0a0a0a'));
console.log('text-dim on bg:', contrast('#8f8b84','#0a0a0a'));
console.log('text-dim-2 on bg:', contrast('#625d56','#0a0a0a'));
"
```

Expected: `text on bg` ≥ 12 (comfortably AA/AAA), `text-dim on bg` ≥ 4.5 (passes AA for body-sized dim text). If `text-dim-2 on bg` is below 3 (it renders small mono captions only — e.g. exp dates — verify against WCAG large-text vs body-text sizing for where it's actually used; the exp-date is 0.78rem ≈ 12.5px, which counts as body text and needs ≥4.5:1), lighten `--text-dim-2` (e.g. to `#726c64`) until the check passes, and re-run this step.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Add experience timeline and footer, complete index.html"
```

---

## Task 7: Build `case-alif-partners.html`

**Files:**
- Create: `case-alif-partners.html`

**Interfaces:**
- Consumes: `SHARED_HEAD` + `SHARED_LIGHTBOX_JS` from Task 2; linked from `index.html`'s first work tile (Task 5)
- Produces: the page at `case-alif-partners.html` that tile's href points to

- [ ] **Step 1: Write the full page**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Alif Partners — Мадина Рашидова</title>
<meta name="description" content="Alif Partners — редизайн админ-панели для партнёрской сети Alif Bank. Разбор процесса: исследование, решение, итоги.">
<!-- SHARED_HEAD from Task 2 goes here -->
<style>
  :root { --case-accent: #6b84b8; }
  .case-page { padding: 56px 0 96px; }
  .back-link {
    display: inline-block; font-family: var(--mono); font-size: 0.82rem;
    color: var(--text-dim); margin-bottom: 40px; padding-bottom: 2px;
    border-bottom: 1px solid var(--line); transition: color 0.2s ease, border-color 0.2s ease;
  }
  .back-link:hover { color: var(--case-accent); border-color: var(--case-accent); }
  .case-header { margin-bottom: 48px; }
  .case-meta-line {
    font-family: var(--mono); font-size: 0.85rem; text-transform: uppercase;
    letter-spacing: 0.03em; color: var(--text-dim); margin-top: 10px;
  }
  .case-name { color: var(--text); font-weight: 700; }
  .case-tags { font-family: var(--mono); font-size: 0.8rem; color: var(--case-accent); margin-top: 10px; }
  h1.case-title { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 700; letter-spacing: -0.01em; }
  .metrics { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
  .metric { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 14px 18px; min-width: 140px; }
  .metric .value { font-family: var(--mono); font-size: 1.1rem; font-weight: 700; color: var(--case-accent); }
  .metric .label { font-size: 0.8rem; color: var(--text-dim); margin-top: 2px; }

  .detail-block { margin-top: 40px; padding-top: 32px; border-top: 1px solid var(--line); }
  .detail-head { display: flex; align-items: baseline; gap: 16px; margin-bottom: 16px; }
  .detail-num { font-family: var(--mono); font-size: 1rem; color: var(--text-dim-2); flex-shrink: 0; }
  .detail-head h4 { font-size: 1.15rem; font-weight: 700; letter-spacing: -0.01em; }
  .detail-block p { color: var(--text-dim); font-size: 0.95rem; line-height: 1.6; max-width: 65ch; margin-bottom: 18px; }
  .detail-block img { display: block; width: 100%; height: auto; border-radius: 10px; cursor: pointer; margin-bottom: 18px; }

  .problem-statement { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 22px 26px; }
  .problem-statement .quote-mark { display: block; font-size: 2.2rem; font-weight: 800; line-height: 0.6; color: var(--case-accent); opacity: 0.7; margin-bottom: 6px; }
  .problem-statement p { font-size: 1.02rem; color: var(--text); margin: 0; }

  .outcome-card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 22px 24px; }
  .outcome-kicker { display: block; font-family: var(--mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--case-accent); }
  .outcome-list { list-style: none; margin-top: 14px; }
  .outcome-list li { position: relative; padding: 10px 0 10px 26px; border-top: 1px solid var(--line); font-size: 0.95rem; color: var(--text); }
  .outcome-list li:first-child { border-top: none; padding-top: 0; }
  .outcome-list li::before { content: "✓"; position: absolute; left: 0; color: var(--case-accent); font-family: var(--mono); }

  .persona-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 20px; }
  .persona-card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 18px; }
  .persona-card h5 { color: var(--case-accent); font-size: 1rem; font-weight: 700; }
  .persona-desc { color: var(--text-dim-2); font-size: 0.82rem; margin-top: 2px; margin-bottom: 14px; }
  .persona-row { display: flex; flex-direction: column; gap: 2px; padding: 8px 0; border-top: 1px solid var(--line); font-size: 0.85rem; }
  .persona-row:first-of-type { border-top: none; }
  .persona-label { font-family: var(--mono); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dim-2); }
</style>
</head>
<body>

  <div class="page">
    <div class="case-page">
      <a class="back-link" href="index.html">← Все работы</a>

      <div class="case-header">
        <h1 class="case-title">Alif Partners</h1>
        <div class="case-meta-line"><span class="case-name">Alif Bank</span> · Web + Mobile · 4 месяца</div>
        <div class="case-tags">/b2b /ux-research /fintech</div>
        <div class="metrics">
          <div class="metric"><div class="value">2000+</div><div class="label">партнёров в сети</div></div>
          <div class="metric"><div class="value">8</div><div class="label">интервью легли в основу редизайна</div></div>
        </div>
      </div>

      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(01)</span><h4>Контекст</h4></div>
        <p>Alif, крупнейший банк Таджикистана, развивает модель рассрочки через широкую партнёрскую сеть магазинов и собственный маркетплейс Alif Shop. С ростом числа партнёров и заказов операционная нагрузка на банк начала стремительно увеличиваться.</p>
        <img src="assets/process/alif-context.png" alt="Alif Partners — контекст: рост партнёрской сети" loading="lazy" onclick="openLightbox(event, 'assets/process/alif-context.png', 'Alif Partners — контекст')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(02)</span><h4>Исследование</h4></div>
        <p>Глубинные интервью с 8 модераторами, ежедневно работающими в админ-панели: интерфейс им знаком, а оформление заказов, добавление товаров и изменение цен не вызывают критических сложностей. Но почти все процессы завязаны на ручных действиях: поиск заявки, звонок клиенту, подтверждение по SMS. Иногда они работают нестабильно, заявки задерживаются или теряются. Раздел доставки часть модераторов не использует вовсе из-за неочевидной логики.</p>
        <img src="assets/process/alif-interviews.png" alt="Alif Partners — интервью с модераторами" loading="lazy" onclick="openLightbox(event, 'assets/process/alif-interviews.png', 'Alif Partners — интервью с модераторами')">
        <p>Интервью с партнёрами выявили другую проблему: они не видят заявку с маркетплейса, пока не позвонит колл-центр, а оформление через терминалы ограничено и иногда сбоит. Курьеры не могут самостоятельно оформлять доставку и вынуждены звонить операторам.</p>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(03)</span><h4>Определение задачи</h4></div>
        <div class="problem-statement">
          <span class="quote-mark">"</span>
          <p>Необходимо доработать ключевые пользовательские сценарии админ-панели: работу с заказами и товарами, раздел доставки, а также статусы и заявки. Ускорить работу системы и сократить количество ручных операций.</p>
        </div>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(04)</span><h4>Поиск решения</h4></div>
        <p>Гипотеза: текущая админ-панель ориентирована на внутренние процессы, а не на задачи партнёров, из-за чего ключевые сценарии остаются зависимыми от модераторов, колл-центра и отдела партнёров. А что если сместить фокус админки на партнёров и сделать её инструментом для самостоятельной работы?</p>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(05)</span><h4>Решение</h4></div>
        <p>Переработала структуру админ-панели: навигация переехала из бокового сайдбара в верхнюю часть интерфейса. Новая структура включает разделы «Магазины», «Товары», «Заявки», «Доставка», «Отзывы» и отдельный раздел модерации.</p>
        <img src="assets/process/alif-solution.png" alt="Alif Partners — новая структура админки" loading="lazy" onclick="openLightbox(event, 'assets/process/alif-solution.png', 'Alif Partners — новая структура админки')">
        <p>Добавила единый канал коммуникации с банком в виде чата, объединяющего взаимодействие с модераторами, отделом партнёров и колл-центром, а также уведомления об остатках товаров.</p>
        <img src="assets/process/alif-chat.png" alt="Alif Partners — единый чат с банком" loading="lazy" onclick="openLightbox(event, 'assets/process/alif-chat.png', 'Alif Partners — единый чат с банком')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(06)</span><h4>Процесс добавления товара</h4></div>
        <p>Добавление товара занимало много времени из-за необходимости вручную заполнять данные, даже если товар уже существовал в системе. Добавила функцию поиска товара перед его созданием: если он уже есть на маркетплейсе, партнёр использует готовые данные и сразу переходит к добавлению медиа и созданию оффера вместо заполнения всех этапов.</p>
        <img src="assets/process/alif-product-search.png" alt="Alif Partners — процесс добавления товара" loading="lazy" onclick="openLightbox(event, 'assets/process/alif-product-search.png', 'Alif Partners — процесс добавления товара')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(07)</span><h4>Партнёрский инсайт</h4></div>
        <p>Из интервью: при формировании цен на товары партнёры ориентируются на конкуренцию. В процессе добавления товара интегрировала блок с ценами на аналогичные позиции: партнёр сразу видит рыночный диапазон и принимает решение по стоимости в момент создания карточки.</p>
        <img src="assets/process/alif-price-insight.png" alt="Alif Partners — сравнение цен конкурентов" loading="lazy" onclick="openLightbox(event, 'assets/process/alif-price-insight.png', 'Alif Partners — сравнение цен конкурентов')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(08)</span><h4>Раздел доставки</h4></div>
        <p>Самый проблемный раздел: партнёры и курьеры тратили много времени на оформление заявок, которые приходят не только с маркетплейса, но и из оффлайн-точек. Разделила раздел на самовывоз и доставку и перенесла оформление заявок из терминалов в админку, сохранив всю бизнес-логику.</p>
        <img src="assets/process/alif-delivery.png" alt="Alif Partners — раздел доставки" loading="lazy" onclick="openLightbox(event, 'assets/process/alif-delivery.png', 'Alif Partners — раздел доставки')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(09)</span><h4>Мобильная версия</h4></div>
        <p>Спроектировала мобильную версию с полным функционалом, интегрировав обновлённую логику и оптимизированные процессы.</p>
        <img src="assets/process/alif-mobile.png" alt="Alif Partners — мобильная версия" loading="lazy" onclick="openLightbox(event, 'assets/process/alif-mobile.png', 'Alif Partners — мобильная версия')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(10)</span><h4>Итоги</h4></div>
        <p>Удалось переосмыслить админ-панель из внутреннего инструмента в продукт, ориентированный на самостоятельную работу партнёров.</p>
        <div class="outcome-card">
          <span class="outcome-kicker">Что изменилось</span>
          <ul class="outcome-list">
            <li>Существенно снизилась нагрузка на колл-центр и модераторов за счёт переноса части процессов</li>
            <li>Партнёры стали самостоятельнее в управлении ключевыми операциями и больше не зависят от подтверждений</li>
            <li>Система стала более устойчивой к росту нагрузки на фоне развития BNPL-модели</li>
          </ul>
        </div>
      </div>

      <a class="back-link" href="index.html" style="margin-top:48px">← Все работы</a>
    </div>
  </div>

  <!-- SHARED_LIGHTBOX_JS markup from Task 2 goes here -->

  <script>
    // SHARED_LIGHTBOX_JS script from Task 2 goes here
  </script>

</body>
</html>
```

- [ ] **Step 2: Verify the page**

```bash
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8095/case-alif-partners.html', {waitUntil:'networkidle0'});
  const h1 = await page.\$eval('h1', el => el.textContent);
  const imgsNoAlt = await page.\$\$eval('img', els => els.filter(i => !i.alt.trim()).length);
  const blockCount = await page.\$\$eval('.detail-block', els => els.length);
  console.log('h1:', h1, 'imgsNoAlt:', imgsNoAlt, 'blocks:', blockCount, 'errors:', errors);

  // lightbox opens on image click
  await page.click('.detail-block img');
  const open = await page.\$eval('#lightbox', el => el.classList.contains('open'));
  console.log('lightbox opens:', open);
  await browser.close();
})();
"
```

Expected: `h1: Alif Partners`, `imgsNoAlt: 0`, `blocks: 10`, `errors: []`, `lightbox opens: true`.

- [ ] **Step 3: Commit**

```bash
git add case-alif-partners.html
git commit -m "Add case-alif-partners.html"
```

---

## Task 8: Build `case-eaj-trader.html`

**Files:**
- Create: `case-eaj-trader.html`

**Interfaces:**
- Consumes: `SHARED_HEAD` + `SHARED_LIGHTBOX_JS` from Task 2; linked from `index.html`'s second work tile
- Produces: the page at `case-eaj-trader.html`

- [ ] **Step 1: Write the full page**

Same shell as Task 7's Step 1 (`SHARED_HEAD`, the same CSS block verbatim except `--case-accent: #8a9a6b;`), with this body content in place of Alif Partners':

```html
<title>EAJ Trader — Мадина Рашидова</title>
<meta name="description" content="EAJ Trader — MVP личного кабинета трейдера с нуля за 2 месяца. Разбор процесса: сегментация пользователей, концепты, итоги.">
```

```html
      <div class="case-header">
        <h1 class="case-title">EAJ Trader</h1>
        <div class="case-meta-line">Web · MVP за 2 месяца</div>
        <div class="case-tags">/0→1 /trading /fintech</div>
        <div class="metrics">
          <div class="metric"><div class="value">2</div><div class="label">протестированных концепта счетов</div></div>
          <div class="metric"><div class="value">MVP</div><div class="label">полный цикл с нуля за 2 месяца</div></div>
        </div>
      </div>

      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(01)</span><h4>Цель проекта</h4></div>
        <div class="problem-statement">
          <span class="quote-mark">"</span>
          <p>Создать MVP личного кабинета с нуля, который покрывает ключевые финансовые сценарии пользователей и формирует основу для дальнейшего развития продукта.</p>
        </div>
        <p style="margin-top:18px">На предыдущем этапе разработала айдентику и лендинг проекта, а в рамках этого кейса сфокусировалась на проектировании личного кабинета: структуре, логике и интерфейсах для управления счетами, пополнения, вывода средств, переводов и отслеживания баланса.</p>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(02)</span><h4>Исследование</h4></div>
        <p>Заказчик уже провёл предварительное исследование и сформировал список ключевых функций, поэтому фокус работы сместился на бизнес-анализ: кто является пользователем личного кабинета, чем отличаются их сценарии поведения и как эти различия должны повлиять на структуру системы.</p>
        <img src="assets/process/eaj-research.jpg" alt="EAJ Trader — бизнес-анализ пользователей" loading="lazy" onclick="openLightbox(event, 'assets/process/eaj-research.jpg', 'EAJ Trader — бизнес-анализ пользователей')">
        <p>Разделение пользователей на активных трейдеров и менее активную аудиторию показало: попытка спроектировать универсальный интерфейс приводит к потере эффективности для обоих сегментов. MVP сфокусировался на оптимизации сценариев для активных трейдеров, с заложенной основой для дальнейшей персонализации.</p>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(03)</span><h4>Определение задачи</h4></div>
        <p>Бизнес-анализ показал пять разных типов пользователей личного кабинета — от скальпера, для которого любая задержка интерфейса означает убыток, до новичка, которому нужен обучающий UX. Эти различия напрямую определили, какие сценарии MVP должен закрыть в первую очередь.</p>
        <div class="persona-grid">
          <div class="persona-card">
            <h5>Активный трейдер</h5>
            <p class="persona-desc">Основной пользователь платформы</p>
            <div class="persona-row"><span class="persona-label">Цели</span><span>Быстро торговать и контролировать капитал</span></div>
            <div class="persona-row"><span class="persona-label">Поведение</span><span>Постоянно в рынке, следит за графиками</span></div>
            <div class="persona-row"><span class="persona-label">Боли</span><span>Перегруз интерфейса, задержки</span></div>
            <div class="persona-row"><span class="persona-label">UX-фокус</span><span>Скорость + минимализм</span></div>
          </div>
          <div class="persona-card">
            <h5>Скальпер</h5>
            <p class="persona-desc">Высокочастотный трейдер</p>
            <div class="persona-row"><span class="persona-label">Цели</span><span>Зарабатывать на микродвижениях цены</span></div>
            <div class="persona-row"><span class="persona-label">Поведение</span><span>Делает десятки сделок в день</span></div>
            <div class="persona-row"><span class="persona-label">Боли</span><span>Любая задержка = убыток</span></div>
            <div class="persona-row"><span class="persona-label">UX-фокус</span><span>1-click trading, low latency UI</span></div>
          </div>
          <div class="persona-card">
            <h5>Свинг-трейдер</h5>
            <p class="persona-desc">Среднесрочный трейдер</p>
            <div class="persona-row"><span class="persona-label">Цели</span><span>Ловить тренды</span></div>
            <div class="persona-row"><span class="persona-label">Поведение</span><span>Проверяет позиции несколько раз в день</span></div>
            <div class="persona-row"><span class="persona-label">Боли</span><span>Недостаток аналитики</span></div>
            <div class="persona-row"><span class="persona-label">UX-фокус</span><span>Глубокая аналитика портфеля</span></div>
          </div>
          <div class="persona-card">
            <h5>Инвест-трейдер (гибрид)</h5>
            <p class="persona-desc">Комбинирует инвестиции и трейдинг</p>
            <div class="persona-row"><span class="persona-label">Цели</span><span>Диверсификация капитала</span></div>
            <div class="persona-row"><span class="persona-label">Поведение</span><span>Редко открывает сделки, но крупные объёмы</span></div>
            <div class="persona-row"><span class="persona-label">Боли</span><span>Сложность контроля нескольких активов</span></div>
            <div class="persona-row"><span class="persona-label">UX-фокус</span><span>Portfolio view + риск-метрики</span></div>
          </div>
          <div class="persona-card">
            <h5>Новичок</h5>
            <p class="persona-desc">Начинающий трейдер</p>
            <div class="persona-row"><span class="persona-label">Цели</span><span>Понять рынок и не потерять деньги</span></div>
            <div class="persona-row"><span class="persona-label">Поведение</span><span>Осторожные сделки, обучение</span></div>
            <div class="persona-row"><span class="persona-label">Боли</span><span>Сложный интерфейс, страх ошибок</span></div>
            <div class="persona-row"><span class="persona-label">UX-фокус</span><span>Обучающий UX, подсказки, ограничения</span></div>
          </div>
        </div>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(04)</span><h4>Работа над продуктом</h4></div>
        <p>Ключевые сценарии: управление счетами, пополнение, вывод средств, переводы между счетами и отслеживание состояния средств. Основной экран спроектирован вокруг быстрого доступа к операциям, вторичные и аналитические данные вынесены в менее приоритетные зоны.</p>
        <img src="assets/process/eaj-home.png" alt="EAJ Trader — главный экран личного кабинета" loading="lazy" onclick="openLightbox(event, 'assets/process/eaj-home.png', 'EAJ Trader — главный экран личного кабинета')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(05)</span><h4>Работа с торговыми счетами: концепт 1</h4></div>
        <p>Торговый счёт — основная сущность продукта, точка входа во все ключевые сценарии. Первый вариант: классический табличный список счетов, паттерн, широко используемый у конкурентов и привычный пользователям. Протестировали его в качественном UX-исследовании с фокусом на базовые сценарии.</p>
        <img src="assets/process/eaj-concept1-2.jpg" alt="EAJ Trader — концепт 1, табличный список счетов" loading="lazy" onclick="openLightbox(event, 'assets/process/eaj-concept1-2.jpg', 'EAJ Trader — концепт 1, табличный список счетов')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(06)</span><h4>Концепт 2 — карточный формат</h4></div>
        <p>Во втором концепте пересобрала представление счетов в карточный формат, где каждый счёт — самостоятельная единица с полной информацией и действиями. Несмотря на то, что табличный формат оказался более ожидаемым и привычным, карточный показал лучшие результаты в понимании и скорости взаимодействия. Выбрала его как основное решение, оставив таблицу в резерве для масштабирования при росте числа счетов.</p>
        <img src="assets/process/eaj-cards.jpg" alt="EAJ Trader — карточный формат счетов" loading="lazy" onclick="openLightbox(event, 'assets/process/eaj-cards.jpg', 'EAJ Trader — карточный формат счетов')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(07)</span><h4>Центр управления средствами</h4></div>
        <p>Объединила пополнение, вывод и внутренние переводы в единый раздел Funding. Решение приняли совместно с заказчиком, чтобы упростить навигацию и сократить количество разрозненных точек входа в финансовые операции. По результатам юзабилити-тестирования пользователи отмечали более простое восприятие структуры и быстрый доступ к операциям.</p>
        <img src="assets/process/eaj-funding-2.png" alt="EAJ Trader — раздел Funding: выбор действия" loading="lazy" onclick="openLightbox(event, 'assets/process/eaj-funding-2.png', 'EAJ Trader — раздел Funding: выбор действия')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(08)</span><h4>Поддержка внутри продукта</h4></div>
        <p>Добавила раздел Claims &amp; Complaints: встроенный блок обращений в формате чата. В спорных ситуациях критично важен быстрый прямой канал коммуникации без поиска внешних контактов. На этапе раннего запуска ожидается повышенное количество обращений, поэтому чат стал не только каналом поддержки, но и инструментом обратной связи для улучшения продукта.</p>
        <img src="assets/process/eaj-claims-list.png" alt="EAJ Trader — список обращений Claims & Complaints" loading="lazy" onclick="openLightbox(event, 'assets/process/eaj-claims-list.png', 'EAJ Trader — список обращений Claims & Complaints')">
        <img src="assets/process/eaj-claims-detail.png" alt="EAJ Trader — чат по обращению" loading="lazy" onclick="openLightbox(event, 'assets/process/eaj-claims-detail.png', 'EAJ Trader — чат по обращению')" style="margin-top:16px">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(09)</span><h4>Итоги</h4></div>
        <p>Спроектирован MVP веб-кабинета для управления финансовыми операциями. Заложенная структура решения позволяет масштабировать продукт за счёт добавления новых сценариев без нарушения основной логики взаимодействия.</p>
        <div class="outcome-card">
          <span class="outcome-kicker">В рамках MVP удалось</span>
          <ul class="outcome-list">
            <li>Определить ключевые пользовательские сегменты и их поведенческие модели, что позволило сфокусировать продукт на сценариях активных трейдеров</li>
            <li>Спроектировать и протестировать разные подходы к отображению торговых счетов</li>
            <li>Сформировать архитектуру кабинета, ориентированную на быстрые и частые финансовые операции</li>
          </ul>
        </div>
      </div>
```

Wrap this in the same page structure as Task 7 (`<div class="page"><div class="case-page"><a class="back-link">...</a><div class="case-header">...</div>` + the blocks above + closing back-link + `</div></div>`), with the shared lightbox markup/script at the end, exactly as in Task 7.

- [ ] **Step 2: Verify the page**

```bash
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8095/case-eaj-trader.html', {waitUntil:'networkidle0'});
  const h1 = await page.\$eval('h1', el => el.textContent);
  const personaCount = await page.\$\$eval('.persona-card', els => els.length);
  const imgsNoAlt = await page.\$\$eval('img', els => els.filter(i => !i.alt.trim()).length);
  console.log('h1:', h1, 'personas:', personaCount, 'imgsNoAlt:', imgsNoAlt, 'errors:', errors);
  await browser.close();
})();
"
```

Expected: `h1: EAJ Trader`, `personas: 5`, `imgsNoAlt: 0`, `errors: []`.

- [ ] **Step 3: Commit**

```bash
git add case-eaj-trader.html
git commit -m "Add case-eaj-trader.html"
```

---

## Task 9: Build `case-360-tracker.html`

**Files:**
- Create: `case-360-tracker.html`

**Interfaces:**
- Consumes: `SHARED_HEAD` + `SHARED_LIGHTBOX_JS` from Task 2; linked from `index.html`'s third work tile
- Produces: the page at `case-360-tracker.html`

- [ ] **Step 1: Write the full page**

Same shell as Task 7 with `--case-accent: #6ba39a;`, and:

```html
<title>360 Tracker — Мадина Рашидова</title>
<meta name="description" content="360 Tracker — MVP мобильного приложения для семейной безопасности за 6 месяцев. Разбор процесса: анализ конкурентов, user flow, итоги.">
```

```html
      <div class="case-header">
        <h1 class="case-title">360 Tracker</h1>
        <div class="case-meta-line">iOS · MVP за 6 месяцев</div>
        <div class="case-tags">/mobile /0→1 /privacy-vs-control</div>
        <div class="metrics">
          <div class="metric"><div class="value">4</div><div class="label">конкурента в анализе</div></div>
          <div class="metric"><div class="value">30 дней</div><div class="label">истории поездок — премиум</div></div>
        </div>
      </div>

      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(01)</span><h4>Цель проекта</h4></div>
        <div class="problem-statement">
          <span class="quote-mark">"</span>
          <p>Разработать единое мобильное решение, которое помогает семьям оставаться на связи и быть уверенными в безопасности близких, объединяя геолокацию, экстренные оповещения и быструю коммуникацию в одном приложении.</p>
        </div>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(02)</span><h4>Общение со стейкхолдерами</h4></div>
        <p>Основной фокус: обеспечить безопасность членов семьи, не создавая ощущения тотального контроля. Важно было найти баланс: дать родителям инструменты для спокойствия, не вызывая сопротивления у детей и подростков.</p>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(03)</span><h4>Анализ конкурентов</h4></div>
        <p>Вместо глубинных интервью сосредоточилась на анализе существующих решений: Kids360, Kid Security, iSharing и Family Tracker: какие функции предлагают, на чём делают акцент и какие сценарии используют для удержания пользователей.</p>
        <img src="assets/process/tracker-competitors.png" alt="360 Tracker — анализ конкурентов" loading="lazy" onclick="openLightbox(event, 'assets/process/tracker-competitors.png', '360 Tracker — анализ конкурентов')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(04)</span><h4>Монетизация конкурентов</h4></div>
        <p>Большинство приложений используют модель freemium: базовые функции бесплатны, а расширенные возможности открываются по подписке. Бесплатной версии чаще всего достаточно только для базового отслеживания, а ключевые сценарии безопасности и контроля скрыты за paywall.</p>
        <img src="assets/process/tracker-monetization.png" alt="360 Tracker — монетизация конкурентов" loading="lazy" onclick="openLightbox(event, 'assets/process/tracker-monetization.png', '360 Tracker — монетизация конкурентов')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(05)</span><h4>Выводы</h4></div>
        <p>Исследование определило не только продуктовое направление, но и реалистичный масштаб MVP, учитывая высокую техническую сложность решений в области семейного трекинга:</p>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;gap:10px"><span style="color:var(--case-accent);font-family:var(--mono)">→</span><p style="margin:0">Работа с GPS в реальном времени</p></div>
          <div style="display:flex;gap:10px"><span style="color:var(--case-accent);font-family:var(--mono)">→</span><p style="margin:0">Геофенсинг</p></div>
          <div style="display:flex;gap:10px"><span style="color:var(--case-accent);font-family:var(--mono)">→</span><p style="margin:0">Обработка маршрутов</p></div>
          <div style="display:flex;gap:10px"><span style="color:var(--case-accent);font-family:var(--mono)">→</span><p style="margin:0">Интеграция с картографическими API</p></div>
        </div>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(06)</span><h4>Определение задачи</h4></div>
        <div class="problem-statement">
          <span class="quote-mark">"</span>
          <p>Разработать мобильное приложение для семейной безопасности со сценариями отслеживания местоположения, экстренных уведомлений и встроенного чата для общения.</p>
        </div>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(07)</span><h4>User flow</h4></div>
        <p>По результатам исследования проработала user flow, основанный на ключевых сценариях использования продукта.</p>
        <img src="assets/process/tracker-flow.png" alt="360 Tracker — user flow" loading="lazy" onclick="openLightbox(event, 'assets/process/tracker-flow.png', '360 Tracker — user flow')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(08)</span><h4>Главный экран</h4></div>
        <p>Спроектирован вокруг интерактивной карты: члены семьи в реальном времени с актуальным статусом, быстрое переключение между людьми и местами, быстрые действия и построение маршрута прямо внутри приложения, по логике, аналогичной картографическим сервисам.</p>
        <img src="assets/process/tracker-main.png" alt="360 Tracker — главный экран" loading="lazy" onclick="openLightbox(event, 'assets/process/tracker-main.png', '360 Tracker — главный экран')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(09)</span><h4>Скрыть геолокацию</h4></div>
        <p>Гипотеза: возможность временно скрывать местоположение повысит доверие к продукту и снизит ощущение контроля. Тестирование показало: респонденты позитивно восприняли саму возможность скрытия, но в родительском сценарии это вызвало вопросы: теряется контроль над ребёнком.</p>
        <img src="assets/process/tracker-privacy.png" alt="360 Tracker — скрыть геолокацию" loading="lazy" onclick="openLightbox(event, 'assets/process/tracker-privacy.png', '360 Tracker — скрыть геолокацию')">
        <p style="margin-top:18px">Доработали логику: родитель может ограничить возможность скрытия геолокации для ребёнка. Это сохранило контроль в детском сценарии и дало взрослым пользователям управление своей приватностью.</p>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(10)</span><h4>История поездок</h4></div>
        <p>Добавили историю поездок за последние 30 дней с возможностью просматривать собственные маршруты. Функция доступна в рамках премиум-подписки и не отображается другим участникам семейного круга. Это расширило сценарии использования без усложнения базового опыта.</p>
        <img src="assets/process/tracker-history.png" alt="360 Tracker — история поездок" loading="lazy" onclick="openLightbox(event, 'assets/process/tracker-history.png', '360 Tracker — история поездок')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(11)</span><h4>Геозоны и родительский контроль</h4></div>
        <p>Добавила функцию создания геозон, где родитель может вручную нарисовать или выбрать на карте область допустимого перемещения ребёнка. При выходе за пределы зоны отправляется уведомление.</p>
        <img src="assets/process/tracker-geofence.png" alt="360 Tracker — геозоны" loading="lazy" onclick="openLightbox(event, 'assets/process/tracker-geofence.png', '360 Tracker — геозоны')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(12)</span><h4>Финальный концепт</h4></div>
        <p>Включает базовые сценарии семейной безопасности и коммуникации: отслеживание геолокации в реальном времени, геофенсинг, уведомления о перемещениях и встроенный чат для общения внутри семейного круга. Все ключевые функции конкурентных приложений адаптированы под единый пользовательский опыт.</p>
        <img src="assets/process/tracker-final.png" alt="360 Tracker — финальный концепт" loading="lazy" onclick="openLightbox(event, 'assets/process/tracker-final.png', '360 Tracker — финальный концепт')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(13)</span><h4>Итоги</h4></div>
        <p>Спроектирован и запущен MVP мобильного приложения для семейной безопасности. Расширенная аналитика перемещений и гибкие настройки приватности зафиксированы как направление для дальнейшего развития.</p>
        <div class="outcome-card">
          <span class="outcome-kicker">Ключевые результаты MVP</span>
          <ul class="outcome-list">
            <li>Сформировать и протестировать ключевые пользовательские сценарии (геолокация, семейный круг, экстренные уведомления и коммуникация)</li>
            <li>Провести первичное юзабилити-тестирование и собрать обратную связь по ключевым функциям</li>
            <li>Проработать модель монетизации на основе freemium-подхода с премиум-подпиской и пробным периодом, валидировав готовность пользователей к оплате за расширенные сценарии</li>
          </ul>
        </div>
      </div>
```

Note: the "Выводы" block uses inline flex rows instead of the `.detail-list`/`.detail-list-item` classes from the old site — either add those two classes back into this page's `<style>` (`.detail-list{display:flex;flex-direction:column;gap:12px}` / `.detail-list-item{display:flex;gap:10px}` / `.detail-list-item .arrow-icon{color:var(--case-accent);font-family:var(--mono)}`) and use them instead of inline styles, or keep the inline styles shown above — either is fine, but be consistent and don't leave both.

- [ ] **Step 2: Verify the page**

```bash
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8095/case-360-tracker.html', {waitUntil:'networkidle0'});
  const h1 = await page.\$eval('h1', el => el.textContent);
  const blockCount = await page.\$\$eval('.detail-block', els => els.length);
  const imgsNoAlt = await page.\$\$eval('img', els => els.filter(i => !i.alt.trim()).length);
  console.log('h1:', h1, 'blocks:', blockCount, 'imgsNoAlt:', imgsNoAlt, 'errors:', errors);
  await browser.close();
})();
"
```

Expected: `h1: 360 Tracker`, `blocks: 13`, `imgsNoAlt: 0`, `errors: []`.

- [ ] **Step 3: Commit**

```bash
git add case-360-tracker.html
git commit -m "Add case-360-tracker.html"
```

---

## Task 10: Build `case-namaste.html`

**Files:**
- Create: `case-namaste.html`

**Interfaces:**
- Consumes: `SHARED_HEAD` + `SHARED_LIGHTBOX_JS` from Task 2; linked from `index.html`'s fourth work tile
- Produces: the page at `case-namaste.html`

- [ ] **Step 1: Write the full page**

Same shell as Task 7 with `--case-accent: #b89a5a;`, and:

```html
<title>Namaste — Мадина Рашидова</title>
<meta name="description" content="Namaste — MVP мобильного приложения для йоги, фитнеса и медитации за 3 месяца. Разбор процесса: анализ рынка, айдентика, итоги.">
```

```html
      <div class="case-header">
        <h1 class="case-title">Namaste</h1>
        <div class="case-meta-line">iOS · MVP за 3 месяца</div>
        <div class="case-tags">/mobile /0→1 /brand+ui</div>
        <div class="metrics">
          <div class="metric"><div class="value">4</div><div class="label">конкурента в анализе</div></div>
          <div class="metric"><div class="value">reuse</div><div class="label">логика — из предыдущего проекта</div></div>
        </div>
      </div>

      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(01)</span><h4>Моя роль</h4></div>
        <p>Работала продуктовым дизайнером в проекте по созданию мобильного приложения для онлайн-тренировок. Запускали MVP, поэтому на старте сфокусировалась на исследовании: изучила конкурентов и помогла определить структуру и логику приложения. Дальше отвечала за визуальную часть и пользовательский опыт: разработала концепцию дизайна, айдентику и интерфейсы. На этапе разработки тесно взаимодействовала с программистом, проводила дизайн-ревью и следила за соответствием финального продукта изначальной идее.</p>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(02)</span><h4>Исследование</h4></div>
        <p>Проект нужно было реализовать в сжатые сроки, поэтому вместо глубинных исследований сфокусировалась на анализе рынка: Down Dog, Yoga for Beginners, Yoga Fit и Daily Yoga по ключевым продуктовым показателям, напрямую влияющим на пользовательский опыт.</p>
        <img src="assets/process/namaste-competitors.png" alt="Namaste — сравнение конкурентов" loading="lazy" onclick="openLightbox(event, 'assets/process/namaste-competitors.png', 'Namaste — сравнение конкурентов')">
        <p style="margin-top:18px">Ключевая проблема рынка: отсутствие продукта, который одновременно даёт понятную навигацию новичкам и достаточную гибкость и персонализацию продвинутым пользователям.</p>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(03)</span><h4>Определение задачи</h4></div>
        <div class="problem-statement">
          <span class="quote-mark">"</span>
          <p>Спроектировать йога-приложение с понятным стартовым опытом, которое при этом постепенно раскрывает уровни персонализации и сложные функции.</p>
        </div>
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(04)</span><h4>Работа над продуктом</h4></div>
        <p>Ключевой ценностью категории определили персонализированное планирование тренировок. Этот сценарий стал основой архитектуры продукта. Важно было сохранить баланс между простотой входа для новичков и вариативностью для продвинутых, не перегружая интерфейс количеством направлений. Отдельным ограничением стал отказ от мультиформатного контента и случайных тренировок в пользу заранее подобранных видеоуроков от тренеров, чтобы сохранить ощущение «живого» и качественно подобранного опыта.</p>
        <img src="assets/process/namaste-directions.png" alt="Namaste — направления йоги" loading="lazy" onclick="openLightbox(event, 'assets/process/namaste-directions.png', 'Namaste — направления йоги')">
        <p style="margin-top:18px">В основе продукта: базовые практики (Хатха-йога, Йога Айенгара) и более динамичные направления для пользователей с высокой нагрузкой (Аштанга, Виньяса-флоу). Для каждого направления предусмотрены три уровня сложности, начинающий, продвинутый и мастер, что даёт понятную прогрессию внутри приложения.</p>
        <img src="assets/process/namaste-progression.png" alt="Namaste — уровни сложности" loading="lazy" onclick="openLightbox(event, 'assets/process/namaste-progression.png', 'Namaste — уровни сложности')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(05)</span><h4>Health-функции</h4></div>
        <p>Вопрос: за счёт чего продукт может выделиться на фоне конкурентов при существующих ограничениях, не усложняя основной сценарий тренировок. Гипотеза: расширение за счёт смежных health-функций повысит вовлечённость и усилит восприятие приложения как комплексного инструмента заботы о себе. В условиях ограниченных ресурсов оценивала направления расширения через сложность реализации, пользовательскую ценность и влияние на монетизацию.</p>
        <img src="assets/process/namaste-health-table.png" alt="Namaste — оценка health-функций" loading="lazy" onclick="openLightbox(event, 'assets/process/namaste-health-table.png', 'Namaste — оценка health-функций')">
        <p style="margin-top:18px">Решение: интегрировать трекер сна и потребления воды. Реализацию упростило то, что ранее уже был запущен персонализированный трекер сна: переиспользовала его логику, адаптировав под новый контекст, и добавила отслеживание воды как дополнительный показатель. На тестировании респонденты позитивно отреагировали на расширение функциональности.</p>
        <img src="assets/process/namaste-health.png" alt="Namaste — health-функции" loading="lazy" onclick="openLightbox(event, 'assets/process/namaste-health.png', 'Namaste — health-функции')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(06)</span><h4>Финальный концепт</h4></div>
        <img src="assets/process/namaste-keyactions.png" alt="Namaste — key actions" loading="lazy" onclick="openLightbox(event, 'assets/process/namaste-keyactions.png', 'Namaste — key actions')">
        <img src="assets/process/namaste-actions.png" alt="Namaste — ключевые действия" loading="lazy" onclick="openLightbox(event, 'assets/process/namaste-actions.png', 'Namaste — ключевые действия')">
      </div>
      <div class="detail-block">
        <div class="detail-head"><span class="detail-num">(07)</span><h4>Итоги</h4></div>
        <p>Спроектирован и запущен MVP мобильного приложения для йоги, фитнеса и медитации.</p>
        <div class="outcome-card">
          <span class="outcome-kicker">Что получилось</span>
          <ul class="outcome-list">
            <li>Узнать потребности будущих клиентов и собрать бэклог</li>
            <li>Собрать и протестировать базовый пользовательский сценарий тренировок</li>
            <li>Выявить зоны роста в контентной части и логике прогрессии</li>
          </ul>
        </div>
      </div>
```

- [ ] **Step 2: Verify the page**

```bash
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:8095/case-namaste.html', {waitUntil:'networkidle0'});
  const h1 = await page.\$eval('h1', el => el.textContent);
  const blockCount = await page.\$\$eval('.detail-block', els => els.length);
  const imgsNoAlt = await page.\$\$eval('img', els => els.filter(i => !i.alt.trim()).length);
  console.log('h1:', h1, 'blocks:', blockCount, 'imgsNoAlt:', imgsNoAlt, 'errors:', errors);
  await browser.close();
})();
"
```

Expected: `h1: Namaste`, `blocks: 7`, `imgsNoAlt: 0`, `errors: []`.

- [ ] **Step 3: Commit**

```bash
git add case-namaste.html
git commit -m "Add case-namaste.html"
```

---

## Task 11: Cross-page QA pass and old-file cleanup

**Files:**
- Modify: none (verification only), unless issues are found, in which case fix them in the relevant file from Tasks 3–10

**Interfaces:**
- Consumes: all 5 pages from Tasks 3–10
- Produces: a verified, complete site — the final task

- [ ] **Step 1: Verify every grid link resolves to a real, working page**

```bash
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.goto('http://localhost:8095/index.html', {waitUntil:'networkidle0'});
  const hrefs = await page.\$\$eval('.work-tile', els => els.map(e => e.getAttribute('href')));
  for (const href of hrefs) {
    const res = await page.goto('http://localhost:8095/' + href, {waitUntil:'networkidle0'});
    console.log(href, res.status());
    const back = await page.\$('a.back-link');
    const backHref = await page.evaluate(el => el.getAttribute('href'), back);
    console.log('  back-link ->', backHref);
  }
  await browser.close();
})();
"
```

Expected: every href responds `200`, and every `back-link` points to `index.html`.

- [ ] **Step 2: Re-run the accessibility + performance checks from the original audit against every page**

```bash
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const pages = ['index.html','case-alif-partners.html','case-eaj-trader.html','case-360-tracker.html','case-namaste.html'];
  for (const p of pages) {
    const page = await browser.newPage();
    await page.goto('http://localhost:8095/' + p, {waitUntil:'networkidle0'});
    const info = await page.evaluate(() => ({
      h1Count: document.querySelectorAll('h1').length,
      hasDescription: !!document.querySelector('meta[name=description]')?.content,
      imgsMissingAlt: Array.from(document.querySelectorAll('img')).filter(i => !i.alt.trim()).length,
    }));
    console.log(p, JSON.stringify(info));
    await page.close();
  }
  await browser.close();
})();
"
du -sh /Users/madinarasidova/madina-portfolio-deploy/assets
```

Expected: every page reports `h1Count: 1`, `hasDescription: true`, `imgsMissingAlt: 0`; total `assets/` size stays well under the original 21M (should be in the low single-digit MB range after Task 1).

- [ ] **Step 3: Check `prefers-reduced-motion` disables the tag-row and pulse animations**

```bash
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto('http://localhost:8095/index.html', {waitUntil:'networkidle0'});
  const cursorHidden = await page.\$eval('#typeCursor', el => getComputedStyle(el).display === 'none');
  console.log('typewriter cursor hidden under reduced motion:', cursorHidden);
  await browser.close();
})();
"
```

Expected: `typewriter cursor hidden under reduced motion: true`.

- [ ] **Step 4: Mobile viewport check**

```bash
node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:true});
  const page = await browser.newPage();
  await page.setViewport({width:375, height:812});
  await page.goto('http://localhost:8095/index.html', {waitUntil:'networkidle0'});
  const cols = await page.\$eval('.work-grid', el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  console.log('grid columns at 375px:', cols, 'horizontal overflow:', overflow);
  await browser.close();
})();
"
```

Expected: `grid columns at 375px: 1`, `horizontal overflow: false`.

- [ ] **Step 5: Stop the local test server**

```bash
lsof -ti:8095 | xargs kill 2>/dev/null || true
```

- [ ] **Step 6: Final commit**

```bash
cd /Users/madinarasidova/madina-portfolio-deploy
git add -A
git status --short   # confirm nothing unexpected is staged
git commit -m "Verify redesigned site end-to-end" --allow-empty
```

(The `--allow-empty` is only needed if Steps 1–4 found nothing to fix — if they did, that fix should already have been committed against the specific task's file in an earlier task, and this final commit can be dropped or used to capture that fix if it wasn't committed yet.)

---

## Self-review notes

- **Spec coverage:** every section of the v2 spec maps to a task — hero (3–4), work grid (5), experience/footer (6), the 4 case pages (7–10), image optimization (1), shared tokens (2), and final QA (11). The two "Open items" from the spec (warmer copy pass, exact accent hex values) are resolved: hex values are pinned per case in Tasks 7–10, and the bio line already got a first warmer-tone pass in Task 3's `.hero-desc` text ("Привет — я проектирую...") — flag to the user during execution that this is a first draft of "warmer," not a final copy review.
- **Type/name consistency checked:** `#tagRow` (Task 3) matches the ID `initChipPhysics`'s replacement script queries in Task 4; `.work-tile` / `.work-caption` class names match between Task 5's CSS and markup; `openLightbox`/`closeLightbox` function names and `#lightbox`/`#lightboxImg` ids match between Task 2's shared block and every case page's inline `onclick` handlers in Tasks 7–10.
- **No placeholders:** every task's code block is complete, runnable markup/CSS/JS or a real shell command with concrete expected output — none deferred to "later" or another task's prose description.
