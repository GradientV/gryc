import type { ReactNode } from 'react';
import { fmtSlash } from '@/lib/format';
import {
  CHILDCARE_DOCS,
  CHILDCARE_NOTE,
  CHILDCARE_RATIOS,
  CHILDCARE_TRIP_RATIO,
  FACILITY_ITEMS,
  IMPLEMENTATION,
  INTERNSHIP_MODES,
  INTERVIEW_FLAGS,
  INTERVIEW_MODES,
  INTERVIEW_Q,
  OPERATIONS_Q,
  PROGRAM_ACTIVITY_Q,
  RECORDKEEPING_ITEMS,
} from '@/lib/forms';
import type { AssessmentForm, Site, Tri } from '@/lib/types';
import { SignatureView } from '../ui/signature-pad';

/* The filed packet, laid out like the DYCD "SYEP/WLG Worksite Assessment
   Report" so it reads and prints like the paper. One packet page per sheet.
   The photographed paper has no page 4, so neither does this. */

function Box({ on }: { on: boolean }) {
  return <span className="fbox">{on ? '✓' : ''}</span>;
}

function BoxLabel({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <span className="fbox-row">
      <Box on={on} />
      <span>{children}</span>
    </span>
  );
}

function Row({ label, value, wide }: { label: string; value: ReactNode; wide?: boolean }) {
  return (
    <div className={`frow ${wide ? 'wide' : ''}`}>
      <span className="fl">{label}</span>
      <span className="fv">{value === '' || value === null || value === undefined ? ' ' : value}</span>
    </div>
  );
}

function FormPage({ n, title, children }: { n: number; title?: string; children: ReactNode }) {
  return (
    <section className="fpage">
      <div className="fpage-h">
        <div className="fpage-brand">
          <b>NYC</b>
          <span>Department of Youth &amp; Community Development</span>
        </div>
        <div className="fpage-t">
          <b>SYEP/WLG</b>
          <span>Worksite Assessment Report</span>
        </div>
        <div className="fpage-n">Page {n}</div>
      </div>
      {title ? <div className="fbar">{title}</div> : null}
      {children}
    </section>
  );
}

const yn = (v: Tri | undefined) => (v === 'yes' ? 'Yes' : v === 'no' ? 'No' : v === 'na' ? 'N/A' : '—');

