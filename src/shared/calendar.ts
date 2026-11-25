import { locales } from './locale.ts';
import type { Language } from './locale.ts';

const dayMillis = 86_400_000;

export function localToday() {
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
}

// Use UTC only to represent calendar dates, independently of timezone and DST.
export const parseDate = (value: string) => new Date(`${value}T00:00:00Z`);
export const addDays = (date: Date, days: number) => new Date(date.getTime() + days * dayMillis);
export const daysBetween = (start: Date, end: Date) => (end.getTime() - start.getTime()) / dayMillis;

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months, 1);
  const following = new Date(next);
  following.setUTCMonth(following.getUTCMonth() + 1, 0);
  next.setUTCDate(Math.min(date.getUTCDate(), following.getUTCDate()));
  return next;
}

export function dateFormatter(language: Language, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locales[language], { ...options, timeZone: 'UTC' });
}
