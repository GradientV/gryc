// one page per school site. The old Wix addresses (/locations/p.s.-153-maspeth-elementary)
// redirect here to the new ones (/locations/ps-153-maspeth-elementary).
import { Navigate, useParams } from 'react-router';
import { Facts, Notice, SiteList } from '@/components/Bits';
import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ArrowLink, OutLink } from '@/components/ui/Arrow';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import Photo from '@/components/ui/Photo';
import { getLocation, LOCATIONS, type Location } from '@/data/locations';
import { locationPath } from '@/data/pages';
import { PHOTOS } from '@/data/photos';
import { site } from '@/data/site';
import { directionsHref } from '@/lib/format';
import NotFound from './NotFound';

const MODEL: Record<Location['model'], { label: string; line: string }> = {
    COMPASS: { label: 'COMPASS after school', line: 'A free COMPASS after-school program, funded by NYC DYCD.' },
    SONYC: { label: 'SONYC middle school', line: 'A free SONYC middle school program, funded by NYC DYCD.' },
    Beacon: { label: 'Beacon community center', line: 'A free Beacon community center for kids, teens and adults, funded by NYC DYCD.' },
    'GRYC fee-based': { label: 'GRYC after school', line: 'A subsidized GRYC after-school program, offered for a low fee.' }
};

/** the photo faded into the top band, by kind of program (the school's own photos sit on the right) */
const BACKDROP: Record<Location['model'], { id: string }> = {
    COMPASS: PHOTOS.gym,
    SONYC: PHOTOS.robotics,
    Beacon: PHOTOS.seniorKnights,
    'GRYC fee-based': PHOTOS.feeCrafts
};

