import { addDays, addMonths, daysBetween, parseDate } from '../../shared/calendar.ts';
import { canonical, durations, maxDuration } from '../../shared/reading-plan.ts';
import type { Day, Reading, Settings } from '../../shared/reading-plan.ts';

const readingOrders = { canonical };

export function dayCount(settings: Settings) {
  const start = parseDate(settings.start);
  if (settings.duration === 'custom') return Math.min(maxDuration(settings.start), Math.max(7, settings.customDays));
  if (settings.duration === 'week1') return 7;
  return daysBetween(start, addMonths(start, durations[settings.duration]));
}

export function generatePlan(settings: Settings, order: keyof typeof readingOrders = 'canonical'): Day[] {
  const start = parseDate(settings.start);
  const length = dayCount(settings);
  const chapters = readingOrders[order];
  const weights = settings.balance === 'words' ? chapters.map(chapter => chapter.words) : chapters.map(() => 1);
  const cumulative = [0];
  for (const weight of weights) cumulative.push(cumulative[cumulative.length - 1] + weight);
  const total = cumulative[cumulative.length - 1];
  let previous = 0;
  let boundary = 0;
  return Array.from({ length }, (_, index) => {
    const remaining = length - index - 1;
    const target = total * (index + 1) / length;
    const min = length <= chapters.length ? previous + 1 : Math.max(previous, chapters.length - remaining);
    const max = length <= chapters.length ? chapters.length - remaining : Math.min(chapters.length, previous + 1);
    boundary = Math.max(min, boundary);
    while (boundary < max && Math.abs(cumulative[boundary + 1] - target) <= Math.abs(cumulative[boundary] - target)) boundary++;
    const readings: Reading[] = [];
    for (const chapter of chapters.slice(previous, boundary)) {
      const last = readings.at(-1);
      if (last?.book === chapter.book && last.last + 1 === chapter.chapter) last.last = chapter.chapter;
      else readings.push({ book: chapter.book, first: chapter.chapter, last: chapter.chapter });
    }
    previous = boundary;
    const date = addDays(start, index);
    return { date, number: index + 1, readings, monthStart: date.getUTCDate() === 1 };
  });
}
