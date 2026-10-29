import { esc } from '../helpers.js';

/** Einrücken für verschachteltes Markup im angezeigten Quelltext */
const indent = (html, depth = 1) =>
  html
    .split('\n')
    .map((line) => '  '.repeat(depth) + line)
    .join('\n');

/** Ein Abschnitt – dasselbe Markup, das die Doku als Quelltext zeigt */
function item({ title, content, open = false, name = '' }) {
  const attrs = ['class="cda-accordion__item"', name && `name="${esc(name)}"`, open && 'open'].filter(Boolean).join(' ');
  return [
    `<details ${attrs}>`,
    `  <summary class="cda-accordion__summary">${esc(title)}</summary>`,
    '  <div class="cda-accordion__content">',
    indent(content, 2),
    '  </div>',
    '</details>',
  ].join('\n');
}

const accordion = (items) => ['<div class="cda-accordion">', ...items.map((i) => indent(item(i))), '</div>'].join('\n');

const text = (t) => `<p>${esc(t)}</p>`;

/** Checkboxen im Filter, wie in der Seitenleiste von cranach-search */
const checkboxes = (label, items) =>
  [
    `<div class="cda-checkbox-group" role="group" aria-label="${esc(label)}">`,
    ...items.map(([name, count]) =>
      indent(
        [
          '<label class="cda-checkbox">',
          '  <input class="cda-checkbox__input" type="checkbox">',
          `  <span class="cda-checkbox__label">${esc(name)}</span>`,
          `  <span class="cda-checkbox__count">${esc(count)}</span>`,
          '</label>',
        ].join('\n'),
      ),
    ),
    '</div>',
  ].join('\n');

export default {
  title: 'Komponenten/Accordion',
  decorators: [(story) => `<div class="docs-sample"><div style="max-inline-size: 24rem">${story()}</div></div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
};

export const Standard = {
  render: () =>
    accordion([
      {
        title: 'Datierung',
        content: text('Werke von 1500 bis 1550. Hier steht im Projekt der Schieberegler für den Zeitraum.'),
      },
      {
        title: 'Künstler',
        open: true,
        content: checkboxes('Künstler', [
          ['Lucas Cranach der Ältere', '1.204'],
          ['Lucas Cranach der Jüngere', '412'],
          ['Werkstatt', '867'],
        ]),
      },
      {
        title: 'Sammlung',
        content: text('Museen und Sammlungen, in denen sich die Werke heute befinden.'),
      },
    ]),
};

/** Mit name an allen details ist immer nur ein Abschnitt offen */
export const NurEinerOffen = {
  name: 'Nur einer offen',
  render: () =>
    accordion(
      [
        ['Beschreibung', 'Das Gemälde zeigt Adam und Eva unter dem Baum der Erkenntnis.', true],
        ['Provenienz', 'Erworben 1897 aus Privatbesitz.'],
        ['Literatur', 'Friedländer/Rosenberg 1979, Nr. 189.'],
      ].map(([title, content, open]) => ({ title, content: text(content), open, name: 'werk' })),
    ),
};

/** Einzelner Abschnitt, wie die Auflagen in cranach-artefacts */
export const Einzeln = {
  render: () =>
    accordion([
      {
        title: 'Auflage B, um 1550',
        content: text('Abzug auf Papier mit Wasserzeichen; spätere Auflage mit ergänzter Inschrift.'),
      },
    ]),
};

export const LangeUeberschrift = {
  name: 'Lange Überschrift',
  render: () =>
    accordion([
      {
        title: 'Technologische Untersuchungen: Infrarotreflektografie, Röntgen und Dendrochronologie',
        content: text('Der Pfeil bleibt neben der ersten Zeile, die Überschrift bricht um.'),
      },
    ]),
};
