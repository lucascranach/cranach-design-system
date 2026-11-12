import { esc } from '../helpers.js';

const close = [
  '    <form method="dialog">',
  '      <button class="cda-button cda-button--ghost cda-button--icon" aria-label="Schließen">',
  '        <span class="cda-icon" aria-hidden="true">close</span>',
  '      </button>',
  '    </form>',
];

/** Seitenleiste samt Button zum Öffnen – dasselbe Markup, das die Doku zeigt */
const drawer = ({ id, title, body, footer, modifiers = [], opener, icon }) =>
  [
    `<button type="button" class="cda-button" data-open="${id}">`,
    ...(icon ? [`  <span class="cda-icon" aria-hidden="true">${icon}</span>`] : []),
    `  ${esc(opener)}`,
    '</button>',
    '',
    `<dialog class="${['cda-drawer', ...modifiers.map((m) => `cda-drawer--${m}`)].join(' ')}" id="${id}" aria-labelledby="${id}-titel">`,
    '  <div class="cda-drawer__header">',
    `    <h2 class="cda-drawer__title" id="${id}-titel">${esc(title)}</h2>`,
    ...close,
    '  </div>',
    `  <div class="cda-drawer__body">${body}</div>`,
    ...(footer ? ['  <form method="dialog" class="cda-drawer__footer">', footer, '  </form>'] : []),
    '</dialog>',
  ].join('\n');

const checkbox = (label, count, checked = false) =>
  [
    '      <label class="cda-checkbox">',
    `        <input class="cda-checkbox__input" type="checkbox" name="typ"${checked ? ' checked' : ''}>`,
    `        <span class="cda-checkbox__label">${esc(label)}</span>`,
    `        <span class="cda-checkbox__count">${esc(count)}</span>`,
    '      </label>',
  ].join('\n');

/** Öffnen per showModal(), Schließen auch per Klick auf die Abdunkelung – im Projekt genauso */
function demo({ canvasElement }) {
  for (const link of canvasElement.querySelectorAll('.cda-drawer a')) link.addEventListener('click', (event) => event.preventDefault());
  for (const button of canvasElement.querySelectorAll('[data-open]')) {
    button.addEventListener('click', () => canvasElement.querySelector(`#${button.dataset.open}`).showModal());
  }
  for (const element of canvasElement.querySelectorAll('.cda-drawer')) {
    element.addEventListener('click', (event) => {
      if (event.target === element) element.close();
    });
  }
}

export default {
  title: 'Komponenten/Seitenleiste',
  decorators: [(story) => `<div class="docs-sample">${story()}</div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
  play: demo,
};

export const Standard = {
  render: () =>
    drawer({
      id: 'drawer-filter',
      opener: 'Filter',
      icon: 'filter_list',
      title: 'Filter',
      body: `
    <fieldset class="cda-checkbox-group">
      <legend class="cda-checkbox-group__legend">Gattung</legend>
${[['Malerei', '1.842', true], ['Druckgrafik', '967'], ['Zeichnung', '214'], ['Archivalien', '1.203']].map((args) => checkbox(...args)).join('\n')}
    </fieldset>
  `,
      footer: [
        '    <button class="cda-button" value="zuruecksetzen">Zurücksetzen</button>',
        '    <button class="cda-button cda-button--primary" value="anwenden">Anwenden</button>',
      ].join('\n'),
    }),
};

export const Links = {
  render: () =>
    drawer({
      id: 'drawer-navigation',
      modifiers: ['start'],
      opener: 'Inhalt',
      icon: 'left_panel_open',
      title: 'Inhalt',
      body: `
    <ul class="cda-l-stack cda-u-space-s" role="list">
${['Einleitung', 'Frühe Jahre in Kronach', 'Wittenberg', 'Werkstatt', 'Späte Jahre in Weimar'].map((item, i) => `      <li><a href="#kapitel-${i + 1}">${esc(item)}</a></li>`).join('\n')}
    </ul>
  `,
    }),
};

const field = (term, value) => [`        <dt>${esc(term)}</dt>`, `        <dd>${esc(value)}</dd>`].join('\n');

export const Breit = {
  render: () =>
    drawer({
      id: 'drawer-detail',
      modifiers: ['wide'],
      opener: 'Details',
      title: 'DE_KSW_G1029.jpg',
      body: `
    <div class="cda-l-stack cda-u-space-l">
      <section class="cda-l-stack cda-u-space-s" aria-labelledby="drawer-detail-datei">
        <h3 id="drawer-detail-datei">Datei</h3>
        <dl class="docs-fields">
${[['Format', 'JPEG, 4.912 × 6.549 px'], ['Größe', '12,4 MB'], ['Farbprofil', 'Adobe RGB (1998)']].map((f) => field(...f)).join('\n')}
        </dl>
      </section>
      <section class="cda-l-stack cda-u-space-s" aria-labelledby="drawer-detail-metadaten">
        <h3 id="drawer-detail-metadaten">Metadaten</h3>
        <dl class="docs-fields">
${[['Titel', 'Kreuzigung Christi'], ['Datierung', '1501'], ['Inventarnummer', 'G 1029'], ['Aufnahme', 'Sichtbares Licht, Vorderseite']].map((f) => field(...f)).join('\n')}
        </dl>
      </section>
    </div>
  `,
    }),
};
