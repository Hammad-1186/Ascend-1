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
      <span className="truncate text-sm font-medium">{label}</span>
      <div className={cn('flex w-full gap-2.5 rounded-md border border-field-line bg-field px-3.5 text-base', multiline ? 'min-h-24 items-start py-2.5' : 'min-h-11 items-center py-1.5')}>
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
 * One onboarding answer, shown like the other read-only fields: label on top, then a field-shaped box with an icon and a pill.
 * Yes = brand blue, No = amber, not set = grey (deliberately not green/red).
 */
function OnboardField({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: YesNo }) {
  const state = value === 'yes' ? 'done' : value === 'no' ? 'no' : 'unset';
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="truncate text-sm font-medium">{label}</span>
      <div className="flex min-h-11 w-full items-center gap-2.5 rounded-md border border-field-line bg-field px-3.5 py-1.5 text-base">
        <Icon size={16} className="shrink-0 text-muted" />
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs',
            state !== 'unset' && 'font-semibold',
            state === 'done' && 'bg-primary-soft text-info ring-1 ring-primary/50',
            state === 'no' && 'bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/40',
            state === 'unset' && 'italic text-muted',
          )}
        >
          {state === 'done' && <Check size={13} />}
          {state === 'no' && <X size={13} />}
          {state === 'done' ? 'Yes' : state === 'no' ? 'No' : 'Not set'}
        </span>
      </div>
    </div>
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

  // Kept deliberately dense (slim header, fields in rows) so the View page and the Review step fit on one screen without scrolling.
  return (
    <div className="space-y-2.5">
      {/* Who */}
      <section className="flex items-center gap-3 rounded-lg border border-line bg-gradient-to-br from-primary-soft/70 via-surface/70 to-surface/50 px-4 py-1.5">
        {member.photo ? (
          <img src={member.photo} alt={member.name} className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-primary/25" />
        ) : (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white ring-2 ring-primary/25">
            {initialsOf(member.name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold leading-tight" title={member.name}>{member.name || 'Unnamed member'}</h2>
          {qualification && <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-0.5 text-xs"><GraduationCap size={13} /> {qualification}</span>}
        </div>
      </section>

      {isRa ? (
        <>
          <SectionCard title="Contract & Remarks">
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-6">
              <ReadField icon={CalendarDays} label="Date of Joining" value={member.dateOfJoining ? formatDate(member.dateOfJoining) : undefined} />
              <ReadField icon={Banknote} label="Pay Package" value={money && `PKR ${money}`} unit="/ month" />
              <ReadField icon={CalendarClock} label="Contract Duration" value={months(member.contractDuration)} unit="months" />
              <ReadField icon={Clock} label="Project Duration" value={months(member.projectDuration)} unit="months" />
              <ReadField label="Remarks" value={member.remarks || undefined} className="sm:col-span-2" />
            </div>
          </SectionCard>

          <SectionCard title="Assignment & Onboarding" badge={`${doneCount} of 3 onboarded`} badgeTone={doneCount === 3 ? 'solid' : 'soft'}>
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-6">
              <ReadField icon={FlaskConical} label="Lab" value={ctx.lab?.name} />
              <ReadField icon={FolderOpen} label="Project" value={project?.title} className="sm:col-span-2" />
              {steps.map((st) => <OnboardField key={st.label} {...st} />)}
            </div>
          </SectionCard>
        </>
      ) : (
        <SectionCard title="Commission & Organization">
          <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
            <ReadField icon={Building2} label="Commission" value={ctx.commission || undefined} />
            <ReadField icon={Building2} label="Organization" value={ctx.organization || undefined} />
          </div>
        </SectionCard>
      )}
    </div>
  );
}
