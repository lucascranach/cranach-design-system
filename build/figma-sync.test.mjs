/**
 * Tests für dist/figma/figma-sync.js (ADR 0014) gegen eine nachgebaute Figma-API (Variablen,
 * Text- und Effektstile). Prüft: Anlegen in einer leeren Datei, Idempotenz, Zurücksetzen
 * geänderter Werte, Waisen, Typkonflikte, gültige Scopes je Typ, geladene Schriften.
 *
 * Aufruf: npm run test:figma (setzt npm run build voraus)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const SCRIPT = await readFile('dist/figma/figma-sync.js', 'utf8');

/** Anzahl der Variablen und Stile laut Tokens – aus den Daten im Skript, damit neue Tokens die Tests nicht brechen */
const DATA = JSON.parse(SCRIPT.match(/^const DATA = (.*);$/m)[1]);
const VARS = DATA.collections.reduce((n, c) => n + c.variables.length, 0);
const STYLES = DATA.textStyles.length + DATA.effectStyles.length;
const TOTAL = VARS + STYLES;

/** Erlaubte Scopes je Variablentyp laut Figma-Plugin-API */
const ALLOWED = {
  COLOR: ['ALL_SCOPES', 'ALL_FILLS', 'FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR', 'EFFECT_COLOR'],
  FLOAT: ['ALL_SCOPES', 'TEXT_CONTENT', 'WIDTH_HEIGHT', 'GAP', 'CORNER_RADIUS', 'STROKE_FLOAT', 'EFFECT_FLOAT', 'OPACITY',
    'FONT_WEIGHT', 'FONT_SIZE', 'LINE_HEIGHT', 'LETTER_SPACING', 'PARAGRAPH_SPACING', 'PARAGRAPH_INDENT'],
  STRING: ['ALL_SCOPES', 'TEXT_CONTENT', 'FONT_FAMILY', 'FONT_STYLE'],
};

/** Minimaler Nachbau von figma.variables und der Stile mit den Methoden, die das Skript nutzt */
function fakeFigma() {
  let next = 1;
  const collections = [];
  const variables = [];
  const textStyles = [];
  const effectStyles = [];
  const loaded = new Set(['Inter/Regular']);
  const alias = (v) => ({ type: 'VARIABLE_ALIAS', id: v.id });
  const variablesApi = {
    async getLocalVariableCollectionsAsync() {
      return [...collections];
    },
    async getLocalVariablesAsync() {
      return [...variables];
    },
    createVariableCollection(name) {
      const c = {
        id: `c${next++}`,
        name,
        modes: [{ modeId: `m${next++}`, name: 'Mode 1' }],
        renameMode(modeId, newName) {
          this.modes = this.modes.map((m) => (m.modeId === modeId ? { ...m, name: newName } : m));
        },
        addMode(modeName) {
          const modeId = `m${next++}`;
          this.modes = [...this.modes, { modeId, name: modeName }];
          return modeId;
        },
      };
      collections.push(c);
      return c;
    },
    createVariable(name, collection, resolvedType) {
      if (typeof collection !== 'object') throw new Error('createVariable erwartet die Sammlung als Objekt');
      const v = {
        id: `v${next++}`,
        name,
        resolvedType,
        variableCollectionId: collection.id,
        valuesByMode: {},
        description: '',
        codeSyntax: {},
        _scopes: ['ALL_SCOPES'],
        get scopes() {
          return [...this._scopes];
        },
        set scopes(list) {
          const bad = list.filter((s) => !ALLOWED[resolvedType].includes(s));
          if (bad.length) throw new Error(`Scope ${bad.join(', ')} passt nicht zu ${resolvedType}`);
          if (list.includes('ALL_SCOPES') && list.length > 1) throw new Error('ALL_SCOPES nicht kombinierbar');
          if (list.includes('ALL_FILLS') && list.some((s) => s.endsWith('_FILL'))) throw new Error('ALL_FILLS nicht mit einzelnen Fills');
          this._scopes = [...list];
        },
        setValueForMode(modeId, value) {
          const c = collections.find((x) => x.id === this.variableCollectionId);
          if (!c.modes.some((m) => m.modeId === modeId)) throw new Error(`unbekannter Modus ${modeId}`);
          const ok =
            value?.type === 'VARIABLE_ALIAS' ||
            (resolvedType === 'COLOR' && ['r', 'g', 'b'].every((k) => value[k] >= 0 && value[k] <= 1)) ||
            (resolvedType === 'FLOAT' && typeof value === 'number') ||
            (resolvedType === 'STRING' && typeof value === 'string');
          if (!ok) throw new Error(`Wert ${JSON.stringify(value)} passt nicht zu ${resolvedType}`);
          // Figma speichert Zahlen mit 32 Bit: 0.6 kommt als 0.6000000238… zurück
          this.valuesByMode[modeId] = typeof value === 'number' ? Math.fround(value) : value;
        },
        setVariableCodeSyntax(platform, value) {
          this.codeSyntax = { ...this.codeSyntax, [platform]: value };
        },
      };
      variables.push(v);
      return v;
    },
    createVariableAlias(v) {
      return alias(v);
    },
    setBoundVariableForEffect(effect, field, v) {
      return { ...effect, boundVariables: { ...(effect.boundVariables ?? {}), [field]: alias(v) } };
    },
  };
  const figma = {
    variables: variablesApi,
    async loadFontAsync({ family, style }) {
      loaded.add(`${family}/${style}`);
    },
    async getLocalTextStylesAsync() {
      return [...textStyles];
    },
    async getLocalEffectStylesAsync() {
      return [...effectStyles];
    },
    createTextStyle() {
      const s = {
        id: `s${next++}`,
        type: 'TEXT',
        name: '',
        description: '',
        fontSize: 12,
        lineHeight: { unit: 'AUTO' },
        boundVariables: {},
        _fontName: { family: 'Inter', style: 'Regular' },
        get fontName() {
          return { ...this._fontName };
        },
        // Wie in Figma: nur mit geladener Schrift
        set fontName(f) {
          if (!loaded.has(`${f.family}/${f.style}`)) throw new Error(`Schrift nicht geladen: ${f.family} ${f.style}`);
          this._fontName = { ...f };
        },
        setBoundVariable(field, v) {
          if (!['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing'].includes(field)) throw new Error(`Feld ${field}`);
          this.boundVariables = { ...this.boundVariables, [field]: alias(v) };
        },
      };
      textStyles.push(s);
      return s;
    },
    createEffectStyle() {
      const s = {
        id: `s${next++}`,
        type: 'EFFECT',
        name: '',
        description: '',
        _effects: [],
        get effects() {
          return this._effects.map((e) => ({ ...e }));
        },
        set effects(list) {
          for (const e of list) {
            if (!['r', 'g', 'b', 'a'].every((k) => e.color[k] >= 0 && e.color[k] <= 1)) throw new Error('Farbe außerhalb 0–1');
            if (e.radius < 0) throw new Error('Radius negativ');
          }
          this._effects = list.map((e) => ({ ...e, radius: Math.fround(e.radius), color: { ...e.color, a: Math.fround(e.color.a) } }));
        },
      };
      effectStyles.push(s);
      return s;
    },
  };
  return { figma, collections, variables, textStyles, effectStyles };
}

