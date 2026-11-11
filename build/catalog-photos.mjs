/**
 * Bildschirmfotos für den Katalog der Projektkomponenten (ADR 0020) – npm run catalog:photos
 *
 * Liest stories/projektkomponenten.json. Für jeden Eintrag mit „photo“ öffnet das Skript die Seite in
 * einem unsichtbaren Chrome, fotografiert das Element (doppelte Auflösung) und legt es als WebP unter
 * stories/assets/projektkomponenten/ ab. Das Datum in „shot“ wird aktualisiert.
 *
 *   npm run catalog:photos                 alle Einträge mit „photo“
 *   npm run catalog:photos -- Seitenblättern   nur Einträge, deren Name den Text enthält
 *
 * Angaben je Eintrag unter „photo“:
 *   url       Seite, auf der die Komponente zu sehen ist
 *   selector  CSS-Selektor des Elements
 *   all       true: Umriss aller Treffer statt nur des ersten
 *   before    JavaScript, das vor dem Foto läuft (z. B. ein Menü öffnen)
 *   width, height  Fenstergröße (Standard 1280 × 900), pad Rand in px (Standard 16), wait Wartezeit in ms
 *
 * Braucht lokal Google Chrome und cwebp (brew install webp). Nur für öffentliche Seiten; Fotos aus
 * internen Projekten werden von Hand ergänzt. Kein Teil von npm run build.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DATA = 'stories/projektkomponenten.json';
const OUT = 'stories/assets/projektkomponenten';
const MAX_WIDTH = 1200;

if (!existsSync(CHROME)) throw new Error(`Google Chrome nicht gefunden: ${CHROME}`);
if (spawnSync('cwebp', ['-version']).status !== 0) throw new Error('cwebp fehlt – brew install webp');

const filter = process.argv[2];
const catalog = JSON.parse(await readFile(DATA, 'utf8'));
const todo = catalog.components.filter((c) => c.photo && (!filter || c.name.includes(filter)));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tmp = await mkdtemp(path.join(tmpdir(), 'cda-photos-'));

/** Startet Chrome und liefert eine Funktion für Befehle über das DevTools-Protokoll */
async function openChrome() {
  const port = 9300 + Math.floor(Math.random() * 600);
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(tmp, 'profile')}`, '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch { await sleep(200); }
  }
  if (!target) throw new Error('Chrome antwortet nicht');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const exited = new Promise((r) => proc.on('exit', r));
  return { send, close: async () => { ws.close(); proc.kill(); await exited; } };
}

const { send, close } = await openChrome();
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.result?.value;
const failed = [];

try {
  for (const c of todo) {
    const p = { width: 1280, height: 900, pad: 16, wait: 7000, ...c.photo };
    await send('Emulation.setDeviceMetricsOverride', { width: p.width, height: p.height, deviceScaleFactor: 2, mobile: p.width < 768 });
    await send('Page.enable');
    await send('Page.navigate', { url: p.url });
    await sleep(p.wait);
    if (p.before) { await evaluate(`(async () => { ${p.before} })()`); await sleep(1500); }
    const rect = await evaluate(`(async () => {
      const all = [...document.querySelectorAll(${JSON.stringify(p.selector)})].filter(e => e.getBoundingClientRect().height > 0);
      const els = ${p.all ? 'all' : 'all.slice(0, 1)'};
      if (!els.length) return null;
      els[0].scrollIntoView({ block: 'center' });
      await new Promise(r => setTimeout(r, 1000));
      const rs = els.map(e => e.getBoundingClientRect());
      const x = Math.min(...rs.map(r => r.left)), y = Math.min(...rs.map(r => r.top));
      return { x, y, w: Math.max(...rs.map(r => r.right)) - x, h: Math.max(...rs.map(r => r.bottom)) - y };
    })()`);
    if (!rect) { failed.push(`${c.name}: „${p.selector}“ nicht gefunden auf ${p.url}`); continue; }
    const clip = { x: Math.max(0, rect.x - p.pad), y: Math.max(0, rect.y - p.pad), width: rect.w + 2 * p.pad, height: rect.h + 2 * p.pad, scale: 1 };
    const shot = await send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: true });
    const png = path.join(tmp, 'shot.png');
    await writeFile(png, Buffer.from(shot.result.data, 'base64'));
    const resize = clip.width * 2 > MAX_WIDTH ? ['-resize', String(MAX_WIDTH), '0'] : [];
    const res = spawnSync('cwebp', ['-quiet', '-q', '80', ...resize, png, '-o', path.join(OUT, c.image)]);
    if (res.status !== 0) { failed.push(`${c.name}: cwebp fehlgeschlagen`); continue; }
    c.shot = new Date().toISOString().slice(0, 10);
    console.log(`✔ ${c.name} → ${c.image}`);
  }
} finally {
  await close();
  await writeFile(DATA, `${JSON.stringify(catalog, null, 2)}\n`);
  await rm(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
if (failed.length) {
  console.error(`\n✖ ${failed.length} ohne Foto:\n  ${failed.join('\n  ')}`);
  process.exitCode = 1;
}
