> **Archiv – wird nicht gepflegt.** Eingefrorene Kopie des Entscheidungsdokuments aus dem claude.ai-Projekt „Designsystem für Cranach Projekte“ (Grill-Me-Sitzung vom 15.10.2026, Stand 28.10.2026). Maßgeblich sind die ADRs in [`docs/adr/`](../adr/README.md); bei Abweichungen gelten sie. Die Fragen-Nummern (Q1 … Q31) verweisen auf diese Sitzung.

# Cranach Design System – Entscheidungen

## 1. Ausgangslage

Ausführlich in [`docs/bestandsaufnahme.md`](../bestandsaufnahme.md). Kurzfassung:
- Kein gemeinsames Paket; `variables.scss` in 4 Varianten.
- Früherer Anlauf `lucascranach/styleguide` (2021), von cranach-compare live eingebunden.
- cranach-kirby ist ein Fork einer Band-Website; seine Werte sind kein Cranach-Design.
- cranach-timeline: React 19, Tailwind 4, shadcn/ui, Dark Mode als Standard.
- Inkonsistenzen: Gelb in 6–7 Varianten, abweichende Breakpoints, Grundgrößen, Gewichts-Mappings, Button-Stile, Loader, Radien, Transitions, drei Dark-Paletten, gemischte Icon-Systeme.
- Barrierefreiheit: Weiß auf Gelb 1,75:1, Gelb als Textfarbe, `outline: none`, dünner Fließtext.

## 2. Rahmen

| # | Entscheidung |
|---|---|
| Q2 | Neues Repo ersetzt `lucascranach/styleguide`; das alte bleibt online, bis compare umgestellt ist, danach archivieren. |
| Q11 | Repo `lucascranach/cranach-design-system`, Name „Cranach Design System“, Präfix `cda`. |
| Q10 | Code (Tokens, Klassen) Englisch, Dokumentation Deutsch. |
| Q25 | Bestandsprojekte werden noch nicht verändert; Migrationsreihenfolge wird nur dokumentiert. |
| 16.10.2026 | Lizenz MIT, Copyright „Cranach Digital Archive“. |

### Rollen der Projekte (Q1)

| Rolle | Projekte |
|---|---|
| Quelle + Ziel | cranach-search (Werte), cranach-artefacts (Komponenten, Layout), cranach-map, cranach-compare, cranach-timeline (nur Theme-Architektur) |
| Nur Ziel, „light“ (Tokens + Grundstyles) | cranach-image-metadata, cranach-image-tools, cda-orga |
| Nur Ziel, von Anfang an auf dem Designsystem | cranach-kirby |
| Ausgeschlossen | cranach-grafiken-gatsby, cranach-api-documentation |

## 3. Technik

- **Q3 – CSS-first**: Tokens als CSS Custom Properties, Komponenten als CSS-Klassen mit dokumentiertem Markup.
- **Zusatzformate**: JS/TS-Tokens, Tailwind-4-`@theme`-Datei inkl. shadcn-Zuordnung, `custom-media.css`.
- **Q31 – Kein SCSS-Adapter**; Ersatz in den Projekten: natives CSS Nesting.
- **Q8 – Präfix + Cascade Layers** (`cda.tokens, cda.reset, cda.base, cda.components, cda.utilities`), kein `!important`; Tailwind-Projekte: `@layer theme, base, cda, components, utilities;` vor `@import "tailwindcss"`.
- **Q5 – Token-Quelle**: DTCG-JSON, Primitive + Semantik je Theme, Style Dictionary, Kontrast-Check im Build.
- **Q28 – Browser**: Baseline „widely available“.

## 4. Auslieferung und Versionierung

- **Laufzeit nur vom eigenen Server** (lucascranach.org), kein externes CDN (Q4).
- **Projekte mit Build**: npmjs.com, `npm i @lucascranach/design-system` (28.10.2026, ADR 0016; ursprünglich Git-Abhängigkeit, ADR 0005, verworfen).
- **Projekte ohne Build**: `<link rel="stylesheet" href="/design-system/x.y.z/cranach.css">`, unveränderliche Versionsordner.
- **Q24 – SemVer + release-please** im Standard-Ablauf; Umbenennen/Entfernen = Major mit vorheriger Deprecation über mindestens eine Minor-Version.
- **Q24b – Release**: bauen/prüfen, `npm publish`, rsync; zunächst manuell, später GitHub Action mit Trusted Publishing.
- **Q27 – Freigabe** durch Volker.

## 5. Gestaltung und Tokens

