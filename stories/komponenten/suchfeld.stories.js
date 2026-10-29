import { esc } from '../helpers.js';

const ICON = (name) => `<span class="cda-icon" aria-hidden="true">${name}</span>`;

/** Markup des Suchfelds – dasselbe, das die Doku als Quelltext zeigt */
function search({ id, value = '', reset = true, label = '', tag = 'form' }) {
  const labelAttr = label ? `id="${id}"` : `id="${id}" aria-label="Suchbegriff"`;
  const valueAttr = value ? ` value="${esc(value)}"` : '';
  return [
    `<${tag} class="cda-search"${tag === 'form' ? ' role="search" action="#"' : ''}>`,
    `  <input class="cda-input cda-search__input" type="search" name="q" ${labelAttr} placeholder="z. B. Bildnis, Inventarnummer"${valueAttr}>`,
    reset &&
      `  <button type="button" class="cda-button cda-button--ghost cda-button--icon cda-search__reset" aria-label="Eingabe löschen">${ICON('backspace')}</button>`,
    `  <button type="submit" class="cda-button cda-button--primary cda-button--icon" aria-label="Suchen">${ICON('search')}</button>`,
    `</${tag}>`,
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Nur für die Vorführung: Löschen leert das Feld und setzt den Fokus zurück,
 * Absenden bleibt auf der Seite. In Projekten übernimmt das deren eigenes JavaScript.
 */
function demo({ canvasElement }) {
  for (const search of canvasElement.querySelectorAll('.cda-search')) {
    const input = search.querySelector('.cda-search__input');
    search.querySelector('.cda-search__reset')?.addEventListener('click', () => {
      input.value = '';
      input.focus();
    });
  }
  for (const form of canvasElement.querySelectorAll('form')) {
    form.addEventListener('submit', (event) => event.preventDefault());
  }
}

export default {
  title: 'Komponenten/Suchfeld',
  decorators: [(story) => `<div class="docs-sample"><div style="max-inline-size: 40rem">${story()}</div></div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
  play: demo,
};

export const Leer = {
  render: () => search({ id: 'sf-leer' }),
};

export const MitBegriff = {
  name: 'Mit Suchbegriff',
  render: () => search({ id: 'sf-begriff', value: 'Bildnis Luther' }),
};

export const OhneLoeschen = {
  name: 'Ohne Löschen-Button',
  render: () => search({ id: 'sf-ohne', reset: false }),
};

/** Sichtbare Beschriftung über cda-field; das Formular umschließt dann beides */
export const MitBeschriftung = {
  name: 'Mit Beschriftung',
  render: () =>
    [
      `<form class="cda-field" role="search" action="#">`,
      `  <label class="cda-field__label" for="sf-label">Werke durchsuchen</label>`,
      search({ id: 'sf-label', label: true, tag: 'div' })
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n'),
      `</form>`,
    ].join('\n'),
};
