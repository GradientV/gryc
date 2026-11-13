import { Quote } from '@/components/Bits';
import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ButtonLink } from '@/components/ui/Button';
import Photo, { Backdrop } from '@/components/ui/Photo';
import { PHOTOS, type Photo as PhotoData } from '@/data/photos';
import { cn } from '@/lib/cn';

function Track({ photo, title, body, to, cta, flip }: { photo: PhotoData; title: string; body: string; to: string; cta: string; flip?: boolean }) {
    return (
        <article className="grid gap-6 md:grid-cols-12 md:gap-10">
            <Photo photo={photo} width={560} height={400} className={cn('aspect-[7/5] w-full md:col-span-6', flip && 'md:order-2 md:col-start-7')} />
            <div className={cn('md:col-span-5 md:pt-14', flip ? 'md:order-1 md:col-start-1' : 'md:col-start-8')}>
                <h2 className="display text-[2.2rem] sm:text-[2.7rem]">{title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-ink-2">{body}</p>
                <ButtonLink to={to} className="mt-6">
                    {cta}
                </ButtonLink>
            </div>
        </article>
    );
}

export default function Jobs() {
    return (
        <>
            <Seo pageId="jobs" />
            <PageIntro
                title="Job opportunities"
                lead="We’re proud to offer summer jobs and service learning to thousands of young people every year, and we’re accepting applications for staff positions."
                backdrop={PHOTOS.staffGroup}
            />
            <div className="shell space-y-20 py-16 lg:space-y-24 lg:py-24">
                <Track
                    photo={PHOTOS.staffGroup}
                    title="Work for the GRYC"
                    body="Full-time and part-time positions open throughout the year at our sites across Queens. If you’re interested in working for the GRYC, take a look at our job listings. Applicants must be 18 or older and have a high school diploma or GED."
                    to="/jobs/apply"
                    cta="See listings and apply"
                />
                <Track
                    photo={PHOTOS.syepGarden}
                    title="Summer Youth Employment and Service Learning"
                    body="SYEP is a six-week summer program for youth ages 14 to 24. It gives young people from our community summer jobs and learning experiences that build on their own strengths, talents and interests."
                    to="/programs/summer-youth-employment"
                    cta="Enroll for SYEP"
                    flip
                />
            </div>
            <section className="on-dark relative isolate overflow-hidden bg-navy-950">
                <Backdrop photo={PHOTOS.syepWagon} className="object-[50%_40%] opacity-[0.3]" />
                <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-navy-950 via-navy-950/75 to-navy-950/30" />
                <div className="shell relative max-w-5xl py-20 lg:py-28">
                    <Quote by="Bob Monahan, President">
                        “No one person could do what has been done collectively and I am truly blessed to be a very small part of this 45-year history.”
                    </Quote>
                </div>
            </section>
        </>
    );
}
