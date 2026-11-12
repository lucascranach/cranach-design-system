/**
 * Kontrastberechnung und geprüfte Farbpaarungen (ADR 0008).
 * Genutzt von check-contrast.mjs und von der Farb-Doku in Storybook.
 *   Text: 4,5:1 (WCAG 1.4.3 AA) · Bedienelemente, Fokus, Link-Unterstreichung: 3:1 (WCAG 1.4.11, ADR 0018)
 */

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Kontrastverhältnis zweier Hex-Farben (#rrggbb) */
export const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

export const TEXT = 4.5;
export const UI = 3;

/** [Vordergrund, Hintergrund, Mindestwert, Hinweis] – Schlüssel relativ zu color.* */
export const pairs = [
  ['text.default', 'background.default', TEXT],
  ['text.default', 'background.subtle', TEXT],
  ['text.default', 'background.medium', TEXT],
  ['text.default', 'background.strong', TEXT],
  ['text.muted', 'background.default', TEXT],
  ['text.muted', 'background.subtle', TEXT],
  ['text.accent', 'background.default', TEXT],
  ['text.accent', 'background.subtle', TEXT],
  ['text.decoration', 'background.default', TEXT],
  ['text.danger', 'background.default', TEXT],
  ['text.on-accent', 'accent.default', TEXT],
  ['text.on-accent', 'accent.hover', TEXT],
  ['text.default', 'accent.subtle', TEXT],
  ['text.inverse', 'background.inverse', TEXT],
  ['link.default', 'background.default', TEXT],
  ['link.default', 'background.subtle', TEXT],
  ['link.hover-text', 'link.hover-background', TEXT],
  ['link.underline', 'background.default', UI],
  ['link.underline', 'background.subtle', UI],
  ['border.strong', 'background.default', UI],
  ['focus.ring', 'background.default', UI],
  ['focus.ring', 'background.subtle', UI],
  ['text.default', 'feedback.info.background', TEXT],
  ['feedback.info.border', 'feedback.info.background', UI, 'Rand und Symbol der Meldung'],
  ['feedback.info.border', 'background.default', UI, 'Rand der Meldung zur Seite'],
  ['text.default', 'feedback.success.background', TEXT],
  ['feedback.success.border', 'feedback.success.background', UI, 'Rand und Symbol der Meldung'],
  ['feedback.success.border', 'background.default', UI, 'Rand der Meldung zur Seite'],
  ['text.default', 'feedback.danger.background', TEXT],
  ['feedback.danger.border', 'feedback.danger.background', UI, 'Rand und Symbol der Meldung'],
  ['feedback.danger.border', 'background.default', UI, 'Rand der Meldung zur Seite'],
  ['accent.default', 'background.default', 1, 'nur Fläche, kein Text'],
];

/** Liest eine semantische Farbe eines Themes aus dem Token-Objekt von dist/tokens.js */
export const getColor = (tokens, theme, key) => key.split('.').reduce((o, k) => o[k], tokens[theme].color);
