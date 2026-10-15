# 0013 – Storybook, axe, Stylelint

**Status:** angenommen (Q10, Q23, Q29)

## Entscheidung
- Visuelle Dokumentation mit **Storybook** (HTML-Renderer, Vite), Texte auf Deutsch (MDX), Code und Token-Namen auf Englisch.
- Hosting unter `lucascranach.org/design-system/docs/`.
- **v1:** Storybook-Addon für Barrierefreiheit (axe) und Stylelint, lokal und in CI.
- **ab v2:** visuelle Regressionstests mit Playwright-Screenshots der Stories.
