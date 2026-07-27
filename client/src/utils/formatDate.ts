import type { Locale } from '../i18n/translations';

export function formatDate(date: string | Date, locale: Locale): string {
  return new Date(date).toLocaleDateString(locale === 'fi' ? 'fi-FI' : 'en-US');
}
