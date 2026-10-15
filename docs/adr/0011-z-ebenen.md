# 0011 – z-Ebenen nach Bolt Design System

**Status:** angenommen (Q19b, Q19c)

## Kontext
Bisher Zahlenebenen (0/10/20/30/40, 100) plus Ausreißer wie 99999 und 100000. Gewünscht sind sprechende Namen nach einem etablierten System.

## Entscheidung
Werte aus dem Bolt Design System (Pega), `@bolt/core-v3.x@5.8.0`, `_settings-z-index.scss`, unverändert übernommen und um zwei Ebenen ergänzt:

| Token | Wert | Herkunft |
|---|---|---|
| `--cda-z-background-bottom` | −20 | Bolt |
| `--cda-z-background` | 0 | Bolt |
| `--cda-z-background-top` | 20 | Bolt |
| `--cda-z-content-bottom` | 40 | Bolt |
| `--cda-z-content` | 60 | Bolt |
| `--cda-z-content-top` | 80 | Bolt |
| `--cda-z-nav` | 100 | Bolt |
| `--cda-z-fab` | 110 | Bolt |
| `--cda-z-popover` | 120 | Bolt |
| `--cda-z-tooltip` | 140 | Bolt |
| `--cda-z-nav-fixed` | 160 | Bolt |
| `--cda-z-modal-bg` | 180 | Bolt |
| `--cda-z-modal` | 200 | Bolt |
| `--cda-z-toast` | 220 | Ergänzung |
| `--cda-z-skip-link` | 240 | Ergänzung |

- Utility-Klassen `.cda-u-z-*` ohne `!important`.
- Drawer nutzen `modal-bg`/`modal`. Echte Dialoge bevorzugt über `<dialog>` bzw. die Popover-API (Top-Layer, kein z-Index nötig).

## Konsequenzen
- Wie bei Bolt liegt `tooltip` unter `nav-fixed`: Tooltips im Inhalt werden vom fixierten Header verdeckt.
