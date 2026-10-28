# 0016 – Auslieferung über npmjs.com und selbst gehostete Kopie

**Status:** angenommen (28.10.2026) · ersetzt [ADR 0005](0005-auslieferung.md)

## Kontext
ADR 0005 sah vor, Projekte mit Build direkt aus Git-Tags zu installieren. Weil release-please keine gebauten Dateien in Git ablegt, hätte das einen eigenen Release-Branch mit `dist/` oder `dist/` im Release-Commit auf `main` erfordert. Beides weicht vom üblichen Ablauf ab. Mit einer Registry entfällt dieses Problem: Die gebauten Dateien liegen im veröffentlichten Paket, nicht in Git.

## Entscheidung
- **Projekte mit Build** (search, artefacts, map, timeline, kirby) installieren das Paket von **npmjs.com**:
  `npm i @lucascranach/design-system`
  Das Paket ist öffentlich (`publishConfig.access: public`) und enthält nur `dist/`, `README.md` und `LICENSE`.
- **Zur Laufzeit gilt weiter: nur der eigene Server.** npm wird nur beim Installieren bzw. Bauen genutzt; die Projekte bündeln die Dateien und liefern sie von lucascranach.org aus. Besucher kontaktieren npm nie. Externe CDNs (jsDelivr, unpkg) werden weiterhin nicht verwendet.
- **Projekte ohne Build** (compare, image-metadata, image-tools, cda-orga) binden unverändert die selbst gehostete, versionierte Kopie ein:
  `<link rel="stylesheet" href="/design-system/x.y.z/cranach.css">`
- `dist/` wird nicht in Git eingecheckt. Es gibt keinen Release-Branch.

## Konsequenzen
- Für den Scope `@lucascranach` muss auf npmjs.com eine Organisation `lucascranach` angelegt werden (für öffentliche Pakete kostenlos). Besitzer: Volker Schaefer.
- Veröffentlichen erfordert ein npm-Konto mit Zwei-Faktor-Authentisierung bzw. später eine GitHub Action mit „Trusted Publishing“ (siehe ADR 0006).
- Versionsbereiche (`^1.2`), `npm outdated` und Dependabot/Renovate funktionieren in den Projekten wie gewohnt.
