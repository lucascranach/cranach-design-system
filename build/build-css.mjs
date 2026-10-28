/**
 * Baut die zentrale Einbinde-Datei und die Schriften nach dist/.
 *
 *   dist/cranach.css   Layer-Reihenfolge, @import von tokens.css, @font-face, Reset, Grundstyles
 *   dist/fonts/        IBM Plex Sans (variabel, wght, normal + kursiv) und IBM Plex Mono 400,
 *                      je Subset Latin und Latin-Ext, mit OFL-Lizenztexten
 *
 * Quelle der Schriften sind die Fontsource-Pakete (OFL 1.1, als devDependencies gepinnt).
 * Deren CSS wird nicht übernommen: Die @font-face-Regeln werden hier mit dem Familiennamen
 * aus den Tokens neu geschrieben; unicode-range kommt aus dem Paket. Siehe ADR 0009.
 *
 * Setzt voraus, dass build-tokens.mjs vorher gelaufen ist (dist/tokens.css).
 */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const DIST = 'dist';
const FONT_DIR = path.join(DIST, 'fonts');
const SUBSETS = ['latin', 'latin-ext'];
const require = createRequire(import.meta.url);

/** Reihenfolge der Quell-Dateien in cranach.css */
const SOURCES = ['src/reset.css', 'src/base.css'];

const FONTS = [
  {
    pkg: '@fontsource-variable/ibm-plex-sans',
    family: 'IBM Plex Sans',
    license: 'OFL-IBM-Plex-Sans.txt',
    faces: [
      { css: 'wght.css', block: (subset) => `ibm-plex-sans-${subset}-wght-normal` },
      { css: 'wght-italic.css', block: (subset) => `ibm-plex-sans-${subset}-wght-italic` },
    ],
  },
  {
    pkg: '@fontsource/ibm-plex-mono',
    family: 'IBM Plex Mono',
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

async function buildFonts() {
  await mkdir(FONT_DIR, { recursive: true });
  const rules = [];
  const files = [];

  for (const font of FONTS) {
    const dir = pkgDir(font.pkg);
    const { version } = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8'));
    await copyFile(path.join(dir, 'LICENSE'), path.join(FONT_DIR, font.license));
    rules.push(`/* ${font.family} – ${font.pkg}@${version}, SIL Open Font License 1.1 (fonts/${font.license}) */`);

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
            `  font-family: "${font.family}";`,
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
  return { rules, files };
}

async function main() {
  const { rules, files } = await buildFonts();
  const sources = await Promise.all(SOURCES.map((f) => readFile(f, 'utf8')));

  const css = [
    '/* Cranach Design System – generiert aus src/ und tokens/, nicht von Hand bearbeiten. */',
    '',
    '/* Layer-Reihenfolge (ADR 0003). In Tailwind-Projekten vorher',
    '   @layer theme, base, cda, components, utilities; deklarieren. */',
    '@layer cda.tokens, cda.reset, cda.base, cda.components, cda.utilities;',
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
