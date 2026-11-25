import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './ui-icon.ts';
import type { IconName } from './ui-icon.ts';

@customElement('ui-disclosure')
export class UiDisclosure extends LitElement {
  @property() label = '';
  @property() description = '';
  @property() icon: IconName = 'display';
  static styles = css`
    :host { display:block; }
    .disclosure { border-top:1px solid var(--line); }
    .disclosure__summary { display:flex; align-items:center; gap:.7rem; list-style:none; padding:.83rem 0; cursor:pointer; }
    .disclosure__summary::-webkit-details-marker { display:none; }
    .disclosure__summary:focus-visible { outline:2px solid var(--secondary); outline-offset:3px; }
    .disclosure__text { display:grid; gap:.18rem; flex:1; }
    .disclosure__title { font:600 .9rem var(--sans); }
    .disclosure__description { font-size:.75rem; color:var(--muted); }
    .disclosure__icon { color:var(--secondary); }
    .disclosure[open] .disclosure__chevron { transform:rotate(180deg); }
    .disclosure__body { padding:0 0 .9rem 1.7rem; }
  `;
  render() {
    return html`<details class="disclosure">
      <summary class="disclosure__summary">
        <ui-icon class="disclosure__icon" name=${this.icon}></ui-icon>
        <span class="disclosure__text"><span class="disclosure__title">${this.label}</span><span class="disclosure__description">${this.description}</span></span>
        <ui-icon class="disclosure__chevron" name="chevron"></ui-icon>
      </summary>
      <div class="disclosure__body"><slot></slot></div>
    </details>`;
  }
}
