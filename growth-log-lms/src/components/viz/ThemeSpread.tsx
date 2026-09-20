import { useMemo } from 'react';
import { monthOf, formatMonth } from '@/lib/format';
import type { LearningRecord } from '@/data/types';
import { cn } from '@/lib/cn';

/**
 * テーマの広がりを、時間の流れとして見せる。
 * 点数や順位ではなく「いつ、どのテーマに触れたか」だけを示す。
 */
export function ThemeSpread({
  records,
  months = 12,
  onSelectTheme,
  selectedTheme,
}: {
  records: LearningRecord[];
  months?: number;
  onSelectTheme?: (tag: string) => void;
  selectedTheme?: string;
}) {
  const { grid, monthKeys, themes } = useMemo(() => {
    const done = records.filter((r) => r.status === 'done');
    const keys = Array.from(new Set(done.map((r) => monthOf(r.date)))).sort();
    const recent = keys.slice(-months);
    const counts = new Map<string, number>();
    done.forEach((r) => r.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    const top = Array.from(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([t]) => t);
    const g = new Map<string, number>();
    done.forEach((r) => {
      const m = monthOf(r.date);
      if (!recent.includes(m)) return;
      r.tags.forEach((t) => {
        if (!top.includes(t)) return;
        const k = `${t}|${m}`;
        g.set(k, (g.get(k) ?? 0) + 1);
      });
    });
    return { grid: g, monthKeys: recent, themes: top };
  }, [records, months]);

  if (themes.length === 0) {
    return <p className="text-base text-ink-600">まだテーマが集まっていません。</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[540px] border-separate border-spacing-y-1">
        <caption className="sr-only-focusable">
          月ごとに、どのテーマの学びがあったかを示した表
        </caption>
        <thead>
          <tr>
            <th className="w-28 text-left text-xs font-normal text-ink-600">テーマ</th>
            {monthKeys.map((m) => (
              <th
                key={m}
                scope="col"
                className="num px-0.5 text-center text-xs font-normal text-ink-600"
              >
                {Number(m.slice(5))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {themes.map((theme) => (
            <tr key={theme}>
              <th scope="row" className="pr-2 text-left text-sm font-normal">
                {onSelectTheme ? (
                  <button
                    type="button"
                    onClick={() => onSelectTheme(theme)}
                    className={cn(
                      'rounded px-1 text-left underline-offset-4 hover:underline',
                      selectedTheme === theme ? 'font-medium text-primary-900' : 'text-ink-700',
                    )}
                  >
                    {theme}
                  </button>
                ) : (
                  <span className="text-ink-700">{theme}</span>
                )}
              </th>
              {monthKeys.map((m) => {
                const n = grid.get(`${theme}|${m}`) ?? 0;
                return (
                  <td key={m} className="px-0.5">
                    <span
                      title={n > 0 ? `${formatMonth(m)}:${n}件` : undefined}
                      className={cn(
                        'block h-6 rounded-sm',
                        n === 0 && 'bg-sunken',
                        n === 1 && 'bg-primary-100',
                        n >= 2 && 'bg-primary-500',
                      )}
                    >
                      <span className="sr-only-focusable">
                        {formatMonth(m)} {n}件
                      </span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-sm text-ink-600">
        濃い四角は、その月にそのテーマの学びがあったことを示します。多いほうが良い、というものではありません。
      </p>
    </div>
  );
}
