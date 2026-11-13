// facts about the GRYC and every outside link the old site had, in one place.
// Sources: greaterridgewoodyouthcouncil.org (Wix), pulled Nov 8, 2026. See RESEARCH.md.

/** where this site will live */
export const SITE_URL = 'https://www.greaterridgewoodyouthcouncil.org';

/**
 * the current Wix site. News posts and the PDFs haven't moved yet,
 * so those links still point there.
 */
export const WIX_URL = 'https://www.greaterridgewoodyouthcouncil.org';

/**
 * Staff login sends people here: the SYEP portal (gryc/portal).
 * Set VITE_PORTAL_URL in .env.local; locally it's the portal's dev server.
 * Empty on a deployed site until the portal itself is live: the login page then
 * says the portal isn't open yet instead of sending staff to localhost.
 */
export const PORTAL_URL: string = import.meta.env.VITE_PORTAL_URL || (import.meta.env.DEV ? 'http://localhost:5179' : '');

/** the year in the footer. A constant so the prerendered HTML and the browser agree */
export const COPYRIGHT_YEAR = 2026;

const hqStreet = '59-03 Summerfield Street';

export const site = {
    name: 'The Greater Ridgewood Youth Council, Inc.',
    shortName: 'GRYC',
    tagline: 'Serving youth and families since 1980',
    founded: 1980,
    youthServedDaily: '3,200',

    hq: {
        label: 'GRYC Headquarters',
        street: hqStreet,
        city: 'Ridgewood',
        state: 'NY',
        zip: '11385',
        directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${hqStreet}, Ridgewood, NY 11385`)}`
    },
    officeHours: '8 AM to 6 PM, Monday to Friday',
    phone: { display: '(718) 456-KIDS (5437)', short: '(718) 456-5437', tel: '+17184565437' },
    fax: '(718) 366-3053',
    accessibility: { name: 'Janine Mahon', mailto: 'mailto:jmahon@thegryc.org?subject=Accessibility' },

    links: {
        youtube: 'https://www.youtube.com/channel/UColStRF9befBQPibWj3ppzA',
        instagram: 'https://www.instagram.com/thegryc/?hl=en',
        staffGmail: 'http://mail.google.com/a/thegryc.org',
        laborPosters: `${WIX_URL}/_files/ugd/cbe18b_68dd98a339404571b65688f098e6e941.pdf`,
        /** AmazonSmile closed in February 2023; kept because the old site links it. See RESEARCH.md */
        amazonSmile: 'https://smile.amazon.com/gp/chpf/homepage?q=gryc&orig=%2F&ie=UTF-8',
        paypal: 'https://www.paypal.com/donate/?hosted_button_id=Z45SDUS7WBJX6',
        jobApplication: 'https://docs.google.com/forms/d/e/1FAIpQLSec14KrVb-1NvJxEt8TGmocamBtXEK5jbNOhAHzpjfJU3mWXg/viewform',
        procare: 'https://www.myprocare.com/',
        paymentInstructions: `${WIX_URL}/_files/ugd/5c6d8c_83aa81a128634eb4b9df8f06523ea5b4.pdf`,
        dycdConnect: 'https://discoverdycd.dycdconnect.nyc/home',
        syepApplication: 'https://application.nycsyep.com/',
        myschools: 'https://www.myschools.nyc/'
    }
} as const;

/** the for-fee programs' payment forms (Google Forms), from the Payments page */
export const PAYMENT_FORMS = [
    { school: 'P.S. 68', href: 'https://forms.gle/7KtAJDRgLUbt4xbs9' },
    { school: 'P.S. 87', href: 'https://forms.gle/uXFp4VLisE7rmSy66' },
    { school: 'P.S. 91', href: 'https://forms.gle/R7tiWJ9rWKSptysZ6' },
    { school: 'P.S. 102', href: 'https://forms.gle/AdmtbZ86PXKfxeea6' },
    { school: 'P.S. 164', href: 'https://forms.gle/PG1hnk1uZoScPnFQ7' },
    { school: 'P.S. 305', href: 'https://forms.gle/ZetLCn9qmTfNLLsd6' },
    { school: 'P.S. 239', href: 'https://forms.gle/ZP5fZZCRijCWYf8m7' }
] as const;

export type NavItem = { to: string; label: string };

/** the Programs menu in the header, in the old site's order plus SYEP and sign-up */
export const PROGRAM_NAV: NavItem[] = [
    { to: '/programs', label: 'All programs' },
    { to: '/programs/pre-k', label: 'Little Stars 3-K & Pre-K' },
    { to: '/programs/after-school-k-5', label: 'Free after school, K–5' },
    { to: '/programs/fee-based-k-5', label: 'Fee-based after school, K–5' },
    { to: '/programs/middle-school-6-8', label: 'Free middle school, 6–8' },
    { to: '/programs/summer-youth-employment', label: 'Summer Youth Employment' },
    { to: '/programs/sign-up', label: 'How to sign up' }
];

export const MAIN_NAV: NavItem[] = [
    { to: '/locations', label: 'Locations' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/payments', label: 'Payments' },
    { to: '/about', label: 'Who we are' },
    { to: '/news', label: 'News' }
];
