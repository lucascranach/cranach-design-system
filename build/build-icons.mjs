/**
 * Baut die Icon-Font „Cranach Symbols“: ein Subset von Material Symbols Sharp (ADR 0012).
 *
 *   icons/icons.json  →  dist/fonts/cranach-symbols.woff2 (+ Lizenztext)
 *
 * Ausschließlich über den Google-Fonts-Parameter icon_names (Namen alphabetisch sortiert,
 * display=block). Achsen: wght 400, FILL 0..1 (variabel), opsz 24, GRAD 0.
 *
 * Netz: Nur dieser Build spricht mit Google – fonts.googleapis.com (CSS) und fonts.gstatic.com
 * (Font-Datei). Besucher laden die Font später vom eigenen Server.
 *
 * Prüfungen, weil Google unbekannte Namen ohne Fehlermeldung weglässt:
 *  1. Namen gegen Googles Icon-Verzeichnis (fonts.google.com/metadata/icons). Alte Namen aus
 *     Material Icons (z. B. expand_more, people) gelten als gültig: Google löst sie im Subset als
 *     Alias auf (getestet 28.10.2026). Ist das Verzeichnis nicht erreichbar, gibt es nur eine
 *     Warnung – der Build braucht laut ADR 0012 nur die beiden Domains oben.
 *  2. Größe: Erkennt Google keinen einzigen Namen, liefert es die komplette Font (rund 440 KB)
 *     statt eines Subsets (wenige KB). Über MAX_BYTES bricht der Build ab.
 *
 * Cache: Das Ergebnis liegt je Icon-Liste in .cache/icons/. Solange die Liste gleich bleibt,
 * braucht der Build kein Netz. `--refresh` lädt neu (z. B. für eine neuere Font-Version).
 */
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const LIST = 'icons/icons.json';
const LICENSE = 'icons/LICENSE-Material-Symbols.txt';
const CACHE_DIR = path.join('.cache', 'icons');
const FONT_DIR = path.join('dist', 'fonts');
const OUT = path.join(FONT_DIR, 'cranach-symbols.woff2');
const FAMILY = 'Material Symbols Sharp';
const AXES = 'opsz,wght,FILL,GRAD@24,400,0..1,0';
const MAX_BYTES = 100 * 1024;
// Google liefert woff2 nur an Browser, die es können – daher ein aktueller Browser-User-Agent.
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const refresh = process.argv.includes('--refresh');

async function readNames() {
  const json = JSON.parse(await readFile(LIST, 'utf8'));
  const names = Object.keys(json.icons ?? {});
  const invalid = names.filter((n) => !/^[a-z0-9_]+$/.test(n));
  if (invalid.length) throw new Error(`${LIST}: ungültige Namen: ${invalid.join(', ')}`);
  if (!names.length) throw new Error(`${LIST}: keine Icons eingetragen.`);
  return [...new Set(names)].sort();
}

async function get(url, as = 'text') {
  let res;
  try {
    res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  } catch (err) {
    throw new Error(
      `${new URL(url).host} nicht erreichbar: ${err.cause?.code ?? err.message}.\n` +
        'Der Icon-Build braucht Zugriff auf fonts.googleapis.com und fonts.gstatic.com (ADR 0012).',
    );
  }
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return as === 'buffer' ? Buffer.from(await res.arrayBuffer()) : res.text();
}

/** Prüfung 1: Namen gegen Googles Verzeichnis; nicht erreichbar → nur Warnung. */
async function checkNames(names) {
  let text;
  try {
    text = await get('https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true');
  } catch (err) {
    console.warn(`Warnung: Icon-Namen nicht geprüft – ${err.message.split('\n')[0]}`);
    return;
  }
  const { icons } = JSON.parse(text.slice(text.indexOf('{')));
  const symbols = new Set(icons.filter((i) => !(i.unsupported_families ?? []).includes(FAMILY)).map((i) => i.name));
  const legacy = new Set(icons.map((i) => i.name));
  const unknown = names.filter((n) => !legacy.has(n));
  if (unknown.length) throw new Error(`Unbekannte Icon-Namen (Tippfehler?): ${unknown.join(', ')}`);
  const aliases = names.filter((n) => !symbols.has(n));
  if (aliases.length) console.log(`Hinweis: alte Material-Icons-Namen, als Alias enthalten: ${aliases.join(', ')}`);
}

async function download(names) {
  await checkNames(names);
  const url =
    `https://fonts.googleapis.com/css2?family=${FAMILY.replaceAll(' ', '+')}:${AXES}` +
    `&icon_names=${names.join(',')}&display=block`;
  const css = await get(url);
  const src = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]woff2['"]\)/)?.[1];
  if (!src) throw new Error('Keine woff2-Datei in der Antwort von Google gefunden.');
  const font = await get(src, 'buffer');
  // Prüfung 2
  if (font.length > MAX_BYTES) {
    throw new Error(
      `Google hat ${Math.round(font.length / 1024)} KB geliefert statt eines Subsets – vermutlich wurde kein Name erkannt.`,
    );
  }
  return font;
}

async function main() {
  const names = await readNames();
  const key = createHash('sha256').update(`${FAMILY}|${AXES}|${names.join(',')}`).digest('hex').slice(0, 16);
  const cached = path.join(CACHE_DIR, `${key}.woff2`);

  let source = 'Cache';
  if (refresh || !existsSync(cached)) {
    const font = await download(names);
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cached, font);
    source = 'Google Fonts';
  }

  await mkdir(FONT_DIR, { recursive: true });
  await copyFile(cached, OUT);
  await copyFile(LICENSE, path.join(FONT_DIR, 'LICENSE-Material-Symbols.txt'));
  const kb = ((await readFile(OUT)).length / 1024).toFixed(1);
  console.log(`Icons gebaut: ${names.length} Icons, ${OUT} (${kb} KB, aus ${source}).`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