/** paragraphs, with "* item" lines gathered into a list */
function About({ lines }: { lines: string[] }) {
    const blocks: (string | string[])[] = [];
    for (const line of lines) {
        if (line.startsWith('* ')) {
            const last = blocks[blocks.length - 1];
            if (Array.isArray(last)) last.push(line.slice(2));
            else blocks.push([line.slice(2)]);
        } else {
            blocks.push(line);
        }
    }
    return (
        <div className="prose-gryc">
            {blocks.map((b, i) =>
                Array.isArray(b) ? (
                    <ul key={i}>
                        {b.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                ) : (
                    <p key={i}>{b}</p>
                )
            )}
        </div>
    );
}

function Join({ l }: { l: Location }) {
    if (l.cost === 'fee') {
        return (
            <Notice>
                <h2 className="display text-[1.65rem]">This is a fee-based program</h2>
                <p className="mt-2 text-ink-2">Email the director to enroll. Payments go through Procare.</p>
                <ButtonLink to="/payments" size="sm" className="mt-4">
                    Payment info
                </ButtonLink>
            </Notice>
        );
    }
    return (
        <Notice tone="navy">
            <h2 className="display text-[1.65rem]">This is a free program</h2>
            <p className="mt-2 text-ink-2">Apply through DYCD Connect, the city’s sign-up site.</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                <ButtonAnchor href={l.applyUrl || site.links.dycdConnect} size="sm">
                    Apply here
                </ButtonAnchor>
                <ArrowLink to="/programs/sign-up">How to sign up</ArrowLink>
            </div>
        </Notice>
    );
}

export default function LocationDetail() {
    const { slug = '' } = useParams();
    const l = getLocation(slug);
    if (!l) return <NotFound />;
    // an old Wix address: send it to the new one
    if (slug !== l.slug) return <Navigate to={locationPath(l.slug)} replace />;

    const model = MODEL[l.model];
    const nearby = LOCATIONS.filter((o) => o.area === l.area && o.slug !== l.slug).map((o) => o.slug);
    const [cover, ...gallery] = l.photos;
    const enrollment = /^\d/.test(l.enrollment) ? `${l.enrollment.replace(' Annually', ' a year')} students` : l.enrollment;

    return (
        <>
            <Seo
                path={locationPath(l.slug)}
                title={`${l.name} | GRYC ${l.model === 'GRYC fee-based' ? 'after school' : l.model}, ${l.area}`}
                description={`${model.line} Grades ${l.grades} at ${l.address}. ${l.hours}. Director: ${l.director}.`}
            />

            <PageIntro
                crumbs={[{ to: '/locations', label: 'Locations' }]}
                here={l.area}
                title={l.name}
                backdrop={BACKDROP[l.model]}
                lead={
                    <>
                        <p className="font-semibold text-sun-300">
                            Grades {l.grades} · {l.cost === 'free' ? 'Free' : 'Fee-based'} · {model.label}
                        </p>
                        <p className="mt-1">{l.address}</p>
                    </>
                }
                aside={
                    cover ? (
                        <div className="grid grid-cols-3 gap-3">
                            <Photo
                                photo={{ id: cover, alt: `${l.short} after school` }}
                                width={480}
                                height={340}
                                priority
                                className={gallery.length ? 'col-span-2 aspect-[24/17] h-full w-full' : 'col-span-3 aspect-[24/17] w-full'}
                            />
                            {gallery[0] ? <Photo photo={{ id: gallery[0], alt: `Students at ${l.short}` }} width={240} height={340} priority className="h-full w-full lg:translate-y-8" /> : null}
                        </div>
                    ) : undefined
                }
            >
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                    <OutLink href={directionsHref(l.address)}>Directions</OutLink>
                    {l.mailto ? <OutLink href={l.mailto}>Email the director</OutLink> : null}
                </div>
            </PageIntro>

            <div className="shell grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
                <div className="lg:col-span-7">
                    <h2 className="display text-[2.2rem]">About the program</h2>
                    <div className="mt-5">
                        <About lines={l.about} />
                    </div>
                    {l.activities.map((group) => (
                        <div key={group.title || 'activities'} className="mt-10">
                            <h2 className="display text-[1.75rem]">{group.title || 'Activities offered'}</h2>
                            <ul className="mt-4 grid gap-x-6 border-t border-line sm:grid-cols-2">
                                {group.items.map((a) =>
                                    a.startsWith('(') ? null : (
                                        <li key={a} className="border-b border-line py-2.5 text-ink-2">
                                            {a}
                                        </li>
                                    )
                                )}
                            </ul>
                            {group.items
                                .filter((a) => a.startsWith('('))
                                .map((note) => (
                                    <p key={note} className="mt-3 text-[0.92rem] text-ink-3">
                                        {note.replace(/^\(note: /i, '').replace(/\)$/, '').replace(/^./, (c) => c.toUpperCase())}.
                                    </p>
                                ))}
                        </div>
                    ))}
                </div>

                <aside className="space-y-8 lg:col-span-4 lg:col-start-9">
                    <Facts
                        items={[
                            { label: 'Grades', value: l.grades },
                            { label: 'Hours', value: l.hours },
                            { label: 'Enrollment', value: enrollment },
                            { label: 'Cost', value: l.cost === 'free' ? 'Free' : 'Fee-based' },
                            {
                                label: 'Director',
                                value: (
                                    <>
                                        {l.director}
                                        {l.mailto ? (
                                            <>
                                                <br />
                                                <a href={l.mailto} className="link break-all">
                                                    {l.email}
                                                </a>
                                            </>
                                        ) : null}
                                    </>
                                )
                            }
                        ]}
                    />
                    <Join l={l} />
                </aside>
            </div>

            {nearby.length ? (
                <section className="bg-paper-2" aria-labelledby="nearby-h">
                    <div className="shell py-12 lg:py-16">
                        <h2 id="nearby-h" className="display text-[2.2rem] sm:text-[2.6rem]">
                            Also in {l.area}
                        </h2>
                        <SiteList slugs={nearby} className="mt-6" />
                        <ArrowLink to="/locations" className="mt-6">
                            All locations
                        </ArrowLink>
                    </div>
                </section>
            ) : (
                <div className="shell pb-16">
                    <ArrowLink to="/locations">All locations</ArrowLink>
                </div>
            )}
        </>
    );
}
