# 0007 – Themes hell und dunkel

**Status:** angenommen (Q9, Q16, Q17)

## Kontext
cranach-timeline ist standardmäßig dunkel, cranach-map hat einen Umschalter, gatsby war komplett dunkel. Es existieren drei Dark-Paletten (#18181a, #444, #000).

## Entscheidung
- Semantische Token-Ebene mit hellem und dunklem Theme von Anfang an.
- Dark-Palette auf Basis von timeline: Hintergrund #18181a, Flächen gestuft heller, Text #f2f2f2, Akzent Gelb.
- Umschaltung:
  - `data-theme="light"` bzw. `data-theme="dark"` auf `<html>` erzwingt ein Theme.
  - Ohne Attribut folgt die Seite `prefers-color-scheme`.
  - Die Klasse `.dark` wird zusätzlich als dunkles Theme verstanden (shadcn/timeline).
- In Figma: eine Variable-Collection mit den Modes „Light“ und „Dark“.
