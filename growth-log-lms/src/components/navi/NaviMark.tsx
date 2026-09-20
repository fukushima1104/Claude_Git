import { cn } from '@/lib/cn';

/**
 * ナビの印。
 * キャラクターにはせず、同心円だけで表す。
 * 「聞いている」状態のときだけ、いちばん外側の円がゆっくり息をする。
 */
export function NaviMark({
  size = 32,
  listening = false,
  className,
}: {
  size?: number;
  listening?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle
          cx="16"
          cy="16"
          r="15"
          stroke="#3E7C9A"
          strokeOpacity={listening ? 0.5 : 0.28}
          strokeWidth="1.5"
          className={listening ? 'origin-center animate-[naviBreath_3.2s_ease-in-out_infinite]' : ''}
        />
        <circle cx="16" cy="16" r="9.5" stroke="#3E7C9A" strokeOpacity="0.55" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="4" fill="#3E7C9A" />
      </svg>
      <style>{`@keyframes naviBreath {
        0%, 100% { transform: scale(1); opacity: .5; }
        50% { transform: scale(1.06); opacity: .85; }
      }`}</style>
    </span>
  );
}

export function NaviName({ className }: { className?: string }) {
  return (
    <span className={cn('text-sm font-medium text-navi-700', className)}>ナビ</span>
  );
}
