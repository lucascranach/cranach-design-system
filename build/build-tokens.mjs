/**
 * Baut aus den DTCG-Tokens (tokens/) alle Ausgabeformate nach dist/.
 *
 *   dist/tokens.css          CSS Custom Properties (Primitive + Themes) in @layer cda.tokens
 *   dist/custom-media.css    @custom-media-Definitionen der Breakpoints
 *   dist/tailwind.css        Tailwind-4-Theme + Zuordnung der shadcn-Variablen
 *   dist/tokens.js / .d.ts   aufgelöste Werte für JS/TS (three.js, Mapbox, Berechnungen)
 *   dist/figma/tokens.figma.json  Variablen-Beschreibung für den Figma-Sync
 *
 * Siehe ADR 0002, 0004, 0007.
 */
import StyleDictionary from 'style-dictionary';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PREFIX = 'cda';
const DIST = 'dist';
const THEMES = ['light', 'dark'];

const transforms = ['name/kebab', 'color/css', 'fontFamily/css', 'cubicBezier/css', 'shadow/css/shorthand'];

const isSemantic = (token) => token.filePath.includes(`${path.sep}semantic${path.sep}`) || token.filePath.includes('/semantic/');
const valueOf = (token) => token.$value ?? token.value;
const originalOf = (token) => token.original.$value ?? token.original.value;

/** Liefert die aufgelösten Tokens eines Themes (Primitive + Semantik). */
async function loadTheme(theme) {
  const sd = new StyleDictionary({
    source: ['tokens/primitive/**/*.json', `tokens/semantic/${theme}.json`],
    usesDtcg: true,
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: { x: { prefix: PREFIX, transforms } },
  });
  const dictionary = await sd.getPlatformTokens('x');
  return dictionary.allTokens;
}

const cssVar = (token) => `--${token.name}`;

/** Wert als CSS: Referenzen auf andere Tokens bleiben als var() erhalten. */
function cssValue(token, byPath) {
  const orig = originalOf(token);
  if (typeof orig === 'string' && /^\{[^}]+\}$/.test(orig)) {
    const ref = byPath.get(orig.slice(1, -1));
    if (ref) return `var(${cssVar(ref)})`;
  }
  return String(valueOf(token));
}

const block = (selector, lines, indent = '  ') =>
  `${indent}${selector} {\n${lines.map((l) => `${indent}  ${l}`).join('\n')}\n${indent}}`;

