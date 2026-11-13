import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ArrowLink } from '@/components/ui/Arrow';
import { ButtonAnchor } from '@/components/ui/Button';
import Photo from '@/components/ui/Photo';
import { PHOTOS } from '@/data/photos';
import { site } from '@/data/site';

export default function Donate() {
    return (
        <>
            <Seo pageId="donate" />
            <PageIntro
                title="Donate"
                lead="For more than 40 years, the Greater Ridgewood Youth Council has given Queens families a fun, safe place for their children. That would not have been possible without our generous donors."
                backdrop={PHOTOS.familyArt}
                aside={<Photo photo={PHOTOS.paintedPlates} width={520} height={360} priority className="aspect-[13/9] w-full" />}
            >
                <ButtonAnchor href={site.links.paypal} size="lg">
                    Donate with PayPal
                </ButtonAnchor>
            </PageIntro>

            <div className="shell grid gap-12 py-16 lg:grid-cols-12 lg:py-24">
                <div className="prose-gryc text-lg lg:col-span-7">
                    <p>
                        Your support helps us reach thousands of young people, and helps us give your kids a safe place to broaden their minds and further their
                        education.
                    </p>
                    <p>
                        To donate, use the Donate with PayPal button. No donation is too big or too small. The GRYC serves {site.youthServedDaily} youth and
                        families each day, and these services would not be possible without the ongoing support of our community. Together, we can continue to
                        make a difference in the lives of families.
                    </p>
                    <p className="font-semibold text-ink">Thank you for your ongoing support!</p>
                </div>
                <aside className="lg:col-span-4 lg:col-start-9">
                    <div className="border border-line bg-white/70 p-6">
                        <h2 className="display text-[1.8rem]">Tax-deductible</h2>
                        <p className="mt-2 text-ink-2">
                            The Greater Ridgewood Youth Council is a non-profit 501(c)(3) organization. All donations are tax-deductible.
                        </p>
                        <ButtonAnchor href={site.links.paypal} className="mt-5 w-full">
                            Donate with PayPal
                        </ButtonAnchor>
                    </div>
                    <div className="mt-8">
                        <h2 className="display text-[1.6rem]">Rather give your time?</h2>
                        <p className="mt-2 text-ink-2">Passionate about serving your community? See current openings at our sites.</p>
                        <ArrowLink to="/jobs/apply" className="mt-3">
                            Current openings
                        </ArrowLink>
                    </div>
                </aside>
            </div>

        </>
    );
}
