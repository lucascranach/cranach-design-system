# 0005 – Auslieferung: Git-Abhängigkeit und selbst gehostete Kopie

**Status:** ersetzt durch [ADR 0016](0016-auslieferung-ueber-npmjs.md) am 28.10.2026 (ursprünglich angenommen: Q4, Q4b)

## Kontext
Zur Laufzeit soll ausschließlich vom eigenen Server (lucascranach.org) geladen werden – kein externes CDN, auch aus Datenschutzgründen. Es soll kein npm-Registry-Konto nötig sein.

## Entscheidung
- **Projekte mit Build** (search, artefacts, map, timeline, kirby) installieren das Paket direkt aus den Git-Tags:
  `npm i github:lucascranach/cranach-design-system#semver:^1.0`
  Grundlage ist ein Release-Branch `release`, auf dem jedes Release den fertigen `dist/`-Ordner committet und taggt. Auf `main` wird `dist/` nicht eingecheckt.
- **Projekte ohne Build** (compare, image-metadata, image-tools, cda-orga) binden die selbst gehostete, versionierte Kopie ein:
  `<link rel="stylesheet" href="/design-system/x.y.z/cranach.css">`
  Jeder Versionsordner ist unveränderlich und darf dauerhaft gecacht werden.
- Externe CDNs (jsDelivr, unpkg) werden nicht verwendet; Git-Submodule ebenfalls nicht.

## Konsequenzen
- Besucher laden alles von lucascranach.org.
- Das Release-Skript muss `dist/` bauen, auf `release` committen, taggen und per rsync nach `/design-system/x.y.z/` kopieren (ADR 0006).
