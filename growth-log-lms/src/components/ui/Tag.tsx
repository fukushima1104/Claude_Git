import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Tag({
  children,
  className,
  size = 'md',
}: {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium whitespace-nowrap',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        className ?? 'bg-sunken text-ink-600 border-line',
      )}
    >
      {children}
    </span>
  );
}

/** 絞り込みに使う、押せるタグ。 */
export function ToggleTag({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors',
        active
          ? 'bg-primary-700 text-white border-primary-700'
          : 'bg-surface text-ink-700 border-line hover:bg-primary-50',
      )}
    >
      {children}
    </button>
  );
}
