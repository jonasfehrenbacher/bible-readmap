import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { messages } from '../shared/locale.ts';
import type { Language } from '../shared/locale.ts';
import './ui-button.ts';
import './ui-icon.ts';
import './ui-title.ts';

@customElement('plan-actions')
export class PlanActions extends LitElement {
  @property() language: Language = 'en';
  @property() summary = '';
  @property() layout = '';
  @property({ type: Boolean }) busy = false;
  @property({ type: Boolean }) error = false;

  static styles = css`
    :host { display:block; min-width:0; }
    .actions {
      padding:clamp(1.1rem,3.2vw,2rem); border:1px solid color-mix(in srgb,var(--paper) 34%,transparent);
      border-radius:1rem; background:color-mix(in srgb,var(--primary) 86%,transparent);
    }
    .actions__title { --title-size:clamp(1.65rem,3.9vw,2.6rem); }
    .actions__summary { margin:.55rem 0 0; font-size:1rem; line-height:1.45; color:var(--accent); }
    .actions__format { margin:0; display:flex; align-items:center; flex-wrap:wrap; gap:.45rem; line-height:1.4; font-size:.875rem; }
    .actions__buttons { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.6rem; margin:1.15rem 0 1rem; }
    .actions__print { grid-column:1 / -1; --button-height:3.15rem; }
    .actions__error { margin:.75rem 0 0; color:var(--accent); }
  `;

  private action(detail: 'print' | 'pdf' | 'html') {
    this.dispatchEvent(new CustomEvent('plan-action', { detail, bubbles: true, composed: true }));
  }

  render() {
    const t = messages[this.language];
    return html`<section class="actions">
      <ui-title class="actions__title" text=${t.outputTitle}></ui-title>
      <p class="actions__summary" aria-live="polite">${this.summary}</p>
      <div class="actions__buttons">
        <ui-button class="actions__print" variant="accent" label=${t.print} icon="print" @click=${() => this.action('print')}></ui-button>
        <ui-button label=${t.pdf} icon="download" .disabled=${this.busy} @click=${() => this.action('pdf')}></ui-button>
        <ui-button label=${t.html} icon="code" @click=${() => this.action('html')}></ui-button>
      </div>
      <p class="actions__format"><ui-icon name="file"></ui-icon>${t.paper} · ${this.layout}</p>
      ${this.error ? html`<p class="actions__error" role="alert">${t.error}</p>` : ''}
    </section>`;
  }
}
