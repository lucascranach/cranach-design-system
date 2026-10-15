# 0009 – Typografie und Schriften

**Status:** angenommen (Q7, Q26)

## Kontext
IBM Plex Sans ist überall gesetzt, aber in drei Builds (teils nur TTF) und mit einem verschobenen Gewichts-Mapping (Datei „Light“ als 200 registriert usw.). Fließtext in Plex Light bei 14,4 px ist schwer lesbar.

## Entscheidung
- IBM Plex Sans als **variable woff2** (Achse `wght`) plus Italic, Subset Latin und Latin-Ext; IBM Plex Mono 400 für Code.
- Standard-Gewichts-Mapping (300 Light, 400 Regular, 500 Medium, 600 SemiBold, 700 Bold).
- Fließtext 16 px (1rem) in Regular.
- Schriften werden mit dem Paket ausgeliefert und nur vom eigenen Server geladen.
