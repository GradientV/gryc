/* npm run seed
   Wipes the database named in .env.local and loads the demo data: the seven
   worksites, weeks 1-4 filed, week 5 under way, mileage and reminders. Also
   creates the indexes declared in src/server/models.ts. */

import { loadEnvConfig } from '@next/env';
import { connectDb, databaseHost, disconnectDb } from '../src/server/db';
import { seedDatabase } from '../src/server/seed';

async function main() {
  loadEnvConfig(process.cwd());
  const where = `${databaseHost()} / ${process.env.MONGODB_DB?.trim() || 'gryc-portal'}`;
  console.log(`Loading the demo data into ${where} ...`);
  await connectDb();
  await seedDatabase();
  console.log('Done. Seven worksites, 81 participants, weeks 1-4 filed.');
}

main()
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => disconnectDb());
