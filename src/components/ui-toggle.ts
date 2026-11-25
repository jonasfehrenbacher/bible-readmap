import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ui-toggle')
export class UiToggle extends LitElement {
  @property() label = '';
  @property({ type: Boolean }) checked = false;
  static styles = css`
    .toggle { position:relative; display:flex; align-items:center; gap:.55rem; min-height:38px; cursor:pointer; font-size:.875rem; }
    .toggle__input { position:absolute; opacity:0; }
    .toggle__track { display:flex; align-items:center; width:2rem; height:1.15rem; border:1px solid var(--muted);
      background:var(--soft); border-radius:1rem; padding:2px; box-sizing:border-box; flex:none; }
    .toggle__track::after { content:''; width:.78rem; height:.78rem; background:var(--muted); border-radius:50%; }
    .toggle__input:checked + .toggle__track { justify-content:flex-end; background:var(--secondary); border-color:var(--secondary); }
    .toggle__input:checked + .toggle__track::after { background:var(--paper); }
    .toggle__input:focus-visible + .toggle__track { outline:2px solid var(--secondary); outline-offset:2px; }
  `;
  private change(event: Event) {
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: (event.currentTarget as HTMLInputElement).checked, bubbles: true, composed: true,
    }));
  }
  render() {
    return html`<label class="toggle"><input class="toggle__input" type="checkbox" role="switch" .checked=${this.checked} @change=${this.change}>
      <span class="toggle__track" aria-hidden="true"></span>${this.label}</label>`;
  }
}
