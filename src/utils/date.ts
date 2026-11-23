const DAY = 24 * 60 * 60 * 1000;

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function dayKey(d: Date | string): string {
  const x = typeof d === 'string' ? new Date(d) : d;
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

export function startOfDay(d: Date = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isToday(iso: string): boolean {
  return dayKey(iso) === dayKey(new Date());
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

export function daysUntil(iso: string): number {
  return Math.round((startOfDay(new Date(iso)).getTime() - startOfDay().getTime()) / DAY);
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** "Өнөөдөр 18:00", "Маргааш 09:00", "3 хоногийн дараа", "2 хоног хоцорсон" */
export function formatDue(iso: string): string {
  const n = daysUntil(iso);
  const t = formatTime(iso);
  if (n === 0) return `Өнөөдөр ${t}`;
  if (n === 1) return `Маргааш ${t}`;
  if (n === -1) return `Өчигдөр ${t}`;
  if (n > 1 && n <= 7) return `${n} хоногийн дараа`;
  if (n < -1) return `${-n} хоног хоцорсон`;
  return formatDate(iso);
}

export const weekdayShort = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Өглөөний мэнд';
  if (h < 18) return 'Өдрийн мэнд';
  return 'Оройн мэнд';
}
