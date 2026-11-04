import {
  Banknote, Building2, CalendarClock, CalendarDays, Check, Clock, FileCheck2, FlaskConical, FolderOpen,
  GraduationCap, UserCheck, X, type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib';
import SectionCard from '../../components/ui/SectionCard';
import { initialsOf, resolveMemberContext } from './hrFormat';
import { formatDate } from '../../utils/date';
import type { HrCatalog, HrMember } from '../../types/hr';

/* ------------------------------------------------------------------ building blocks */

/**
 * Read-only version of a form field: the label on top (same style as the form) and the value in a field-shaped box.
 * Empty values read "Not set". Used for every detail on the Review and View screens.
 */
function ReadField({ icon: Icon, label, value, unit, multiline, className }: {
  icon?: LucideIcon; label: string; value?: string; unit?: string; multiline?: boolean; className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="truncate text-base font-medium">{label}</span>
      <div className={cn('flex w-full gap-2.5 rounded-md border border-field-line bg-field px-3.5 text-base', multiline ? 'min-h-24 items-start py-2.5' : 'min-h-11 items-center py-2')}>
        {Icon && <Icon size={16} className={cn('shrink-0 text-muted', multiline && 'mt-1')} />}
        {value ? (
          <span className={cn('min-w-0 break-words', multiline && 'whitespace-pre-line')} title={value}>
            {value}{unit && <span className="ml-1.5 text-sm text-muted">{unit}</span>}
          </span>
        ) : (
          <span className="italic text-muted">Not set</span>
        )}
      </div>
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
    <div className="space-y-3">
      {/* Who */}
      <section className="rounded-lg border border-line bg-gradient-to-br from-primary-soft/70 via-surface/70 to-surface/50 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          {member.photo ? (
            <img src={member.photo} alt={member.name} className="h-16 w-16 shrink-0 rounded-full object-cover ring-4 ring-primary/25 sm:h-20 sm:w-20" />
          ) : (
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-bold text-white ring-4 ring-primary/25 sm:h-20 sm:w-20 sm:text-2xl">
              {initialsOf(member.name)}
            </span>
          )}
          <div className="min-w-0 flex-1 basis-64">
            <h2 className="truncate text-2xl font-bold leading-tight" title={member.name}>{member.name || 'Unnamed member'}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {qualification && <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-0.5 text-xs"><GraduationCap size={13} /> {qualification}</span>}
            </div>
          </div>
        </div>
      </section>

      {isRa ? (
        <>
          <SectionCard title="Contract Details">
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              <ReadField icon={CalendarDays} label="Date of Joining" value={member.dateOfJoining ? formatDate(member.dateOfJoining) : undefined} />
              <ReadField icon={Banknote} label="Pay Package" value={money && `PKR ${money}`} unit="/ month" />
              <ReadField icon={CalendarClock} label="Contract Duration" value={months(member.contractDuration)} unit="months" />
              <ReadField icon={Clock} label="Project Duration" value={months(member.projectDuration)} unit="months" />
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <SectionCard title="Assignment" className="h-full">
              <div className="grid grid-cols-1 gap-4">
                <ReadField icon={FlaskConical} label="Lab" value={ctx.lab?.name} />
                <ReadField icon={FolderOpen} label="Project" value={project?.title} />
              </div>
            </SectionCard>

            <SectionCard title="Onboarding" badge={`${doneCount} of 3 done`} badgeTone={doneCount === 3 ? 'solid' : 'soft'} className="h-full">
              <ol>
                {steps.map((st, i) => <ProgressRow key={st.label} {...st} last={i === steps.length - 1} />)}
              </ol>
            </SectionCard>
          </div>

          <SectionCard title="Remarks">
            <ReadField label="Remarks" value={member.remarks || undefined} multiline />
          </SectionCard>
        </>
      ) : (
        <SectionCard title="Commission & Organization">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            <ReadField icon={Building2} label="Commission" value={ctx.commission || undefined} />
            <ReadField icon={Building2} label="Organization" value={ctx.organization || undefined} />
          </div>
        </SectionCard>
      )}
    </div>
  );
}
