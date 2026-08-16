(function () {
  'use strict';

  // Cyclical case order + "next case" destination.
  // The href/title in each page's markup are static real <a> elements and
  // work without this file; this config is the single source of truth for
  // the sequence and for building the like button's per-case aria-label.
  var CASES = {
    'alif-partners': { title: 'Alif Partners', next: 'eaj-trader', nextUrl: 'case-eaj-trader.html' },
    'eaj-trader': { title: 'EAJ Trader', next: 'namaste', nextUrl: 'case-namaste.html' },
    'namaste': { title: 'Namaste', next: '360-tracker', nextUrl: 'case-360-tracker.html' },
    '360-tracker': { title: '360 Tracker', next: 'alif-partners', nextUrl: 'case-alif-partners.html' },
    'about': { title: '«Обо мне»' }
  };

  // Local per-browser persistence.
  // Replace this adapter with a backend API for shared global counts.
  var LikesStore = {
    KEY: 'portfolioLikes',
    _read: function () {
      try {
        var raw = localStorage.getItem(this.KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    },
    _write: function (data) {
      try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch (e) {}
    },
    get: function (caseId) {
      var all = this._read();
      return all[caseId] || { liked: false, count: 0 };
    },
    toggle: function (caseId) {
      var all = this._read();
      var current = all[caseId] || { liked: false, count: 0 };
      var liked = !current.liked;
      var count = Math.max(0, current.count + (liked ? 1 : -1));
      all[caseId] = { liked: liked, count: count };
      this._write(all);
      return all[caseId];
    }
  };

  function currentLang() {
    return document.documentElement.classList.contains('lang-en') ? 'en' : 'ru';
  }

  var STRINGS = {
    ru: {
      likeOn: function (name) { return 'Поставить лайк кейсу ' + name; },
      likeOff: function (name) { return 'Убрать лайк с кейса ' + name; },
      added: 'Лайк добавлен',
      removed: 'Лайк убран',
      nav: 'Навигация по кейсам'
    },
    en: {
      likeOn: function (name) { return 'Like the ' + name + ' case'; },
      likeOff: function (name) { return 'Remove like from the ' + name + ' case'; },
      added: 'Like added',
      removed: 'Like removed',
      nav: 'Case navigation'
    }
  };

  function initLike(btn) {
    var caseId = btn.getAttribute('data-case-id');
    var caseInfo = CASES[caseId];
    var name = caseInfo ? caseInfo.title : caseId;
    var countEl = btn.querySelector('.case-like__count');
    var nav = btn.closest('.case-floating-nav');
    var liveEl = nav ? nav.querySelector('[data-case-live]') : null;

    function render(state, announce) {
      var strings = STRINGS[currentLang()];
      btn.classList.toggle('is-liked', state.liked);
      btn.setAttribute('aria-pressed', state.liked ? 'true' : 'false');
      btn.setAttribute('aria-label', state.liked ? strings.likeOff(name) : strings.likeOn(name));
      if (countEl) countEl.textContent = state.count;
      if (announce && liveEl) liveEl.textContent = state.liked ? strings.added : strings.removed;
    }

    render(LikesStore.get(caseId), false);

    btn.addEventListener('click', function () {
      // Guards against a double toggle firing from a fast repeated click/key
      // while the previous toggle's read-modify-write + animation settle.
      if (btn.dataset.busy === '1') return;
      btn.dataset.busy = '1';
      setTimeout(function () { btn.dataset.busy = ''; }, 260);

      var state = LikesStore.toggle(caseId);
      render(state, true);

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        btn.classList.remove('is-pulsing');
        void btn.offsetWidth; // restart the pulse animation on repeated clicks
        btn.classList.add('is-pulsing');
      }
    });

    document.addEventListener('langchange', function () {
      render(LikesStore.get(caseId), false);
    });
  }

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
    var likeBtn = dock.querySelector('.case-like');
    if (likeBtn) initLike(likeBtn);
  }
})();
