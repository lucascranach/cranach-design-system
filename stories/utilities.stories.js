import { code, esc } from './helpers.js';
import z from '../tokens/primitive/z-index.json';

export default {
  title: 'Utilities',
  decorators: [(story) => `<div class="docs-sample">${story()}</div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
};

/** Ein Icon-Button mit Text nur für Screenreader statt aria-label */
export const NurFuerScreenreader = {
  name: 'Nur für Screenreader',
  render: () =>
    [
      '<button type="button" class="cda-button cda-button--icon">',
      '  <span class="cda-icon" aria-hidden="true">close</span>',
      '  <span class="cda-u-visually-hidden">Filter schließen</span>',
      '</button>',
    ].join('\n'),
};

/** Sichtbar erst mit Fokus: hineinklicken, dann Tab drücken */
export const SichtbarMitFokus = {
  name: 'Sichtbar mit Fokus',
  render: () =>
    [
      '<p class="docs-muted">Hier klicken, dann Tab drücken.</p>',
      '<a class="cda-u-visually-hidden-focusable" href="#filter">Zu den Filtern springen</a>',
    ].join('\n'),
};

/** hidden blendet auch Komponenten mit eigenem display aus */
export const Hidden = {
  name: 'hidden an Komponenten',
  render: () =>
    [
      '<div style="position: relative; min-block-size: 4rem">',
      '  <p>Darüber läge sonst das Lade-Overlay.</p>',
      '  <div class="cda-loader" role="status" hidden>',
      '    <div class="cda-loader__panel">',
      '      <span class="cda-spinner" aria-hidden="true"></span>',
      '      Ergebnisse werden geladen',
      '    </div>',
      '  </div>',
      '</div>',
    ].join('\n'),
};

/** Alle z-Utilities, aus den Tokens erzeugt */
export const ZEbenen = {
  name: 'z-Ebenen',
  parameters: { docs: { source: { code: '<div class="cda-u-z-nav-fixed">…</div>' } } },
  render: () =>
    `<div class="docs-scroll" role="region" tabindex="0" aria-label="z-Utilities">
  <table class="docs-table">
    <caption>Klassen für z-Ebenen</caption>
    <thead><tr><th scope="col">Klasse</th><th scope="col">Token</th><th scope="col">Wert</th></tr></thead>
    <tbody>${Object.entries(z.z)
      .filter(([key]) => !key.startsWith('$'))
      .map(
        ([key, { $value }]) =>
          `<tr><td>${code(`.cda-u-z-${key}`)}</td><td>${code(`--cda-z-${key}`)}</td><td>${esc($value)}</td></tr>`,
      )
      .join('')}</tbody>
  </table>
</div>`,
};
