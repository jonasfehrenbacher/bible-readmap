import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ui-icon.ts';

export type Option = { value: string; label: string };

@customElement('ui-field')
export class UiField extends LitElement {
  @property() label = '';
  @property() value = '';
  @property() type = 'select';
  @property() formatted = '';
  @property() min?: string;
  @property() max?: string;
  @property({ attribute: false }) options: Option[] = [];

  static styles = css`
    :host { display:block; min-width:0; }
    .field { display:grid; gap:.4rem; font:600 .875rem var(--sans); }
    .field__control { display:flex; position:relative; align-items:center; min-width:0; }
    .field__input, .field__date { appearance:none; box-sizing:border-box; min-width:0; min-height:45px; width:100%; padding:.55rem .7rem;
      border:1px solid var(--line); border-radius:.5rem; background:var(--paper); color:var(--primary); font:400 .93rem var(--sans); }
    .field__input:is(select, [type=date]), .field__date { padding-right:1.8rem; cursor:pointer; }
    .field__input:focus-visible, .field__control:focus-within .field__date { outline:2px solid var(--secondary); outline-offset:2px; }
    .field__input--date { opacity:0; position:absolute; inset:0; }
    .field__input--date::-webkit-calendar-picker-indicator { position:absolute; inset:0; width:100%; height:100%; margin:0; padding:0; cursor:pointer; }
    .field__date { display:flex; align-items:center; }
    ui-icon { pointer-events:none; position:absolute; right:.65rem; color:var(--muted); font-size:.95rem; }
    :host([compact]) .field { display:block; }
    :host([compact]) .field__label { position:absolute; clip-path:inset(50%); }
    :host([compact]) .field__input { min-height:38px; background:transparent; color:inherit; border-color:var(--compact-border, var(--line)); font-weight:600; padding-left:2rem; }
    :host([compact]) ui-icon { color:inherit; }
    :host([compact]) .field__input:focus-visible { outline-color:var(--accent); }
    :host([compact]) option { color:var(--primary); background:var(--paper); }
    .field__globe { right:auto; left:.65rem; }
  `;

  private change(event: Event) {
    const input = event.currentTarget as HTMLInputElement | HTMLSelectElement;
    if (!input.checkValidity()) {
      input.reportValidity();
      input.value = this.value;
      return;
    }
    this.dispatchEvent(new CustomEvent('field-change', { detail: input.value, bubbles: true, composed: true }));
  }

  private openDate(event: MouseEvent) {
    const input = event.currentTarget as HTMLInputElement;
    if (input.type !== 'date' || !input.showPicker || !event.isTrusted) return;
    try {
      input.showPicker();
    } catch {
      // Embedded previews can restrict showPicker. The native input still handles the click.
    }
  }

  render() {
    return html`<label class="field"><span class="field__label">${this.label}</span><span class="field__control">
      ${this.type === 'select' ? html`
        <select class="field__input" @change=${this.change}>
          ${this.options.map(option => html`<option value=${option.value} ?selected=${option.value === this.value}>${option.label}</option>`)}
        </select>
        ${this.hasAttribute('compact') ? html`<ui-icon class="field__globe" name="globe"></ui-icon>` : ''}
        <ui-icon name="chevron"></ui-icon>`
      : html`
        ${this.type === 'date' ? html`<span class="field__date" aria-hidden="true">${this.formatted}</span>` : ''}
        <input class="field__input field__input--${this.type}" type=${this.type} .value=${this.value}
          min=${ifDefined(this.min)} max=${ifDefined(this.max)} required @click=${this.openDate} @change=${this.change}>
        ${this.type === 'date' ? html`<ui-icon name="calendar"></ui-icon>` : ''}
      `}
    </span></label>`;
  }
}
