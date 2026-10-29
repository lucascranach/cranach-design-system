# Figma-Sync – Kurzanleitung

Überträgt die Design-Tokens als Variablen in die Figma-Library-Datei (ADR 0014). Quelle sind immer die Tokens in `tokens/`; Änderungen an Farben, Abständen usw. werden dort gemacht und danach nach Figma übertragen, nie umgekehrt.

## Voraussetzungen

- Leere Library-Datei im Team-Projekt des Education-Teams, Link liegt vor (Aufgabe für Volker in der Roadmap).
- Figma-MCP-Server (remote) ist in Claude Code verbunden.
- Wer ausführt, hat einen Full-Seat und Bearbeitungsrechte an der Datei.

## Ablauf

1. `npm run build` – erzeugt unter anderem `dist/figma/figma-sync.js`.
2. Claude Code bitten: „Figma-Sync in <Link zur Datei> ausführen“. Claude übergibt den Inhalt von `dist/figma/figma-sync.js` an `use_figma` und meldet die Zusammenfassung, etwa `121 angelegt, 0 geändert, 0 unverändert, 0 nicht mehr in den Tokens, 0 Fehler`.
3. Claude prüft das Ergebnis mit `get_variable_defs`.
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
| `color/text/*` | Textfarbe |
| `color/border/*`, `color/focus/*` | Konturfarbe |
| übrige semantische Farben | Füllungen und Konturen |
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

## Noch nicht mit einer echten Figma-Datei geprüft

Bis die Library-Datei und der MCP-Server bereitstehen, ist das Skript nur gegen den Nachbau getestet. Beim ersten echten Lauf klären:

- Gibt `use_figma` das Ergebnis des letzten Ausdrucks (`syncTokens()`) zurück, oder braucht es ein `return`?
- Nimmt `use_figma` die 27 KB Code in einem Aufruf an? Sonst die Sammlungen auf zwei Aufrufe verteilen.
- Funktioniert IBM Plex Sans in der Datei (offener Punkt in der Roadmap)?
