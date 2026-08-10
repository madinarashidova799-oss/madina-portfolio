(function () {
  function apply(lang) {
    document.documentElement.classList.toggle('lang-en', lang === 'en');
    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      btn.textContent = lang === 'ru' ? 'EN' : 'RU';
      btn.setAttribute('aria-label', lang === 'ru' ? 'Switch to English' : 'Переключить на русский');
    });

    var titleEl = document.querySelector('title[data-en]');
    if (titleEl) titleEl.textContent = lang === 'en' ? titleEl.getAttribute('data-en') : titleEl.getAttribute('data-ru');

    var descEl = document.querySelector('meta[name="description"][data-en]');
    if (descEl) descEl.setAttribute('content', lang === 'en' ? descEl.getAttribute('data-en') : descEl.getAttribute('data-ru'));

    // alt is an attribute, not markup, so it can't hold the [data-lang] span pair
    // used everywhere else — content images carry data-alt-ru/data-alt-en instead.
    document.querySelectorAll('img[data-alt-ru]').forEach(function (img) {
      var next = lang === 'en' ? img.getAttribute('data-alt-en') : img.getAttribute('data-alt-ru');
      if (next !== null) img.setAttribute('alt', next);
    });

    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply(localStorage.getItem('site-lang') || 'ru');
    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var next = (localStorage.getItem('site-lang') || 'ru') === 'ru' ? 'en' : 'ru';
        localStorage.setItem('site-lang', next);
        apply(next);
      });
    });
  });
})();
