# 0001 – Neues Repo, Ablösung von `lucascranach/styleguide`

**Status:** angenommen (Q2, Q11)

## Kontext
Es gibt kein gemeinsames Paket; Styles wurden zwischen den Projekten kopiert und sind auseinandergelaufen (`variables.scss` in vier Varianten). Ein früherer Anlauf, `lucascranach/styleguide` (Jekyll Living Style Guide, letzter Commit 05/2021), hat keine Token-Pipeline, keine Versionierung und keinen Figma-Bezug. cranach-compare lädt dessen `main.css` aber noch live von `lucascranach.github.io`.

## Entscheidung
- Neues Repo `lucascranach/cranach-design-system`, Name in der Doku „Cranach Design System“.
- `lucascranach/styleguide` bleibt unverändert online, bis cranach-compare umgestellt ist, und wird danach archiviert.

## Konsequenzen
- compare darf beim Aufbau nicht brechen; die Ablösung ist Schritt 2 der Migration (ADR 0015).
