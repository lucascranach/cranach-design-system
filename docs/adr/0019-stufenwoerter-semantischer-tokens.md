# 0019 – Stufenwörter semantischer Tokens

**Status:** angenommen (30.10.2026, Entscheidung Volker) · ergänzt ADR 0007

## Kontext
Semantische Farb-Tokens tragen Stufenwörter: `default`, `subtle`, `muted`, `strong`. Die Flächen waren als Leiter `background.subtle` → `background.muted` → `background.strong` angelegt, jede Stufe stärker vom Seitenhintergrund abgesetzt als die vorige.

„Muted“ (gedämpft) beschreibt aber die Farbe selbst, nicht ihren Abstand zum Hintergrund. Bei Text heißt gedämpft: blasser, näher am Hintergrund, schwächer als `default` (`text.muted`). Bei Flächen bedeutete dasselbe Wort das Gegenteil, stärker abgesetzt als `subtle`. Wer `text.muted` kennt, hält `background.muted` leicht für die schwächste Stufe. Die Reihenfolge `subtle` → `muted` → `strong` ergibt sich nicht aus den Wörtern; andere Systeme ordnen sie sogar unterschiedlich (GitHub Primer etwa).

## Entscheidung
- **Ein Stufenwort zeigt im ganzen System in dieselbe Richtung**, gemessen an `default` bzw. am Hintergrund:
  - `subtle` – schwach, gerade eben sichtbar,
  - `medium` – mittlere Stufe,
  - `strong` – kräftig,
  - `muted` – zurückgenommen, schwächer als `default`; nur für Text.
- Eine Leiter aus mehreren Stufen muss sich aus den Wörtern ablesen lassen.
- Die Flächen heißen deshalb `background.subtle` → `background.medium` → `background.strong`. `background.muted` entfällt; die Werte bleiben gleich (hell neutral.100, dunkel neutral.700).
- `text.muted`, `border.strong` und `accent.subtle` folgen der Regel schon und bleiben.
- Adapter folgen ihren eigenen Namen: Im shadcn-Adapter (`tailwind.css`) bleiben `muted`, `secondary` und `accent` stehen und zeigen auf `background.medium`.

## Konsequenzen
- Die CSS-Variable heißt `--cda-color-background-medium`, die Tailwind-Farbe `--color-cda-background-medium`. Da noch keine Version veröffentlicht ist, bricht die Umbenennung nichts.
- In Figma heißt die Variable künftig `background/medium`. Der Sync legt sie neu an und meldet `background/muted` als „nicht mehr in den Tokens“, ohne sie zu löschen (`docs/figma-sync.md`). Besser ist es, die Variable in Figma vor dem nächsten Sync umzubenennen; dann bleiben Verknüpfungen in Entwürfen erhalten.
- Neue Stufen-Tokens werden gegen diese Regel geprüft.
