/**
 * Kopiert Logo und Favicon aus brand/ nach dist/brand/ und prüft sie (Roadmap-Schritt 31).
 *
 *   logo.svg              Logo mit fill="currentColor": inline in Textfarbe, als <img> schwarz
 *   favicon.svg           Favicon
 *   favicon.ico           16 und 32 px (aus favicon.svg, npm run brand:raster)
 *   apple-touch-icon.png  180 px (aus favicon.svg, npm run brand:raster)
 *   LICENSE.md            Hinweis: Logo und Favicon sind nicht MIT-lizenziert
 *
 * Bricht ab, wenn eine Datei fehlt, das Logo feste Farben enthält oder die Rasterbilder nicht
 * die erwartete Größe haben.
 */
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'brand';
const DEST = path.join('dist', 'brand');
const FILES = ['logo.svg', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'LICENSE.md'];

/** Breite und Höhe aus dem IHDR-Block einer PNG-Datei */
function pngSize(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('keine PNG-Datei');
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

/** Größen der Bilder in einer ICO-Datei */
function icoSizes(buf) {
  if (buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) throw new Error('keine ICO-Datei');
  return Array.from({ length: buf.readUInt16LE(4) }, (_, i) => buf.readUInt8(6 + 16 * i) || 256);
}

async function main() {
  const problems = [];
  const read = async (f) => {
    try {
      return await readFile(path.join(SRC, f));
    } catch {
      problems.push(`${SRC}/${f} fehlt`);
      return null;
    }
  };
  const [logo, , ico, touch] = await Promise.all(FILES.map(read));

  if (logo) {
    const svg = logo.toString('utf8');
    if (!svg.includes('fill="currentColor"')) problems.push('logo.svg: fill="currentColor" fehlt');
    if (/fill="(?!currentColor|none)[^"]*"|#[0-9a-f]{3,8}\b/i.test(svg)) problems.push('logo.svg: feste Farbe gefunden');
    if (/\s(width|height)="/.test(svg.slice(0, svg.indexOf('>')))) problems.push('logo.svg: width/height am <svg> – die Größe setzt das CSS');
  }
  if (ico) {
    const sizes = icoSizes(ico);
    if (sizes.join(',') !== '16,32') problems.push(`favicon.ico: Größen ${sizes.join(', ')} statt 16, 32 – npm run brand:raster`);
  }
  if (touch) {
    const [w, h] = pngSize(touch);
    if (w !== 180 || h !== 180) problems.push(`apple-touch-icon.png: ${w} × ${h} statt 180 × 180 – npm run brand:raster`);
  }
  if (problems.length) throw new Error(`brand/:\n  ${problems.join('\n  ')}`);

  await mkdir(DEST, { recursive: true });
  await Promise.all(FILES.map((f) => copyFile(path.join(SRC, f), path.join(DEST, f))));
  console.log(`Logo und Favicon: ${FILES.length} Dateien nach ${DEST}/.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
