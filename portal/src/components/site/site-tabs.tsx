'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteTabs({ siteId, week }: { siteId: string; week: number }) {
  const pathname = usePathname() ?? '';
  const base = `/sites/${siteId}`;
  const tabs = [
    { href: base, label: 'Overview', on: pathname === base },
    { href: `${base}/weeks/${week}`, label: 'Weekly', on: pathname.startsWith(`${base}/weeks`) },
    { href: `${base}/participants`, label: 'Participants', on: pathname.startsWith(`${base}/participants`) },
    { href: `${base}/log`, label: 'Monitoring log', on: pathname.startsWith(`${base}/log`) },
    { href: `${base}/application`, label: 'Worksite application', on: pathname.startsWith(`${base}/application`) },
  ];
  return (
    <nav className="tabs mb-6" aria-label="Worksite">
      {tabs.map((t) => (
        <Link key={t.label} href={t.href} aria-current={t.on ? 'page' : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
