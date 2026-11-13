import { PageSkeleton, Skeleton } from './bits';

/* Placeholders each page shows while its data streams in. Every page owns
   its loading state, so moving between pages (or between a worksite's tabs)
   shows the new page's outline at once instead of waiting on the server. */

export { PageSkeleton };

export function TabSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]" aria-busy="true" aria-label="Loading">
      <div className="panel p-4">
        <Skeleton className="mb-4 h-5 w-48" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="panel p-4">
        <Skeleton className="mb-3 h-5 w-32" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

/** A worksite's Overview: the This week strip, then the two columns. */
export function OverviewSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-[132px] w-full" />
      <TabSkeleton />
    </div>
  );
}

export function WeekSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-[72px] w-full" />
      <Skeleton className="h-6 w-72" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

export function FormSkeleton({ rail = false }: { rail?: boolean }) {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-4 h-4 w-72 max-w-full" />
      <Skeleton className="mb-3 h-7 w-96 max-w-full" />
      <Skeleton className="mb-8 h-4 w-64" />
      <div className={`grid gap-6 ${rail ? 'lg:grid-cols-[minmax(0,1fr)_280px]' : 'lg:grid-cols-[230px_minmax(0,1fr)]'}`}>
        {rail ? null : <Skeleton className="hidden h-80 lg:block" />}
        <Skeleton className="h-96" />
        {rail ? <Skeleton className="h-48" /> : null}
      </div>
    </div>
  );
}

export function PacketSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-4 h-4 w-72 max-w-full" />
      <Skeleton className="mb-8 h-7 w-96 max-w-full" />
      <Skeleton className="mb-5 h-[520px] w-full" />
    </div>
  );
}
