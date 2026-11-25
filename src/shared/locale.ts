import en from '../assets/en.json';
import de from '../assets/de.json';

export type Language = 'en' | 'de';
export type Messages = typeof en;
export const messages = { en, de };
export const locales = { en: 'en-US', de: 'de-DE' };

export function interpolate(text: string, values: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
}
