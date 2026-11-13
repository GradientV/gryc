import 'server-only';
import { connection } from 'next/server';
import { connectDb } from './db';
import { MonitorModel } from './models';
import { seedDatabase } from './seed';

/* The database, connected and holding data. On the very first run against an
   empty database the demo data loads itself, so `npm run dev` shows a full
   portal straight away. Set DEMO_AUTOSEED=false to turn that off. */

const g = globalThis as unknown as { __grycReady?: Promise<void> };

export async function db(): Promise<void> {
  /* Database reads always happen at request time, never while Next.js
     prerenders a page shell (the driver reads the clock, which prerendering
     forbids). */
  await connection();
  g.__grycReady ??= (async () => {
    await connectDb();
    if (process.env.DEMO_AUTOSEED?.trim().toLowerCase() === 'false') return;
    if ((await MonitorModel.estimatedDocumentCount()) === 0) {
      console.log('[gryc] The database is empty. Loading the demo data.');
      await seedDatabase();
    }
  })().catch((err: unknown) => {
    g.__grycReady = undefined;
    throw err;
  });
  return g.__grycReady;
}
