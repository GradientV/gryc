'use server';

import { isValidObjectId } from 'mongoose';
import { tripTotal } from '@/lib/rules';
import { attempt, refreshAll, UserError } from '../access';
import { LocationModel, TripModel } from '../models';
import { LocationsInput, TripInput } from '../schemas';
import { getCurrentMonitor } from '../session';

export async function saveTrip(raw: unknown) {
  return attempt(async () => {
    const { id, ...input } = TripInput.parse(raw);
    const me = await getCurrentMonitor();
    const tenth = (n: number | null) => (n === null ? null : Math.round(n * 10) / 10);
    const startMileage = tenth(input.startMileage);
    const endMileage = tenth(input.endMileage);
    const trip = { ...input, startMileage, endMileage, total: tenth(input.total) ?? tripTotal(startMileage, endMileage) };
    if (id) {
      if (!isValidObjectId(id)) throw new UserError('That trip was not found.');
      const res = await TripModel.updateOne({ _id: id, monitorId: me.id }, { $set: trip }, { runValidators: true });
      if (!res.matchedCount) throw new UserError('That trip was not found.');
    } else {
      await TripModel.create({ ...trip, monitorId: me.id });
    }
    refreshAll();
  });
}

export async function deleteTrip(id: string) {
  return attempt(async () => {
    if (!isValidObjectId(id)) throw new UserError('That trip was not found.');
    const me = await getCurrentMonitor();
    await TripModel.deleteOne({ _id: id, monitorId: me.id });
    refreshAll();
  });
}

/** Replaces the monitor's saved locations with the list as edited. */
export async function saveLocations(raw: unknown) {
  return attempt(async () => {
    const rows = LocationsInput.parse(raw).filter((r) => r.label || r.address);
    const me = await getCurrentMonitor();
    const existing = await LocationModel.find({ monitorId: me.id }).lean();
    const keep = new Set(rows.map((r) => r.id).filter(Boolean));
    await LocationModel.deleteMany({ monitorId: me.id, _id: { $nin: [...keep].filter((x) => isValidObjectId(x)) } });
    for (const r of rows) {
      const label = r.label || r.address;
      if (r.id && existing.some((e) => e._id.toHexString() === r.id)) {
        await LocationModel.updateOne({ _id: r.id, monitorId: me.id }, { $set: { label, address: r.address } });
      } else {
        await LocationModel.create({ monitorId: me.id, label, address: r.address, kind: 'other' });
      }
    }
    refreshAll();
  });
}
