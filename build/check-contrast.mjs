/**
 * Prüft die WCAG-Kontraste der semantischen Farb-Tokens in beiden Themes (ADR 0008).
 * Schlägt fehl, wenn eine Paarung die Mindestanforderung verfehlt.
 * Paarungen und Berechnung: build/contrast.mjs
 */
import { tokens } from '../dist/tokens.js';
import { getColor, pairs, ratio } from './contrast.mjs';

let failed = 0;
for (const theme of ['light', 'dark']) {
  console.log(`\n${theme === 'light' ? 'Hell' : 'Dunkel'}`);
  for (const [fg, bg, min, note] of pairs) {
    const r = ratio(getColor(tokens, theme, fg), getColor(tokens, theme, bg));
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
