import type { ReactNode } from 'react';

export function PageHeader({
  title,
  lead,
  action,
}: {
  title: string;
  lead?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl">{title}</h1>
        {lead && <p className="mt-2 max-w-2xl text-base text-ink-600">{lead}</p>}
      </div>
      {action}
    </header>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-lg">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong bg-surface/60 px-6 py-12 text-center text-base text-ink-600">
      {children}
    </div>
  );
}
