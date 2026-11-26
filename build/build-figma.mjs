/**
 * Erzeugt dist/figma/figma-sync.js aus dist/figma/tokens.figma.json (ADR 0014).
 *
 * Das Skript gleicht die Variablen einer Figma-Datei mit den Tokens ab und wird über den
 * Figma-MCP-Server (use_figma) ausgeführt. Der Plugin-Code steht in build/figma-sync.template.js;
 * hier kommen die Daten dazu, ergänzt um
 *   - scopes: in welchen Feldern Figma die Variable anbietet,
 *   - css:    den Namen der Custom Property, den Figma im Dev Mode anzeigt,
 *   - alias.collection: in welcher Sammlung das Ziel eines Verweises liegt.
 *
 * Deckkraft (opacity/*) steht in den Tokens als Anteil 0–1 wie im CSS; Figma liest eine an die
 * Deckkraft einer Ebene gebundene Variable aber in Prozent. Der Build rechnet deshalb in Prozent um
 * (0.6 → 60) und gibt den Scope OPACITY.
 *
 * Fließende Abstände (space/fluid/*, clamp() mit vw) kann Figma nicht abbilden. Sie kommen statt
 * als Text in den Primitives als Zahlen in eine eigene Sammlung „Cranach Responsive“, je
 * Bildschirmbreite ein Modus (VIEWPORTS), mit dem Wert, den clamp() bei dieser Breite ergibt.
 *
 * Text- und Effektstile (typography.*, shadow.*) reicht der Build durch und prüft, dass jede
 * Variable, auf die sie verweisen, im Sync vorkommt.
 *
 * Setzt voraus, dass build-tokens.mjs vorher gelaufen ist.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.join('dist', 'figma');

/**
 * Scopes je Variable. Primitive Farben bekommen keine: Sie erscheinen nicht in den Farbwählern,
 * damit Gestalter:innen die semantischen Farben nutzen (die auf die primitiven verweisen).
 * Werte ohne passendes Figma-Feld (z-Ebenen, Breakpoints, Dauern, Zeilenhöhe als Faktor) bleiben ebenfalls ohne Scope – sie stehen nur zur Information in der Liste.
 */
export function scopesFor(collection, name) {
  const [group, sub] = name.split('/');
  // Semantische Farben nach Rolle; Bedeutungen ohne Theme (size/*, focus/ring-*, ADR 0022) wie unten nach Art des Werts
  if (collection === 'Cranach Semantic' && group === 'color') {
    const surface = ['FRAME_FILL', 'SHAPE_FILL'];
    if (sub === 'text' || name === 'color/link/default' || name === 'color/link/hover-text') return ['TEXT_FILL'];
    if (sub === 'border' || sub === 'focus' || name === 'color/link/underline') return ['STROKE_COLOR'];
    if (sub === 'accent') return [...surface, 'STROKE_COLOR'];
    // Meldungen: Rand und Symbol (Icon-Font, also Textfarbe) bzw. Fläche
    if (sub === 'feedback') return name.endsWith('/border') ? ['STROKE_COLOR', 'TEXT_FILL'] : surface;
    return surface; // background/*, link/hover-background
  }
  if (group === 'space') return ['GAP', 'WIDTH_HEIGHT'];
  if (group === 'radius') return ['CORNER_RADIUS'];
  if (group === 'border-width' || name === 'focus/ring-width' || name === 'focus/ring-offset') return ['STROKE_FLOAT'];
  // size/measure ist in ch angegeben und kommt als Text nach Figma – ohne Feld, nur zur Information
  if (group === 'size') return name === 'size/measure' ? [] : ['WIDTH_HEIGHT'];
  if (group === 'font' && sub === 'size') return ['FONT_SIZE'];
  if (group === 'font' && sub === 'weight') return ['FONT_WEIGHT'];
  if (group === 'font' && sub === 'family') return ['FONT_FAMILY'];
  if (group === 'opacity') return ['OPACITY'];
  return [];
}

/** Deckkraft von 0–1 (CSS) in Prozent (Figma); auf zwei Nachkommastellen, damit 0.6 genau 60 ergibt */
export const toPercent = (value) => Math.round(value * 10000) / 100;

/** Name der Custom Property im CSS: color/text/default → var(--cda-color-text-default) */
export const cssFor = (name) => `var(--cda-${name.replaceAll('/', '-')})`;

/** Bildschirmbreiten der Modi in „Cranach Responsive“: typisches Smartphone, Breakpoint md, Laptop */
export const VIEWPORTS = { 'Mobile 375': 375, 'Tablet 768': 768, 'Desktop 1440': 1440 };

const RESPONSIVE = 'Cranach Responsive';

