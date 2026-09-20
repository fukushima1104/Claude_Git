import { cn } from '@/lib/cn';

/**
 * 3つの質問の進み具合。
 * 残り時間やパーセンテージは出さない(急かさないため)。
 */
export function StepBar({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <nav aria-label="振り返りの進み具合">
      <ol className="flex items-center gap-1">
        {steps.map((label, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  'h-2.5 w-2.5 shrink-0 rounded-full border-2',
                  state === 'done' && 'border-primary-700 bg-primary-700',
                  state === 'current' && 'border-primary-700 bg-surface',
                  state === 'todo' && 'border-line-strong bg-surface',
                )}
              />
              <span
                className={cn(
                  'truncate text-sm',
                  state === 'current' ? 'font-medium text-ink-900' : 'text-ink-600',
                )}
              >
                <span className="num mr-1">{i + 1}.</span>
                {label}
              </span>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'hidden h-px flex-1 sm:block',
                    i < current ? 'bg-primary-700' : 'bg-line',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="sr-only-focusable">
        全3問中 {current + 1} 問目です。
      </p>
    </nav>
  );
}
