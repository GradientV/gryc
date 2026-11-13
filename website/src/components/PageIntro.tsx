// the top of every inner page: a dark blue band with one of the GRYC's photos faded into
// it, then breadcrumbs, the headline, a line or two of lead and optional buttons. A photo
// passed as `aside` sits on the right and hangs over the band's bottom edge onto the cream,
// so the page doesn't start as one hard box.
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Backdrop } from '@/components/ui/Photo';
import { cn } from '@/lib/cn';

type Crumb = { to: string; label: string };

type Props = {
    title: ReactNode;
    lead?: ReactNode;
    crumbs?: Crumb[];
    /** a last breadcrumb that isn't a link (a location page's neighborhood) */
    here?: string;
    children?: ReactNode;
    aside?: ReactNode;
    /** the photo faded into the band behind the headline */
    backdrop?: { id: string };
    className?: string;
};

export function Crumbs({ crumbs, current }: { crumbs: Crumb[]; current?: string }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6 text-[0.9rem] text-white/65">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {crumbs.map((c) => (
                    <li key={c.to} className="flex items-center gap-2">
                        <Link to={c.to} className="hover:text-white hover:underline">
                            {c.label}
                        </Link>
                        <span aria-hidden="true">/</span>
                    </li>
                ))}
                {current ? <li>{current}</li> : null}
            </ol>
        </nav>
    );
}

/** the faded photo and the shade that keeps the text side dark */
export function BandBackdrop({ photo, priority }: { photo?: { id: string }; priority?: boolean }) {
    return (
        <>
            {photo ? <Backdrop photo={photo} priority={priority} className="opacity-[0.34]" /> : null}
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-navy-950 via-navy-950/75 to-navy-950/25" />
        </>
    );
}

export default function PageIntro({ title, lead, crumbs, here, children, aside, backdrop, className }: Props) {
    return (
        <section className={cn('relative isolate', className)}>
            <div className={cn('absolute inset-x-0 top-0 bottom-0 -z-10 overflow-hidden bg-navy-950', aside ? 'lg:bottom-20' : null)}>
                <BandBackdrop photo={backdrop} priority />
            </div>
            <div
                className={cn(
                    'shell grid gap-10 pt-12 pb-14 sm:pt-14 lg:pt-20',
                    aside ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-16 lg:pb-0' : 'lg:pb-24'
                )}
            >
                <div className={cn('on-dark text-white/80', aside ? 'lg:pb-36' : null)}>
                    {crumbs?.length ? <Crumbs crumbs={crumbs} current={here} /> : null}
                    <h1 className="display max-w-4xl text-[2.7rem] sm:text-[3.5rem] lg:text-[4.1rem]">{title}</h1>
                    {lead ? <div className="mt-6 max-w-2xl text-lg leading-relaxed sm:text-[1.2rem]">{lead}</div> : null}
                    {children ? <div className="mt-8">{children}</div> : null}
                </div>
                {aside ? <div className="relative">{aside}</div> : null}
            </div>
        </section>
    );
}

/** a section heading with an optional link on the right */
export function SectionHead({ id, title, children, className }: { id?: string; title: ReactNode; children?: ReactNode; className?: string }) {
    return (
        <div className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-3', className)}>
            <h2 id={id} className="display text-[2.2rem] sm:text-[2.9rem]">
                {title}
            </h2>
            {children}
        </div>
    );
}
