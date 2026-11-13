// one page per after-school program (free K–5, free 6–8, fee-based K–5). On the old site
// these were pop-ups over Our Programs with a list of schools; here each is a real page,
// at a real address, with the same schools and the way to join.
import { Notice, SiteList } from '@/components/Bits';
import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ArrowLink, OutLink } from '@/components/ui/Arrow';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import Photo from '@/components/ui/Photo';
import type { PageId } from '@/data/pages';
import { PHOTOS, type Photo as PhotoData } from '@/data/photos';
import { getProgram } from '@/data/programs';
import { site } from '@/data/site';

type Props = { program: 'k5' | 'ms' | 'fee' };

const PAGE: Record<Props['program'], PageId> = { k5: 'k5', ms: 'ms', fee: 'fee' };

/** the photo faded into the top band (each program's own photo is the one on the right) */
const BACKDROP: Record<Props['program'], PhotoData> = { k5: PHOTOS.gym, ms: PHOTOS.robotics, fee: PHOTOS.flowerShop };

function HowToJoin({ fee }: { fee: boolean }) {
    if (fee) {
        return (
            <div>
                <h2 className="display text-[1.9rem]">How to join</h2>
                <p className="mt-3 text-ink-2">
                    Email the director at the school you want (each school’s page has their address). Families pay through Procare; the payment schedule is in
                    your family handbook.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                    <ButtonLink to="/payments">Payment info</ButtonLink>
                </div>
            </div>
        );
    }
    return (
        <div>
            <h2 className="display text-[1.9rem]">How to join</h2>
            <p className="mt-3 text-ink-2">
                Apply through DYCD Connect, the city’s sign-up site: search for the school, add it to your list and complete the application. Every
                application goes into a lottery.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <ButtonAnchor href={site.links.dycdConnect}>Apply on DYCD Connect</ButtonAnchor>
                <ArrowLink to="/programs/sign-up">Step by step</ArrowLink>
            </div>
        </div>
    );
}

export default function ProgramSites({ program }: Props) {
    const p = getProgram(program);
    const fee = program === 'fee';
    return (
        <>
            <Seo pageId={PAGE[program]} />
            <PageIntro
                crumbs={[{ to: '/programs', label: 'Programs' }]}
                title={p.name}
                lead={p.summary}
                backdrop={BACKDROP[program]}
                aside={<Photo photo={p.photo} width={520} height={360} priority className="aspect-[13/9] w-full" />}
            >
                <p className="font-semibold text-sun-300">
                    {p.who} · {p.cost} · Up to three hours a day, five days a week
                </p>
            </PageIntro>

            <div className="shell grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
                <div className="lg:col-span-7">
                    <div className="prose-gryc">
                        {p.body.map((para) => (
                            <p key={para}>{para}</p>
                        ))}
                    </div>
                    {p.funding ? (
                        <Notice tone={fee ? 'sun' : 'navy'} className="mt-8 max-w-[44rem] font-semibold text-ink">
                            {p.funding}
                        </Notice>
                    ) : null}
                </div>
                <aside className="lg:col-span-4 lg:col-start-9">
                    <HowToJoin fee={fee} />
                    <p className="mt-8 text-[0.95rem] text-ink-3">
                        Questions? Call {site.phone.display} or{' '}
                        <a href="/contact#directory" className="link">
                            email a site director
                        </a>
                        .
                    </p>
                </aside>
            </div>

            <section className="bg-paper-2" aria-labelledby="sites-h">
                <div className="shell py-16 lg:py-24">
                    <h2 id="sites-h" className="display text-[2.2rem] sm:text-[2.8rem]">
                        {fee ? 'Fee-based K–5 after school sites' : program === 'k5' ? 'Free K–5 after school sites' : 'Free 6–8 after school sites'}
                    </h2>
                    <p className="mt-3 text-ink-2">{fee ? 'Pick a school for its hours, activities and director.' : 'Click a school to learn more.'}</p>
                    <SiteList slugs={p.sites ?? []} className="mt-8" />
                    {fee ? <p className="mt-6 text-[0.95rem] text-ink-3">Additional sites are under construction.</p> : null}
                    <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                        <ArrowLink to="/programs">All programs</ArrowLink>
                        <ArrowLink to="/locations">Search every location</ArrowLink>
                        {fee ? <OutLink href={site.links.procare}>myprocare.com</OutLink> : null}
                    </div>
                </div>
            </section>
        </>
    );
}
