import { Link } from 'react-router';
import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ArrowLink } from '@/components/ui/Arrow';
import Photo, { Backdrop } from '@/components/ui/Photo';
import { PHOTOS } from '@/data/photos';
import { BOARD, EXECUTIVE } from '@/data/staff';
import { site } from '@/data/site';

export default function About() {
    return (
        <>
            <Seo pageId="about" />
            <PageIntro
                title="Who we are"
                lead={`A not-for-profit 501(c)(3) serving Queens youth and families since ${site.founded}, and today more than ${site.youthServedDaily} of them every day.`}
                backdrop={PHOTOS.staffGroup}
                aside={<Photo photo={PHOTOS.greenShirtsGroup} width={520} height={360} priority className="aspect-[13/9] w-full" />}
            />

            <div className="shell grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
                <div className="prose-gryc text-lg lg:col-span-7">
                    <p>
                        The GRYC focuses on education, counseling, truancy prevention, job preparation and employment opportunities. We currently serve more than{' '}
                        {site.youthServedDaily} youth and families per day, and we’re always excited to welcome new members to our family.
                    </p>
                    <p>
                        The GRYC is a safe haven for neighborhood youth and their families. We use a wide range of comprehensive programs to help children and
                        adults find new avenues of learning and make the most of everyday life experiences.
                    </p>
                    <p>
                        For more information, feel free to{' '}
                        <Link to="/contact" className="link">
                            contact us
                        </Link>
                        .
                    </p>
                </div>
                <div className="lg:col-span-4 lg:col-start-9 lg:mt-24">
                    <Photo photo={PHOTOS.robotics} width={420} height={320} className="aspect-[21/16] w-full" />
                </div>
            </div>

            <section className="on-dark relative isolate overflow-hidden bg-navy-950 text-white/80" aria-labelledby="mission-h">
                <Backdrop photo={PHOTOS.orangeShirts} className="object-[50%_30%] opacity-[0.3]" />
                <div aria-hidden="true" className="absolute inset-0 bg-linear-to-l from-navy-950 via-navy-950/80 to-navy-950/35" />
                <div className="shell relative grid gap-8 py-20 lg:grid-cols-12 lg:py-28">
                    <h2 id="mission-h" className="display text-[2.6rem] sm:text-[3.4rem] lg:col-span-4">
                        Our mission
                    </h2>
                    <div className="space-y-5 text-lg leading-relaxed lg:col-span-7 lg:col-start-6 lg:pt-24">
                        <p>
                            The mission of the Greater Ridgewood Youth Council is to improve the quality of life for youths and families in the borough of Queens
                            through service.
                        </p>
                        <p>
                            The GRYC fosters a climate of purposeful inclusion where all can feel respected, safe and connected. We welcome and cherish the
                            diversity of humanity, which includes differences in sex, age, race, ethnicity, national origin, range of abilities, sexual
                            orientation, gender identity, financial means, education and political perspective.
                        </p>
                        <p>
                            These beliefs allow us to offer educational, recreational, cultural and employment programs which empower all people to explore new
                            avenues of learning and positive life experiences. The GRYC is a not-for-profit 501(c)(3), non-sectarian organization serving community
                            youth and families since 1980.
                        </p>
                    </div>
                </div>
            </section>

            <div className="shell grid gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
                <section aria-labelledby="board-h">
                    <h2 id="board-h" className="display text-[2.2rem] sm:text-[2.7rem]">
                        Board of directors
                    </h2>
                    <ul className="mt-6 border-t border-line">
                        {BOARD.map((name) => (
                            <li key={name} className="border-b border-line py-2.5 text-lg text-ink">
                                {name}
                            </li>
                        ))}
                    </ul>
                </section>
                <section aria-labelledby="exec-h" className="lg:pt-16">
                    <h2 id="exec-h" className="display text-[2.2rem] sm:text-[2.7rem]">
                        Executive staff
                    </h2>
                    <ul className="mt-6 border-t border-line">
                        {EXECUTIVE.map((p) => (
                            <li key={`${p.role}-${p.name}`} className="grid gap-1 border-b border-line py-2.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
                                <span className="text-lg font-semibold text-ink">{p.name}</span>
                                <span className="text-ink-2">{p.role}</span>
                            </li>
                        ))}
                    </ul>
                    <ArrowLink to="/contact#directory" className="mt-6">
                        Full staff directory and email contacts
                    </ArrowLink>
                </section>
            </div>
        </>
    );
}
