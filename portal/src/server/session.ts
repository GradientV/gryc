import 'server-only';
import { cache } from 'react';
import type { Monitor } from '@/lib/types';
import { MonitorModel } from './models';
import { db } from './ready';
import { DEMO_MONITOR_EMAIL } from './seed';
import { serialize } from './serialize';

/* Who is using the portal.

   The demo has no sign-in: everyone is the seeded site monitor. This is the
   one place that decides who the current user is, and every query and
   action goes through it, so adding real accounts later means changing this
   file (read the session cookie, look up the user and role) rather than
   every page. See docs/next-phase.md. */

export const getCurrentMonitor = cache(async (): Promise<Monitor> => {
  await db();
  const email = process.env.DEMO_MONITOR_EMAIL?.trim() || DEMO_MONITOR_EMAIL;
  const doc = await MonitorModel.findOne({ email }).lean();
  if (!doc) {
    throw new Error(`No staff account for ${email}. Run "npm run seed" to load the demo data.`);
  }
  return serialize<Monitor>(doc);
});
