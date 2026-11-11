import { sample } from '../helpers.js';
import { resizable, tile } from './beispiele.js';

export default { title: 'Layout/Sidebar' };

const TEXT =
  'Breiter Inhalt, etwa der Text zu einem Werk. Er nimmt allen übrigen Platz ein. Wird er schmaler als die Hälfte, rutscht er unter die schmale Spalte.';

export const Links = {
  name: 'Schmale Spalte links',
  render: () => sample(resizable('Sidebar', `<div class="cda-l-sidebar">${tile('Schmale Spalte, z. B. Bild')}${tile(TEXT)}</div>`)),
};

export const Rechts = {
  name: 'Schmale Spalte rechts (--end)',
  render: () =>
    sample(resizable('Sidebar rechts', `<div class="cda-l-sidebar cda-l-sidebar--end">${tile(TEXT)}${tile('Schmale Spalte, z. B. Filter')}</div>`)),
};
