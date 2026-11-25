# 0022 – Semantische Tokens ohne Theme

**Status:** angenommen (25.11.2026, Entscheidung Volker) · ergänzt ADR 0004

## Kontext
- ADR 0004 teilt die Tokens in zwei Ebenen: **Primitive** („die Palette und Skalen“) und **Semantik** („Bedeutungen je Theme“). Der Build hat daraus abgeleitet: Was in `tokens/semantic/` steht, ist eine Farbe mit Wert für hell und dunkel.
- Inzwischen gibt es Tokens, die nach ihrem Zweck benannt sind, aber in beiden Themes gleich: die Breiten `size.card.min`, `size.card.min-small`, `size.measure`, `size.term`, `size.page` und der Fokusring `focus.ring-width`, `focus.ring-offset`. Sie liegen in `tokens/primitive/dimension.json`, weil nur dort Tokens ohne Theme vorgesehen waren – obwohl sie keine Skala sind.
- Für die Figma-Textstile kommen zusammengesetzte Tokens `typography.*` dazu (Fließtext, Überschriften, Code), ebenfalls Bedeutungen ohne Theme.
- Bei der Prüfung der Figma-Library (23.11.2026) fiel auf, dass Gestalter:innen dort Rollen und Skalen gemischt in „Cranach Primitives“ finden.

## Entscheidung
- **Primitive** (`tokens/primitive/`) sind nur noch Paletten und Skalen: Farben, Abstände, Radien, Rahmenstärken, Breakpoints, Schriftfamilien, -größen, -stärken, Zeilenhöhen, Dauern, Kurven, Deckkraft, Schatten, z-Ebenen.
- **Semantik** (`tokens/semantic/`) sind alle Bedeutungen, mit oder ohne Theme:
  - je Theme: `light.json`, `dark.json` (wie bisher, Farben),
  - ohne Theme: eigene Dateien, die für beide Themes gelten – `dimension.json` (`size.*`, `focus.ring-*`) und `typography.json` (`typography.*`).
- **Bleiben bei den Primitiven** (Entscheidung Volker):
  - z-Ebenen `z.*` – nach Rollen benannt, aber eine Rangfolge aus dem Bolt Design System (ADR 0011),
  - Schriftfamilien `font.family.*` – auch die Icon-Schrift bleibt bei Sans und Mono.
- **Namen bleiben gleich:** Der Ordner ist nicht Teil des Token-Namens. `--cda-size-page` heißt weiter so; Tokens ohne Theme stehen in `tokens.css` wie bisher in `:root` und in `tokens.js` auf oberster Ebene, nicht unter `light`/`dark`.
- **Figma:** Alle Bedeutungen liegen in der Sammlung „Cranach Semantic“. Tokens ohne Theme haben dort in Light und Dark denselben Wert (wie heute schon `color/text/on-accent`). Scopes richten sich weiter nach der Art des Werts (`size/*` Breite/Höhe, `focus/ring-*` Konturstärke).

## Konsequenzen
- Neue Tokens werden nach dieser Regel abgelegt: Skala → `primitive/`, Bedeutung → `semantic/` (mit Theme in die Theme-Dateien, sonst in eine Datei ohne Theme).
- Für Projekte ändert sich nichts: gleiche Custom Properties, gleiche Pfade in `tokens.js`.
- In Figma lassen sich Variablen nicht zwischen Sammlungen verschieben. Der Sync legt `size/*` und `focus/ring-*` in „Cranach Semantic“ neu an und meldet die alten in „Cranach Primitives“ als „nicht mehr in den Tokens“; sie werden nach Rücksprache von Hand gelöscht, gebundene Ebenen vorher neu gebunden. Die Library war zu diesem Zeitpunkt noch nicht veröffentlicht.
- Der Build lädt für jedes Theme die Theme-Datei und alle Dateien ohne Theme aus `tokens/semantic/`.
