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
npm run build            # Tokens bauen + Kontraste prüfen
npm run build:tokens     # nur dist/ aus tokens/ erzeugen
npm run check:contrast   # WCAG-Prüfung beider Themes
npm pack --dry-run       # Paketinhalt kontrollieren
```

## Aufbau

| Pfad | Inhalt |
|---|---|
| `tokens/primitive/` | Paletten und Skalen (DTCG-JSON) |
| `tokens/semantic/{light,dark}.json` | Bedeutungen je Theme |
| `build/` | Build-Skripte (Style Dictionary, Kontrastprüfung, später Icons/Figma/Release) |
| `src/` | CSS für Grundstyles und Komponenten (ab Schritt 4) |
| `icons/` | Liste der Material-Symbols-Icons (ab Schritt 5) |
| `docs/` | ADRs, Roadmap, Bestandsaufnahme, Hintergrund, Archiv |
| `dist/` | Build-Ergebnis (nicht eingecheckt) |

## Stand der Infrastruktur

- Das Repo existiert bisher nur lokal (kein Remote). GitHub-Repo, npm-Organisation, Server-Pfad und Figma-Datei stehen als Aufgaben für Volker in der Roadmap.
