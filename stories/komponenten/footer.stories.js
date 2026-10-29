import { esc } from '../helpers.js';

const COPYRIGHT = '© Stiftung Museum Kunstpalast, Düsseldorf / Technische Hochschule Köln, 2026';
const LINKS = ['Impressum', 'Datenschutz', 'Erklärung zur Barrierefreiheit', 'Kontakt'];

/** Footer – dasselbe Markup, das die Doku als Quelltext zeigt */
function footer({ links = LINKS, dark = false, current = '' } = {}) {
  return [
    `<footer class="cda-footer"${dark ? ' data-theme="dark"' : ''}>`,
    ...(links.length
      ? [
          '  <nav class="cda-footer__nav" aria-label="Rechtliches und Kontakt">',
          '    <ul class="cda-footer__links">',
          ...links.map(
            (l) =>
              `      <li><a href="#${esc(l.toLowerCase().replace(/\s+/g, '-'))}"${l === current ? ' aria-current="page"' : ''}>${esc(l)}</a></li>`,
          ),
          '    </ul>',
          '  </nav>',
        ]
      : []),
    `  <p class="cda-footer__copyright">${esc(COPYRIGHT)}</p>`,
    '</footer>',
  ].join('\n');
}

/** Nur für die Vorführung: Links nicht ausführen */
function demo({ canvasElement }) {
  for (const link of canvasElement.querySelectorAll('a')) {
    link.addEventListener('click', (event) => event.preventDefault());
  }
}

export default {
  title: 'Komponenten/Footer',
  decorators: [(story) => `<div class="docs-sample">${story()}</div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
  play: demo,
};

/** Auf der Seite „Impressum“: der Link dorthin ist als aktuelle Seite markiert */
export const Standard = {
  render: () => footer({ current: 'Impressum' }),
};

/** Wie in cranach-artefacts: dunkle Fläche, unabhängig vom Theme der Seite */
export const Dunkel = {
  render: () => footer({ dark: true }),
};

/** Wie auf den Werkseiten in cranach-artefacts: nur der Copyright-Vermerk */
export const NurCopyright = {
  name: 'Nur Copyright',
  render: () => footer({ links: [], dark: true }),
};
