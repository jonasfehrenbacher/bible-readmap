import { jsPDF } from 'jspdf';
import { cellPadding, metaGap, paper, readingGap } from './print-model.ts';
import type { PrintMarker, PrintModel } from './print-model.ts';

export function pdfFile(model: PrintModel) {
  const doc = new jsPDF({ unit: 'pt', orientation: 'landscape', format: 'a4', compress: true });
  const theme = getComputedStyle(document.documentElement);
  const color = (name: string) => theme.getPropertyValue(`--${name}`).trim();
  const markerColor = (mark: PrintMarker) => color(mark.color === 'green' ? 'secondary' : mark.color === 'gold' ? 'accent' : `marker-${mark.color}`);
  const { margin, width, height, weekdays } = paper;
  const { cellWidth, panelGap } = model;
  const panelWidth = cellWidth * 7;

  function text(value: string, x: number, y: number, size: number, fill: string, maxWidth = Infinity) {
    value = value.replace(/[\u00a0\u2009\u202f]/g, ' ');
    doc.setFontSize(size);
    doc.setTextColor(color(fill));
    const actualWidth = doc.getTextWidth(value);
    if (actualWidth > maxWidth) doc.setFontSize(size * maxWidth / actualWidth);
    doc.text(value, x, y);
  }

  function drawMarker(mark: PrintMarker, x: number, y: number, size: number) {
    const paint = markerColor(mark);
    doc.setDrawColor(paint).setFillColor(paint).setLineWidth(.6);
    switch (mark.mode === 'border' ? 'border' : mark.symbol) {
      case 'border': doc.rect(x, y - size, size, size); break;
      case 'circle': doc.circle(x + size / 2, y - size / 2, size / 2, 'F'); break;
      case 'square': doc.rect(x, y - size, size, size, 'F'); break;
      case 'triangle': doc.triangle(x, y, x + size / 2, y - size, x + size, y, 'F'); break;
      case 'diamond':
        doc.lines([[size / 2, size / 2], [size / 2, -size / 2], [-size / 2, -size / 2]],
          x, y - size / 2, [1, 1], 'F', true);
        break;
    }
  }

  doc.setProperties({ title: model.t.planTitle, creator: model.t.brand });
  model.pages.forEach((page, pageIndex) => {
    if (pageIndex) doc.addPage();
    if (model.title) {
      doc.setFont('times', 'bold');
      text(model.title, margin, margin + 16, 19, 'primary');
      doc.setFont('helvetica', 'bold').setFontSize(8.5);
      text(page.dateRange, width - margin - doc.getTextWidth(page.dateRange), margin + 16, 8.5, 'primary');
    }
    doc.setFont('helvetica', 'normal');
    if (model.subtitle) text(model.subtitle, margin, margin + (model.title ? 26 : 0) + 8, 8.5, 'muted');

    for (let column = 0; column < model.columns; column++) {
      const left = margin + column * (panelWidth + panelGap);
      doc.setFillColor(color(model.tableColor)).rect(left, model.tableTop, panelWidth, weekdays, 'F');
      doc.setFont('helvetica', 'bold').setFontSize(7.5);
      model.weekdays.forEach((label, i) =>
        text(label, left + i * cellWidth + (cellWidth - doc.getTextWidth(label)) / 2, model.tableTop + 9.7, 7.5, 'secondary'));
    }
    doc.setFont('helvetica', 'normal');

    page.rows.forEach((row, rowIndex) => {
      const top = model.tableTop + weekdays + rowIndex * model.rowHeight;
      row.forEach((week, column) => {
        const left = margin + column * (panelWidth + panelGap);
        week.forEach((cell, index) => {
          const x = left + index * cellWidth;
          doc.setDrawColor(color('line')).setFillColor(color(model.tableColor)).setLineWidth(.36);
          doc.rect(x, top, cellWidth, model.rowHeight, cell ? 'S' : 'FD');
          if (!cell) return;
          if (cell.month?.mode === 'border') {
            doc.setDrawColor(markerColor(cell.month)).setLineWidth(.7);
            doc.rect(x + .4, top + .4, cellWidth - .8, model.rowHeight - .8);
          }
          const contentTop = top + model.padding;
          if (model.hasMeta) {
            const { metaHeight, metaFont } = model;
            const baseline = contentTop + (metaHeight - metaFont) / 2 + metaFont * .82;
            let metaX = x + cellPadding;
            if (model.checkbox) {
              const size = model.checkboxSize;
              doc.setDrawColor(color('muted')).setLineWidth(.55)
                .rect(x + cellWidth - cellPadding - size, contentTop, size, size);
            }
            if (cell.number) {
              doc.setFont('helvetica', 'bold');
              text(cell.number, metaX, baseline, metaFont, 'primary');
              metaX += doc.getTextWidth(cell.number) + metaGap;
              doc.setFont('helvetica', 'normal');
            }
            if (cell.date) {
              text(cell.date, metaX, baseline, metaFont, 'muted');
              metaX += doc.getTextWidth(cell.date) + metaGap;
            }
            if (cell.month?.mode === 'symbol') {
              drawMarker(cell.month, metaX, baseline, metaFont * .6);
            }
          }
          cell.lines.forEach((line, lineIndex) => {
            const lineTop = contentTop + model.metaHeight + lineIndex * cell.lineHeight;
            const baseline = lineTop + (cell.lineHeight - cell.font) / 2 + cell.font * .82;
            let readingX = x + cellPadding;
            line.forEach(reading => {
              let textX = readingX;
              if (reading.book?.mode === 'symbol') {
                drawMarker(reading.book, textX, baseline, cell.font * .54);
                textX += cell.font * .82 + 1.2;
              }
              if (reading.book?.mode === 'border') {
                doc.setDrawColor(markerColor(reading.book)).setLineWidth(.6);
                doc.rect(readingX, lineTop + .2, reading.width, cell.lineHeight - .4);
                textX += 1;
              }
              const endPadding = reading.book?.mode === 'border' ? 1 : 0;
              text(reading.text, textX, baseline, cell.font, 'primary', readingX + reading.width - textX - endPadding);
              readingX += reading.width + readingGap;
            });
          });
        });
      });
    });

    let legendX = margin;
    const footerY = height - margin - 2;
    for (const item of model.legend) {
      drawMarker(item.mark, legendX, footerY, 5);
      text(item.label, legendX + 8, footerY, 8, 'muted');
      legendX += 18 + doc.getTextWidth(item.label);
    }
    if (model.pages.length > 1) {
      const pageLabel = `${model.t.page} ${pageIndex + 1} / ${model.pages.length}`;
      doc.setFontSize(8);
      text(pageLabel, width - margin - doc.getTextWidth(pageLabel), footerY, 8, 'muted');
    }
  });

  return doc.output('blob');
}