/** Führt das Skript aus wie use_figma: als Rumpf einer async-Funktion (daher return am Ende).
    Das Ergebnis per JSON zurück, weil Arrays aus dem vm-Kontext einen anderen Prototyp haben
    und deepStrictEqual sonst scheitert. */
const run = async (figma) =>
  JSON.parse(JSON.stringify(await vm.runInNewContext(`(async () => {\n${SCRIPT}\n})()`, { figma })));

test('leere Datei: legt Sammlungen, Modi und alle Variablen an', async () => {
  const f = fakeFigma();
  const r = await run(f.figma);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(f.collections.map((c) => [c.name, c.modes.map((m) => m.name)]), [
    ['Cranach Primitives', ['Value']],
    ['Cranach Responsive', ['Mobile 375', 'Tablet 768', 'Desktop 1440']],
    ['Cranach Semantic', ['Light', 'Dark']],
  ]);
  assert.equal(f.variables.length, VARS);

  const byName = (n) => f.variables.find((v) => v.name === n);
  const [light, dark] = f.collections[2].modes.map((m) => m.modeId);
  const bg = byName('color/background/default');
  assert.equal(bg.valuesByMode[light].id, byName('color/neutral/0').id);
  assert.equal(bg.valuesByMode[dark].id, byName('color/neutral/900').id);
  assert.equal(bg.codeSyntax.WEB, 'var(--cda-color-background-default)');

  const value = f.collections[0].modes[0].modeId;
  const alpha = byName('color/alpha/black-40').valuesByMode[value];
  assert.deepEqual([alpha.r, alpha.g, alpha.b, alpha.a], [0, 0, 0, 0.4]);
  assert.equal(byName('font/size/m').valuesByMode[value], 16);
  assert.equal(byName('font/family/sans').valuesByMode[value], 'IBM Plex Sans');
  assert.deepEqual(byName('color/neutral/0').scopes, []);
  assert.deepEqual(byName('color/text/default').scopes, ['TEXT_FILL']);
  assert.deepEqual(byName('color/background/default').scopes, ['FRAME_FILL', 'SHAPE_FILL']);
  assert.deepEqual(byName('color/link/underline').scopes, ['STROKE_COLOR']);

  // Bedeutungen ohne Theme (ADR 0022): in „Cranach Semantic“, in Light und Dark derselbe Wert
  const term = byName('size/term');
  assert.equal(term.variableCollectionId, f.collections[2].id);
  assert.deepEqual([term.valuesByMode[light], term.valuesByMode[dark]], [192, 192]);
  assert.deepEqual(term.scopes, ['WIDTH_HEIGHT']);
  assert.deepEqual(byName('focus/ring-width').scopes, ['STROKE_FLOAT']);
  assert.equal(f.variables.filter((v) => v.name.startsWith('size/') || v.name.startsWith('focus/')).length, 7);

  // Fließende Abstände: Zahlen je Bildschirmbreite statt clamp()-Text
  const fluid = byName('space/fluid/m');
  assert.equal(fluid.resolvedType, 'FLOAT');
  assert.equal(fluid.variableCollectionId, f.collections[1].id);
  assert.deepEqual(f.collections[1].modes.map((m) => fluid.valuesByMode[m.modeId]), [16, 23, 37]);
  assert.equal(f.variables.filter((v) => v.name.startsWith('space/fluid/')).length, 3);

  // Textstile: Schrift, Größe, Zeilenhöhe in Prozent, Bindungen an die Variablen
  assert.deepEqual(f.textStyles.map((s) => s.name), DATA.textStyles.map((t) => t.name));
  const h1 = f.textStyles.find((s) => s.name === 'heading/h1');
  assert.deepEqual(h1.fontName, { family: 'IBM Plex Sans', style: 'SemiBold' });
  assert.equal(h1.fontSize, 40);
  assert.deepEqual([h1.lineHeight.unit, h1.lineHeight.value], ['PERCENT', 120]);
  assert.equal(h1.boundVariables.fontSize.id, byName('font/size/3xl').id);
  assert.equal(h1.boundVariables.fontWeight.id, byName('font/weight/semibold').id);
  assert.equal(h1.boundVariables.fontFamily.id, byName('font/family/sans').id);
  assert.match(h1.description, /var\(--cda-font-size-3xl\)/);
  assert.deepEqual(f.textStyles.find((s) => s.name === 'code').fontName, { family: 'IBM Plex Mono', style: 'Regular' });

  // Effektstile: Schatten mit Farbe aus der Variable
  assert.deepEqual(f.effectStyles.map((s) => s.name), ['shadow/s', 'shadow/m', 'shadow/l']);
  const [m] = f.effectStyles.find((s) => s.name === 'shadow/m').effects;
  assert.equal(m.type, 'DROP_SHADOW');
  assert.deepEqual([m.offset.x, m.offset.y, m.radius, m.spread], [1, 1, 12, 0]);
  assert.ok(Math.abs(m.color.a - 0.4) < 1e-6);
  assert.equal(m.boundVariables.color.id, byName('color/alpha/black-40').id);
});

