import type { ReactNode } from 'react';
import { Briefcase, Building2, Check, Download, FileText, FlaskConical, GraduationCap, User, UserCheck, X, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib';
import { GENDER_OPTIONS } from './hrFormConfig';
import { initialsOf, resolveMemberContext } from './hrFormat';
import { formatDate } from '../../utils/date';
import type { HrCatalog, HrMember } from '../../types/hr';

/*
 * Review step + View page: every value from every step on ONE screen, grouped the way the form is grouped:
 *   Personal Details | Contact & Education | Lab & Project      (Basic + Lab steps)
 *   Appointment (3 statuses)                  | Contract          (Appointment + Contract steps)
 * Fluid text size: everything is in em and the root font-size follows the window height (12.5px on a short window, up to 19px
 * on a tall monitor), so it is as large as it can be while still fitting without scrolling.
 */

/* ------------------------------------------------------------------ building blocks */

/** Card with an icon chip + title; the body is a 2-column grid of label/value pairs (or anything, via `plain`). */
function InfoCard({ icon: Icon, title, children, className, plain }: {
  icon: LucideIcon; title: string; children: ReactNode; className?: string; plain?: boolean;
}) {
  return (
    <section className={cn('flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface', className)}>
      <header className="flex items-center gap-2.5 border-b border-line bg-ink/[0.03] px-3.5 py-1">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-primary/15 text-info"><Icon size={14} /></span>
        <h2 className="truncate text-[1em] font-semibold">{title}</h2>
      </header>
      {plain
        ? <div className="flex-1 p-2.5">{children}</div>
        : <dl className="grid flex-1 grid-cols-2 content-start gap-x-4 gap-y-2 p-2.5">{children}</dl>}
    </section>
  );
}

/** One label + value. `mono` = accent code style (IDs, project codes). Values may wrap onto a second line. */
function Item({ label, value, mono, span, children }: { label: string; value?: string; mono?: boolean; span?: 2; children?: ReactNode }) {
  return (
    <div className={cn('min-w-0', span === 2 && 'col-span-2')}>
      <dt className="truncate text-[0.76em] font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 line-clamp-2 min-w-0 break-words text-[1em] font-medium leading-snug" title={value}>
        {children ?? (value
          ? (mono ? <span className="rounded bg-info/10 px-1.5 py-px font-mono text-[0.92em] text-info">{value}</span> : value)
          : <span className="font-normal text-muted/70">—</span>)}
      </dd>
    </div>
  );
}

/** Downloadable file chip (CV / LOA). "Not uploaded" when there is no file. */
function FileChip({ name, url }: { name: string; url: string }) {
  if (!url) return <span className="font-normal text-muted/70">Not uploaded</span>;
  return (
    <a href={url} download={name} title={`Download ${name}`} className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-primary/40 bg-primary-soft px-2 py-0.5 text-[0.92em] font-medium text-info hover:bg-primary/20">
      <FileText size={14} className="shrink-0" /> <span className="truncate">{name || 'Download'}</span> <Download size={13} className="shrink-0" />
    </a>
  );
}

/**
 * One appointment status as a tile: tick (blue = Yes) or cross (amber = No) + label, the date underneath and, for the LOA,
 * the document. Yes = brand blue, No = amber - deliberately not green/red.
 */
function StatusTile({ label, checked, prefix = '', date, extra }: { label: string; checked: boolean; prefix?: string; date?: string; extra?: ReactNode }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-md border border-line/70 bg-field/50 px-3 py-1.5">
      <span className={cn('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full', checked ? 'bg-primary text-white' : 'border border-amber-500/70 bg-amber-500/15 text-amber-600')}>
        {checked ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1 leading-snug">
        <p className="truncate font-semibold">{label}: <span className={checked ? 'text-info' : 'text-amber-600'}>{checked ? 'Yes' : 'No'}</span></p>
        <p className="truncate text-[0.92em] text-muted">{date ? `${prefix}${formatDate(date)}` : 'Date not set'}</p>
        {extra && <div className="mt-0.5 min-w-0 text-[0.92em]">{extra}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ the summary */

export default function MemberOverview({ member, catalog }: { member: HrMember; catalog: HrCatalog }) {
  const ctx = resolveMemberContext(member, catalog);
  const { project } = ctx;
  const isRa = member.hrType === 'contractual';
  const qualification = catalog.qualifications.find((o) => o.value === member.qualification)?.label;
  const discipline = catalog.disciplines.find((o) => o.value === member.discipline)?.label;
  const gender = GENDER_OPTIONS.find((o) => o.value === member.gender)?.label;
  const months = (v: string) => (v ? `${v} ${Number(v) === 1 ? 'month' : 'months'}` : undefined);
  const date = (v: string) => (v ? formatDate(v) : undefined);

  const nameItem = (
    <Item label="Name" span={2}>
      <span className="flex items-center gap-2.5">
        {member.photo
          ? <img src={member.photo} alt="" className="h-[2.6em] w-[2.6em] shrink-0 rounded-full object-cover ring-2 ring-primary/30" />
          : <span className="grid h-[2.6em] w-[2.6em] shrink-0 place-items-center rounded-full bg-primary text-[0.9em] font-bold text-white">{initialsOf(member.name)}</span>}
        <span className="line-clamp-2 min-w-0 break-words text-[1.07em] font-semibold" title={member.name}>{member.name || <span className="font-normal text-muted/70">—</span>}</span>
      </span>
    </Item>
  );

  /* ---------- Strategic HR: two cards */
  if (!isRa) {
    return (
      <div style={{ fontSize: 'clamp(12.5px, 2.3vh, 19px)' }} className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        <InfoCard icon={User} title="Personal Details">
          {nameItem}
          <Item label="CNIC / ID" value={member.cnic} mono />
          <Item label="Contact #" value={member.phone} />
          <Item label="Email" value={member.email} span={2} />
        </InfoCard>
        <InfoCard icon={Building2} title="Role & Organization">
          <Item label="Role" value={ctx.role} span={2} />
          <Item label="Commission" value={ctx.commission} />
          <Item label="Organization" value={ctx.organization} />
        </InfoCard>
      </div>
    );
  }

  /* ---------- Contractual HR: three cards, then appointment + contract */
  const joined = member.joined === 'yes';
  return (
    <div style={{ fontSize: 'clamp(12.5px, 2.3vh, 19px)' }} className="grid grid-cols-1 gap-2.5 lg:grid-cols-[1fr_1.25fr_1fr]">
      <InfoCard icon={User} title="Personal Details">
        {nameItem}
        <Item label="Gender" value={gender} />
        <Item label="Date of Birth" value={date(member.dob)} />
        <Item label="CNIC / ID" value={member.cnic} mono span={2} />
      </InfoCard>

      <InfoCard icon={GraduationCap} title="Contact & Education">
        <Item label="Contact #" value={member.phone} />
        <Item label="Email" value={member.email} />
        <Item label="Qualification" value={qualification} />
        <Item label="Field of Study" value={discipline} />
        <Item label="CV" span={2}><FileChip name={member.cvName} url={member.cv} /></Item>
      </InfoCard>

      <InfoCard icon={FlaskConical} title="Lab & Project">
        <Item label="Technology Theme" value={ctx.theme?.name} />
        <Item label="Lab" value={ctx.lab?.name} />
        <Item label="Project Code" value={project?.code} mono />
        <Item label="Project Title" value={project?.title} />
        <Item label="Project Duration" value={months(member.projectDuration)} />
      </InfoCard>

      <InfoCard icon={UserCheck} title="Appointment" plain className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <StatusTile label="Selected" checked={member.selected === 'yes'} date={member.selectedDate} />
          <StatusTile
            label="LOA Issued"
            checked={member.loaIssued === 'yes'}
            date={member.loaIssuedDate}
            extra={member.loaIssued === 'yes' ? <FileChip name={member.loaFileName} url={member.loaFile} /> : undefined}
          />
          <StatusTile label="Joined" checked={joined} prefix={joined ? '' : 'Expected '} date={member.dateOfJoining} />
        </div>
      </InfoCard>

      <InfoCard icon={Briefcase} title="Contract">
        <Item label="Pay Package (monthly)" value={member.payPackage ? `PKR ${Number(member.payPackage).toLocaleString('en-US')}` : undefined} />
        <Item label="Contract Duration" value={months(member.contractDuration)} />
        <Item label="Remarks" value={member.remarks || undefined} span={2} />
      </InfoCard>
    </div>
  );
}
