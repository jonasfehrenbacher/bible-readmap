import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './ui-icon.ts';
import type { IconName } from './ui-icon.ts';

interface Choice { value: string; label: string; hint: string; icon: IconName }

@customElement('ui-choice')
export class UiChoice extends LitElement {
  @property() label = '';
  @property() value = '';
  @property({ attribute: false }) options: Choice[] = [];
  static styles = css`
    :host { display:block; }
    .choice { border:0; padding:0; margin:0; min-width:0; }
    .choice__label { font:600 .875rem var(--sans); margin-bottom:.4rem; padding:0; }
    .choice__options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.65rem; }
    .choice__option { box-sizing:border-box; position:relative; cursor:pointer; display:flex; align-items:center; gap:.55rem; min-height:64px;
      border-radius:.5rem; border:1px solid var(--line); padding:.6rem .65rem; background:var(--paper); }
    .choice__option:has(:checked) { border-color:var(--secondary); background:var(--soft); }
    .choice__option:has(:focus-visible) { outline:2px solid var(--secondary); outline-offset:2px; }
    .choice__input { position:absolute; opacity:0; }
    .choice__text { display:grid; gap:.18rem; }
    .choice__name { font:600 .86rem var(--sans); }
    .choice__hint { color:var(--muted); font-size:.75rem; }
    ui-icon { color:var(--secondary); font-size:1.05rem; }
    @media(max-width:380px) { .choice__option { gap:.35rem; padding:.45rem; } }
  `;
  private change(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    if (input.checked) this.dispatchEvent(new CustomEvent('field-change', { detail: input.value, bubbles: true, composed: true }));
  }
  render() {
    return html`<fieldset class="choice"><legend class="choice__label">${this.label}</legend>
      <div class="choice__options">${this.options.map(option => html`
        <label class="choice__option"><input class="choice__input" type="radio" name="choice" .value=${option.value}
          .checked=${option.value === this.value} @change=${this.change}>
          <ui-icon name=${option.icon}></ui-icon><span class="choice__text">
            <span class="choice__name">${option.label}</span><span class="choice__hint">${option.hint}</span>
          </span>
        </label>`)}</div>
    </fieldset>`;
  }
}
