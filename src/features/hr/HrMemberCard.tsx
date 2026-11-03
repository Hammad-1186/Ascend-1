import { Link, useNavigate } from 'react-router-dom';
import { Building2, Calendar, Eye, FlaskConical, Pencil, Phone, Settings, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib';
import Badge from '../../components/ui/Badge';
import { buttonClasses } from '../../components/ui/Button';
import { EMPTY_DISPLAY, avatarColor, initialsOf, type MemberContext } from './hrFormat';
import { HR_TYPE_TONE, hrTypeLabel } from './hrFormConfig';
import { formatDate } from '../../utils/date';
import type { HrMember } from '../../types/hr';

interface Detail { icon: LucideIcon; label: string; value: string }

interface HrMemberCardProps {
  member: HrMember;
  /** Lab / theme / organisation already resolved from the catalog (see resolveMemberContext). */
  ctx: MemberContext;
}

/** Grid-view card: identity + HR type on top, key facts in the middle, View / Edit at the bottom. */
export default function HrMemberCard({ member: m, ctx }: HrMemberCardProps) {
  const navigate = useNavigate();
  // Contractual RAs show lab + theme; Strategic HR shows organisation. Add or reorder facts here only.
  const details: Detail[] = [
    { icon: Phone, label: 'Contact', value: m.phone },
    ...(m.hrType === 'contractual'
      ? [
          { icon: FlaskConical, label: 'Lab', value: ctx.lab?.name ?? '' },
          { icon: Settings, label: 'Technology theme', value: ctx.theme?.name ?? '' },
        ]
      : [{ icon: Building2, label: 'Organization', value: ctx.organization }]),
    { icon: Calendar, label: 'Joining date', value: m.dateOfJoining ? formatDate(m.dateOfJoining) : '' },
  ];

  return (
    <article onClick={() => navigate(`/people/${m.id}`)} className="flex cursor-pointer flex-col rounded-lg border border-line bg-surface/60 p-4 transition hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-start gap-3">
        <Link to={`/people/${m.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-full text-base font-semibold text-white', avatarColor(m.name || m.id))}>
            {initialsOf(m.name)}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block font-semibold">{m.name || 'Unnamed'}</span>
            <span className="block break-all text-xs text-muted">{m.email || EMPTY_DISPLAY}</span>
          </span>
        </Link>
        <Badge tone={HR_TYPE_TONE[m.hrType]}>{hrTypeLabel(m.hrType)}</Badge>
      </div>

      <dl className="mt-4 flex flex-1 gap-3">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex min-w-0 flex-1 items-start gap-1.5 text-xs leading-snug">
            <Icon size={13} className="mt-0.5 shrink-0 text-info" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="sr-only">{label}</dt>
              <dd className="break-words">{value || EMPTY_DISPLAY}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex gap-2 border-t border-line pt-3" onClick={(e) => e.stopPropagation()}>
        <Link to={`/people/${m.id}`} className={buttonClasses('outline', 'flex-1 justify-center py-1.5')}><Eye size={15} /> View</Link>
        <Link to={`/people/${m.id}/edit`} className={buttonClasses('outline', 'flex-1 justify-center py-1.5')}><Pencil size={14} /> Edit</Link>
      </div>
    </article>
  );
}
