// the old Wix addresses, so every link already out there (flyers, emails, Google)
// still lands on the right page. The same list is in vercel.json as real 301s.
// Old location addresses (/locations/p.s.-153-...) are handled by the location page itself.
export const ALIASES: Record<string, string> = {
    '/universal-prek-upk': '/programs/pre-k',
    '/pop-up-k-5-our-programs': '/programs/after-school-k-5',
    '/pop-up-6-8-our-programs': '/programs/middle-school-6-8',
    '/copy-of-pop-up-k-5-our-programs': '/programs/fee-based-k-5',
    '/youth-employment-program': '/programs/summer-youth-employment',
    '/projects-3': '/programs/sign-up',
    '/copy-of-youth-employment-volunteeri': '/jobs',
    '/job-applications': '/jobs/apply',
    '/blog': '/news',
    '/get-involved': '/donate'
};
