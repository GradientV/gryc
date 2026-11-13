// the footer keeps every link from the old one (For families, For employees,
// Opportunities, Looking for a way to help?) and adds the staff portal.
// The old footer's social icons pointed at Wix's own accounts; these are the GRYC's.
// Behind it: SYEP participants on a Ridgewood street, faded into the blue.
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import Logo from '@/components/brand/Logo';
import { Backdrop } from '@/components/ui/Photo';
import SocialIcons from '@/components/ui/SocialIcons';
import { PHOTOS } from '@/data/photos';
import { COPYRIGHT_YEAR, site } from '@/data/site';

type FooterLink = { label: string; to?: string; href?: string };

function Column({ title, links, children }: { title: string; links: FooterLink[]; children?: ReactNode }) {
    return (
        <div>
            <h2 className="font-sans text-[0.76rem] font-bold tracking-[0.13em] text-paper uppercase">{title}</h2>
            <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                    <li key={l.label}>
                        {l.to ? (
                            <Link to={l.to} className="text-white/80 hover:text-white hover:underline">
                                {l.label}
                            </Link>
                        ) : (
                            <a href={l.href} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white hover:underline">
                                {l.label}
                                <span aria-hidden="true" className="ml-1 text-[0.8em] text-white/50">
                                    ↗
                                </span>
                                <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                        )}
                    </li>
                ))}
            </ul>
            {children}
        </div>
    );
}

export default function Footer() {
    return (
        <footer className="on-dark relative isolate overflow-hidden bg-navy-950 text-[0.95rem] text-white/75">
            <Backdrop photo={PHOTOS.syepStreet} className="object-[50%_30%] opacity-[0.42]" />
            {/* darkest at the top, where the footer meets the page */}
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-navy-950/90 via-navy-950/55 to-navy-950/35" />

            <div className="shell relative pt-16 lg:pt-20">
                <div className="flex flex-col gap-8 border-b border-white/15 pb-12 lg:flex-row lg:items-end lg:justify-between">
                    <Logo inverted />
                    <p className="display max-w-xl text-[1.9rem] leading-[1.1] text-paper sm:text-[2.3rem] lg:text-right">{site.tagline}.</p>
                </div>
            </div>

            <div className="shell relative grid gap-12 py-12 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-10 lg:py-14">
                <div>
                    <h2 className="font-sans text-[0.76rem] font-bold tracking-[0.13em] text-paper uppercase">Visit or call</h2>
                    <address className="mt-4 not-italic leading-relaxed">
                        {site.hq.label}
                        <br />
                        {site.hq.street}
                        <br />
                        {site.hq.city}, {site.hq.state} {site.hq.zip}
                    </address>
                    <p className="mt-3">
                        <a href={`tel:${site.phone.tel}`} className="text-[1.05rem] font-semibold text-white hover:underline">
                            {site.phone.display}
                        </a>
                        <br />
                        Fax {site.fax}
                    </p>
                    <SocialIcons className="mt-4 -ml-2 text-white/75 [&_a:hover]:bg-white/10 [&_a:hover]:text-white" />
                </div>

                <Column
                    title="For families"
                    links={[
                        { label: 'Information about after school', to: '/programs' },
                        { label: 'Information about 3-K / Pre-K', to: '/programs/pre-k' },
                        { label: 'Support the GRYC', to: '/donate' },
                        { label: 'Contact the GRYC', to: '/contact' }
                    ]}
                >
                    <p className="mt-5 text-[0.88rem] leading-relaxed text-white/65">
                        Office hours: {site.officeHours}.
                        <br />
                        For questions about accessibility, contact{' '}
                        <a href={site.accessibility.mailto} className="text-white/85 underline underline-offset-2 hover:text-white">
                            {site.accessibility.name}
                        </a>
                        .
                    </p>
                </Column>

                <Column
                    title="For employees"
                    links={[
                        { label: 'Staff portal login', to: '/login' },
                        { label: 'Log in to staff Gmail', href: site.links.staffGmail },
                        { label: 'View staff directory', to: '/contact#directory' },
                        { label: 'Labor posters for employees', href: site.links.laborPosters }
                    ]}
                />

                <div className="space-y-10">
                    <Column
                        title="Opportunities at GRYC"
                        links={[
                            { label: 'Work for the GRYC', to: '/jobs/apply' },
                            { label: 'Summer Youth Employment', to: '/programs/summer-youth-employment' }
                        ]}
                    />
                    <Column
                        title="Looking for a way to help?"
                        links={[
                            { label: 'Donate to the GRYC', to: '/donate' },
                            { label: 'Donate through AmazonSmile Charity', href: site.links.amazonSmile }
                        ]}
                    />
                </div>
            </div>
            <div className="relative border-t border-white/15">
                <div className="shell flex flex-col gap-2 py-5 text-[0.85rem] text-white/60 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {COPYRIGHT_YEAR} {site.name} A not-for-profit 501(c)(3), serving youth and families since {site.founded}.
                    </p>
                    <p>
                        Designed &amp; built by{' '}
                        <a href="https://gradientv.com" target="_blank" rel="noreferrer" className="font-semibold text-white/85 hover:text-white hover:underline">
                            GradientV
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
