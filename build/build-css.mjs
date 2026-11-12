/**
 * Baut die zentrale Einbinde-Datei und die Schriften nach dist/.
 *
 *   dist/cranach.css   Layer-Reihenfolge, @import von tokens.css, @font-face, Reset, Grundstyles,
 *                      Komponenten, Utilities (prüft, dass es zu jedem z-Token eine Utility gibt)
 *   dist/fonts/        IBM Plex Sans (variabel, wght, normal + kursiv, als „Cranach Sans“) und IBM Plex Mono 400,
 *                      je Subset Latin und Latin-Ext, mit OFL-Lizenztexten
 *
 * Die Icon-Font (dist/fonts/cranach-symbols.woff2) legt build-icons.mjs ab; hier kommt nur
 * ihre @font-face-Regel dazu.
 *
 * Quelle der Schriften sind die Fontsource-Pakete (OFL 1.1, als devDependencies gepinnt).
 * Deren CSS wird nicht übernommen: Die @font-face-Regeln werden hier mit dem Familiennamen
 * aus den Tokens neu geschrieben (Sans als „Cranach Sans“, ADR 0017); unicode-range kommt aus dem Paket.
 * Siehe ADR 0009.
 *
 * Setzt voraus, dass build-tokens.mjs und build-icons.mjs vorher gelaufen sind.
 */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = 'dist';
const FONT_DIR = path.join(DIST, 'fonts');
const SUBSETS = ['latin', 'latin-ext'];
const require = createRequire(import.meta.url);

/** Reihenfolge der Quell-Dateien in cranach.css */
const SOURCES = [
  'src/reset.css',
  'src/base.css',
  'src/layout.css',
  'src/components/icon.css',
  'src/components/button.css',
  'src/components/text-field.css',
  'src/components/search.css',
  'src/components/checkbox.css',
  'src/components/toggle.css',
  'src/components/switcher.css',
  'src/components/accordion.css',
  'src/components/loader.css',
  'src/components/message.css',
  'src/components/dialog.css',
  'src/components/drawer.css',
  'src/components/table.css',
  'src/components/card.css',
  'src/components/header.css',
  'src/components/footer.css',
  'src/components/skip-link.css',
  'src/utilities.css',
];

/** Icon-Font aus build-icons.mjs (ADR 0012) */
const ICON_FONT = 'cranach-symbols.woff2';

const FONTS = [
  {
    pkg: '@fontsource-variable/ibm-plex-sans',
    name: 'IBM Plex Sans',
    token: 'sans',
    license: 'OFL-IBM-Plex-Sans.txt',
    faces: [
      { css: 'wght.css', block: (subset) => `ibm-plex-sans-${subset}-wght-normal` },
      { css: 'wght-italic.css', block: (subset) => `ibm-plex-sans-${subset}-wght-italic` },
    ],
  },
  {
    pkg: '@fontsource/ibm-plex-mono',
    name: 'IBM Plex Mono',
    token: 'mono',
    license: 'OFL-IBM-Plex-Mono.txt',
    faces: [{ css: '400.css', block: (subset) => `ibm-plex-mono-${subset}-400-normal` }],
  },
];

// Die Fontsource-Pakete geben package.json nicht über "exports" frei, LICENSE aber schon.
const pkgDir = (pkg) => path.dirname(require.resolve(`${pkg}/LICENSE`));

/** Liest einen Deskriptor aus einem @font-face-Block, z. B. "font-weight". */
function descriptor(body, name, blockName) {
  const match = body.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  if (!match) throw new Error(`${blockName}: "${name}" fehlt`);
  return match[1].trim();
}

/** Findet in einem Fontsource-CSS den Block mit dem Kommentar /* <name> *\/. */
function findBlock(css, name) {
  const re = new RegExp(`/\\*\\s*${name}\\s*\\*/\\s*@font-face\\s*\\{([^}]*)\\}`);
  const match = css.match(re);
  if (!match) throw new Error(`@font-face-Block "${name}" nicht gefunden – Paketstruktur geändert?`);
  return match[1];
}

