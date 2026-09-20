import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** 注目してほしいカード(振り返り待ちなど)。急かさない琥珀色で縁取る。 */
  tone?: 'default' | 'attention' | 'navi';
  as?: 'div' | 'li' | 'article' | 'section';
}

const TONES = {
  default: 'bg-surface border-line',
  attention: 'bg-amber-50 border-amber-100',
  navi: 'bg-navi-50 border-navi-100',
} as const;

export function Card({ children, className, tone = 'default', as: Tag = 'div' }: CardProps) {
  return (
    <Tag className={cn('rounded-lg border shadow-card', TONES[tone], className)}>
      {children}
    </Tag>
  );
}

/** カード全体がひとつのリンクになるもの。フォーカス枠がカード全体に出る。 */
export function CardLink({
  to,
  children,
  className,
  tone = 'default',
}: CardProps & { to: string }) {
  return (
    <Link
      to={to}
      className={cn(
        'block rounded-lg border shadow-card transition-colors hover:border-primary-100 hover:bg-primary-50/40',
        TONES[tone],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function CardHeader({
  title,
  action,
  description,
}: {
  title: ReactNode;
  action?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-6">
      <div>
        <h2 className="text-lg">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}
