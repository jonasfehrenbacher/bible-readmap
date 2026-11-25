import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ui-title')
export class UiTitle extends LitElement {
  @property() level = '2';
  @property() text = '';
  static styles = css`
    :host { display:block; }
    .title { margin:0; font-family:var(--serif); font-size:var(--title-size, clamp(1.65rem, 2.6vw, 2.2rem)); font-weight:400; line-height:1.06; letter-spacing:-.035em; }
  `;
  render() {
    if (this.level === '1') return html`<h1 class="title">${this.text}</h1>`;
    return html`<h2 class="title">${this.text}</h2>`;
  }
}
