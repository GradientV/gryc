// every post on the old blog, newest first, with its publish date.
// The posts are mostly videos and still live on the Wix site, so each one links there.
import { WIX_URL } from './site';

export type Post = { title: string; date: string; place: string; slug: string; summary?: string };

export const POSTS: Post[] = [
    { date: '2026-07-30', place: 'GRYC', title: 'GRYC Showcase 2026!', slug: 'gryc-showcase-2026' },
    { date: '2026-06-10', place: 'GRYC', title: 'Highlights from our GRYC Basketball Championship 2026', slug: 'check-out-some-highlights-from-our-gryc-basketball-championship-2026' },
    { date: '2026-05-18', place: 'M.S. 297 Hawtree Creek', title: 'Check out our program at M.S. 297 HCMS!', slug: 'check-out-our-program-at-m-s-297-hcms' },
    {
        date: '2026-05-12',
        place: 'I.S. 93',
        title: 'SLP Conference 2026 @ I.S. 93!',
        slug: 'slp-conference-2026-i-s-93',
        summary: 'Highlights from our April conference showcasing the work we do at our Service Learning Programs.'
    },
    { date: '2026-03-12', place: 'P.S./I.S. 102', title: 'Check out our program at P.S./I.S. 102!', slug: 'check-out-our-program-at-p-s--i-s-102' },
    { date: '2026-03-05', place: 'I.S. 93', title: 'Check out our program at I.S. 93!', slug: 'check-out-our-program-at-i-s-93-1' },
    { date: '2026-03-02', place: 'P.S. 153', title: 'Check out our program at P.S. 153!', slug: 'check-out-our-program-at-p-s-153-1' },
    { date: '2026-03-02', place: 'OWH 204', title: 'Check out our program at OWH 204!', slug: 'check-out-our-program-at-owh-204' },
    { date: '2026-02-27', place: 'P.S. 81', title: 'Check out our program at P.S. 81!', slug: 'check-out-our-program-at-p-s-81' },
    { date: '2025-08-12', place: 'GRYC', title: 'GRYC Day!', slug: 'gryc-day' },
    {
        date: '2025-06-26',
        place: 'GRYC',
        title: 'GRYC Showcase 2025!',
        slug: 'gryc-showcase-2025',
        summary: 'Our organization-wide showcase, where participants from every site show their work.'
    },
    { date: '2025-05-12', place: 'I.S. 77', title: 'I.S. 77 visits the animal shelter!', slug: 'i-s-77-visits-the-animal-shelter' },
    { date: '2025-05-12', place: 'I.S. 77', title: 'I.S. 77 book signing event!', slug: 'i-s-77-book-signing-event' },
    {
        date: '2025-04-03',
        place: 'P.S./I.S. 128',
        title: 'PS/IS 128 contributes to their community for Women’s History Month!',
        slug: 'ps-is-128-contributes-to-their-community-for-women-s-history-month'
    },
    { date: '2025-04-03', place: 'I.S. 25', title: 'Check out our program at I.S. 25!', slug: 'check-out-our-program-at-i-s-25' },
    { date: '2025-03-31', place: 'I.S. 77', title: 'Check out some of our activities at I.S. 77!', slug: 'check-out-some-of-our-activities-at-i-s-77' },
    { date: '2025-03-25', place: 'GRYC', title: 'GRYC Basketball Extravaganza 2025', slug: 'gryc-basketball-extravaganza-2025' },
    { date: '2025-03-24', place: 'York Early College Academy', title: 'Check out our program at YECA!', slug: 'check-out-our-program-at-yeca' },
    { date: '2025-03-24', place: 'I.S. 93', title: 'Check out our program at I.S. 93!', slug: 'check-out-our-program-at-i-s-93' },
    { date: '2025-03-24', place: 'I.S. 113', title: 'Check out our program at I.S. 113!', slug: 'check-out-our-program-at-i-s-113' },
    { date: '2025-02-04', place: 'M.S. 297 Hawtree Creek', title: 'Check out our program at M.S. 297!', slug: 'check-out-our-program-at-m-s-297' },
    { date: '2025-01-29', place: 'GRYC', title: 'GRYC 2024 Middle School Flag Football Championship!', slug: 'gryc-2024-middle-school-flag-football-championship' },
    { date: '2025-01-21', place: 'OWH 204', title: 'P.S. 204 hosts annual Beacon Community Dinner!', slug: 'p-s-204-hosts-annual-beacon-community-dinner' },
    { date: '2025-01-21', place: 'P.S. 153', title: 'Check out our program at P.S. 153!', slug: 'check-out-our-program-at-p-s-153' },
    { date: '2025-01-09', place: 'P.S. 102', title: 'P.S. 102 afterschool offerings', slug: 'p-s-102-afterschool-offerings' },
    { date: '2025-01-09', place: 'P.S. 88', title: 'Check out afterschool at P.S. 88!', slug: 'check-out-afterschool-at-p-s-88' },
    { date: '2025-01-02', place: 'GRYC', title: 'GRYC 2024 Elementary Football Tournament!', slug: 'gryc-2024-football-tournament' }
];

export const postUrl = (post: Post) => `${WIX_URL}/post/${post.slug}`;
