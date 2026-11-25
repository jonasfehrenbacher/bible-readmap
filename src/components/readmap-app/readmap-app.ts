import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { localToday } from '../../shared/calendar.ts';
import { dayCount, generatePlan } from './generate.ts';
import { summary } from '../../shared/reading-plan.ts';
import type { Settings } from '../../shared/reading-plan.ts';
import { createPrintModel } from './print-model.ts';
import { downloadFile, htmlFile, renderPrint } from './html-output.ts';
import { messages } from '../../shared/locale.ts';
import type { Language } from '../../shared/locale.ts';
import '../plan-actions.ts';
import '../plan-settings.ts';
import '../readmap-hero.ts';

function defaultSettings(start: string): Settings {
  return {
    language: 'en', start, duration: 'year1', customDays: 365, balance: 'words', weekday: 0, yearsPerPage: 1,
    readingOrder: 'down', separateWeeks: true, tableColor: 'lightGreen',
    display: { dates: true, numbers: true, checkbox: true, header: true, subheader: true, legend: true },
    bookMarker: { mode: 'symbol', symbol: 'diamond', color: 'green' },
    monthMarker: { mode: 'border', symbol: 'diamond', color: 'red' },
  };
}

@customElement('readmap-app')
export class ReadmapApp extends LitElement {
  @property({ attribute: 'initial-date' }) initialDate = '';
  @state() private settings?: Settings;
  @state() private pdfBusy = false;
  @state() private outputError = false;

  static styles = css`
    :host { display:block; min-height:100svh; }
    .planner { display:grid; grid-template-columns:minmax(0,1.27fr) minmax(0,1fr); align-items:center; gap:clamp(1rem,5vw,5.25rem); }
    .planner__settings { color:var(--primary); }
    @media(max-width:720px) { .planner { grid-template-columns:minmax(0,1fr); } }
  `;

  private get activeSettings() {
    return this.settings ?? defaultSettings(this.initialDate);
  }

  private preparePrint = () => {
    const mount = document.getElementById('print-mount');
    if (!mount) return;
    const settings = this.activeSettings;
    renderPrint(createPrintModel(generatePlan(settings), settings), mount);
  };

  private clearPrint = () => {
    const mount = document.getElementById('print-mount');
    // Removing the whole mount also discards Lit's cached render root.
    if (mount) mount.replaceWith(mount.cloneNode(false));
  };

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('beforeprint', this.preparePrint);
    window.addEventListener('afterprint', this.clearPrint);
  }

  disconnectedCallback() {
    window.removeEventListener('beforeprint', this.preparePrint);
    window.removeEventListener('afterprint', this.clearPrint);
    super.disconnectedCallback();
  }

  protected firstUpdated() {
    // Hydrate with the date in the HTML first, then honor the visitor's local date.
    const today = localToday();
    if (today !== this.initialDate && !this.settings) this.settings = defaultSettings(today);
  }

  private updateSettings(patch: Partial<Settings>) {
    this.settings = { ...this.activeSettings, ...patch };
    document.documentElement.lang = this.settings.language;
    document.title = `${messages[this.settings.language].brand} · ${messages[this.settings.language].edition}`;
    this.outputError = false;
  }

  private async output(event: CustomEvent<'print' | 'html' | 'pdf'>) {
    const action = event.detail;
    this.outputError = false;
    if (action === 'print') {
      this.preparePrint();
      window.print();
      return;
    }
    const settings = this.activeSettings;
    const model = createPrintModel(generatePlan(settings), settings);
    const name = `${model.t.filename}-${settings.start}`;
    try {
      if (action === 'html') downloadFile(htmlFile(model), `${name}.html`);
      if (action === 'pdf') {
        this.pdfBusy = true;
        const { pdfFile } = await import('./pdf-output.ts');
        downloadFile(pdfFile(model), `${name}.pdf`);
      }
    } catch (error) {
      console.error(error);
      this.outputError = true;
    } finally {
      if (action === 'pdf') this.pdfBusy = false;
    }
  }

  render() {
    const settings = this.activeSettings;
    const t = messages[settings.language];
    return html`<readmap-hero language=${settings.language}
      @language-change=${(event: CustomEvent<Language>) => this.updateSettings({ language: event.detail })}>
      <div class="planner">
        <plan-settings class="planner__settings" .settings=${settings}
          @settings-change=${(event: CustomEvent<Partial<Settings>>) => this.updateSettings(event.detail)}></plan-settings>
        <plan-actions language=${settings.language} summary=${summary(dayCount(settings), settings.language)}
          layout=${settings.yearsPerPage === 1 ? t.onePage : t.twoPage} .busy=${this.pdfBusy} .error=${this.outputError}
          @plan-action=${this.output}></plan-actions>
      </div>
    </readmap-hero>`;
  }
}
