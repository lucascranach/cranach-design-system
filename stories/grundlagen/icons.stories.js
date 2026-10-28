import iconList from '../../icons/icons.json';
import { code, esc, sample } from '../helpers.js';

export default {
  title: 'Grundlagen/Icons',
  parameters: {
    // Doku-Tabellen: generiertes HTML nicht als Quelltext anzeigen, Markup steht in der MDX-Seite
    docs: { canvas: { sourceState: 'none' } },
  },
};

const icon = (name, filled = false) =>
  `<span class="cda-icon${filled ? ' cda-icon--filled' : ''}" aria-hidden="true">${esc(name)}</span>`;

/** Alle Icons der Icon-Font „Cranach Symbols“ mit den Projekten, die sie heute nutzen */
export const Alle = {
  name: 'Alle Icons',
  render: () =>
    sample(`
      <p class="docs-muted">${Object.keys(iconList.icons).length} Icons aus <code class="docs-code">icons/icons.json</code>. Darunter die Projekte, die das Icon heute nutzen.</p>
      <ul class="docs-icons">${Object.entries(iconList.icons)
        .map(
          ([name, projects]) =>
            `<li>${icon(name)}${code(name)}<span class="docs-muted">${esc(projects.join(', '))}</span></li>`,
        )
        .join('')}</ul>
    `),
};

export const Varianten = {
  render: () =>
    sample(`
      <div class="docs-row">
        <figure>${icon('lock')}<figcaption>${code('cda-icon')}</figcaption></figure>
        <figure>${icon('lock', true)}<figcaption>${code('cda-icon cda-icon--filled')}</figcaption></figure>
        <figure><span class="cda-icon" aria-hidden="true" style="font-size: var(--cda-font-size-4xl)">search</span><figcaption>${code('font-size: var(--cda-font-size-4xl)')}</figcaption></figure>
        <figure><span style="color: var(--cda-color-text-accent)">${icon('error')}</span><figcaption>übernimmt die Textfarbe</figcaption></figure>
      </div>
    `),
};

/** Icon allein als Bedeutungsträger: das umgebende Element bekommt den zugänglichen Namen */
export const ImButton = {
  name: 'Icon im Button',
  render: () =>
    sample(`
      <button type="button" aria-label="Suchen">${icon('search')}</button>
      <button type="button">${icon('download')} Herunterladen</button>
    `),
};
