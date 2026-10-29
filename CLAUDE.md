# CLAUDE.md – Cranach Design System

Gemeinsame Design-Tokens, Grundstyles und Komponenten für die Frontends des Cranach Digital Archive (lucascranach.org). Ansprechpartner und Freigabe: Volker Schaefer.

## Zuerst lesen

1. [`docs/ROADMAP.md`](docs/ROADMAP.md) – aktueller Stand, nächster Schritt, Haltepunkte, offene Aufgaben
2. [`docs/adr/README.md`](docs/adr/README.md) – alle Entscheidungen (**maßgeblich**)
3. [`docs/bestandsaufnahme.md`](docs/bestandsaufnahme.md) – Analyse der Bestandsprojekte mit Werten und Pfaden
4. [`docs/hintergrund.md`](docs/hintergrund.md) – Begründungen und Recherchen zu den ADRs

`docs/archiv/` ist eine eingefrorene Kopie aus der Konzeptphase – nicht ändern, nicht als Quelle für aktuelle Entscheidungen nutzen.

## Feste Regeln

- **Nur in diesem Repo schreiben.** Die Nachbarordner (`../cranach-*`, `../cda-orga`, …) dürfen gelesen, aber nicht verändert werden (ADR 0015).
- **ADRs sind verbindlich.** Weicht etwas davon ab oder fehlt eine Entscheidung, Volker fragen. Geänderte Entscheidungen bekommen eine neue ADR; die alte wird auf „ersetzt durch …“ gesetzt, nicht gelöscht.
- **Schrittweise arbeiten:** ein Roadmap-Schritt = ein Commit; den Schritt in `docs/ROADMAP.md` im selben Commit abhaken. An den Haltepunkten anhalten und auf Freigabe warten.
- **Nichts veröffentlichen ohne Auftrag:** kein `git push`, kein `npm publish`, kein rsync auf den Server, keine Änderungen in Figma ohne ausdrückliche Bitte.
- **Sprache:** Token-Namen, Klassen und Code Englisch; Doku, Kommentare in Doku-Dateien und Commit-Beschreibungen Deutsch; Commit-Typen nach Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:` …). `!`/`BREAKING CHANGE` nur für echte Brüche in veröffentlichten Versionen.

## Technische Leitplanken

- **CSS-first** (ADR 0002): Tokens als `--cda-*`, Komponenten als `.cda-*`-Klassen mit dokumentiertem HTML. Kein SCSS. Natives CSS Nesting ist erlaubt (Baseline „widely available“, ADR 0010).
- **Layers** (ADR 0003): alles in `@layer cda.tokens, cda.reset, cda.base, cda.components, cda.utilities`. **Kein `!important`, kein `outline: none`**, Fokus über `:focus-visible`.
- **Werte nur über Tokens:** keine Hex-Farben, px-Abstände o. Ä. in `src/`; neue Werte zuerst in `tokens/*.json` anlegen. `dist/` wird generiert und nie von Hand bearbeitet (und nicht eingecheckt).
- **Themes** (ADR 0007): helles Theme Standard; dunkel über `data-theme="dark"`, `.dark` oder `prefers-color-scheme`. Komponenten nutzen nur semantische Tokens (`--cda-color-text-default` usw.), damit beide Themes automatisch funktionieren.
- **Barrierefreiheit:** `npm run check:contrast` muss bestehen; Gelb nur als Fläche mit dunkler Schrift (ADR 0008); Stories ohne axe-Fehler.
- **z-Ebenen** nur über `--cda-z-*` (ADR 0011).
- **Icons** (ADR 0012): Material Symbols Sharp als Icon-Font, Subset ausschließlich über `icon_names`. Ist Google Fonts im aktuellen Netz nicht erreichbar, das Build-Skript trotzdem schreiben und Volker bitten, `npm run build:icons` lokal auszuführen.
- **Auslieferung** (ADR 0016): Paket `@lucascranach/design-system` auf npmjs.com (Build-Projekte), Kopie unter `lucascranach.org/design-system/x.y.z/` (Projekte ohne Build). Zur Laufzeit nur eigener Server, keine externen CDNs.

## Befehle

```sh
npm install
npm run build            # CSS prüfen (Stylelint), Tokens, Icons, CSS und Figma-Sync bauen, Kontraste prüfen
npm run lint:css         # Stylelint über src/ und .storybook/
npm run test:lint        # Tests der Stylelint-Regeln
npm run build:tokens     # Token-Dateien in dist/ aus tokens/ erzeugen
npm run build:icons      # Icon-Subset von Google Fonts nach dist/fonts/ (Cache: .cache/icons/)
npm run build:css        # dist/cranach.css aus src/ + Schriften nach dist/fonts/
npm run build:figma      # dist/figma/figma-sync.js für use_figma (Anleitung: docs/figma-sync.md)
npm run test:figma       # Tests des Figma-Sync-Skripts
npm run check:contrast   # WCAG-Prüfung beider Themes
npm run storybook        # bauen und Doku unter http://localhost:6006 starten
npm run build:storybook  # Doku statisch nach storybook-static/
npm pack --dry-run       # Paketinhalt kontrollieren
```

## Aufbau

| Pfad | Inhalt |
|---|---|
| `tokens/primitive/` | Paletten und Skalen (DTCG-JSON) |
| `tokens/semantic/{light,dark}.json` | Bedeutungen je Theme |
| `build/` | Build-Skripte (Style Dictionary, Icons, CSS und Schriften, Kontrastprüfung mit Paarungen in `contrast.mjs`, Stylelint-Plugin und -Tests, Figma-Sync mit Vorlage und Tests, später Release) |
| `stylelint.config.mjs` | CSS-Regeln: Layer, Präfix, Werte nur über Tokens, kein `!important`/`outline: none` |
| `src/` | CSS für Reset und Grundstyles (`reset.css`, `base.css`), Komponenten in `src/components/`, Hilfsklassen `cda-u-*` in `utilities.css`; Reihenfolge in `build/build-css.mjs` |
| `icons/` | `icons.json` (Icon-Namen mit nutzenden Projekten), Lizenztext Material Symbols |
| `stories/` | Storybook-Doku: MDX-Seiten (Deutsch) und Stories; Grundlagen in `stories/grundlagen/`, Komponenten in `stories/komponenten/`, Utilities in `stories/utilities.*` |
| `.storybook/` | Storybook-Konfiguration; `preview.css` mit Hilfsklassen `docs-*` nur für die Doku |
| `docs/` | ADRs, Roadmap, Bestandsaufnahme, Hintergrund, Archiv |
| `dist/` | Build-Ergebnis (nicht eingecheckt) |

## Stand der Infrastruktur

- GitHub-Repo `lucascranach/cranach-design-system` (privat) ist als `origin` gesetzt; gepusht wird nur auf ausdrückliche Bitte. npm-Organisation und Server-Pfad stehen als Aufgaben für Volker in der Roadmap.
- Figma: Library-Datei [Cranach Design System](https://www.figma.com/design/GV3vvoVc8GebPQ79YwA1yz/Cranach-Design-System), Figma-MCP-Server in Claude Code eingerichtet. Variablen per Sync nach `docs/figma-sync.md`; die Library wird erst nach gemeinsamer Prüfung veröffentlicht (ADR 0014).
- Node-Version: 24 (`.nvmrc`), vor der Arbeit `nvm use`.