test('zweiter Lauf ändert nichts (idempotent)', async () => {
  const f = fakeFigma();
  await run(f.figma);
  const r = await run(f.figma);
  assert.equal(r.created.length, 0);
  assert.deepEqual(r.changed, []);
  assert.equal(r.unchanged, TOTAL);
  assert.equal(f.variables.length, VARS);
  assert.equal(f.collections.length, 3);
  assert.equal(f.textStyles.length + f.effectStyles.length, STYLES);
});

test('von Hand geänderte Werte werden zurückgesetzt', async () => {
  const f = fakeFigma();
  await run(f.figma);
  const v = f.variables.find((x) => x.name === 'space/m');
  v.valuesByMode[f.collections[0].modes[0].modeId] = 15;
  v.description = 'von Hand';
  const r = await run(f.figma);
  assert.deepEqual(r.changed, ['space/m (Value, Beschreibung)']);
  assert.equal(v.valuesByMode[f.collections[0].modes[0].modeId], 16);
});

test('Variablen, die es nicht mehr gibt, werden gemeldet, nicht gelöscht', async () => {
  const f = fakeFigma();
  await run(f.figma);
  f.figma.variables.createVariable('color/alt/grau', f.collections[0], 'COLOR');
  const r = await run(f.figma);
  assert.deepEqual(r.orphans, ['Cranach Primitives/color/alt/grau']);
  assert.equal(f.variables.length, VARS + 1);
});

test('von Hand geänderte Stile werden zurückgesetzt, fremde Stile nur gemeldet', async () => {
  const f = fakeFigma();
  await run(f.figma);
  const h2 = f.textStyles.find((s) => s.name === 'heading/h2');
  h2.fontSize = 30;
  h2.boundVariables = {};
  h2.lineHeight = { unit: 'PIXELS', value: 36 };
  const l = f.effectStyles.find((s) => s.name === 'shadow/l');
  l._effects = [{ ...l._effects[0], radius: 8 }];
  f.figma.createTextStyle().name = 'Alt/Überschrift';
  const r = await run(f.figma);
  assert.deepEqual(r.changed, [
    'Textstil heading/h2 (Größe, Zeilenhöhe, Variable fontFamily, Variable fontSize, Variable fontWeight)',
    'Effektstil shadow/l (Schatten)',
  ]);
  assert.deepEqual(r.orphans, ['Textstil Alt/Überschrift']);
  assert.equal(h2.fontSize, 32);
  assert.equal(l.effects[0].radius, 20);
  assert.equal(f.textStyles.length, DATA.textStyles.length + 1);
});

test('falscher Typ in Figma: Fehler melden, Rest weiter abgleichen', async () => {
  const f = fakeFigma();
  await run(f.figma);
  const v = f.variables.find((x) => x.name === 'duration/fast');
  v.resolvedType = 'FLOAT';
  const r = await run(f.figma);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /^duration\/fast: Typ FLOAT/);
  assert.equal(r.unchanged, TOTAL - 1);
});
