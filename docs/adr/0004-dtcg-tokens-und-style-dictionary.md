# 0004 – Tokens im DTCG-Format, Build mit Style Dictionary

**Status:** angenommen (Q5)

## Kontext
Tokens werden in CSS, JS/TS, Tailwind und Figma gebraucht. Werte sollen an genau einer Stelle gepflegt und versioniert werden.

## Entscheidung
- Maßgebliche Quelle sind JSON-Dateien im Format der W3C Design Tokens Community Group (DTCG) unter `tokens/` (`$value`, `$type`, `$description`, Referenzen `{…}`).
- Zwei Ebenen:
  - **Primitive** (`tokens/primitive/`): die Palette und Skalen, z. B. `color.yellow.500`.
  - **Semantik** (`tokens/semantic/`): Bedeutungen je Theme, z. B. `color.accent`, `color.text.default`.
- Style Dictionary erzeugt daraus alle Ausgabeformate nach `dist/`.
- Figma liest nur (ADR 0014); Änderungen laufen über Git.

## Konsequenzen
- Eine Farbänderung erfolgt an einer Stelle; alle Formate ziehen beim Build nach.
