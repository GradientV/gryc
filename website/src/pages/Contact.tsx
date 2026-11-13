import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { OutLink } from '@/components/ui/Arrow';
import { ButtonAnchor } from '@/components/ui/Button';
import { PHOTOS } from '@/data/photos';
import { DIRECTORY } from '@/data/staff';
import { site } from '@/data/site';

export default function Contact() {
    return (
        <>
            <Seo pageId="contact" />
            <PageIntro
                title="Contact us"
                lead="The Greater Ridgewood Youth Council looks forward to hearing from you. Call, visit or email us anytime."
                backdrop={PHOTOS.syepStreet}
            />

            <section className="shell grid gap-px border-x-0 py-16 lg:grid-cols-3 lg:py-20" aria-label="How to reach us">
                <div className="border-t border-line pt-6 lg:pr-8">
                    <h2 className="label">Visit</h2>
                    <address className="display mt-3 text-[1.55rem] leading-snug not-italic text-ink">
                        {site.hq.label}
                        <br />
                        {site.hq.street}
                        <br />
                        {site.hq.city}, New York {site.hq.zip}
                    </address>
                    <OutLink href={site.hq.directions} className="mt-4">
                        Directions
                    </OutLink>
                </div>
                <div className="border-t border-line pt-6 lg:mt-10 lg:px-8">
                    <h2 className="label">Call</h2>
                    <p className="display mt-3 text-[1.55rem] text-ink">
                        <a href={`tel:${site.phone.tel}`} className="hover:text-navy-700 hover:underline">
                            {site.phone.display}
                        </a>
                    </p>
                    <p className="mt-1 text-ink-2">Fax {site.fax}</p>
                    <ButtonAnchor href={`tel:${site.phone.tel}`} variant="outline" size="sm" className="mt-4">
                        Call the GRYC
                    </ButtonAnchor>
                </div>
                <div className="border-t border-line pt-6 lg:mt-20 lg:pl-8">
                    <h2 className="label">Open</h2>
                    <p className="display mt-3 text-[1.55rem] leading-snug text-ink">
                        Monday to Friday
                        <br />8 AM to 6 PM
                    </p>
                    <p className="mt-3 text-[0.95rem] text-ink-2">Email the right person directly from the directory below.</p>
                </div>
            </section>

            <section id="directory" className="scroll-mt-6 bg-paper-2" aria-labelledby="directory-h">
                <div className="shell py-16 lg:py-24">
                    <h2 id="directory-h" className="display text-[2.4rem] sm:text-[3.1rem]">
                        Staff directory
                    </h2>
                    <p className="mt-3 max-w-2xl text-ink-2">Click a name to email them.</p>
                    <div className="mt-10 grid gap-x-12 gap-y-12 lg:grid-cols-2">
                        {DIRECTORY.map((group) => (
                            <div key={group.title} className={group.title === 'Site directors' ? 'lg:row-span-3' : undefined}>
                                <h3 className="display text-[1.6rem]">{group.title}</h3>
                                <ul className="mt-4 border-t border-line">
                                    {group.people.map((p) => (
                                        <li key={`${p.role}-${p.name}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-line py-2.5 text-[0.97rem]">
                                            <span className="text-ink-2">{p.role}</span>
                                            {p.mailto ? (
                                                <a href={p.mailto} className="text-right font-semibold text-navy-600 hover:underline">
                                                    {p.name}
                                                </a>
                                            ) : (
                                                <span className="text-right font-semibold text-ink">{p.name}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
