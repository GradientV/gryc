// small shared pieces for the inner pages
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import Photo from '@/components/ui/Photo';
import { getLocation, type Location } from '@/data/locations';
import { locationPath } from '@/data/pages';
import type { Photo as PhotoData } from '@/data/photos';
import { cn } from '@/lib/cn';
import { wixOriginal } from '@/lib/wix';

/** a list of school sites, each row opening that site's page */
export function SiteList({ slugs, className }: { slugs: string[]; className?: string }) {
    const sites = slugs.map((s) => getLocation(s)).filter((l): l is Location => Boolean(l));
    return (
        <ul className={cn('border-t border-line', className)}>
            {sites.map((l) => (
                <li key={l.slug} className="border-b border-line">
                    <Link
                        to={locationPath(l.slug)}
                        className="group grid gap-x-6 gap-y-1 px-1 py-4 transition-colors hover:bg-white/70 md:grid-cols-[minmax(0,2fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_1.5rem] md:items-center md:px-3"
                    >
                        <span className="min-w-0">
                            <span className="display block text-[1.3rem] text-ink group-hover:text-navy-700 group-hover:underline">{l.short}</span>
                            <span className="block text-[0.88rem] text-ink-3">{l.address}</span>
                        </span>
                        <span className="text-[0.95rem] text-ink-2">{l.area}</span>
                        <span className="text-[0.92rem] text-ink-3">{l.hours}</span>
                        <span aria-hidden="true" className="hidden text-navy-600 transition-transform group-hover:translate-x-0.5 md:block">
                            →
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    );
}

/** label / value pairs for a page's side panel */
export function Facts({ items, className }: { items: { label: string; value: ReactNode }[]; className?: string }) {
    return (
        <dl className={cn('divide-y divide-line border-y border-line', className)}>
            {items.map((i) => (
                <div key={i.label} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 py-3">
                    <dt className="label pt-[3px]">{i.label}</dt>
                    <dd className="text-[0.98rem] text-ink">{i.value}</dd>
                </div>
            ))}
        </dl>
    );
}

/** a notice with a colored rule on the left (yellow for news, red for warnings) */
export function Notice({ tone = 'sun', children, className }: { tone?: 'sun' | 'alert' | 'navy'; children: ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                'border-l-[3px] px-5 py-4 sm:px-6',
                tone === 'sun' && 'border-sun-400 bg-white/75',
                tone === 'alert' && 'border-alert bg-alert-50',
                tone === 'navy' && 'border-navy-600 bg-navy-50/80',
                className
            )}
        >
            {children}
        </div>
    );
}

/** a flyer shown whole, linked to the full-size original */
export function Flyer({ flyer, caption }: { flyer: PhotoData; caption: string }) {
    return (
        <figure>
            <a href={wixOriginal(flyer.id)} target="_blank" rel="noreferrer" className="group block border border-line bg-white p-2 hover:border-navy-300">
                <Photo photo={flyer} width={360} height={460} fit className="h-auto w-full" />
            </a>
            <figcaption className="mt-2 text-[0.9rem] text-ink-3">
                {caption}{' '}
                <a href={wixOriginal(flyer.id)} target="_blank" rel="noreferrer" className="link">
                    Full size
                </a>
            </figcaption>
        </figure>
    );
}

/** a pull quote (cream inside a dark band) */
export function Quote({ children, by }: { children: ReactNode; by: string }) {
    return (
        <figure className="relative">
            <blockquote className="display text-[1.8rem] leading-[1.18] text-navy-900 sm:text-[2.4rem] [.on-dark_&]:text-paper">{children}</blockquote>
            <figcaption className="mt-5 text-[0.95rem] font-semibold text-ink-2 [.on-dark_&]:text-white/70">{by}</figcaption>
        </figure>
    );
}

/** a photo with a small caption below */
export function Figure({ photo, width, height, caption, className }: { photo: PhotoData; width: number; height: number; caption?: string; className?: string }) {
    return (
        <figure className={className}>
            <Photo photo={photo} width={width} height={height} className="h-auto w-full" />
            {caption ? <figcaption className="mt-2 text-[0.88rem] text-ink-3">{caption}</figcaption> : null}
        </figure>
    );
}
