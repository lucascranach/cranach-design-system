# 0017 – Familienname „Cranach Sans“ für IBM Plex Sans

**Status:** angenommen (29.10.2026, Entscheidung am Haltepunkt nach Roadmap-Schritt 6) · ergänzt ADR 0009

## Kontext
`cranach.css` registrierte IBM Plex Sans unter dem Namen „IBM Plex Sans“ mit dem Standard-Gewichts-Mapping (ADR 0009). Die Sass-Projekte (search, artefacts, cda-orga, image-metadata) registrieren denselben Namen mit verschobenem Mapping: Datei „Light“ als 200, „Regular“ als 300 usw. Bei gleichem Familiennamen und passendem Gewicht gilt die später definierte `@font-face`-Regel. Welche Datei bei `font-weight: 400` geladen wird, hing damit von der Einbinde-Reihenfolge ab; README und Doku mussten verlangen, `cranach.css` vor den Projekt-Styles einzubinden. Während der Migration (ADR 0015) laufen alte und neue Styles aber lange parallel, und die Reihenfolge ist nicht überall steuerbar (z. B. in Bundlern).

## Entscheidung
- `cranach.css` registriert IBM Plex Sans unter dem eigenen Familiennamen **„Cranach Sans“**. Das Token lautet:
  `--cda-font-family-sans: 'Cranach Sans', system-ui, …`
- Die Schriftdateien bleiben unverändert (IBM Plex Sans aus `@fontsource-variable/ibm-plex-sans`). Nur der Name in der `@font-face`-Regel ist ein anderer; die Font wird nicht verändert oder umbenannt, die OFL 1.1 ist davon nicht berührt.
- `build/build-css.mjs` liest den Familiennamen aus dem Token, statt ihn fest einzutragen.
- **Figma** kennt nur den echten Namen. Das Token trägt ihn deshalb als DTCG-Erweiterung (`$extensions["org.lucascranach.design-system"].figmaFontFamily = "IBM Plex Sans"`), und `tokens.figma.json` gibt ihn statt der CSS-Fallback-Liste aus.
- **IBM Plex Mono** behält seinen Namen: Es gibt dort nur Gewicht 400 und kein verschobenes Mapping, eine Kollision mit Projekt-Regeln lädt dieselbe Schrift.

## Konsequenzen
- Alte Projekt-Regeln für „IBM Plex Sans“ und das Designsystem kommen sich nicht mehr in die Quere, gleich in welcher Reihenfolge eingebunden wird. Elemente mit Projekt-Styles behalten ihre alte Schrift, Elemente mit Designsystem-Styles bekommen „Cranach Sans“.
- Während der Migration kann ein Browser beide Varianten laden (alte Projekt-Dateien und die variable woff2). Sobald ein Projekt seine eigenen `@font-face`-Regeln entfernt, entfällt das.
- Projekte, die die Schrift selbst per Name setzen (`font-family: "IBM Plex Sans"`), stellen auf `var(--cda-font-family-sans)` um; das gehört zur Token-Zuordnung in der Migration.
- Die Regel „`cranach.css` vor den eigenen Styles einbinden“ ist für die Schrift nicht mehr nötig.
