# Bestandsaufnahme der Cranach-Frontends

Stand: 15.10.2026 (Ordner `~/projects/lucascranach`, nach Aktualisierung der Projekte am selben Tag). Alle Projekte wurden **nur gelesen**. Pfade sind relativ zum jeweiligen Projektordner. Kontrastwerte nach WCAG-Formel berechnet.

Diese Datei ist die Grundlage für Icons, Komponenten und die Migrationstabellen. Die daraus abgeleiteten Entscheidungen stehen in [`docs/adr/`](adr/README.md).

---

## 1. Projekte mit Frontend

| Projekt | Zweck | Sichtbarkeit | Letzter Commit | Deployment |
|---|---|---|---|---|
| cranach-search | Werk-, Literatur- und Archivaliensuche (React 17, TS, Vite 6, Sass, MobX) | öffentlich | 24.09.2026 | lucascranach.org/{de,en}/search/ |
| cranach-artefacts | Eleventy-Detailseiten zu Werken, Grafiken, Literatur, Archivalien | öffentlich + /intern | 06.10.2026 | lucascranach.org/de/&lt;ID&gt;/ |
| cranach-map | Karte mit Standorten (React 18, Mapbox, three.js, styled-components) | öffentlich | 24.09.2026 | Vite-Base `/map` |
| cranach-timeline | 3D-Zeitleiste (React 19, TS 5.9, Vite 7, react-three-fiber, WebGPU, Jotai, Tailwind 4, shadcn/ui, styled-components) | öffentlich | 05.05.2026 | `/{de,en}/timeline` |
| cranach-compare | Bildvergleich und Sammlung (Vanilla JS, Reef, OpenSeadragon) | öffentlich | 06.05.2026 | lucascranach.org/compare/ |
| cranach-image-metadata | Tabelle der EXIF/IPTC-Daten (Tabulator), Qualitätskontrolle | intern | 13.10.2026 | /intern |
| cranach-image-tools | Bild-Browser und Verarbeitung in PHP | intern | 30.12.2024 | lucascranach.org/admin/browser.php |
| cda-orga | Jekyll-Blog „CDA Intern“ mit Decap CMS | intern | 03.02.2026 | /intern/blog |
| cranach-kirby | Prototyp einer neuen Website (Kirby, Vite 7, Pico CSS) | geplant öffentlich | 05.08.2025 | – |
| cranach-grafiken-gatsby | Gatsby-Prototyp mit Storybook 6.1 (29 Stories) | Archiv | 07.11.2021 | gh-pages |
| cranach-api-documentation | per `openapi-generator -g html2` erzeugte API-Doku | öffentlich | 14.06.2024 | – |

- Alle Remotes: `git@github.com:lucascranach/<repo>.git`.
- Ohne Frontend: cranach-api, cranach-docker, cranach-elk, data-proxy, importer, cranach-texture-atlas, cranach-tools, cranach-metadata-service, lido-files.
- **cranach-kirby** ist ein Fork einer Band-Website: `package.json` heißt `km-website`, `content/site.de.txt` enthält „Punk Life Balance“, Blueprints wie `musikant.yml`. Nur `content/1_home` hat CDA-Text. Die Tokens `--km-blau`, `--km-orange`, `--km-pink` sind kein Cranach-Design.
- **cranach-timeline**: `src/components/layout/MobileBlocker.tsx` sperrt unter 768 px. Deploy über `rsync-prod.sh` (nicht im Repo).

### Früherer Anlauf: `lucascranach/styleguide`
- Öffentliches Repo, Jekyll Living Style Guide (Vorlage von Matthew Elsom), letzter Commit 28.05.2021 (Christian Noss, „Update variables.css“).
- Inhalt: `shared/styles/{variables,main,components,icons,fonts,reset,artefact-card}.css`, IBM-Plex-Fonts, Material-Icons-Font, OpenSeadragon 2.4.2, json-viewer.
- **cranach-compare lädt `https://lucascranach.github.io/styleguide/shared/styles/main.css` und das Favicon live.** Deshalb darf das Repo erst nach der Umstellung von compare archiviert werden (ADR 0001).

