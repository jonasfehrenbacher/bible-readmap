import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { messages } from '../shared/locale.ts';
import type { Language } from '../shared/locale.ts';
import './ui-field.ts';
import './ui-icon.ts';

@customElement('readmap-hero')
export class ReadmapHero extends LitElement {
  @property() language: Language = 'en';

  static styles = css`
    :host { display:block; color:var(--paper); }
    .hero {
      position:relative; isolation:isolate; min-height:100svh; display:flex; flex-direction:column;
      background:var(--primary);
    }
    .hero__art {
      position:absolute; inset:0; z-index:-1;
      background:
        linear-gradient(90deg,var(--primary) 20%,color-mix(in srgb,var(--primary) 72%,transparent) 61%,color-mix(in srgb,var(--primary) 28%,transparent)),
        linear-gradient(0deg,var(--primary),transparent 70%),
        var(--hero-image) right center / auto 100% no-repeat;
    }
    .hero__nav, .hero__main { width:min(1160px,calc(100% - 64px)); margin-inline:auto; }
    .hero__nav {
      display:flex; align-items:center; justify-content:space-between; gap:.75rem; min-height:76px;
      border-bottom:1px solid color-mix(in srgb,var(--paper) 28%,transparent);
    }
    .hero__brand { display:flex; align-items:center; gap:.65rem; font:400 1.25rem var(--serif); white-space:nowrap; }
    .hero__brand-icon { display:grid; place-items:center; width:36px; height:36px; border-radius:.5rem; border:1px solid var(--accent); color:var(--accent); font-size:1.05rem; }
    .hero__language { --compact-border:color-mix(in srgb,var(--paper) 40%,transparent); background:var(--primary); border-radius:.5rem; }
    .hero__main { flex:1; display:grid; align-content:center; padding:clamp(1.25rem,6vh,4.5rem) 0; }
    @media(max-width:720px) {
      .hero__nav, .hero__main { width:calc(100% - 32px); }
      .hero__nav { min-height:63px; }
      .hero__main { padding:1.1rem 0 1.4rem; }
      .hero__brand { gap:.5rem; font-size:1.06rem; }
      .hero__brand-icon { width:30px; height:30px; }
      .hero__art {
        background:
          linear-gradient(0deg,var(--primary) 4%,color-mix(in srgb,var(--primary) 62%,transparent) 60%,var(--primary)),
          var(--hero-image) 64% bottom / auto 75% no-repeat;
      }
    }
  `;

  private changeLanguage(event: CustomEvent<Language>) {
    this.dispatchEvent(new CustomEvent('language-change', { detail: event.detail, bubbles: true, composed: true }));
  }

  render() {
    const t = messages[this.language];
    return html`<div class="hero">
      <div class="hero__art" aria-hidden="true"></div>
      <header class="hero__nav">
        <div class="hero__brand"><span class="hero__brand-icon"><ui-icon name="book"></ui-icon></span>${t.brand}</div>
        <ui-field class="hero__language" compact label=${t.language} value=${this.language}
          @field-change=${this.changeLanguage}
          .options=${[{ value: 'en', label: 'English' }, { value: 'de', label: 'Deutsch' }]}></ui-field>
      </header>
      <main class="hero__main"><slot></slot></main>
    </div>`;
  }
}
