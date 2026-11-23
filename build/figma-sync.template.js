/*
 * Cranach Design System – Figma-Sync (ADR 0014)
 *
 * Generiert von build/build-figma.mjs aus dist/figma/tokens.figma.json – nicht von Hand bearbeiten.
 *
 * Legt in der geöffneten Figma-Datei die Variablen-Sammlungen „Cranach Primitives“ (Modus Value),
 * „Cranach Responsive“ (je Bildschirmbreite ein Modus) und „Cranach Semantic“ (Modi Light und Dark)
 * an und gleicht alle Variablen mit den Tokens ab: fehlende werden angelegt, geänderte Werte,
 * Beschreibungen, Scopes und CSS-Namen aktualisiert. Danach ebenso die Textstile (typography.*,
 * Größe, Stärke und Familie an die Variablen gebunden) und die Effektstile (Schatten, Farbe an die
 * Variable gebunden).
 *
 * Idempotent: Ein zweiter Lauf ändert nichts. Variablen und Stile, die es in den Tokens nicht mehr
 * gibt, werden nur gemeldet, nicht gelöscht – Gestalter:innen könnten sie noch verwenden.
 *
 * Ausführen über den Figma-MCP-Server (use_figma): Der Code läuft dort in einem asynchronen Rahmen,
 * deshalb das return am Ende. Das Ergebnis ist eine kurze Zusammenfassung (angelegt, geändert,
 * unverändert, Waisen, Fehler).
 */

const DATA = __TOKENS__;

