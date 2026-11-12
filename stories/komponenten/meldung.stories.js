import { esc } from '../helpers.js';

const ICONS = { info: 'info', success: 'check_circle', danger: 'error' };

/** Eine Meldung – dasselbe Markup, das die Doku als Quelltext zeigt */
const message = ({ type = 'info', title, text, role, close = false }) =>
  [
    `<div class="cda-message${type === 'info' ? '' : ` cda-message--${type}`}"${role ? ` role="${role}"` : ''}>`,
    `  <span class="cda-icon cda-message__icon" aria-hidden="true">${ICONS[type]}</span>`,
    '  <div class="cda-message__content">',
    ...(title ? [`    <p class="cda-message__title">${esc(title)}</p>`] : []),
    `    <p>${esc(text)}</p>`,
    '  </div>',
    ...(close
      ? [
          '  <button type="button" class="cda-button cda-button--ghost cda-button--icon cda-message__close" aria-label="Meldung schließen">',
          '    <span class="cda-icon" aria-hidden="true">close</span>',
          '  </button>',
        ]
      : []),
    '</div>',
  ].join('\n');

export default {
  title: 'Komponenten/Meldung',
  decorators: [(story) => `<div class="docs-sample">${story()}</div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
};

export const Arten = {
  render: () =>
    `<div class="cda-l-stack">
${[
  message({ text: 'Die Abbildungen dieses Werks werden gerade überarbeitet.' }),
  message({ type: 'success', text: 'Das Element wurde in die Zwischenablage kopiert.' }),
  message({ type: 'danger', text: 'Die Datei metadata.json konnte nicht geladen werden.' }),
].join('\n')}
</div>`,
};

export const MitTitel = {
  name: 'Mit Titel',
  render: () =>
    message({
      type: 'danger',
      title: 'Speichern fehlgeschlagen',
      text: 'Die Verbindung zum Server wurde unterbrochen. Bitte später noch einmal versuchen.',
    }),
};

/** Schließen entfernt die Meldung – im Projekt per JavaScript, hier zum Ausprobieren */
export const MitSchliessen = {
  name: 'Mit Schließen',
  render: () => message({ text: 'Neue Abbildungen sind verfügbar.', close: true }),
  play: ({ canvasElement }) => {
    for (const button of canvasElement.querySelectorAll('.cda-message__close')) {
      button.addEventListener('click', () => button.closest('.cda-message').remove());
    }
  },
};

/**
 * Toast: Der Bereich steht von Anfang an im HTML, die Meldungen kommen per JavaScript hinein.
 * Erfolg verschwindet nach 5 Sekunden, ein Fehler bleibt, bis er geschlossen wird.
 */
export const Toast = {
  render: () =>
    `<div class="cda-l-cluster">
  <button type="button" class="cda-button" data-demo="success">Erfolg melden</button>
  <button type="button" class="cda-button" data-demo="danger">Fehler melden</button>
</div>
<div class="cda-toast-region" role="status"></div>`,
  parameters: {
    docs: {
      source: {
        code: `<div class="cda-toast-region" role="status">
${message({ type: 'success', text: 'Das Element wurde in die Zwischenablage kopiert.' })
  .split('\n')
  .map((l) => `  ${l}`)
  .join('\n')}
</div>`,
      },
    },
  },
  play: ({ canvasElement }) => {
    const region = canvasElement.querySelector('.cda-toast-region');
    const show = (type) => {
      const holder = document.createElement('div');
      holder.innerHTML =
        type === 'success'
          ? message({ type, text: 'Das Element wurde in die Zwischenablage kopiert.' })
          : message({ type, role: 'alert', text: 'Kopieren fehlgeschlagen.', close: true });
      const element = holder.firstElementChild;
      region.append(element);
      element.querySelector('.cda-message__close')?.addEventListener('click', () => element.remove());
      if (type === 'success') setTimeout(() => element.remove(), 5000);
    };
    for (const button of canvasElement.querySelectorAll('[data-demo]')) {
      button.addEventListener('click', () => show(button.dataset.demo));
    }
  },
};

/**
 * Toast bei offenem Dialog: Der Dialog hat einen eigenen Bereich, sonst läge die Meldung unter der
 * Abdunkelung und wäre gesperrt. Das Projekt wählt den Bereich des offenen Dialogs, sonst den der Seite.
 */
export const ToastImDialog = {
  name: 'Toast im Dialog',
  render: () =>
    `<button type="button" class="cda-button" data-open>Metadaten bearbeiten …</button>

<dialog class="cda-dialog" aria-labelledby="toast-dialog-titel">
  <div class="cda-dialog__header">
    <h2 class="cda-dialog__title" id="toast-dialog-titel">Metadaten bearbeiten</h2>
    <form method="dialog">
      <button class="cda-button cda-button--ghost cda-button--icon" aria-label="Schließen">
        <span class="cda-icon" aria-hidden="true">close</span>
      </button>
    </form>
  </div>
  <div class="cda-dialog__body">
    <p>Änderungen werden sofort gespeichert und erscheinen nach der nächsten Aktualisierung auf der Werkseite.</p>
  </div>
  <div class="cda-dialog__footer">
    <button type="button" class="cda-button cda-button--primary" data-save>Speichern</button>
  </div>
  <div class="cda-toast-region" role="status"></div>
</dialog>`,
  play: ({ canvasElement }) => {
    const dialog = canvasElement.querySelector('dialog');
    canvasElement.querySelector('[data-open]').addEventListener('click', () => dialog.showModal());
    canvasElement.querySelector('[data-save]').addEventListener('click', () => {
      const region = canvasElement.querySelector('dialog:modal .cda-toast-region');
      const holder = document.createElement('div');
      holder.innerHTML = message({ type: 'success', text: 'Gespeichert.' });
      const element = holder.firstElementChild;
      region.append(element);
      setTimeout(() => element.remove(), 5000);
    });
  },
};
