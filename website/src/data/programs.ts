// the GRYC's programs, in the old site's words (the Our Programs page and its pop-ups),
// lightly tidied. `sites` are location slugs from locations.ts, in the old pop-up order.
import { PHOTOS, type Photo } from './photos';

export type ProgramId = 'prek' | 'k5' | 'fee' | 'ms' | 'beacon' | 'syep';

export type Program = {
    id: ProgramId;
    name: string;
    /** for cards and menus */
    short: string;
    path: string;
    who: string;
    cost: string;
    summary: string;
    body: string[];
    /** the line under the site list in the old pop-up */
    funding?: string;
    sites?: string[];
    photo: Photo;
};

export const PROGRAMS: Program[] = [
    {
        id: 'prek',
        name: 'Little Stars 3-K and Pre-K',
        short: '3-K and Pre-K',
        path: '/programs/pre-k',
        who: 'Ages 3 and 4',
        cost: 'Free',
        summary: 'Free, full-day 3-K and Pre-K for All at our two Ridgewood centers. Enrollment for 2026–27 is open.',
        body: [
            'We offer instruction according to developmentally appropriate practices, focusing on the cognitive, physical and social-emotional development of the children we serve. Our curriculum is based on the principle that children learn best when they are engaged in hands-on, project-based activities.',
            'We are the first step on the pathway to college and career readiness. All of our children are well prepared when they enter Kindergarten.'
        ],
        photo: PHOTOS.prekCrowns
    },
    {
        id: 'k5',
        name: 'Free after school, grades K–5',
        short: 'After school, K–5',
        path: '/programs/after-school-k-5',
        who: 'Kindergarten to 5th grade',
        cost: 'Free',
        summary: 'COMPASS programs at 11 elementary schools: homework help, STEM, arts and sports, up to three hours a day.',
        body: [
            'The COMPASS elementary model caters to the “whole child” in kindergarten through 5th grade. Beyond STEM learning, it strives to integrate literacy into all instruction and offers homework help, basic arts instruction and physical activity, including nutritional programming to promote healthy living.',
            'Our programs, located throughout Queens, are offered up to three hours each day, five days per week.'
        ],
        funding: 'Programs listed under COMPASS are completely city-funded and free of charge for all participants.',
        sites: [
            'ps-60-woodhaven',
            'ps-81-jean-paul-richter',
            'ps-88-seneca-school',
            'ps-91-richard-arkwright',
            'is-93-ridgewood',
            'ps-128-juniper-valley',
            'ps-153-maspeth-elementary',
            'ps-159-isaac-pitkin',
            'owh-204-beacon',
            'ps-254-rosa-parks-school',
            'ps-306-academy-for-discovery'
        ],
        photo: PHOTOS.craftBoy
    },
    {
        id: 'ms',
        name: 'Free middle school, grades 6–8',
        short: 'Middle school, 6–8',
        path: '/programs/middle-school-6-8',
        who: '6th to 8th grade',
        cost: 'Free',
        summary: 'SONYC clubs at 11 middle schools: sports, arts, gaming and service, up to three hours a day.',
        body: [
            'COMPASS NYC’s middle school model, renamed SONYC (School’s Out New York City), serves as a pathway to success for youth in 6th, 7th and 8th grades. Structured like clubs, the model offers young people a choice in how they spend their time, provides rigorous instruction in sports and arts, and requires youth leadership through service.',
            'We have more than a dozen programs throughout Queens that are offered up to three hours each day, five days per week.'
        ],
        funding: 'SONYC programs are city-funded by the NYC Department of Youth and Community Development and are free to all participants.',
        sites: [
            'is-25-world-journalism-prep',
            'is-77-joseph-f-quinn',
            'is-87-middle-village-sonyc',
            'is-93-ridgewood',
            'is-113-anthony-j-pranzo',
            'ms-138-sunrise-school-sonyc',
            'ms-164-queens-valley-sonyc',
            'owh-204-beacon',
            'ms-297-hawtree-creek',
            'st-adalbert-school',
            'is-128-juniper-valley-sonyc'
        ],
        photo: PHOTOS.hawtreeGaming
    },
    {
        id: 'fee',
        name: 'Fee-based after school, grades K–5',
        short: 'Fee-based, K–5',
        path: '/programs/fee-based-k-5',
        who: 'Kindergarten to 5th grade',
        cost: 'Low fee',
        summary: 'Subsidized, low-fee after school at P.S. 68, P.S. 87, P.S. 164 and P.S. 305.',
        body: [
            'The GRYC elementary model caters to the “whole child” in kindergarten through 5th grade. Beyond STEM learning, it strives to integrate literacy into all instruction and offers homework help, basic arts instruction and physical activity, including nutritional programming to promote healthy living.',
            'Our programs, located throughout Queens, are offered up to three hours each day, five days per week.'
        ],
        funding: 'Programs listed under GRYC are subsidized and offered for a low fee.',
        sites: ['ps-68-cambridge', 'ps-87-middle-village-school', 'ps-164-queens-valley', 'ps-305-learners-and-leaders'],
        photo: PHOTOS.feeCrafts
    },
    {
        id: 'beacon',
        name: 'Beacon community centers',
        short: 'Beacon centers',
        path: '/programs#beacon',
        who: 'Age 6 to adult',
        cost: 'Free',
        summary: 'School-based community centers at I.S. 93 and OWH 204, open afternoons, evenings, weekends and summer.',
        body: [
            'The Beacon Programs at I.S. 93 and I.S. 204 are school-based community centers serving children 6 years of age and older, including high school students and adults. Funded by NYC DYCD, they are offered free of charge to all participants.',
            'The program operates in the afternoons, evenings and weekends, as well as during school holidays and vacation periods, including summer. Our mission is to provide opportunities to enhance and acquire new skills, promote social interaction and physical activity, and give back to the community.'
        ],
        sites: ['is-93-ridgewood', 'owh-204-beacon'],
        photo: PHOTOS.seniorKnights
    },
    {
        id: 'syep',
        name: 'Summer Youth Employment Program (SYEP)',
        short: 'Summer jobs (SYEP)',
        path: '/programs/summer-youth-employment',
        who: 'Ages 14 to 24',
        cost: 'Paid',
        summary: 'Six weeks of paid summer work and service learning in July and August.',
        body: [
            'The Summer Youth Employment Program provides young people with paid summer employment and service learning opportunities for six weeks in July and August.',
            'During the application phase, youth can apply online or submit their application to the GRYC. To take part, youth must be selected by DYCD’s lottery, provide copies of all required documents at enrollment and attend the mandatory SYEP orientation.'
        ],
        photo: PHOTOS.syepStreet
    }
];

export function getProgram(id: ProgramId): Program {
    const program = PROGRAMS.find((p) => p.id === id);
    if (!program) throw new Error(`unknown program ${id}`);
    return program;
}

/** the two Little Stars centers. They aren't school sites, so they live here, not in locations.ts */
export const PREK_CENTERS = [
    {
        key: 'little-stars-summerfield',
        name: 'Little Stars at GRYC Headquarters',
        street: '59-03 Summerfield Street',
        address: '59-03 Summerfield Street, Ridgewood, NY 11385',
        classes: 'Three full-day classes'
    },
    {
        key: 'little-stars-fairview',
        name: 'Little Stars at Fairview',
        street: '776 Fairview Avenue',
        address: '776 Fairview Avenue, Ridgewood, NY 11385',
        classes: 'Three full-day classes'
    }
] as const;
