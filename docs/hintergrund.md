# Hintergrund zu den Entscheidungen

Erläuterungen aus der Konzeptphase (Oktober 2026), die in den ADRs nur knapp stehen. Die Entscheidungen selbst stehen in [`docs/adr/`](adr/README.md).

---

## 1. Cascade Layers in Tailwind-Projekten (ADR 0003)

Tailwind 4 legt die Layer `theme`, `base`, `components`, `utilities` an; das Designsystem bringt `cda` mit. **Die später eingereihte Ebene gewinnt**, unabhängig von der Spezifität.

Beispiel aus einem Tailwind-Projekt:

```html
<button class="cda-button px-8">Merken</button>
```

- `.cda-button` (Layer `cda`) setzt `padding-inline: 16px`.
- `px-8` (Layer `utilities`) setzt `padding-inline: 2rem`.

Gewünscht ist, dass `px-8` gewinnt – Komponenten sollen im Einzelfall mit Tailwind anpassbar sein. Dafür gilt:

```
theme → base → cda → components → utilities   (rechts gewinnt)
```

- `cda` **nach** `base`: Grundstyles des Designsystems (Typografie, unterstrichene Links, Fokus) gewinnen gegen Tailwinds Reset „Preflight“.
- `cda` **vor** `utilities`: Tailwind-Klassen im Markup gewinnen gegen Designsystem-Komponenten.

**Die Reihenfolge wird beim ersten Vorkommen eines Layer-Namens festgelegt.** Deshalb muss sie vor `@import "tailwindcss"` stehen:

```css
/* falsch – "cda" taucht erst nach Tailwind auf und landet hinter "utilities" */
@import "tailwindcss";
@import "@lucascranach/design-system/tailwind.css";

/* richtig */
@layer theme, base, cda, components, utilities;
@import "tailwindcss";
@import "@lucascranach/design-system/tailwind.css";
```

CSS ohne Layer gewinnt weiterhin gegen alles – auch in Tailwind-Projekten.

---

## 2. Auslieferung: warum npmjs.com (ADR 0005 → ADR 0016)

Abgewogene Varianten für Projekte mit Build:

| Variante | Bewertung |
|---|---|
| npm-Tarball auf eigenem Server | keine Versionsbereiche, kein Dependabot |
| eigene Registry (Verdaccio) | weiterer Dienst zu betreiben |
| GitHub Packages | auch Lesen braucht Tokens in jedem Projekt |
| Git-Submodule | vergessene Updates, CI/Docker/rsync-Konfiguration, Merge-Konflikte am Zeiger |
| npm-Git-Abhängigkeit (`github:…#semver:`) | gebaute Dateien müssen in Git liegen → eigener Release-Branch oder `dist/` in Release-Commits; Konflikt mit den Tags von release-please |
| **npmjs.com (gewählt)** | Standard-Ablauf, Versionsbereiche, Dependabot; `dist/` bleibt aus Git heraus |

Wichtig ist die Unterscheidung **Build-Zeit vs. Laufzeit**: npm wird nur beim Installieren bzw. Bauen genutzt. Die Projekte bündeln die Dateien und liefern sie von lucascranach.org aus – Besucher kontaktieren npm nie. Externe CDNs (jsDelivr, unpkg) scheiden aus, weil ein Abruf die IP-Adresse der Besucher an Dritte überträgt (vergleichbar mit dem Google-Fonts-Urteil des LG München).

Verworfene Detail-Überlegung: Bei der Git-Abhängigkeit hätte release-please sein Tag auf `main` gesetzt, wo `dist/` fehlt; `npm i …#semver:` hätte dann einen Stand ohne gebaute Dateien installiert. Mit npmjs.com entfällt das Problem.

---

## 3. Figma: Vergleich der MCP-Server (ADR 0014)

| | Offizieller Figma-MCP-Server (remote) | Framelink (glips/figma-context-mcp) |
|---|---|---|
| Richtung | Lesen **und** Schreiben | nur Lesen |
| Schreiben | `use_figma`: Frames, Komponenten, Varianten, Variables, Auto-Layout über die Plugin-API | – |
| Variables lesen | `get_variable_defs`, `search_design_system` | nur aufgelöste Werte (Variables-REST-API ist Enterprise-only) |
| Zugang | OAuth, für alle Pläne; Schreiben braucht Full-Seat und Bearbeitungsrechte | persönlicher Access-Token |
| Limits Education | wie Professional: 200 Lese-Aufrufe/Tag, 10/Minute | REST-Limits |

Bekannte Grenzen von `use_figma` laut Figma-Doku (Stand 10/2026): 20 KB Antwort pro Aufruf, keine Bilder, „Custom Fonts“ noch nicht unterstützt.

