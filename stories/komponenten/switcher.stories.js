import { esc } from '../helpers.js';

const LANGS = [
  { code: 'de', short: 'DE', name: 'Deutsch' },
  { code: 'en', short: 'EN', name: 'English' },
];

const VIEWS = [
  { icon: 'view_module', name: 'Kacheln' },
  { icon: 'view_list', name: 'Liste' },
  { icon: 'view_headline', name: 'Tabelle' },
];

/** Sprachwahl als Navigation – dasselbe Markup, das die Doku als Quelltext zeigt */
function languages(current = 'de') {
  return [
    '<nav aria-label="Sprache">',
    '  <ul class="cda-switcher">',
    ...LANGS.map(
      ({ code, short, name }) =>
        `    <li><a class="cda-switcher__item" href="#${code}" hreflang="${code}" lang="${code}" aria-label="${name}, ${short}"${
          code === current ? ' aria-current="page"' : ''
        }>${short}</a></li>`,
    ),
    '  </ul>',
    '</nav>',
  ].join('\n');
}

/** Ansichtswahl als Button-Gruppe */
function views({ current = 'Kacheln', withText = false, disabled = [] } = {}) {
  return [
    '<div class="cda-switcher" role="group" aria-label="Ansicht">',
    ...VIEWS.map(({ icon, name }) => {
      const label = withText ? '' : ` aria-label="${name}"`;
      const text = withText ? ` ${esc(name)}` : '';
      return `  <button type="button" class="cda-switcher__item" aria-pressed="${name === current}"${label}${
        disabled.includes(name) ? ' disabled' : ''
      }><span class="cda-icon" aria-hidden="true">${icon}</span>${text}</button>`;
    }),
    '</div>',
  ].join('\n');
}

/** Nur für die Vorführung: Auswahl umschalten wie im Projekt per JavaScript */
function demo({ canvasElement }) {
  for (const group of canvasElement.querySelectorAll('[role="group"].cda-switcher')) {
    group.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button || button.disabled) return;
      for (const b of group.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b === button));
    });
  }
  for (const link of canvasElement.querySelectorAll('nav .cda-switcher__item')) {
    link.addEventListener('click', (event) => event.preventDefault());
  }
}

export default {
  title: 'Komponenten/Switcher',
  decorators: [(story) => `<div class="docs-sample"><div class="docs-row">${story()}</div></div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
  play: demo,
};

export const Sprache = {
  render: () => languages('de'),
};

export const Ansicht = {
  render: () => views(),
};

export const AnsichtMitText = {
  name: 'Ansicht mit Text',
  render: () => views({ withText: true, current: 'Liste' }),
};

/** In cranach-search sind im eingeschränkten Modus nicht alle Ansichten verfügbar */
export const AnsichtTeilweiseDeaktiviert = {
  name: 'Ansicht, teilweise deaktiviert',
  render: () => views({ disabled: ['Tabelle'] }),
};
