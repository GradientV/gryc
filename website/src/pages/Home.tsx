import { Link } from 'react-router';
import Finder from '@/components/Finder';
import Seo from '@/components/Seo';
import Scribble from '@/components/brand/Scribble';
import { ArrowLink, OutLink } from '@/components/ui/Arrow';
import { ButtonLink, buttonClasses } from '@/components/ui/Button';
import Photo, { Backdrop } from '@/components/ui/Photo';
import { POSTS, postUrl } from '@/data/news';
import { PHOTOS, type Photo as PhotoData } from '@/data/photos';
import { getProgram, type ProgramId } from '@/data/programs';
import { SITE_URL, site } from '@/data/site';
import { cn } from '@/lib/cn';
import { fmtDate } from '@/lib/format';

/** the four programs the old home page led with, in its order */
const FEATURED: { id: ProgramId; title: string; meta: string }[] = [
    { id: 'k5', title: 'Free after school', meta: 'Grades K–5 · 11 schools' },
    { id: 'prek', title: '3-K and Pre-K', meta: 'Ages 3 and 4 · 2 Ridgewood centers' },
    { id: 'ms', title: 'Free middle school', meta: 'Grades 6–8 · 11 schools' },
    { id: 'fee', title: 'Fee-based after school', meta: 'Grades K–5 · 4 schools' }
];

const SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: site.name,
    alternateName: 'GRYC',
    url: SITE_URL,
    foundingDate: String(site.founded),
    telephone: site.phone.short,
    faxNumber: site.fax,
    address: {
        '@type': 'PostalAddress',
        streetAddress: site.hq.street,
        addressLocality: site.hq.city,
        addressRegion: site.hq.state,
        postalCode: site.hq.zip,
        addressCountry: 'US'
    },
    sameAs: [site.links.youtube, site.links.instagram.split('?')[0]]
};

/** three photos in two staggered columns. On wide screens the whole group hangs over the
    bottom of the blue band, onto the cream below it */
function Collage({ className }: { className?: string }) {
    return (
        <div className={cn('relative', className)}>
            <Scribble shape="underline" weight={13} className="absolute -bottom-11 left-[6%] z-10 h-14 w-[74%] text-sun-400" />
            <Scribble shape="curl" weight={18} className="absolute -top-12 -right-4 hidden h-28 w-28 text-sun-400/80 sm:block lg:-right-10" />
            <div className="relative grid grid-cols-12 gap-3 sm:gap-4">
                <div className="col-span-5 space-y-3 pt-14 sm:space-y-4 sm:pt-24">
                    <Photo photo={PHOTOS.familyArt} width={260} height={300} priority className="aspect-[13/15] w-full" />
                    <Photo photo={PHOTOS.science} width={260} height={200} className="aspect-[13/10] w-full object-[50%_35%]" />
                </div>
                <div className="col-span-7">
                    <Photo photo={PHOTOS.facePaint} width={360} height={500} priority className="aspect-[18/25] w-full" />
                </div>
            </div>
        </div>
    );
}

function Hero() {
    return (
        <section className="relative isolate z-10">
            {/* the blue band, with GRYC kids in matching shirts faded into it */}
            <div className="absolute inset-0 -z-10 overflow-hidden bg-navy-950">
                <Backdrop photo={PHOTOS.greenShirtsGroup} priority className="object-[50%_30%] opacity-[0.4]" />
                <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-navy-950 via-navy-950/80 to-navy-950/25" />
            </div>
            <div className="shell grid gap-14 pt-12 pb-16 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pt-24 lg:pb-0">
                <div className="on-dark text-white/80 lg:col-span-6 lg:pb-44">
                    <h1 className="display text-[3rem] leading-[0.98] sm:text-[3.9rem] lg:text-[4.3rem] xl:text-[4.85rem]">
                        After school, Pre-K and summer jobs for Queens families.
                    </h1>
                    <p className="mt-7 max-w-[34rem] text-lg leading-relaxed sm:text-xl">
                        Free and low-cost programs at 24 schools in Queens and Brooklyn. A Ridgewood nonprofit since 1980, working with more than{' '}
                        {site.youthServedDaily} young people and families every day.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <a href="#find" className={buttonClasses('solid', 'lg')}>
                            Find a program
                        </a>
                        <ButtonLink to="/programs/pre-k" variant="outline" size="lg">
                            3-K and Pre-K enrollment
                        </ButtonLink>
                    </div>
                    <p className="mt-7 text-[0.98rem] text-white/65">
                        Already enrolled?{' '}
                        <Link to="/payments" className="link">
                            Pay a program fee
                        </Link>{' '}
                        or{' '}
                        <Link to="/programs/sign-up" className="link">
                            see how to sign up
                        </Link>
                        .
                    </p>
                </div>
                <Collage className="lg:col-span-6 lg:-mb-40 lg:self-end" />
            </div>
        </section>
    );
}

