import { useEffect, useRef, type ReactNode } from 'react';

/**
 * 確認ダイアログ。
 * Esc で閉じられること、開いた瞬間にフォーカスが中に入ることを保証する。
 */
export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>('button, [href], input')?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-4 sm:items-center">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-lg bg-surface p-6 shadow-overlay"
      >
        <h2 className="text-xl">{title}</h2>
        {description && <div className="mt-3 text-base text-ink-600">{description}</div>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {children}
        </div>
      </div>
    </div>
  );
}