### Nebenfund auf npmjs.com
- Unscoped Paket `cranach-design-react-pattern` 1.0.0 (2021, Beschreibung „React Pattern of Cranach Design“, Maintainer `dennys`). Zusammenhang mit dem CDA unbekannt; kollidiert nicht mit `@lucascranach/design-system`.

---

## 2. Styling-Ansatz und Token-Dateien

| Projekt | Ansatz | Token-Datei |
|---|---|---|
| search | Sass, ITCSS-artig (`000-abstracts`, `010-base`), eine `.scss` pro Komponente, Stylelint 16 | `src/style/000-abstracts/variables.scss` |
| artefacts | Sass (abstracts/base/components/composition/utils) + `:root`-Custom-Properties für responsive Abstände und Overlay | `src/assets/styles/scss/abstracts/variables.scss` |
| cda-orga | Sass, gleiche Struktur wie artefacts | `assets/_scss/abstracts/variables.scss` |
| gatsby | Sass, Atomic Design | `src/styles/000-abstracts/variables.scss` |
| map | styled-components mit JS-Tokens + etwas CSS | `src/base/variables.jsx` (1:1-Port der search-Variablen) |
| timeline | Tailwind 4.1 (`@tailwindcss/vite`, Theme per `@theme inline`), shadcn/ui („new-york“, „neutral“, lucide), styled-components 6 | `src/styles/index.css` (shadcn-Standardwerte in oklch), `src/styles/globals.css` (Canvas-/Sidebar-Tokens) |
| image-metadata | Plain CSS mit `:root` („Design based on cranach-search“) | `style.css` |
| image-tools | Plain CSS mit `:root` (1:1 aus gatsby + `--radius-s: 4px`) | `styles/variables.css` |
| compare | Plain CSS, Tokens aus dem externen Styleguide | keine lokal |
| kirby | Plain CSS mit Custom Properties, fließende Typo (Utopia, `clamp()`), Pico Classless | `assets/styles/global/variables.css` |

---

## 3. Design-Werte

