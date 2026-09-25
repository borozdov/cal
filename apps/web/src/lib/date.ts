export const WEEKDAYS_SUN_FIRST = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
export const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta);
}

export function startOfWeek(d: Date): Date {
  return addDays(d, -((d.getDay() + 6) % 7));
}

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// "ПН 29 сен"
export function formatDayShort(iso: string): { weekday: string; day: string } {
  const d = parseIsoDate(iso);
  return { weekday: WEEKDAYS_SUN_FIRST[d.getDay()], day: `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}` };
}

// "понедельник, 29 сентября" is too long for one line on a phone — "ПН, 29 сентября"
export function formatDayLong(iso: string): string {
  const d = parseIsoDate(iso);
  return `${WEEKDAYS_SUN_FIRST[d.getDay()]}, ${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`;
  const h = minutes / 60;
  return Number.isInteger(h) ? `${h} ч` : `${h.toString().replace('.', ',')} ч`;
}

export function pluralPeople(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'человека';
  return 'человек';
}

export function pluralOptions(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'вариантов';
  if (mod10 === 1) return 'вариант';
  if (mod10 >= 2 && mod10 <= 4) return 'варианта';
  return 'вариантов';
}
