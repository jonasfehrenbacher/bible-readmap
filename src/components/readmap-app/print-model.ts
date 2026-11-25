import { addMonths, dateFormatter, daysBetween } from '../../shared/calendar.ts';
import { summary, tableColors } from '../../shared/reading-plan.ts';
import type { Day, Marker, Reading, Settings } from '../../shared/reading-plan.ts';
import { messages } from '../../shared/locale.ts';
import type { Messages } from '../../shared/locale.ts';

export type PrintMarker = {
  mode: 'symbol' | 'border';
  symbol: Marker['symbol'];
  color: Marker['color'];
};
export const paper = { width: 841.89, height: 595.28, margin: 22, weekdays: 14 };
export const readingGap = 2;
export const metaGap = 1.2;
export const cellPadding = 2;
type PrintReading = { text: string; book?: PrintMarker };
type PositionedReading = PrintReading & { width: number };
type PrintCell = {
  number: string;
  date: string;
  month?: PrintMarker;
  lineHeight: number;
  font: number;
  lines: PositionedReading[][];
};
type Week = (Day | null)[];
type PrintRow = (PrintCell | null)[];

function marker(mark: Marker, defaultColor: Marker['color']): PrintMarker | undefined {
  return mark.mode === 'none' ? undefined :
    { mode: mark.mode, symbol: mark.symbol, color: mark.mode === 'border' ? mark.color : defaultColor };
}

