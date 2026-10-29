/**
 * Tests für dist/figma/figma-sync.js (ADR 0014) gegen eine nachgebaute Figma-Variablen-API.
 * Prüft: Anlegen in einer leeren Datei, Idempotenz, Zurücksetzen geänderter Werte, Waisen,
 * Typkonflikte und gültige Scopes je Typ.
 *
 * Aufruf: npm run test:figma (setzt npm run build voraus)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const SCRIPT = await readFile('dist/figma/figma-sync.js', 'utf8');

/** Erlaubte Scopes je Variablentyp laut Figma-Plugin-API */
const ALLOWED = {
  COLOR: ['ALL_SCOPES', 'ALL_FILLS', 'FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR', 'EFFECT_COLOR'],
  FLOAT: ['ALL_SCOPES', 'TEXT_CONTENT', 'WIDTH_HEIGHT', 'GAP', 'CORNER_RADIUS', 'STROKE_FLOAT', 'EFFECT_FLOAT', 'OPACITY',
    'FONT_WEIGHT', 'FONT_SIZE', 'LINE_HEIGHT', 'LETTER_SPACING', 'PARAGRAPH_SPACING', 'PARAGRAPH_INDENT'],
  STRING: ['ALL_SCOPES', 'TEXT_CONTENT', 'FONT_FAMILY', 'FONT_STYLE'],
};

/** Minimaler Nachbau von figma.variables mit den Methoden, die das Skript nutzt */
function fakeFigma() {
  let next = 1;
  const collections = [];
  const variables = [];
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
          this.valuesByMode[modeId] = value;
        },
        setVariableCodeSyntax(platform, value) {
          this.codeSyntax = { ...this.codeSyntax, [platform]: value };
        },
      };
      variables.push(v);
      return v;
    },
    createVariableAlias(v) {
      return { type: 'VARIABLE_ALIAS', id: v.id };
    },
  };
  return { figma: { variables: variablesApi }, collections, variables };
}

/** Führt das Skript aus; das Ergebnis per JSON zurück, weil Arrays aus dem vm-Kontext einen
    anderen Prototyp haben und deepStrictEqual sonst scheitert */
const run = async (figma) => JSON.parse(JSON.stringify(await vm.runInNewContext(SCRIPT, { figma })));

test('leere Datei: legt Sammlungen, Modi und alle Variablen an', async () => {
  const f = fakeFigma();
  const r = await run(f.figma);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(f.collections.map((c) => [c.name, c.modes.map((m) => m.name)]), [
    ['Cranach Primitives', ['Value']],
    ['Cranach Semantic', ['Light', 'Dark']],
  ]);
  assert.equal(f.variables.length, 121);

  const byName = (n) => f.variables.find((v) => v.name === n);
  const [light, dark] = f.collections[1].modes.map((m) => m.modeId);
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
});

test('zweiter Lauf ändert nichts (idempotent)', async () => {
  const f = fakeFigma();
  await run(f.figma);
  const r = await run(f.figma);
  assert.equal(r.created.length, 0);
  assert.deepEqual(r.changed, []);
  assert.equal(r.unchanged, 121);
  assert.equal(f.variables.length, 121);
  assert.equal(f.collections.length, 2);
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
  assert.equal(f.variables.length, 122);
});

test('falscher Typ in Figma: Fehler melden, Rest weiter abgleichen', async () => {
  const f = fakeFigma();
  await run(f.figma);
  const v = f.variables.find((x) => x.name === 'duration/fast');
  v.resolvedType = 'FLOAT';
  const r = await run(f.figma);
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /^duration\/fast: Typ FLOAT/);
  assert.equal(r.unchanged, 120);
});
