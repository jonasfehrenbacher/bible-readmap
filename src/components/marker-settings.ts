import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { colors, symbols } from '../shared/reading-plan.ts';
import type { Marker } from '../shared/reading-plan.ts';
import { messages } from '../shared/locale.ts';
import type { Language } from '../shared/locale.ts';
import './ui-field.ts';

@customElement('marker-settings')
export class MarkerSettings extends LitElement {
  @property() label = '';
  @property() language: Language = 'en';
  @property({ attribute: false }) marker!: Marker;
  static styles = css`
    :host { display:block; }
    .marker-settings { display:grid; gap:.65rem; grid-template-columns:repeat(auto-fit,minmax(min(100%,8rem),1fr)); }
  `;
  private change(key: keyof Marker, event: CustomEvent<string>) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('field-change', {
      detail: { ...this.marker, [key]: event.detail }, bubbles: true, composed: true,
    }));
  }
  render() {
    const t = messages[this.language];
    return html`<div class="marker-settings">
      <ui-field label=${this.label} value=${this.marker.mode}
        .options=${(['symbol', 'border', 'none'] as const).map(value => ({ value, label: t[value] }))}
        @field-change=${(event: CustomEvent<string>) => this.change('mode', event)}></ui-field>
      ${this.marker.mode === 'symbol' ? html`
        <ui-field label=${t.symbol} value=${this.marker.symbol}
          .options=${(Object.keys(symbols) as (keyof typeof symbols)[]).map(value => ({ value, label: `${symbols[value]} ${t[value]}` }))}
          @field-change=${(event: CustomEvent<string>) => this.change('symbol', event)}></ui-field>` : ''}
      ${this.marker.mode === 'border' ? html`
        <ui-field label=${t.border} value=${this.marker.color}
          .options=${colors.map(value => ({ value, label: t[value] }))}
          @field-change=${(event: CustomEvent<string>) => this.change('color', event)}></ui-field>` : ''}
    </div>`;
  }
}
