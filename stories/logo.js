/**
 * Logo des Cranach Digital Archive für die Doku, aus brand/logo.svg (ADR 0016, Roadmap-Schritt 31).
 * fill="currentColor": Das Logo nimmt die Textfarbe an und ersetzt so die Varianten bw, gw, ws
 * und ys der Bestandsprojekte. Inline ohne eigenen Namen für Screenreader – den trägt der Link.
 */
import logoSvg from '../brand/logo.svg?raw';

export const LOGO = logoSvg
  .trim()
  .replace('<svg xmlns="http://www.w3.org/2000/svg" ', '<svg ')
  .replace('fill="currentColor">', 'fill="currentColor" aria-hidden="true" focusable="false">');
