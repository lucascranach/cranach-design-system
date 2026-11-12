import { esc } from '../helpers.js';

const PAINTINGS = [
  { title: 'Kreuzigung Christi', date: '1501', collection: 'Kunsthistorisches Museum Wien', inventory: 'GG 6905', images: 14 },
  { title: 'Bildnis Martin Luther', date: '1528', collection: 'Klassik Stiftung Weimar', inventory: 'G 25', images: 6 },
  { title: 'Venus', date: '1532', collection: 'Städel Museum, Frankfurt am Main', inventory: '1125', images: 9 },
  { title: 'Melancholie', date: '1532', collection: 'Statens Museum for Kunst, Kopenhagen', inventory: 'KMS 3', images: 11 },
  { title: 'Adam und Eva', date: '1526', collection: 'The Courtauld, London', inventory: 'P.1947.LF.77', images: 22 },
];

const COLUMNS = [
  { key: 'title', label: 'Titel' },
  { key: 'date', label: 'Datierung' },
  { key: 'collection', label: 'Sammlung' },
  { key: 'inventory', label: 'Inventarnummer' },
  { key: 'images', label: 'Abbildungen', number: true },
];

const cell = (column, value) => {
  const cls = column.number ? ' class="cda-table__number"' : '';
  return column.key === 'title' ? `<th scope="row"${cls}><a href="#">${esc(value)}</a></th>` : `<td${cls}>${esc(value)}</td>`;
};

const body = (rows) =>
  rows.map((row) => `    <tr>${COLUMNS.map((c) => cell(c, row[c.key])).join('')}</tr>`).join('\n');

const head = (sortable, sorted = {}) =>
  COLUMNS.map((c) => {
    const attrs = [`scope="col"`, c.number && 'class="cda-table__number"', sorted.key === c.key && `aria-sort="${sorted.dir}"`]
      .filter(Boolean)
      .join(' ');
    const label = sortable ? `<button type="button" class="cda-table__sort" data-key="${c.key}">${esc(c.label)}</button>` : esc(c.label);
    return `<th ${attrs}>${label}</th>`;
  }).join('');

/** Tabelle – dasselbe Markup, das die Doku als Quelltext zeigt */
const table = ({ modifiers = [], caption = 'Gemälde (Auswahl)', id = 'gemaelde', sortable = false, sorted, rows = PAINTINGS }) =>
  [
    `<div class="cda-table-scroll" role="region" tabindex="0" aria-labelledby="${id}-titel">`,
    `  <table class="${['cda-table', ...modifiers.map((m) => `cda-table--${m}`)].join(' ')}">`,
    `    <caption id="${id}-titel">${esc(caption)}</caption>`,
    `    <thead>`,
    `      <tr>${head(sortable, sorted)}</tr>`,
    `    </thead>`,
    `    <tbody>`,
    body(rows)
      .split('\n')
      .map((l) => `    ${l}`)
      .join('\n'),
    `    </tbody>`,
    `  </table>`,
    `</div>`,
  ].join('\n');

const noLinks = ({ canvasElement }) => {
  for (const link of canvasElement.querySelectorAll('a')) link.addEventListener('click', (event) => event.preventDefault());
};

export default {
  title: 'Komponenten/Tabelle',
  decorators: [(story) => `<div class="docs-sample">${story()}</div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
  play: noLinks,
};

export const Standard = {
  render: () => table({}),
};

export const Zebra = {
  render: () => table({ modifiers: ['striped'], id: 'gemaelde-zebra', caption: 'Gemälde mit Zebra-Streifen' }),
};

export const Kompakt = {
  render: () => table({ modifiers: ['compact'], id: 'gemaelde-kompakt', caption: 'Gemälde, kompakt' }),
};

/** Sortieren: Klick auf einen Spaltenkopf sortiert, ein zweiter Klick dreht die Richtung um */
export const Sortieren = {
  render: () => table({ sortable: true, caption: 'Gemälde, sortierbar', sorted: { key: 'date', dir: 'ascending' }, id: 'gemaelde-sortiert', rows: [...PAINTINGS].sort((a, b) => a.date.localeCompare(b.date)) }),
  play: (context) => {
    noLinks(context);
    const { canvasElement } = context;
    const tbody = canvasElement.querySelector('tbody');
    const rows = [...PAINTINGS];
    for (const button of canvasElement.querySelectorAll('.cda-table__sort')) {
      button.addEventListener('click', () => {
        const th = button.parentElement;
        const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
        for (const other of canvasElement.querySelectorAll('th[aria-sort]')) other.removeAttribute('aria-sort');
        th.setAttribute('aria-sort', dir);
        const key = button.dataset.key;
        rows.sort((a, b) => String(a[key]).localeCompare(String(b[key]), 'de', { numeric: true }) * (dir === 'ascending' ? 1 : -1));
        tbody.innerHTML = body(rows);
        noLinks(context);
      });
    }
  },
};

/** Angaben zu einem Werk: Begriff als Zeilenkopf, Wert als Zelle – wie .info-table in cranach-artefacts */
export const Angaben = {
  render: () =>
    [
      '<table class="cda-table">',
      '  <caption>Kreuzigung Christi, 1501</caption>',
      '  <tbody>',
      ...[
        ['Datierung', '1501'],
        ['Material', 'Malerei auf Nadelholz'],
        ['Maße', '138 × 99 cm'],
        ['Sammlung', 'Kunsthistorisches Museum Wien'],
        ['Inventarnummer', 'GG 6905'],
      ].map(([term, value]) => `    <tr><th scope="row">${esc(term)}</th><td>${esc(value)}</td></tr>`),
      '  </tbody>',
      '</table>',
    ].join('\n'),
};
