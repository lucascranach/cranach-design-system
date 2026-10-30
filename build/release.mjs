/**
 * Release ausliefern (ADR 0006, 0013, 0016) – npm run release
 *
 * Ablauf, nachdem der Release-PR von release-please gemergt ist (Version und Tag stehen dann fest):
 *   1. Voraussetzungen prüfen: Branch main, keine offenen Änderungen, Tag vX.Y.Z auf HEAD
 *   2. bauen und prüfen: npm run build (Stylelint, Tokens, Icons, CSS, Figma-Sync, Kontraste),
 *      Tests der Stylelint-Regeln und des Figma-Syncs
 *   3. Paketinhalt prüfen: nur dist/, package.json, README.md, LICENSE (ADR 0016)
 *   4. Doku bauen: Storybook nach storybook-static/
 *   5. npm publish nach npmjs.com (übersprungen, wenn die Version dort schon liegt)
 *   6. dist/ per rsync nach <Ziel>/X.Y.Z/ (versioniert, wird nie überschrieben)
 *   7. Doku per rsync nach <Ziel>/docs/ (immer der neueste Stand)
 *
 * Standard ist ein PROBELAUF: Schritte 1–4 laufen echt, 5–7 nur mit --dry-run bzw. gar nicht.
 * Veröffentlicht wird erst mit
 *
 *   CDA_DEPLOY_TARGET=benutzer@host:/pfad/zu/design-system npm run release -- --publish
 *
 * und nach Eingabe der Versionsnummer zur Bestätigung. CDA_DEPLOY_TARGET ist das rsync-Ziel des
 * Ordners, unter dem /design-system/ auf lucascranach.org liegt (ohne Schrägstrich am Ende).
 *
 * Weitere Schalter: --skip-docs (Doku weder bauen noch hochladen).
 */
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';

const args = new Set(process.argv.slice(2));
const PUBLISH = args.has('--publish');
const SKIP_DOCS = args.has('--skip-docs');
const TARGET = (process.env.CDA_DEPLOY_TARGET ?? '').replace(/\/+$/, '');