/** sits on the cream beside the photos that hang over from the hero */
function EnrollmentNotice() {
    return (
        <section aria-label="3-K and Pre-K enrollment" className="shell pt-14 lg:grid lg:min-h-[15rem] lg:grid-cols-12 lg:pt-16">
            <div className="border-l-[3px] border-sun-400 pl-5 lg:col-span-5">
                <p className="display text-[1.65rem] leading-[1.15]">3-K and Pre-K enrollment for 2026–27 is open.</p>
                <p className="mt-2 text-ink-2">For children born in 2022 and 2023, at our two Ridgewood centers.</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    <OutLink href={site.links.myschools}>Apply at myschools.nyc</OutLink>
                    <ArrowLink to="/programs/pre-k">Little Stars details</ArrowLink>
                </div>
            </div>
        </section>
    );
}

function Programs() {
    const beacon = getProgram('beacon');
    const syep = getProgram('syep');
    return (
        <section className="shell py-20 lg:py-28" aria-labelledby="programs-h">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-10">
                        <h2 id="programs-h" className="display text-[2.5rem] sm:text-[3.3rem]">
                            Programs for every age
                        </h2>
                        <p className="mt-4 max-w-sm text-ink-2">From 3-K in Ridgewood to summer jobs for young adults, and most of it free.</p>
                        <ArrowLink to="/programs" className="mt-6">
                            All programs
                        </ArrowLink>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    {/* the right-hand cards sit lower than the left, so the grid doesn't read as a table */}
                    <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 sm:pb-20">
                        {FEATURED.map((f, i) => {
                            const p = getProgram(f.id);
                            return (
                                <li key={f.id} className={cn(i % 2 === 1 && 'sm:translate-y-20')}>
                                    <Link to={p.path} className="group block">
                                        <div className="overflow-hidden">
                                            <Photo
                                                photo={p.photo}
                                                width={380}
                                                height={i === 0 || i === 3 ? 470 : 285}
                                                className={cn(
                                                    'w-full transition-transform duration-500 group-hover:scale-[1.03]',
                                                    i === 0 || i === 3 ? 'aspect-[4/5]' : 'aspect-[4/3]'
                                                )}
                                            />
                                        </div>
                                        <h3 className="display mt-5 text-[1.85rem] decoration-1 underline-offset-[6px] group-hover:underline">{f.title}</h3>
                                        <p className="mt-1.5 text-[0.9rem] font-semibold text-navy-600">{f.meta}</p>
                                        <p className="mt-2.5 text-[0.98rem] leading-relaxed text-ink-2">{p.summary}</p>
                                        <span className="mt-3 inline-flex items-baseline gap-1.5 font-semibold text-navy-600">
                                            Learn more <span aria-hidden="true">→</span>
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="mt-14 grid gap-x-8 gap-y-10 border-t border-line pt-10 md:grid-cols-2">
                        {[beacon, syep].map((p) => (
                            <div key={p.id}>
                                <h3 className="display text-[1.85rem]">{p.name}</h3>
                                <p className="mt-1.5 text-[0.9rem] font-semibold text-navy-600">
                                    {p.who} · {p.cost}
                                </p>
                                <p className="mt-2.5 leading-relaxed text-ink-2">{p.summary}</p>
                                <ArrowLink to={p.path} className="mt-3">
                                    {p.id === 'syep' ? 'Summer jobs for ages 14 to 24' : 'About the Beacons'}
                                </ArrowLink>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function FindAProgram() {
    return (
        <section id="find" className="scroll-mt-4 bg-paper-2" aria-labelledby="find-h">
            <div className="shell py-16 lg:py-24">
                <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
                    <h2 id="find-h" className="display text-[2.5rem] sm:text-[3.3rem] lg:col-span-6">
                        Find a program near you
                    </h2>
                    <div className="lg:col-span-5 lg:col-start-8">
                        <p className="text-ink-2">Pick a grade, a cost or a neighborhood. Each school has its hours, activities and director’s email.</p>
                        <ArrowLink to="/locations" className="mt-3">
                            See all locations
                        </ArrowLink>
                    </div>
                </div>
                <Finder limit={8} className="mt-10" />
            </div>
        </section>
    );
}

function AboutBand() {
    return (
        <section className="on-dark relative isolate overflow-hidden bg-navy-950 text-white/80">
            <Backdrop photo={PHOTOS.gym} className="object-[50%_45%] opacity-[0.32]" />
            <div aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-navy-950/90 via-navy-950/60 to-navy-950/85" />
            <div className="shell relative grid gap-10 py-20 lg:grid-cols-12 lg:py-32">
                <h2 className="display text-[2.6rem] leading-[1.04] sm:text-[3.4rem] lg:col-span-7 lg:text-[3.9rem]">
                    A safe place to learn and grow, after the bell and all summer.
                </h2>
                <div className="lg:col-span-4 lg:col-start-9 lg:pt-44">
                    <p className="text-lg leading-relaxed">
                        The GRYC is a not-for-profit 501(c)(3) that has served Queens since {site.founded}. Today we work with more than {site.youthServedDaily} young
                        people and families every day, through education, counseling, truancy prevention, job preparation and employment.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <ButtonLink to="/about">Who we are</ButtonLink>
                        <ButtonLink to="/donate" variant="outline">
                            Support the GRYC
                        </ButtonLink>
                    </div>
                </div>
            </div>
        </section>
    );
}

function News() {
    return (
        <section className="shell grid gap-10 py-20 lg:grid-cols-12 lg:py-28" aria-labelledby="news-h">
            <div className="lg:col-span-4">
                <h2 id="news-h" className="display text-[2.5rem] sm:text-[3.1rem]">
                    News from our sites
                </h2>
                <ArrowLink to="/news" className="mt-5">
                    All news
                </ArrowLink>
            </div>
            <ul className="border-t border-line lg:col-span-8">
                {POSTS.slice(0, 4).map((post) => (
                    <li key={post.slug} className="border-b border-line">
                        <a
                            href={postUrl(post)}
                            target="_blank"
                            rel="noreferrer"
                            className="group grid gap-1 py-5 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-6"
                        >
                            <time dateTime={post.date} className="text-[0.92rem] text-ink-3">
                                {fmtDate(post.date)}
                            </time>
                            <span className="display text-[1.5rem] leading-tight decoration-1 underline-offset-[5px] group-hover:underline">{post.title}</span>
                            <span className="text-[0.92rem] text-ink-3">
                                {post.place} <span aria-hidden="true">↗</span>
                                <span className="sr-only"> (opens in a new tab)</span>
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function Feature({ photo, aspect, title, body, to, cta, className }: { photo: PhotoData; aspect: string; title: string; body: string; to: string; cta: string; className?: string }) {
    return (
        <div className={className}>
            <Photo photo={photo} width={640} height={480} className={cn('w-full', aspect)} />
            <h2 className="display mt-6 text-[2.1rem]">{title}</h2>
            <p className="mt-3 max-w-xl leading-relaxed text-ink-2">{body}</p>
            <ArrowLink to={to} className="mt-4">
                {cta}
            </ArrowLink>
        </div>
    );
}

export default function Home() {
    return (
        <>
            <Seo pageId="home" schema={SCHEMA} />
            <Hero />
            <EnrollmentNotice />
            <Programs />
            <FindAProgram />
            <AboutBand />
            <News />
            <section className="shell grid gap-14 pb-24 md:grid-cols-12 md:gap-10 lg:pb-32">
                <Feature
                    className="md:col-span-7"
                    photo={PHOTOS.staffGroup}
                    aspect="aspect-[4/3]"
                    title="Work for the GRYC"
                    body="Group leaders and instructors lead after-school and summer activities across Queens. Applicants must be 18 or older with a high school diploma or GED."
                    to="/jobs/apply"
                    cta="See open positions"
                />
                <Feature
                    className="md:col-span-5 md:pt-36"
                    photo={PHOTOS.paintedPlates}
                    aspect="aspect-[5/4]"
                    title="Support the GRYC"
                    body="Donations help us keep a safe, fun place for kids to learn after school. No donation is too big or too small, and every one is tax-deductible."
                    to="/donate"
                    cta="Make a donation"
                />
            </section>
        </>
    );
}
