/**
 * Der Skip-Link ist position: fixed. Die Beispielfläche bekommt hier ein transform; damit bezieht
 * sich fixed auf die Fläche statt auf das Fenster, und der Link erscheint in der Doku an der
 * richtigen Stelle; overflow: hidden versteckt ihn oberhalb der Fläche wie sonst oberhalb des
 * Fensters. In Projekten ist beides nicht nötig.
 */
const frame = (html) =>
  `<div class="docs-sample" style="position: relative; overflow: hidden; transform: translateZ(0); min-block-size: 12rem">${html}</div>`;

const page = [
  '<a class="cda-skip-link" href="#inhalt">Zum Inhalt springen</a>',
  '<header class="cda-header">',
  '  <nav class="cda-header__nav" aria-label="Hauptnavigation">',
  '    <ul class="cda-header__menu">',
  '      <li><a class="cda-header__link" href="#werke">Werke</a></li>',
  '      <li><a class="cda-header__link" href="#grafiken">Grafiken</a></li>',
  '      <li><a class="cda-header__link" href="#literatur">Literatur</a></li>',
  '    </ul>',
  '  </nav>',
  '</header>',
  '<main id="inhalt">',
  '  <h1>Adam und Eva</h1>',
  '  <p>Hier beginnt der Inhalt der Seite. <a href="#provenienz">Zur Provenienz</a></p>',
  '</main>',
].join('\n');

export default {
  title: 'Komponenten/Skip-Link',
  parameters: { docs: { source: { excludeDecorators: true } } },
};

/** Zum Ausprobieren: in die Fläche klicken, dann Tab drücken */
export const Ausprobieren = {
  decorators: [(story) => frame(`<p class="docs-muted">Hier klicken, dann Tab drücken.</p>\n${story()}`)],
  render: () => page,
};

/** Aussehen, wenn er den Fokus hat – hier dauerhaft gezeigt (Hilfsklasse nur für die Doku) */
export const Aussehen = {
  decorators: [(story) => frame(`<div class="docs-skip-link-visible">${story()}</div>`)],
  render: () => '<a class="cda-skip-link" href="#inhalt">Zum Inhalt springen</a>',
};
