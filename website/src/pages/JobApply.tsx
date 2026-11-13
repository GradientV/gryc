import { Facts } from '@/components/Bits';
import PageIntro from '@/components/PageIntro';
import Seo from '@/components/Seo';
import { ArrowLink } from '@/components/ui/Arrow';
import { ButtonAnchor } from '@/components/ui/Button';
import { PHOTOS } from '@/data/photos';
import { site } from '@/data/site';

const ROLES = [
    {
        title: 'Instructor',
        overview:
            'The Instructor plays a key role in creating a positive and inclusive environment for participants. Instructors lead academic, enrichment and recreational activities that spark curiosity, build confidence and encourage teamwork. The position is ideal for people who are passionate about youth development, enjoy hands-on learning and want to make a meaningful impact in their community.',
        duties: [
            'Plan and lead daily activities in areas such as academic support, STEAM, literacy, physical activity and social-emotional learning.',
            'Keep a safe, organized and welcoming classroom or activity space.',
            'Support participants’ academic growth through homework help, tutoring and engaging learning strategies.',
            'Build positive relationships with participants that foster respect, responsibility and self-esteem.',
            'Work with the Program Director, Content Specialist and fellow staff to create a cohesive, dynamic program.',
            'Communicate regularly with the Program Director about attendance, behavior and student progress.',
            'Take part in staff meetings, training sessions and community events.',
            'Serve as a positive role model, showing professionalism, empathy and enthusiasm.'
        ]
    },
    {
        title: 'Group Leader',
        overview:
            'The Group Leader plays a vital role in guiding, mentoring and supervising participants in daily after-school and summer activities. The position is ideal for energetic, caring people who enjoy working with children and want to help them reach their full potential. Group Leaders are positive role models who make sure every participant feels included, valued and encouraged to learn and grow.',
        duties: [
            'Supervise and engage a group of participants in structured and unstructured activities, including homework help, enrichment projects and physical activity.',
            'Create a welcoming, inclusive environment that promotes respect, cooperation and kindness.',
            'Assist Instructors and Activity Specialists in carrying out lessons.',
            'Support participants’ academic and social development through encouragement, mentorship and positive reinforcement.',
            'Keep accurate attendance records and always ensure participant safety.',
            'Communicate effectively with program staff and participants.',
            'Take part in staff meetings, training and special events.',
            'Serve as a role model by showing professionalism, empathy and commitment to the GRYC’s mission and values.'
        ]
    }
];

export default function JobApply() {
    return (
        <>
            <Seo pageId="apply" />
            <PageIntro
                crumbs={[{ to: '/jobs', label: 'Jobs' }]}
                title="Now hiring: group leaders and instructors"
                lead="Lead after-school and summer activities with kids at our sites across Queens."
                backdrop={PHOTOS.gym}
            >
                <ButtonAnchor href={site.links.jobApplication} size="lg">
                    Apply here
                </ButtonAnchor>
            </PageIntro>
            <div className="shell grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
                <div className="space-y-14 lg:col-span-7">
                    {ROLES.map((r) => (
                        <section key={r.title} aria-labelledby={`${r.title}-h`}>
                            <h2 id={`${r.title}-h`} className="display text-[2.2rem] sm:text-[2.7rem]">
                                {r.title}
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-ink-2">{r.overview}</p>
                            <h3 className="display mt-8 text-[1.5rem]">Key responsibilities</h3>
                            <div className="prose-gryc mt-3">
                                <ul>
                                    {r.duties.map((d) => (
                                        <li key={d}>{d}</li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    ))}
                </div>
                <aside className="lg:col-span-4 lg:col-start-9">
                    <div className="lg:sticky lg:top-6">
                        <Facts
                            items={[
                                { label: 'Roles', value: 'Instructors and group leaders' },
                                { label: 'When', value: 'After school and summer' },
                                { label: 'Requirements', value: '18 or older, with a high school diploma or GED' },
                                { label: 'Pay', value: 'Based on experience, program requirements, budget and seniority' }
                            ]}
                        />
                        <ButtonAnchor href={site.links.jobApplication} className="mt-6 w-full">
                            Apply here
                        </ButtonAnchor>
                        <ArrowLink to="/programs/summer-youth-employment" className="mt-6">
                            Ages 14 to 24? See summer jobs (SYEP)
                        </ArrowLink>
                    </div>
                </aside>
            </div>
        </>
    );
}
