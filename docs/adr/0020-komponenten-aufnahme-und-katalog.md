# 0020 – Aufnahme von Komponenten und Katalog der Projektkomponenten

**Status:** angenommen (11.11.2026, Entscheidung Volker) · ergänzt ADR 0002 und ADR 0015

## Kontext
Die ADRs regeln, *wie* Komponenten gebaut werden (CSS-first, Präfix, Layer, Tokens), aber nicht, *welche* ins Designsystem gehören. Die Durchsicht der Projekte für die Migrationsseiten (Roadmap-Schritt 22) fand neben den vorhandenen Komponenten viele weitere, die meisten nur in einem Projekt.

Eine Komponente im Designsystem hat Kosten:
- Sie steckt in `cranach.css` und wird von jedem Projekt geladen; Projekte ohne Build können sie nicht weglassen.
- Sie braucht Varianten, beide Themes, axe-Prüfung, Doku und Figma-Pflege.
- Ihr Markup ist eine Zusage: Ab 1.0.0 ist jede Änderung an den Klassen ein Bruch (ADR 0006).

Bleibt eine Komponente dagegen nur im Projekt, gerät sie leicht in Vergessenheit. Ein zweites Projekt baut sie dann neu. Genau so sind Button, Karte und Loader in mehreren Varianten entstanden (`docs/bestandsaufnahme.md`, Abschnitt 7).

## Entscheidung
- **Ins Designsystem kommt eine Komponente, sobald zwei Projekte sie brauchen** – oder wenn das absehbar ist, etwa für die neue Website cranach-kirby. Sie wird als eigener Roadmap-Schritt gebaut; die vorhandene Umsetzung im ersten Projekt dient als Vorlage.
- **Bis dahin bleibt sie im Projekt.** Dort nutzt sie die Tokens des Designsystems (keine eigenen Farb- oder Abstandswerte) und keine Klassen mit dem Präfix `cda-` (ADR 0003).
- **Katalog „Projektkomponenten“ im Storybook:** Jede Komponente, die nur in einem Projekt existiert, steht dort mit Projekt, Fundort und Zweck. Der Katalog gehört zur Doku, nicht zum Paket – nichts davon landet in `cranach.css`.
- **Ablauf:**
  1. Vor dem Bauen einer Komponente im Storybook nachsehen: unter „Komponenten“ und unter „Projektkomponenten“.
  2. Steht sie im Katalog, ist das neue Projekt das zweite: Die Komponente wird ins Designsystem geholt statt neu gebaut.
  3. Gibt es sie nirgends, wird sie im Projekt gebaut und im selben Zug im Katalog eingetragen.
- **Bibliotheken** wie OpenSeadragon, Tabulator, noUiSlider oder PhotoSwipe bleiben Bibliotheken, auch wenn mehrere Projekte sie nutzen. Das Designsystem passt höchstens ihr Aussehen über Tokens an. Sie stehen im Katalog, damit die Projekte dieselbe Bibliothek wählen.

## Konsequenzen
- Der Katalog lebt im Repo des Designsystems (`stories/projektkomponenten.mdx`). Eine neue Projektkomponente bedeutet deshalb auch eine kleine Änderung hier.
- Die Liste ist nur so gut wie ihre Pflege. Der Eintrag gehört zur Fertigstellung einer Projektkomponente, wie ein Test zur Funktion.
- Die fünf Kandidaten aus Schritt 22, die schon in mehreren Projekten vorkommen (Meldung, Dialog, Seitenleiste, Tabelle, Werk-Karte als Listenzeile), sind als Roadmap-Schritte 23–27 eingeplant.
