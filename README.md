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

`cranach.css` enthält die Tokens (per `@import "./tokens.css"`), die Schriften IBM Plex Sans und IBM Plex Mono (`fonts/`), den Reset und die Grundstyles. IBM Plex Sans ist unter dem eigenen Namen **„Cranach Sans“** registriert ([ADR 0017](docs/adr/0017-familienname-cranach-sans.md)). So kollidiert sie nicht mit Projekten, die IBM Plex noch selbst mit dem alten, verschobenen Gewichts-Mapping (Datei „Light“ als 200 usw.) registrieren – gleich, in welcher Reihenfolge die Dateien eingebunden werden. Die Schrift immer über `var(--cda-font-family-sans)` setzen, nicht per Name.

**Tailwind-4-Projekte** zusätzlich:

```css
@layer theme, base, cda, components, utilities;
@import "tailwindcss";
@import "@lucascranach/design-system/tailwind.css";
```

## Icons

Icon-Font „Cranach Symbols“, ein Subset von Material Symbols Sharp ([ADR 0012](docs/adr/0012-icons.md)), enthalten in `cranach.css`:

```html
<span class="cda-icon" aria-hidden="true">search</span>
<span class="cda-icon cda-icon--filled" aria-hidden="true">lock</span>
```

- Immer `aria-hidden="true"`, sonst lesen Screenreader den Namen vor. Trägt das Icon allein die Bedeutung, bekommt das umgebende Element ein `aria-label`.
- Größe 24 px; anders über `font-size` am Icon.
- Verfügbare Icons: [`icons/icons.json`](icons/icons.json). Alte Material-Icons-Namen wie `expand_more` funktionieren als Alias.
- Neues Icon: Namen in `icons/icons.json` ergänzen, `npm run build`, Minor-Release.

## Aufbau des Repos

| Ordner | Inhalt |
|---|---|
| `tokens/` | Design-Tokens im DTCG-Format (Primitive und Semantik) |
| `build/` | Build-Skripte (Style Dictionary, Icons, Figma-Sync) |
| `src/` | CSS für Grundstyles und Komponenten |
| `icons/` | Liste der benötigten Material-Symbols-Icons |
| `stories/` | Storybook-Doku: deutsche MDX-Seiten und Stories |
| `.storybook/` | Storybook-Konfiguration und Hilfsstyles der Doku |
| `docs/` | ADRs und weitere Dokumentation |
| `dist/` | Build-Ergebnis (nicht auf `main` eingecheckt) |

## Entwicklung

```sh
npm install
npm run build          # Tokens, Icons und CSS bauen, Kontraste prüfen
```

| Befehl | Wirkung |
|---|---|
| `npm run build:tokens` | erzeugt `dist/tokens.css`, `tailwind.css`, `custom-media.css`, `tokens.js`/`.d.ts`, `figma/tokens.figma.json` |
| `npm run build:icons` | lädt das Icon-Subset über `icon_names` von Google Fonts nach `dist/fonts/cranach-symbols.woff2`; zwischengespeichert in `.cache/icons/`, `-- --refresh` lädt neu |
| `npm run build:css` | erzeugt `dist/cranach.css` aus `src/` und kopiert die Schriften nach `dist/fonts/` (setzt `build:tokens` und `build:icons` voraus) |
| `npm run check:contrast` | prüft alle semantischen Farbpaarungen beider Themes gegen WCAG AA |
| `npm run storybook` | baut und startet die Doku unter http://localhost:6006 |
| `npm run build:storybook` | baut die Doku als statische Seite nach `storybook-static/` |

Die Doku (Storybook 10, HTML-Renderer mit Vite) liegt in `stories/`, die Konfiguration in `.storybook/`. Storybook bindet das gebaute `dist/cranach.css` ein; nach Änderungen in `src/` oder `tokens/` `npm run build` erneut ausführen und Storybook neu starten, weil der laufende Dev-Server die neu gebauten Dateien nicht übernimmt. Der Pinsel in der Werkzeugleiste schaltet zwischen hellem und dunklem Theme, der Reiter „Accessibility“ zeigt die axe-Prüfung jeder Story.

## Commits

Conventional Commits (`feat:`, `fix:`, `docs:` …), daraus erzeugt release-please Version und Changelog ([ADR 0006](docs/adr/0006-versionierung.md)).

## Lizenz

[MIT](LICENSE) – Copyright (c) 2026 Cranach Digital Archive.

Drittanbieter-Ressourcen behalten ihre eigenen Lizenzen: IBM Plex (SIL Open Font License 1.1, Lizenztexte in `dist/fonts/`, bezogen über die Fontsource-Pakete), Material Symbols (Apache License 2.0, Lizenztext in `icons/` und `dist/fonts/`).
