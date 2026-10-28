# 0009 – Typografie und Schriften

**Status:** angenommen (Q7, Q26)

## Kontext
IBM Plex Sans ist überall gesetzt, aber in drei Builds (teils nur TTF) und mit einem verschobenen Gewichts-Mapping (Datei „Light“ als 200 registriert usw.). Fließtext in Plex Light bei 14,4 px ist schwer lesbar.

## Entscheidung
- IBM Plex Sans als **variable woff2** (Achse `wght`) plus Italic, Subset Latin und Latin-Ext; IBM Plex Mono 400 für Code.
- Standard-Gewichts-Mapping (300 Light, 400 Regular, 500 Medium, 600 SemiBold, 700 Bold).
- Fließtext 16 px (1rem) in Regular.
- Schriften werden mit dem Paket ausgeliefert und nur vom eigenen Server geladen.

## Freigegebene Werte (16.10.2026)
- **Schriftgrößen** (`--cda-font-size-*`): xs 12 px · s 14 px · **m 16 px (Fließtext)** · l 20 px · xl 24 px · 2xl 32 px · 3xl 40 px · 4xl 52 px (entspricht dem Titel in cranach-timeline).
- **Zeilenhöhen:** tight 1,2 · normal 1,4 · loose 1,6 (aus cranach-search).
