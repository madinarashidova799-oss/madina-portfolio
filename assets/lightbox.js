// Shared, accessible lightbox — used by all 4 case pages.
// Content images are real <button class="case-image-trigger"> elements wrapping an <img>,
// so Enter/Space/click all open the lightbox natively; no role="button" hacks needed.
(function () {
  'use strict';

  var LABELS = {
    ru: { open: 'Открыть увеличенное изображение: ', close: 'Закрыть изображение' },
    en: { open: 'Open full-size image: ', close: 'Close image' }
  };

  function currentLang() {
    return document.documentElement.classList.contains('lang-en') ? 'en' : 'ru';
  }

  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.case-image-trigger'));
  var lastTrigger = null;

  function labelFor(trigger) {
    var img = trigger.querySelector('img');
    var lang = currentLang();
    var caption = img ? (lang === 'en' ? img.getAttribute('data-alt-en') : img.getAttribute('data-alt-ru')) : '';
    return LABELS[lang].open + (caption || '');
  }

  function applyLabels() {
    triggers.forEach(function (trigger) { trigger.setAttribute('aria-label', labelFor(trigger)); });
    if (closeBtn) closeBtn.setAttribute('aria-label', LABELS[currentLang()].close);
  }
  applyLabels();
  document.addEventListener('langchange', applyLabels);

  if (!lightbox || !lightboxImg || !triggers.length) return;

  function focusableInLightbox() {
    // The lightbox only ever contains one real interactive control (the close
    // button) — the image itself has no tabindex, so it never receives focus.
    return Array.prototype.slice.call(lightbox.querySelectorAll('button, [href]'))
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function openLightbox(trigger) {
    var img = trigger.querySelector('img');
    if (!img) return;
    lastTrigger = trigger;
    lightboxImg.src = img.getAttribute('src');
    lightboxImg.alt = currentLang() === 'en' ? (img.getAttribute('data-alt-en') || '') : (img.getAttribute('data-alt-ru') || '');
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    document.body.style.overflow = '';
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () { openLightbox(trigger); });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;

    if (e.key === 'Escape') { closeLightbox(); return; }

    // Trap focus inside the open lightbox — background stays non-interactive.
    if (e.key === 'Tab') {
      var focusable = focusableInLightbox();
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-hidden', 'true');
})();