/** Wert von clamp(MINpx, Avw + Bpx, MAXpx) bei einer Fensterbreite, auf ganze px gerundet */
export function resolveClamp(value, width) {
  const m = /^clamp\(\s*([\d.]+)px\s*,\s*([\d.]+)vw\s*\+\s*([\d.]+)px\s*,\s*([\d.]+)px\s*\)$/.exec(value);
  if (!m) throw new Error(`Fließender Wert nicht lesbar: ${value}`);
  const [min, vw, px, max] = m.slice(1).map(Number);
  return Math.round(Math.min(max, Math.max(min, (vw * width) / 100 + px)));
}

/** space/fluid/* aus den Primitives in eine eigene Sammlung mit einem Modus je Bildschirmbreite */
function splitFluid(collections) {
  const isFluid = (v) => v.name.startsWith('space/fluid/');
  const fluid = collections.flatMap((c) => c.variables.filter(isFluid));
  const rest = collections.map((c) => ({ ...c, variables: c.variables.filter((v) => !isFluid(v)) }));
  if (!fluid.length) return rest;
  const responsive = {
    name: RESPONSIVE,
    modes: Object.keys(VIEWPORTS),
    variables: fluid.map((v) => {
      const css = Object.values(v.values)[0];
      return {
        name: v.name,
        type: 'FLOAT',
        description: `${css} – im Code fließend, hier je Bildschirmbreite ausgerechnet`,
        values: Object.fromEntries(Object.entries(VIEWPORTS).map(([mode, width]) => [mode, resolveClamp(css, width)])),
      };
    }),
  };
  // Hinter die Primitives, vor die semantischen Farben
  return [rest[0], responsive, ...rest.slice(1)];
}

export async function buildFigmaData() {
  const tokens = JSON.parse(await readFile(path.join(DIR, 'tokens.figma.json'), 'utf8'));
  const collections = splitFluid(tokens.collections);
  const home = new Map();
  for (const c of collections) for (const v of c.variables) home.set(v.name, c.name);

  const known = (style, ref) => {
    if (!home.has(ref.variable)) throw new Error(`${style}: Verweis auf unbekannte Variable ${ref.variable}`);
    return { ...ref, collection: home.get(ref.variable) };
  };
  const textStyles = (tokens.textStyles ?? []).map((t) => ({
    ...t,
    fontFamily: known(t.name, t.fontFamily),
    fontSize: known(t.name, t.fontSize),
    fontWeight: known(t.name, t.fontWeight),
  }));
  const effectStyles = (tokens.effectStyles ?? []).map((e) => ({
    ...e,
    effects: e.effects.map((fx) => ({ ...fx, color: known(e.name, fx.color) })),
  }));

  return {
    textStyles,
    effectStyles,
    collections: collections.map((c) => ({
      name: c.name,
      modes: c.modes,
      variables: c.variables.map((v) => ({
        name: v.name,
        type: v.type,
        description: v.name.startsWith('opacity/')
          ? `${v.description ? `${v.description} ` : ''}In Figma in Prozent, im CSS als Anteil (${v.values.Value}).`
          : (v.description ?? ''),
        scopes: scopesFor(c.name, v.name),
        css: cssFor(v.name),
        values: Object.fromEntries(
          Object.entries(v.values).map(([mode, value]) => {
            if (value && typeof value === 'object' && value.alias) {
              if (!home.has(value.alias)) throw new Error(`${v.name}: Verweis auf unbekannte Variable ${value.alias}`);
              return [mode, { alias: value.alias, collection: home.get(value.alias) }];
            }
            if (v.name.startsWith('opacity/')) {
              if (typeof value !== 'number' || value < 0 || value > 1) throw new Error(`${v.name}: Deckkraft ${value} liegt nicht zwischen 0 und 1`);
              return [mode, toPercent(value)];
            }
            return [mode, value];
          }),
        ),
      })),
    })),
  };
}

async function main() {
  const data = await buildFigmaData();
  const template = await readFile(path.join('build', 'figma-sync.template.js'), 'utf8');
  if (!template.includes('__TOKENS__')) throw new Error('figma-sync.template.js: Platzhalter __TOKENS__ fehlt');
  const script = template.replace('__TOKENS__', JSON.stringify(data));
  await writeFile(path.join(DIR, 'figma-sync.js'), script);
  const count = data.collections.reduce((n, c) => n + c.variables.length, 0);
  console.log(
    `Figma-Sync gebaut: dist/figma/figma-sync.js, ${count} Variablen, ${data.textStyles.length} Textstile, ` +
      `${data.effectStyles.length} Effektstile, ${Math.round(script.length / 1024)} KB.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
