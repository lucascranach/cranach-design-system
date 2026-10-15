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
