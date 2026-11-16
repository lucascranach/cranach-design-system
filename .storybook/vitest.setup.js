/**
 * Einrichtung für die Prüfung der Stories mit Vitest (vitest.config.js): dieselben Einstellungen
 * wie in Storybook, dazu axe und das Theme des jeweiligen Durchlaufs.
 */
import { beforeAll, inject } from 'vitest';
import { setProjectAnnotations } from '@storybook/html-vite';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import * as projectAnnotations from './preview.js';
import { tokens } from '../dist/tokens.js';

setProjectAnnotations([a11yAddonAnnotations, projectAnnotations, { initialGlobals: { theme: inject('theme') } }]);

// axe erkennt Icons aus der Icon-Font nur, wenn die Schrift geladen ist. Sonst hält es den
// Icon-Namen („view_headline“) für sichtbaren Text, der im Namen des Buttons fehlt.
beforeAll(async () => {
  await document.fonts.load(`24px ${tokens.font.family.icon}`);
});
