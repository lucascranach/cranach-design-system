/**
 * Erzeugt aus brand/favicon.svg die Rasterfassungen des Favicons (Roadmap-Schritt 31):
 *
 *   brand/apple-touch-icon.png  180 × 180 px, Startbildschirm unter iOS
 *   brand/favicon.ico           16 und 32 px, ältere Browser und Server, die /favicon.ico erwarten
 *
 * Gerendert wird mit dem Chromium von Playwright (schon für npm run test:storybook installiert).
 * Die Dateien liegen im Repo; nach einer Änderung an favicon.svg dieses Skript erneut ausführen:
 *   npm run brand:raster
 *
 * Die ICO-Datei enthält PNG-Bilder statt Bitmaps – das lesen alle Browser seit Jahren.
 */
import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';

const SVG = 'brand/favicon.svg';

/** Rendert das SVG in der Größe size × size als PNG */
async function render(page, svg, size) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!doctype html><style>html,body{margin:0}img{display:block;width:${size}px;height:${size}px}</style>` +
      `<img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">`,
  );
  await page.locator('img').evaluate((img) => img.decode());
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: size, height: size } });
}

/** ICO-Datei aus PNG-Bildern: Kopf (6 Byte), je Bild ein Verzeichniseintrag (16 Byte), dann die Bilder */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0); // reserviert
  head.writeUInt16LE(1, 2); // Typ: Icon
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, png }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, e); // Breite (0 = 256)
    head.writeUInt8(size >= 256 ? 0 : size, e + 1); // Höhe
    head.writeUInt8(0, e + 2); // Farbpalette: keine
    head.writeUInt8(0, e + 3); // reserviert
    head.writeUInt16LE(1, e + 4); // Farbebenen
    head.writeUInt16LE(32, e + 6); // Bit je Pixel
    head.writeUInt32LE(png.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([head, ...images.map((i) => i.png)]);
}

async function main() {
  const svg = await readFile(SVG, 'utf8');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    const touch = await render(page, svg, 180);
    await writeFile('brand/apple-touch-icon.png', touch);
    const images = [];
    for (const size of [16, 32]) images.push({ size, png: await render(page, svg, size) });
    await writeFile('brand/favicon.ico', ico(images));
    console.log(`Favicon gerastert: brand/apple-touch-icon.png (${touch.length} B), brand/favicon.ico (16 + 32 px).`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
