import { sample } from '../helpers.js';
import { tile } from './beispiele.js';

export default { title: 'Layout/Stack' };

const kids = ['Überschrift', 'Absatz mit Text', 'Noch ein Absatz', 'Button'].map(tile).join('');

export const Standard = {
  render: () => sample(`<div class="cda-l-stack">${kids}</div>`),
};

export const GroesserAbstand = {
  name: 'Größerer Abstand',
  render: () => sample(`<div class="cda-l-stack" style="--cda-l-space: var(--cda-space-xl)">${kids}</div>`),
};
