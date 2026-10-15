# 0006 – Versionierung mit SemVer und release-please

**Status:** angenommen (Q24, Q24b, Q27)

## Kontext
Die Cranach-Repos nutzen bereits Conventional Commits (`feat(sync): …`, `fix(lido): …`). Projekte sollen Änderungen nie ungefragt erhalten.

## Entscheidung
- Semantic Versioning. Die Version ergibt sich aus den Commits:
  - `fix:` → Patch, `feat:` → Minor, `!` bzw. `BREAKING CHANGE:` → Major.
- **release-please** (GitHub Action) pflegt einen Release-PR mit Versionsnummer und Changelog. Erst der Merge erzeugt Tag, GitHub-Release und `CHANGELOG.md`.
- **Deprecation-Regel:** Umbenennen oder Entfernen eines Tokens bzw. einer Klasse ist ein Major-Release. Vorher bleibt der alte Name mindestens eine Minor-Version lang als Alias erhalten und ist in Doku und Changelog als „deprecated“ markiert.
- Eine bewusste Wertänderung eines Tokens ist ein Minor-Release mit Hinweis im Changelog.
- **Auslieferung eines Releases:** zunächst manuell per Skript (`dist/` bauen, auf Branch `release` committen und taggen, rsync nach `lucascranach.org/design-system/x.y.z/`), später automatisch per GitHub Action. Voraussetzung dafür ist die Klärung, ob ein SSH-Deploy von GitHub auf den Hochschul-Server zulässig ist.
- Releases gibt Volker Schaefer frei.
