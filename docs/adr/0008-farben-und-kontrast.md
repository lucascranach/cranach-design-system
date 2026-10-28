# 0008 – Farben und Kontrast

**Status:** angenommen (Q7, Q12, Q13)

## Kontext
Das Akzent-Gelb existiert in sechs bis sieben Varianten. Weiß auf Gelb (1,75:1) und Gelb als Textfarbe (1,75:1) verfehlen WCAG AA deutlich; das Orange #cc5800 erreicht nur 4,23:1.

## Entscheidung
- **Prinzip:** vorhandene Werte konsolidieren und Mängel der Barrierefreiheit beheben, kein Redesign.
- **Akzent:** #FEB701 als `yellow.500` einer Gelb-Palette 50–900. Gelb nur als Fläche mit dunkler Schrift (Schwarz auf #FEB701: 11,99:1).
- **Links:** Textfarbe, gelbe Unterstreichung, gelbe Hover-Fläche (Muster aus cranach-artefacts). Im dunklen Theme Links in Gelb (10,1:1 auf #18181a).
- **Farbiger Text:** Ocker #946800 (4,95:1 auf Weiß), Orange #b84f00 (5,05:1 auf Weiß).
- Jede Text/Hintergrund-Kombination der semantischen Tokens muss mindestens 4,5:1 erreichen; der Build prüft das.

## Freigegebene Werte (16.10.2026)
Die folgenden, bei der Umsetzung festgelegten Werte wurden von Volker Schaefer freigegeben (Quelle: `tokens/primitive/color.json`, `tokens/semantic/*.json`):
- **Gelb-Palette:** 50 #fff8ed · 100 #fff0d7 · 200 #ffe2b1 · 300 #ffd488 · 400 #ffc559 · **500 #feb701** · 600 #da9c01 · 700 #b78200 · **800 #946800** (Ocker) · 900 #6b4b00. Zwischenstufen in OKLab interpoliert.
- **Graustufen:** 0 #ffffff · 50 #f7f7f7 · 100 #f2f2f2 · 200 #e0e0e0 · 300 #b4b4b4 · 400 #8a8a8a · 500 #666666 · 600 #444444 · 700 #333336 · 800 #242426 · 900 #18181a · 1000 #000000. Die dunklen Stufen 700/800 sind an #18181a (timeline) angelehnt; das frühere `$darker` #222 entfällt.
- **Orange:** 300 #ff9a52 (Text im dunklen Theme), 600 #cc5800 (bisheriges `$decoration`, nur Großtext), 700 #b84f00 (Text im hellen Theme).
- **Rot:** 300 #ff7a7a (dunkles Theme), 700 #cc0000 (bisheriges `$error`).
- **Fokus-Ring:** hell Ocker #946800 (4,95:1), dunkel Gelb #feb701 (10,12:1).
