import { TODAY } from '@/data/mock';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function parseDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

/** 2026-09-08 → 2026年9月8日(火) */
export function formatDate(iso: string, opts: { weekday?: boolean } = {}): string {
  const d = parseDate(iso);
  const base = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  return opts.weekday ? `${base}(${WEEKDAYS[d.getDay()]})` : base;
}

/** 2026-09-08 → 9月8日 */
export function formatShortDate(iso: string): string {
  const d = parseDate(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 2026-09 → 2026年9月 */
export function formatMonth(ym: string): string {
  const [y, m] = ym.split('-');
  return `${y}年${Number(m)}月`;
}

/** 日数の差。b - a。 */
export function daysBetween(a: string, b: string): number {
  return Math.round(
    (parseDate(b).getTime() - parseDate(a).getTime()) / 86_400_000,
  );
}

/** 「3日前」「今日」「2日後」のような相対表現。 */
export function relativeToToday(iso: string, today = TODAY): string {
  const diff = daysBetween(iso, today);
  if (diff === 0) return '今日';
  if (diff === 1) return '昨日';
  if (diff === -1) return '明日';
  if (diff > 0) {
    if (diff < 7) return `${diff}日前`;
    if (diff < 31) return `${Math.floor(diff / 7)}週間前`;
    if (diff < 365) return `${Math.floor(diff / 30)}か月前`;
    return `${Math.floor(diff / 365)}年前`;
  }
  const ahead = -diff;
  if (ahead < 7) return `あと${ahead}日`;
  if (ahead < 31) return `あと${Math.floor(ahead / 7)}週間`;
  return `あと${Math.floor(ahead / 30)}か月`;
}

/** 412 → 6分52秒 */
export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}分${s}秒` : `${s}秒`;
}

/** 412 → 6:52(再生位置の表示用) */
export function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** 2026-09-08 → 2026-09 */
export function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

export function todayISO(): string {
  return TODAY;
}

/** 今日から n か月前の日付。期間の絞り込みに使う。 */
export function monthsAgo(n: number, from = TODAY): string {
  const d = parseDate(from);
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}
