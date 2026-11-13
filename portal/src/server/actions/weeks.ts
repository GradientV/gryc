'use server';

import { isValidObjectId } from 'mongoose';
import { isWeekNumber } from '@/lib/program';
import { allProblems, pickCarry } from '@/lib/rules';
import type { AssessmentForm, AssessmentStatus } from '@/lib/types';
import { attempt, refreshAll, requireSite, UserError } from '../access';
import { resolveToday } from '../clock';
import { AssessmentModel, ParticipantModel, SiteModel, TimesheetModel } from '../models';
import { AssessmentFormInput, PickupInput } from '../schemas';

function checkWeek(week: number) {
  if (!isWeekNumber(week)) throw new UserError('That program week does not exist.');
}

/* ---- timesheets ---- */

/** Ticks one participant's sheet in or out. The first tick of the week stamps
    the pickup date. */
export async function setTimesheet(siteId: string, week: number, participantId: string, received: boolean) {
  return attempt(async () => {
    checkWeek(week);
    const { site } = await requireSite(siteId);
    if (!isValidObjectId(participantId)) throw new UserError('That participant was not found.');
    const p = await ParticipantModel.exists({ _id: participantId, siteId: site._id, status: 'Active' });
    if (!p) throw new UserError('That participant is not active on this roster.');

    const ts = await TimesheetModel.findOneAndUpdate(
      { siteId: site._id, week },
      received ? { $addToSet: { collected: participantId } } : { $pull: { collected: participantId } },
      { upsert: true, new: true },
    );
    await stampPickup(ts);
    refreshAll();
  });
}

/** The first sheet in stamps today as the pickup date; unticking every sheet
    clears it again, so a date never shows with nothing collected. */
async function stampPickup(ts: { _id: unknown; collected: string[]; collectedOn: string }) {
  if (ts.collected.length && !ts.collectedOn) {
    await TimesheetModel.updateOne({ _id: ts._id }, { $set: { collectedOn: resolveToday() } });
  } else if (!ts.collected.length && ts.collectedOn) {
    await TimesheetModel.updateOne({ _id: ts._id }, { $set: { collectedOn: '' } });
  }
}

export async function setAllTimesheets(siteId: string, week: number, received: boolean) {
  return attempt(async () => {
    checkWeek(week);
    const { site } = await requireSite(siteId);
    const active = await ParticipantModel.find({ siteId: site._id, status: 'Active' }).select('_id').lean();
    const ts = await TimesheetModel.findOneAndUpdate(
      { siteId: site._id, week },
      { $set: { collected: received ? active.map((p) => p._id.toHexString()) : [] } },
      { upsert: true, new: true },
    );
    await stampPickup(ts);
    refreshAll();
    return { count: received ? active.length : 0 };
  });
}

export async function saveTimesheetPickup(siteId: string, week: number, raw: unknown) {
  return attempt(async () => {
    checkWeek(week);
    const input = PickupInput.partial().parse(raw);
    const { site } = await requireSite(siteId);
    const set: Record<string, string> = {};
    if (input.collectedOn) set.collectedOn = input.collectedOn;
    if (input.note !== undefined) set.note = input.note;
    await TimesheetModel.findOneAndUpdate({ siteId: site._id, week }, { $set: set }, { upsert: true });
    refreshAll();
  });
}

/* ---- the worksite assessment ---- */

/** Saves the packet as a draft, or files it. Filing re-checks every rule on
    the server; anything missing keeps it a draft and comes back as a list. */
export async function saveAssessment(siteId: string, week: number, raw: unknown, intent: 'draft' | 'submit') {
  return attempt(async () => {
    checkWeek(week);
    const form = AssessmentFormInput.parse(raw) as AssessmentForm;
    const { site } = await requireSite(siteId);
    form.worksiteType = site.worksiteType;

    const problems = intent === 'submit' ? allProblems(form, { childcare: site.childcare }) : [];
    const status: AssessmentStatus = intent === 'submit' && !problems.length ? 'submitted' : 'draft';
    await AssessmentModel.findOneAndUpdate(
      { siteId: site._id, week },
      { $set: { status, form, submittedAt: status === 'submitted' ? resolveToday() : '' } },
      { upsert: true, runValidators: true },
    );
    refreshAll();
    return { status, problems };
  });
}

/** "These answers are the same every week": saves the site-describing
    answers so every week not yet started opens with them filled in. */
export async function saveAssessmentDefaults(siteId: string, week: number, raw: unknown) {
  return attempt(async () => {
    checkWeek(week);
    const form = AssessmentFormInput.parse(raw) as AssessmentForm;
    const { site } = await requireSite(siteId);
    const defaults = pickCarry(form, week, resolveToday()) as Record<string, unknown>;
    if (!site.childcare) {
      for (const k of ['ccNotApplicable', 'ccDoc', 'ccDocExp', 'ccDuties', 'ccAgeYounger', 'ccAgeOlder', 'ccResponsibilities']) {
        delete defaults[k];
      }
    }
    await SiteModel.updateOne({ _id: site._id }, { $set: { assessmentDefaults: defaults } });
    refreshAll();
  });
}

export async function clearAssessmentDefaults(siteId: string) {
  return attempt(async () => {
    const { site } = await requireSite(siteId);
    await SiteModel.updateOne({ _id: site._id }, { $set: { assessmentDefaults: null } });
    refreshAll();
  });
}