export function Packet({ a, site }: { a: AssessmentForm; site: Site }) {
  const supRows = a.supervisorRows.filter((r) => r.name);
  const cc = !a.ccNotApplicable;

  return (
    <div className="formdoc">
      <FormPage n={1}>
        <div className="fnote">
          For Supervisor use ONLY: Is this site in accordance with all SYEP/WLG rules and regulations?{' '}
          <BoxLabel on={a.supervisorRules === 'YES'}>YES</BoxLabel> <BoxLabel on={a.supervisorRules === 'NO'}>NO</BoxLabel>
        </div>
        <div className="fgrid">
          <Row label="Worksite Name:" value={site.name} wide />
          <Row label="Worksite Type:" value={a.worksiteType} />
          <Row label="Address:" value={site.address} wide />
          <Row label="Borough:" value={site.borough} />
          <Row label="Zip Code:" value={site.zip} />
          <Row label="Between Streets:" value={site.crossStreets} wide />
          <Row label="Travel Directions:" value={site.travel.replace(/\n+/g, '  ·  ')} wide />
          <Row label="Worksite Supervisor:" value={a.supervisorName} wide />
          <Row label="Title:" value={a.supervisorTitle} />
          <Row label="Phone #:" value={a.supervisorPhone} />
          <Row label="Person Interviewed:" value={a.interviewName} wide />
          <Row label="Title:" value={a.interviewTitle} />
          <Row label="Phone #:" value={a.interviewPhone} />
        </div>
        <div className="fline">
          SYEP/WLG participants will be expected to work:{' '}
          {IMPLEMENTATION.map((m) => (
            <span key={m} className="mr-3">
              <BoxLabel on={a.expectedWork === m}>{m}</BoxLabel>
            </span>
          ))}
        </div>
        <div className="fline">
          <b>Total # Participants assigned:</b> {a.assigned} &nbsp;&nbsp; <b># of Participants present at time of visit:</b>{' '}
          {a.present}
        </div>
        <div className="fline sm">
          Additional Worksite Applications to other DYCD providers:{' '}
          {a.otherProvidersNA ? <BoxLabel on>N/A</BoxLabel> : a.otherProviders.map((o) => `${o.name} (${o.requested})`).join('; ')}
        </div>
        <div className="fbar">Facility</div>
        <div className="fline sm">
          Please check here if this site is remote <Box on={a.isRemote} />
        </div>
        <div className="fline">
          <b>What is the condition of the worksite?</b>
        </div>
        <div className="fchecks">
          {FACILITY_ITEMS.map((i) => (
            <BoxLabel key={i.id} on={!!a.facility[i.id]}>
              {i.text}
            </BoxLabel>
          ))}
          <BoxLabel on={!!a.hazard}>Hazardous conditions</BoxLabel>
        </div>
        {a.hazard ? (
          <div className="fline sm">
            <b>Hazardous conditions:</b> {a.hazard}
          </div>
        ) : null}
        <div className="fgrid mt-2">
          <Row label="Name of Provider’s Monitor:" value={a.monitorName} wide />
          <Row label="Date:" value={fmtSlash(a.visitDate)} />
        </div>
      </FormPage>

      <FormPage n={2} title="Recordkeeping">
        <div className="fchecks two">
          {RECORDKEEPING_ITEMS.map((i) => (
            <BoxLabel key={i.id} on={!!a.records[i.id]}>
              {i.text}
              {i.em ? <em> {i.em}</em> : null}
            </BoxLabel>
          ))}
        </div>
        <div className="fline sm">
          List all Supervisors, titles, area of supervision and room # or location. Have those listed been trained on the
          program Policies and Procedures?
        </div>
        <table className="fgt">
          <thead>
            <tr>
              <th>Supervisor Name</th>
              <th>Title</th>
              <th>Area of Supervision</th>
              <th>Room #</th>
              <th className="c">Trained Y/N</th>
            </tr>
          </thead>
          <tbody>
            {(supRows.length ? supRows : [{ name: '', title: '', area: '', room: '', trained: '' }]).map((r, i) => (
              <tr key={i}>
                <td>{r.name}</td>
                <td>{r.title}</td>
                <td>{r.area}</td>
                <td>{r.room}</td>
                <td className="c">{r.trained}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="fline">
          Are all participants accounted for? <BoxLabel on={a.allAccounted === 'yes'}>Yes</BoxLabel>{' '}
          <BoxLabel on={a.allAccounted === 'no'}>No</BoxLabel>
        </div>
        {a.absent.length ? (
          <table className="fgt">
            <thead>
              <tr>
                <th>Name</th>
                <th className="c">Age</th>
                <th>SYEP/WLG ID #</th>
                <th>Reason For Absence</th>
                <th className="c">Site Supervisor Initial</th>
              </tr>
            </thead>
            <tbody>
              {a.absent.map((x) => (
                <tr key={x.participantId}>
                  <td>{x.name}</td>
                  <td className="c">{x.age ?? ''}</td>
                  <td>{x.appId}</td>
                  <td>{x.reason}</td>
                  <td className="c">{x.initial}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        <div className="fline">
          <b>What is the Participant Work Schedule(s)?</b> Days: {a.scheduleDays || '—'} &nbsp; Hours: {a.scheduleHours || '—'}
        </div>
        <div className="fbar">Operations</div>
        <table className="fqt">
          <tbody>
            {OPERATIONS_Q.map((q) => (
              <tr key={q.id}>
                <td className="n">{q.n}</td>
                <td>{q.text}</td>
                <td className="a">{yn(a.ops[q.id])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </FormPage>

      <FormPage n={3}>
        <div className="fline">
          Would you classify this site as a safe environment for the program? <BoxLabel on={a.safeEnv === 'yes'}>Yes</BoxLabel>{' '}
          <BoxLabel on={a.safeEnv === 'no'}>No</BoxLabel>
        </div>
        {a.safeEnvExplain ? (
          <div className="fline sm">
            <b>If not, explain:</b> {a.safeEnvExplain}
          </div>
        ) : null}
        <div className="fbar">Program Activities</div>
        <table className="fqt">
          <tbody>
            {PROGRAM_ACTIVITY_Q.map((q) => (
              <tr key={q.id}>
                <td className="n">{q.n}</td>
                <td>{q.text}</td>
                <td className="a">{yn(a.activities[q.id])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="fbar">Childcare Site Questions</div>
        <div className="fline sm">
          If this is not a Childcare site, please check here <Box on={a.ccNotApplicable} /> and move to the next section.
        </div>
        {cc ? (
          <>
            <div className="fline">
              1. Please check the available document:{' '}
              {CHILDCARE_DOCS.map((d) => (
                <span key={d.id} className="mr-3">
                  <BoxLabel on={a.ccDoc === d.id}>
                    {d.text}
                    {d.em ? <em> {d.em}</em> : null}
                  </BoxLabel>
                </span>
              ))}
              <b>Expires:</b> {fmtSlash(a.ccDocExp) || '—'}
            </div>
            <table className="fgt">
              <thead>
                <tr>
                  <th>Age Group</th>
                  <th className="c">Normal Activities</th>
                  <th className="c">Off-site Trips</th>
                </tr>
              </thead>
              <tbody>
                {CHILDCARE_RATIOS.map((r, i) => (
                  <tr key={r.age}>
                    <td>{r.age}</td>
                    <td className="c">{r.normal}</td>
                    {i === 0 ? (
                      <td className="c" rowSpan={CHILDCARE_RATIOS.length}>
                        {CHILDCARE_TRIP_RATIO}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="fnote">
              <em>{CHILDCARE_NOTE}</em>
            </div>
            <div className="fline">
              2. Have participant job duties been clearly outlined to youth and meet the requirements as described in the
              Worksite Application? <BoxLabel on={a.ccDuties === 'yes'}>Yes</BoxLabel> <BoxLabel on={a.ccDuties === 'no'}>No</BoxLabel>
            </div>
            <div className="fline">
              3. Age ranges of the youth assigned to this site: <BoxLabel on={a.ccAgeYounger}>Younger Youth 14-15 years old</BoxLabel>{' '}
              <BoxLabel on={a.ccAgeOlder}>Older Youth 16+ years old</BoxLabel>
            </div>
            <div className="fline">
              4. What are the daily responsibilities of the participant? <em>(as described by the supervisor)</em>
            </div>
            <div className="fwrite">{a.ccResponsibilities}</div>
          </>
        ) : null}
      </FormPage>

      <FormPage n={5} title="Overall Report Summary">
        <div className="fwrite tall">{a.summary}</div>
        <div className="fline sm">
          <em>I hereby certify that all information contained in this report is accurate and complete to the best of my knowledge.</em>
        </div>
        <div className="fsigs">
          <div>
            <div className="fsig">
              <SignatureView value={a.monitorSig} />
            </div>
            <span className="fsl">Signature of Provider Monitor</span>
          </div>
          <div>
            <div className="fsig">{fmtSlash(a.visitDate)}</div>
            <span className="fsl">Date</span>
          </div>
        </div>
        <div className="fline sm">
          <em>
            I have reviewed the information contained in this report and agree to assume responsibility that corrective action
            will be taken to resolve any problem areas or violations identified during this monitoring visit.
          </em>
        </div>
        <div className="fsigs three">
          <div>
            <div className="fsig">
              <SignatureView value={a.supervisorSig} />
            </div>
            <span className="fsl">Signature of Worksite Supervisor</span>
          </div>
          <div>
            <div className="fsig">{a.supervisorSigTitle}</div>
            <span className="fsl">Title</span>
          </div>
          <div>
            <div className="fsig">{fmtSlash(a.visitDate)}</div>
            <span className="fsl">Date</span>
          </div>
        </div>
        <div className="fbar">Provider Supervisor Staff Use Only</div>
        <div className="fline">
          Is there need for follow up? (Check one) <BoxLabel on={a.followUpNeeded === 'no'}>No</BoxLabel>{' '}
          <BoxLabel on={a.followUpNeeded === 'yes'}>Yes</BoxLabel>
          {a.followUpDetail ? <> — {a.followUpDetail}</> : null}
        </div>
        <div className="fsigs">
          <div>
            <div className="fsig">{a.directorSig ? <SignatureView value={a.directorSig} /> : null}</div>
            <span className="fsl">Signature of SYEP/WLG Program Director</span>
          </div>
          <div>
            <div className="fsig">{fmtSlash(a.directorDate)}</div>
            <span className="fsl">Date</span>
          </div>
        </div>
      </FormPage>

      <FormPage n={6} title="Participant Interviews">
        <div className="fline">
          Completed:{' '}
          {INTERVIEW_MODES.map((m) => (
            <span key={m} className="mr-3">
              <BoxLabel on={a.interviewMode === m}>{m}</BoxLabel>
            </span>
          ))}
          Internship Experience?{' '}
          {INTERNSHIP_MODES.map((m) => (
            <span key={m} className="mr-3">
              <BoxLabel on={a.internshipExperience === m}>{m}</BoxLabel>
            </span>
          ))}
        </div>
        {a.interviews.map((iv, idx) => (
          <div key={idx} className="fivw">
            <div className="fline">
              <b>Interview # {idx + 1}</b> —{' '}
              <em>
                Participants should be interviewed in private, to allow them the comfortability to ask questions and express
                any issues or concerns.
              </em>
            </div>
            <div className="fgrid">
              <Row label="1. What is your DOB?" value={fmtSlash(iv.dob)} />
              <Row label="Last Name" value={iv.lastName} />
            </div>
            <div className="fline">
              2. What type of work do you do? <span className="fv">{iv.workType}</span>
            </div>
            <table className="fqt">
              <tbody>
                {INTERVIEW_Q.map((q) => {
                  const v = iv.answers?.[q.id] ?? '';
                  const flag = INTERVIEW_FLAGS[q.id] && v === INTERVIEW_FLAGS[q.id];
                  return (
                    <tr key={q.id}>
                      <td className="n">{q.n}</td>
                      <td>
                        {q.pre ? <u>{q.pre} </u> : null}
                        {q.text}
                      </td>
                      <td className={`a ${flag ? 'flag' : ''}`}>{v || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {iv.notes ? (
              <div className="fline sm">
                <b>Additional comments:</b> {iv.notes}
              </div>
            ) : null}
          </div>
        ))}
      </FormPage>
    </div>
  );
}
