import type { ReactNode, RefObject } from 'react';
import { cn } from '@/lib/cn';
import type { CameraState } from '@/lib/useCamera';

/**
 * 自分の映像を映す枠。
 * カメラが使えないときも、同じ大きさの落ち着いた面に置き換えて体験を止めない。
 */
export function CameraStage({
  videoRef,
  state,
  paused,
  children,
  className,
}: {
  videoRef: RefObject<HTMLVideoElement>;
  state: CameraState;
  paused?: boolean;
  /** 字幕など、映像の上に重ねるもの */
  children?: ReactNode;
  className?: string;
}) {
  const fallback = state === 'denied' || state === 'unavailable';
  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-lg border border-line bg-ink-900',
        className,
      )}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        aria-label="あなたのカメラ映像"
        className={cn(
          'h-full w-full -scale-x-100 object-cover transition-opacity',
          fallback ? 'opacity-0' : paused ? 'opacity-40' : 'opacity-100',
        )}
      />

      {state === 'requesting' && (
        <p className="absolute inset-0 grid place-content-center text-sm text-white/80">
          カメラの使用を確認しています…
        </p>
      )}

      {fallback && (
        <div className="absolute inset-0 grid place-content-center gap-2 bg-sunken px-6 text-center">
          <p className="text-base text-ink-700">
            カメラは使わずに進められます。
          </p>
          <p className="text-sm text-ink-600">
            文字だけでも、同じように記録が残ります。
          </p>
        </div>
      )}

      {paused && !fallback && (
        <p className="absolute inset-0 grid place-content-center text-md text-white">
          一時停止中
        </p>
      )}

      {children}
    </div>
  );
}

/** 映像の上に出すリアルタイム字幕。 */
export function CaptionOverlay({
  text,
  size,
}: {
  text: string;
  size: 'sm' | 'md' | 'lg';
}) {
  if (!text) return null;
  return (
    <p
      aria-hidden="true"
      className={cn(
        'absolute inset-x-3 bottom-3 rounded-md bg-ink-900/80 px-3 py-2 text-white',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-base',
        size === 'lg' && 'text-lg',
      )}
    >
      {text}
    </p>
  );
}

/** マイクが拾えているかを示すレベル表示。 */
export function MicLevel({ level, label = 'マイク' }: { level: number; label?: string }) {
  const bars = 6;
  const lit = Math.min(bars, Math.round(level * bars * 2.2));
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-ink-600">{label}</span>
      <span className="flex gap-1" role="status" aria-label={`${label}の入力レベル`}>
        {Array.from({ length: bars }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-3 w-1.5 rounded-sm',
              i < lit ? 'bg-grow-500' : 'bg-line-strong',
            )}
          />
        ))}
      </span>
    </div>
  );
}
