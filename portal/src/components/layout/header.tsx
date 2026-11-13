import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { fmtShort } from '@/lib/format';
import { WEEK_COUNT } from '@/lib/program';
import { getClock } from '@/server/clock';
import { getCurrentMonitor } from '@/server/session';
import { TopNavFallback, TopNavLinks } from './nav';

async function HeaderStatus() {
  const clock = await getClock();
  let name = '';
  try {
    name = (await getCurrentMonitor()).name;
  } catch {
    /* the page itself reports a database problem */
  }
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="num muted whitespace-nowrap">
        Week {clock.week}
        <span className="hidden sm:inline"> of {WEEK_COUNT}</span>
        <span className="hidden lg:inline">
          {' '}
          · {fmtShort(clock.weekInfo.start)} – {fmtShort(clock.weekInfo.end)}
        </span>
      </span>
      {name ? (
        <span className="hidden border-l border-[var(--color-line)] pl-4 font-medium text-[var(--color-ink-2)] md:inline">
          {name}
        </span>
      ) : null}
    </div>
  );
}

export function Header() {
  return (
    <header className="site-header sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-panel)]">
      <div className="shell flex h-14 items-center gap-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-[var(--color-ink)] no-underline">
          <Image src="/gryc-logo-96.png" alt="" width={36} height={36} priority />
          <span className="leading-tight">
            <span className="block text-[0.95rem] font-bold tracking-[-0.01em]">GRYC SYEP Portal</span>
            <span className="muted block text-xs">Site monitor</span>
          </span>
        </Link>
        <Suspense fallback={<TopNavFallback />}>
          <TopNavLinks />
        </Suspense>
        <div className="ml-auto">
          <Suspense fallback={null}>
            <HeaderStatus />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
