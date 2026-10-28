import { tokens } from '../../dist/tokens.js';
import { code, cssVar, esc, sample, table } from '../helpers.js';

export default {
  title: 'Grundlagen/Abstände',
  // URL ohne Umlaut
  id: 'grundlagen-abstaende',
  parameters: {
    // Doku-Tabellen: generiertes HTML nicht als Quelltext anzeigen, Markup steht in der MDX-Seite
    docs: { canvas: { sourceState: 'none' } },
  },
};

const bar = (name) => `<span class="docs-bar" style="inline-size: var(${name})"></span>`;

export const Abstandsskala = {
  render: () =>
    sample(
      table(
        '4-px-Raster (ADR 0010).',
        ['Token', 'Wert', 'Länge'],
        Object.entries(tokens.space)
          .filter(([, value]) => typeof value === 'string')
          .map(([key, value]) => {
            const name = cssVar(['space', key]);
            return [code(name), code(value), bar(name)];
          }),
      ),
    ),
};

export const FliessendeAbstaende = {
  name: 'Fließende Abstände',
  render: () =>
    sample(
      table(
        'Für Abschnitte; wachsen mit der Fensterbreite zwischen Minimum und Maximum.',
        ['Token', 'Wert', 'Länge bei aktueller Breite'],
        Object.entries(tokens.space.fluid).map(([key, value]) => {
          const name = cssVar(['space', 'fluid', key]);
          return [code(name), code(value), bar(name)];
        }),
      ),
    ),
};

const figure = (style, caption) =>
  `<figure><div class="docs-box" style="${style}"></div><figcaption>${caption}</figcaption></figure>`;

export const FormenUndSchatten = {
  name: 'Radius, Rahmen und Schatten',
  render: () =>
    sample(`
      <section>
        <h3 class="docs-heading">Radius</h3>
        <div class="docs-row">${Object.entries(tokens.radius)
          .map(([key, value]) => {
            const name = cssVar(['radius', key]);
            return figure(`border-radius: var(${name})`, `${code(name)}<br><span class="docs-muted">${esc(value)}</span>`);
          })
          .join('')}</div>
      </section>
      <section>
        <h3 class="docs-heading">Rahmenstärken</h3>
        <div class="docs-row">${Object.entries(tokens['border-width'])
          .map(([key, value]) => {
            const name = cssVar(['border', 'width', key]);
            return figure(`border-width: var(${name})`, `${code(name)}<br><span class="docs-muted">${esc(value)}</span>`);
          })
          .join('')}</div>
      </section>
      <section>
        <h3 class="docs-heading">Schatten</h3>
        <div class="docs-row">${Object.keys(tokens.shadow)
          .map((key) => {
            const name = cssVar(['shadow', key]);
            return figure(`box-shadow: var(${name}); border-color: transparent`, code(name));
          })
          .join('')}</div>
      </section>
    `),
};

export const Breakpoints = {
  render: () =>
    sample(
      table(
        'Tailwind-Standard (ADR 0010). In @media über custom-media.css oder als dokumentierte Werte, z. B. @media (width >= 768px).',
        ['Token', 'Custom Media', 'Wert'],
        Object.entries(tokens.breakpoint).map(([key, value]) => [
          code(cssVar(['breakpoint', key])),
          code(`--cda-${key}`),
          code(value),
        ]),
      ),
    ),
};

export const Bewegung = {
  render: () =>
    sample(
      table(
        'Bei prefers-reduced-motion: reduce werden alle Dauern praktisch null (0,01 ms).',
        ['Token', 'Wert'],
        [
          ...Object.entries(tokens.duration).map(([key, value]) => [code(cssVar(['duration', key])), code(value)]),
          [code('--cda-easing-default'), code(tokens.easing.default)],
        ],
      ),
    ),
};
