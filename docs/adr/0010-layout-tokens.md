# 0010 – Breakpoints, Abstände, Radius, Bewegung, Fokus

**Status:** angenommen (Q14, Q15, Q19)

## Entscheidung
- **Breakpoints:** Tailwind-Standard `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 px. Kachel-Raster passen sich fließend an (`repeat(auto-fill, minmax(…))` bzw. Container Queries) statt über Breakpoints 2000/2300.
- **Abstände:** 4-px-Raster mit T-Shirt-Namen (4, 8, 12, 16, 24, 32, 48, 64, 96 px) plus wenige fließende Abschnittsabstände (Muster `--responsive-padding-*` aus cranach-artefacts).
- **Radius:** `s` 2 px, `m` 4 px, `full`. shadcn `--radius` = 4 px.
- **Bewegung:** `fast` 200 ms, `medium` 400 ms, `slow` 800 ms; bei `prefers-reduced-motion: reduce` entfallen Animationen.
- **Fokus:** einheitlicher 2-px-Ring über `:focus-visible`; `outline: none` ist verboten (Stylelint-Regel).
- **Browser:** Baseline „widely available“ (Q28).

## Freigegebene Werte (16.10.2026)
- **Fließende Abstände:** `--cda-space-fluid-s` clamp(12px, 1vw + 8px, 24px) · `-m` clamp(16px, 2vw + 8px, 48px) · `-l` clamp(24px, 4vw + 8px, 96px).
- **Rahmenstärken:** s 1 px · m 2 px · l 3 px (aus cranach-search).
- **Schatten:** s/m/l mit `rgba(0,0,0,.4)` und 4/12/20 px Unschärfe (aus cranach-search, auf 16-px-Basis umgerechnet).
- **Opazität:** medium 0,6 · low 0,3 (aus cranach-search).