async function main() {
  const themes = {};
  for (const t of THEMES) themes[t] = await loadTheme(t);

  const all = themes.light;
  const byPath = new Map(all.map((t) => [t.path.join('.'), t]));
  const primitives = all.filter((t) => !isSemantic(t));
  const semantic = Object.fromEntries(THEMES.map((t) => [t, themes[t].filter(isSemantic)]));

  await mkdir(path.join(DIST, 'figma'), { recursive: true });
  const header = '/* Cranach Design System – generiert aus tokens/, nicht von Hand bearbeiten. */\n';

  // ---------- tokens.css ----------
  const decl = (tokens, map) => tokens.map((t) => `${cssVar(t)}: ${cssValue(t, map)};`);
  const darkMap = new Map(themes.dark.map((t) => [t.path.join('.'), t]));
  const durations = primitives.filter((t) => t.path[0] === 'duration');
  const css = [
    header,
    '@layer cda.tokens, cda.reset, cda.base, cda.layout, cda.components, cda.utilities;\n',
    '@layer cda.tokens {',
    block(':root', decl(primitives, byPath)),
    '',
    '  /* Helles Theme (Standard) */',
    block(':root, [data-theme="light"], .light', ['color-scheme: light;', ...decl(semantic.light, byPath)]),
    '',
    '  /* Dunkles Theme – erzwungen */',
    block('[data-theme="dark"], .dark', ['color-scheme: dark;', ...decl(semantic.dark, darkMap)]),
    '',
    '  /* Dunkles Theme – Systemeinstellung, sofern kein Theme erzwungen ist */',
    '  @media (prefers-color-scheme: dark) {',
    block(':root:not([data-theme="light"]):not(.light)', ['color-scheme: dark;', ...decl(semantic.dark, darkMap)], '    '),
    '  }',
    '',
    '  /* Reduzierte Bewegung (ADR 0010): Alle Dauern werden praktisch null. Bewusst nicht 0,',
    '     damit transitionend/animationend weiter ausgelöst werden. */',
    '  @media (prefers-reduced-motion: reduce) {',
    block(':root', durations.map((t) => `${cssVar(t)}: 0.01ms;`), '    '),
    '  }',
    '}',
    '',
  ].join('\n');
  await writeFile(path.join(DIST, 'tokens.css'), css);

  // ---------- custom-media.css ----------
  const bps = primitives.filter((t) => t.path[0] === 'breakpoint');
  const customMedia = [
    header,
    '/* Nutzung mit PostCSS (postcss-custom-media) oder Lightning CSS (drafts.customMedia).',
    '   Ohne Werkzeug die Werte direkt schreiben, z. B. @media (width >= 768px). */',
    ...bps.map((t) => `@custom-media --${PREFIX}-${t.path[1]} (width >= ${valueOf(t)});`),
    ...bps.map((t) => `@custom-media --${PREFIX}-below-${t.path[1]} (width < ${valueOf(t)});`),
    '',
  ].join('\n');
  await writeFile(path.join(DIST, 'custom-media.css'), customMedia);

  // ---------- tailwind.css ----------
  const pxToRem = (v) => `${parseFloat(v) / 16}rem`;
  const twColors = semantic.light
    .filter((t) => t.path[0] === 'color')
    .map((t) => `--color-${PREFIX}-${t.path.slice(1).join('-')}: var(${cssVar(t)});`);
  const shadcn = {
    background: 'color-background-default',
    foreground: 'color-text-default',
    card: 'color-background-subtle',
    'card-foreground': 'color-text-default',
    popover: 'color-background-default',
    'popover-foreground': 'color-text-default',
    primary: 'color-accent-default',
    'primary-foreground': 'color-text-on-accent',
    secondary: 'color-background-medium',
    'secondary-foreground': 'color-text-default',
    muted: 'color-background-medium',
    'muted-foreground': 'color-text-muted',
    accent: 'color-background-medium',
    'accent-foreground': 'color-text-default',
    destructive: 'color-text-danger',
    border: 'color-border-default',
    input: 'color-border-strong',
    ring: 'color-focus-ring',
    radius: 'radius-m',
  };
  const tailwind = [
    header,
    '/* Einbinden (ADR 0002, 0003) – die Layer-Reihenfolge muss VOR @import "tailwindcss" stehen:',
    '     @layer theme, base, cda, components, utilities;',
    '     @import "tailwindcss";',
    '     @import "@lucascranach/design-system/tailwind.css";',
    '   Cranach-Farben als Utilities mit Präfix: bg-cda-accent-default, text-cda-text-muted …',
    '   shadcn/ui: --primary usw. zeigen auf die Cranach-Tokens; shadcn-"accent" ist dort eine',
    '   neutrale Hover-Fläche, das Cranach-Gelb liegt auf --primary. */',
    '@import "./tokens.css";',
    '',
    '@theme {',
    `  --font-sans: ${valueOf(byPath.get('font.family.sans'))};`,
    `  --font-mono: ${valueOf(byPath.get('font.family.mono'))};`,
    ...bps.map((t) => `  --breakpoint-${t.path[1]}: ${pxToRem(valueOf(t))};`),
    '}',
    '',
    '@theme inline {',
    ...twColors.map((l) => `  ${l}`),
    `  --radius-${PREFIX}-s: var(--${PREFIX}-radius-s);`,
    `  --radius-${PREFIX}-m: var(--${PREFIX}-radius-m);`,
    '}',
    '',
    block(':root', Object.entries(shadcn).map(([k, v]) => `--${k}: var(--${PREFIX}-${v});`), ''),
    '',
  ].join('\n');
  await writeFile(path.join(DIST, 'tailwind.css'), tailwind);

  // ---------- tokens.js / tokens.d.ts ----------
  const nest = (tokens) => {
    const out = {};
    for (const t of tokens) {
      let o = out;
      t.path.slice(0, -1).forEach((k) => (o = o[k] ??= {}));
      o[t.path.at(-1)] = valueOf(t);
    }
    return out;
  };
  const jsObj = { ...nest(primitives), light: nest(semantic.light), dark: nest(semantic.dark) };
  await writeFile(
    path.join(DIST, 'tokens.js'),
    `${header}export const tokens = ${JSON.stringify(jsObj, null, 2)};\nexport default tokens;\n`,
  );
  const toType = (o, ind = '  ') =>
    `{\n${Object.entries(o)
      .map(([k, v]) => `${ind}readonly ${JSON.stringify(k)}: ${typeof v === 'object' ? toType(v, ind + '  ') : JSON.stringify(v)};`)
      .join('\n')}\n${ind.slice(2)}}`;
  await writeFile(
    path.join(DIST, 'tokens.d.ts'),
    `${header}export declare const tokens: ${toType(jsObj)};\nexport default tokens;\n`,
  );

  // ---------- figma/tokens.figma.json ----------
  const figmaType = (t) => {
    const type = t.$type ?? t.type;
    const v = valueOf(t);
    if (type === 'color') return 'COLOR';
    if ((type === 'dimension' || type === 'number' || type === 'fontWeight') && /^-?\d+(\.\d+)?(px)?$/.test(String(v))) return 'FLOAT';
    return 'STRING';
  };
  // Schriftfamilien: Figma braucht den echten Namen der Schrift, nicht den Familiennamen aus
  // cranach.css und nicht die Fallback-Liste (ADR 0017)
  const figmaFont = (t) =>
    t.$extensions?.['org.lucascranach.design-system']?.figmaFontFamily ??
    String(valueOf(t)).split(',')[0].replace(/["']/g, '').trim();
  const figmaValue = (t, type) => {
    if (type === 'FLOAT') return parseFloat(valueOf(t));
    if (t.path[0] === 'font' && t.path[1] === 'family') return figmaFont(t);
    return String(valueOf(t));
  };
  const figmaName = (t) => t.path.join('/');
  const primVars = primitives
    .filter((t) => !['shadow', 'easing'].includes(t.path[0]) && !(t.path[0] === 'font' && t.path[1] === 'size'))
    .map((t) => {
      const type = figmaType(t);
      return { name: figmaName(t), type, description: t.$description ?? t.description ?? '', values: { Value: figmaValue(t, type) } };
    });
  // Schriftgrößen in px für Figma (rem → px)
  primitives
    .filter((t) => t.path[0] === 'font' && t.path[1] === 'size')
    .forEach((t) => primVars.push({ name: figmaName(t), type: 'FLOAT', description: `${valueOf(t)}`, values: { Value: parseFloat(valueOf(t)) * 16 } }));
  const aliasOf = (t) => {
    const orig = originalOf(t);
    return typeof orig === 'string' && /^\{[^}]+\}$/.test(orig) ? orig.slice(1, -1).replaceAll('.', '/') : null;
  };
  const semVars = semantic.light.map((t) => {
    const d = darkMap.get(t.path.join('.'));
    const val = (tok) => (aliasOf(tok) ? { alias: aliasOf(tok) } : String(valueOf(tok)));
    return { name: figmaName(t), type: 'COLOR', description: t.$description ?? t.description ?? '', values: { Light: val(t), Dark: val(d) } };
  });
  const figma = {
    $comment: 'Generiert aus tokens/. Grundlage für build/figma-sync (ADR 0014).',
    collections: [
      { name: 'Cranach Primitives', modes: ['Value'], variables: primVars },
      { name: 'Cranach Semantic', modes: ['Light', 'Dark'], variables: semVars },
    ],
  };
  await writeFile(path.join(DIST, 'figma', 'tokens.figma.json'), JSON.stringify(figma, null, 2) + '\n');

  console.log(`Tokens gebaut: ${primitives.length} Primitive, ${semantic.light.length} semantische Tokens je Theme.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
