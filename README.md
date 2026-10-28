# Cranach Design System

Gemeinsame Design-Tokens, Grundstyles und Komponenten für die Frontends des [Cranach Digital Archive](https://lucascranach.org).

> **Status:** im Aufbau, noch kein Release. Die Bestandsprojekte werden noch nicht umgestellt; die geplante Reihenfolge steht in [ADR 0015](docs/adr/0015-projektrollen-und-migration.md).

## Grundprinzipien

- **CSS-first:** Tokens als CSS Custom Properties (`--cda-…`), Komponenten als CSS-Klassen (`.cda-…`). Funktioniert in jedem Stack – React, Eleventy, Jekyll, Kirby/PHP, reines HTML.
- **Konfliktfrei einbinden:** Alles liegt in Cascade Layers (`@layer cda.*`). Bestehende Projekt-Styles behalten Vorrang, das Einbinden ändert zunächst nichts am Aussehen.
- **Eine Quelle:** Tokens als DTCG-JSON in `tokens/`, Style Dictionary erzeugt daraus CSS, JS/TS, Tailwind-Theme und Figma-Variablen.
- **Nur eigener Server zur Laufzeit:** Projekte mit Build installieren über npmjs.com und bündeln die Dateien; Projekte ohne Build laden die versionierte Kopie von lucascranach.org. Besucher laden nie von Dritten.
- **Hell und dunkel** von Anfang an.

Alle Entscheidungen mit Begründung: [docs/adr](docs/adr/README.md).

## Einbinden (ab dem ersten Release)

**Projekte mit Build** (Vite, Eleventy …):

```sh
npm i @lucascranach/design-system
```

```css
@import "@lucascranach/design-system/cranach.css";
```

**Projekte ohne Build** (PHP, Jekyll, reines HTML):

```html
<link rel="stylesheet" href="/design-system/1.0.0/cranach.css">
```

**Tailwind-4-Projekte** zusätzlich:

```css
@layer theme, base, cda, components, utilities;
@import "tailwindcss";
@import "@lucascranach/design-system/tailwind.css";
```

## Aufbau des Repos

| Ordner | Inhalt |
|---|---|
| `tokens/` | Design-Tokens im DTCG-Format (Primitive und Semantik) |
| `build/` | Build-Skripte (Style Dictionary, Icons, Figma-Sync) |
| `src/` | CSS für Grundstyles und Komponenten |
| `icons/` | Liste der benötigten Material-Symbols-Icons |
| `docs/` | ADRs und weitere Dokumentation |
| `dist/` | Build-Ergebnis (nicht auf `main` eingecheckt) |

## Entwicklung

```sh
npm install
npm run build          # Tokens bauen und Kontraste prüfen
```

| Befehl | Wirkung |
|---|---|
| `npm run build:tokens` | erzeugt `dist/tokens.css`, `tailwind.css`, `custom-media.css`, `tokens.js`/`.d.ts`, `figma/tokens.figma.json` |
| `npm run check:contrast` | prüft alle semantischen Farbpaarungen beider Themes gegen WCAG AA |

## Commits

Conventional Commits (`feat:`, `fix:`, `docs:` …), daraus erzeugt release-please Version und Changelog ([ADR 0006](docs/adr/0006-versionierung.md)).

## Lizenz

[MIT](LICENSE) – Copyright (c) 2026 Cranach Digital Archive.

Drittanbieter-Ressourcen behalten ihre eigenen Lizenzen: IBM Plex (SIL Open Font License 1.1), Material Symbols (Apache License 2.0).
