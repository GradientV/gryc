// the board, the executive staff and the staff directory, from the old Who We Are
// and Contact pages. `mailto` is the exact link the old directory used; where it had
// none, the address comes from that site's own location page (marked "from location page").
// Blank directory lines (vacant roles) are left out.

export type Person = { role: string; name: string; mailto?: string };
export type StaffGroup = { title: string; people: Person[] };

const ask = (address: string, subject = 'Request%20for%20information') => `mailto:${address}?subject=${subject}`;

export const BOARD: string[] = [
    'Henrietta Maier, Chairperson',
    'Fred JR Velepec, Jr.',
    'Henry (Hank) Kraker',
    'Dominick Mulero',
    'John Hennessey',
    'Lois Engel',
    'Teresa Stroble',
    'Vineeta Hardt',
    'Karamjit Dhaliwal'
];

export const EXECUTIVE: Person[] = [
    { role: 'President', name: 'Bob Monahan' },
    { role: 'Chief Executive Officer of Finance, Budgeting & Audits', name: 'Michelle Koch' },
    { role: 'Chief Executive Officer of Education and Program', name: 'Janine Mahon' },
    { role: 'Director of Program Operations', name: 'Xiomara Pina' },
    { role: 'Director of Program Operations', name: 'Walter Welsh' },
    { role: 'Director of Support Services', name: 'Mary Benitez' }
];

