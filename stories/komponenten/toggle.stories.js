import { esc } from '../helpers.js';

/** Markup eines Toggles – dasselbe, das die Doku als Quelltext zeigt */
function toggle({ label, checked = false, disabled = false, labelFirst = false }) {
  const input = `  <input class="cda-toggle__input" type="checkbox" role="switch"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}>`;
  const text = `  <span class="cda-toggle__label">${esc(label)}</span>`;
  return ['<label class="cda-toggle">', ...(labelFirst ? [text, input] : [input, text]), '</label>'].join('\n');
}

export default {
  title: 'Komponenten/Toggle',
  decorators: [(story) => `<div class="docs-sample"><div class="docs-row">${story()}</div></div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
};

export const Spielwiese = {
  args: { label: 'Bilder anzeigen', checked: false, disabled: false, labelFirst: false },
  argTypes: {
    label: { name: 'Beschriftung', control: 'text' },
    checked: { name: 'An', control: 'boolean' },
    disabled: { name: 'Deaktiviert', control: 'boolean' },
    labelFirst: { name: 'Beschriftung vorn', control: 'boolean' },
  },
  render: (args) => toggle(args),
};

export const Zustaende = {
  name: 'Zustände',
  render: () =>
    [
      toggle({ label: 'Aus' }),
      toggle({ label: 'An', checked: true }),
      toggle({ label: 'Deaktiviert, aus', disabled: true }),
      toggle({ label: 'Deaktiviert, an', disabled: true, checked: true }),
    ].join('\n'),
};

/** Wie der Zoom-Schalter in cranach-timeline: Beschriftung vor dem Schalter */
export const BeschriftungVorn = {
  name: 'Beschriftung vorn',
  render: () => toggle({ label: '2× Zoom', labelFirst: true, checked: true }),
};

export const LangeBeschriftung = {
  name: 'Lange Beschriftung',
  render: () =>
    `<div style="max-inline-size: 20rem">\n${toggle({
      label: 'Werke ohne gesicherte Zuschreibung in der Zeitleiste ausblenden',
    })}\n</div>`,
};
