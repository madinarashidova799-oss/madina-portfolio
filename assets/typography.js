(function () {
  'use strict';

  // Runs once per page load against the Russian half of every bilingual
  // [data-lang="ru"] / [data-lang-block="ru"] span (see assets/i18n.js — both
  // languages sit in the DOM at once, CSS just hides one). English text is
  // never touched. Only text nodes are rewritten, so nested markup (links,
  // <strong>, etc.) and all attributes are left exactly as they were.

  var SHORT_WORDS = ['в', 'во', 'и', 'а', 'но', 'с', 'со', 'к', 'ко', 'у', 'о', 'об', 'от', 'до', 'за', 'из', 'на', 'по', 'не', 'ни', 'же', 'бы', 'ли'];

  var NBSP = "\u00A0";
  var CYRILLIC_LATIN = 'A-Za-zА-Яа-яЁё';

  // Zero-width lookbehind for the boundary (instead of a consumed capture
  // group) so back-to-back short words ("и о продукте") both match — a
  // consuming boundary group would eat the separating space needed by the
  // next match.
  var SHORT_WORD_RE = new RegExp(
    '(?<=^|[^' + CYRILLIC_LATIN + '])(' + SHORT_WORDS.join('|') + ')[ \\t]+(?=\\S)',
    'giu'
  );

  // Number stays glued to whatever follows it: another digit group (thousand
  // separator), a unit word, or a %/currency sign.
  var NUMBER_RE = /(\d)[ \t]+(?=[\d%₽€$а-яёА-ЯЁ])/g;

  // Initials glued to the surname that follows: "А." or "А.С." + surname.
  var INITIALS_RE = /([А-ЯЁ]\.(?:[ \t]?[А-ЯЁ]\.)?)[ \t]+(?=[А-ЯЁ][а-яё]+)/g;

  // Last two "words" of a block, glued so the final line of a paragraph
  // never carries a single orphaned short word. Deliberately unconditional —
  // joining only the last pair never breaks a line that already had more
  // than two words on it.
  var LAST_PAIR_RE = /(\S+)[ \t]+(\S+)([.,!?…»"'\)\]]*)\s*$/u;

  var FULL_SELECTOR = 'p, li, blockquote, .project-description, .case-description, .card-description, .metric-text, .caption';
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, SVG: 1 };

  function applyInlineRules(text) {
    return text
      .replace(SHORT_WORD_RE, function (m, word) { return word + NBSP; })
      .replace(NUMBER_RE, function (m, digit) { return digit + NBSP; })
      .replace(INITIALS_RE, function (m, initials) { return initials + NBSP; });
  }

  function collectTextNodes(root) {
    var nodes = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var el = node.parentElement;
        while (el && el !== root.parentElement) {
          if (SKIP_TAGS[el.tagName]) return NodeFilter.FILTER_REJECT;
          el = el.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  function process(root) {
    if (root.dataset.typographyDone === '1') return;

    var textNodes = collectTextNodes(root);
    if (!textNodes.length) return;

    textNodes.forEach(function (node) {
      node.data = applyInlineRules(node.data);
    });

    if (root.closest(FULL_SELECTOR)) {
      for (var i = textNodes.length - 1; i >= 0; i--) {
        var node = textNodes[i];
        if (!node.data.trim()) continue;
        node.data = node.data.replace(LAST_PAIR_RE, function (m, w1, w2, tail) {
          return w1 + NBSP + w2 + tail;
        });
        break;
      }
    }

    root.dataset.typographyDone = '1';
  }

  function run() {
    document.querySelectorAll('[data-lang="ru"], [data-lang-block="ru"]').forEach(process);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
