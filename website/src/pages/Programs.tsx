import { Link } from 'react-router';
import { Notice } from '@/components/Bits';
import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ArrowLink } from '@/components/ui/Arrow';
import { ButtonLink } from '@/components/ui/Button';
import Photo from '@/components/ui/Photo';
import { getLocation } from '@/data/locations';
import { locationPath } from '@/data/pages';
import { PHOTOS } from '@/data/photos';
import { PROGRAMS, type Program } from '@/data/programs';
import { cn } from '@/lib/cn';

/** the link each program had on the old Our Programs page */
function ProgramLinks({ p }: { p: Program }) {
    if (p.id === 'beacon') {
        return (
            <div className="flex flex-col gap-2">
                {(p.sites ?? []).map((slug) => {
                    const l = getLocation(slug);
                    return l ? (
                        <ArrowLink key={slug} to={locationPath(slug)}>
                            The Beacon at {l.short.replace(' Beacon', '')}
                        </ArrowLink>
                    ) : null;
                })}
            </div>
        );
    }
    const label: Record<string, string> = {
        prek: 'Learn more about free 3-K and Pre-K',
        k5: 'See each K–5 after school site',
        ms: 'See each 6–8 after school site',
        fee: 'See each fee-based K–5 site',
        syep: 'Learn more about SYEP'
    };
    return <ArrowLink to={p.path}>{label[p.id]}</ArrowLink>;
}

export default function Programs() {
    return (
        <>
            <Seo pageId="programs" />
            <PageIntro
                title="Our programs"
                lead="All of our programs are led by qualified instructors who create chances for every child to grow and excel, and to have fun doing it."
                backdrop={PHOTOS.seniorKnights}
                aside={<Photo photo={PHOTOS.orangeShirts} width={520} height={340} priority className="aspect-[26/17] w-full" />}
            >
                <nav aria-label="Programs on this page">
                    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem]">
                        {PROGRAMS.map((p) => (
                            <li key={p.id}>
                                <a href={`#${p.id}`} className="link">
                                    {p.short}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </PageIntro>

            <div className="shell py-8">
                {PROGRAMS.map((p, i) => (
                    <section key={p.id} id={p.id} aria-labelledby={`${p.id}-h`} className="scroll-mt-6 border-b border-line py-14 last:border-0 lg:py-20">
                        {/* photo and text swap sides each time, and the text starts lower than the photo */}
                        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                            <div className={cn('lg:col-span-5', i % 2 === 1 && 'lg:order-2 lg:col-start-8')}>
                                <Photo
                                    photo={p.photo}
                                    width={480}
                                    height={i % 2 === 1 ? 560 : 340}
                                    className={cn('w-full', i % 2 === 1 ? 'aspect-[6/7]' : 'aspect-[24/17]')}
                                />
                            </div>
                            <div className={cn('lg:col-span-7 lg:pt-10', i % 2 === 1 && 'lg:order-1 lg:col-span-6')}>
                                <h2 id={`${p.id}-h`} className="display text-[2.2rem] sm:text-[2.8rem]">
                                    {p.name}
                                </h2>
                                <p className="mt-2 font-semibold text-navy-600">
                                    {p.who} · {p.cost}
                                </p>
                                <div className="prose-gryc mt-5">
                                    {p.body.map((para) => (
                                        <p key={para}>{para}</p>
                                    ))}
                                    {p.funding ? <p className="font-semibold text-ink">{p.funding}</p> : null}
                                </div>
                                <div className="mt-6">
                                    <ProgramLinks p={p} />
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            <section className="shell pb-16 lg:pb-24">
                <Notice tone="navy" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="display text-[1.7rem]">Signing up for a free program?</h2>
                        <p className="mt-1 text-ink-2">Free COMPASS, SONYC and Beacon programs take applications through DYCD Connect.</p>
                    </div>
                    <ButtonLink to="/programs/sign-up" className="shrink-0">
                        How to sign up
                    </ButtonLink>
                </Notice>
                <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-6">
                    <p className="max-w-xs text-[0.92rem] text-ink-3">
                        Our free programs are funded by the NYC Department of Youth &amp; Community Development, in partnership with the NYC Department of
                        Education.
                    </p>
                    <Photo photo={PHOTOS.dycdLogo} width={170} height={70} fit className="h-12 w-auto bg-transparent" />
                    <Photo photo={PHOTOS.doeLogo} width={170} height={70} fit className="h-12 w-auto bg-transparent" />
                </div>
                <p className="mt-10 text-[0.95rem] text-ink-3">
                    Looking for a specific school?{' '}
                    <Link to="/locations" className="link">
                        Search all 24 locations
                    </Link>
                    .
                </p>
            </section>
        </>
    );
}
