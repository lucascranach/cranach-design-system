# 0014 – Figma-Anbindung über den Figma-MCP-Server

**Status:** angenommen (Q6, Q20, Q21, Q27)

## Kontext
Figma Education-Plan; mit der Library arbeiten Volker Schaefer, Gestalter:innen und Entwickler:innen. Die Variables-REST-API ist nur für Enterprise verfügbar. Tokens Studio soll nicht verwendet werden. Framelink (glips/figma-context-mcp) kann nur lesen.

## Entscheidung
- Werkzeug: der offizielle **Figma-MCP-Server (remote)**.
- **Tokens nach Figma:** Style Dictionary erzeugt ein festes, idempotentes Skript `dist/figma/figma-sync.js` (Plugin-API-Code: Collections, Modes Light/Dark, Variables). Claude Code führt es über `use_figma` in der Library-Datei aus und prüft anschließend mit `get_variable_defs`.
- **Komponenten in Figma:** Claude erzeugt die Kernkomponenten über `use_figma` (Varianten, Auto-Layout, an Variables gebunden) nach Vorlage aus Code und Storybook; Gestalter:innen verfeinern, Volker gibt frei.
- **Rollen:** Library-Datei im Team-Projekt des Education-Teams; Besitzer Volker, Gestalter:innen als Bearbeitende; Veröffentlichung nach gemeinsamer Prüfung.

## Konsequenzen
- Schreiben braucht einen Full-Seat und Bearbeitungsrechte an der Datei.
- Bekannte Grenzen von `use_figma`: 20 KB Antwort pro Aufruf, noch keine Bilder, „Custom Fonts“ noch nicht unterstützt (IBM Plex ist in Figma als Google Font verfügbar – vor dem Bau testen).
