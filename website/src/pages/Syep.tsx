import { Facts, Flyer } from '@/components/Bits';
import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ArrowLink, OutLink } from '@/components/ui/Arrow';
import { ButtonAnchor } from '@/components/ui/Button';
import Photo from '@/components/ui/Photo';
import { FLYERS, PHOTOS } from '@/data/photos';
import { site } from '@/data/site';

const TRACKS = [
    {
        ages: 'Ages 14 and 15',
        title: 'Service learning',
        lines: ['Service learning projects, 12.5 hours a week', 'Earn a $700 stipend']
    },
    {
        ages: 'Ages 16 to 24',
        title: 'Summer jobs',
        lines: ['Work 25 hours a week, Monday to Friday', 'Earn $16.50 an hour']
    }
];

export default function Syep() {
    return (
        <>
            <Seo pageId="syep" />
            <PageIntro
                crumbs={[
                    { to: '/programs', label: 'Programs' },
                    { to: '/jobs', label: 'Jobs' }
                ]}
                title="Summer Youth Employment Program (SYEP)"
                lead="Six weeks of paid summer work and service learning in July and August, for young people ages 14 to 24."
                backdrop={PHOTOS.greenShirtsGroup}
                aside={<Photo photo={PHOTOS.syepStreet} width={520} height={360} priority className="aspect-[13/9] w-full" />}
            >
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    <ButtonAnchor href={site.links.syepApplication}>Apply or check your status</ButtonAnchor>
                    <OutLink href="mailto:tracyrodriguez@thegryc.org">Email the SYEP director</OutLink>
                </div>
            </PageIntro>

            <section className="shell py-16 lg:py-20" aria-label="Two ways to take part">
                <ul className="grid gap-6 md:grid-cols-2">
                    {TRACKS.map((t, i) => (
                        <li key={t.ages} className={i === 1 ? 'border border-line bg-white/70 p-6 sm:p-8 md:mt-12' : 'border border-line bg-white/70 p-6 sm:p-8'}>
                            <p className="font-semibold text-navy-600">{t.ages}</p>
                            <h2 className="display mt-2 text-[2.3rem]">{t.title}</h2>
                            <ul className="mt-4 space-y-1.5 text-lg text-ink-2">
                                {t.lines.map((l) => (
                                    <li key={l}>{l}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
                <p className="mt-5 text-ink-2">
                    Check your application status at{' '}
                    <OutLink href={site.links.syepApplication}>application.nycsyep.com</OutLink>
                </p>
            </section>

            <div className="shell grid gap-12 border-t border-line py-14 lg:grid-cols-12 lg:py-20">
                <div className="lg:col-span-7">
                    <div className="prose-gryc">
                        <p>
                            SYEP is a six-week employment program that serves youth ages 14 to 24. Its goal is to give young people summer employment and
                            educational experiences that build on their individual strengths, talents and interests.
                        </p>
                        <h2 className="display pt-4 text-[1.75rem] text-ink">Jobs for ages 16 to 24</h2>
                        <p>
                            The GRYC offers a variety of interesting jobs for older youth in many sectors. SYEP participants work as camp counselors at day camps;
                            clerical workers in hospitals, private businesses, law offices and schools; teacher’s assistants at childcare centers and school
                            programs; and sales and stock associates at neighborhood businesses and shopping malls. Our work sponsors provide nurturing work
                            environments that support meaningful learning.
                        </p>
                        <h2 className="display pt-4 text-[1.75rem] text-ink">Service learning for ages 14 and 15</h2>
                        <p>
                            Younger youth take part in six-week service learning projects that teach academic and life skills in a classroom setting, helping
                            participants identify and solve real problems in their communities. Service learning builds character, encourages active citizenship
                            and gives practice in writing, speaking, teamwork, critical thinking and decision making. Past projects include Environmental Justice,
                            Health and Wellness, Civic Engagement, Business and Entrepreneurship, and Technology.
                        </p>
                        <h2 className="display pt-4 text-[1.75rem] text-ink">Applying</h2>
                        <p>
                            Submit an application at <OutLink href={site.links.syepApplication}>application.nycsyep.com</OutLink>. If your application is
                            selected, you’ll get an email with the dates to bring DYCD’s required documents, which include but are not limited to working papers,
                            proof of address, a Social Security card, a valid school ID, a NY State ID, proof of family income and, if applicable, proof of
                            Selective Service registration.
                        </p>
                        <p>
                            Before SYEP starts in July, every enrolled participant must attend a mandatory virtual orientation and complete the Hats &amp; Ladders
                            workshops. The orientation covers policies, time and attendance, and debit card use. The self-guided Hats &amp; Ladders workshops cover
                            workplace readiness, financial literacy, career exploration, resume and cover letter writing, and civic engagement. You need both to be
                            eligible to work.
                        </p>
                    </div>
                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
                        <Photo photo={PHOTOS.syepWagon} width={420} height={300} className="aspect-[7/5] w-full" />
                        <Photo photo={PHOTOS.syepGarden} width={420} height={300} className="aspect-[7/5] w-full" />
                    </div>
                </div>
                <aside className="lg:col-span-4 lg:col-start-9">
                    <Facts
                        items={[
                            { label: 'Ages', value: '14 to 24' },
                            { label: 'When', value: 'Six weeks in July and August' },
                            { label: 'Pay', value: '$16.50 an hour (16 to 24) or a $700 stipend (14 and 15)' },
                            {
                                label: 'Director',
                                value: (
                                    <>
                                        Tracy Rodriguez
                                        <br />
                                        <a href="mailto:tracyrodriguez@thegryc.org" className="link">
                                            tracyrodriguez@thegryc.org
                                        </a>
                                    </>
                                )
                            }
                        ]}
                    />
                    <h2 className="label mt-10">The 2026 season</h2>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <Flyer flyer={FLYERS.syepEnglish} caption="2026 flyer, English." />
                        <Flyer flyer={FLYERS.syepSpanish} caption="Folleto 2026, español." />
                    </div>
                    <div className="mt-4">
                        <Flyer flyer={FLYERS.syepTimeline} caption="2026 timeline." />
                    </div>
                </aside>
            </div>

            <div className="shell flex flex-wrap gap-x-8 gap-y-3 pb-16">
                <ArrowLink to="/jobs">Back to jobs</ArrowLink>
                <ArrowLink to="/programs">All programs</ArrowLink>
            </div>
        </>
    );
}
