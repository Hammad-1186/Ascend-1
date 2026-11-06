import type { ReactNode } from 'react';
import { Building2, Check, Download, FileText, FlaskConical, User, UserCheck, X, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib';
import { GENDER_OPTIONS } from './hrFormConfig';
import { initialsOf, resolveMemberContext } from './hrFormat';
import { formatDate } from '../../utils/date';
import type { HrCatalog, HrMember } from '../../types/hr';

/*
 * Review step + View page: ONE dashboard of compact cards that lists every value from every step.
 * Style follows the project-detail screen: icon chip + title per card, tiny uppercase labels, values underneath,
 * a mono accent badge for codes / IDs. Cards sit side by side so the whole record fits one screen (no scrolling).
 */

/* ------------------------------------------------------------------ building blocks */

/** Card with an icon chip + title in the header (and an optional count/badge on the right). */
function InfoCard({ icon: Icon, title, aside, children, className }: {
  icon: LucideIcon; title: string; aside?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={cn('flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-surface', className)}>
      <header className="flex items-center gap-2.5 border-b border-line bg-ink/[0.03] px-3.5 py-1.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/15 text-info"><Icon size={15} /></span>
        <h2 className="truncate text-sm font-semibold">{title}</h2>
        {aside && <div className="ml-auto shrink-0 text-xs font-semibold text-info">{aside}</div>}
      </header>
      <dl className="grid flex-1 grid-cols-2 content-start gap-x-4 gap-y-2 p-3">{children}</dl>
    </section>
  );
}

/** One label + value pair. `mono` = accent code style (IDs, project codes). Long values are cut with a tooltip. */
function Item({ label, value, mono, span, children }: { label: string; value?: string; mono?: boolean; span?: 2; children?: ReactNode }) {
  return (
    <div className={cn('min-w-0', span === 2 && 'col-span-2')}>
      <dt className="truncate text-[10.5px] font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 line-clamp-2 min-w-0 break-words text-[13px] font-medium leading-snug" title={value}>
        {children ?? (value
          ? (mono ? <span className="rounded bg-info/10 px-1.5 py-px font-mono text-[13px] text-info">{value}</span> : value)
          : <span className="font-normal text-muted/70">—</span>)}
      </dd>
    </div>
  );
}

/** Downloadable file chip (CV / LOA). Shows "Not uploaded" when there is no file. */
function FileChip({ name, url }: { name: string; url: string }) {
  if (!url) return <span className="font-normal text-muted/70">Not uploaded</span>;
  return (
    <a href={url} download={name} title={`Download ${name}`} className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-primary/40 bg-primary-soft px-2 py-0.5 text-xs font-medium text-info hover:bg-primary/20">
      <FileText size={13} className="shrink-0" /> <span className="truncate">{name || 'Download'}</span> <Download size={12} className="shrink-0" />
    </a>
  );
}

/**
 * One appointment status: tick state on the left (blue tick = Yes, amber cross = No), its date underneath the label,
 * and an optional extra on the right (the LOA document). Yes = brand blue, No = amber - deliberately not green/red.
 */
function StatusRow({ label, checked, date, extra }: { label: string; checked: boolean; date?: string; extra?: ReactNode }) {
  return (
    <div className="col-span-2 flex min-w-0 items-start gap-2.5 rounded-md border border-line/70 bg-field/50 px-2.5 py-1">
      <span
        className={cn(
          'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full',
          checked ? 'bg-primary text-white' : 'border border-amber-500/70 bg-amber-500/15 text-amber-600',
        )}
      >
        {checked ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-sm font-medium">{label}</span>
        <span className="block truncate text-[11px] text-muted">{checked ? (date ? formatDate(date) : 'Date not set') : 'No'}</span>
        {extra && <span className="mt-1 block min-w-0">{extra}</span>}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ the dashboard */

export default function MemberOverview({ member, catalog }: { member: HrMember; catalog: HrCatalog }) {
  const ctx = resolveMemberContext(member, catalog);
  const { project } = ctx;
  const isRa = member.hrType === 'contractual';
  const qualification = catalog.qualifications.find((o) => o.value === member.qualification)?.label;
  const discipline = catalog.disciplines.find((o) => o.value === member.discipline)?.label;
  const gender = GENDER_OPTIONS.find((o) => o.value === member.gender)?.label;
  const money = member.payPackage ? `PKR ${Number(member.payPackage).toLocaleString('en-US')} / month` : undefined;
  const months = (v: string) => (v ? `${v} ${Number(v) === 1 ? 'month' : 'months'}` : undefined);
  const date = (v: string) => (v ? formatDate(v) : undefined);

  const nameItem = (
    <Item label="Name" span={2}>
      <span className="flex items-center gap-2">
        {member.photo
          ? <img src={member.photo} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-primary/30" />
          : <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">{initialsOf(member.name)}</span>}
        <span className="truncate" title={member.name}>{member.name || <span className="font-normal text-muted/70">—</span>}</span>
      </span>
    </Item>
  );

  /* ---------- Strategic HR: one short record -> two cards */
  if (!isRa) {
    return (
      <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
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

  /* ---------- Contractual HR: three cards side by side */
  const doneCount = [member.selected, member.loaIssued, member.joined].filter((v) => v === 'yes').length;

  return (
    <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[1.15fr_1.2fr_1fr]">
      {/* Step 1 - Basic */}
      <InfoCard icon={User} title="Personal Details">
        {nameItem}
        <Item label="Date of Birth" value={date(member.dob)} />
        <Item label="Gender" value={gender} />
        <Item label="CNIC / ID" value={member.cnic} mono />
        <Item label="Contact #" value={member.phone} />
        <Item label="Email" value={member.email} span={2} />
        <Item label="Qualification" value={qualification} />
        <Item label="Field of Study" value={discipline} />
        <Item label="CV" span={2}><FileChip name={member.cvName} url={member.cv} /></Item>
      </InfoCard>

      {/* Steps 2 + 4 - Lab, project and contract */}
      <InfoCard icon={FlaskConical} title="Lab, Project & Contract">
        <Item label="Technology Theme" value={ctx.theme?.name} span={2} />
        <Item label="Lab" value={ctx.lab?.name} />
        <Item label="Project Code" value={project?.code} mono />
        <Item label="Project Title" value={project?.title} span={2} />
        <Item label="Project Duration" value={months(member.projectDuration)} />
        <Item label="Contract Duration" value={months(member.contractDuration)} />
        <Item label="Pay Package" value={money} span={2} />
      </InfoCard>

      {/* Step 3 - Appointment, then the remarks from the Contract step */}
      <InfoCard icon={UserCheck} title="Appointment" aside={`${doneCount} of 3`}>
        <StatusRow label="Selected" checked={member.selected === 'yes'} date={member.selectedDate} />
        <StatusRow
          label="LOA Issued"
          checked={member.loaIssued === 'yes'}
          date={member.loaIssuedDate}
          extra={member.loaIssued === 'yes' ? <FileChip name={member.loaFileName} url={member.loaFile} /> : undefined}
        />
        <StatusRow label="Joined" checked={member.joined === 'yes'} date={member.dateOfJoining} />
        <Item label="Remarks" value={member.remarks || undefined} span={2} />
      </InfoCard>
    </div>
  );
}
