# Next phase: accounts, roles and a phone app

The demo has no sign-in: everyone is the seeded site monitor. This is the plan for when GRYC moves forward. The code
is already shaped for it: every page and every change asks [src/server/session.ts](../src/server/session.ts) who the
user is, and every query and action is scoped to that user's worksites.

## Accounts and roles

### Who signs in

| Role | Can do |
| --- | --- |
| `monitor` (site monitor) | See and work on only the worksites assigned to them: check-ins, timesheets, assessments, rosters, mileage, notes |
| `admin` (program office) | Everything a monitor can, for every worksite; assign worksites to monitors; load rosters; review and sign filed assessments ("Provider Supervisor Staff Use Only"); manage accounts |
| Worksite supervisor (later) | Sign an assessment or questionnaire on their own phone through a one-time link, without an account |

The `monitors` collection already has a `role` field (`monitor` or `admin`), and every worksite has a `monitorId`.

### How

1. **Sign-in** with [Auth.js](https://authjs.dev) (NextAuth v5) and its MongoDB adapter, so users and sessions live in
   the same Atlas database. If GRYC staff use Microsoft 365 or Google Workspace, sign in through that (single sign-on,
   no new passwords to manage); otherwise email sign-in links. Sessions are kept in a secure, httpOnly cookie.
2. **`session.ts` becomes real**: read the session, load the staff record with its role, and send anyone signed out to
   `/sign-in`. Pages and actions already go through it, so they need no changes to start using real users.
3. **Roles are checked on the server, never only in the interface.** A `requireRole('admin')` helper guards admin-only
   actions (assigning sites, editing any roster, managing accounts). Monitor queries keep their `monitorId` filter;
   admin queries drop it. Server Actions can be called directly with a POST request, so each one checks again; hiding a
   button is never the only guard.
4. **`proxy.ts`** (Next.js 16's name for middleware) redirects signed-out visitors to the sign-in page so they never
   see a flash of the app. It is a convenience, not the security boundary: the checks in `src/server` are.
5. **Audit trail**: an `events` collection recording who filed, edited or deleted what, and when.
6. **Admin screens**: all worksites across monitors, assigning sites, a roster upload (CSV from YEPS), and a review
   queue for filed assessments.

## A phone app

1. **Done in this version**: the web app works on phones, with a bottom tab bar, large tap targets and forms that
   stack.
2. **Installable web app (PWA)**: a web app manifest and icons, so monitors can add it to their home screen and open
   it full screen like an app. Small job.
3. **Offline at the worksite**: some sites have poor reception. Cache the pages a monitor needs for the day and queue
   check-ins, timesheet ticks and assessment drafts on the phone, sending them when the connection returns. Next.js
   has an experimental `useOffline` for exactly this.
4. **Native app** (React Native with Expo) only if GRYC needs app-store distribution or heavy camera use, such as
   photographing findings or paper evaluations. It would talk to a JSON API (`/api/v1/...` route handlers) built on the
   same models and on the paperwork rules in [src/lib/rules.ts](../src/lib/rules.ts), which are plain TypeScript and
   can be shared as is.

## Before real participant data goes in

- Accounts and roles, above.
- Atlas on a paid tier with backups, tighter network rules, and separate demo and live databases
  ([atlas-setup.md](atlas-setup.md)).
- Youth records: keep only what the program needs, encrypt the most sensitive fields (birthdays, phone numbers), set a
  retention period, and put a data agreement in place with GRYC.
- Signatures: store the images in file storage instead of inside the assessment record, and record who signed, when,
  and on which device.
- Import rosters from a YEPS CSV export instead of pasting rows.
- Export the packet as a PDF in DYCD's exact layout.
- Photos attached to findings.
