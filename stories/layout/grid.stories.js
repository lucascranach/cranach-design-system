import { sample } from '../helpers.js';
import { resizable, tile } from './beispiele.js';

export default { title: 'Layout/Grid' };

const items = (n) => Array.from({ length: n }, (_, i) => `<li>${tile(`Kachel ${i + 1}`)}</li>`).join('');

export const Standard = {
  render: () => sample(resizable('Grid', `<ul class="cda-l-grid" role="list">${items(6)}</ul>`)),
};

export const Klein = {
  render: () =>
    sample(
      resizable(
        'Grid klein',
        `<ul class="cda-l-grid cda-l-grid--small" role="list">${items(12)}</ul>`,
      ),
    ),
};
