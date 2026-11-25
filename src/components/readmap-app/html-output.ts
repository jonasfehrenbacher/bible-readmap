import { html, render } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { symbols } from '../../shared/reading-plan.ts';
import { cellPadding, metaGap, readingGap } from './print-model.ts';
import type { PrintMarker, PrintModel } from './print-model.ts';
import theme from '../../styles/theme.css?raw';
import printStyles from '../../styles/print.css?raw';

function markerColor(mark: PrintMarker | undefined) {
  return mark ? `var(--marker-${mark.color})` : undefined;
}

function printMarker(mark: PrintMarker) {
  return html`<span class="print-document__marker print-document__marker--${mark.mode}" style=${styleMap({ '--marker-color': markerColor(mark) })} aria-hidden="true">
    ${mark.mode === 'symbol' ? symbols[mark.symbol] : ''}</span>`;
}

function printTemplate(model: PrintModel) {
  const { t } = model;
  return html`<main class="print-document" aria-label=${t.planTitle} style=${styleMap({
    '--row-height': `${model.rowHeight}pt`, '--row-padding': `${model.padding}pt`,
    '--meta-height': `${model.metaHeight}pt`, '--meta-font': `${model.metaFont}pt`,
    '--reading-gap': `${readingGap}pt`, '--meta-gap': `${metaGap}pt`,
    '--cell-padding': `${cellPadding}pt`, '--checkbox-size': `${model.checkboxSize}pt`,
    '--panel-count': String(model.columns), '--panel-gap': `${model.panelGap}pt`,
    '--table-color': `var(--${model.tableColor})`,
  })}>${model.pages.map((page, index) => html`<section class="print-document__page">
      ${model.title ? html`<header class="print-document__header"><h1 class="print-document__title">${model.title}</h1>
        <strong class="print-document__date-range">${page.dateRange}</strong></header>` : ''}
      ${model.subtitle ? html`<p class="print-document__summary">${model.subtitle}</p>` : ''}
      <div role="table" class="print-document__table ${model.panelGap ? 'print-document__table--spaced' : ''}" aria-label=${t.planTitle}>
        <div class="print-document__row" role="row">
          ${Array.from({ length: model.columns }, () => html`<div class="print-document__week" role="presentation">
            ${model.weekdays.map(day => html`<strong class="print-document__weekday" role="columnheader">${day}</strong>`)}
          </div>`)}
        </div>
        ${page.rows.map(row => html`<div role="row" class="print-document__row print-document__row--days">
          ${row.map(week => html`<div class="print-document__week" role="presentation">
            ${week.map(cell => cell ? html`
              <div role="cell" class="print-document__cell ${cell.month?.mode === 'border' ? 'print-document__cell--month' : ''}"
                style=${styleMap({
                  '--marker-color': markerColor(cell.month),
                  '--entry-font': `${cell.font}pt`, '--entry-line': `${cell.lineHeight}pt`,
                })}>
                ${model.hasMeta ? html`<div class="print-document__metadata">
                  ${cell.number ? html`<strong class="print-document__day-number">${cell.number}</strong>` : ''}
                  ${cell.date ? html`<span>${cell.date}</span>` : ''}
                  ${cell.month?.mode === 'symbol' ? printMarker(cell.month) : ''}
                  ${model.checkbox ? html`<span class="print-document__checkbox" aria-hidden="true"></span>` : ''}
                </div>` : ''}
                ${cell.lines.map(line => html`<div class="print-document__line">
                  ${line.map(reading => html`<span class="print-document__reading ${reading.book?.mode === 'border' ? 'print-document__reading--book' : ''}"
                    style=${styleMap({ width: `${reading.width}pt`, '--marker-color': markerColor(reading.book) })}>
                    ${reading.book?.mode === 'symbol' ? printMarker(reading.book) : ''}${reading.text}
                  </span>`)}
                </div>`)}
              </div>` : html`<div role="cell" class="print-document__cell print-document__cell--empty"></div>`)}
          </div>`)}
        </div>`)}
      </div>
      <footer class="print-document__footer">
        ${model.legend.map(item => html`<span class="print-document__legend">${printMarker(item.mark)}${item.label}</span>`)}
        ${model.pages.length > 1 ? html`<span class="print-document__page-number">${t.page} ${index + 1} / ${model.pages.length}</span>` : ''}
      </footer>
    </section>`)}</main>`;
}

export function renderPrint(model: PrintModel, mount: HTMLElement) {
  render(printTemplate(model), mount);
}

export function htmlFile(model: PrintModel) {
  const container = document.createElement('div');
  renderPrint(model, container);
  return new Blob([`<!doctype html><html lang="${model.language}"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1"><title>${model.t.planTitle}</title>
  <style>${theme}\n${printStyles}\n@media screen { body { margin:0; background:var(--background); } }</style>
  </head><body>${container.innerHTML.replace(/<!--(?:\?lit[^>]*|)-->/g, '')}</body></html>`], { type: 'text/html;charset=utf-8' });
}

export function downloadFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
