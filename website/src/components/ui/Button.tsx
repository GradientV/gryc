// buttons: square, text only. Solid royal blue and blue outline on cream; inside a dark
// band (an ancestor with the `on-dark` class) the same two turn cream and white, so a page
// never has to pick colors for the band it's in. 'white' and 'sun' are always that color.
// <ButtonLink> is a page on this site, <ButtonAnchor> goes somewhere else.
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';

type Variant = 'solid' | 'outline' | 'white' | 'sun';
type Size = 'sm' | 'md' | 'lg';

export function buttonClasses(variant: Variant = 'solid', size: Size = 'md', className?: string) {
    return cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-ui)] border font-semibold whitespace-nowrap transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' && 'min-h-9 px-3.5 text-[0.88rem]',
        size === 'md' && 'min-h-11 px-5 text-[0.95rem]',
        size === 'lg' && 'min-h-12 px-6 text-base',
        variant === 'solid' &&
            'border-navy-600 bg-navy-600 text-white hover:border-navy-700 hover:bg-navy-700 ' +
                '[.on-dark_&]:border-paper [.on-dark_&]:bg-paper [.on-dark_&]:text-navy-950 [.on-dark_&]:hover:border-sun-300 [.on-dark_&]:hover:bg-sun-300',
        variant === 'outline' &&
            'border-navy-600 bg-transparent text-navy-700 hover:bg-navy-50 ' +
                '[.on-dark_&]:border-white/55 [.on-dark_&]:text-white [.on-dark_&]:hover:border-white [.on-dark_&]:hover:bg-white/10',
        variant === 'white' && 'border-white bg-white text-navy-900 hover:bg-navy-50',
        variant === 'sun' && 'border-sun-400 bg-sun-400 text-ink hover:border-sun-300 hover:bg-sun-300',
        className
    );
}

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode };

export function ButtonLink({ variant, size, className, children, ...rest }: Common & Omit<LinkProps, 'className'>) {
    return (
        <Link className={buttonClasses(variant, size, className)} {...rest}>
            {children}
        </Link>
    );
}

export function ButtonAnchor({ variant, size, className, children, ...rest }: Common & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>) {
    const external = rest.href?.startsWith('http');
    return (
        <a className={buttonClasses(variant, size, className)} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} {...rest}>
            {children}
        </a>
    );
}

export function Button({ variant, size, className, children, ...rest }: Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>) {
    return (
        <button className={buttonClasses(variant, size, className)} {...rest}>
            {children}
        </button>
    );
}
