# Figma-Sync – Kurzanleitung

Überträgt die Design-Tokens als Variablen in die Figma-Library-Datei (ADR 0014). Quelle sind immer die Tokens in `tokens/`; Änderungen an Farben, Abständen usw. werden dort gemacht und danach nach Figma übertragen, nie umgekehrt.

## Voraussetzungen

- Library-Datei im Team-Projekt des Education-Teams: [Cranach Design System](https://www.figma.com/design/GV3vvoVc8GebPQ79YwA1yz/Cranach-Design-System).
- Figma-MCP-Server (remote) ist in Claude Code eingerichtet und angemeldet:
  `claude mcp add --transport http figma https://mcp.figma.com/mcp`, danach im Terminal-Claude `/mcp` → figma → Authenticate. MCP-Server werden nur beim Start einer Sitzung geladen; nach dem Einrichten eine neue Sitzung beginnen.
- Wer ausführt, hat einen Full-Seat und Bearbeitungsrechte an der Datei.

## Ablauf

1. `npm run build` – erzeugt unter anderem `dist/figma/figma-sync.js`.
2. Claude Code bitten: „Figma-Sync ausführen“. Claude übergibt den Inhalt von `dist/figma/figma-sync.js` unverändert an `use_figma` und meldet die Zusammenfassung, beim ersten Lauf in eine leere Datei `123 angelegt` (2 Sammlungen, 121 Variablen), sonst etwa `0 angelegt, 3 geändert, 118 unverändert, 0 nicht mehr in den Tokens, 0 Fehler`.
3. Claude prüft eine Stichprobe mit einem reinen Lese-Aufruf von `use_figma` (Modi, Verweise, Werte, Scopes, CSS-Namen). `get_variable_defs` eignet sich dafür nicht: Es zeigt nur Variablen, die an eine ausgewählte Ebene gebunden sind.
4. In Figma ansehen; die Library erst nach gemeinsamer Prüfung veröffentlichen (ADR 0014).

Der Sync darf beliebig oft laufen. Ein zweiter Lauf ohne Token-Änderungen meldet `0 angelegt, 0 geändert`.

## Was das Skript macht

| Sammlung | Modi | Inhalt |
|---|---|---|
| Cranach Primitives | Value | Paletten und Skalen: Farben, Abstände, Radien, Rahmen, Schriften, z-Ebenen, Breakpoints, Dauern … |
| Cranach Semantic | Light, Dark | Farben nach Bedeutung (`color/text/default` …), als Verweis auf die primitiven Farben |

- **Anlegen und abgleichen:** fehlende Sammlungen, Modi und Variablen werden angelegt; Werte, Beschreibungen, Scopes und CSS-Namen werden auf den Stand der Tokens gebracht. Von Hand in Figma geänderte Werte setzt der nächste Lauf zurück.
- **Nichts löschen:** Variablen, die es in den Tokens nicht mehr gibt, werden nur gemeldet („nicht mehr in den Tokens“). Sie können noch in Entwürfen verwendet sein; gelöscht wird von Hand, nach Rücksprache.
- **Typkonflikt:** Hat eine Variable in Figma einen anderen Typ als in den Tokens (etwa Zahl statt Text), meldet das Skript einen Fehler und lässt sie aus. Figma kann den Typ nicht ändern – die Variable muss von Hand gelöscht werden, der nächste Lauf legt sie neu an.
- **CSS-Name:** Jede Variable zeigt im Dev Mode den Namen der Custom Property, z. B. `var(--cda-color-text-default)`.
- **Schriftgrößen** in px (aus rem × 16), **Schriftnamen** so, wie Figma sie kennt: „IBM Plex Sans“ statt „Cranach Sans“ (ADR 0017), „Material Symbols Sharp“ statt „Cranach Symbols“.

### Scopes – wo Figma eine Variable anbietet

| Variablen | Scope |
|---|---|
| Primitive Farben | keiner – erscheinen nicht in den Farbwählern, damit die semantischen Farben genutzt werden |
| `color/text/*`, `color/link/default`, `color/link/hover-text` | Textfarbe |
| `color/border/*`, `color/focus/*`, `color/link/underline` | Konturfarbe |
| `color/background/*`, `color/link/hover-background` | Fläche (Rahmen und Formen) |
| `color/accent/*` | Fläche und Kontur |
| `space/*` (ohne `fluid`) | Abstand (Auto-Layout) und Breite/Höhe |
| `radius/*` | Eckenradius |
| `border-width/*`, `focus/ring-*` | Konturstärke |
| `size/*` | Breite/Höhe |
| `font/size/*`, `font/weight/*`, `font/family/*` | Schriftgröße, -stärke, -familie |
| z-Ebenen, Breakpoints, Dauern, Deckkraft, Zeilenhöhe, `space/fluid/*` | keiner – nur zur Information, Figma hat dafür kein passendes Feld |

Die Zuordnung steht in `build/build-figma.mjs` (`scopesFor`).

## Dateien

| Datei | Inhalt |
|---|---|
| `dist/figma/tokens.figma.json` | Variablen-Beschreibung aus `build/build-tokens.mjs` |
| `build/figma-sync.template.js` | Plugin-Code des Sync-Skripts |
| `build/build-figma.mjs` | setzt beides zu `dist/figma/figma-sync.js` zusammen, ergänzt Scopes und CSS-Namen |
| `build/figma-sync.test.mjs` | Tests gegen eine nachgebaute Figma-API (`npm run test:figma`) |

## Erster Lauf am 29.10.2026

In die leere Library-Datei: 2 Sammlungen und 121 Variablen angelegt, 0 Fehler. Stichprobe stimmt (z. B. `color/text/default` hell → `color/neutral/1000`, dunkel → `color/neutral/100`; `font/size/m` = 16; `color/alpha/black-40` mit Deckkraft 0,4).

Dabei geklärt:

- **Rückgabe:** `use_figma` führt den Code als Rumpf einer async-Funktion aus und gibt nur zurück, was mit `return` übergeben wird. Das Skript endet deshalb mit `return await syncTokens();`.
- **Größe:** `use_figma` nimmt bis zu 50.000 Zeichen Code; die rund 27 KB passen in einen Aufruf.
- **Zahlen mit 32 Bit:** Figma speichert Zahlen ungenauer, 0,6 kommt als 0,60000002… zurück. Der zweite Lauf meldete deshalb zunächst Deckkraft und Zeilenhöhen als geändert. Zahlen werden jetzt mit einer kleinen Toleranz verglichen; der Nachbau in den Tests rundet genauso (`Math.fround`). Danach: `0 angelegt, 0 geändert, 121 unverändert`.
- **Schriften:** IBM Plex Sans, IBM Plex Mono und Material Symbols Sharp sind in Figma vorhanden und laden. Die Schnitte heißen dort z. B. „SemiBold“ (ohne Leerzeichen).