export const DIRECTORY: StaffGroup[] = [
    {
        title: 'Senior administration',
        people: [
            { role: 'President', name: 'Bob Monahan', mailto: ask('bmonahan@thegryc.org') },
            { role: 'Chief Executive Officer of Finance, Budgeting and Audits', name: 'Michelle Koch', mailto: ask('mkoch@thegryc.org') },
            { role: 'Chief Executive Officer of Education and Programs', name: 'Janine Mahon', mailto: ask('jmahon@thegryc.org') },
            { role: 'Director of Program Operations', name: 'Xiomara Pina', mailto: ask('xpina@thegryc.org') },
            { role: 'Director of Program Operations', name: 'Walter Welsh', mailto: ask('wwelsh@thegryc.org') },
            { role: 'Director of Support Services', name: 'Mary Benitez', mailto: ask('mbenitez@thegryc.org') }
        ]
    },
    {
        title: 'Managers',
        people: [
            { role: 'Accounts Payable Manager', name: 'Liz Fitzgerald', mailto: ask('lfitzgerald@thegryc.org') },
            { role: 'Accounts Receivable Manager', name: 'JoAnn Siegel', mailto: ask('jsiegel@thegryc.org') },
            { role: 'Benefits and Payroll Manager', name: 'Gloria Chabrier', mailto: ask('gchabrier@thegryc.org') },
            { role: 'Content Specialist Coordinator', name: 'Danielle Kleiman', mailto: ask('dkleiman@thegryc.org') },
            { role: 'Facilities Manager', name: 'Carlos Rodriguez', mailto: ask('crodriguez@thegryc.org') },
            { role: 'Information Technology Manager', name: 'Shiv Ramsamooj', mailto: ask('sramsamooj@thegryc.org', 'Request%20for%20Information') },
            { role: 'Office & Human Resources Manager', name: 'Gino Ancona', mailto: ask('gancona@thegryc.org') },
            { role: 'Program Coordinator', name: 'Kevin Goodish' }
        ]
    },
    {
        title: 'Site directors',
        people: [
            { role: 'I.S. 25 / WJPS', name: 'Dina DePaola', mailto: ask('adepaola@thegryc.org') },
            { role: 'P.S. 60 COMPASS', name: 'Justin Huayamave', mailto: 'mailto:jhuayamave@thegryc.org' }, // from location page
            { role: 'P.S. 68 For-fee', name: 'Taylor Bryan', mailto: 'mailto:tbryan@thegryc.org' }, // from location page
            { role: 'I.S. 77 SONYC', name: 'Cynthia Rivera', mailto: ask('crivera@thegryc.org') },
            { role: 'P.S. 81 COMPASS', name: 'Jariza Barkhouse', mailto: 'mailto:jbarkhouse@thegryc.org' }, // from location page
            { role: 'I.S. 87 SONYC', name: 'Iralda Frias', mailto: ask('ifrias@thegryc.org') },
            { role: 'P.S. 87 For-fee', name: 'Kirsten Pollina', mailto: 'mailto:kpollina@thegryc.org' }, // from location page
            { role: 'P.S. 88 COMPASS', name: 'Alyssa Rivera', mailto: ask('Arivera@thegryc.org') },
            { role: 'P.S. 91 COMPASS', name: 'Karessa Abe', mailto: 'mailto:kabe@thegryc.org' }, // from location page
            { role: 'I.S. 93 Beacon', name: 'Sabrina Sierra', mailto: ask('ssierra@thegryc.org') },
            { role: 'I.S. 93 21CCLC', name: 'Leah Salas', mailto: 'mailto:lsalas@thegryc.org' },
            { role: 'I.S. 113 SONYC', name: 'Jaycob Mendez', mailto: ask('jmendez@thegryc.org', 'Request%20for%20Info.') },
            { role: 'P.S. 128 COMPASS', name: 'Kaylie Lavoun', mailto: ask('klavoun@thegryc.org') },
            { role: 'I.S. 128 SONYC', name: 'Alexa Naparstek', mailto: ask('anaparstek@thegryc.org', 'Request%20for%20Info.') },
            { role: 'M.S. 138 SONYC', name: 'Toni Corchado', mailto: 'mailto:tcorchado@thegryc.org' }, // from location page
            { role: 'P.S. 153 COMPASS', name: 'Andrew Rengel', mailto: 'mailto:arengel@thegryc.org' }, // from location page
            { role: 'P.S. 159 COMPASS', name: 'Jahmel Roache', mailto: 'mailto:jroache@thegryc.org' }, // from location page
            { role: 'I.S. 164 SONYC', name: 'Almin Lukovic', mailto: ask('alukovic@thegryc.org') },
            { role: 'I.S. 164 For-fee', name: 'Naomi Baez', mailto: ask('naomibaez@thegryc.org', 'Request%20for%20Info.') },
            { role: 'I.S. 204 Beacon', name: 'Tiffany Moore', mailto: 'mailto:tmoore@thegryc.org' }, // from location page
            { role: 'I.S. 204 21CCLC', name: 'Denise Torres', mailto: ask('denisetorres@thegryc.org') },
            { role: 'P.S. 254 COMPASS', name: 'Vince Allen Aquino', mailto: ask('vaquino@thegryc.org') },
            { role: 'P.S. 305', name: 'Sanchez Fernande', mailto: 'mailto:sfernandes@thegryc.org' }, // from location page
            { role: 'P.S. 306 COMPASS', name: 'Genesis Williams', mailto: ask('gwilliams@thegryc.org') },
            { role: 'Hawtree Creek Middle School', name: 'Maricelis Romero', mailto: ask('mromero@thegryc.org') },
            { role: 'Saint Adalbert Catholic Academy', name: 'Cynthia Diaz', mailto: 'mailto:cdiaz@thegryc.org' } // from location page
        ]
    },
    {
        title: 'Youth employment and content',
        people: [
            { role: 'Director of Youth Employment', name: 'Tracy Rodriguez', mailto: 'mailto:tracyrodriguez@thegryc.org' }, // from the SYEP page
            { role: 'Assistant of Youth Employment', name: 'Dareen Mohamed' },
            { role: 'Content Specialist', name: 'Francesca Fedkowskyj', mailto: ask('francescafedkowskyj@thegryc.org', 'Request%20for%20information.') },
            { role: 'Content Specialist', name: 'Catherine Siegel', mailto: ask('csiegel@thegryc.org', 'Request%20for%20information.') },
            { role: 'Recreation Content Specialist', name: 'Paul Hoffmann' }
        ]
    },
    {
        title: 'Little Stars 3-K and Pre-K',
        people: [
            { role: 'Fairview 4-K Teacher', name: 'Erika Bernal', mailto: ask('ebernal@thegryc.org') },
            // the old directory links this name to Daniellesoto@thegryc.org; kept as found, see RESEARCH.md
            { role: 'Fairview 3-K Teacher', name: 'Kaitlyn Fitzgerald', mailto: ask('Daniellesoto@thegryc.org', 'Request%20for%20information.') },
            { role: 'Fairview 3-K Teacher', name: 'Michelle Lombardi', mailto: ask('michellelombardi@thegryc.org', 'Request%20for%20information.') },
            { role: 'Fairview 4-K Assistant Teacher', name: 'Aryssa Petersen' },
            { role: 'Fairview 3-K Assistant Teacher', name: 'Jed Santiago' },
            { role: 'Fairview 3-K Assistant Teacher', name: 'Laura Martino' },
            { role: 'Summerfield 4-K Teacher', name: 'Kimberly Benitez', mailto: ask('kbenitez@thegryc.org', 'Request%20for%20info') },
            { role: 'Summerfield 3-K Teacher', name: 'Carolina Vasquez', mailto: ask('cvasquez@thegryc.org', 'Request%20for%20Information.') },
            { role: 'Summerfield 3-K Assistant Teacher', name: 'Englantina Emini' },
            { role: 'Summerfield 4-K Assistant Teacher', name: 'Alysha Davila', mailto: 'mailto:Adavila@thegryc.org' },
            { role: 'Summerfield 4-K Assistant Teacher', name: 'Teresa Bellington' }
        ]
    },
    {
        title: 'Office and facilities',
        people: [
            { role: 'Administrative Assistant', name: 'Lynn Webster' },
            { role: 'Summerfield Custodian', name: 'Joseph Then' },
            { role: 'Fairview Custodian', name: 'Jimmy Canade' }
        ]
    }
];
