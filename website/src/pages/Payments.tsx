import { Notice } from '@/components/Bits';
import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ArrowLink, OutLink } from '@/components/ui/Arrow';
import { ButtonAnchor } from '@/components/ui/Button';
import { PHOTOS } from '@/data/photos';
import { PAYMENT_FORMS, site } from '@/data/site';

export default function Payments() {
    return (
        <>
            <Seo pageId="payments" />
            <PageIntro
                title="Payments"
                lead="Payment links for our fee-based after-school programs. The payment schedule is in your family handbook."
                backdrop={PHOTOS.feeCrafts}
            >
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                    <ButtonAnchor href={site.links.procare}>Pay on myprocare.com</ButtonAnchor>
                    <OutLink href={site.links.paymentInstructions}>Instructions for making an account (PDF)</OutLink>
                </div>
            </PageIntro>

            <div className="shell grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
                <div className="lg:col-span-7">
                    <Notice tone="alert">
                        <p className="font-semibold text-ink">We’re having issues with TD Bank. Please do not use TD Bank cards.</p>
                        <p lang="es" className="mt-1 text-ink-2">
                            No utilice tarjetas bancarias de TD.
                        </p>
                    </Notice>

                    <h2 className="display mt-12 text-[2.2rem] sm:text-[2.7rem]">Payment links by school</h2>
                    <ul className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2">
                        {PAYMENT_FORMS.map((f) => (
                            <li key={f.school} className="bg-paper">
                                <a
                                    href={f.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-baseline justify-between gap-4 px-5 py-4 text-ink hover:bg-white"
                                >
                                    <span className="display text-[1.35rem] group-hover:underline">{f.school}</span>
                                    <span className="text-[0.9rem] font-normal text-ink-3">
                                        Payment form <span aria-hidden="true">↗</span>
                                        <span className="sr-only"> (opens in a new tab)</span>
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <aside className="lg:col-span-4 lg:col-start-9">
                    <h2 className="display text-[1.8rem]">Good to know</h2>
                    <div className="prose-gryc mt-4">
                        <ul>
                            <li>Payments open on each payment day. Late fees start the next business day.</li>
                            <li>
                                For how to pay, see{' '}
                                <a href={site.links.paymentInstructions} target="_blank" rel="noreferrer" className="link">
                                    this PDF
                                </a>
                                .
                            </li>
                            <li>If you haven’t received your Procare invite, contact your after-school director.</li>
                        </ul>
                    </div>
                    <ArrowLink to="/contact#directory" className="mt-6">
                        Find your director
                    </ArrowLink>
                </aside>
            </div>
        </>
    );
}
