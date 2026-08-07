(function () {
  function apply(lang) {
    document.documentElement.classList.toggle('lang-en', lang === 'en');
    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      btn.textContent = lang === 'ru' ? 'EN' : 'RU';
    });

    var titleEl = document.querySelector('title[data-en]');
    if (titleEl) titleEl.textContent = lang === 'en' ? titleEl.getAttribute('data-en') : titleEl.getAttribute('data-ru');

    var descEl = document.querySelector('meta[name="description"][data-en]');
    if (descEl) descEl.setAttribute('content', lang === 'en' ? descEl.getAttribute('data-en') : descEl.getAttribute('data-ru'));

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