### Farben
- Graustufen (search-Familie): `$medium` #666, `$dark` #444, `$darker` #222, `$darkest` #000, `$light` #b4b4b4, `$lighter` #f2f2f2, `$lightest` #fff.
- search zusätzlich: `$accent` #FEB701, `$decoration` #cc5800, `$error` #c00, `$darken*`/`$lighten*` als rgba.
- Schatten überall auf Basis `rgba(0,0,0,.4)`; search: `$shadow: 1px 1px $xxs`, `$shadow-s: 1px 1px $s`, `$shadow-m: 1px 1px $m`.
- `$border-stroke-weight` 2px, `-s` 1px, `-m` 3px; `$op-medium` 0,6, `$op-low` 0,3.
- timeline: shadcn-Standard in oklch (`--background` #fff, `--foreground` #0a0a0a, `--primary` #171717, `--radius` 10px), Canvas #18181a / hell #f5f5f5, Sidebar-Primär #1447e6, #FEB701 elfmal hartkodiert, Hover #ffcc33.

### Typografie
- IBM Plex Sans überall, IBM Plex Mono für Code, self-hosted.
  - search und map: woff2 + ttf + otf unter `public/assets/fonts/IBMPlex-Sans/`.
  - artefacts und orga: nur TTF eingebunden.
  - timeline: woff2 byte-identisch mit search, **Standardgewichte**.
  - kirby: variable TTF `assets/fonts/IBM_Plex_Sans/IBMPlexSans-VariableFont_wdth,wght.ttf`.
- **Verschobenes Gewichts-Mapping** in search, artefacts, orga, gatsby, image-metadata: Datei *Light* als 200, *Regular* als 300, *Medium* als 400, *SemiBold* als 500, *Bold* als 600 (`$fw-light: 200`, `$fw-regular: 300`, `$fw-semibold: 400`, `$fw-bold: 600`).
- Grundgröße: search/artefacts/map/image-metadata `$bfs: 0.9rem` (14,4 px); orga/gatsby/image-tools 1rem; kirby `clamp(1rem … 1.25rem)`.
- Skala search (Fibonacci): bfs × 0,2 / 0,3 / 0,5 / 0,8 / 1,3 / 2,1 / 3,4 / 5,5. Skala artefacts/orga: bfs × 0,2 / 0,4 / 0,8 / 1 / 1,2 / 1,4 / 1,8 / 2,6.
- Zeilenhöhen search: 120 / 140 / 160 %.

### Weitere Werte
- Breakpoints: search 720/1024/1200 (nav)/1400/1700/2000/2300 (+999 hartkodiert); artefacts/orga 768/1024/1440/1800; kirby 40em/60em; image-metadata 1023; timeline Tailwind-Standard + Sperre unter 768.
- Radius: search 2px; artefacts 2/5px; image-tools 4px; kirby 4/2px; timeline 10px.
- z-Index Sass-Projekte: `$level-background` 0, `content` 10, `content-nav` 20, `section-nav` 30, `overall-nav` 40 (artefacts + `overlay` 100); search hartkodiert 100/101; kirby 10/100/1000/1001/100000; timeline 20/50/99999/999999.
- Transitions: `tr-fast` 0,2 s (search, map, image-metadata, kirby) vs. 0,3 s (artefacts, orga, gatsby, image-tools); `tr-medium` 0,5 s; `tr-slow` 0,8 s.
- Kacheln search: `$tile-xxs` 8em, `$tile-xs` 12em, `$tile-s` 16em.
- Responsive Custom Properties artefacts: `--responsive-padding-top/-right-left/-bottom(-inner)`, `--responsive-gap`, `--overlay-width/-height/-max-height`.

### Icons
- Material-Icons-Font per Ligatur, Klasse `.icon` mit Größen `i12`–`i48` in `abstracts/icons.scss`.
- artefacts/orga: MaterialIconsSharp; kirby: Material Icons Outlined 1.13.14; map: zusätzlich `react-icons`; timeline: lucide-react + react-icons (Material-Icons-Dateien liegen ungenutzt in `public/fonts`).
- artefacts: SVG-Sprite `src/assets/images/icon-sprite-2021.svg` für Dateitypen.
- compare: PNG-Buttons von OpenSeadragon.
- Logos: `cda-logo-{bw,ws,gw,yw/ys,light,cut}.svg`.

---

## 4. Wiederkehrende Komponenten (mit Pfaden)

**cranach-search** (`src/components/`)
- Navigation: `structure/interacting/navigation`, `secondary-navigation`
- Button: `base/interacting/btn`
- Textfeld/Suche: `base/interacting/text-input`, `structure/interacting/search`
- Filter: `base/interacting/category-filter`, `structure/interacting/tree-list`, `base/interacting/checkbox`, `dating-rangeslider` (noUiSlider), `toggle`
- Switcher (Sprache/Ansicht): `base/interacting/switcher`
- Karten/Ansichten: `structure/visualizing/artefact-card`, `artefact-line`, `artefact-table`, `artefact-overview`
- Pagination: `structure/interacting/search-result-navigation`
- Accordion: `structure/interacting/accordion`
- Loader: `base/visualizing/cloak`
- Merkliste: `my-cranach`; Logo: `base/visualizing/logo`

**cranach-artefacts** (Markup `src/_layouts/components/*.11ty.js`, Styles `scss/components`)
- Navigation mit Sprachwahl (`navigation.11ty.js`, `.switcher.lang-selector`, `data-component="base/interacting/switcher"`)
- `footer.scss`, `buttons.scss`, `artefact-card.scss`, `overlay.scss`, `details-summary.scss`, `notification.scss`, `tables.scss`
- `image-stripe` (Tooltip), `metadata-drawer`, `meta-data-form`
- Bildviewer `leporello-explore.scss` (OpenSeadragon); Lade-Spinner `.download-link--resized.is-loading`

**cranach-timeline**
- shadcn: `src/components/ui/{button,input,separator,sheet,sidebar,skeleton,tooltip}`
- eigene: `layout/{app-sidebar,ImageCard,YearColumn,MobileBlocker}`, `events/{EventPill,EventGroup,GroupLabel,GroupOutline}`, `timeline/{ZoomToggle,ThemeToggle,FallbackUI,ImagePrefetchIndicator,YearLabels,TimelineAxis}`
- Theme: `hooks/useThemeContext.tsx`, `.dark`/`.light` auf `<html>`

**Weitere**
- gatsby: atoms switcher, toggler, closer, zoom-image, link, logo, definition-list; molecules navigation, artefact-card, artefact-line, literature-table, restoration-surveys; organisms viewer
- cda-orga: `_includes/{sidebar,footer,pattern_block}.html`, Komponenten buttons, teaser, sidebar
- kirby: `site/snippets/{header,footer,breadcrumb,social}.php`, `blocks/{gallery,hero,image,video}.php`, PhotoSwipe
- map: `src/components/layout/{Nav,Card,Results,ResultsGroup}.jsx` (Nav mit Sprach- und Dark-Mode-Umschalter)
- compare: `public/styles/components.css`; image-tools: `styles/components.css`, `json-viewer.css`

---

## 5. Kopierte Dateien und Abstammung

- Kein gemeinsames Paket; alles kopiert und auseinandergelaufen (md5 geprüft).
- Identisch: `abstracts/resets.scss` (search, artefacts, orga); `icons.scss`, `main.scss` (artefacts, orga); `_normalize.scss` (orga, artefacts, gatsby); `fonts.scss` search = `cranach-map/src/styles/fonts.css`; `favicon.svg` (search, artefacts, map, timeline); `cda-logo-bw.svg` in 5 Projekten.
- `variables.scss` in 4 Varianten: search (→ map, image-metadata), artefacts (→ orga), gatsby (→ image-tools).
- IBM-Plex-woff2 in mindestens drei Builds.

---

## 6. Kern-Tokens im Vergleich

| Projekt | Akzent | 2. Akzent / Interaktion | Text / Hintergrund | Grundgröße | Gewichte | Breakpoints | Radius | tr-fast |
|---|---|---|---|---|---|---|---|---|
| search | #FEB701 | #cc5800 | #000 / #fff | 0.9rem | verschoben | 720…2300 | 2px | 0,2 s |
| artefacts | #fc0, #e8a60c | #cc5800 | #000 / #fff | 0.9rem | verschoben | 768/1024/1440/1800 | 2/5px | 0,3 s |
| cda-orga | #fc0, #e8a60c | – | #000 / #fff | 1rem | verschoben | 768/1024/1440/1800 | 2px | 0,3 s |
| map | #FEB701 (Layer #fc0/#e8a60c/#b5830f) | #cc5800 | #000/#fff, dunkel #444 | 0.9rem | verschoben | 720…2300 (JS) | – | 0,2 s |
| image-metadata | #FEB701 | #cc5800 | #444 / #fff | 0.9rem | verschoben | 1023 | 2px | 0,2 s |
| image-tools | #FFCC00 | – | – | 1rem | ohne @font-face | 720…2300 | 4px | 0,3 s |
| gatsby (2021) | #FFCC00 | – | #fff auf #000 | 1rem | verschoben | 720…2300 | – | 0,3 s |
| kirby | #ffbb1c | #5d8dfd, #fc8e77 | #333 / #f7f7f7 | clamp 16–20px | Standard | 640/960 | 4/2px | 0,2 s |
| timeline | #FEB701 (hartkodiert), Hover #ffcc33 | #1447e6; `--primary` #171717 | #0a0a0a/#fff; Canvas #18181a | 16px (Tailwind) | Standard | Tailwind | 10px | 0,2/0,3 s |
| compare | externer Styleguide | – | – | – | – | – | – | – |

---

## 7. Inkonsistenzen

1. Akzent-Gelb in 6–7 Varianten: #FEB701, #fc0/#FFCC00, #e8a60c, #b5830f, #cb9201 (artefacts hartkodiert), #ffbb1c, #ffcc33.
2. Gleiche Token-Namen, andere Werte: kirby `--dark` #666 (search #444), `--darker` #333 (#222), `--light` #ccc (#b4b4b4), `--lighter` #e6e6e6 (#f2f2f2); `$darken-medium` 0,1 vs. 0,3; timeline `--accent`/`--primary` grau statt gelb.
3. Breakpoints 720/1400/1700 vs. 768/1440/1800 vs. 640/960 vs. 1023 vs. Tailwind.
4. Abstands-Skala: gleiche Namen, andere Faktoren (`$m` = bfs × 1,3 vs. × 1).
5. Grundgröße 14,4 px vs. 16 px vs. fließend.
6. Gewichts-Mapping verschoben vs. Standard (kirby, timeline).
7. Buttons: search `.btn` gelb mit weißer Schrift, Hover per `margin-left`; artefacts `.button` #f2f2f2, Hover #b4b4b4, Icon dreht sich; orga `.button` rgba(0,0,0,.1), Hover #e8a60c mit weißer Schrift; BEM-Namen uneinheitlich.
8. Links: search `a { color: #fff }`; artefacts schwarz mit gelber Unterstreichung und gelbem Hover.
9. Transitions 0,2 vs. 0,3 s; Radius 2/4/5/10 px.
10. Icons: drei Material-Stile, lucide, react-icons, teils über Google Fonts.
11. Drei Dark-Paletten (#18181a, #444, #000).
12. Drittes Styling-Paradigma (Tailwind/shadcn), in timeline zusätzlich mit styled-components gemischt.
13. Loader: search `cloak`, artefacts Download-Spinner, timeline `skeleton`/`ImagePrefetchIndicator`.
14. Bildviewer dreifach: OpenSeadragon (artefacts, compare, gatsby), PhotoSwipe (kirby).

---

## 8. Bugs (Stand der Analyse)

- image-tools: `@import './fonts'` auf fehlende Datei; `--shadow: 1px 1px --xxs …` und `--lh-headlines: --lh-tight` ohne `var()`.
- kirby: `font-weight: 100 - 900` (richtig `100 900`); `--font-family-serif: ibmplex`; `var(--lh-normal)` undefiniert.
- `$inner-shadow: rgba(0,0,0,10)` (Alpha 10) in search, orga, gatsby, image-tools.
- search `fonts.scss`: Format-Tippfehler `.truetype`.
- artefacts: `cda-logo-ws.svg` byte-identisch mit `cda-logo-bw.svg`.
- timeline: `opacity: 0.8f;` in `App.tsx`; `--border: oklch(0% 0 0)` macht helle Rahmen schwarz; `--sidebar-*` in `:root` alle #18181a.

---

## 9. Barrierefreiheit (berechnet)

| Paar | Kontrast | Bewertung |
|---|---|---|
| Weiß auf #FEB701 (search `.btn`) | 1,75:1 | durchgefallen |
| Weiß auf #fc0 | 1,51:1 | durchgefallen |
| Weiß auf #e8a60c (orga Hover) | 2,12:1 | durchgefallen |
| #FEB701 als Text auf Weiß | 1,75:1 | durchgefallen |
| #b4b4b4 als Text auf Weiß | 2,07:1 | durchgefallen |
| kirby #5d8dfd auf #f7f7f7 | 2,93:1 | durchgefallen |
| #cc5800 auf Weiß | 4,23:1 | nur Großtext |
| #FEB701 auf #f5f5f5 (timeline hell) | 1,61:1 | durchgefallen |
| timeline Tick #999 auf #f5f5f5 | 2,61:1 | durchgefallen |
| timeline Pill #3a3a3a vor #18181a | 1,56:1 | kaum erkennbar |
| Schwarz auf #FEB701 | 11,99:1 | gut |

- `color: $accent` als Textfarbe: search 9×, artefacts 3×, orga 1×.
- `outline: none` in search (`text-input.scss`), artefacts (`meta-data-form.scss`), image-metadata, image-tools, kirby/photoswipe; `:focus-visible` nur in 2 Dateien.
- Fließtext in Plex Light bei 14,4 px ist dünn.
- timeline: Ereignisgruppen nur über Farbe unterschieden; Smartphones komplett gesperrt.

---

## 10. Referenz-Empfehlung (Grundlage der ADRs)

- **Werte aus cranach-search** (vollständigster, gepflegter Satz, bereits von map und image-metadata übernommen).
- **Komponenten und responsive Muster aus cranach-artefacts** (Overlay, Drawer, Tabellen, Footer, Sprachwahl, `--responsive-padding-*`).
- **Theme-Architektur aus cranach-timeline** (semantische Rollen, Hell/Dunkel über `.dark`), befüllt mit Cranach-Werten.
- **Technische Architektur von cranach-kirby** (reine Custom Properties, fließende Typo) als Vorbild, nicht seine Werte.
- gatsby nur als Herkunftsnachweis für image-tools.
