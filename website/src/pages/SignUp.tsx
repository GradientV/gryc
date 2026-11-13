// the old site had these steps on an unlinked page (/projects-3) as a numbered 01–06 list.
// Here they're plain prose, linked from every free program.
import { Link } from 'react-router';
import { Notice } from '@/components/Bits';
import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ArrowLink } from '@/components/ui/Arrow';
import { ButtonAnchor } from '@/components/ui/Button';
import { PHOTOS } from '@/data/photos';
import { site } from '@/data/site';

export default function SignUp() {
    return (
        <>
            <Seo pageId="signup" />
            <PageIntro
                crumbs={[{ to: '/programs', label: 'Programs' }]}
                title="Sign up for free after school"
                lead="Our free COMPASS, SONYC and Beacon programs take applications through DYCD Connect, the city’s sign-up site. If you have questions, reach out to the director of the program you want to join."
                backdrop={PHOTOS.familyArt}
            >
                <ButtonAnchor href={site.links.dycdConnect} size="lg">
                    Open DYCD Connect
                </ButtonAnchor>
            </PageIntro>

            <div className="shell grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
                <div className="prose-gryc text-lg lg:col-span-7">
                    <p>
                        <strong className="text-ink">Start with an account.</strong> Go to DYCD Connect and log in, or create a new account if you don’t have one.
                    </p>
                    <p>
                        <strong className="text-ink">Find the school.</strong> Search for the school name and choose “add to list.” Our sites and their grades are
                        on the <Link to="/locations">locations page</Link>.
                    </p>
                    <p>
                        <strong className="text-ink">Apply from your dashboard.</strong> Go to the dashboard and click “apply,” then complete all eight steps of
                        the application with up-to-date information. Include everyone who has permission to pick up your child.
                    </p>
                    <p>
                        <strong className="text-ink">Submit.</strong> When the status bar reaches 100%, click “submit” and wait for a confirmation email.
                    </p>
                    <p>
                        <strong className="text-ink">Wait for the lottery.</strong> All applications go into a lottery, and you’ll get an email about acceptance.
                        You can check your application’s status with the same link.
                    </p>
                </div>
                <aside className="space-y-8 lg:col-span-4 lg:col-start-9">
                    <Notice tone="navy">
                        <h2 className="display text-[1.35rem]">Questions?</h2>
                        <p className="mt-2 text-ink-2">Each program’s director can help with the application.</p>
                        <ArrowLink to="/contact#directory" className="mt-3">
                            Full staff directory
                        </ArrowLink>
                    </Notice>
                    <div>
                        <h2 className="display text-[1.35rem]">Fee-based programs</h2>
                        <p className="mt-2 text-ink-2">
                            P.S. 68, P.S. 87, P.S. 164 and P.S. 305 don’t use DYCD Connect. Email the site director, and pay through Procare.
                        </p>
                        <ArrowLink to="/payments" className="mt-3">
                            Payment info
                        </ArrowLink>
                    </div>
                </aside>
            </div>
        </>
    );
}
