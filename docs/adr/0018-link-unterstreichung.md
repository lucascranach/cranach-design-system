# 0018 – Link-Unterstreichung mit mindestens 3:1

**Status:** angenommen (29.10.2026, Entscheidung am Haltepunkt nach Roadmap-Schritt 6) · ändert ADR 0008 im Punkt „Links“

## Kontext
ADR 0008 legt das Link-Muster aus cranach-artefacts fest: Textfarbe, gelbe Unterstreichung, gelbe Fläche beim Überfahren. Im hellen Theme haben Links dieselbe Farbe wie der Fließtext (Schwarz); sie unterscheiden sich nur durch die Unterstreichung. Die Unterstreichung in #FEB701 (yellow-500) erreicht auf Weiß nur 1,75:1. Die Unterstreichung selbst erfüllt WCAG 1.4.1 („Benutzung von Farbe“), weil sie kein Farbunterschied ist. Manche Prüfer verlangen für die Kennzeichnung von Links aber zusätzlich 3:1 gegen den Hintergrund (WCAG 1.4.11 „Nicht-Text-Kontrast“). Eine kaum sichtbare Unterstreichung hilft außerdem Menschen mit geringem Sehvermögen nicht.

Abgewogene Stufen der Gelb-Palette auf Weiß:

| Stufe | Wert | auf Weiß | auf #f7f7f7 |
|---|---|---|---|
| yellow-500 | #feb701 | 1,75:1 | 1,64:1 |
| yellow-600 | #da9c01 | 2,40:1 | 2,24:1 |
| **yellow-700** | **#b78200** | **3,38:1** | **3,16:1** |
| yellow-800 (Ocker) | #946800 | 4,95:1 | 4,62:1 |

## Entscheidung
- Im **hellen Theme** ist die Link-Unterstreichung `--cda-color-link-underline` **yellow-700 (#b78200)**. Sie erreicht 3:1 auf beiden hellen Hintergründen und wirkt noch gelb; Ocker (yellow-800) wäre deutlich brauner.
- Die **Hover-Fläche** bleibt yellow-500 (#FEB701) mit schwarzer Schrift (11,99:1).
- Im **dunklen Theme** ändert sich nichts: Link und Unterstreichung sind yellow-500 (10,12:1 auf #18181a).
- `npm run check:contrast` prüft die Unterstreichung gegen `background.default` und `background.subtle` mit mindestens 3:1.

## Konsequenzen
- Das Gelb der Unterstreichung ist im hellen Theme etwas dunkler als das Akzent-Gelb der Flächen.
- Die Paarung ist Teil der Build-Prüfung; eine spätere Wertänderung unter 3:1 bricht den Build.
