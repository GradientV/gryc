'use server';

import { isValidObjectId } from 'mongoose';
import { PROGRAM } from '@/lib/program';
import { attempt, refreshAll, requireSite, UserError } from '../access';
import { ParticipantModel, SiteModel } from '../models';
import { JobInput, RegisterSiteInput, SiteInfoInput, SupervisorInput } from '../schemas';
import { getCurrentMonitor } from '../session';

const HANDBOOK = 'Refer to the Worksite Handbook for all guidance and regulations.';

export async function registerSite(raw: unknown) {
  return attempt(async () => {
    const input = RegisterSiteInput.parse(raw);
    const me = await getCurrentMonitor();
    const order = await SiteModel.countDocuments({ monitorId: me.id });
    const requested = input.requested ?? input.roster.length;
    const supervisors = input.supervisor.name
      ? [
          {
            name: input.supervisor.name,
            title: input.supervisor.title,
            email: input.supervisor.email,
            phone: input.supervisor.phone,
            siteRep: true,
            keyMgmt: true,
            signAttendance: true,
          },
        ]
      : [];

    const site = await SiteModel.create({
      monitorId: me.id,
      order,
      name: input.name,
      dycdId: input.dycdId,
      worksiteType: input.worksiteType,
      address: input.address,
      room: input.room,
      borough: input.borough,
      zip: input.zip,
      crossStreets: input.crossStreets,
      travel: input.travel,
      doeBuilding: input.doeBuilding,
      sector: input.sector,
      industry: input.industry,
      implementation: input.implementation,
      childcare: input.childcare,
      supervisors,
      supervisingStaff: supervisors.length ? String(supervisors.length) : '',
      requested,
      ratioSup: supervisors.length ? String(supervisors.length) : '',
      ratioPart: String(requested),
      jobs:
        input.jobTitle || input.duties
          ? [
              {
                category: input.childcare ? 'Child Care' : 'Other',
                title: input.jobTitle,
                duties: input.duties,
                restrictions: HANDBOOK,
                assigned: requested,
              },
            ]
          : [],
      cc: input.childcare
        ? { startDate: PROGRAM.startDate, endDate: PROGRAM.endDate, licenseType: 'SACC License Number' }
        : null,
    });

    if (input.roster.length) {
      await ParticipantModel.insertMany(
        input.roster.map((r, i) => ({
          ...r,
          siteId: site._id,
          order: i,
          program: r.program || 'Lottery',
          cohort: PROGRAM.cohort,
          serviceOption: PROGRAM.serviceOption,
        })),
      );
    }
    refreshAll();
    return { id: site._id.toHexString() };
  });
}

export async function updateSiteInfo(siteId: string, raw: unknown) {
  return attempt(async () => {
    const input = SiteInfoInput.parse(raw);
    const { site } = await requireSite(siteId);
    await SiteModel.updateOne({ _id: site._id }, { $set: input }, { runValidators: true });
    refreshAll();
  });
}

export async function saveSiteJob(siteId: string, raw: unknown) {
  return attempt(async () => {
    const input = JobInput.parse(raw);
    const { site } = await requireSite(siteId);
    const first = site.jobs[0];
    const next = { ...input, must18: first?.must18 ?? '' };
    if (first) {
      await SiteModel.updateOne({ _id: site._id }, { $set: { 'jobs.0': next } }, { runValidators: true });
    } else {
      await SiteModel.updateOne({ _id: site._id }, { $push: { jobs: next } }, { runValidators: true });
    }
    refreshAll();
  });
}

export async function addSupervisor(siteId: string, raw: unknown) {
  return attempt(async () => {
    const input = SupervisorInput.parse(raw);
    const { site } = await requireSite(siteId);
    await SiteModel.updateOne({ _id: site._id }, { $push: { supervisors: { ...input, trained: true } } }, { runValidators: true });
    refreshAll();
  });
}

export async function removeSupervisor(siteId: string, supervisorId: string) {
  return attempt(async () => {
    if (!isValidObjectId(supervisorId)) throw new UserError('That supervisor was not found.');
    const { site } = await requireSite(siteId);
    await SiteModel.updateOne({ _id: site._id }, { $pull: { supervisors: { _id: supervisorId } } });
    refreshAll();
  });
}
