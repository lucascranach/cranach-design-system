# 0003 – Präfix `cda` und Cascade Layers

**Status:** angenommen (Q8, Q11) · ergänzt durch ADR 0021 (Layer `cda.layout`, Präfix `cda-l-`)

## Kontext
Die Projekte stellen nach und nach um; alte und neue Styles laufen eine Zeit lang parallel. Bestehende Namen kollidieren (`.btn`, `.button`, `$m`, in timeline `--accent`/`--primary` mit anderer Bedeutung).

## Entscheidung
- Alle Tokens beginnen mit `--cda-`, alle Klassen mit `.cda-`.
- Alle Styles liegen in Cascade Layers: `@layer cda.tokens, cda.reset, cda.base, cda.components, cda.utilities;` (`cda.tokens` enthält die Custom Properties).
- Projekt-Styles ohne Layer gewinnen immer. Das Einbinden des Designsystems ändert daher zunächst nichts am Aussehen; alte Regeln werden danach schrittweise entfernt.
- Das Designsystem verwendet kein `!important` (es würde die Layer-Reihenfolge umkehren).
- In Tailwind-Projekten wird `cda` vor `components` und `utilities` eingeordnet, damit Tailwind-Klassen weiter gewinnen. Die Reihenfolge muss vor `@import "tailwindcss"` deklariert werden, weil eine Layer-Reihenfolge durch das erste Vorkommen festgelegt wird:
  ```css
  @layer theme, base, cda, components, utilities;
  @import "tailwindcss";
  @import "@lucascranach/design-system/tailwind.css";
  ```

## Konsequenzen
- Das Designsystem kann alte Styles bewusst nicht überschreiben; das ist gewollt.
