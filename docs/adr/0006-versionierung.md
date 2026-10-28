# 0006 – Versionierung mit SemVer und release-please

**Status:** angenommen (Q24, Q24b, Q27) · Auslieferung am 28.10.2026 an ADR 0016 angepasst

## Kontext
Die Cranach-Repos nutzen bereits Conventional Commits (`feat(sync): …`, `fix(lido): …`). Projekte sollen Änderungen nie ungefragt erhalten.

## Entscheidung
- Semantic Versioning. Die Version ergibt sich aus den Commits:
  - `fix:` → Patch, `feat:` → Minor, `!` bzw. `BREAKING CHANGE:` → Major.
- **release-please** (GitHub Action) pflegt einen Release-PR mit Versionsnummer und Changelog. Erst der Merge erzeugt Tag, GitHub-Release und `CHANGELOG.md` – im Standard-Ablauf von release-please, Tags liegen auf `main`.
- **Deprecation-Regel:** Umbenennen oder Entfernen eines Tokens bzw. einer Klasse ist ein Major-Release. Vorher bleibt der alte Name mindestens eine Minor-Version lang als Alias erhalten und ist in Doku und Changelog als „deprecated“ markiert.
- Eine bewusste Wertänderung eines Tokens ist ein Minor-Release mit Hinweis im Changelog.
- **Auslieferung eines Releases** (ADR 0016), nach dem Merge des Release-PR:
  1. `dist/` bauen und Kontraste prüfen (läuft automatisch vor `npm publish` über `prepublishOnly`),
  2. `npm publish` nach npmjs.com,
  3. `dist/` per rsync nach `lucascranach.org/design-system/x.y.z/` kopieren.
- Zunächst manuell (`npm run release`), später automatisch per GitHub Action. Für das Veröffentlichen aus der Action ist npm „Trusted Publishing“ (OIDC, ohne dauerhaften Token) vorgesehen; für den rsync-Schritt muss geklärt werden, ob ein SSH-Deploy von GitHub auf den Hochschul-Server zulässig ist.
- Releases gibt Volker Schaefer frei.
