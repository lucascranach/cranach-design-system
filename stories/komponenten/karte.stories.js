import { esc } from '../helpers.js';

/**
 * Platzhalterbild als SVG-Data-URI: ein „Gemälde“ im angegebenen Seitenverhältnis. Nur für die
 * Doku – keine echten Werkabbildungen, keine Abhängigkeit von externen Servern.
 */
const placeholder = (w, h, hue) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="hsl(${hue} 35% 30%)"/><rect x="${w * 0.08}" y="${h * 0.08}" width="${w * 0.84}" height="${h * 0.84}" fill="hsl(${hue} 30% 55%)"/><circle cx="${w / 2}" cy="${h * 0.4}" r="${Math.min(w, h) * 0.18}" fill="hsl(${hue + 30} 40% 75%)"/></svg>`,
  )}`;

const WORKS = [
  { title: 'Adam und Eva, 1526', subtitle: 'Öl auf Holz', text: 'Courtauld Gallery, London', img: placeholder(3, 4, 30) },
  { title: 'Bildnis Martin <em>Luther</em>, 1528', subtitle: 'Öl auf Holz', text: 'Lutherhaus, Wittenberg', img: placeholder(3, 4, 200), favorite: true },
  { title: 'Das Urteil des Paris, 1528', subtitle: 'Druckgrafik, Holzschnitt', text: 'Abzüge: 3', img: placeholder(4, 3, 100) },
  { title: 'Der Jungbrunnen, 1546', subtitle: 'Öl auf Lindenholz', text: 'Gemäldegalerie, Berlin', img: placeholder(2, 1, 0) },
];

const indent = (html, depth) =>
  html
    .split('\n')
    .map((l) => '  '.repeat(depth) + l)
    .join('\n');

/** Text aus dem Titel ohne Hervorhebung, für alt und aria-label */
const plain = (html) => html.replace(/<[^>]+>/g, '');

/** Karte – dasselbe Markup, das die Doku als Quelltext zeigt. Der Titel darf <em> enthalten. */
function card({ title, subtitle, text, img, favorite, withFavorite = true }) {
  const name = plain(title).replace(/, \d{4}$/, '');
  return [
    '<article class="cda-card">',
    `  <div class="cda-card__image"><img src="${img}" alt="" loading="lazy"></div>`,
    '  <div class="cda-card__content">',
    `    <h2 class="cda-card__title"><a class="cda-card__link" href="#werk">${title}</a></h2>`,
    subtitle && `    <p class="cda-card__subtitle">${esc(subtitle)}</p>`,
    text && `    <p class="cda-card__text">${esc(text)}</p>`,
    '  </div>',
    withFavorite &&
      [
        `  <button type="button" class="cda-card__favorite" aria-pressed="${Boolean(favorite)}" aria-label="${esc(name)} merken">`,
        `    <span class="cda-icon" aria-hidden="true">${favorite ? 'remove' : 'add'}</span>`,
        '  </button>',
      ].join('\n'),
    '</article>',
  ]
    .filter(Boolean)
    .join('\n');
}

/** Kleine Karte nur mit Bild: Link um das Bild, das Bild trägt den Titel */
const smallCard = ({ title, img }) =>
  [
    '<article class="cda-card">',
    `  <a class="cda-card__link cda-card__image" href="#werk"><img src="${img}" alt="${esc(plain(title))}" loading="lazy"></a>`,
    '</article>',
  ].join('\n');

const grid = (cards, modifier = '') =>
  [`<ul class="cda-card-grid${modifier}">`, ...cards.map((c) => ['  <li>', indent(c, 2), '  </li>'].join('\n')), '</ul>'].join(
    '\n',
  );

/** Nur für die Vorführung: Merken umschalten wie im Projekt per JavaScript */
function demo({ canvasElement }) {
  for (const button of canvasElement.querySelectorAll('.cda-card__favorite')) {
    button.addEventListener('click', () => {
      const pressed = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(pressed));
      button.querySelector('.cda-icon').textContent = pressed ? 'remove' : 'add';
    });
  }
  for (const link of canvasElement.querySelectorAll('.cda-card__link')) {
    link.addEventListener('click', (event) => event.preventDefault());
  }
}

export default {
  title: 'Komponenten/Werk-Karte',
  id: 'komponenten-werk-karte',
  decorators: [(story) => `<div class="docs-sample">${story()}</div>`],
  parameters: { docs: { source: { excludeDecorators: true } } },
  play: demo,
};

export const Raster = {
  render: () => grid(WORKS.map((w) => card(w))),
};

/** Ohne Merken, wie die Abzüge einer Grafik in cranach-artefacts */
export const OhneMerken = {
  name: 'Ohne Merken',
  render: () =>
    grid([
      card({ title: 'Abzug A, um 1530', text: 'Staatliche Kunstsammlungen Dresden', img: placeholder(3, 4, 40), withFavorite: false }),
      card({ title: 'Abzug B, um 1550', text: 'British Museum, London', img: placeholder(3, 4, 45), withFavorite: false }),
    ]),
};

export const Klein = {
  render: () => grid([...WORKS, ...WORKS].map((w) => smallCard(w)), ' cda-card-grid--small'),
};