/** Pakete dürfen nur diese Dateien enthalten (ADR 0016) */
const ALLOWED_FILES = [/^dist\//, /^package\.json$/, /^README\.md$/, /^LICENSE$/];

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const VERSION = pkg.version;
const problems = [];

const step = (text) => console.log(`\n▶ ${text}`);
const note = (text) => console.log(`  ${text}`);

/** Befehl ausführen; bricht bei Fehler ab, außer optional */
function run(cmd, cmdArgs, { capture = false, optional = false } = {}) {
  const res = spawnSync(cmd, cmdArgs, { stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit', encoding: 'utf8' });
  if (res.status !== 0 && !optional) {
    throw new Error(`Fehlgeschlagen: ${cmd} ${cmdArgs.join(' ')}${capture ? `\n${res.stderr}` : ''}`);
  }
  return res;
}
const out = (cmd, cmdArgs) => run(cmd, cmdArgs, { capture: true }).stdout.trim();

/** In der echten Veröffentlichung abbrechen, im Probelauf nur melden */
function check(ok, message) {
  if (ok) return;
  if (PUBLISH) throw new Error(message);
  problems.push(message);
  note(`⚠ ${message} (im Probelauf nur ein Hinweis)`);
}

async function main() {
  console.log(`${pkg.name} ${VERSION} – ${PUBLISH ? 'VERÖFFENTLICHEN' : 'Probelauf (nichts wird veröffentlicht)'}`);

  // ---------- 1. Voraussetzungen ----------
  step('Voraussetzungen');
  check(VERSION !== '0.0.0', 'Version 0.0.0 – erst den Release-PR von release-please mergen');
  check(out('git', ['rev-parse', '--abbrev-ref', 'HEAD']) === 'main', 'nicht auf dem Branch main');
  check(out('git', ['status', '--porcelain']) === '', 'offene Änderungen im Arbeitsverzeichnis');
  const tags = out('git', ['tag', '--points-at', 'HEAD']).split('\n');
  check(tags.includes(`v${VERSION}`), `Tag v${VERSION} fehlt auf HEAD – nach dem Merge „git pull --tags“`);
  check(Boolean(TARGET), 'CDA_DEPLOY_TARGET ist nicht gesetzt – Ziel auf dem Server unbekannt');
  if (TARGET && !/^[^:\s]+:\/\S+$/.test(TARGET)) throw new Error(`CDA_DEPLOY_TARGET „${TARGET}“: erwartet benutzer@host:/absoluter/pfad`);

  // ---------- 2. Bauen und prüfen ----------
  step('Bauen und prüfen');
  run('npm', ['run', 'build']);
  run('npm', ['run', 'test:lint']);
  run('npm', ['run', 'test:figma']);

  // ---------- 3. Paketinhalt ----------
  step('Paketinhalt');
  const [packed] = JSON.parse(out('npm', ['pack', '--dry-run', '--json']));
  const unexpected = packed.files.map((f) => f.path).filter((p) => !ALLOWED_FILES.some((re) => re.test(p)));
  if (unexpected.length) throw new Error(`Unerwartete Dateien im Paket: ${unexpected.join(', ')}`);
  note(`${packed.files.length} Dateien, ${Math.round(packed.size / 1024)} KB gepackt – nur dist/, package.json, README.md, LICENSE`);

  // ---------- 4. Doku ----------
  if (!SKIP_DOCS) {
    step('Doku bauen (Storybook)');
    run('npm', ['exec', '--', 'storybook', 'build', '--quiet', '-o', 'storybook-static']);
  }

  // ---------- Bestätigung ----------
  if (PUBLISH) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(
      `\n${pkg.name} ${VERSION} auf npmjs.com und nach ${TARGET} veröffentlichen?\nZur Bestätigung die Versionsnummer eingeben: `,
    );
    rl.close();
    if (answer.trim() !== VERSION) throw new Error('Abgebrochen, nichts veröffentlicht.');
  }

  // ---------- 5. npm ----------
  step('npm publish');
  const published = run('npm', ['view', `${pkg.name}@${VERSION}`, 'version'], { capture: true, optional: true });
  if (published.status === 0 && published.stdout.trim() === VERSION) {
    note(`${VERSION} liegt schon auf npmjs.com – übersprungen`);
  } else {
    // prepublishOnly baut noch einmal; das stellt sicher, dass dist/ zum Commit passt
    run('npm', ['publish', ...(PUBLISH ? [] : ['--dry-run'])]);
  }

  // ---------- 6./7. Server ----------
  step('Kopie auf dem Server');
  if (!TARGET) {
    note('CDA_DEPLOY_TARGET nicht gesetzt – übersprungen');
  } else {
    const [host, base] = [TARGET.slice(0, TARGET.indexOf(':')), TARGET.slice(TARGET.indexOf(':') + 1)];
    const exists = run('ssh', [host, 'test', '-e', `${base}/${VERSION}`], { capture: true, optional: true });
    if (exists.status === 0) throw new Error(`${base}/${VERSION} gibt es auf dem Server schon – versionierte Ordner werden nie überschrieben`);
    const dry = PUBLISH ? [] : ['--dry-run'];
    run('rsync', ['-a', '--itemize-changes', ...dry, 'dist/', `${TARGET}/${VERSION}/`]);
    if (!SKIP_DOCS) run('rsync', ['-a', '--delete', '--itemize-changes', ...dry, 'storybook-static/', `${TARGET}/docs/`]);
  }

  console.log(
    PUBLISH
      ? `\n✔ ${VERSION} veröffentlicht: npm i ${pkg.name}@${VERSION} und /design-system/${VERSION}/cranach.css`
      : `\n✔ Probelauf fertig${problems.length ? ` mit ${problems.length} Hinweis(en) – vor dem Veröffentlichen beheben` : ''}. Veröffentlichen: npm run release -- --publish`,
  );
}

main().catch((err) => {
  console.error(`\n✖ ${err.message}`);
  process.exit(1);
});
