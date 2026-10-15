# 0012 – Icons als Material-Symbols-Subset

**Status:** angenommen (Q18, Q18b)

## Kontext
Im Einsatz sind Material Icons Regular, Sharp und Outlined (teils über Google Fonts), lucide und react-icons. Gewünscht ist eine Icon-Font, die nur die benötigten Symbole enthält.

## Entscheidung
- **Material Symbols Sharp** als Icon-Font: `wght` 400, `FILL` variabel (0..1), `opsz` fest 24, `GRAD` 0.
- Liste der benötigten Icons in `icons/icons.json`.
- Das Build-Skript bezieht das Subset einmalig über den Google-Fonts-Parameter `icon_names` (alphabetisch sortiert, `display=block`) und legt die woff2 in `dist/fonts/` ab. Nur der Build spricht mit Google; Besucher laden vom eigenen Server.
- Rückfallebene ohne Google-Zugriff: lokales Subsetting der offiziellen variablen Font mit `fonttools`.
- Klasse `.cda-icon` (mit `font-display: block`), Modifier `.cda-icon--filled`; Markup: `<span class="cda-icon" aria-hidden="true">search</span>`.
- Ein neues Icon = Name in die Liste + Minor-Release.
