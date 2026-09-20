import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraState = 'idle' | 'requesting' | 'ready' | 'denied' | 'unavailable';

/**
 * カメラのプレビューだけを行う。録画・保存は一切しない(プロトタイプのため)。
 * 許可されなかった場合も体験が止まらないよう、必ず代わりの表示に落とす。
 */
export function useCamera(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>('idle');
  /** マイクの入力レベル(0〜1)。見た目のためだけに使う。 */
  const [level, setLevel] = useState(0);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      setState('idle');
      return;
    }
    let cancelled = false;
    let raf = 0;
    let audioCtx: AudioContext | null = null;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setState('unavailable');
        return;
      }
      setState('requesting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setState('ready');

        // マイクが拾えているかを本人に見せるためのレベル表示
        const AudioCtor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtor && stream.getAudioTracks().length > 0) {
          audioCtx = new AudioCtor();
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          source.connect(analyser);
          const buf = new Uint8Array(analyser.frequencyBinCount);
          const tick = () => {
            analyser.getByteTimeDomainData(buf);
            let peak = 0;
            for (const v of buf) peak = Math.max(peak, Math.abs(v - 128) / 128);
            setLevel(peak);
            raf = requestAnimationFrame(tick);
          };
          tick();
        }
      } catch {
        if (!cancelled) setState('denied');
      }
    }
    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      void audioCtx?.close();
      stop();
    };
  }, [enabled, stop]);

  return { videoRef, state, level, stop };
}
