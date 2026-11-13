import { Facts, Flyer, Notice } from '@/components/Bits';
import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ArrowLink, OutLink } from '@/components/ui/Arrow';
import { ButtonAnchor } from '@/components/ui/Button';
import Photo from '@/components/ui/Photo';
import { FLYERS, PHOTOS } from '@/data/photos';
import { PREK_CENTERS } from '@/data/programs';
import { site } from '@/data/site';
import { directionsHref } from '@/lib/format';

const DIRECTOR_MAILTO = 'mailto:jmahon@thegryc.org?subject=Request%20for%20information%20%5BPreK%5D';

export default function PreK() {
    return (
        <>
            <Seo pageId="prek" />
            <PageIntro
                crumbs={[{ to: '/programs', label: 'Programs' }]}
                title="Little Stars 3-K and Pre-K"
                lead="Free, full-day 3-K and Pre-K for All in Ridgewood: six hours and twenty minutes a day, five days a week, with free breakfast and lunch every day."
                backdrop={PHOTOS.flowerShop}
                aside={<Photo photo={PHOTOS.prekCrowns} width={520} height={360} priority className="aspect-[13/9] w-full" />}
            >
                <div className="flex flex-wrap gap-3">
                    <ButtonAnchor href={site.links.myschools}>Apply at myschools.nyc</ButtonAnchor>
                    <ButtonAnchor href={`tel:${site.phone.tel}`} variant="outline">
                        Call to schedule a tour
                    </ButtonAnchor>
                </div>
            </PageIntro>

            <div className="shell pt-14">
                <Notice>
                    <p className="text-ink-2">
                        <strong className="font-semibold text-ink">Enrollment for the 2026–2027 school year is open</strong> for children born in 2022 and 2023.
                        Apply at <OutLink href={site.links.myschools}>myschools.nyc</OutLink>, the city’s 3-K and Pre-K application. If you need help, call{' '}
                        {site.phone.short}, ext. 229 or 236.
                    </p>
                </Notice>
            </div>

            <section className="shell py-14 lg:py-16" aria-labelledby="centers-h">
                <h2 id="centers-h" className="display text-[2.2rem] sm:text-[2.8rem]">
                    Two centers in Ridgewood
                </h2>
                <ul className="mt-8 grid gap-6 md:grid-cols-2">
                    {PREK_CENTERS.map((c, i) => (
                        <li key={c.key} className={i === 1 ? 'border border-line bg-white/70 p-6 md:mt-10' : 'border border-line bg-white/70 p-6'}>
                            <h3 className="display text-[1.7rem]">{c.name}</h3>
                            <p className="mt-2 text-ink-2">{c.address}</p>
                            <p className="mt-1 text-[0.95rem] text-ink-3">{c.classes}</p>
                            <OutLink href={directionsHref(c.address)} className="mt-4">
                                Directions
                            </OutLink>
                        </li>
                    ))}
                </ul>
            </section>

            <div className="shell grid gap-12 border-t border-line py-14 lg:grid-cols-12 lg:py-20">
                <div className="lg:col-span-7">
                    <h2 className="display text-[2.2rem] sm:text-[2.8rem]">How Little Stars works</h2>
                    <div className="prose-gryc mt-6">
                        <p>
                            Little Stars 3K/Pre-K For All offers a free full-day program that runs six hours and twenty minutes a day, five days a week. Our main
                            headquarters at 59-03 Summerfield Street has three full-day classes, and our second location at 776 Fairview Avenue has three full-day
                            classes as well. All students receive free breakfast and lunch daily.
                        </p>
                        <p>
                            All of our teachers are certified and either have their master’s degree or are working towards it. We believe children learn best when
                            they take part in hands-on, project-based learning. Our staff use the NYC Department of Education’s theme-based units, and all
                            activities are aligned with the New York State Pre-Kindergarten Learning Standards and the 3-K Early Learning Outcomes Framework (ELOF).
                        </p>
                        <p>Our students get a strong foundation on the road to college and career readiness, and leave prepared academically and socially.</p>
                    </div>
                    <Photo photo={PHOTOS.prekClass} width={680} height={420} className="mt-10 aspect-[34/21] w-full" />
                </div>
                <aside className="lg:col-span-4 lg:col-start-9">
                    <Facts
                        items={[
                            { label: 'Ages', value: '3-K and Pre-K (children born in 2022 and 2023 for 2026–27)' },
                            { label: 'Cost', value: 'Free' },
                            { label: 'Day', value: 'Full day, 6 hours 20 minutes, Monday to Friday' },
                            { label: 'Meals', value: 'Free breakfast and lunch' },
                            {
                                label: 'Director',
                                value: (
                                    <>
                                        Janine Mahon
                                        <br />
                                        <a href={DIRECTOR_MAILTO} className="link">
                                            jmahon@thegryc.org
                                        </a>
                                    </>
                                )
                            },
                            {
                                label: 'Email',
                                value: (
                                    <a href="mailto:lstarsprek@thegryc.org" className="link">
                                        lstarsprek@thegryc.org
                                    </a>
                                )
                            },
                            {
                                label: 'Phone',
                                value: (
                                    <>
                                        <a href={`tel:${site.phone.tel}`} className="link">
                                            {site.phone.short}
                                        </a>
                                        , ext. 229 or 236
                                    </>
                                )
                            }
                        ]}
                    />
                    <div className="mt-10 grid grid-cols-2 gap-4">
                        <Flyer flyer={FLYERS.prekEnglish} caption="2026–27 flyer, English." />
                        <Flyer flyer={FLYERS.prekSpanish} caption="Folleto 2026–27, español." />
                    </div>
                </aside>
            </div>

            <div className="shell pb-16">
                <ArrowLink to="/programs">Back to all programs</ArrowLink>
            </div>
        </>
    );
}
