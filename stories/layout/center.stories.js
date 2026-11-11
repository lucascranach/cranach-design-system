import { sample } from '../helpers.js';

export default { title: 'Layout/Center' };

const TEXT =
  'Lucas Cranach der Ältere (1472–1553) war einer der bedeutendsten Maler der deutschen Renaissance. Seine Werkstatt in Wittenberg schuf Altäre, Bildnisse, mythologische Szenen und Druckgrafik in großer Zahl. Das Cranach Digital Archive erschließt sein Werk und das seiner Werkstatt mit Abbildungen, Untersuchungen und Literatur.';

export const Textbreite = {
  render: () => sample(`<div class="cda-l-center cda-l-center--measure docs-outline"><p>${TEXT}</p></div>`),
};

export const Seitenbreite = {
  render: () =>
    sample(
      `<div class="cda-l-center docs-outline" style="--cda-l-max: calc(var(--cda-size-card-min) * 2)"><p>Seitenbreite, hier für das Beispiel auf 512 px verkleinert. Der Randabstand wächst mit der Fensterbreite.</p></div>`,
    ),
};
