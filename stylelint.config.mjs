/**
 * Stylelint – Regeln für das CSS des Designsystems (ADR 0003, 0008, 0010, 0011, 0013).
 *
 *   src/        strenge Regeln: Präfix cda-, alles in @layer cda.*, Werte nur über Tokens
 *   .storybook/ Hilfsstyles der Doku: Präfix docs-, ohne Layer-Pflicht
 *
 * Aufruf: npm run lint:css (läuft auch in npm run build)
 */

/** Klassen: cda-block, cda-block__element, cda-block--modifier, Utilities cda-u-… */
const bem = (prefix) => `^${prefix}-[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$`;

/** Farben nur über Tokens: keine Farbfunktionen mit festen Werten */
const COLOR_FUNCTIONS = ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color'];

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  plugins: ['./build/stylelint-plugin-cda.mjs'],
  rules: {
    // ---------- Cascade Layers (ADR 0003) ----------
    'cda/require-layer': true,
    'declaration-no-important': [true, { message: 'Kein !important – es kehrt die Layer-Reihenfolge um (ADR 0003).' }],

    // ---------- Namen (ADR 0003) ----------
    'selector-class-pattern': [bem('cda'), { message: (s) => `Klasse „${s}“: nur cda-block, cda-block__element, cda-block--modifier (ADR 0003).` }],
    'custom-property-pattern': ['^cda-[a-z0-9-]+$', { message: (p) => `Custom Property „${p}“: nur --cda-… (ADR 0003).` }],
    'selector-max-id': [0, { message: 'Keine ID-Selektoren in Designsystem-Styles.' }],

    // Safari (iOS) kennt text-size-adjust nur mit Präfix
    'property-no-vendor-prefix': [true, { ignoreProperties: ['-webkit-text-size-adjust'] }],

    // ---------- Farben nur über Tokens (ADR 0004, 0008) ----------
    'color-no-hex': [true, { message: 'Keine Hex-Farben – Farben über var(--cda-color-…), neue Werte in tokens/ (ADR 0004).' }],
    'color-named': ['never', { message: 'Keine Farbnamen – Farben über var(--cda-color-…) (ADR 0004).' }],
    'function-disallowed-list': [COLOR_FUNCTIONS, { message: (f) => `Keine Farbfunktion ${f}() – Farben über var(--cda-color-…) (ADR 0004).` }],

    // ---------- Maße nur über Tokens (ADR 0010) ----------
    // px nur in Media Queries; dort sind Custom Properties nicht möglich (ADR 0002)
    'unit-disallowed-list': [
      ['px'],
      {
        ignoreMediaFeatureNames: { px: ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height'] },
        message: 'Keine px-Werte – Abstände, Größen und Rahmen über var(--cda-…), neue Werte in tokens/ (ADR 0010).',
      },
    ],

    // ---------- Fokus (ADR 0010) ----------
    'declaration-property-value-disallowed-list': [
      { outline: ['/^none\\b/', '/^0(px)?\\b/'], 'outline-style': ['none'], 'outline-width': ['/^0(px)?$/'] },
      { message: 'Fokus nie unsichtbar machen (kein outline: none) – Ring über :focus-visible (ADR 0010).' },
    ],

    // ---------- z-Ebenen (ADR 0011) ----------
    'declaration-property-value-allowed-list': [
      { 'z-index': ['/^var\\(--cda-z-[a-z-]+\\)$/', 'auto'] },
      { message: 'z-index nur über var(--cda-z-…) (ADR 0011).' },
    ],
  },
  overrides: [
    {
      // Hilfsstyles der Storybook-Doku: nicht Teil des Pakets, ohne Layer
      files: ['.storybook/**/*.css'],
      rules: {
        'cda/require-layer': null,
        'selector-class-pattern': [bem('docs'), { message: (s) => `Klasse „${s}“: Hilfsklassen der Doku beginnen mit docs- .` }],
      },
    },
  ],
};
