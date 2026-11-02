export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));

const pad = (n: number) => String(n).padStart(2, '0');

export interface DateParts { y: number; m: number; d: number } // m is 0-based

export const toIso = ({ y, m, d }: DateParts): string => `${y}-${pad(m + 1)}-${pad(d)}`;

export function parseIso(iso: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) } : null;
}

export const todayParts = (): DateParts => {
  const t = new Date();
  return { y: t.getFullYear(), m: t.getMonth(), d: t.getDate() };
};

/** '2025-03-12' -> '12 Mar 2025' (day, month, year). Timezone-safe: no Date parsing of the string. */
export function formatDate(iso: string): string {
  const p = parseIso(iso);
  return p ? `${pad(p.d)} ${MONTH_SHORT[p.m]} ${p.y}` : '';
}
