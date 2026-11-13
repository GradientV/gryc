'use server';

import { attempt, refreshAll } from '../access';
import { db } from '../ready';
import { seedDatabase } from '../seed';

/** Puts the demo back to its starting state. */
export async function resetDemoData() {
  return attempt(async () => {
    await db();
    await seedDatabase();
    refreshAll();
  });
}
