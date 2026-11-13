'use server';

import { isValidObjectId } from 'mongoose';
import { fmtTime, minutes } from '@/lib/format';
import { attempt, refreshAll, requireSite, UserError } from '../access';
import { VisitModel } from '../models';
import { CheckInInput, CheckOutInput, ManualVisitInput } from '../schemas';
import { getCurrentMonitor } from '../session';

async function requireVisit(visitId: string) {
  if (!isValidObjectId(visitId)) throw new UserError('That log entry was not found.');
  await getCurrentMonitor(); // connects first
  const visit = await VisitModel.findById(visitId);
  if (!visit) throw new UserError('That log entry was not found.');
  await requireSite(visit.siteId.toHexString());
  return visit;
}

export async function checkIn(siteId: string, raw: unknown) {
  return attempt(async () => {
    const input = CheckInInput.parse(raw);
    const { me, site } = await requireSite(siteId);
    const open = await VisitModel.findOne({ siteId: site._id, date: input.date, timeOut: '' });
    if (open) throw new UserError(`You are already checked in here since ${fmtTime(open.timeIn)}.`);
    await VisitModel.create({
      siteId: site._id,
      monitorId: me.id,
      monitorName: me.name,
      date: input.date,
      timeIn: input.timeIn,
      reasons: input.reasons,
      otherText: input.reasons.includes('other') ? input.otherText : '',
    });
    refreshAll();
  });
}

export async function checkOut(visitId: string, raw: unknown) {
  return attempt(async () => {
    const input = CheckOutInput.parse(raw);
    const visit = await requireVisit(visitId);
    if (minutes(input.timeOut) <= minutes(visit.timeIn)) {
      throw new UserError(`Time out has to be after ${fmtTime(visit.timeIn)}.`);
    }
    await VisitModel.updateOne({ _id: visit._id }, { $set: { timeOut: input.timeOut, notes: input.notes } });
    refreshAll();
  });
}

export async function addVisit(siteId: string, raw: unknown) {
  return attempt(async () => {
    const input = ManualVisitInput.parse(raw);
    const { me, site } = await requireSite(siteId);
    if (minutes(input.timeOut) <= minutes(input.timeIn)) throw new UserError('Time out has to be after time in.');
    await VisitModel.create({
      siteId: site._id,
      monitorId: me.id,
      monitorName: me.name,
      date: input.date,
      timeIn: input.timeIn,
      timeOut: input.timeOut,
      reasons: input.reasons,
      otherText: input.reasons.includes('other') ? input.otherText : '',
      notes: input.notes,
    });
    refreshAll();
  });
}

export async function removeVisit(visitId: string) {
  return attempt(async () => {
    const visit = await requireVisit(visitId);
    await VisitModel.deleteOne({ _id: visit._id });
    refreshAll();
  });
}
