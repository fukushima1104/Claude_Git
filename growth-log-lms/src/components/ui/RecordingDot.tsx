import { cn } from '@/lib/cn';
import { formatClock } from '@/lib/format';

/**
 * 録画状態。
 * 赤は点のみに限定し、枠線や背景には広げない(緊張を増やさないため)。
 */
export function RecordingDot({
  state,
  seconds,
}: {
  state: 'recording' | 'paused';
  seconds: number;
}) {
  const recording = state === 'recording';
  return (
    <div role="status" className="flex items-center gap-2 text-sm">
      <span
        aria-hidden="true"
        className={cn(
          'h-2.5 w-2.5 rounded-full',
          recording ? 'bg-rec animate-pulse' : 'border-2 border-ink-400 bg-transparent',
        )}
      />
      <span className={recording ? 'text-ink-900' : 'text-ink-600'}>
        {recording ? '録画中' : '一時停止中'}
      </span>
      <span className="num text-ink-600">{formatClock(seconds)}</span>
    </div>
  );
}
