import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { NaviMark, NaviName } from './NaviMark';

/**
 * ナビの発話。
 * 読み上げ環境に届くよう aria-live を付けられるようにしてある。
 */
export function NaviBubble({
  children,
  size = 'md',
  live = false,
  followUp = false,
  listening = false,
}: {
  children: ReactNode;
  size?: 'md' | 'lg';
  live?: boolean;
  /** 深掘りの質問であることを示す */
  followUp?: boolean;
  listening?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <NaviMark size={size === 'lg' ? 36 : 28} listening={listening} className="mt-1 self-start" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <NaviName />
          {followUp && (
            <span className="rounded-full bg-navi-100 px-2 py-0.5 text-xs text-navi-700">
              もう少しだけ
            </span>
          )}
        </div>
        <div
          {...(live ? { 'aria-live': 'polite' as const } : {})}
          className={cn(
            'rounded-lg rounded-tl-sm bg-navi-50 px-4 py-3 text-ink-900',
            size === 'lg' ? 'text-xl sm:text-2xl' : 'text-base',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** 本人の発話。ナビと左右で対にする。 */
export function MyBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%]">
        <p className="mb-1 text-right text-sm font-medium text-ink-600">あなた</p>
        <div className="rounded-lg rounded-tr-sm border border-line bg-surface px-4 py-3 text-base text-ink-900">
          {children}
        </div>
      </div>
    </div>
  );
}