/** '#rrggbb', '#rrggbbaa' oder 'rgba(r, g, b, a)' → Figma-Farbe mit Werten 0–1 */
function parseColor(value) {
  const hex = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(value);
  if (hex) {
    const n = (i) => parseInt(hex[1].slice(i, i + 2), 16) / 255;
    return { r: n(0), g: n(2), b: n(4), a: hex[2] ? parseInt(hex[2], 16) / 255 : 1 };
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(value);
  if (rgb) {
    return { r: rgb[1] / 255, g: rgb[2] / 255, b: rgb[3] / 255, a: rgb[4] === undefined ? 1 : Number(rgb[4]) };
  }
  throw new Error(`Farbe nicht lesbar: ${value}`);
}

const close = (a, b) => Math.abs(a - b) < 1 / 512;

/** Ist der gespeicherte Wert schon der gewünschte? Zahlen speichert Figma mit 32 Bit
    (0.6 kommt als 0.6000000238… zurück), deshalb Vergleich mit kleiner Toleranz. */
function sameValue(current, wanted) {
  if (current === undefined) return false;
  if (typeof wanted === 'number') return typeof current === 'number' && Math.abs(current - wanted) < 1e-6;
  if (wanted && wanted.type === 'VARIABLE_ALIAS') return current.type === 'VARIABLE_ALIAS' && current.id === wanted.id;
  if (wanted && typeof wanted === 'object') {
    return (
      typeof current === 'object' &&
      current.type !== 'VARIABLE_ALIAS' &&
      ['r', 'g', 'b', 'a'].every((k) => close(current[k] ?? 1, wanted[k] ?? 1))
    );
  }
  return current === wanted;
}

const sameList = (a = [], b = []) => a.length === b.length && a.every((x) => b.includes(x));

/** Schriftschnitt zur Stärke, so wie Figma ihn für IBM Plex nennt (ohne Leerzeichen) */
const WEIGHT_STYLE = { 100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };

/** Variable zu einem Verweis aus den Stil-Daten ({ variable, collection }) */
function variableFor(byName, ref) {
  const v = byName.get(`${ref.collection}/${ref.variable}`);
  if (!v) throw new Error(`Verweis auf unbekannte Variable ${ref.collection}/${ref.variable}`);
  return v;
}

/** Textstile: Schrift laden, Werte setzen, Größe, Stärke und Familie an die Variablen binden */
async function syncTextStyles(result, byName) {
  const existing = await figma.getLocalTextStylesAsync();
  for (const spec of DATA.textStyles) {
    const label = `Textstil ${spec.name}`;
    try {
      const fontName = { family: spec.fontFamily.value, style: WEIGHT_STYLE[spec.fontWeight.value] };
      if (!fontName.style) throw new Error(`keine Schriftschnitt-Zuordnung für Stärke ${spec.fontWeight.value}`);
      await figma.loadFontAsync(fontName);
      let style = existing.find((s) => s.name === spec.name);
      const isNew = !style;
      if (isNew) {
        style = figma.createTextStyle();
        style.name = spec.name;
      }
      const changes = [];
      if (style.fontName.family !== fontName.family || style.fontName.style !== fontName.style) {
        style.fontName = fontName;
        changes.push('Schrift');
      }
      if (!sameValue(style.fontSize, spec.fontSize.value)) {
        style.fontSize = spec.fontSize.value;
        changes.push('Größe');
      }
      if (style.lineHeight.unit !== 'PERCENT' || Math.abs(style.lineHeight.value - spec.lineHeight) > 1e-3) {
        style.lineHeight = { unit: 'PERCENT', value: spec.lineHeight };
        changes.push('Zeilenhöhe');
      }
      for (const field of ['fontFamily', 'fontSize', 'fontWeight']) {
        const variable = variableFor(byName, spec[field]);
        if ((style.boundVariables ?? {})[field]?.id !== variable.id) {
          style.setBoundVariable(field, variable);
          changes.push(`Variable ${field}`);
        }
      }
      if ((style.description ?? '') !== spec.description) {
        style.description = spec.description;
        changes.push('Beschreibung');
      }
      if (isNew) result.created.push(label);
      else if (changes.length) result.changed.push(`${label} (${changes.join(', ')})`);
      else result.unchanged += 1;
    } catch (err) {
      result.errors.push(`${label}: ${err.message}`);
    }
  }
  const names = new Set(DATA.textStyles.map((t) => t.name));
  for (const s of existing) if (!names.has(s.name)) result.orphans.push(`Textstil ${s.name}`);
}

/** Gleicher Schatten? Farbe mit Toleranz, Verweis auf dieselbe Variable */
const sameEffect = (a, b) =>
  a.type === b.type &&
  a.visible !== false &&
  (a.blendMode ?? 'NORMAL') === b.blendMode &&
  ['r', 'g', 'b', 'a'].every((k) => close(a.color[k], b.color[k])) &&
  sameValue(a.offset.x, b.offset.x) &&
  sameValue(a.offset.y, b.offset.y) &&
  sameValue(a.radius, b.radius) &&
  sameValue(a.spread ?? 0, b.spread) &&
  (a.boundVariables ?? {}).color?.id === b.boundVariables.color.id;

/** Effektstile: Schatten mit Farbe aus der Variable */
async function syncEffectStyles(result, byName) {
  const existing = await figma.getLocalEffectStylesAsync();
  for (const spec of DATA.effectStyles) {
    const label = `Effektstil ${spec.name}`;
    try {
      const wanted = spec.effects.map((fx) =>
        figma.variables.setBoundVariableForEffect(
          { type: fx.type, color: parseColor(fx.color.value), offset: fx.offset, radius: fx.radius, spread: fx.spread, visible: true, blendMode: 'NORMAL' },
          'color',
          variableFor(byName, fx.color),
        ),
      );
      let style = existing.find((s) => s.name === spec.name);
      const isNew = !style;
      if (isNew) {
        style = figma.createEffectStyle();
        style.name = spec.name;
      }
      const changes = [];
      if (style.effects.length !== wanted.length || !style.effects.every((e, i) => sameEffect(e, wanted[i]))) {
        style.effects = wanted;
        changes.push('Schatten');
      }
      if ((style.description ?? '') !== spec.description) {
        style.description = spec.description;
        changes.push('Beschreibung');
      }
      if (isNew) result.created.push(label);
      else if (changes.length) result.changed.push(`${label} (${changes.join(', ')})`);
      else result.unchanged += 1;
    } catch (err) {
      result.errors.push(`${label}: ${err.message}`);
    }
  }
  const names = new Set(DATA.effectStyles.map((e) => e.name));
  for (const s of existing) if (!names.has(s.name)) result.orphans.push(`Effektstil ${s.name}`);
}

async function syncTokens() {
  const result = { created: [], changed: [], unchanged: 0, orphans: [], errors: [] };
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const allVariables = await figma.variables.getLocalVariablesAsync();
  /** Alle Variablen dieser Datei nach „Sammlung/Name“, für Verweise zwischen den Sammlungen */
  const byName = new Map();

  for (const spec of DATA.collections) {
    // ---------- Sammlung und Modi ----------
    let collection = collections.find((c) => c.name === spec.name);
    if (!collection) {
      collection = figma.variables.createVariableCollection(spec.name);
      result.created.push(`Sammlung ${spec.name}`);
    }
    const modeIds = {};
    spec.modes.forEach((modeName, i) => {
      let mode = collection.modes.find((m) => m.name === modeName);
      if (!mode && i === 0 && collection.modes.length === 1 && !spec.modes.includes(collection.modes[0].name)) {
        // Neue Sammlung: den Standardmodus („Mode 1“) umbenennen statt einen weiteren anzulegen
        collection.renameMode(collection.modes[0].modeId, modeName);
        mode = collection.modes[0];
      }
      modeIds[modeName] = mode ? mode.modeId : collection.addMode(modeName);
    });

    const existing = allVariables.filter((v) => v.variableCollectionId === collection.id);
    for (const v of existing) byName.set(`${spec.name}/${v.name}`, v);

    // ---------- Variablen ----------
    for (const item of spec.variables) {
      try {
        let variable = existing.find((v) => v.name === item.name);
        let isNew = false;
        if (variable && variable.resolvedType !== item.type) {
          result.errors.push(`${item.name}: Typ ${variable.resolvedType} in Figma, ${item.type} in den Tokens – bitte von Hand klären`);
          continue;
        }
        if (!variable) {
          variable = figma.variables.createVariable(item.name, collection, item.type);
          isNew = true;
        }
        byName.set(`${spec.name}/${item.name}`, variable);

        const changes = [];
        for (const [modeName, raw] of Object.entries(item.values)) {
          let wanted;
          if (raw && typeof raw === 'object' && raw.alias) {
            const target = byName.get(`${raw.collection}/${raw.alias}`);
            if (!target) throw new Error(`Verweis auf unbekannte Variable ${raw.collection}/${raw.alias}`);
            wanted = figma.variables.createVariableAlias(target);
          } else {
            wanted = item.type === 'COLOR' ? parseColor(raw) : raw;
          }
          if (!sameValue(variable.valuesByMode[modeIds[modeName]], wanted)) {
            variable.setValueForMode(modeIds[modeName], wanted);
            changes.push(modeName);
          }
        }
        if ((variable.description ?? '') !== item.description) {
          variable.description = item.description;
          changes.push('Beschreibung');
        }
        if (!sameList(variable.scopes, item.scopes)) {
          variable.scopes = item.scopes;
          changes.push('Scopes');
        }
        if ((variable.codeSyntax ?? {}).WEB !== item.css) {
          variable.setVariableCodeSyntax('WEB', item.css);
          changes.push('CSS-Name');
        }

        if (isNew) result.created.push(item.name);
        else if (changes.length) result.changed.push(`${item.name} (${changes.join(', ')})`);
        else result.unchanged += 1;
      } catch (err) {
        result.errors.push(`${item.name}: ${err.message}`);
      }
    }

    const names = new Set(spec.variables.map((v) => v.name));
    for (const v of existing) if (!names.has(v.name)) result.orphans.push(`${spec.name}/${v.name}`);
  }

  // ---------- Stile (brauchen die Variablen von oben) ----------
  await syncTextStyles(result, byName);
  await syncEffectStyles(result, byName);

  return {
    summary: `${result.created.length} angelegt, ${result.changed.length} geändert, ${result.unchanged} unverändert, ${result.orphans.length} nicht mehr in den Tokens, ${result.errors.length} Fehler`,
    ...result,
  };
}

return await syncTokens();
