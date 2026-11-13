import type { ReactNode } from 'react';
import type { Tone } from '@/lib/rules';

/* Presentational pieces that need no browser state. */

export function Status({ tone, children, className = '' }: { tone: Tone; children: ReactNode; className?: string }) {
  return <span className={`tone-${tone} ${className}`}>{children}</span>;
}

export function Meter({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total ? Math.round((done / total) * 100) : 100;
  return (
    <div
      className={`meter ${pct >= 100 ? 'full' : ''}`}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PageHeader({
  title,
  sub,
  actions,
  crumbs,
}: {
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  crumbs?: ReactNode;
}) {
  return (
    <div className="mb-5">
      {crumbs ? <div className="crumbs mb-3">{crumbs}</div> : null}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1>{title}</h1>
          {sub ? <p className="muted mt-1 text-[0.9375rem]">{sub}</p> : null}
        </div>
        {actions ? <div className="no-print flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Figures({ items }: { items: { n: ReactNode; l: string }[] }) {
  return (
    <div className="figures mb-6">
      {items.map((it) => (
        <div key={it.l}>
          <div className="n">{it.n}</div>
          <div className="l">{it.l}</div>
        </div>
      ))}
    </div>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h2>{children}</h2>
      {aside}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="font-semibold">{title}</p>
      {children ? <div className="muted mx-auto mt-1 max-w-md text-sm">{children}</div> : null}
    </div>
  );
}

export function Dl({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="dl">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v === null || v === undefined || v === '' ? <span className="muted">—</span> : v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`sk ${className}`} aria-hidden="true" />;
}

export function PageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-3 h-7 w-64" />
      <Skeleton className="mb-8 h-4 w-80 max-w-full" />
      <div className="panel">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="border-b border-[var(--color-line-2)] px-4 py-4 last:border-0">
            <Skeleton className="mb-2 h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
