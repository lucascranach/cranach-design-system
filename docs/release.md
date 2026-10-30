# Release – Kurzanleitung

Wie eine neue Version entsteht und ausgeliefert wird (ADR 0006, 0013, 0016). Releases gibt Volker Schaefer frei.

## Überblick

| Schritt | Wer | Ergebnis |
|---|---|---|
| Commits nach Conventional Commits auf `main` pushen | alle | – |
| Release-PR pflegen | GitHub Action **release-please** (`.github/workflows/release-please.yml`) | PR „chore(main): release X.Y.Z“ mit Version in `package.json` und Eintrag in `CHANGELOG.md` |
| Release-PR prüfen und mergen | Volker | Tag `vX.Y.Z` und GitHub-Release |
| Ausliefern: `npm run release -- --publish` | Volker, lokal | Paket auf npmjs.com, Kopie unter `lucascranach.org/design-system/X.Y.Z/`, Doku unter `/design-system/docs/` |

Die Version ergibt sich aus den Commits: `fix:` → Patch, `feat:` → Minor, `!` bzw. `BREAKING CHANGE:` → Major. Vor 1.0.0 macht release-please aus `feat:` ebenfalls ein Minor-Release (0.1.0 → 0.2.0).

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
8. **kopiert die Doku nach `<Ziel>/docs/`** – dort liegt immer der neueste Stand.

Mit `--skip-docs` entfallen Bau und Upload der Doku.

## Vor dem ersten Release

Offene Aufgaben für Volker (Roadmap):

- npm-Organisation `lucascranach` auf npmjs.com anlegen; das eigene npm-Konto mit Zwei-Faktor-Anmeldung als Besitzer.
- Zielordner und SSH-Zugang für `/design-system/` auf lucascranach.org klären → `CDA_DEPLOY_TARGET`.
- Das Repo nach GitHub pushen, damit die Action läuft; in den Repo-Einstellungen unter *Actions → General → Workflow permissions* „Allow GitHub Actions to create and approve pull requests“ einschalten, sonst kann release-please keinen PR anlegen.
- Festlegen, ob das erste Release 0.1.0 (Standard) oder gleich 1.0.0 sein soll. Für 1.0.0 vor dem ersten Release-PR in `release-please-config.json` bei `"."` den Eintrag `"release-as": "1.0.0"` setzen und nach dem Release wieder entfernen.

## Später

ADR 0006 sieht vor, das Ausliefern in eine GitHub Action zu verlagern: npm über „Trusted Publishing“ (ohne dauerhaften Token), die Server-Kopie per rsync – sobald geklärt ist, ob ein SSH-Deploy aus GitHub auf den Hochschul-Server zulässig ist. Bis dahin liefert `npm run release` lokal aus.
