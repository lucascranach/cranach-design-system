import { esc } from '../helpers.js';

/** Markup einer Checkbox – dasselbe, das die Doku als Quelltext zeigt */
function checkbox({ label, name = 'typ', value = '', checked = false, indeterminate = false, disabled = false, count = '' }) {
  const attrs = [
    'class="cda-checkbox__input"',
    'type="checkbox"',
    `name="${esc(name)}"`,
    value && `value="${esc(value)}"`,
    checked && 'checked',
    disabled && 'disabled',
    // nur für die Vorführung; in Projekten setzt JavaScript input.indeterminate = true
    indeterminate && 'data-indeterminate',
  ]
    .filter(Boolean)
    .join(' ');
  return [
    '<label class="cda-checkbox">',
    `  <input ${attrs}>`,
    `  <span class="cda-checkbox__label">${esc(label)}</span>`,
    count && `  <span class="cda-checkbox__count">${esc(count)}</span>`,
    '</label>',
  ]
    .filter(Boolean)
    .join('\n');
}

const group = (legend, items) =>
  [
    '<fieldset class="cda-checkbox-group">',
    `  <legend class="cda-checkbox-group__legend">${esc(legend)}</legend>`,
    ...items.map((item) =>
      checkbox(item)
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n'),
    ),
    '</fieldset>',
  ].join('\n');

/** Zwischenzustand gibt es nur als DOM-Eigenschaft, nicht als HTML-Attribut */
function setIndeterminate({ canvasElement }) {
  for (const input of canvasElement.querySelectorAll('[data-indeterminate]')) input.indeterminate = true;
}

export default {
  title: 'Komponenten/Checkbox',
  decorators: [(story) => `<div class="docs-sample"><div class="docs-row">${story()}</div></div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
  play: setIndeterminate,
};

export const Spielwiese = {
  args: { label: 'Gemälde', count: '', checked: false, indeterminate: false, disabled: false },
  argTypes: {
    label: { name: 'Beschriftung', control: 'text' },
    count: { name: 'Trefferzahl', control: 'text' },
    checked: { name: 'Angehakt', control: 'boolean' },
    indeterminate: { name: 'Teilweise', control: 'boolean', description: 'Zwischenzustand (input.indeterminate)' },
    disabled: { name: 'Deaktiviert', control: 'boolean' },
  },
  render: (args) => checkbox({ value: 'gemaelde', ...args }),
};

export const Zustaende = {
  name: 'Zustände',
  render: () =>
    [
      checkbox({ label: 'Nicht angehakt', value: 'a' }),
      checkbox({ label: 'Angehakt', value: 'b', checked: true }),
      checkbox({ label: 'Teilweise', value: 'c', indeterminate: true }),
      checkbox({ label: 'Deaktiviert', value: 'd', disabled: true }),
      checkbox({ label: 'Deaktiviert, angehakt', value: 'e', disabled: true, checked: true }),
    ].join('\n'),
};

export const Gruppe = {
  render: () =>
    group('Objekttyp', [
      { label: 'Gemälde', value: 'gemaelde', checked: true, count: '1.534' },
      { label: 'Grafiken', value: 'grafiken', count: '2.017' },
      { label: 'Archivalien', value: 'archivalien', count: '412' },
      { label: 'Literatur', value: 'literatur', count: '8.950' },
    ]),
};

export const LangeBeschriftung = {
  name: 'Lange Beschriftung',
  render: () =>
    `<div style="max-inline-size: 20rem">\n${checkbox({
      label: 'Nur Werke anzeigen, zu denen hochaufgelöste Aufnahmen und Restaurierungsberichte vorliegen',
      name: 'filter',
      value: 'dokumentiert',
    })}\n</div>`,
};
