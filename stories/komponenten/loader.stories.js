import { esc } from '../helpers.js';

const WORKS = [
  ['Adam und Eva', '1526'],
  ['Bildnis Martin Luther', '1528'],
  ['Venus und Amor', '1531'],
  ['Das Urteil des Paris', '1528'],
  ['Der Jungbrunnen', '1546'],
  ['Bildnis Katharina von Bora', '1529'],
];

const spinner = '<span class="cda-spinner" aria-hidden="true"></span>';

/** Lade-Overlay – dasselbe Markup, das die Doku als Quelltext zeigt */
const loader = (text) =>
  ['<div class="cda-loader" role="status">', '  <div class="cda-loader__panel">', `    ${spinner}`, `    ${esc(text)}`, '  </div>', '</div>'].join('\n');

export default {
  title: 'Komponenten/Loader',
  decorators: [(story) => `<div class="docs-sample">${story()}</div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
};

export const Spinner = {
  render: () =>
    `<div class="docs-row">
  <p>Bild wird vorbereitet ${spinner}</p>
  <p style="font-size: var(--cda-font-size-xl)">${spinner}</p>
  <p style="font-size: var(--cda-font-size-3xl)">${spinner}</p>
</div>`,
};

/** Wie der Download-Link in cranach-artefacts: Spinner statt Icon, solange die Datei entsteht */
export const AmLink = {
  name: 'Am Link',
  render: () =>
    `<p>
  <a href="#download" aria-busy="true">Bild in voller Größe herunterladen ${spinner}</a>
</p>`,
};

/** Über einer Trefferliste, wie cloak in cranach-search */
export const Overlay = {
  render: () =>
    [
      '<div style="position: relative; max-inline-size: 32rem" aria-busy="true">',
      '  <ul>',
      ...WORKS.map(([title, year]) => `    <li>${esc(title)}, ${year}</li>`),
      '  </ul>',
      loader('Ergebnisse werden geladen')
        .split('\n')
        .map((l) => `  ${l}`)
        .join('\n'),
      '</div>',
    ].join('\n'),
};

/** Platzhalter für einen Absatz und für eine Werk-Karte */
export const Skeleton = {
  render: () =>
    `<div class="docs-row" aria-busy="true">
  <div aria-hidden="true" style="inline-size: 20rem">
    <div class="cda-skeleton cda-skeleton--text"></div>
    <div class="cda-skeleton cda-skeleton--text"></div>
    <div class="cda-skeleton cda-skeleton--text"></div>
  </div>
  <div aria-hidden="true" style="inline-size: 12rem">
    <div class="cda-skeleton" style="aspect-ratio: 3 / 4"></div>
    <div class="cda-skeleton cda-skeleton--text"></div>
    <div class="cda-skeleton cda-skeleton--text"></div>
  </div>
</div>`,
};