Warum ein festes Sync-Skript statt freier KI-Interpretation: Ein Abgleich, den die KI jedes Mal neu interpretiert, ist nicht reproduzierbar. Das generierte `figma-sync.js` ist idempotent (mehrfach ausführbar ohne Doppelungen) und kann über `use_figma` oder später als eigenes Figma-Plugin ausgeführt werden.

Code Connect ist nach bisherigem Kenntnisstand erst ab dem Organization-Plan verfügbar und daher nicht eingeplant.

Quellen: [Leitfaden zum Figma-MCP-Server](https://help.figma.com/hc/de/articles/32132100833559-Leitfaden-zum-Figma-MCP-Server), [Write to canvas](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas), [Tools and prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/), [Rate limits & access](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/), [Variables REST API](https://developers.figma.com/docs/rest-api/variables), [Forum: Education-Limits](https://forum.figma.com/report-a-problem-6/mcp-limit-education-plan-55485), [Framelink](https://github.com/glips/figma-context-mcp).

---

## 4. Icons (ADR 0012)

Abgewogene Auslieferungsarten:

| Technik | Vorteile | Nachteile |
|---|---|---|
| **Icon-Font (gewählt)** | einfach, ersetzt das heutige `.icon`-Muster fast 1:1 | ohne Subset riesig; Ligatur-Text blitzt ohne `display=block` auf; Screenreader lesen das Wort ohne `aria-hidden` |
| externes SVG-Sprite | gecacht, `currentColor` | nur gleiche Domain; Helfer je Stack; lädt alle Icons |
| Inline-SVG | volle Kontrolle | Markup-Ballast, nicht cachebar, Helfer je Stack |
| CSS-Maske | reine CSS-Klasse | einfarbig, jedes Icon vergrößert die CSS-Datei |

Laut Google lädt Material Symbols ohne `icon_names` alle über 3.800 Icons (295 KB), mit allen variablen Achsen sogar 7,9 MB; mit Subset wenige KB. Die Namen in `icon_names` müssen alphabetisch sortiert sein.

Ein lokales Zuschneiden mit fonttools wurde verworfen: Weil Material Symbols über Ligaturen arbeitet, behält `pyftsubset` sonst alle Ligaturen, deren Buchstaben in der Schrift bleiben – also praktisch die ganze Font. Es bräuchte ein eigenes Skript zum Ausdünnen der Ligatur-Tabelle. Zugunsten eines einfachen Setups gilt ausschließlich der `icon_names`-Weg; der Icon-Build braucht deshalb Zugriff auf `fonts.googleapis.com` und `fonts.gstatic.com`.

Quelle: [Material Symbols Guide](https://developers.google.com/fonts/docs/material_symbols?hl=de).

---

## 5. z-Ebenen: Vergleich etablierter Systeme (ADR 0011)

| System | Reihenfolge (unten → oben) |
|---|---|
| Chakra UI | hide −1, base 0, docked 10, dropdown 1000, sticky 1100, banner 1200, overlay 1300, modal 1400, popover 1500, skipNav 1600, toast 1700, tooltip 1800 |
| Atlassian | 100, navigation 200, inline dialog 300, popup 400, blanket 500, modal 510, flag 600, spotlight 700, tooltip 800 |
| Material UI | mobile stepper 1000, fab 1050, app bar 1100, drawer 1200, modal 1300, snackbar 1400, tooltip 1500 |
| Bootstrap 5 (aus Erfahrungswissen) | dropdown 1000, sticky 1020, fixed 1030, offcanvas 1040/1045, modal 1050/1055, popover 1070, tooltip 1080, toast 1090 |
| **Bolt (gewählt)** | backgroundBottom −20 … modal 200 in 20er-Schritten |

Gemeinsamkeiten: Benennung nach Rolle, Abdunkelung knapp unter dem Modal, Skip-Link ganz oben. Bolt passt zur bisherigen Cranach-Logik „Hintergrund → Inhalt → Navigation“.

Quellen: `@bolt/core-v3.x@5.8.0` (`_settings-z-index.scss`, aus dem npm-Paket gelesen), [Chakra UI](https://chakra-ui.com/docs/theming/z-index), [Atlassian](https://atlassian.design/foundations/elevation), [Material UI](https://mui.com/material-ui/customization/z-index/).

---

## 6. Kontraste der Token-Farben (ADR 0008)

Die Kontrastprüfung (`npm run check:contrast`) prüft jede semantische Text/Hintergrund-Paarung in beiden Themes: Text mindestens 4,5:1, Rahmen von Bedienelementen und Fokus mindestens 3:1. Ausgewählte Werte:

| Paar | Hell | Dunkel |
|---|---|---|
| Text auf Hintergrund | 21:1 | 15,84:1 |
| Nebentext (muted) | 5,74:1 | 8,55:1 |
| Akzent-Text (Ocker bzw. Gelb) | 4,95:1 | 10,12:1 |
| Schwarz auf Gelb | 11,99:1 | 11,99:1 |
| Fokus-Ring | 4,95:1 | 10,12:1 |
