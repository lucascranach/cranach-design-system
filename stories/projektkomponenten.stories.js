/**
 * Katalog der Projektkomponenten (ADR 0020): Kacheln aus projektkomponenten.json, Fotos aus
 * assets/projektkomponenten/ (aufgenommen mit npm run catalog:photos oder von Hand).
 */
import catalog from './projektkomponenten.json';
import { code, esc, sample } from './helpers.js';

/** Bild-URLs aus dem Asset-Ordner, nach Dateiname */
const images = Object.fromEntries(
  Object.entries(import.meta.glob('./assets/projektkomponenten/*.webp', { eager: true, query: '?url', import: 'default' })).map(
    ([file, url]) => [file.split('/').pop(), url],
  ),
);

const date = (iso) => new Date(iso).toLocaleDateString('de-DE');

/**
 * Link nach außen. Sichtbar steht ein kurzer Text („Ansehen“), Screenreader hören den vollen Namen –
 * sonst gäbe es viele gleichlautende Links.
 */
const external = (href, text, full) =>
  `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}<span class="cda-u-visually-hidden"> – ${esc(full)} (neues Fenster)</span></a>`;

const shot = (c) => {
  const url = images[c.image];
  if (url && c.shot) {
    return `<a class="docs-catalog__shot" href="${url}" target="_blank" rel="noopener">
      <img src="${url}" alt="Bildschirmfoto: ${esc(c.name)} in ${esc(c.project)} (groß anzeigen)" loading="lazy">
    </a>`;
  }
  return `<div class="docs-catalog__shot docs-catalog__shot--empty">Kein Foto: ${esc(c.noPhoto ?? 'fehlt noch')}</div>`;
};

const card = (c) => `
  <li class="docs-catalog__item">
    ${shot(c)}
    <div class="docs-catalog__body">
      <h3 class="docs-catalog__title">${esc(c.name)}</h3>
      <div>${code(c.project)}</div>
      <p>${esc(c.purpose)}</p>
      <p class="docs-muted">${esc(c.path)}${c.shot ? ` · Foto vom ${date(c.shot)}` : ''}</p>
      <div class="docs-catalog__links">
        ${c.live ? external(c.live, 'Ansehen', `${c.name} in ${c.project}`) : '<span class="docs-muted">keine öffentliche Seite</span>'}
        ${external(c.code, 'Code', `${c.name} auf GitHub`)}
      </div>
    </div>
  </li>`;

export default {
  title: 'Projektkomponenten',
  parameters: { docs: { canvas: { sourceState: 'none' } } },
};

/** Alle Einträge, nach Projekt sortiert wie in der Datei */
export const Katalog = {
  render: () => sample(`<ul class="docs-catalog">${catalog.components.map(card).join('')}</ul>`),
};
