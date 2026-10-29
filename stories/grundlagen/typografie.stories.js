import { tokens } from '../../dist/tokens.js';
import { code, cssVar, esc, sample, table } from '../helpers.js';

export default {
  title: 'Grundlagen/Typografie',
};

const SAMPLE = 'Lucas Cranach der Ältere';
const px = (rem) => `${parseFloat(rem) * 16} px`;

export const Schriftgroessen = {
  name: 'Schriftgrößen',
  render: () =>
    sample(
      table(
        'm (16 px) ist der Fließtext (ADR 0009).',
        ['Token', 'Wert', 'Beispiel'],
        Object.entries(tokens.font.size).map(([key, value]) => {
          const name = cssVar(['font', 'size', key]);
          return [
            code(name),
            `${code(value)} <span class="docs-muted">${px(value)}</span>`,
            `<span style="font-size: var(${name}); line-height: var(--cda-font-line-height-tight)">${SAMPLE}</span>`,
          ];
        }),
      ),
    ),
};

export const Schriftschnitte = {
  render: () =>
    sample(
      table(
        'IBM Plex Sans (registriert als „Cranach Sans“) als variable Schrift mit Standard-Gewichten, dazu Kursiv und IBM Plex Mono 400.',
        ['Token', 'Wert', 'Beispiel'],
        [
          ...Object.entries(tokens.font.weight).map(([key, value]) => {
            const name = cssVar(['font', 'weight', key]);
            return [code(name), code(value), `<span style="font-weight: var(${name})">${SAMPLE}</span>`];
          }),
          [code('font-style: italic'), '', `<em>${SAMPLE}</em>`],
          [
            code('--cda-font-family-mono'),
            code('IBM Plex Mono'),
            `<span style="font-family: var(--cda-font-family-mono)">${SAMPLE}</span>`,
          ],
        ],
      ),
    ),
};

const PARAGRAPH =
  'Das Cranach Digital Archive ist eine interdisziplinäre Forschungsplattform zu Lucas Cranach dem Älteren, seinen Söhnen und seiner Werkstatt. Es verbindet Gemälde, Grafiken, Archivalien und Literatur.';

export const Zeilenhoehen = {
  name: 'Zeilenhöhen',
  render: () =>
    sample(
      Object.entries(tokens.font['line-height'])
        .map(([key, value]) => {
          const name = cssVar(['font', 'line-height', key]);
          return `<figure style="margin: 0"><figcaption>${code(name)} <span class="docs-muted">${esc(value)}</span></figcaption><p style="line-height: var(${name}); max-inline-size: 60ch">${PARAGRAPH}</p></figure>`;
        })
        .join(''),
    ),
};

/** Grundstyles aus cranach.css (Layer cda.base) ohne zusätzliche Klassen */
export const Grundstyles = {
  render: () =>
    sample(`
      <h1>Überschrift 1</h1>
      <h2>Überschrift 2</h2>
      <h3>Überschrift 3</h3>
      <h4>Überschrift 4</h4>
      <h5>Überschrift 5</h5>
      <h6>Überschrift 6</h6>
      <p style="max-inline-size: 60ch">${PARAGRAPH} Ein <a href="#grundstyles">Link im Fließtext</a> hat eine gelbe Unterstreichung und beim Überfahren eine gelbe Fläche. <strong>Fett</strong>, <em>kursiv</em>, <small>klein</small> und <mark>markiert</mark>.</p>
      <p>Code im Text: <code>--cda-color-text-default</code>, Taste <kbd>Tab</kbd>.</p>
      <pre tabindex="0"><code>&lt;link rel="stylesheet" href="/design-system/1.0.0/cranach.css"&gt;</code></pre>
      <ul><li>Listeneintrag</li><li>Listeneintrag</li></ul>
      <hr>
      <p><button type="button">Natives Bedienelement</button> – mit der Tab-Taste fokussieren, um den Fokusring zu sehen.</p>
    `),
};
