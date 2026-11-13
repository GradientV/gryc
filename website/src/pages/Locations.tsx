import Finder from '@/components/Finder';
import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ArrowLink } from '@/components/ui/Arrow';
import { PHOTOS } from '@/data/photos';

export default function Locations() {
    return (
        <>
            <Seo pageId="locations" />
            <PageIntro
                title="Our locations"
                lead="Programs at 24 schools in Queens and Brooklyn, plus our two Little Stars 3-K and Pre-K centers in Ridgewood. Pick a grade, a cost or a neighborhood to narrow the list."
                backdrop={PHOTOS.orangeShirts}
            >
                <div className="flex flex-wrap gap-x-8 gap-y-3">
                    <ArrowLink to="/programs/sign-up">How to sign up for a free program</ArrowLink>
                    <ArrowLink to="/payments">Paying for a fee-based program</ArrowLink>
                </div>
            </PageIntro>
            <section className="bg-paper-2">
                <div className="shell py-14 lg:py-20">
                    <Finder />
                </div>
            </section>
        </>
    );
}
