# 0021 – Layouts und Regel für Zustände

**Status:** angenommen (11.11.2026, Entscheidung Volker) · ergänzt ADR 0003

Angeregt durch die Methode CUBE CSS (Composition, Utility, Block, Exception; [cube.fyi](https://cube.fyi)). Übernommen werden zwei Teile, der Rest nicht – siehe „Abgewogen“.

## Kontext
- **Layouts baut jedes Projekt selbst.** cranach-artefacts hat dafür einen eigenen Sass-Ordner `composition/`, cranach-kirby `.grid`, `.vertical-stack` und `.container`, cranach-search Raster-Mixins. Im Designsystem gibt es nur `.cda-card-grid`. Auch die Komponenten setzen ihre inneren Abstände jeweils selbst.
- **CUBE CSS** trennt dafür eine eigene Ebene ab, die *Composition*: Regeln, die nur anordnen – Abstände, Spalten, Umbruch – und nichts über Farbe, Schrift oder die Komponente darin wissen. Sie geben dem Browser flexible Regeln vor, statt jede Breite festzulegen, und kommen deshalb meist ohne Media Queries aus. Die einzelnen Layouts stammen aus *Every Layout* (Heydon Pickering, Andy Bell).
- **Zustände** setzen die Komponenten heute schon über ARIA-Attribute (`aria-current`, `aria-pressed`, `aria-expanded`, `aria-invalid`), Varianten über BEM-Modifier (`--primary`, `--small`). Eine Regel dafür steht nirgends. Dialog und Seitenleiste (Roadmap-Schritte 24, 25) brauchen Zustände, für die es nicht immer ein ARIA-Attribut gibt.

## Entscheidung

### 1. Layouts
- **Begriff:** Die Klassen `cda-l-…` heißen in Doku und Gesprächen schlicht **Layouts** („das Stack-Layout“, „die Layouts Stack und Grid“), wie bei Every Layout. Erwogen und verworfen (Entscheidung Volker): „Baustein“ (zu allgemein, auch Komponenten sind Bausteine), „Layout-Primitive“, „Komposition“, „Layout-Muster“, „Anordnungen“, „Layout-Objekte“.
- Neuer Layer **`cda.layout`** zwischen `cda.base` und `cda.components` (in CUBE heißt die Ebene „Composition“; der Name `cda.layout` passt zum Präfix `cda-l-`):
  ```css
  @layer cda.tokens, cda.reset, cda.base, cda.layout, cda.components, cda.utilities;
  ```
  Komponenten können damit Abstände eines Layouts anpassen; Utilities gewinnen weiterhin gegen beide. Die Reihenfolge entspricht der von CUBE (global → Composition → Block), nur stehen Utilities bei uns zuletzt (siehe „Abgewogen“).
- **Präfix `cda-l-`** (für Layout), analog zu `cda-u-` bei den Utilities. Das verhindert Verwechslungen mit Komponenten: Every Layout nennt zwei seiner Layouts „Switcher“ und „Sidebar“, im Designsystem sind `.cda-switcher` und die geplante Seitenleiste aber Komponenten. Erwogen und verworfen: `cda-c-` (für Composition) – in den verbreiteten Namensräumen nach Harry Roberts (ITCSS) steht `c-` für Komponenten, `cda-c-stack` würde als Komponente gelesen.
- **Fünf Layouts** zum Start; weitere aus Every Layout (Box, Cover, Frame, Reel, Imposter, Icon) erst bei Bedarf:

  | Klasse | Aufgabe | Einstellbar über |
  |---|---|---|
  | `.cda-l-stack` | Kinder untereinander mit gleichem Abstand (in CUBE „Flow“) | `--cda-l-space` (Standard `--cda-space-m`) |
  | `.cda-l-cluster` | Kinder nebeneinander, brechen bei Platzmangel um – Buttons, Filter, Schlagworte | `--cda-l-space` |
  | `.cda-l-sidebar` | schmale Spalte neben breitem Inhalt; stapelt sich, wenn der Inhalt zu schmal würde | `--cda-l-space`, `--cda-l-side` (Breite der schmalen Spalte) |
  | `.cda-l-grid` | Raster mit Mindestbreite je Spalte, füllt die Zeile automatisch | `--cda-l-space`, `--cda-l-min` (Standard `--cda-size-card-min`) |
  | `.cda-l-center` | Inhalt mittig mit maximaler Breite und seitlichem Abstand | `--cda-l-max` (Standard `--cda-size-page`; für Textspalten `--cda-size-measure`) |

- **Einstellbare Custom Properties** (`--cda-l-…`) sind neu: Bisher stellen Komponenten keine Variablen zum Anpassen bereit. Sie folgen dem Präfix aus ADR 0003, haben einen Standard aus den Tokens und werden im Projekt am Element gesetzt, z. B. `style="--cda-l-space: var(--cda-space-l)"` oder in einer eigenen Regel.
- **Komponenten nutzen die Layouts intern**, wo es passt (CUBE: „Composition within blocks“), aber über dieselben CSS-Regeln, nicht über zusätzliche Klassen im Markup. Das Markup der Komponenten bleibt dadurch unverändert.
- **`.cda-card-grid` entfällt** und wird durch `.cda-l-grid` ersetzt; die Mindestbreite der Karte ist dessen Standard. Da noch nichts veröffentlicht ist, bricht das nichts. Die Variante `--small` wird zu `style="--cda-l-min: var(--cda-size-card-min-small)"` oder einer Klasse an der Karte – beim Umbau klären.
- Die Layouts bekommen im Storybook einen **eigenen Bereich „Layout“** mit einer Seite je Layout.

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
- ADR 0003 ist ergänzt (neuer Layer, Präfix `cda-l-`); Stylelint muss `cda-l-` und die Variablen `--cda-l-…` zulassen.
- Zwei neue Tokens für `.cda-l-center`:
  - **`size.measure` = `65ch`** – Zeilenlänge von Textspalten („measure“ ist der typografische Fachbegriff, so auch in Every Layout und CUBE; Name von Volker gewählt, verworfen: `size.line-length`, `size.prose`). Bei 16 px rund 620 px, wegen der schmaleren Buchstaben etwa 70–80 Zeichen; empfohlen sind 45–75, WCAG 1.4.8 nennt höchstens 80. Heute: artefacts 720 px, cda-orga 800 px, kirby `60em` – die Textspalte in artefacts wird damit etwa 100 px schmaler; beim Umsetzen auf einer Werkseite prüfen.
  - **`size.page` = 1536 px** – größte Breite des Seiteninhalts, gleich dem größten Breakpoint `2xl`: Oberhalb des letzten Breakpoints wächst das Layout nicht weiter. Heute begrenzen cda-orga und kirby bei 1920 px, artefacts und search gar nicht. Kachelansichten wie in search dürfen weiter die volle Breite nutzen oder `--cda-l-max` selbst setzen.
- Die Layouts entstehen in Roadmap-Schritt 23, vor Meldung, Dialog, Seitenleiste, Tabelle und Listenzeile (jetzt Schritte 24–28), damit diese sie gleich nutzen.
- Die Migrationsseiten bekommen je Projekt eine Zuordnung der eigenen Layout-Klassen (`.container`, `.grid`, `composition/` …) zu den Layouts.

## Ergänzung (11.11.2026, Entscheidung Volker): Werte setzen ohne `style`-Attribut
In den ersten Beispielen wurden Abstände und Breiten der Layouts per `style`-Attribut gesetzt, etwa `style="--cda-l-space: var(--cda-space-xl)"`. Das funktioniert nicht in Projekten mit strenger Content-Security-Policy (sie verbietet `style`-Attribute), Tippfehler fallen nicht auf (der Wert entfällt still), und Editoren schlagen nichts vor. Die Vorbilder vermeiden es ebenfalls: Every Layout setzt die Variablen über Attribute seiner Web Components, CUBE über Regeln im Projekt-CSS.

- **Die Variablen bleiben die Schnittstelle** der Layouts.
- **Abstands-Utilities `cda-u-space-*`**, eine je Abstands-Token (`2xs` bis `4xl`, `fluid-s` bis `fluid-l`). Sie setzen nur `--cda-l-space` und damit den Abstand jedes Layouts, an dem sie stehen – keinen Abstand direkt. Das ist kein Widerspruch zu ADR 0002 (keine Abstands-Utilities wie in Tailwind), weil sie ausschließlich die Layouts einstellen. Der Build prüft, dass es zu jedem Abstands-Token eine Klasse gibt.
- **Keine Utilities für Breiten** (`--cda-l-side`, `--cda-l-min`, `--cda-l-max`): Deren Werte sind fast immer projektspezifisch und gehören in eine Regel im Projekt-CSS.
- **`.cda-l-grid--small`** für die kleine Kachelansicht (Mindestbreite `size.card.min-small`, Abstand `2xs`): eine feste Variante mit eigener Bedeutung, nach der Regel oben also ein Modifier.
- **Reihenfolge in der Doku:** Utility oder Modifier, dann Regel im Projekt-CSS, das `style`-Attribut nur als Notlösung für Einzelfälle.
