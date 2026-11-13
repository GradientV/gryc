'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NAV = [
  { href: '/', label: 'Sites' },
  { href: '/week', label: 'This week' },
  { href: '/mileage', label: 'Mileage' },
] as const;

function isActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === '/') return pathname === '/' || pathname.startsWith('/sites');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopNavLinks() {
  const pathname = usePathname();
  return (
    <nav className="topnav hidden md:flex" aria-label="Main">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} aria-current={isActive(n.href, pathname) ? 'page' : undefined}>
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

/** Phone navigation: three words along the bottom edge, in reach of a thumb. */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar md:hidden" aria-label="Main">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} aria-current={isActive(n.href, pathname) ? 'page' : undefined}>
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

/** Same links without the active marker, shown while the page streams in. */
export function TopNavFallback() {
  return (
    <nav className="topnav hidden md:flex" aria-label="Main">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href}>
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

export function TabBarFallback() {
  return (
    <nav className="tabbar md:hidden" aria-label="Main">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href}>
          {n.label}
        </Link>
      ))}
    </nav>
  );
}
