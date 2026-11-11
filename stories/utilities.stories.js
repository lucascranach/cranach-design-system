import { code, esc } from './helpers.js';
import z from '../tokens/primitive/z-index.json';
import dimension from '../tokens/primitive/dimension.json';

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

/** Abstands-Utilities für die Layout-Bausteine, aus den Tokens erzeugt (ADR 0021) */
const spaceKeys = Object.entries(dimension.space)
  .filter(([key]) => !key.startsWith('$'))
  .flatMap(([key, node]) =>
    '$value' in node
      ? [[key, node.$value]]
      : Object.entries(node)
          .filter(([k]) => !k.startsWith('$'))
          .map(([k, n]) => [`${key}-${k}`, n.$value]),
  );

export const Abstaende = {
  name: 'Abstände der Layout-Bausteine',
  parameters: { docs: { source: { code: '<div class="cda-l-stack cda-u-space-xl">…</div>' } } },
  render: () =>
    `<div class="docs-scroll" role="region" tabindex="0" aria-label="Abstands-Utilities">
  <table class="docs-table">
    <caption>Klassen für Abstände der Layout-Bausteine</caption>
    <thead><tr><th scope="col">Klasse</th><th scope="col">setzt --cda-l-space auf</th><th scope="col">Wert</th></tr></thead>
    <tbody>${spaceKeys
      .map(([key, value]) => `<tr><td>${code(`.cda-u-space-${key}`)}</td><td>${code(`--cda-space-${key}`)}</td><td>${esc(value)}</td></tr>`)
      .join('')}</tbody>
  </table>
</div>`,
};
