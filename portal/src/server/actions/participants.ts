'use server';

import { z } from 'zod';
import { fmtDate, fmtTime, pad } from '@/lib/format';
import { PROGRAM } from '@/lib/program';
import { childcareProblems } from '@/lib/rules';
import type { ChildcareForm } from '@/lib/types';
import { attempt, refreshAll, requireParticipant, requireSite, UserError } from '../access';
import { resolveToday } from '../clock';
import { ParticipantModel } from '../models';
import { ChildcareFormInput, ParticipantInput, RosterRowInput } from '../schemas';

export async function addParticipants(siteId: string, raw: unknown) {
  return attempt(async () => {
    const rows = z.array(RosterRowInput).min(1, 'Fill in at least one row').max(250).parse(raw);
    const { site } = await requireSite(siteId);
    const order = await ParticipantModel.countDocuments({ siteId: site._id });
    await ParticipantModel.insertMany(
      rows.map((r, i) => ({
        ...r,
        siteId: site._id,
        order: order + i,
        program: r.program || 'Lottery',
        cohort: PROGRAM.cohort,
        serviceOption: PROGRAM.serviceOption,
      })),
    );
    refreshAll();
    return { added: rows.length };
  });
}

export async function updateParticipant(participantId: string, raw: unknown) {
  return attempt(async () => {
    const input = ParticipantInput.parse(raw);
    const { participant } = await requireParticipant(participantId);
    await ParticipantModel.updateOne({ _id: participant._id }, { $set: input }, { runValidators: true });
    refreshAll();
  });
}

/** Paper documents only. The childcare questionnaire is ticked by filling it in. */
export async function setParticipantDoc(participantId: string, doc: string, value: boolean) {
  return attempt(async () => {
    const key = z.enum(['referral', 'week3', 'week6']).parse(doc);
    const { participant } = await requireParticipant(participantId);
    if (participant.status !== 'Active') throw new UserError('Only active participants owe paperwork.');
    await ParticipantModel.updateOne({ _id: participant._id }, { $set: { [`docs.${key}`]: value } });
    refreshAll();
  });
}

function nowInNewYork(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  return `${pad(h)}:${pad(m)}`;
}

/** Saves the questionnaire. With `complete`, it is checked, stamped and
    ticked off on the roster; anything missing keeps it as a draft and comes
    back as a list. Returns the next participant at the site still owing one,
    so a roster can be worked straight down. */
export async function saveChildcareForm(participantId: string, raw: unknown, complete: boolean) {
  return attempt(async () => {
    const form = ChildcareFormInput.parse(raw) as ChildcareForm;
    const { site, participant } = await requireParticipant(participantId);
    if (!site.childcare) throw new UserError('This worksite is not a childcare site.');

    if (!complete) {
      await ParticipantModel.updateOne(
        { _id: participant._id },
        { $set: { childcareForm: { ...form, completedAt: participant.childcareForm?.completedAt ?? '' } } },
      );
      refreshAll();
      return { nextId: null as string | null, problems: [] as string[] };
    }

    const problems = childcareProblems(form);
    if (problems.length) {
      await ParticipantModel.updateOne({ _id: participant._id }, { $set: { childcareForm: { ...form, completedAt: '' } } });
      refreshAll();
      return { nextId: null as string | null, problems };
    }

    const today = resolveToday();
    const stamped = { ...form, date: today, completedAt: `${fmtDate(today)} at ${fmtTime(nowInNewYork())}` };
    await ParticipantModel.updateOne(
      { _id: participant._id },
      { $set: { childcareForm: stamped, 'docs.childcare': true } },
    );

    const next = await ParticipantModel.findOne({
      siteId: site._id,
      _id: { $ne: participant._id },
      status: 'Active',
      'docs.childcare': false,
    })
      .sort({ order: 1 })
      .select('_id')
      .lean();
    refreshAll();
    return { nextId: next ? next._id.toHexString() : null, problems: [] as string[] };
  });
}

export async function unmarkChildcare(participantId: string) {
  return attempt(async () => {
    const { participant } = await requireParticipant(participantId);
    await ParticipantModel.updateOne({ _id: participant._id }, { $set: { 'docs.childcare': false } });
    refreshAll();
  });
}
