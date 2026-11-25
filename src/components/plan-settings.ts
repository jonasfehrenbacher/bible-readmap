import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { dateFormatter, parseDate } from '../shared/calendar.ts';
import { displayOptions, durations, maxDuration, tableColors } from '../shared/reading-plan.ts';
import type { Marker, Settings } from '../shared/reading-plan.ts';
import { interpolate, messages } from '../shared/locale.ts';
import './marker-settings.ts';
import './ui-choice.ts';
import './ui-disclosure.ts';
import './ui-field.ts';
import './ui-title.ts';
import './ui-toggle.ts';

@customElement('plan-settings')
export class PlanSettings extends LitElement {
  @property({ attribute: false }) settings!: Settings;
  static styles = css`
    :host { display:block; min-width:0; }
    .settings { border:1px solid var(--line); background:var(--paper); border-radius:1rem; padding:clamp(1rem,3.3vw,2.5rem); }
    .settings__title { --title-size:clamp(2rem,4vw,3.5rem); margin-bottom:1.4rem; }
    .settings__fields { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.9rem .75rem; margin-bottom:1.05rem; }
    .settings__wide { grid-column:1 / -1; }
    .settings__advanced { margin-top:1.12rem; }
    .settings__advanced ui-disclosure:last-child { margin-bottom:-.45rem; }
    .settings__toggles { display:grid; grid-template-columns:repeat(auto-fit,minmax(8.5rem,1fr)); gap:.05rem .45rem; }
    .settings__markers { display:grid; gap:.85rem; }
    .settings__table { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.75rem; }
    @media(max-width:410px) { .settings__table { grid-template-columns:1fr; } }
    .settings__hint { margin:.3rem 0 0; color:var(--muted); font-size:.8rem; }
    @media(max-width:720px) {
      .settings__title { margin-bottom:.9rem; }
      .settings__fields { gap:.72rem .65rem; margin-bottom:.8rem; }
      .settings__advanced { margin-top:.85rem; }
    }
  `;
  private updateSettings(patch: Partial<Settings>) {
    this.dispatchEvent(new CustomEvent('settings-change', { detail: patch, bubbles: true, composed: true }));
  }
  render() {
    const s = this.settings;
    const t = messages[s.language];
    const max = maxDuration(s.start);
    return html`<section class="settings">
      <ui-title class="settings__title" level="1" text=${t.planner}></ui-title>
      <div class="settings__fields">
        <ui-field label=${t.start} type="date" value=${s.start} min="0001-01-01" max="9994-12-31"
          formatted=${dateFormatter(s.language, { dateStyle: 'medium' }).format(parseDate(s.start))}
          @field-change=${(e: CustomEvent<string>) => this.updateSettings({ start: e.detail, customDays: Math.min(s.customDays, maxDuration(e.detail)) })}></ui-field>
        <ui-field label=${t.duration} value=${s.duration}
          .options=${(Object.keys(durations) as (keyof typeof durations)[]).map(value => ({ value, label: t[value] }))}
          @field-change=${(e: CustomEvent<Settings['duration']>) => this.updateSettings({ duration: e.detail })}></ui-field>
        ${s.duration === 'custom' ? html`<div class="settings__wide">
          <ui-field label=${t.custom} type="number" min="7" max=${max} value=${String(s.customDays)}
            @field-change=${(e: CustomEvent<string>) => this.updateSettings({ customDays: Number(e.detail) })}></ui-field>
          <p class="settings__hint">${interpolate(t.customRange, { max })}</p>
        </div>` : ''}
        <ui-field label=${t.weekday} value=${String(s.weekday)} .options=${t.weekdays.map((label, index) => ({ value: String(index), label }))}
          @field-change=${(e: CustomEvent<string>) => this.updateSettings({ weekday: Number(e.detail) })}></ui-field>
        <ui-field label=${t.pageLayout} value=${String(s.yearsPerPage)}
          .options=${[{ value: '1', label: t.onePage }, { value: '2', label: t.twoPage }]}
          @field-change=${(e: CustomEvent<string>) => this.updateSettings({ yearsPerPage: e.detail === '2' ? 2 : 1 })}></ui-field>
      </div>
      <ui-choice label=${t.balance} value=${s.balance} .options=${[
        { value: 'words', label: t.words, hint: t.wordsHint, icon: 'words' },
        { value: 'chapters', label: t.chaptersMode, hint: t.chaptersHint, icon: 'chapters' },
      ]} @field-change=${(e: CustomEvent<Settings['balance']>) => this.updateSettings({ balance: e.detail })}></ui-choice>
      <div class="settings__advanced">
        <ui-disclosure label=${t.tableOptions} description=${t.tableOptionsHint} icon="calendar">
          <div class="settings__table">
            <ui-field label=${t.readingOrder} value=${s.readingOrder}
              .options=${[{ value: 'down', label: t.readDown }, { value: 'across', label: t.readAcross }]}
              @field-change=${(e: CustomEvent<Settings['readingOrder']>) => this.updateSettings({ readingOrder: e.detail })}></ui-field>
            <ui-field label=${t.tableSpacing} value=${s.separateWeeks ? 'spaced' : 'joined'}
              .options=${[{ value: 'spaced', label: t.separateWeeks }, { value: 'joined', label: t.joinWeeks }]}
              @field-change=${(e: CustomEvent<string>) => this.updateSettings({ separateWeeks: e.detail === 'spaced' })}></ui-field>
            <ui-field label=${t.tableColor} value=${s.tableColor}
              .options=${(Object.keys(tableColors) as (keyof typeof tableColors)[]).map(value => ({ value, label: t[value] }))}
              @field-change=${(e: CustomEvent<Settings['tableColor']>) => this.updateSettings({ tableColor: e.detail })}></ui-field>
          </div>
        </ui-disclosure>
        <ui-disclosure label=${t.display} description=${t.displayHint}>
          <div class="settings__toggles">${displayOptions.map(key => html`
            <ui-toggle label=${t[key]} .checked=${s.display[key]}
              @field-change=${(e: CustomEvent<boolean>) => this.updateSettings({ display: { ...s.display, [key]: e.detail } })}></ui-toggle>
          `)}</div>
        </ui-disclosure>
        <ui-disclosure label=${t.markers} description=${t.markersHint} icon="marker">
          <div class="settings__markers">${(['bookMarker', 'monthMarker'] as const).map(key => html`
            <marker-settings language=${s.language} label=${t[key]} .marker=${s[key]}
              @field-change=${(e: CustomEvent<Marker>) => this.updateSettings({ [key]: e.detail })}></marker-settings>
          `)}</div>
        </ui-disclosure>
      </div>
    </section>`;
  }
}
