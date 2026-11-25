import { LitElement, css, html, svg } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const icons = {
  book: svg`<path d="M12 6c-3-2.5-6-3-10-2v15c4-1 7-.5 10 2 3-2.5 6-3 10-2V4c-4-1-7-.5-10 2Z"/><path d="M12 6v15"/>`,
  calendar: svg`<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h2m4 0h2m-8 3h2"/>`,
  globe: svg`<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>`,
  chevron: svg`<path d="m6 9 6 6 6-6"/>`,
  print: svg`<path d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6zM17 11h1"/>`,
  download: svg`<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>`,
  code: svg`<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16"/>`,
  display: svg`<path d="M4 6h16M4 12h16M4 18h16M9 4v4m6 2v4m-6 2v4"/>`,
  marker: svg`<path d="m12 3 9 9-9 9-9-9 9-9Z"/>`,
  words: svg`<path d="M4 5h16M4 10h12M4 15h16M4 20h10"/>`,
  chapters: svg`<path d="M10 3 7 21m10-18-3 18M4 9h16M3 15h16"/>`,
  file: svg`<path d="M13 3H5v18h14V9Zm0 0v6h6M8 13h8m-8 4h8"/>`,
};
export type IconName = keyof typeof icons;

@customElement('ui-icon')
export class UiIcon extends LitElement {
  @property() name: IconName = 'book';
  static styles = css`:host { display:inline-flex; width:1em; height:1em; flex:none; } svg { width:100%; height:100%; }`;
  render() {
    return html`<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${icons[this.name]}</svg>`;
  }
}
