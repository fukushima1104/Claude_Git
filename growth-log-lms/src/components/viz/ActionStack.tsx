import type { Goal } from '@/data/types';
import { cn } from '@/lib/cn';

/**
 * 行動の積み重ね。
 * 達成率ではなく「積んだ数」として見せる。未達も欠けた印ではなく、別の色の積み木にする。
 */
export function ActionStack({ goals }: { goals: Goal[] }) {
  const counts = {
    achieved: goals.filter((g) => g.status === 'achieved').length,
    inProgress: goals.filter((g) => g.status === 'inProgress').length,
    revising: goals.filter((g) => g.status === 'revising').length,
    notStarted: goals.filter((g) => g.status === 'notStarted').length,
  };
  const items: { key: keyof typeof counts; label: string; cls: string }[] = [
    { key: 'achieved', label: '達成', cls: 'bg-grow-500' },
    { key: 'inProgress', label: '実行中', cls: 'bg-navi-600' },
    { key: 'revising', label: '見直し', cls: 'bg-amber-500' },
    { key: 'notStarted', label: '未着手', cls: 'bg-line-strong' },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {items.flatMap((item) =>
          Array.from({ length: counts[item.key] }, (_, i) => (
            <span
              key={`${item.key}-${i}`}
              title={item.label}
              className={cn('h-5 w-5 rounded-sm', item.cls)}
            />
          )),
        )}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-sm text-ink-600">
            <span className={cn('h-3 w-3 rounded-sm', item.cls)} aria-hidden="true" />
            {item.label}
            <span className="num text-ink-900">{counts[item.key]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
