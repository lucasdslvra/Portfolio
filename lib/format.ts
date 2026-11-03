const UTC = { timeZone: 'UTC' } as const;

const monthYear = new Intl.DateTimeFormat('fr-FR', { ...UTC, month: 'long', year: 'numeric' });
const dayMonthYear = new Intl.DateTimeFormat('fr-FR', { ...UTC, day: 'numeric', month: 'long', year: 'numeric' });
const shortMonthYear = new Intl.DateTimeFormat('fr-FR', { ...UTC, month: 'short', year: 'numeric' });

/** « septembre 2026 » */
export function formatMonthYear(iso: string): string {
  return monthYear.format(new Date(iso));
}

/** « 5 septembre 2026 » */
export function formatDate(iso: string): string {
  return dayMonthYear.format(new Date(iso));
}

/** « sept. 2026 » */
export function formatShortDate(iso: string): string {
  return shortMonthYear.format(new Date(iso));
}

const WORDS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix'];

/** Nombre en lettres de 0 à 10, en chiffres au-delà. */
export function numberToWords(n: number): string {
  return WORDS[n] ?? String(n);
}

/** « 4 virages », « 1 virage » */
export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n} ${n > 1 ? pluralForm : singular}`;
}

/** Chrono TV : m:ss.mmm */
export function formatLapTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  const ms = Math.floor((safe * 1000) % 1000);
  return `${m}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}
