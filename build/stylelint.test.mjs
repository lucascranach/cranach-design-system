/**
 * Prüft, dass die Stylelint-Regeln (stylelint.config.mjs) anschlagen – und gültiges CSS durchlassen.
 * Aufruf: npm run test:lint
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import stylelint from 'stylelint';

/** Liefert die Regelnamen aller Funde für CSS, das als Datei unter `file` geprüft wird */
async function lint(code, file = 'src/test.css') {
  const { results } = await stylelint.lint({ code, codeFilename: file });
  return results[0].warnings.map((w) => w.rule);
}

const inLayer = (css) => `@layer cda.components {\n  ${css}\n}\n`;

test('gültiges CSS in src/ besteht', async () => {
  const css = `@layer cda.tokens, cda.reset, cda.base, cda.components, cda.utilities;

@layer cda.components {
  .cda-button {
    padding: var(--cda-space-s) var(--cda-space-m);
    color: var(--cda-color-text-on-accent);
    background-color: var(--cda-color-accent-default);
    border-radius: var(--cda-radius-m);
    z-index: var(--cda-z-content);

    &:focus-visible {
      outline: var(--cda-focus-ring-width) solid var(--cda-color-focus-ring);
    }

    @media (width >= 768px) {
      padding-inline: var(--cda-space-l);
    }
  }

  .cda-button--primary,
  .cda-card__title,
  .cda-u-visually-hidden {
    inline-size: 1em;
  }
}
`;
  assert.deepEqual(await lint(css), []);
});

const cases = [
  ['Regel ohne Layer', '.cda-x { color: var(--cda-color-text-default); }\n', 'cda/require-layer'],
  ['unbekannter Layer', '@layer cda.extra {\n  .cda-x { color: var(--cda-color-text-default); }\n}\n', 'cda/require-layer'],
  ['!important', inLayer('.cda-x { color: var(--cda-color-text-default) !important; }'), 'declaration-no-important'],
  ['Klasse ohne Präfix', inLayer('.button { color: var(--cda-color-text-default); }'), 'selector-class-pattern'],
  ['Custom Property ohne Präfix', inLayer('.cda-x { --accent: var(--cda-color-accent-default); }'), 'custom-property-pattern'],
  ['ID-Selektor', inLayer('#main { color: var(--cda-color-text-default); }'), 'selector-max-id'],
  ['Hex-Farbe', inLayer('.cda-x { color: #feb701; }'), 'color-no-hex'],
  ['Farbname', inLayer('.cda-x { color: black; }'), 'color-named'],
  ['Farbfunktion', inLayer('.cda-x { color: rgb(0 0 0); }'), 'function-disallowed-list'],
  ['px-Wert', inLayer('.cda-x { padding: 16px; }'), 'unit-disallowed-list'],
  ['outline: none', inLayer('.cda-x:focus { outline: none; }'), 'declaration-property-value-disallowed-list'],
  ['outline: 0', inLayer('.cda-x:focus { outline: 0; }'), 'declaration-property-value-disallowed-list'],
  ['z-index als Zahl', inLayer('.cda-x { z-index: 999; }'), 'declaration-property-value-allowed-list'],
];

for (const [name, css, rule] of cases) {
  test(`meldet: ${name}`, async () => {
    assert.ok((await lint(css)).includes(rule), `${rule} erwartet`);
  });
}

test('Storybook-Hilfsstyles: docs-Präfix ohne Layer erlaubt', async () => {
  const css = '.docs-sample {\n  padding: var(--cda-space-l);\n}\n';
  assert.deepEqual(await lint(css, '.storybook/test.css'), []);
});

test('Storybook-Hilfsstyles: Klasse ohne docs-Präfix wird gemeldet', async () => {
  const css = '.sample {\n  padding: var(--cda-space-l);\n}\n';
  assert.ok((await lint(css, '.storybook/test.css')).includes('selector-class-pattern'));
});
