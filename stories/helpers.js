/** Kleine Helfer für die Doku-Stories (HTML-Renderer: Stories liefern HTML-Strings). */

export const esc = (value) =>
  String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Name der Custom Property zu einem Token-Pfad, z. B. ['color', 'text', 'default'] → --cda-color-text-default */
export const cssVar = (path) => `--cda-${path.join('-')}`;

/**
 * Durchläuft DTCG-Tokens (JSON aus tokens/) und liefert die Blätter
 * als { path, value, description }. Gruppenbeschreibungen werden vererbt.
 */
export function leaves(node, path = [], inherited = '') {
  if (node && typeof node === 'object' && '$value' in node) {
    return [{ path, value: node.$value, description: node.$description ?? inherited }];
  }
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => leaves(child, [...path, key], node.$description ?? ''));
}

/** Liest einen Wert über einen Pfad aus einem verschachtelten Objekt */
export const at = (obj, path) => path.reduce((o, k) => o?.[k], obj);

/** Umschließt den Inhalt mit der Beispielfläche, die dem Theme folgt */
export const sample = (html) => `<div class="docs-sample">${html}</div>`;

/**
 * Tabelle mit Kopfzeile; Zellen sind bereits HTML. Die Hülle scrollt bei schmalem Fenster
 * seitlich und ist dafür per Tastatur erreichbar und benannt (axe: scrollable-region-focusable).
 */
export const table = (caption, head, rows) => `
  <div class="docs-scroll" role="region" tabindex="0" aria-label="${esc(caption)}">
    <table class="docs-table">
      <caption>${esc(caption)}</caption>
      <thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  </div>`;

export const code = (text) => `<code class="docs-code">${esc(text)}</code>`;
