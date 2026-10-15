# 0002 – CSS-first mit Adaptern, ohne SCSS

**Status:** angenommen (Q3, Q31)

## Kontext
Die Frontends nutzen sehr unterschiedliche Stacks: React 17/18/19, styled-components, Tailwind 4 mit shadcn/ui, Eleventy, Jekyll, Kirby/PHP und reines HTML. SCSS soll schrittweise aus den Projekten verschwinden.

## Entscheidung
- **Kern:** Design-Tokens als CSS Custom Properties (`--cda-…`), Komponenten als CSS-Klassen (`.cda-…`) mit dokumentiertem HTML-Markup.
- **Adapter** (generiert):
  - JS/TS-Tokens für Stellen, die kein CSS lesen (three.js, Mapbox-Layer, Berechnungen),
  - Tailwind-4-Datei mit `@theme` und Zuordnung der shadcn-Variablen (`--primary`, `--radius` …) auf die Cranach-Tokens,
  - `custom-media.css` mit `@custom-media`-Definitionen der Breakpoints.
- **Kein SCSS-Adapter.** Custom Properties funktionieren auch in `.scss`-Dateien; Breakpoints in `@media` kommen über `@custom-media` (PostCSS/Lightning CSS) oder werden als dokumentierte Werte direkt geschrieben. Ersatz für Sass in den Projekten ist natives CSS Nesting.
- React-Wrapper sind nicht Teil von v1, bleiben aber möglich.

## Konsequenzen
- Funktioniert ohne Build-Zwang in jedem Stack.
- Projekte mit Sass bekommen keine `$`-Variablen mehr; Migration auf `var(--cda-…)`.
