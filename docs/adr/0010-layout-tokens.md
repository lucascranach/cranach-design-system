# 0010 – Breakpoints, Abstände, Radius, Bewegung, Fokus

**Status:** angenommen (Q14, Q15, Q19)

## Entscheidung
- **Breakpoints:** Tailwind-Standard `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 px. Kachel-Raster passen sich fließend an (`repeat(auto-fill, minmax(…))` bzw. Container Queries) statt über Breakpoints 2000/2300.
- **Abstände:** 4-px-Raster mit T-Shirt-Namen (4, 8, 12, 16, 24, 32, 48, 64, 96 px) plus wenige fließende Abschnittsabstände (Muster `--responsive-padding-*` aus cranach-artefacts).
- **Radius:** `s` 2 px, `m` 4 px, `full`. shadcn `--radius` = 4 px.
- **Bewegung:** `fast` 200 ms, `medium` 400 ms, `slow` 800 ms; bei `prefers-reduced-motion: reduce` entfallen Animationen.
- **Fokus:** einheitlicher 2-px-Ring über `:focus-visible`; `outline: none` ist verboten (Stylelint-Regel).
- **Browser:** Baseline „widely available“ (Q28).
