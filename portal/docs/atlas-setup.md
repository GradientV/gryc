# Setting up MongoDB Atlas

The portal stores everything in MongoDB. Locally it uses the MongoDB on your computer; for a hosted demo (or anyone
running it without MongoDB installed) it needs an Atlas cluster. Atlas needs no schema: the app creates its
collections and indexes from [src/server/models.ts](../src/server/models.ts).

This takes about ten minutes.

## 1. Create the project and cluster

1. Sign in at [cloud.mongodb.com](https://cloud.mongodb.com) and create an organization if asked.
2. **New Project**, named something like `GRYC SYEP Portal`.
3. **Create a cluster**:
   - **Free (M0)** is enough for the demo. It has no backups, so use a paid tier (M10 or higher) before real
     participant data goes in.
   - Provider **AWS**, region **N. Virginia (us-east-1)**: closest to New York and to Vercel's default region.
   - Name it `gryc-portal`.

## 2. Create the database user

**Security > Database Access > Add New Database User**

- Authentication: **Password**. Generate a strong one and keep it in a password manager.
- Username: `gryc-portal-app`.
- Privileges: **Specific Privileges > readWrite** on the database `gryc-portal`. The app needs nothing more (it does
  not need Atlas admin).

## 3. Allow connections

**Security > Network Access > Add IP Address**

- For your own computer: **Add Current IP Address**.
- For a site hosted on Vercel: Vercel's servers do not have fixed addresses, so either allow `0.0.0.0/0` (any address;
  the strong password is then the only lock, which is acceptable for demo data only) or connect the project through
  Vercel's MongoDB Atlas integration. Revisit this before real data goes in.

## 4. Get the connection string

**Database > Connect > Drivers**, Node.js. Copy the string. It looks like:

```
mongodb+srv://gryc-portal-app:<db_password>@gryc-portal.abc123.mongodb.net/?retryWrites=true&w=majority&appName=gryc-portal
```

Replace `<db_password>` with the user's password. If the password contains `@ : / ? # [ ] %`, URL-encode those
characters (for example `@` becomes `%40`).

## 5. Point the app at it

Copy `.env.example` to `.env.local` and set:

```bash
MONGODB_URI=mongodb+srv://gryc-portal-app:...@gryc-portal.abc123.mongodb.net/?retryWrites=true&w=majority&appName=gryc-portal
MONGODB_DB=gryc-portal
```

`.env.local` is never committed. The connection string is a password: do not paste it into code, chat or a ticket.

## 6. Load the demo data

```bash
npm run seed
```

This wipes the `gryc-portal` database, creates the indexes and loads the seven worksites. (Starting the app against an
empty database also loads it, unless `DEMO_AUTOSEED=false`.)

Check it in Atlas under **Database > Browse Collections > gryc-portal**. You should see `monitors`, `sites`,
`participants`, `visits`, `timesheets`, `assessments`, `trips`, `locations` and `notes`.

## 7. Hosting on Vercel (optional)

1. Import the GitHub repository in Vercel and set the **Root Directory** to `portal`.
2. **Settings > Environment Variables**: add `MONGODB_URI` and `MONGODB_DB` (and `DEMO_TODAY` if you want a different
   demo date).
3. Deploy. The functions region should stay **Washington, D.C. (iad1)**, next to the cluster.

## Before real participant data goes in

The demo data is made up. Real rosters carry minors' names, phone numbers, birthdays and IDs, so before switching:

- Add sign-in and roles ([docs/next-phase.md](next-phase.md)).
- Move to a paid cluster with continuous backups, and keep separate databases for the demo and for real use.
- Tighten network access (no `0.0.0.0/0`), and turn on Atlas alerts.
- Set `DEMO_AUTOSEED=false` everywhere real data lives, and never run `npm run seed` against it: it wipes the database.
- Agree with GRYC (and DYCD) how long records are kept and who may see them.
