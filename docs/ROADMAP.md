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
- [x] 4 · Grundstyles und Schriften – Schriftquelle Fontsource (`@fontsource-variable/ibm-plex-sans`, `@fontsource/ibm-plex-mono`, je 5.3.0, OFL 1.1), von Volker am 28.10.2026 freigegeben. `build/build-css.mjs` kopiert nur Latin/Latin-Ext nach `dist/fonts/` und schreibt eigene `@font-face`-Regeln; `src/reset.css` (`cda.reset`), `src/base.css` (`cda.base`: Fließtext, Überschriften, Links nach ADR 0008, Fokus-Ring); `prefers-reduced-motion` setzt in `tokens.css` die Dauer-Tokens auf 0,01 ms; `dist/cranach.css` mit Export `./cranach.css`.
- [x] 5 · Icon-Font – 54 Icons in `icons/icons.json` (53 aus dem Bestand, `left_panel_open` als Ersatz für lucide in timeline), mit nutzenden Projekten. `build/build-icons.mjs` lädt das Subset über `icon_names` (Namensprüfung gegen Googles Icon-Verzeichnis, Größen-Sicherheitsnetz, Cache in `.cache/icons/`); `src/components/icon.css` mit `.cda-icon` und `.cda-icon--filled`; `@font-face` mit `font-display: block` in `cranach.css`; Lizenztext Apache 2.0 in `dist/fonts/`.

## Offen

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
| vor Schritt 5 (Font-Datei) | `npm run build:icons` auf einem Rechner mit Zugriff auf Google Fonts ausführen | entfällt – Google Fonts war in der Entwicklungsumgebung erreichbar |
| vor dem ersten Push | GitHub-Repo `lucascranach/cranach-design-system` anlegen, Remote setzen | offen |
| vor Schritt 20 | leere Figma-Library-Datei im Team-Projekt anlegen, Link bereitstellen; Figma-MCP-Server in Claude Code verbinden | offen |
| vor Schritt 21 | Zielordner und SSH-Host für `/design-system/` auf lucascranach.org | offen |
| vor dem ersten Release | npm-Organisation `lucascranach` auf npmjs.com anlegen (falls belegt: `@lucas-cranach`, dann Paketname, README und ADR 0016 anpassen) | offen |

## Offene Punkte (nicht blockierend)

- **Am Haltepunkt nach Schritt 6 entscheiden – Familienname der Schrift:** `cranach.css` registriert IBM Plex als „IBM Plex Sans“. Bestandsprojekte registrieren denselben Namen mit verschobenem Gewichts-Mapping (Datei „Light“ als 200 usw.); bei gleichem Namen und Gewicht gewinnt die später definierte `@font-face`-Regel. Derzeit gilt: `cranach.css` vor den Projekt-Styles einbinden (README). Alternative: eigener Name wie „Cranach Sans“ (Token-Änderung).
- **Am Haltepunkt nach Schritt 6 entscheiden – gelbe Link-Unterstreichung:** Muster nach ADR 0008 freigegeben, die Unterstreichung #FEB701 hat auf Weiß aber nur 1,75:1. Manche Prüfer verlangen für die Kennzeichnung von Links 3:1 (WCAG 1.4.11).
- Ist ein SSH-Deploy aus GitHub Actions auf den Hochschul-Server zulässig? (erst für die automatische Release-Action relevant)
- Funktioniert IBM Plex mit `use_figma`? (Figma-Doku: „Custom Fonts“ noch nicht unterstützt) – in Schritt 20 testen.
