# 0021 – Layout-Bausteine und Regel für Zustände

**Status:** Entwurf (11.11.2026), noch nicht freigegeben · würde ADR 0003 ergänzen

Angeregt durch die Methode CUBE CSS (Composition, Utility, Block, Exception; [cube.fyi](https://cube.fyi)). Übernommen werden zwei Teile, der Rest nicht – siehe „Abgewogen“.

## Kontext
- **Layouts baut jedes Projekt selbst.** cranach-artefacts hat dafür einen eigenen Sass-Ordner `composition/`, cranach-kirby `.grid`, `.vertical-stack` und `.container`, cranach-search Raster-Mixins. Im Designsystem gibt es nur `.cda-card-grid`. Auch die Komponenten setzen ihre inneren Abstände jeweils selbst.
- **CUBE CSS** trennt dafür eine eigene Ebene ab, die *Composition*: Bausteine, die nur anordnen – Abstände, Spalten, Umbruch – und nichts über Farbe, Schrift oder die Komponente darin wissen. Sie geben dem Browser flexible Regeln vor, statt jede Breite festzulegen, und kommen deshalb meist ohne Media Queries aus. Die Bausteine stammen aus *Every Layout* (Heydon Pickering, Andy Bell).
- **Zustände** setzen die Komponenten heute schon über ARIA-Attribute (`aria-current`, `aria-pressed`, `aria-expanded`, `aria-invalid`), Varianten über BEM-Modifier (`--primary`, `--small`). Eine Regel dafür steht nirgends. Dialog und Seitenleiste (Roadmap-Schritte 24, 25) brauchen Zustände, für die es nicht immer ein ARIA-Attribut gibt.

## Entscheidung (Vorschlag)

### 1. Layout-Bausteine
- Neuer Layer **`cda.compositions`** zwischen `cda.base` und `cda.components`:
  ```css
  @layer cda.tokens, cda.reset, cda.base, cda.compositions, cda.components, cda.utilities;
  ```
  Komponenten können damit Abstände eines Bausteins anpassen; Utilities gewinnen weiterhin gegen beide. Die Reihenfolge entspricht der von CUBE (global → Composition → Block), nur stehen Utilities bei uns zuletzt (siehe „Abgewogen“).
- **Präfix `cda-l-`** (für Layout), analog zu `cda-u-` bei den Utilities. Das verhindert Verwechslungen mit Komponenten: Every Layout nennt Bausteine „Switcher“ und „Sidebar“, im Designsystem sind `.cda-switcher` und die geplante Seitenleiste aber Komponenten.
- **Fünf Bausteine** zum Start:

  | Klasse | Aufgabe | Einstellbar über |
  |---|---|---|
  | `.cda-l-stack` | Kinder untereinander mit gleichem Abstand (in CUBE „Flow“) | `--cda-l-space` (Standard `--cda-space-m`) |
  | `.cda-l-cluster` | Kinder nebeneinander, brechen bei Platzmangel um – Buttons, Filter, Schlagworte | `--cda-l-space` |
  | `.cda-l-sidebar` | schmale Spalte neben breitem Inhalt; stapelt sich, wenn der Inhalt zu schmal würde | `--cda-l-space`, `--cda-l-side` (Breite der schmalen Spalte) |
  | `.cda-l-grid` | Raster mit Mindestbreite je Spalte, füllt die Zeile automatisch | `--cda-l-space`, `--cda-l-min` (Standard `--cda-size-card-min`) |
  | `.cda-l-center` | Inhalt mittig mit maximaler Breite und seitlichem Abstand | `--cda-l-max` |

- **Einstellbare Custom Properties** (`--cda-l-…`) sind neu: Bisher stellen Komponenten keine Variablen zum Anpassen bereit. Sie folgen dem Präfix aus ADR 0003, haben einen Standard aus den Tokens und werden im Projekt am Element gesetzt, z. B. `style="--cda-l-space: var(--cda-space-l)"` oder in einer eigenen Regel.
- **Komponenten nutzen die Bausteine intern**, wo es passt (CUBE: „Composition within blocks“), aber über dieselben CSS-Regeln, nicht über zusätzliche Klassen im Markup. Das Markup der Komponenten bleibt dadurch unverändert.
- **`.cda-card-grid`** wird zu einem Sonderfall von `.cda-l-grid` (gleiches Verhalten, Karten-Mindestbreite). Ob die Klasse bleibt oder durch `.cda-l-grid` ersetzt wird, ist offen; da noch nichts veröffentlicht ist, wäre beides ohne Bruch möglich.
- Jeder Baustein bekommt eine Seite unter „Grundlagen“ oder einem eigenen Bereich „Layout“ im Storybook.

### 2. Regel für Zustände und Varianten
| Fall | Mittel | Beispiel |
|---|---|---|
| Zustand mit Bedeutung für Screenreader | ARIA-Attribut | `aria-current="page"`, `aria-pressed="true"`, `aria-expanded="false"` |
| Zustand ohne passendes ARIA-Attribut | `data-state` | `data-state="loading"`, `data-state="closing"` |
| feste Variante, die sich zur Laufzeit nicht ändert | BEM-Modifier | `.cda-button--primary`, `.cda-card-grid--small` |

Zustände werden nie über Klassen wie `.is-active` gesetzt. CSS und JavaScript nutzen dasselbe Attribut als Haken.

## Abgewogen und nicht übernommen
- **Utilities aus allen Tokens** (CUBE: `.bg-primary`, `.color-base` …): Projekte mit Tailwind bekommen sie über den Adapter (ADR 0002). Für Projekte ohne Tailwind bleibt es bei wenigen Hilfsklassen – zwei Wege für dasselbe sollen nicht entstehen. Die „Wrapper“-Utility aus CUBE wird zu `.cda-l-center`.
- **Reihenfolge Utility vor Block:** Bei CUBE kann eine Komponente eine Utility überschreiben. Bei uns gewinnt `cda.utilities` immer. Für ein Paket, das viele Projekte nutzen, ist das verlässlicher: Eine Hilfsklasse wirkt, egal an welcher Komponente.
- **Lockeres BEM in Blocks:** CUBE verzichtet auf `__element` und erlaubt beliebige Selektoren innerhalb einer Komponente. Für ein Designsystem, dessen Markup Projekte in React, Eleventy und PHP nachbauen, bleibt das strenge BEM (ADR 0003, per Stylelint geprüft) die klarere Absprache. Die Empfehlung von CUBE, eine Komponente auf 80–100 Zeilen zu begrenzen, gilt als Richtwert.
- **Klassen gruppieren** (`class="[ card ] [ flow ]"`): eine Schreibgewohnheit für Projekte; die Markup-Beispiele der Doku bleiben ohne.

## Konsequenzen
- ADR 0003 wird ergänzt (neuer Layer, Präfix `cda-l-`); Stylelint muss `cda-l-` und die Variablen `--cda-l-…` zulassen.
- Neue Tokens für `.cda-l-center`: eine Textbreite (Vorschlag `size.measure`, etwa `65ch`) und eine Seitenbreite (Vorschlag `size.page`). Die Werte sind offen.
- Die Bausteine sollten vor den Roadmap-Schritten 23–27 entstehen, damit Meldung, Dialog, Seitenleiste, Tabelle und Listenzeile sie gleich nutzen. Vorschlag: neuer Schritt vor 23, die folgenden rücken eine Nummer weiter.
- Die Migrationsseiten bekommen je Projekt eine Zuordnung der eigenen Layout-Klassen (`.container`, `.grid`, `composition/` …) zu den Bausteinen.

## Offene Fragen
1. Präfix `cda-l-` oder ein anderer Name (etwa `cda-layout-`)?
2. Reichen die fünf Bausteine zum Start? Every Layout kennt weitere (Box, Cover, Frame, Reel, Imposter, Icon); die meisten davon decken bei uns Komponenten oder Utilities ab.
3. Werte für Text- und Seitenbreite.
4. `.cda-card-grid` behalten oder in `.cda-l-grid` aufgehen lassen?
5. Eigener Bereich „Layout“ im Storybook oder unter „Grundlagen“?
