# GRYC SYEP Portal

Site monitoring for the Greater Ridgewood Youth Council's Summer Youth Employment Program. It replaces the site
monitor's paper packet: checking in at worksites, collecting timesheets, the weekly Worksite Assessment Report,
participant paperwork, the childcare questionnaire and the mileage form. Works on a phone at the worksite and on a
laptop afterward.

This is a demo with sample data. There are no accounts yet; see [docs/next-phase.md](docs/next-phase.md).

## Run it

You need Node.js 20.9 or newer and a MongoDB database: either MongoDB running on your computer or a MongoDB Atlas
cluster.

```bash
npm install
npm run dev
```

Open http://localhost:5179. The first time the app finds an empty database it loads the demo data on its own.

- **MongoDB on this computer** works with no setup: in development the app connects to `mongodb://127.0.0.1:27017`
  when `MONGODB_URI` is not set. On Windows, MongoDB runs as the "MongoDB" service.
- **MongoDB Atlas**: follow [docs/atlas-setup.md](docs/atlas-setup.md), then put the connection string in
  `.env.local` (copy `.env.example`).

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 5179 |
| `npm run build` then `npm start` | Production build and server |
| `npm run seed` | Wipes the database and reloads the demo data (the footer's "Reset demo data" does the same) |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript checks |

### Settings (`.env.local`)

| Variable | Default | Meaning |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` in development; required in production | Where the database is |
| `MONGODB_DB` | `gryc-portal` | Database name inside the cluster |
| `DEMO_TODAY` | `2026-08-05` | The date the app treats as today. The 2026 program ended in August, so the demo opens mid-week 5. `real` uses today's date in New York |
| `DEMO_AUTOSEED` | `true` | Load demo data into an empty database. Set to `false` before real data goes in |

## How it is built

- **Next.js 16** (App Router) with Cache Components, **React 19**, **TypeScript**, **Tailwind CSS 4**. Frontend and
  backend live in this one project.
- **MongoDB through Mongoose 9.** Every model is defined in code in [src/server/models.ts](src/server/models.ts); Atlas
  needs no schema setup. Indexes are created by `npm run seed`.
- **Database access only on the server.** Everything under `src/server/` imports `server-only`, so it can never end up
  in the browser. Reads live in [src/server/data.ts](src/server/data.ts); every change is a Server Action in
  [src/server/actions/](src/server/actions) that validates its input with Zod
  ([src/server/schemas.ts](src/server/schemas.ts)) and checks that the record belongs to the current monitor.
- **Credentials only in environment variables** (`.env.local`, or the host's settings). Nothing secret is in the code.
- **Who is signed in** is decided in one place, [src/server/session.ts](src/server/session.ts). In the demo it is the
  seeded site monitor. Real sign-in and admin roles slot in there; the plan is in
  [docs/next-phase.md](docs/next-phase.md).
- **The paperwork rules** (what each participant owes, what counts as a finding, what an assessment needs before it can
  be filed, which answers carry from week to week, and when work counts as late) are plain functions in
  [src/lib/rules.ts](src/lib/rules.ts), used by both the server and the forms. A week's visit, timesheets and
  assessment are due by its Friday: before then they show as plain "still to do", on the Friday as due today, after
  it as overdue.

```
src/
  app/                    pages (each one streams its data inside a loading state)
    page.tsx              Sites: the week at every worksite (?week=3 looks back), notes and reminders
    week/                 This week: everything still open, the week-by-site grid, mileage recap
    mileage/              The mileage form
    sites/new/            Register a worksite
    sites/[siteId]/(tabs) Overview, Weekly, Participants, Monitoring log, Worksite application
    sites/[siteId]/(forms) The assessment, the printable packet, the childcare questionnaire
  components/             interface pieces (forms, dialogs, signature pad, the packet layout)
  lib/                    program calendar, form wording, paperwork rules, shared types
  server/                 database connection, models, reads, actions, demo seed
scripts/seed.ts           npm run seed
docs/                     Atlas setup and the next-phase plan
```

## What maps to which piece of paper

| Paper | In the portal |
| --- | --- |
| Worksite Application | The worksite record. General information, supervisors, schedule, duties, Attachment 1 for childcare sites and the certifications. It fills in the weekly assessment |
| Site Assignment Roster (YEPS export) | The Participants tab. Rows can be pasted straight from YEPS. Referral sheets and the week 3 and week 6 evaluations stay on paper, so they are tick boxes |
| Monitoring Log | Check in and Check out at the top of every worksite, plus the Monitoring log tab. Times are quarter hours, the way the log is filled in |
| Weekly timesheets | The Weekly tab: one tick per participant, so the count is always the sheets in hand. The first tick stamps the pickup date (click it to change it), and a note under the list covers missing or unsigned sheets |
| Worksite Assessment Report | A form in eight sections with a section list that shows what is done and what is missing. Drafts save as you move between sections. Findings are worked out from the answers, and the summary has to address them before the packet can be filed. The filed packet prints page by page like the paper |
| Childcare Site Questions | A questionnaire per participant at childcare sites. Each one starts from the last one completed at the site, and submitting it ticks the roster |
| Mileage Form SYEP 2026 | The Mileage page. A new trip starts where the last one ended, and the total comes from the odometer readings |

Answers that do not change week to week (supervisor, facility, recordkeeping, schedule and so on) can be saved once
with **Reuse answers**; every week not started yet opens with them filled in.

## Demo data

- The seven worksites and their applications are the real businesses' public details.
- **Every person is made up**: participant and supervisor names, phone numbers (the 555-0100 to 555-0199 range set
  aside for fiction), example.org emails, application IDs and birthdays. Only the shape of each roster follows the real
  one. Do not put real participant data in the seed.
- Weeks 1 to 4 are filed, week 5 is under way, and one site has handed in all but one timesheet.

## Known gaps

- **GRYC @ PS 106** answers "ChildCare: No" on its application, but it is a Summer Rising camp where every job is
  childcare, so it is treated as a childcare site. It filed no Attachment 1.
- **Glendale Bakery's** application lists 65-50 Grand Ave; the real address, 69-25 Grand Ave, is used and noted on the
  site.
- **Assessment page 4**: the photographed packet has pages 1, 2, 3, 5 and 6, so the printout has no page 4.
- **Signatures** are stored as small images inside the assessment record. Fine for a demo; a production version should
  keep them in file storage.

Compared with the old HTML demo (kept locally in `../context/gryc-website`, not in the repo): the W-9 and I-9 forms are gone, as is the sign-in screen (the demo
has no accounts) and the build number.
