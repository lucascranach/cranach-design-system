/**
 * Automatische Prüfung aller Stories (ADR 0013): Vitest rendert jede Story in einem unsichtbaren
 * Chromium, führt ihr Vorführ-Skript (play) aus und prüft sie mit axe. Ein axe-Verstoß lässt den
 * Test fehlschlagen (preview.js: a11y.test = 'error').
 *
 * Zwei Durchläufe, einer je Theme: Das Theme kommt über provide/inject in .storybook/vitest.setup.js.
 * Setzt voraus, dass dist/ gebaut ist (npm run build) – Storybook bindet dist/cranach.css ein.
 *
 *   npm run test:storybook
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Namen wie im Theme-Umschalter von Storybook (.storybook/preview.js) */
const THEMES = ['Hell', 'Dunkel'];

export default defineConfig({
  test: {
    projects: THEMES.map((theme) => ({
      extends: true,
      plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
      test: {
        name: `Stories ${theme}`,
        provide: { theme },
        setupFiles: ['.storybook/vitest.setup.js'],
        browser: {
          enabled: true,
          headless: true,
          provider: playwright(),
          instances: [{ browser: 'chromium' }],
        },
      },
    })),
  },
});
