import { BandBackdrop } from '@/components/PageIntro';
import Seo from '@/components/Seo';
import Scribble from '@/components/brand/Scribble';
import { ArrowLink } from '@/components/ui/Arrow';
import { ButtonLink } from '@/components/ui/Button';
import { MAIN_NAV, PROGRAM_NAV } from '@/data/site';
import { PHOTOS } from '@/data/photos';

export default function NotFound() {
    return (
        <>
            <Seo title="Page not found | The Greater Ridgewood Youth Council" description="This page doesn’t exist. Find programs, locations, jobs and payments here." noindex />
            <section className="on-dark relative isolate overflow-hidden bg-navy-950 text-white/80">
                <BandBackdrop photo={PHOTOS.gym} priority />
                <Scribble shape="underline" weight={12} className="absolute bottom-10 left-1/2 h-12 w-72 -translate-x-1/2 text-sun-400/80" />
                <div className="shell relative max-w-3xl py-24 text-center sm:py-32">
                    <p className="label">Page not found</p>
                    <h1 className="display mt-4 text-[2.8rem] sm:text-[4rem]">We couldn’t find that page.</h1>
                    <p className="mx-auto mt-5 max-w-xl text-lg">It may have moved when the site was rebuilt. Most of what families look for is one of these.</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <ButtonLink to="/" size="lg">
                            Go to the home page
                        </ButtonLink>
                        <ButtonLink to="/locations" variant="outline" size="lg">
                            Find a program
                        </ButtonLink>
                    </div>
                    <ul className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3">
                        {[...PROGRAM_NAV.slice(1, 4), ...MAIN_NAV].map((l) => (
                            <li key={l.to}>
                                <ArrowLink to={l.to}>{l.label}</ArrowLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}
