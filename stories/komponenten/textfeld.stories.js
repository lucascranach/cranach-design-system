import { esc } from '../helpers.js';

/**
 * Markup eines Textfelds mit Beschriftung – dasselbe, das die Doku als Quelltext zeigt.
 * id muss je Story eindeutig sein, weil die Doku-Seite mehrere Stories zugleich zeigt.
 */
function field({ id, label, value = '', placeholder = '', hint = '', error = '', disabled = false, readonly = false, multiline = false, type = 'text' }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');
  const attrs = [
    `class="cda-input"`,
    `id="${id}"`,
    multiline ? '' : `type="${type}"`,
    placeholder && `placeholder="${esc(placeholder)}"`,
    describedBy && `aria-describedby="${describedBy}"`,
    error && 'aria-invalid="true"',
    disabled && 'disabled',
    readonly && 'readonly',
    !multiline && value && `value="${esc(value)}"`,
  ]
    .filter(Boolean)
    .join(' ');
  const input = multiline ? `<textarea ${attrs}>${esc(value)}</textarea>` : `<input ${attrs}>`;
  return [
    `<div class="cda-field">`,
    `  <label class="cda-field__label" for="${id}">${esc(label)}</label>`,
    `  ${input}`,
    hint && `  <p class="cda-field__hint" id="${id}-hint">${esc(hint)}</p>`,
    error &&
      `  <p class="cda-field__error" id="${id}-error"><span class="cda-icon" aria-hidden="true">error</span>${esc(error)}</p>`,
    `</div>`,
  ]
    .filter(Boolean)
    .join('\n');
}

export default {
  title: 'Komponenten/Textfeld',
  decorators: [(story) => `<div class="docs-sample"><div style="max-inline-size: 32rem">${story()}</div></div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
};

export const Spielwiese = {
  args: {
    label: 'Titel',
    value: '',
    placeholder: '',
    hint: 'Wie in der Sammlung angegeben.',
    error: '',
    disabled: false,
    readonly: false,
    multiline: false,
  },
  argTypes: {
    label: { name: 'Beschriftung', control: 'text' },
    value: { name: 'Inhalt', control: 'text' },
    placeholder: { name: 'Platzhalter', control: 'text', description: 'Nur als Beispiel, nie statt der Beschriftung' },
    hint: { name: 'Hinweis', control: 'text' },
    error: { name: 'Fehlermeldung', control: 'text' },
    disabled: { name: 'Deaktiviert', control: 'boolean' },
    readonly: { name: 'Nur lesbar', control: 'boolean' },
    multiline: { name: 'Mehrzeilig', control: 'boolean' },
  },
  render: (args) => field({ id: 'tf-spielwiese', ...args }),
};

export const Standard = {
  render: () => field({ id: 'tf-standard', label: 'Titel' }),
};

export const MitHinweis = {
  name: 'Mit Hinweis',
  render: () =>
    field({ id: 'tf-hinweis', label: 'Inventarnummer', placeholder: 'z. B. GG 563', hint: 'Wie im Inventar der besitzenden Sammlung.' }),
};

export const Fehler = {
  render: () =>
    field({
      id: 'tf-fehler',
      label: 'Entstehungsjahr',
      value: '15x3',
      hint: 'Vierstellig, z. B. 1532.',
      error: 'Bitte eine Jahreszahl mit vier Ziffern eingeben.',
    }),
};

export const Deaktiviert = {
  render: () => field({ id: 'tf-deaktiviert', label: 'Titel', value: 'Bildnis Martin Luther', disabled: true }),
};

export const NurLesbar = {
  name: 'Nur lesbar',
  render: () => field({ id: 'tf-lesbar', label: 'CDA-ID', value: 'DE_LHW_G25', readonly: true, hint: 'Wird automatisch vergeben.' }),
};

export const Mehrzeilig = {
  render: () => field({ id: 'tf-mehrzeilig', label: 'Anmerkung', multiline: true }),
};
