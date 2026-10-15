# 0015 – Projektrollen und Migrationsreihenfolge

**Status:** angenommen (Q1, Q25)

## Rollen der Projekte

| Rolle | Projekte |
|---|---|
| Quelle und Ziel | cranach-search (Werte), cranach-artefacts (Komponenten, Layout), cranach-map, cranach-compare, cranach-timeline (nur Theme-Architektur) |
| Nur Ziel, „light“ (Tokens und Grundstyles) | cranach-image-metadata, cranach-image-tools, cda-orga |
| Nur Ziel, von Anfang an auf dem Designsystem | cranach-kirby |
| Ausgeschlossen | cranach-grafiken-gatsby, cranach-api-documentation |

## Migrationsreihenfolge
Die Bestandsprojekte werden derzeit **nicht** verändert. Die Reihenfolge ist nur dokumentiert:

1. cranach-image-metadata – Pilot (intern, klein, ohne Build)
2. cranach-compare – danach `lucascranach/styleguide` archivieren
3. cranach-timeline – Tailwind-Adapter und Dark-Theme
4. cranach-artefacts
5. cranach-search
6. cranach-map
7. cranach-image-tools und cda-orga
8. cranach-kirby – von Anfang an auf dem Designsystem

## Ablauf je Projekt
1. Designsystem einbinden – dank Cascade Layers ohne sichtbare Änderung.
2. Tokens zuordnen.
3. Alte Styles Komponente für Komponente entfernen.
