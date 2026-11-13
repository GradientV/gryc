// text links with a trailing arrow: → for a page here, ↗ for somewhere else.
// The arrow comes after the words (never an icon in front). Royal blue on cream;
// white inside a dark band (an ancestor with the `on-dark` class).
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

const base =
    'group inline-flex items-baseline gap-1.5 font-semibold text-navy-600 hover:text-navy-800 [.on-dark_&]:text-white [.on-dark_&]:hover:text-sun-300';
const underline =
    'underline decoration-navy-600/30 decoration-1 underline-offset-[5px] group-hover:decoration-current [.on-dark_&]:decoration-white/40';
const arrow = 'transition-transform group-hover:translate-x-0.5';

export function ArrowLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
    return (
        <Link to={to} className={cn(base, className)}>
            <span className={underline}>{children}</span>
            <span aria-hidden="true" className={arrow}>
                →
            </span>
        </Link>
    );
}

export function OutLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
    const external = href.startsWith('http');
    return (
        <a href={href} className={cn(base, className)} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
            <span className={underline}>{children}</span>
            {external ? (
                <span aria-hidden="true" className="text-[0.85em]">
                    ↗
                </span>
            ) : null}
            {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
        </a>
    );
}