- **Q7 – Prinzip**: konsolidieren plus Barrierefreiheit korrigieren, kein Redesign.
- **Q12 – Akzent** #FEB701, Gelb-Palette 50–900, Gelb nur als Fläche mit dunkler Schrift.
- **Q13 – Links** in Textfarbe mit gelber Unterstreichung und Hover-Fläche; Ocker #946800, Orange #b84f00; im Dark-Theme Links gelb.
- **Q9/Q16/Q17 – Themes** hell und dunkel; Dark auf Basis #18181a; `data-theme`, Systemeinstellung, `.dark`.
- **Q26 – Schrift**: IBM Plex Sans variable woff2 + Italic (Latin, Latin-Ext), Plex Mono 400; Standard-Gewichte; Fließtext 16 px Regular.
- **Q14 – Breakpoints**: Tailwind-Standard 640/768/1024/1280/1536.
- **Q15 – Abstände**: 4-px-Raster mit T-Shirt-Namen plus fließende Abschnittsabstände.
- **Q19 – Radius** 2/4 px/full, **Bewegung** 200/400/800 ms mit `prefers-reduced-motion`, **Fokus** 2-px-Ring über `:focus-visible`.
- **Q19b/c – z-Ebenen** nach Bolt (−20 … 200) plus `toast` 220 und `skip-link` 240; Utilities ohne `!important`.
- **Q18/Q18b – Icons**: Material Symbols Sharp als Icon-Font (wght 400, FILL variabel, opsz 24), Subset ausschließlich über `icon_names`.
- 16.10.2026: selbst gesetzte Werte (Gelb-Palette, dunkle Grautöne, Dark-Farbstufen, Fokus-Ring, Schriftgrößen, fließende Abstände) freigegeben.

## 6. Komponenten (Q22)

- **v1**: Grundlagen, Button, Icon, Textfeld/Suchfeld, Checkbox, Toggle, Switcher, Accordion, Loader, Werk-Karte, Header mit Navigation und Sprachwahl, Footer.
- **v2**: Drawer/Overlay, Dialog, Tabelle, Pagination, Tooltip, Benachrichtigung, Tag/Badge, Breadcrumb.
- **v3**: Filter-Baumliste, Datierungs-Slider, Rahmen für den Bildviewer.

## 7. Dokumentation und Qualitätssicherung

- **Q23**: Storybook (HTML/Vite), Doku Deutsch, unter `lucascranach.org/design-system/docs/`.
- **Q29**: v1 axe + Stylelint; ab v2 visuelle Regressionstests mit Playwright.

## 8. Figma

- **Q6**: Education-Plan; Volker, Gestalter:innen, Entwickler:innen.
- **Q27**: Library im Team-Projekt; Besitzer Volker, Gestalter:innen bearbeiten; gemeinsame Prüfung vor Veröffentlichung.
- Offizieller Figma-MCP-Server (remote); Framelink verworfen (nur lesend); Variables-REST-API nur Enterprise.
- **Q20**: generiertes, idempotentes `figma-sync.js` über `use_figma`, Prüfung mit `get_variable_defs`; kein Tokens Studio.
- **Q21**: Claude baut Kernkomponenten über `use_figma`, Gestalter:innen verfeinern, Volker gibt frei.

## 9. Migrationsreihenfolge (Q25, nur dokumentiert)

1. cranach-image-metadata (Pilot) · 2. cranach-compare (danach Styleguide archivieren) · 3. cranach-timeline · 4. cranach-artefacts · 5. cranach-search · 6. cranach-map · 7. cranach-image-tools und cda-orga · 8. cranach-kirby (von Anfang an)

## Quellen

- Figma: [Leitfaden zum Figma-MCP-Server](https://help.figma.com/hc/de/articles/32132100833559-Leitfaden-zum-Figma-MCP-Server) · [Write to canvas](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas) · [Tools and prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/) · [Rate limits & access](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/) · [Variables REST API](https://developers.figma.com/docs/rest-api/variables) · [Forum: MCP-Limit Education-Plan](https://forum.figma.com/report-a-problem-6/mcp-limit-education-plan-55485)
- [GLips/Figma-Context-MCP (Framelink)](https://github.com/glips/figma-context-mcp)
- [Material Symbols Guide (Google Fonts)](https://developers.google.com/fonts/docs/material_symbols?hl=de)
- Bolt Design System: `@bolt/core-v3.x@5.8.0`, `styles/01-settings/settings-z-index/_settings-z-index.scss`; [Bolt Storybook](https://boltds.pega.com/?path=/story/visual-styles-utilities-special-cases--bolt-z-index)
- z-Index-Vergleich: [Chakra UI](https://chakra-ui.com/docs/theming/z-index) · [Atlassian](https://atlassian.design/foundations/elevation) · [Material UI](https://mui.com/material-ui/customization/z-index/)
