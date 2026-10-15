/**
 * Prüft die WCAG-Kontraste der semantischen Farb-Tokens in beiden Themes (ADR 0008).
 * Schlägt fehl, wenn eine Paarung die Mindestanforderung verfehlt.
 *   Text: 4,5:1 (WCAG 1.4.3 AA) · Bedienelemente/Fokus: 3:1 (WCAG 1.4.11)
 */
import { tokens } from '../dist/tokens.js';

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const TEXT = 4.5;
const UI = 3;
const pairs = [
  ['text.default', 'background.default', TEXT],
  ['text.default', 'background.subtle', TEXT],
  ['text.default', 'background.muted', TEXT],
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
  ['border.strong', 'background.default', UI],
  ['focus.ring', 'background.default', UI],
  ['focus.ring', 'background.subtle', UI],
  ['accent.default', 'background.default', 1, 'nur Fläche, kein Text'],
];

const get = (theme, key) => key.split('.').reduce((o, k) => o[k], tokens[theme].color);
let failed = 0;
for (const theme of ['light', 'dark']) {
  console.log(`\n${theme === 'light' ? 'Hell' : 'Dunkel'}`);
  for (const [fg, bg, min, note] of pairs) {
    const r = ratio(get(theme, fg), get(theme, bg));
    const ok = r >= min;
    if (!ok) failed++;
    const label = note ? `(${note})` : `min ${min}:1`;
    console.log(`  ${ok ? '✔' : '✘'} ${fg.padEnd(16)} auf ${bg.padEnd(22)} ${r.toFixed(2).padStart(5)}:1  ${label}`);
  }
}
if (failed) {
  console.error(`\n${failed} Paarung(en) verfehlen den Mindestkontrast.`);
  process.exit(1);
}
console.log('\nAlle Kontraste erfüllt.');
