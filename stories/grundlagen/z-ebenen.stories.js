import { tokens } from '../../dist/tokens.js';
import { code, cssVar, esc, sample, table } from '../helpers.js';

export default {
  title: 'Grundlagen/z-Ebenen',
};

/** Verwendung je Ebene (ADR 0011) */
const USAGE = {
  'background-bottom': 'Hintergrund-Elemente unter dem Seitenhintergrund',
  background: 'Seitenhintergrund',
  'background-top': 'Hintergrund-Elemente über dem Seitenhintergrund',
  'content-bottom': 'Inhalte, die unter anderen Inhalten liegen',
  content: 'Inhalt',
  'content-top': 'Inhalte, die über anderen Inhalten liegen (z. B. Karten-Hover)',
  nav: 'Navigation im Fluss der Seite',
  fab: 'Schwebende Aktionsschaltfläche',
  popover: 'Ausklappmenüs, Popover',
  tooltip: 'Tooltips',
  'nav-fixed': 'Fixierter Header',
  'modal-bg': 'Abdunkelung hinter Dialogen und Drawern',
  modal: 'Dialoge, Drawer, Bildviewer im Vollbild',
  toast: 'Kurze Benachrichtigungen, auch über offenen Dialogen (Ergänzung)',
  'skip-link': 'Skip-Link „Zum Inhalt springen“, liegt über allem (Ergänzung)',
};

export const Ebenen = {
  render: () =>
    sample(
      table(
        'Von oben nach unten. Werte aus dem Bolt Design System, ergänzt um toast und skip-link.',
        ['Token', 'Wert', 'Verwendung'],
        Object.entries(tokens.z)
          .sort(([, a], [, b]) => b - a)
          .map(([key, value]) => [code(cssVar(['z', key])), code(value), esc(USAGE[key] ?? '')]),
      ),
    ),
};
