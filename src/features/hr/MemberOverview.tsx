import type { ReactNode } from 'react';
import {
  ArrowDown, Banknote, Building2, CalendarClock, CalendarDays, Check, ChevronRight, Clock, FileCheck2, FlaskConical, FolderOpen,
  GraduationCap, Layers, MessageSquareText, UserCheck, X, type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib';
import Badge from '../../components/ui/Badge';
import { initialsOf, resolveMemberContext } from './hrFormat';
import { formatDate } from '../../utils/date';
import type { HrCatalog, HrMember } from '../../types/hr';

/* ------------------------------------------------------------------ building blocks */

/** Big number tile: icon, small label, large value. Empty values are visibly "Not set" instead of a lone dash. */
function StatTile({ icon: Icon, label, value, unit }: { icon: LucideIcon; label: string; value?: string; unit?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border border-line bg-app/40 p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-info ring-1 ring-primary/30"><Icon size={18} /></span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        {value ? (
          <p className="truncate text-lg font-semibold" title={`${value}${unit ? ` ${unit}` : ''}`}>
            {value}{unit && <span className="ml-1 text-xs font-normal text-muted">{unit}</span>}
          </p>
        ) : (
          <p className="text-sm italic text-muted">Not set</p>
        )}
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, aside, className, children }: { title: string; icon: LucideIcon; aside?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={cn('rounded-xl border border-line bg-surface/60 p-4', className)}>
      <header className="mb-3 flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft ring-1 ring-primary/40"><Icon size={16} /></span>
        <h2 className="text-base font-semibold">{title}</h2>
        {aside && <div className="ml-auto">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

/** One node of the Theme -> Lab -> Project chain. */
function ChainNode({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value?: string }) {
  const filled = Boolean(value);
  return (
    <div className={cn('min-w-0 flex-1 rounded-lg border p-3', filled ? 'border-primary/50 bg-primary-soft/50' : 'border-dashed border-field-line bg-app/30')}>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted"><Icon size={13} /> {label}</p>
      <p className={cn('mt-1 break-words', filled ? 'font-semibold' : 'text-sm italic text-muted')} title={value}>{value || 'Not assigned'}</p>
    </div>
  );
}

type YesNo = 'yes' | 'no' | '';

/**
 * One row of the onboarding tracker.
 * Yes = brand blue (filled, tick), No = amber (outlined, cross), not set = dashed grey. Deliberately not green/red.
 */
function ProgressRow({ icon: Icon, label, value, last }: { icon: LucideIcon; label: string; value: YesNo; last?: boolean }) {
  const state = value === 'yes' ? 'done' : value === 'no' ? 'no' : 'unset';
  return (
    <li className="relative flex items-center gap-3 pb-4 last:pb-0">
      {!last && <span className={cn('absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-0.5', state === 'done' ? 'bg-primary/70' : 'bg-field-line')} />}
      <span
        className={cn(
          'z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2',
          state === 'done' && 'border-transparent bg-gradient-to-br from-primary to-primary-2 text-white shadow-md shadow-primary/30',
          state === 'no' && 'border-amber-500 bg-amber-500/15 text-amber-600',
          state === 'unset' && 'border-dashed border-field-line bg-field text-muted',
        )}
      >
        {state === 'done' ? <Check size={17} /> : state === 'no' ? <X size={17} /> : <Icon size={15} />}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <span
        className={cn(
          'rounded-full px-3 py-0.5 text-xs font-semibold',
          state === 'done' && 'bg-primary-soft text-info ring-1 ring-primary/50',
          state === 'no' && 'bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/40',
          state === 'unset' && 'border border-line text-muted',
        )}
      >
        {state === 'done' ? 'Yes' : state === 'no' ? 'No' : 'Not set'}
      </span>
    </li>
  );
}

/**
 * The member summary shown on the View page AND on the form's Review step - one component, so they always look identical.
 * Review passes the unsaved form values as `member`.
 */
export default function MemberOverview({ member, catalog }: { member: HrMember; catalog: HrCatalog }) {
  const ctx = resolveMemberContext(member, catalog);
  const { project } = ctx;
  const isRa = member.hrType === 'contractual';
  const qualification = catalog.qualifications.find((o) => o.value === member.qualification)?.label;
  const money = member.payPackage ? Number(member.payPackage).toLocaleString('en-US') : undefined;
  const months = (v: string) => (v ? v : undefined);

  const steps: Array<{ icon: LucideIcon; label: string; value: YesNo }> = [
    { icon: UserCheck, label: 'Selected', value: member.selected as YesNo },
    { icon: FileCheck2, label: 'LOA Issued', value: member.loaIssued as YesNo },
    { icon: Check, label: 'Joined', value: member.joined as YesNo },
  ];
  const doneCount = steps.filter((s) => s.value === 'yes').length;

  return (
    <div className="space-y-4">
      {/* 1. Who + the numbers that matter, readable at a glance */}
      <section className="rounded-xl border border-line bg-gradient-to-br from-primary-soft/70 via-surface/70 to-surface/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-bold text-white ring-4 ring-primary/25 sm:h-20 sm:w-20 sm:text-2xl">
            {initialsOf(member.name)}
          </span>
          <div className="min-w-0 flex-1 basis-64">
            <h2 className="truncate text-2xl font-bold leading-tight" title={member.name}>{member.name || 'Unnamed member'}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {qualification && <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-0.5 text-xs"><GraduationCap size={13} /> {qualification}</span>}
            </div>
          </div>
        </div>

        <div className={cn('mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2', isRa ? 'lg:grid-cols-4' : 'lg:grid-cols-2')}>
          {isRa ? (
            <>
              <StatTile icon={CalendarDays} label="Date of Joining" value={member.dateOfJoining ? formatDate(member.dateOfJoining) : undefined} />
              <StatTile icon={Banknote} label="Pay Package" value={money && `PKR ${money}`} unit="/ month" />
              <StatTile icon={CalendarClock} label="Contract Duration" value={months(member.contractDuration)} unit="months" />
              <StatTile icon={Clock} label="Project Duration" value={months(member.projectDuration)} unit="months" />
            </>
          ) : (
            <>
              <StatTile icon={Building2} label="Commission" value={ctx.commission || undefined} />
              <StatTile icon={Building2} label="Organization" value={ctx.organization || undefined} />
            </>
          )}
        </div>
      </section>

      {/* 2. Where they work + where they are in the hiring pipeline (contractual RAs only) */}
      {isRa && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card title="Assignment" icon={Layers} className="lg:col-span-2">
            {/* Only Lab and Project (title) - no technology theme, no project code. */}
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <ChainNode icon={FlaskConical} label="Lab" value={ctx.lab?.name} />
              <ChevronRight size={18} className="hidden shrink-0 text-muted sm:block" />
              <ArrowDown size={16} className="mx-auto shrink-0 text-muted sm:hidden" />
              <ChainNode icon={FolderOpen} label="Project" value={project?.title} />
            </div>
          </Card>

          <Card title="Onboarding" icon={UserCheck} aside={<Badge tone={doneCount === 3 ? 'solid' : 'soft'}>{doneCount} of 3 done</Badge>}>
            <ol className="pt-1">
              {steps.map((s, i) => <ProgressRow key={s.label} {...s} last={i === steps.length - 1} />)}
            </ol>
          </Card>
        </div>
      )}

      {/* 3. Notes (contractual only - Strategic HR has no remarks field) */}
      {isRa && <Card title="Remarks" icon={MessageSquareText}>
        {member.remarks
          ? <p className="whitespace-pre-line text-sm leading-relaxed">{member.remarks}</p>
          : <p className="text-sm italic text-muted">No remarks added.</p>}
      </Card>}
    </div>
  );
}
