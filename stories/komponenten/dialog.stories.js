import { esc } from '../helpers.js';

/** Platzhalterbild wie bei der Werk-Karte – keine echten Abbildungen in der Doku */
const placeholder = (hue) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 4"><rect width="3" height="4" fill="hsl(${hue} 35% 30%)"/><rect x=".24" y=".32" width="2.52" height="3.36" fill="hsl(${hue} 30% 55%)"/></svg>`,
  )}`;

const close = [
  '    <form method="dialog">',
  '      <button class="cda-button cda-button--ghost cda-button--icon" aria-label="Schließen">',
  '        <span class="cda-icon" aria-hidden="true">close</span>',
  '      </button>',
  '    </form>',
];

/** Dialog samt Button zum Öffnen – dasselbe Markup, das die Doku zeigt */
const dialog = ({ id, title, body, footer, wide = false, opener }) =>
  [
    `<button type="button" class="cda-button" data-open="${id}">${esc(opener)}</button>`,
    '',
    `<dialog class="cda-dialog${wide ? ' cda-dialog--wide' : ''}" id="${id}" aria-labelledby="${id}-titel">`,
    '  <div class="cda-dialog__header">',
    `    <h2 class="cda-dialog__title" id="${id}-titel">${esc(title)}</h2>`,
    ...close,
    '  </div>',
    `  <div class="cda-dialog__body">${body}</div>`,
    ...(footer ? ['  <form method="dialog" class="cda-dialog__footer">', footer, '  </form>'] : []),
    '</dialog>',
  ].join('\n');

/** Öffnen per showModal() – im Projekt genauso */
function demo({ canvasElement }) {
  for (const link of canvasElement.querySelectorAll('.cda-dialog a')) link.addEventListener('click', (event) => event.preventDefault());
  for (const button of canvasElement.querySelectorAll('[data-open]')) {
    button.addEventListener('click', () => canvasElement.querySelector(`#${button.dataset.open}`).showModal());
  }
}

export default {
  title: 'Komponenten/Dialog',
  decorators: [(story) => `<div class="docs-sample">${story()}</div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
  play: demo,
};

export const Standard = {
  render: () =>
    dialog({
      id: 'dialog-download',
      opener: 'Herunterladen …',
      title: 'Bild herunterladen',
      body: `
    <div class="cda-l-stack">
      <p>Die Abbildung steht unter der Lizenz CC BY-NC-SA 4.0. Bitte geben Sie bei einer Veröffentlichung das Cranach Digital Archive als Quelle an.</p>
      <p>Die Datei in voller Auflösung ist etwa 40 MB groß.</p>
    </div>
  `,
      footer: [
        '    <button class="cda-button" value="abbrechen">Abbrechen</button>',
        '    <button class="cda-button cda-button--primary" value="download">Herunterladen</button>',
      ].join('\n'),
    }),
};

export const Breit = {
  render: () =>
    dialog({
      id: 'dialog-bilder',
      wide: true,
      opener: 'Alle Abbildungen',
      title: 'Abbildungen: Kreuzigung Christi, 1501',
      body: `
    <ul class="cda-l-grid cda-l-grid--small" role="list">
${Array.from({ length: 18 }, (_, i) => `      <li><a href="#abbildung-${i + 1}" style="display: block"><img src="${placeholder(20 + i * 17)}" alt="Abbildung ${i + 1}" style="display: block; inline-size: 100%"></a></li>`).join('\n')}
    </ul>
  `,
    }),
};
