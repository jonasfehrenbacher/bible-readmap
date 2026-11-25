import chapterCounts from 'virtual:bible-chapter-counts';
import { addMonths, daysBetween, parseDate } from './calendar.ts';
import { interpolate, messages } from './locale.ts';
import type { Language } from './locale.ts';

export const symbols = { diamond: '◆', circle: '●', square: '■', triangle: '▲' } as const;
export const colors = ['red', 'navy', 'green', 'gold'] as const;
export type Marker = { mode: 'symbol' | 'border' | 'none'; symbol: keyof typeof symbols; color: typeof colors[number] };
export const durations = { week1: 0, month1: 1, month3: 3, month6: 6, year1: 12, year2: 24, year3: 36, year4: 48, year5: 60, custom: 0 } as const;
export const displayOptions = ['dates', 'numbers', 'checkbox', 'header', 'subheader', 'legend'] as const;
export const tableColors = { lightGreen: 'soft', cream: 'background', plain: 'paper' } as const;
type Display = Record<typeof displayOptions[number], boolean>;

export interface Settings {
  language: Language;
  start: string;
  duration: keyof typeof durations;
  customDays: number;
  balance: 'words' | 'chapters';
  weekday: number;
  yearsPerPage: 1 | 2;
  readingOrder: 'down' | 'across';
  separateWeeks: boolean;
  tableColor: keyof typeof tableColors;
  display: Display;
  bookMarker: Marker;
  monthMarker: Marker;
}

export const canonical = chapterCounts.flatMap((book, bookIndex) =>
  book.map((words, index) => ({ book: bookIndex, chapter: index + 1, words })));
const totalBooks = chapterCounts.length;
const totalChapters = canonical.length;

export interface Reading { book: number; first: number; last: number }
export interface Day { date: Date; number: number; readings: Reading[]; monthStart: boolean }

export function maxDuration(start: string) {
  const date = parseDate(start);
  return daysBetween(date, addMonths(date, 60));
}

export function summary(length: number, language: Language) {
  const format = new Intl.NumberFormat(language);
  return interpolate(messages[language].planSummary, {
    days: format.format(length), books: totalBooks, chapters: format.format(totalChapters),
  });
}
