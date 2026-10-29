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
- [x] 6 · Storybook – Storybook 10.6.5 mit `@storybook/html-vite`, Vite 8.3.5, `addon-docs`, `addon-a11y` (axe, Verstöße als Fehler), `addon-themes` (hell/dunkel über `data-theme`, ohne Modus „System“), dazu `remark-gfm` 4.0.1 für Tabellen in MDX; alle exakt gepinnt, Telemetrie, Neuigkeiten-Hinweise und Einführungs-Checkliste aus. Deutsche Doku-Seiten in `stories/`: Einstieg, Einbinden, Grundlagen Farben (mit Kontrasttabelle aus `build/contrast.mjs`, dieselbe Liste wie `check:contrast`), Typografie (mit Grundstyles), Abstände (mit Radius, Rahmen, Schatten, Breakpoints, Bewegung), z-Ebenen, Icons. Die Werte kommen aus `dist/tokens.js` und `tokens/*.json`, nicht doppelt gepflegt. axe ohne Fehler in allen Stories, beide Themes. Node 24 (`.nvmrc`).
  - ⏸ **Haltepunkt:** Optik und Doku von Volker prüfen lassen – freigegeben am 29.10.2026.
- [x] Familienname „Cranach Sans“ für IBM Plex Sans (ADR 0017, am Haltepunkt nach Schritt 6 von Volker entschieden) – Token `font.family.sans`, `build-css.mjs` liest den Namen aus dem Token, Figma-Export behält „IBM Plex Sans“ über `$extensions`.
- [x] Link-Unterstreichung im hellen Theme yellow-700 statt yellow-500 (3,38:1 statt 1,75:1; ADR 0018, am Haltepunkt nach Schritt 6 von Volker entschieden) – Hover-Fläche bleibt yellow-500; `check:contrast` prüft die Unterstreichung jetzt mit mindestens 3:1.
- [x] 7 · Stylelint – `stylelint` 17.16.0 und `stylelint-config-standard` 40.0.0 (exakt gepinnt), `stylelint.config.mjs`. Verboten in `src/`: Regeln außerhalb von `@layer cda.*` (eigene Regel `cda/require-layer` in `build/stylelint-plugin-cda.mjs`), `!important`, `outline: none`/`0`, Klassen ohne `cda-`-Präfix (BEM-Schema), Custom Properties ohne `--cda-`, ID-Selektoren, Hex-Farben, Farbnamen, Farbfunktionen, px außerhalb von Media Queries, `z-index` ohne `--cda-z-*`. Ausnahme: `-webkit-text-size-adjust` (Safari). `.storybook/`: Präfix `docs-`, ohne Layer-Pflicht. `npm run lint:css` läuft als erster Schritt in `npm run build`; `npm run test:lint` prüft jede Regel mit Negativbeispielen. CI-Anbindung, sobald es eine CI gibt.
- [x] 8 · Komponente Button – `src/components/button.css`: `.cda-button` (graue Fläche, aus cranach-artefacts), `--primary` (Gelb mit dunkler Schrift, aus cranach-search mit behobenem Kontrast), `--ghost` (ohne Fläche), `--icon` (quadratisch, mit `aria-label`); auf `<button>` und `<a>`, deaktiviert über `disabled` bzw. `aria-disabled`. Einheitlich 42 px hoch, unsichtbarer Rahmen für den Kontrastmodus von Windows. Neues Token `color.background.strong` (hell #e0e0e0, dunkel #444444) für den Hover der grauen Fläche, in der Kontrastprüfung. Story mit Spielwiese, deutsche Doku-Seite. Weggelassen: Sprung beim Überfahren (search), drehendes Icon (artefacts).
- [x] 9 · Komponente Textfeld/Suchfeld – `src/components/text-field.css`: `.cda-input` (input, textarea; ohne Fläche, Linie unten wie in cranach-search und cranach-image-metadata, 42 px hoch wie der Button), `.cda-field` mit `__label`, `__hint`, `__error`; Zustände Hover, Fokus (Ring aus den Grundstyles statt `outline: none`), Fehler über `aria-invalid`, deaktiviert, nur lesbar (gestrichelt). `src/components/search.css`: `.cda-search` aus `cda-input` und `cda-button`, Löschen-Button als echter Button, nur sichtbar mit Inhalt (`:placeholder-shown`), browsereigenes Kreuz ausgeblendet. Stories und deutsche Doku-Seiten für beide.
- [x] 10 · Komponente Checkbox – `src/components/checkbox.css`: `.cda-checkbox` (Label umschließt Box und Text, mindestens 24 px hoch) mit `__input`, `__label`, `__count` (Trefferzahl in `text.muted` statt #b4b4b4), Gruppe `.cda-checkbox-group` mit `__legend` (fieldset). Gelb bleibt die Farbe für „ausgewählt“; geändert gegenüber cranach-search: Box 20 px statt rund 10 px, dunkler Rahmen und Häkchen (mindestens 3:1) statt gelbem Punkt, bleibt quadratisch; neu der Zwischenzustand (`indeterminate`) mit Strich. Story und deutsche Doku-Seite.
  - ⏸ **Haltepunkt:** die ersten drei Komponenten von Volker prüfen lassen – freigegeben am 29.10.2026, nach Korrektur der Checkbox (Sprung beim Anhaken). Freigegeben sind damit auch: Standard-Button grau, Gelb nur als `--primary`; deaktiviert mit Deckkraft 0,6; Textfeld ohne Kasten mit Linie unten; Leeren des Suchfelds per JavaScript im Projekt; Checkbox mit Häkchen in quadratischer Box statt gelbem Punkt; Token `color.background.strong`.

## Offen

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
| vor dem ersten Push | GitHub-Repo `lucascranach/cranach-design-system` anlegen, Remote setzen | erledigt 28.10.2026 – privat, `origin` per SSH gesetzt, noch nichts gepusht |
| vor Schritt 20 | leere Figma-Library-Datei im Team-Projekt anlegen, Link bereitstellen; Figma-MCP-Server in Claude Code verbinden | offen |
| vor Schritt 21 | Zielordner und SSH-Host für `/design-system/` auf lucascranach.org | offen |
| vor dem ersten Release | npm-Organisation `lucascranach` auf npmjs.com anlegen (falls belegt: `@lucas-cranach`, dann Paketname, README und ADR 0016 anpassen) | offen |

## Offene Punkte (nicht blockierend)

- **Vor dem ersten Release – Sichtbarkeit des GitHub-Repos:** Das Repo ist derzeit privat. npm erzeugt Provenance-Angaben beim Veröffentlichen nur aus öffentlichen Repos; Trusted Publishing selbst funktioniert auch privat.
- Ist ein SSH-Deploy aus GitHub Actions auf den Hochschul-Server zulässig? (erst für die automatische Release-Action relevant)
- **Automatische axe-Prüfung aller Stories in CI** (ADR 0013 „lokal und in CI“): mit `@storybook/addon-vitest` (Vitest, Playwright) nachrüsten, sobald es eine CI gibt. Bis dahin prüft axe jede Story in Storybook selbst.
- **Hosting der Doku** unter `lucascranach.org/design-system/docs/` (ADR 0013): `npm run build:storybook` erzeugt eine statische Seite mit relativen Pfaden; Upload gehört zu Schritt 21.
- Funktioniert IBM Plex mit `use_figma`? (Figma-Doku: „Custom Fonts“ noch nicht unterstützt) – in Schritt 20 testen.
