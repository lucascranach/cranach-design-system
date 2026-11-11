import { sample } from '../helpers.js';
import { resizable } from './beispiele.js';

export default { title: 'Layout/Cluster' };

const TAGS = ['Malerei', 'Zeichnung', 'Druckgrafik', 'Archivalien', 'Literatur', 'Lucas Cranach der Ältere', 'Werkstatt', 'um 1530'];

export const Schlagworte = {
  render: () =>
    sample(
      resizable(
        'Cluster',
        `<ul class="cda-l-cluster" role="list">${TAGS.map((t) => `<li><button type="button" class="cda-button">${t}</button></li>`).join('')}</ul>`,
        '70%',
      ),
    ),
};
