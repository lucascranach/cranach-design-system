import iconList from '../../icons/icons.json';
import { esc } from '../helpers.js';

const VARIANTS = { Standard: '', Primär: 'cda-button--primary', Dezent: 'cda-button--ghost' };

/** Markup eines Buttons – dasselbe, das die Doku als Quelltext zeigt */
function button({ label = '', variant = 'Standard', icon = '', iconAfter = false, iconOnly = false, disabled = false, link = false }) {
  const classes = ['cda-button', VARIANTS[variant], iconOnly && 'cda-button--icon'].filter(Boolean).join(' ');
  const iconHtml = icon ? `<span class="cda-icon" aria-hidden="true">${esc(icon)}</span>` : '';
  const content = iconOnly ? iconHtml : [iconAfter ? '' : iconHtml, esc(label), iconAfter ? iconHtml : ''].filter(Boolean).join(' ');
  const label_ = iconOnly ? ` aria-label="${esc(label)}"` : '';
  if (link) {
    // Ohne href ist <a> kein Link mehr; role="link" erhält die Rolle für aria-disabled
    const target = disabled ? ' role="link" aria-disabled="true"' : ' href="#"';
    return `<a class="${classes}"${target}${label_}>${content}</a>`;
  }
  return `<button type="button" class="${classes}"${disabled ? ' disabled' : ''}${label_}>${content}</button>`;
}

const join = (...buttons) => buttons.join('\n');

export default {
  title: 'Komponenten/Button',
  // Beispielfläche, die dem Theme folgt; nicht Teil des gezeigten Quelltexts
  decorators: [(story) => `<div class="docs-sample"><div class="docs-row">${story()}</div></div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
};

export const Spielwiese = {
  args: { label: 'Merken', variant: 'Standard', icon: '', iconAfter: false, iconOnly: false, disabled: false, link: false },
  argTypes: {
    label: { name: 'Beschriftung', control: 'text', description: 'Bei „Nur Icon“ der zugängliche Name (aria-label)' },
    variant: { name: 'Variante', control: 'inline-radio', options: Object.keys(VARIANTS) },
    icon: { name: 'Icon', control: 'select', options: ['', ...Object.keys(iconList.icons)] },
    iconAfter: { name: 'Icon nach dem Text', control: 'boolean' },
    iconOnly: { name: 'Nur Icon', control: 'boolean' },
    disabled: { name: 'Deaktiviert', control: 'boolean' },
    link: { name: 'Als Link', control: 'boolean' },
  },
  render: (args) => button(args),
};

export const Varianten = {
  render: () =>
    join(
      button({ label: 'Merken' }),
      button({ label: 'Suchen', variant: 'Primär' }),
      button({ label: 'Zurücksetzen', variant: 'Dezent' }),
    ),
};

export const MitIcon = {
  name: 'Mit Icon',
  render: () =>
    join(
      button({ label: 'Herunterladen', icon: 'download' }),
      button({ label: 'Suchen', icon: 'search', variant: 'Primär' }),
      button({ label: 'Filter', icon: 'tune', variant: 'Dezent' }),
      button({ label: 'Weiter', icon: 'arrow_forward', iconAfter: true }),
    ),
};

export const NurIcon = {
  name: 'Nur Icon',
  render: () =>
    join(
      button({ label: 'Menü öffnen', icon: 'menu', iconOnly: true }),
      button({ label: 'Suchen', icon: 'search', iconOnly: true, variant: 'Primär' }),
      button({ label: 'Schließen', icon: 'close', iconOnly: true, variant: 'Dezent' }),
    ),
};

export const Deaktiviert = {
  render: () =>
    join(
      button({ label: 'Merken', disabled: true }),
      button({ label: 'Suchen', variant: 'Primär', disabled: true }),
      button({ label: 'Zurücksetzen', variant: 'Dezent', disabled: true }),
      button({ label: 'Schließen', icon: 'close', iconOnly: true, disabled: true }),
    ),
};

export const AlsLink = {
  name: 'Als Link',
  render: () =>
    join(
      button({ label: 'Zur Suche', icon: 'search', link: true }),
      button({ label: 'Werk ansehen', variant: 'Primär', link: true }),
      button({ label: 'Nicht verfügbar', variant: 'Dezent', link: true, disabled: true }),
    ),
};
