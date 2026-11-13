import 'server-only';
import { isValidObjectId, type Types } from 'mongoose';
import { cache } from 'react';
import type { SiteWeekData } from '@/lib/rules';
import type {
  Assessment,
  Note,
  Participant,
  SavedLocation,
  Site,
  TimesheetWeek,
  Trip,
  Visit,
} from '@/lib/types';
import {
  AssessmentModel,
  LocationModel,
  NoteModel,
  ParticipantModel,
  SiteModel,
  TimesheetModel,
  TripModel,
  VisitModel,
} from './models';
import { serialize, serializeAll } from './serialize';
import { getCurrentMonitor } from './session';

/* Reads. Every query is scoped to the current monitor's worksites, so a
   page can never show another monitor's site by guessing its URL. Wrapped
   in React's cache() so a layout and its page share one database round trip
   per request. */

export type SiteBundle = SiteWeekData;

export const getSiteBundle = cache(async (siteId: string): Promise<SiteBundle | null> => {
  if (!isValidObjectId(siteId)) return null;
  const me = await getCurrentMonitor();
  const site = await SiteModel.findOne({ _id: siteId, monitorId: me.id }).lean();
  if (!site) return null;
  const [participants, visits, timesheets, assessments] = await Promise.all([
    ParticipantModel.find({ siteId }).sort({ order: 1, last: 1, first: 1 }).lean(),
    VisitModel.find({ siteId }).sort({ date: -1, timeIn: -1 }).lean(),
    TimesheetModel.find({ siteId }).sort({ week: 1 }).lean(),
    AssessmentModel.find({ siteId }).sort({ week: 1 }).lean(),
  ]);
  return {
    site: serialize<Site>(site),
    participants: serializeAll<Participant>(participants),
    visits: serializeAll<Visit>(visits),
    timesheets: serializeAll<TimesheetWeek>(timesheets),
    assessments: serializeAll<Assessment>(assessments),
  };
});

/** Every worksite assigned to the current monitor, with what the dashboard
    and the weekly worklist need. Signature images are left out. */
export const getMySites = cache(async (): Promise<SiteWeekData[]> => {
  const me = await getCurrentMonitor();
  const sites = await SiteModel.find({ monitorId: me.id }).sort({ order: 1, createdAt: 1 }).lean();
  const ids = sites.map((s) => s._id);
  const [participants, visits, timesheets, assessments] = await Promise.all([
    ParticipantModel.find({ siteId: { $in: ids } })
      .select('-childcareForm')
      .sort({ order: 1, last: 1, first: 1 })
      .lean(),
    VisitModel.find({ siteId: { $in: ids } }).lean(),
    TimesheetModel.find({ siteId: { $in: ids } }).lean(),
    AssessmentModel.find({ siteId: { $in: ids } })
      .select('-form.monitorSig -form.supervisorSig -form.directorSig')
      .lean(),
  ]);

  const bySite = <T extends { siteId: Types.ObjectId }>(rows: T[]) => {
    const m = new Map<string, T[]>();
    for (const r of rows) {
      const k = r.siteId.toHexString();
      m.set(k, [...(m.get(k) ?? []), r]);
    }
    return m;
  };
  const p = bySite(participants);
  const v = bySite(visits);
  const t = bySite(timesheets);
  const a = bySite(assessments);

  return sites.map((s) => {
    const k = s._id.toHexString();
    return {
      site: serialize<Site>(s),
      participants: serializeAll<Participant>(p.get(k) ?? []),
      visits: serializeAll<Visit>(v.get(k) ?? []),
      timesheets: serializeAll<TimesheetWeek>(t.get(k) ?? []),
      assessments: serializeAll<Assessment>(a.get(k) ?? []),
    };
  });
});

export const getMileage = cache(async (): Promise<{ trips: Trip[]; locations: SavedLocation[] }> => {
  const me = await getCurrentMonitor();
  const [trips, locations] = await Promise.all([
    TripModel.find({ monitorId: me.id }).sort({ date: 1, _id: 1 }).lean(),
    LocationModel.find({ monitorId: me.id }).sort({ _id: 1 }).lean(),
  ]);
  return { trips: serializeAll<Trip>(trips), locations: serializeAll<SavedLocation>(locations) };
});

export const getSiteAddresses = cache(async (): Promise<{ id: string; name: string; address: string }[]> => {
  const me = await getCurrentMonitor();
  const sites = await SiteModel.find({ monitorId: me.id }).select('name address').sort({ order: 1, createdAt: 1 }).lean();
  return sites.map((s) => ({ id: s._id.toHexString(), name: s.name, address: s.address }));
});

export const getNotes = cache(async (): Promise<Note[]> => {
  const me = await getCurrentMonitor();
  const notes = await NoteModel.find({ monitorId: me.id }).lean();
  /* notes saved before subjects and worksites existed have neither field */
  return serializeAll<Note>(notes)
    .map((n) => ({ ...n, subject: n.subject ?? '', siteId: n.siteId ?? null }))
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
});
