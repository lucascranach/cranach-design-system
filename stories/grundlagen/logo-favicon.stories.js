import { LOGO } from '../logo.js';
import logoUrl from '../../brand/logo.svg?url';
import faviconSvgUrl from '../../brand/favicon.svg?url';
import faviconIcoUrl from '../../brand/favicon.ico?url';
import touchIconUrl from '../../brand/apple-touch-icon.png?url';
import { sample } from '../helpers.js';

export default {
  title: 'Grundlagen/Logo und Favicon',
  parameters: {
    // Markup zum Einbinden steht in der MDX-Seite
    docs: { canvas: { sourceState: 'none' } },
  },
};

const figure = (inner, caption) => `<figure>${inner}<figcaption class="docs-muted">${caption}</figcaption></figure>`;

/** Inline nimmt das Logo die Textfarbe an; als <img> ist es schwarz */
export const Logo = {
  render: () =>
    sample(`
      <div class="docs-row">
        ${figure(`<div style="block-size: 3rem; color: var(--cda-color-text-default)">${LOGO.replace('<svg ', '<svg style="block-size: 100%" ')}</div>`, 'inline, Textfarbe <code class="docs-code">text.default</code>')}
        ${figure(`<div style="block-size: 3rem; color: var(--cda-color-text-muted)">${LOGO.replace('<svg ', '<svg style="block-size: 100%" ')}</div>`, 'inline, gedämpft wie im Header')}
        ${figure(`<div style="block-size: 3rem; padding: var(--cda-space-xs); background: var(--cda-color-accent-default); color: var(--cda-color-text-on-accent)">${LOGO.replace('<svg ', '<svg style="block-size: 100%" ')}</div>`, 'inline auf Gelb, <code class="docs-code">text.on-accent</code>')}
        ${figure(`<div style="padding: var(--cda-space-xs); background: var(--cda-color-neutral-0)"><img src="${logoUrl}" alt="Cranach Digital Archive" style="display: block; block-size: 3rem"></div>`, 'als <code class="docs-code">&lt;img&gt;</code>: immer schwarz')}
      </div>`),
};

/** Favicon als SVG und in den Rasterfassungen */
export const Favicon = {
  render: () =>
    sample(`
      <div class="docs-row">
        ${figure(`<img src="${faviconSvgUrl}" alt="Favicon als SVG" width="64" height="64">`, '<code class="docs-code">favicon.svg</code>')}
        ${figure(`<img src="${faviconIcoUrl}" alt="Favicon als ICO, 32 px" width="32" height="32">`, '<code class="docs-code">favicon.ico</code>, 16 und 32 px')}
        ${figure(`<img src="${touchIconUrl}" alt="Favicon für den iOS-Startbildschirm, 180 px" width="90" height="90">`, '<code class="docs-code">apple-touch-icon.png</code>, 180 px (halb so groß gezeigt)')}
      </div>`),
};