/** Erster Eintrag eines font-family-Tokens, z. B. "'Cranach Sans', system-ui" → Cranach Sans */
const firstFamily = (value) => String(value).split(',')[0].replace(/["']/g, '').trim();

async function buildFonts() {
  await mkdir(FONT_DIR, { recursive: true });
  const rules = [];
  const files = [];
  const { tokens } = await import(pathToFileURL(path.join(DIST, 'tokens.js')).href);

  for (const font of FONTS) {
    const dir = pkgDir(font.pkg);
    const { version } = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8'));
    const family = firstFamily(tokens.font.family[font.token]);
    await copyFile(path.join(dir, 'LICENSE'), path.join(FONT_DIR, font.license));
    const label = family === font.name ? family : `${family} = ${font.name}`;
    rules.push(`/* ${label} – ${font.pkg}@${version}, SIL Open Font License 1.1 (fonts/${font.license}) */`);

    for (const face of font.faces) {
      const css = await readFile(path.join(dir, face.css), 'utf8');
      for (const subset of SUBSETS) {
        const name = face.block(subset);
        const body = findBlock(css, name);
        const woff2 = body.match(/url\(\.\/files\/([^)]+\.woff2)\)/)?.[1];
        if (!woff2) throw new Error(`${name}: keine woff2-Datei angegeben`);
        await copyFile(path.join(dir, 'files', woff2), path.join(FONT_DIR, woff2));
        files.push(woff2);
        rules.push(
          [
            '@font-face {',
            `  font-family: "${family}";`,
            `  font-style: ${descriptor(body, 'font-style', name)};`,
            `  font-weight: ${descriptor(body, 'font-weight', name)};`,
            '  font-display: swap;',
            `  src: url("./fonts/${woff2}") format("woff2");`,
            `  unicode-range: ${descriptor(body, 'unicode-range', name)};`,
            '}',
          ].join('\n'),
        );
      }
    }
  }
  // Icon-Font: von build-icons.mjs bereits nach dist/fonts/ gelegt
  if (!existsSync(path.join(FONT_DIR, ICON_FONT))) {
    throw new Error(`dist/fonts/${ICON_FONT} fehlt – zuerst "npm run build:icons" ausführen.`);
  }
  rules.push(
    '/* Cranach Symbols – Subset von Material Symbols Sharp, Apache License 2.0 (fonts/LICENSE-Material-Symbols.txt) */',
    [
      '@font-face {',
      `  font-family: "${firstFamily(tokens.font.family.icon)}";`,
      '  font-style: normal;',
      '  font-weight: 400;',
      '  font-display: block;',
      `  src: url("./fonts/${ICON_FONT}") format("woff2");`,
      '}',
    ].join('\n'),
  );
  files.push(ICON_FONT);

  return { rules, files };
}

/** Bricht ab, wenn zu einem z-Token die Utility-Klasse .cda-u-z-* fehlt (ADR 0011) */
async function checkZUtilities(utilitiesCss) {
  const { z } = JSON.parse(await readFile('tokens/primitive/z-index.json', 'utf8'));
  const missing = Object.keys(z)
    .filter((key) => !key.startsWith('$'))
    .filter((key) => !utilitiesCss.includes(`.cda-u-z-${key} {\n    z-index: var(--cda-z-${key});`));
  if (missing.length) {
    throw new Error(`src/utilities.css: Klasse fehlt für ${missing.map((k) => `--cda-z-${k}`).join(', ')}`);
  }
}

/** Bricht ab, wenn zu einem Abstands-Token die Utility-Klasse .cda-u-space-* fehlt (ADR 0021) */
async function checkSpaceUtilities(utilitiesCss) {
  const { space } = JSON.parse(await readFile('tokens/primitive/dimension.json', 'utf8'));
  const keys = Object.entries(space)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, node]) => ('$value' in node ? [key] : Object.keys(node).filter((k) => !k.startsWith('$')).map((k) => `${key}-${k}`)));
  const missing = keys.filter((key) => !utilitiesCss.includes(`.cda-u-space-${key} {\n    --cda-l-space: var(--cda-space-${key});`));
  if (missing.length) {
    throw new Error(`src/utilities.css: Klasse fehlt für ${missing.map((k) => `--cda-space-${k}`).join(', ')}`);
  }
}

async function main() {
  const { rules, files } = await buildFonts();
  const sources = await Promise.all(SOURCES.map((f) => readFile(f, 'utf8')));
  await checkZUtilities(sources[SOURCES.indexOf('src/utilities.css')]);
  await checkSpaceUtilities(sources[SOURCES.indexOf('src/utilities.css')]);

  const css = [
    '/* Cranach Design System – generiert aus src/ und tokens/, nicht von Hand bearbeiten. */',
    '',
    '/* Layer-Reihenfolge (ADR 0003). In Tailwind-Projekten vorher',
    '   @layer theme, base, cda, components, utilities; deklarieren. */',
    '@layer cda.tokens, cda.reset, cda.base, cda.layout, cda.components, cda.utilities;',
    '',
    '@import "./tokens.css";',
    '',
    '/* ---------- Schriften (ADR 0009) ---------- */',
    '',
    rules.join('\n\n'),
    '',
    ...sources.map((s) => s.trimEnd() + '\n'),
  ].join('\n');

  await writeFile(path.join(DIST, 'cranach.css'), css);
  console.log(`CSS gebaut: dist/cranach.css, ${files.length} Schriftdateien in dist/fonts/.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
