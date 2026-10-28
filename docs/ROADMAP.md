# Roadmap

Arbeitsplan für das Cranach Design System. Jeder Schritt ist **ein Commit** (Conventional Commits). Den Status hier im selben Commit abhaken. An den **Haltepunkten** anhalten und Volker Schaefer prüfen lassen, bevor es weitergeht.

Die Bestandsprojekte (`../cranach-*`, `../cda-orga`) werden in dieser Phase **nicht verändert** (ADR 0015).

## Erledigt

- [x] 1 · Repo-Grundgerüst, README, ADRs 0001–0015
- [x] 2 · Design-Tokens im DTCG-Format (`tokens/`)
- [x] 3 · Token-Build mit Style Dictionary und Kontrastprüfung (`build/`)
- [x] Lizenz MIT
- [x] Umstellung der Auslieferung auf npmjs.com (ADR 0016 ersetzt ADR 0005)
- [x] Doku für die Weiterarbeit: `docs/bestandsaufnahme.md`, `docs/hintergrund.md`, `docs/archiv/`, `CLAUDE.md`, diese Roadmap

## Offen

- [ ] **4 · Grundstyles und Schriften** – IBM Plex Sans als variable woff2 (+ Italic), Subset Latin/Latin-Ext, IBM Plex Mono 400 im Paket (`dist/fonts/`). Layer `cda.reset` und `cda.base`: Reset, Typografie, Links (Muster ADR 0008), Fokus-Ring über `:focus-visible`, `prefers-reduced-motion`. Ergebnis: `dist/cranach.css` als zentrale Einbinde-Datei (importiert `tokens.css`), Export `./cranach.css` in `package.json`. *Hinweis:* Als Font-Quelle bietet sich `@fontsource-variable/ibm-plex-sans` bzw. `@fontsource/ibm-plex-mono` (OFL 1.1) an – vor der Wahl kurz mit Volker abstimmen.
- [ ] **5 · Icon-Font** – `icons/icons.json` mit den benötigten Icons (aus den Bestandsprojekten ermitteln: Ligatur-Namen in `.icon`-Elementen, Material-Icons-Nutzung, siehe `docs/bestandsaufnahme.md` Abschnitt 3), Build-Skript `build/build-icons.mjs` über `icon_names` (ADR 0012), Klassen `.cda-icon` und `.cda-icon--filled`. Der Build braucht Zugriff auf `fonts.googleapis.com`/`fonts.gstatic.com`.
- [ ] **6 · Storybook** – HTML-Renderer mit Vite, deutsche Doku-Seiten (Einstieg, Einbinden, Farben, Typografie, Abstände, z-Ebenen, Icons), Umschalter hell/dunkel über `data-theme`, Addon für Barrierefreiheit (axe).
  - ⏸ **Haltepunkt:** Optik und Doku von Volker prüfen lassen.
- [ ] **7 · Stylelint** – u. a. Verbot von `outline: none` und `!important`, Klassen nur mit Präfix `cda-`, keine Hex-Farben außerhalb von `tokens/`.
- [ ] **8 · Komponente Button**
- [ ] **9 · Komponente Textfeld/Suchfeld**
- [ ] **10 · Komponente Checkbox**
  - ⏸ **Haltepunkt:** die ersten drei Komponenten von Volker prüfen lassen.
- [ ] **11 · Komponente Toggle**
- [ ] **12 · Komponente Switcher** (Sprache/Ansicht)
- [ ] **13 · Komponente Accordion** (`details`/`summary`)
- [ ] **14 · Komponente Loader** (ersetzt `cloak`, Download-Spinner, `skeleton`)
- [ ] **15 · Komponente Werk-Karte**
- [ ] **16 · Komponente Header** mit Navigation und Sprachwahl
- [ ] **17 · Komponente Footer**
- [ ] **18 · Komponente Skip-Link**
- [ ] **19 · Utilities** – `.cda-u-z-*`, `.cda-u-visually-hidden` u. Ä. (ohne `!important`)
- [ ] **20 · Figma-Sync-Skript** – `dist/figma/figma-sync.js` aus `tokens.figma.json`, idempotent, mit Kurzanleitung (ADR 0014)
- [ ] **21 · Release-Werkzeuge** – `npm run release` (bauen, prüfen, `npm publish`, rsync nach `/design-system/x.y.z/`), GitHub Action für release-please, `CHANGELOG.md` (ADR 0006, 0016)
- [ ] **22 · Migrationsseite in Storybook** – Reihenfolge und Ablauf aus ADR 0015, je Projekt eine Tabelle „alter Wert → neues Token“ (Grundlage: `docs/bestandsaufnahme.md`), ohne die Projekte anzufassen

Jede Komponente (8–18): CSS in `src/components/<name>.css` im Layer `cda.components`, Story mit allen Varianten und Zuständen in beiden Themes, deutsche Doku mit Markup-Beispiel, axe ohne Fehler. Vorlagen aus den Bestandsprojekten stehen in `docs/bestandsaufnahme.md` Abschnitt 4.

## Aufgaben für Volker

| Wann | Aufgabe | Status |
|---|---|---|
| vor Schritt 5 (Font-Datei) | `npm run build:icons` auf einem Rechner mit Zugriff auf Google Fonts ausführen | offen |
| vor dem ersten Push | GitHub-Repo `lucascranach/cranach-design-system` anlegen, Remote setzen | offen |
| vor Schritt 20 | leere Figma-Library-Datei im Team-Projekt anlegen, Link bereitstellen; Figma-MCP-Server in Claude Code verbinden | offen |
| vor Schritt 21 | Zielordner und SSH-Host für `/design-system/` auf lucascranach.org | offen |
| vor dem ersten Release | npm-Organisation `lucascranach` auf npmjs.com anlegen (falls belegt: `@lucas-cranach`, dann Paketname, README und ADR 0016 anpassen) | offen |

## Offene Punkte (nicht blockierend)

- Ist ein SSH-Deploy aus GitHub Actions auf den Hochschul-Server zulässig? (erst für die automatische Release-Action relevant)
- Funktioniert IBM Plex mit `use_figma`? (Figma-Doku: „Custom Fonts“ noch nicht unterstützt) – in Schritt 20 testen.
