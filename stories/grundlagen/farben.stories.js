import { tokens } from '../../dist/tokens.js';
import { getColor, pairs, TEXT, UI, ratio } from '../../build/contrast.mjs';
import primitive from '../../tokens/primitive/color.json';
import semantic from '../../tokens/semantic/light.json';
import { at, code, cssVar, esc, leaves, sample, table } from '../helpers.js';

export default {
  title: 'Grundlagen/Farben',
  parameters: {
    // Doku-Tabellen: generiertes HTML nicht als Quelltext anzeigen, Markup steht in der MDX-Seite
    docs: { canvas: { sourceState: 'none' } },
  },
};

const swatch = (name) => `<span class="docs-swatch" style="background-color: var(${name})"></span>`;
const fmt = (r) => `${r.toFixed(2).replace('.', ',')}:1`;

/** Semantische Farben: Bedeutung je Theme. Komponenten nutzen nur diese. */
export const Semantisch = {
  name: 'Semantische Farben',
  render: () =>
    sample(
      table(
        'Das Farbfeld zeigt das aktive Theme. Werte aus tokens/semantic/light.json und dark.json.',
        ['Token', 'Farbe', 'Hell', 'Dunkel', 'Verwendung'],
        leaves(semantic.color, ['color']).map(({ path, description }) => {
          const name = cssVar(path);
          return [
            code(name),
            swatch(name),
            code(at(tokens.light, path)),
            code(at(tokens.dark, path)),
            esc(description),
          ];
        }),
      ),
    ),
};

/** Kontraste der geprüften Paarungen – dieselbe Liste wie npm run check:contrast */
export const Kontraste = {
  name: 'Kontraste',
  render: () =>
    sample(
      table(
        'Text braucht mindestens 4,5:1, Rahmen von Bedienelementen und Fokus mindestens 3:1. Das Beispiel zeigt das aktive Theme.',
        ['Vordergrund auf Hintergrund', 'Beispiel', 'Hell', 'Dunkel', 'Mindestens'],
        pairs.map(([fg, bg, min, note]) => {
          const vf = `var(${cssVar(['color', ...fg.split('.')])})`;
          const vb = `var(${cssVar(['color', ...bg.split('.')])})`;
          let example;
          if (min === TEXT) {
            example = `<span class="docs-pair" style="color: ${vf}; background-color: ${vb}">Lucas Cranach</span>`;
          } else if (fg.startsWith('focus')) {
            example = `<span class="docs-pair" style="background-color: ${vb}; outline: var(--cda-focus-ring-width) solid ${vf}; outline-offset: var(--cda-focus-ring-offset)">Fokus</span>`;
          } else if (min === UI) {
            example = `<span class="docs-pair" style="background-color: ${vb}; border: var(--cda-border-width-m) solid ${vf}">Rahmen</span>`;
          } else {
            example = `<span class="docs-swatch" style="background-color: ${vf}"></span>`;
          }
          const r = (theme) => fmt(ratio(getColor(tokens, theme, fg), getColor(tokens, theme, bg)));
          return [
            `${code(fg)} auf ${code(bg)}`,
            example,
            r('light'),
            r('dark'),
            note ? esc(note) : fmt(min),
          ];
        }),
      ),
    ),
};

/** Primitive Palette: Grundlage der semantischen Farben, nicht direkt in Komponenten verwenden */
export const Palette = {
  render: () =>
    sample(
      Object.entries(primitive.color)
        .filter(([key]) => !key.startsWith('$'))
        .map(([group, node]) => {
          const items = leaves(node, ['color', group]).map(({ path }) => {
            const name = cssVar(path);
            return `<li>${swatch(name)}<div>${code(name)}</div><div class="docs-muted">${esc(at(tokens, path))}</div></li>`;
          });
          const desc = node.$description ? `<p class="docs-muted">${esc(node.$description)}</p>` : '';
          return `<section><h3 class="docs-heading">${esc(group)}</h3>${desc}<ul class="docs-palette">${items.join('')}</ul></section>`;
        })
        .join(''),
    ),
};
