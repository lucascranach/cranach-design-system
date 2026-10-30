# Release – Kurzanleitung

Wie eine neue Version entsteht und ausgeliefert wird (ADR 0006, 0013, 0016). Releases gibt Volker Schaefer frei.

## Überblick

| Schritt | Wer | Ergebnis |
|---|---|---|
| Änderung auf einem Branch, Pull Request nach `main`, Squash-Merge (siehe [Arbeitsweise](#arbeitsweise-mit-branches)) | alle | ein Commit je Pull Request auf `main`, PR-Titel als Commit-Nachricht |
| Release-PR pflegen | GitHub Action **release-please** (`.github/workflows/release-please.yml`) | PR „chore(main): release X.Y.Z“ mit Version in `package.json` und Eintrag in `CHANGELOG.md` |
| Release-PR prüfen und mergen | Volker | Tag `vX.Y.Z` und GitHub-Release |
| Ausliefern: `npm run release -- --publish` | Volker, lokal | Paket auf npmjs.com, Kopie unter `lucascranach.org/design-system/X.Y.Z/`, Doku unter `/design-system/docs/` (neuester Stand) und `/design-system/X.Y/docs/` (je Minor-Version) |

Die Version ergibt sich aus den Commits: `fix:` → Patch, `feat:` → Minor, `!` bzw. `BREAKING CHANGE:` → Major.

**Start mit 0.1.0** (Entscheidung Volker, 30.10.2026). Solange die Version unter 1.0.0 liegt, gilt das Designsystem als im Aufbau: `fix:` → 0.1.1, `feat:` → 0.2.0, und auch ein grundlegender Umbau (`feat!:`) ergibt nur 0.2.0 statt 1.0.0 (`bump-minor-pre-major` in `release-please-config.json`). Projekte mit `^0.1.0` bekommen dabei automatisch nur Fehlerbehebungen; einen Sprung auf 0.2.0 tragen sie bewusst ein. Auf 1.0.0 geht es, wenn das erste Projekt das Designsystem in Produktion nutzt und der Header überarbeitet ist – dann einmalig `"release-as": "1.0.0"` setzen und nach dem Release wieder entfernen. Ab 1.0.0 gilt die Deprecation-Regel aus ADR 0006.

## Arbeitsweise mit Branches

Änderungen kommen nicht direkt auf `main`, sondern über einen Pull Request:

1. Branch anlegen, benannt nach Art und Inhalt: `feat/tabelle`, `fix/header-abstand`, `docs/release`.
2. Dort arbeiten und committen; Zwischenstände wie „wip“ sind erlaubt.
3. Branch pushen und einen Pull Request nach `main` öffnen. **Der Titel folgt Conventional Commits**, z. B. „feat: Komponente Tabelle“ oder „fix(header): Abstand im Menü“. Die Action **PR-Titel** (`.github/workflows/pr-title.yml`) prüft das und blockiert sonst den Merge.
4. Prüfen und per **Squash-Merge** übernehmen: Alle Commits des Branches werden zu einem, und der PR-Titel wird zur Commit-Nachricht auf `main`. Daraus erzeugt release-please Version und Changelog – eine Zeile je Pull Request.

Ein Roadmap-Schritt entspricht einem Pull Request.

**Einstellungen auf GitHub** (einmalig, Volker):

- *Settings → General → Pull Requests:* nur „Allow squash merging“ erlauben, die anderen beiden Arten abschalten; „Default commit message“ auf „Pull request title“ (bzw. „Pull request title and description“).
- *Settings → Rules → Rulesets:* Regel für `main` – Änderungen nur über Pull Request, „Require status checks to pass“ mit der Prüfung „PR-Titel prüfen“.
- *Settings → Actions → General → Workflow permissions:* „Allow GitHub Actions to create and approve pull requests“ einschalten, sonst kann release-please keinen PR anlegen.

## Ausliefern

```sh
git switch main
git pull --tags
npm ci
npm run release                       # Probelauf: baut, prüft, zeigt, was passieren würde
CDA_DEPLOY_TARGET=benutzer@host:/pfad/zu/design-system npm run release -- --publish
```

`CDA_DEPLOY_TARGET` ist das rsync-Ziel des Ordners, der auf lucascranach.org unter `/design-system/` erreichbar ist – ohne Schrägstrich am Ende. Er steht nicht im Repo; am einfachsten in der eigenen Shell-Konfiguration setzen.

Das Skript `build/release.mjs`:

1. **prüft die Voraussetzungen:** Branch `main`, keine offenen Änderungen, Tag `vX.Y.Z` auf dem aktuellen Commit, Version nicht 0.0.0, Ziel gesetzt. Im Probelauf sind das nur Hinweise, beim Veröffentlichen bricht es ab.
2. **baut und prüft:** `npm run build` (Stylelint, Tokens, Icons, CSS, Figma-Sync, Kontraste), dazu die Tests der Stylelint-Regeln und des Figma-Syncs.
3. **prüft den Paketinhalt:** nur `dist/`, `package.json`, `README.md`, `LICENSE` (ADR 0016).
4. **baut die Doku** (Storybook) nach `storybook-static/`.
5. **fragt nach** – zur Bestätigung die Versionsnummer eintippen.
6. **`npm publish`** nach npmjs.com. Liegt die Version dort schon, wird der Schritt übersprungen; so lässt sich ein abgebrochener Lauf einfach wiederholen. npm fragt nach dem Einmalcode der Zwei-Faktor-Anmeldung.
7. **kopiert `dist/` nach `<Ziel>/X.Y.Z/`.** Versionierte Ordner werden nie überschrieben: Gibt es den Ordner schon, bricht das Skript ab.
8. **kopiert die Doku zweimal:** nach `<Ziel>/docs/` – dort liegt immer der neueste Stand – und nach `<Ziel>/X.Y/docs/`, eine Fassung je Minor-Version. Fehlerbehebungen (X.Y.1, X.Y.2 …) aktualisieren die Fassung ihrer Minor-Version; ältere Minor-Versionen bleiben unverändert stehen. Jede Seite der versionierten Fassung trägt `<meta name="robots" content="noindex">`, damit Suchmaschinen nur den neuesten Stand zeigen. Rund 10 MB je Minor-Version.

Mit `--skip-docs` entfallen Bau und Upload der Doku.

## Vor dem ersten Release

Offene Aufgaben für Volker (Roadmap):

- npm-Organisation `lucascranach` auf npmjs.com anlegen; das eigene npm-Konto mit Zwei-Faktor-Anmeldung als Besitzer.
- Zielordner und SSH-Zugang für `/design-system/` auf lucascranach.org klären → `CDA_DEPLOY_TARGET`.
- Das Repo nach GitHub pushen, damit die Actions laufen, und die [Einstellungen auf GitHub](#arbeitsweise-mit-branches) vornehmen.

## Später

ADR 0006 sieht vor, das Ausliefern in eine GitHub Action zu verlagern: npm über „Trusted Publishing“ (ohne dauerhaften Token), die Server-Kopie per rsync – sobald geklärt ist, ob ein SSH-Deploy aus GitHub auf den Hochschul-Server zulässig ist. Bis dahin liefert `npm run release` lokal aus.