function groupWeeks(days: Day[], firstWeekday: number): Week[] {
  const offset = (days[0].date.getUTCDay() - firstWeekday + 7) % 7;
  const cells = [...Array<null>(offset).fill(null), ...days];
  const weeks: Week[] = [];
  for (let index = 0; index < cells.length; index += 7) {
    const week = cells.slice(index, index + 7);
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function weekdayLabels(t: Messages, firstWeekday: number) {
  return Array.from({ length: 7 }, (_, i) => t.weekdaysShort[(i + firstWeekday) % 7]);
}

function reference(reading: Reading, names: string[]) {
  return `${names[reading.book]} ${reading.first}${reading.last === reading.first ? '' : `–${reading.last}`}`;
}

interface Page { weeks: Week[]; first: Day; last: Day }

function paginate(days: Day[], settings: Settings): Page[] {
  const start = days[0].date;
  const pages: Page[] = [];
  let offset = 0;
  while (offset < days.length) {
    const limit = addMonths(start, (pages.length + 1) * settings.yearsPerPage * 12);
    const end = Math.min(days.length, daysBetween(start, limit));
    const chunk = days.slice(offset, end);
    const weeks = groupWeeks(chunk, settings.weekday);
    pages.push({ weeks, first: chunk[0], last: chunk[chunk.length - 1] });
    offset = end;
  }
  return pages;
}

function headerDate(date: Date) {
  return date.toISOString().slice(0, 10).split('-').reverse().join('.');
}

function textWidthInEm(text: string) {
  return Array.from(text).reduce((width, character) => {
    if (/[iIl .,:'!|]/.test(character)) return width + .29;
    if (/[frt]/.test(character)) return width + .36;
    if (/[MWmw]/.test(character)) return width + .95;
    if (/[A-ZÄÖÜ]/.test(character)) return width + .74;
    return width + .59;
  }, 0);
}

function fitReadings(readings: PrintReading[], cellWidth: number, height: number) {
  const availableWidth = cellWidth - cellPadding * 2 - .36;
  const widths = readings.map(reading => textWidthInEm(reading.text));
  // A conservative estimate shared by browser print and the vector PDF.
  for (let font = 8.2; ; font -= .2) {
    const lines: PositionedReading[][] = [[]];
    let occupied = 0;
    for (const [index, reading] of readings.entries()) {
      const markerWidth = reading.book?.mode === 'border' ? 2 :
        reading.book?.mode === 'symbol' ? font * .82 + 1.2 : 0;
      const width = widths[index] * font + markerWidth;
      if (width > availableWidth) {
        occupied = Infinity;
        break;
      }
      if (occupied && occupied + readingGap + width > availableWidth) {
        lines.push([]);
        occupied = 0;
      }
      lines[lines.length - 1].push({ ...reading, width });
      occupied += width + (occupied ? readingGap : 0);
    }
    const lineHeight = font * 1.08;
    if (occupied !== Infinity && lines.length * lineHeight <= height) return { lines, font, lineHeight };
  }
}

export function createPrintModel(days: Day[], settings: Settings) {
  const t = messages[settings.language];
  const format = dateFormatter(settings.language, { day: '2-digit', month: '2-digit', year: '2-digit' });
  const bookMarker = marker(settings.bookMarker, 'green');
  const monthMarker = marker(settings.monthMarker, 'red');
  const legend = settings.display.legend ? [
    ...(bookMarker ? [{ mark: bookMarker, label: t.bookMarker }] : []),
    ...(monthMarker ? [{ mark: monthMarker, label: t.monthMarker }] : []),
  ] : [];
  const title = settings.display.header ? t.planTitle : '';
  const subtitle = settings.display.subheader ? `${summary(days.length, settings.language)} · ${t.planOrder}` : '';
  const tableTop = paper.margin + (title ? 26 : 0) + (subtitle ? 17 : 0);
  const pageGroups = paginate(days, settings);
  const maxWeeks = Math.max(...pageGroups.map(page => page.weeks.length));
  const columns = maxWeeks > 54 ? 3 : maxWeeks > 18 ? 2 : 1;
  const panelGap = settings.separateWeeks ? 10 : 0;
  const cellWidth = (paper.width - paper.margin * 2 - panelGap * (columns - 1)) / (columns * 7);
  const tableColor = tableColors[settings.tableColor];
  const footerSpace = legend.length || pageGroups.length > 1 ? 15 : 0;
  const contentHeight = paper.height - paper.margin - tableTop - paper.weekdays - footerSpace;
  const { dates, numbers, checkbox } = settings.display;
  const monthSymbol = monthMarker?.mode === 'symbol' && days.some(day => day.monthStart);
  const hasMeta = dates || numbers || checkbox || monthSymbol;
  const maxReadings = Math.max(1, ...days.map(day => day.readings.length));
  const idealRowHeight = 3 + (maxReadings + Number(hasMeta)) * 9.1;
  const rowCount = Math.max(Math.ceil(maxWeeks / columns), Math.floor(contentHeight / idealRowHeight));
  const rowHeight = contentHeight / rowCount;
  const padding = Math.min(1.5, rowHeight * .052);
  const checkboxSize = checkbox ? Math.min(6.2, Math.max(4.2, rowHeight * .3)) : 0;
  const metaHeight = hasMeta ? Math.max(checkboxSize, Math.min(8.3, rowHeight * .34)) : 0;
  const metaParts = [
    ...(numbers ? [Math.max(3, String(days.length).length) * .59] : []),
    ...(dates ? [textWidthInEm(format.format(days[0].date))] : []),
    ...(monthSymbol ? [.82] : []),
  ];
  const metaWidthInEm = Math.max(1, metaParts.reduce((sum, value) => sum + value, 0));
  const metaWidth = cellWidth - cellPadding * 2 - .36 - checkboxSize
    - Math.max(0, metaParts.length + Number(checkbox) - 1) * metaGap;
  const metaFont = Math.min(metaHeight * .85, metaWidth / metaWidthInEm);
  const readingHeight = rowHeight - padding * 2 - metaHeight;

  const blankWeek = Array<null>(7).fill(null);
  const pages = pageGroups.map(page => {
    const rowsPerPanel = Math.ceil(page.weeks.length / columns);
    const rows: PrintRow[][] = Array.from({ length: rowCount }, (_, row) =>
      Array.from({ length: columns }, (_, column) => {
        const index = settings.readingOrder === 'across' ? row * columns + column : column * rowsPerPanel + row;
        const week = row < rowsPerPanel ? page.weeks[index] ?? blankWeek : blankWeek;
        return week.map(day => {
          if (!day) return null;
          const readings = day.readings.length ? day.readings.map(reading => ({
            text: reference(reading, t.bookShort), book: reading.first === 1 ? bookMarker : undefined,
          })) : [{ text: t.rest }];
          return {
            number: numbers ? String(day.number).padStart(3, '0') : '',
            date: dates ? format.format(day.date) : '',
            month: day.monthStart ? monthMarker : undefined,
            ...fitReadings(readings, cellWidth, readingHeight),
          };
        });
      }));
    const dateRange = dates && title ? `${headerDate(page.first.date)} – ${headerDate(page.last.date)}` : '';
    return { rows, dateRange };
  });
  return {
    t, language: settings.language, title, subtitle, tableTop, checkbox, legend, pages,
    rowHeight, padding, hasMeta, metaHeight, metaFont, checkboxSize, columns, cellWidth, panelGap, tableColor,
    weekdays: weekdayLabels(t, settings.weekday),
  };
}

export type PrintModel = ReturnType<typeof createPrintModel>;
