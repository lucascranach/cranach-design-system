/**
 * Storybook – visuelle Dokumentation des Designsystems (ADR 0013).
 *
 * HTML-Renderer mit Vite. Doku-Seiten (MDX) und Stories liegen in stories/.
 * Storybook bindet das gebaute dist/cranach.css ein; "npm run storybook" baut vorher.
 */
import remarkGfm from 'remark-gfm';

/** @type {import('@storybook/html-vite').StorybookConfig} */
const config = {
  framework: '@storybook/html-vite',
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.js'],
  addons: [
    {
      name: '@storybook/addon-docs',
      // Tabellen in MDX (GitHub Flavored Markdown)
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  core: {
    // Keine Nutzungsdaten an Storybook senden, keine Neuigkeiten-Hinweise laden
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  features: {
    // Hintergrund kommt aus dem Theme (data-theme), nicht aus dem Storybook-Addon
    backgrounds: false,
    // Keine Einführungs-Checkliste in der Seitenleiste
    sidebarOnboardingChecklist: false,
  },
};

export default config;
