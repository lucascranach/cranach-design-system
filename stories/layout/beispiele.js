/** Hilfen für die Beispiele der Layouts (ADR 0021) */
import { esc } from '../helpers.js';

/** Platzhalter-Kachel */
export const tile = (text) => `<div class="docs-tile">${esc(text)}</div>`;

/**
 * Rahmen, dessen Breite sich ziehen lässt. Er scrollt bei Bedarf und ist deshalb per Tastatur
 * erreichbar und benannt (axe: scrollable-region-focusable).
 */
export const resizable = (label, html, width = '100%') =>
  `<div class="docs-resize" role="region" tabindex="0" aria-label="${esc(label)} – Breite an der Ecke unten rechts ziehen" style="inline-size: ${width}">${html}</div>`;
