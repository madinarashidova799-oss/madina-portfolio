(function () {
  'use strict';

  function currentLang() {
    return document.documentElement.classList.contains('lang-en') ? 'en' : 'ru';
  }

  var STRINGS = {
    ru: { nav: 'Навигация по кейсам' },
    en: { nav: 'Case navigation' }
  };

  function initNavLabel(nav) {
    // Runs immediately below (this script tag sits after the dock markup in the
    // DOM, so the element already exists — no need to wait for DOMContentLoaded,
    // which would leave a brief window where a screen reader could announce the
    // hardcoded Russian fallback label even in EN mode).
    function apply() { nav.setAttribute('aria-label', STRINGS[currentLang()].nav); }
    apply();
    document.addEventListener('langchange', apply);
  }

  // The dock is a persistently fixed element, not a scroll-triggered reveal —
  // give it the same one-time load fade the top nav uses instead of an
  // IntersectionObserver entrance (there is nothing to "scroll into view").
  function initEntrance(dock) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dock.classList.add('is-inview');
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { dock.classList.add('is-inview'); });
    });
  }

  // Case pages are long enough that the fixed top nav will, at some scroll
  // position, sit directly over body content (metrics, headings, paragraphs)
  // — not just the metrics block, any block, since the nav is a permanently
  // opaque pill with no scroll awareness. Hiding it on scroll-down and
  // bringing it back on scroll-up (or near the top) is the standard fix for
  // that class of problem, rather than nudging spacing around one block.
  function initNavAutoHide() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var lastY = window.pageYOffset;
    var ticking = false;

    function update() {
      var y = window.pageYOffset;
      var scrollingDown = y > lastY;
      if (y < 40 || !scrollingDown) {
        nav.classList.remove('is-nav-hidden');
      } else if (y > 120) {
        nav.classList.add('is-nav-hidden');
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    // A hidden nav keeps its links in tab order (opacity/pointer-events, not
    // display:none) — bring it back the moment focus lands inside it so a
    // keyboard user is never left tabbing into an invisible control.
    nav.addEventListener('focusin', function () { nav.classList.remove('is-nav-hidden'); });
  }

  initNavAutoHide();

  var dock = document.querySelector('.case-floating-nav');
  if (dock) {
    initNavLabel(dock);
    initEntrance(dock);
  }
})();
