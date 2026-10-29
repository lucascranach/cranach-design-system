import { esc } from '../helpers.js';
import { LOGO } from '../logo.js';

const MAIN = ['Werke', 'Grafiken', 'Archivalien', 'Literatur', 'Über das Projekt'];

const indent = (html, depth) =>
  html
    .split('\n')
    .map((l) => '  '.repeat(depth) + l)
    .join('\n');

const languages = [
  '<nav aria-label="Sprache">',
  '  <ul class="cda-switcher">',
  '    <li><a class="cda-switcher__item" href="#de" hreflang="de" lang="de" aria-label="Deutsch, DE" aria-current="page">DE</a></li>',
  '    <li><a class="cda-switcher__item" href="#en" hreflang="en" lang="en" aria-label="English, EN">EN</a></li>',
  '  </ul>',
  '</nav>',
].join('\n');

/** Header – dasselbe Markup, das die Doku als Quelltext zeigt */
function header({ items, current, id, sticky = false, open = false }) {
  return [
    `<header class="cda-header${sticky ? ' cda-header--sticky' : ''}">`,
    '  <a class="cda-header__brand" href="#start" aria-label="Cranach Digital Archive, Startseite">',
    `    ${LOGO}`,
    '  </a>',
    `  <button type="button" class="cda-button cda-button--ghost cda-button--icon cda-header__toggle" aria-expanded="${open}" aria-controls="${id}" aria-label="Menü">`,
    '    <span class="cda-icon cda-header__icon-open" aria-hidden="true">menu</span>',
    '    <span class="cda-icon cda-header__icon-close" aria-hidden="true">close</span>',
    '  </button>',
    `  <nav class="cda-header__nav" id="${id}" aria-label="Hauptnavigation">`,
    '    <ul class="cda-header__menu">',
    ...items.map(
      (item) =>
        `      <li><a class="cda-header__link" href="#${esc(item.toLowerCase().replace(/\s+/g, '-'))}"${
          item === current ? ' aria-current="page"' : ''
        }>${esc(item)}</a></li>`,
    ),
    '    </ul>',
    '  </nav>',
    '  <div class="cda-header__actions">',
    indent(languages, 2),
    '  </div>',
    '</header>',
  ].join('\n');
}

/**
 * Nur für die Vorführung – so ähnlich schaltet das Projekt das Menü per JavaScript:
 * Klick auf den Button wechselt aria-expanded, Escape schließt und setzt den Fokus zurück.
 */
function demo({ canvasElement }) {
  for (const button of canvasElement.querySelectorAll('.cda-header__toggle')) {
    const nav = canvasElement.querySelector(`#${button.getAttribute('aria-controls')}`);
    const set = (open) => button.setAttribute('aria-expanded', String(open));
    button.addEventListener('click', () => set(button.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        set(false);
        button.focus();
      }
    });
  }
  for (const link of canvasElement.querySelectorAll('a')) {
    link.addEventListener('click', (event) => event.preventDefault());
  }
}

export default {
  title: 'Komponenten/Header',
  decorators: [(story) => `<div class="docs-sample">${story()}</div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
  play: demo,
};

/** Hauptseite lucascranach.org, Bereich „Werke“ aktiv */
export const Standard = {
  render: () => header({ items: MAIN, current: 'Werke', id: 'hauptnavigation-standard' }),
};

/** Werkseite in cranach-artefacts: Wege zurück in die Suche */
export const Werkseite = {
  render: () => header({ items: ['Zur Werksuche', 'Zur Literatursuche'], id: 'hauptnavigation-werk' }),
};

/** Schmaler Header (unter 48rem): Navigation hinter dem Menü-Button, hier geöffnet */
export const Schmal = {
  render: () =>
    `<div style="max-inline-size: 24rem; min-block-size: 22rem">\n${header({
      items: MAIN,
      current: 'Werke',
      id: 'hauptnavigation-schmal',
      open: true,
    })}\n</div>`,
};
