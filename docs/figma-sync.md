# Figma-Sync – Kurzanleitung

Überträgt die Design-Tokens als Variablen in die Figma-Library-Datei (ADR 0014). Quelle sind immer die Tokens in `tokens/`; Änderungen an Farben, Abständen usw. werden dort gemacht und danach nach Figma übertragen, nie umgekehrt.

## Voraussetzungen

- Library-Datei im Team-Projekt des Education-Teams: [Cranach Design System](https://www.figma.com/design/GV3vvoVc8GebPQ79YwA1yz/Cranach-Design-System).
- Figma-MCP-Server (remote) ist in Claude Code eingerichtet und angemeldet:
  `claude mcp add --transport http figma https://mcp.figma.com/mcp`, danach im Terminal-Claude `/mcp` → figma → Authenticate. MCP-Server werden nur beim Start einer Sitzung geladen; nach dem Einrichten eine neue Sitzung beginnen.
- Wer ausführt, hat einen Full-Seat und Bearbeitungsrechte an der Datei.

## Ablauf

1. `npm run build` – erzeugt unter anderem `dist/figma/figma-sync.js`.
2. Claude Code bitten: „Figma-Sync ausführen“. Claude übergibt den Inhalt von `dist/figma/figma-sync.js` unverändert an `use_figma` und meldet die Zusammenfassung, beim ersten Lauf in eine leere Datei `152 angelegt` (3 Sammlungen, 138 Variablen, 8 Textstile, 3 Effektstile), sonst etwa `0 angelegt, 3 geändert, 146 unverändert, 0 nicht mehr in den Tokens, 0 Fehler`.
3. Claude prüft eine Stichprobe mit einem reinen Lese-Aufruf von `use_figma` (Modi, Verweise, Werte, Scopes, CSS-Namen; bei Stilen Schrift, Größe, Zeilenhöhe, Bindungen, Schatten). `get_variable_defs` eignet sich dafür nicht: Es zeigt nur Variablen, die an eine ausgewählte Ebene gebunden sind.
4. In Figma ansehen, am einfachsten auf der Seite „Übersicht“ (siehe unten); die Library erst nach gemeinsamer Prüfung veröffentlichen (ADR 0014).

Der Sync darf beliebig oft laufen. Ein zweiter Lauf ohne Token-Änderungen meldet `0 angelegt, 0 geändert`.

**Nur prüfen, ohne zu schreiben:** Claude leitet aus `dist/figma/figma-sync.js` eine Fassung ohne die schreibenden Aufrufe ab (`createVariableCollection`, `addMode`, `renameMode`, `createVariable`, `setValueForMode`, Zuweisungen an `description` und `scopes`, `setVariableCodeSyntax`; bei Stilen `createTextStyle`, `createEffectStyle`, `setBoundVariable`, Zuweisungen an `fontName`, `fontSize`, `lineHeight`, `effects`) und führt sie über `use_figma` aus. Sie vergleicht genauso und meldet `fehlen`, `abweichend`, `gleich`, `nicht mehr in den Tokens` und `Fehler`, ändert aber nichts. Sinnvoll vor einer Freigabe oder wenn unklar ist, ob ein Sync gelaufen ist.

## Was das Skript macht

| Sammlung | Modi | Inhalt |
|---|---|---|
| Cranach Primitives | Value | Paletten und Skalen: Farben, Abstände, Radien, Rahmen, Schriften, z-Ebenen, Breakpoints, Dauern … (`tokens/primitive/`) |
| Cranach Responsive | Mobile 375, Tablet 768, Desktop 1440 | fließende Abstände `space/fluid/*`, je Bildschirmbreite ausgerechnet |
| Cranach Semantic | Light, Dark | Bedeutungen (`tokens/semantic/`): Farben (`color/text/default` …) als Verweis auf die primitiven Farben; Breiten `size/*` und Fokusring `focus/ring-*` ohne Theme, in Light und Dark derselbe Wert (ADR 0022) |

- **Fließende Abstände:** Im Code sind `space/fluid/*` mit `clamp()` und `vw` definiert, z. B. `clamp(16px, 2vw + 8px, 48px)`. Das kann Figma nicht abbilden; der Build rechnet deshalb für jede Bildschirmbreite den Wert aus, den `clamp()` dort ergibt (`space/fluid/m`: 16 / 23 / 37). In Figma bekommt ein Frame den passenden Modus („Mobile 375“ usw.), alle daran gebundenen fließenden Abstände passen sich an. Breiten der Modi: `VIEWPORTS` in `build/build-figma.mjs`.
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
| `space/*`, auch `space/fluid/*` | Abstand (Auto-Layout) und Breite/Höhe |
| `radius/*` | Eckenradius |
| `border-width/*`, `focus/ring-*` | Konturstärke |
| `size/*` | Breite/Höhe |
| `font/size/*`, `font/weight/*`, `font/family/*` | Schriftgröße, -stärke, -familie |
| z-Ebenen, Breakpoints, Dauern, Deckkraft, Zeilenhöhe | keiner – nur zur Information, Figma hat dafür kein passendes Feld |

Die Zuordnung steht in `build/build-figma.mjs` (`scopesFor`).

### Text- und Effektstile

| Stile | Quelle | In Figma |
|---|---|---|
| Textstile `body/default`, `body/small`, `heading/h1`–`heading/h5`, `code` | `typography.*` in `tokens/semantic/typography.json` | Schrift und Schnitt aus Familie und Stärke, Größe in px; Größe, Stärke und Familie an die Variablen gebunden; Zeilenhöhe als Prozent (120 % aus 1,2), weil Figma einen Faktor nicht binden kann |
| Effektstile `shadow/s`, `shadow/m`, `shadow/l` | `shadow.*` in `tokens/primitive/shadow.json` | Schlagschatten mit Versatz, Unschärfe und Ausbreitung; Farbe an `color/alpha/black-40` gebunden. Figma kann Schatten nicht als Variable speichern |

- **Woher die Zusammensetzung kommt:** `typography.*` sind zusammengesetzte Tokens (DTCG-Typ `typography`), die auf die einzelnen Schrift-Tokens verweisen. Sie gehen nur in den Figma-Sync, nicht in `tokens.css` oder `tokens.js`; im CSS setzen die Grundstyles die einzelnen Tokens. `elements` in `$extensions` nennt die HTML-Elemente aus `src/base.css`; `npm run build:css` bricht ab, wenn `base.css` dort andere Tokens nutzt (Entscheidung Volker, 23.11.2026).
- **Kein CSS-Name:** Stile haben in Figma kein Feld für Code-Syntax. Die CSS-Variablen stehen deshalb in der Beschreibung, im Dev Mode sichtbar.
- **Schriftschnitt:** Der Sync leitet ihn aus der Stärke ab (600 → „SemiBold“, `WEIGHT_STYLE` in `build/figma-sync.template.js`) und lädt die Schrift vor dem Setzen.
- Abgleich wie bei den Variablen: fehlende Stile anlegen, Abweichungen zurücksetzen, Stile ohne Token nur melden („nicht mehr in den Tokens“).

## Seite „Übersicht“

Erste Seite der Library-Datei, angelegt am 23.11.2026, zum Ansehen und Prüfen der Variablen. Sie zeigt nur, was in den Variablen steht; Werte werden weiterhin in `tokens/` geändert.

| Rahmen | Inhalt |
|---|---|
| Titel | Name, Zweck, Stand und Paketversion auf Gelb mit dunkler Schrift; eignet sich als Vorschaubild der Library |
| Farben · Hell, Farben · Dunkel | alle semantischen Farben in Gruppen mit Name, CSS-Name und Beschreibung; derselbe Aufbau, einmal mit Modus Light, einmal mit Modus Dark der Sammlung „Cranach Semantic“ |
| Grundwerte | Paletten, Schriftgrößen, -familien und -stärken, Abstände, fließende Abstände je Modus von „Cranach Responsive“, Radien, Rahmenstärken, Breiten, Textstile und Schatten mit den Stilen der Library; am Ende, was noch fehlt |
| Komponenten | je Grundbaustein einmal eine kurze Erläuterung (wofür, was im Code dazugehört), darunter seine Varianten und Zustände als Instanzen in zwei Feldern nebeneinander – links mit Modus Light, rechts mit Modus Dark; unter jedem Beispiel der Wert der Eigenschaft in Figma in Code-Schrift (IBM Plex Mono, xs, gedämpft; Auswahl Volker aus fünf Varianten) (Schritt 32) |

- **An Variablen und Stile gebunden:** Flächen, Konturen, Schriftgrößen, -familien und -stärken, Balkenbreiten, Radien und Rahmenstärken; die Beispiele der Textstile und Schatten nutzen die Stile selbst. Ändert der Sync einen Wert, zeigt die Seite ihn ohne weiteres Zutun. Geprüft am 23.11.2026: 705 Bindungen, keine feste Farbe.
- **Nicht im Sync:** Die Seite wurde einmalig über `use_figma` gebaut. Neue oder umbenannte Variablen und Stile erscheinen dort nicht von selbst; nach einem Sync, der Variablen anlegt, die Seite ergänzen (Claude bitten: „Übersicht in Figma ergänzen“).
- **Ohne Darstellung:** z-Ebenen, Breakpoints, Dauern, Deckkraft, Zeilenhöhen, `size/measure` und `size/page` – sie stehen nur zur Information in den Variablen.
- Stand und Version im Titel sind Text und werden bei einem Release von Hand angepasst.
- **Zeilenlänge:** Fließtexte laufen höchstens 65 Zeichen breit, wie `size.measure` (65ch: 65 × Breite der „0“, bei 16 px also 624 px, bei 14 px 546 px). In Auto-Layout über die größte Breite (max width) begrenzt, damit sie bei schmaleren Rahmen weiter umbrechen.

## Komponenten (ADR 0014)

Die Komponenten baut Claude über `use_figma` nach Vorlage aus `src/components/` und Storybook; sie sind nicht Teil des Sync-Skripts. Ändert sich eine Komponente im Code, die Figma-Komponente von Hand oder per Auftrag an Claude nachziehen.

- **Eine Seite je Zweck:** Icon, Aktion (Button), Formular (Checkbox, Suchfeld, Textfeld, Toggle), Inhalt (Accordion, Tabelle, Werk-Karte), Navigation (Skip-Link, Switcher), Rückmeldung (Loader, Meldung), mit Emoji vor dem Namen. Seitenliste: `📖 Übersicht`, Trennlinie (Seite „---“, von Figma als Divider dargestellt), Überschrift `KOMPONENTEN` (leere Seite mit kurzem Hinweis, nur zur Gliederung), darunter eingerückt `↳ 🔣 Icon`, `↳ 👆 Aktion`, `↳ 📝 Formular`, `↳ 🗂️ Inhalt`, `↳ 🧭 Navigation`, `↳ 🪧 Rückmeldung`. Neue Seiten bekommen ein Emoji, das die alphabetische Reihenfolge hält (Overlay z. B. 🪟). Die Emojis halten die alphabetische Reihenfolge im Assets-Panel; darin je Komponente ein Abschnitt (Section), benannt wie in Storybook und alphabetisch. Das Assets-Panel gruppiert Komponenten der eigenen Datei nur nach Seiten (Seitennamen alphabetisch) – Sections, Frames und Schrägstrich-Namen erzeugen dort keine Ordner (getestet 25.11.2026). Neue Komponenten kommen auf die passende Seite, bei Bedarf eine neue Seite (z. B. „Inhalt“ für Karte und Tabelle, „Overlay“ für Dialog und Seitenleiste).
- **Reihenfolge im Abschnitt „Komponenten“ der Übersicht** wie in Storybook: zuerst Icon (dort eine Grundlage), dann alphabetisch – Accordion, Button, Checkbox, Loader, Meldung, Skip-Link, Suchfeld, Switcher, Tabelle, Textfeld, Toggle, Werk-Karte. Komponenten und Eigenschaften heißen englisch wie im Code (`Button`, `Variant=Primary`, `State=Hover`), Beschreibungen sind deutsch und nennen das Markup.
- **Gebunden:** Flächen, Konturen, Textfarben, Innenabstände, Lücken, Radien und Rahmenstärken an Variablen, Texte an die Textstile `body/default` und `body/small`. Dadurch zeigen Instanzen in einem Rahmen mit Modus Dark der Sammlung „Cranach Semantic“ das dunkle Theme.
- **Zustände als Varianten:** Default, Hover, Focus, Disabled, je nach Komponente auch Invalid und Read-only. Der Fokusring ist eine eigene Ebene „Focus ring“ – Rahmen in `color/focus/ring`, Stärke `focus/ring-width`, 2 px Abstand wie `outline-offset`.
- **Icons** über die Icon-Font wie im Code (ADR 0012): je Icon aus `icons/icons.json` ein Komponentenset `Icon/<Name>` mit `Style` Outlined/Filled (Filled über die FILL-Achse der Schrift); die Ligatur zeigt das Symbol. Button und Switcher item haben die Eigenschaft `Icon` (Instance Swap) mit allen Icons als bevorzugten Werten – Figma zeigt sie zur Auswahl mit Vorschau, niemand muss Namen eintippen. Kommt ein Icon in `icons/icons.json` dazu, in Figma ein Set `Icon/<Name>` ergänzen und in die bevorzugten Werte aufnehmen (Claude bitten: „Icon in Figma ergänzen“).
- **Deckkraft „Disabled“** an `opacity/medium` gebunden; Figma liest sie in Prozent, der Sync rechnet um (Abschnitt „Was das Skript macht“).
- **Figma zeigt die beabsichtigte Gestaltung** (Entscheidung Volker, 25.11.2026): Maße und Farben wie in Tokens und CSS, abgeglichen mit Storybook im Browser. Ungewollte Abweichungen des Browsers werden im CSS behoben, nicht in Figma nachgebaut; reine Darstellungsdetails einzelner Browser (etwa wie gestrichelte Linien gezeichnet werden) bildet Figma nur ungefähr ab.
- **Steuerelement neben einer Beschriftung** (Box der Checkbox, Schiene des Toggles) liegt in einer Ebene „Control“ von einer Textzeile Höhe (22 px), die Zeile ist oben ausgerichtet und mindestens `font/size/xl` hoch – wie im CSS bleibt es bei mehrzeiliger Beschriftung an der ersten Zeile.
- **Texte** binden Familie, Stärke und Größe an `font/*`.
- **Asset-Vorschau:** Figma richtet die Vorschau unter Assets am sichtbaren Rand aus. Ragt der Fokusring nur auf einer Seite über (z. B. Input im Suchfeld), springt der Inhalt dort beim Wechsel auf Focus um 4 px; auf der Arbeitsfläche und in Instanzen nicht. Bleibt so (Entscheidung Volker, 26.11.2026) – ein Fix ginge nur mit einem knapp sichtbaren Ring in allen Zuständen.
- **Fest statt gebunden:** das Strichmuster bei Read-only (3 px Strich, 2 px Lücke, ungefähr wie Chrome), Mindestmaße (42 px Höhe bei Button, Feld und Switcher), die Höhe der Ebene „Control“ (22 px), Summen ohne eigenes Token (Karte als Zeile rechts 44 px = `space/xl` + `space/s`) und die Form von Häkchen, Strich und Knopf.

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

Danach ergänzt (Entscheidung Volker): fließende Abstände als eigene Sammlung „Cranach Responsive“ mit den Modi Mobile 375, Tablet 768 und Desktop 1440. Die drei Text-Variablen `space/fluid/*` aus den Primitives wurden in Figma einmalig von Hand entfernt; der Kontrolllauf meldet `0 angelegt, 0 geändert, 121 unverändert, 0 nicht mehr in den Tokens`.

Umbenennung (30.10.2026, ADR 0019): `color/background/muted` wurde in Figma vor dem Sync von Hand in `color/background/medium` umbenannt, damit Verknüpfungen in Entwürfen erhalten bleiben. Der Kontrolllauf übernahm Beschreibung und CSS-Name: `0 angelegt, 1 geändert, 120 unverändert, 0 nicht mehr in den Tokens, 0 Fehler`. So auch bei künftigen Umbenennungen vorgehen: erst in Figma umbenennen, dann synchronisieren.

## Prüfung am 23.11.2026

Abgleich nur lesend (siehe „Nur prüfen, ohne zu schreiben“): `0 fehlen, 0 abweichend, 138 gleich, 0 nicht mehr in den Tokens, 0 Fehler`. Die Roadmap nannte nach dem Sync vom 12.11.2026 noch 137 Variablen; `size/term` kam danach mit der Tabellenvariante `--details` dazu und ist in Figma, der Sync dafür war nicht vermerkt. Den genauen Zeitpunkt zeigt nur der Versionsverlauf der Figma-Datei. Danach die Seite „Übersicht“ angelegt; die leere „Page 1“ heißt jetzt so.

## Text- und Effektstile am 23.11.2026

Erster Lauf mit Stilen: `11 angelegt, 0 geändert, 138 unverändert, 0 nicht mehr in den Tokens, 0 Fehler` – 8 Textstile, 3 Effektstile. Kontrolle nur lesend: Schrift, Schnitt, Größe, Zeilenhöhe in Prozent, Bindungen an Größe, Stärke und Familie sowie Schatten mit gebundener Farbe stimmen bei allen 11 Stilen; ein zweiter Lauf ändert nichts. Das Skript ist damit rund 41 KB groß (Grenze von `use_figma`: 50.000 Zeichen). Auf der Seite „Übersicht“ die Abschnitte „Textstile“ und „Schatten“ ergänzt.

## Umzug der Rollen-Tokens am 25.11.2026 (ADR 0022)

`size/*` und `focus/ring-*` stehen jetzt in `tokens/semantic/dimension.json` und damit in Figma in „Cranach Semantic“. Figma kann Variablen nicht zwischen Sammlungen verschieben: Der Sync legt sie dort neu an und meldet die 7 alten in „Cranach Primitives“ als „nicht mehr in den Tokens“. Vor dem Löschen der alten Variablen werden gebundene Ebenen auf die neuen umgestellt (auf der Seite „Übersicht“: Breiten und Fokusring).

Ausgeführt am 25.11.2026: Sync `7 angelegt, 0 geändert, 142 unverändert, 7 nicht mehr in den Tokens, 0 Fehler` (unverändert sind 131 Variablen und die 11 Stile aus Schritt 30). Auf der Seite „Übersicht“ 7 Bindungen umgestellt (drei Breiten, vier Konturstärken des Fokusrings). Danach die 7 alten Variablen in „Cranach Primitives“ gelöscht (Freigabe Volker). Stand: Primitives 97, Semantic 38, Responsive 3 – zusammen 138; keine Bindung zeigt ins Leere.

## Grundbausteine am 25.11.2026 (Schritt 32)

Neue Seiten Icon, Aktion, Formular und Navigation mit je einem Abschnitt pro Komponente (zuerst eine Seite je Komponente, dann alles auf einer Seite „Komponenten“; weil das Assets-Panel nur nach Seiten gruppiert, auf Wunsch von Volker eine Seite je Zweck) und Komponenten bzw. Sets (59 Icon-Sets mit je 2, Button 24, Input 12, Checkbox 12, Toggle 8, Switcher item 8 Varianten; dazu Field, Search, Switcher). Kontrolle nur lesend: 236 Farben in Komponenten und Instanz-Overrides, keine ohne Variable. Nach dem Sync mit Deckkraft in Prozent die 15 Disabled-Varianten an `opacity/medium` gebunden (vorher fest 60 %). Seite „Übersicht“: Abschnitt „Komponenten“ hell und dunkel, nach Durchsicht von Volker mit größeren Abständen, Erläuterung einmal je Komponente und allen Zuständen (z. B. Button: Default, Hover, Focus, Disabled je Variante); der Hinweis „Noch nicht in Figma“ nennt jetzt die zehn fehlenden Komponenten. Danach auf Wunsch von Volker die Icon-Auswahl umgestellt: statt einer Komponente „Icon“ mit Texteingabe 59 Sets `Icon/<Name>` und die Eigenschaft `Icon` (Instance Swap) in Button und Switcher item; die alte Komponente gelöscht, nachdem keine Instanz mehr darauf zeigte. Abschnitt „Icon“ der Übersicht mit allen 59 Icons und ihren Namen. Library weiterhin nicht veröffentlicht.

## Zweites Paket am 25.11.2026 (Schritt 34)

Neue Seiten `↳ 🗂️ Inhalt` und `↳ 🪧 Rückmeldung` (🪧 statt 💬, damit die Seiten im Assets-Panel alphabetisch bleiben). Komponenten nach Vorlage aus `src/components/`:

- **Meldung** (`Message`): `Type` Info/Success/Danger × `Toast` (mit Schatten `shadow/m`, 384 px breit wie `.cda-toast-region`), 6 Varianten; `Title`, `Text`, `Show title`, `Show close`. Fläche und Rand aus `color/feedback/*`, links 3 px (`border-width/l`), Symbol `info`/`check_circle`/`error`. Der Schließen-Button ragt wie im CSS (Rand −8 px) in den Innenabstand.
- **Loader:** `Spinner` (Kreisbogen mit Lücke oben, 24 px, Textfarbe), `Loader` (Schleier in der Hintergrundfarbe mit `opacity/medium`, Panel mit Spinner, Text und `shadow/m` mittig), `Skeleton` (`Type` Text/Block in `background/medium`).
- **Accordion:** `Accordion item` (`Open` × `State` Default/Hover/Focus, 6 Varianten; `Title`, `Text`) und `Accordion` mit drei Einträgen. Linie oben `border/default`, Pfeil gedämpft, offen `expand_less`.
- **Skip-Link** (`Skip link`): `State` Focus/Hover – ohne Fokus ist er im Code unsichtbar, deshalb nur die sichtbaren Zustände.

Kontrolle: 105 Farben, keine ohne Variable. Abgleich mit Storybook im Browser (auch die Stories „Mit Titel“ und „Toast“, dort per Klick ausgelöst): Maße, Abstände, Farben, Schatten und Schnitte gleich – Meldung 50/52/74 px, Toast 384 px breit (zuerst 480 px angelegt, korrigiert), Lade-Panel 264 × 50 px, Accordion-Eintrag 41/79 px, Skip-Link 185 × 40 px. Übersicht um die vier Abschnitte ergänzt, hell und dunkel; „Noch nicht in Figma“ nennt jetzt Werk-Karte, Tabelle, Header, Footer, Dialog, Seitenleiste.

## Drittes Paket am 25.11.2026 (Schritt 35)

Auf der Seite `↳ 🗂️ Inhalt`:

- **Werk-Karte** (`Card`): `Layout` Tile/Row × `State` Default/Hover/Focus × `Favorite`, 12 Varianten; `Title`, `Subtitle`, `Text`, `Show subtitle`, `Show text`, `Show placeholder`. Kachel 256 px breit (`size/card/min`), Bild quadratisch und mit der Breite wachsend; Zeile mit Bild 128 px (`size/card/min-small`) und Innenabstand rechts für den Merken-Button. Hover/Focus: Bildfläche `background/strong`, gelbe Linie (Kachel oben, Zeile unten), Merken-Button sichtbar; Focus mit Ring um die ganze Karte. Merken-Button 32 px rund, gemerkt gelb mit `remove`. Dazu `Card small` (nur Bild, 128 px). Das Bild ist ein Platzhalter wie in Storybook (feste Farben, nur Platzhalter); echte Abbildungen als Bildfüllung (Fit) auf die Ebene „Bild“ und „Show placeholder“ aus.
- **Tabelle:** `Table cell` (`Part` Head/Body/Term × `Align` Start/End × `Density` Default/Compact, 12 Varianten; `Text`, `Show sort`, `Sort icon` per Instance Swap mit `unfold_more`, `arrow_upward`, `arrow_downward`), daraus `Table` (`Style` Lines/Striped × `Density`) mit Beschriftung, Kopf und drei Zeilen sowie `Table details` (Begriff in `size/term`, Wert). Bei Lines ohne Innenabstand am Rand, bei Striped mit; jede zweite Zeile `background/subtle`.

Abgleich mit Storybook im Browser: Karte (Inhalt 95,6 px hoch, Abstände 12/4, Zeile 8/44/8/16, Linie 2 px, Merken-Button 32 px bei 8/8), Tabelle (Kopf SemiBold mit 2 px `border/strong`, Zellen 8/12 bzw. kompakt 4/8, Zeilenlinie 1 px `border/default`, Rand 0 bzw. 12 px, Zebra `#f7f7f7`, Sortier-Symbol 20 px mit 4 px Abstand, Begriff 192 px gedämpft) – gleich. Ein Spaltenkopf mit Sortier-Button war im Browser rund 4 px höher (Button auf der Grundlinie); das war ungewollt und wird im CSS behoben (Roadmap-Schritt 36, `fix/tabelle-sortierkopf`). Figma zeigt die beabsichtigte Gestaltung: Kopf einheitlich 40 px (kompakt 32 px), mit und ohne Sortier-Symbol. Kontrolle: 266 Farben, keine ohne Variable (außer dem Platzhalterbild). Übersicht ergänzt; „Noch nicht in Figma“ nennt jetzt Header, Footer, Dialog, Seitenleiste.

## Abgleich und Freigabe am 26.11.2026 (Schritte 32 und 35)

Vor der Freigabe auf Wunsch von Volker alle Komponenten der Schritte 32 und 35 erneut mit `src/components/` und Storybook im Browser verglichen (Maße, Abstände, Farben, Zustände, Icons). Ergebnis: gleich bis auf Bruchteile eines Pixels; einzige sichtbare Abweichung ist der Spaltenkopf mit Sortier-Button (Schritt 36). Danach bereinigt: 49 Textebenen an `font/family/sans` gebunden (Field-Beschriftung auch an `font/weight/medium`; betrifft auch Meldung und Skip-Link aus Schritt 34), Checkbox und Toggle mit Ebene „Control“ an der ersten Textzeile (Box 1 px unter, Schiene 1 px über der Beschriftung wie im Browser), unterer Innenabstand der Karte an `space/m` (Kachel) bzw. `space/s` (Zeile). Die 30 Beispiele auf der Übersicht geprüft, Overrides erhalten. Haltepunkte 32 und 35 von Volker freigegeben. Library weiterhin nicht veröffentlicht.
