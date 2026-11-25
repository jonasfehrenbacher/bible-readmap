import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './ui-icon.ts';
import type { IconName } from './ui-icon.ts';

@customElement('ui-button')
export class UiButton extends LitElement {
  @property() label = '';
  @property() icon?: IconName;
  @property({ type: Boolean }) disabled = false;
  @property() variant = 'secondary';

  static styles = css`
    :host { display:inline-flex; }
    .button { width:100%; min-height:var(--button-height, 44px); display:inline-flex; align-items:center; justify-content:center; gap:.5rem; padding:.65rem .85rem;
      border:1px solid var(--line); border-radius:.5rem; background:var(--paper); color:var(--primary); font:600 .88rem var(--sans); cursor:pointer; }
    .button:hover:not(:disabled) { background:var(--soft); }
    .button:focus-visible { outline:2px solid var(--secondary); outline-offset:2px; }
    .button:disabled { opacity:.42; cursor:default; }
    .button--primary { color:var(--paper); background:var(--secondary); border-color:var(--secondary); }
    .button--primary:hover:not(:disabled) { background:var(--primary); }
    .button--accent { color:var(--primary); background:var(--accent); border-color:var(--accent); padding-inline:1rem; }
    .button--accent:hover:not(:disabled) { background:var(--paper); }
    .button--accent:focus-visible { outline-color:var(--accent); }
    ui-icon { font-size:1.05rem; }
  `;

  render() {
    return html`<button type="button" class="button button--${this.variant}" ?disabled=${this.disabled}>
      ${this.icon ? html`<ui-icon name=${this.icon}></ui-icon>` : ''}
      ${this.label}
    </button>`;
  }
}
