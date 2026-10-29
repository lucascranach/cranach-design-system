import { withThemeByDataAttribute } from '@storybook/addon-themes';

import '../dist/cranach.css';
import './preview.css';

/** Namen im Umschalter → Wert von data-theme (ADR 0007) */
const THEMES = { Hell: 'light', Dunkel: 'dark' };
const DEFAULT_THEME = 'Hell';

/** @type {import('@storybook/html-vite').Preview} */
const preview = {
  decorators: [
    // Umschalter hell/dunkel in der Werkzeugleiste: setzt data-theme auf <html>
    withThemeByDataAttribute({
      themes: THEMES,
      defaultTheme: DEFAULT_THEME,
      attributeName: 'data-theme',
      parentSelector: 'html',
    }),
  ],
  // addon-themes setzt data-theme erst nach dem Rendern. Dann blenden Links 200 ms von der
  // hellen in die dunkle Farbe über, und axe misst den Zwischenstand als Kontrastfehler.
  // Deshalb das Theme zusätzlich schon vor dem Rendern setzen.
  beforeEach: ({ globals }) => {
    document.documentElement.setAttribute('data-theme', THEMES[globals.theme] ?? THEMES[DEFAULT_THEME]);
  },
  parameters: {
    layout: 'padded',
    // Vorführ-Skripte der Stories (play) auch auf den Doku-Seiten ausführen; Storybook tut das
    // dort sonst nicht – Ansichtswahl, Löschen im Suchfeld und Zwischenzustand der Checkbox
    // funktionierten sonst nur in der Einzelansicht
    docs: { story: { autoplay: true } },
    // axe: Verstöße gelten als Fehler, nicht nur als Hinweis
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: [
          'Einstieg',
          'Einbinden',
          'Grundlagen',
          ['Farben', 'Typografie', 'Abstände', 'z-Ebenen', 'Icons'],
          'Komponenten',
          'Utilities',
        ],
      },
    },
  },
};

export default preview;
