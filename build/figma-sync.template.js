/*
 * Cranach Design System – Figma-Sync (ADR 0014)
 *
 * Generiert von build/build-figma.mjs aus dist/figma/tokens.figma.json – nicht von Hand bearbeiten.
 *
 * Legt in der geöffneten Figma-Datei die Variablen-Sammlungen „Cranach Primitives“ (Modus Value)
 * und „Cranach Semantic“ (Modi Light und Dark) an und gleicht alle Variablen mit den Tokens ab:
 * fehlende werden angelegt, geänderte Werte, Beschreibungen, Scopes und CSS-Namen aktualisiert.
 *
 * Idempotent: Ein zweiter Lauf ändert nichts. Variablen, die es in den Tokens nicht mehr gibt,
 * werden nur gemeldet, nicht gelöscht – Gestalter:innen könnten sie noch verwenden.
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

  return {
    summary: `${result.created.length} angelegt, ${result.changed.length} geändert, ${result.unchanged} unverändert, ${result.orphans.length} nicht mehr in den Tokens, ${result.errors.length} Fehler`,
    ...result,
  };
}

return await syncTokens();
