// every fixed page the site has, in one list. App.tsx builds the routes from it,
// <Seo /> builds canonical links from it, and scripts/prerender.ts writes one HTML
// file per page (plus one per location from locations.ts) and sitemap.xml.
import { LOCATIONS } from './locations';
import { SITE_URL } from './site';

export type PageId =
    | 'home'
    | 'about'
    | 'programs'
    | 'prek'
    | 'k5'
    | 'fee'
    | 'ms'
    | 'syep'
    | 'signup'
    | 'locations'
    | 'jobs'
    | 'apply'
    | 'payments'
    | 'donate'
    | 'contact'
    | 'news'
    | 'login';

export type Page = {
    id: PageId;
    path: string;
    title: string;
    description: string;
    priority: number;
    changefreq: 'weekly' | 'monthly' | 'yearly';
    /** the staff login stays out of search results */
    noindex?: boolean;
};

export const UPDATED = '2026-11-08';

export const PAGES: Page[] = [
    {
        id: 'home',
        path: '/',
        title: 'The Greater Ridgewood Youth Council | After School, Pre-K & SYEP in Queens',
        description:
            'Free after school, 3-K and Pre-K, Beacon centers and summer jobs at 24 schools across Queens and Brooklyn. A Ridgewood nonprofit serving youth and families since 1980.',
        priority: 1,
        changefreq: 'weekly'
    },
    {
        id: 'about',
        path: '/about',
        title: 'Who We Are | The Greater Ridgewood Youth Council',
        description:
            'A not-for-profit 501(c)(3) serving more than 3,200 youth and families in Queens every day since 1980. Our mission, board of directors and executive staff.',
        priority: 0.7,
        changefreq: 'yearly'
    },
    {
        id: 'programs',
        path: '/programs',
        title: 'Our Programs | The Greater Ridgewood Youth Council',
        description:
            'Little Stars 3-K and Pre-K, free COMPASS and SONYC after school, Beacon community centers, fee-based after school and the Summer Youth Employment Program.',
        priority: 0.9,
        changefreq: 'monthly'
    },
    {
        id: 'prek',
        path: '/programs/pre-k',
        title: 'Little Stars 3-K and Pre-K in Ridgewood | GRYC',
        description:
            'Free, full-day 3-K and Pre-K for All at 59-03 Summerfield Street and 776 Fairview Avenue in Ridgewood. Enrollment for 2026–27 is open for children born in 2022 and 2023.',
        priority: 0.9,
        changefreq: 'monthly'
    },
    {
        id: 'k5',
        path: '/programs/after-school-k-5',
        title: 'Free After School, Grades K–5 (COMPASS) | GRYC',
        description: 'City-funded COMPASS after-school programs at 11 Queens and Brooklyn elementary schools, free of charge for every child.',
        priority: 0.8,
        changefreq: 'monthly'
    },
    {
        id: 'fee',
        path: '/programs/fee-based-k-5',
        title: 'Fee-Based After School, Grades K–5 | GRYC',
        description: 'Subsidized, low-fee after school at P.S. 68, P.S. 87, P.S. 164 and P.S. 305 in Queens.',
        priority: 0.8,
        changefreq: 'monthly'
    },
    {
        id: 'ms',
        path: '/programs/middle-school-6-8',
        title: 'Free Middle School Programs, Grades 6–8 (SONYC) | GRYC',
        description: 'Free SONYC clubs for 6th to 8th graders at 11 middle schools across Queens: sports, arts, gaming and service.',
        priority: 0.8,
        changefreq: 'monthly'
    },
    {
        id: 'syep',
        path: '/programs/summer-youth-employment',
        title: 'Summer Youth Employment Program (SYEP), Ages 14–24 | GRYC',
        description:
            'Six weeks of paid summer jobs and service learning for ages 14 to 24. Ages 16 to 24 earn $16.50 an hour; ages 14 and 15 earn a $700 stipend.',
        priority: 0.8,
        changefreq: 'monthly'
    },
    {
        id: 'signup',
        path: '/programs/sign-up',
        title: 'How to Sign Up for Free After School | GRYC',
        description: 'Apply for our free after-school programs through DYCD Connect: find the school, add it to your list and complete the application.',
        priority: 0.7,
        changefreq: 'yearly'
    },
    {
        id: 'locations',
        path: '/locations',
        title: 'Our Locations: 24 Schools in Queens & Brooklyn | GRYC',
        description: 'Find a GRYC program by grade, cost and neighborhood: Ridgewood, Middle Village, Glendale, Maspeth, Woodhaven, Flushing and more.',
        priority: 0.9,
        changefreq: 'monthly'
    },
    {
        id: 'jobs',
        path: '/jobs',
        title: 'Job Opportunities | The Greater Ridgewood Youth Council',
        description: 'Work for the GRYC as a group leader or instructor, or apply to the Summer Youth Employment Program.',
        priority: 0.7,
        changefreq: 'monthly'
    },
    {
        id: 'apply',
        path: '/jobs/apply',
        title: 'Now Hiring: Group Leaders & Instructors | GRYC',
        description: 'Lead after-school and summer activities with Queens kids. Applicants must be 18 or older with a high school diploma or GED.',
        priority: 0.7,
        changefreq: 'monthly'
    },
    {
        id: 'payments',
        path: '/payments',
        title: 'Payments for Fee-Based Programs | GRYC',
        description: 'Pay for a GRYC fee-based after-school program through Procare, with payment links for each school.',
        priority: 0.6,
        changefreq: 'monthly'
    },
    {
        id: 'donate',
        path: '/donate',
        title: 'Donate | The Greater Ridgewood Youth Council',
        description: 'Support a safe place for Queens kids to learn and grow. The GRYC is a 501(c)(3); all donations are tax-deductible.',
        priority: 0.6,
        changefreq: 'yearly'
    },
    {
        id: 'contact',
        path: '/contact',
        title: 'Contact Us & Staff Directory | GRYC',
        description: 'GRYC Headquarters, 59-03 Summerfield Street, Ridgewood. Open Monday to Friday, 8 AM to 6 PM. Call (718) 456-KIDS.',
        priority: 0.7,
        changefreq: 'monthly'
    },
    {
        id: 'news',
        path: '/news',
        title: 'News | The Greater Ridgewood Youth Council',
        description: 'Showcases, championships and program highlights from GRYC sites across Queens.',
        priority: 0.6,
        changefreq: 'weekly'
    },
    {
        id: 'login',
        path: '/login',
        title: 'Staff Login | The Greater Ridgewood Youth Council',
        description: 'Sign in to the GRYC staff portal.',
        priority: 0.1,
        changefreq: 'yearly',
        noindex: true
    }
];

export function getPage(id: PageId): Page {
    const page = PAGES.find((p) => p.id === id);
    if (!page) throw new Error(`unknown page ${id}`);
    return page;
}

export const pageUrl = (path: string) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`);

export const locationPath = (slug: string) => `/locations/${slug}`;

/** every address to prerender and list in sitemap.xml */
export const ALL_PATHS: { path: string; priority: number; changefreq: string; noindex?: boolean }[] = [
    ...PAGES.map((p) => ({ path: p.path, priority: p.priority, changefreq: p.changefreq, noindex: p.noindex })),
    ...LOCATIONS.map((l) => ({ path: locationPath(l.slug), priority: 0.7, changefreq: 'monthly' }))
];
