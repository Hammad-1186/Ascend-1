import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Mail, Pencil, Phone, User } from 'lucide-react';
import { cn } from '../../lib';
import PageHeader from '../../components/layout/PageHeader';
import Badge, { type BadgeTone } from '../../components/ui/Badge';
import SectionCard from '../../components/ui/SectionCard';
import { buttonClasses } from '../../components/ui/Button';
import { useHrCatalog } from './useHrCatalog';
import { hrService } from './hrService';
import { HR_FORM_STEPS, PROJECT_STATUS_LABEL, hrTypeLabel, isVisibleFor, type FieldDef } from './hrFormConfig';
import { EMPTY_DISPLAY, findProject, getFieldDisplay, initialsOf, resolveMemberContext } from './hrFormat';
import type { HrCatalog, HrMember, ProjectStatus } from '../../types/hr';

const STATUS_TONE: Record<ProjectStatus, BadgeTone> = { 'in-progress': 'solid', initiated: 'soft', completed: 'success', 'on-hold': 'muted' };
const COLUMNS = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' } as const;

export default function HrMemberViewPage() {
  const { id } = useParams();
  const { catalog } = useHrCatalog();
  const [member, setMember] = useState<HrMember | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let live = true;
    hrService.getMember(id).then((m) => { if (live) { setMember(m); setLoaded(true); } }).catch(() => live && setLoaded(true));
    return () => { live = false; };
  }, [id]);

  if (!loaded || !catalog) return <div className="grid h-full place-items-center text-muted">Loading…</div>;
  if (!member) {
    return (
      <div className="grid h-full place-items-center px-6">
        <div className="text-center">
          <p className="mb-4 text-muted">This HR member could not be found.</p>
          <Link to="/people" className={buttonClasses('primary')}>Back to HR Directory</Link>
        </div>
      </div>
    );
  }
  return <MemberDetails member={member} catalog={catalog} />;
}

function MemberDetails({ member, catalog }: { member: HrMember; catalog: HrCatalog }) {
  const ctx = resolveMemberContext(member, catalog);
  const project = findProject(catalog, member.projectId);

  // Same grouping as the form: one card per group, taken from the shared config.
  const groups = HR_FORM_STEPS
    .filter((s) => isVisibleFor(s, member.hrType))
    .flatMap((s) => s.groups)
    .filter((g) => isVisibleFor(g, member.hrType) && g.kind !== 'hrType')
    .map((g) => ({ ...g, fields: g.fields.filter((f) => isVisibleFor(f, member.hrType)) }))
    .filter((g) => g.fields.length > 0);

  const renderValue = (f: FieldDef) => {
    const text = getFieldDisplay(f, member, catalog);
    if (f.optionsKey === 'yesNo' && text !== EMPTY_DISPLAY) return <Badge tone={text === 'Yes' ? 'success' : 'muted'}>{text}</Badge>;
    return <span className={cn(text === EMPTY_DISPLAY && 'text-muted', f.component === 'textarea' && 'line-clamp-3 whitespace-pre-line')} title={text}>{text}</span>;
  };

  return (
    <div className="px-6 py-4">
      <PageHeader
        backTo="/people"
        backLabel="Back to HR Directory"
        icon={User}
        title={member.name || 'Unnamed member'}
        subtitle={`${hrTypeLabel(member.hrType)} · ASCEND LAB SYSTEMS - HR MANAGEMENT`}
        actions={<Link to={`/people/${member.id}/edit`} className={buttonClasses('primary')}><Pencil size={16} /> Edit</Link>}
      />

      <SectionCard className="mb-4">
        <div className="flex flex-wrap items-center gap-5">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold ring-4 ring-primary/25">{initialsOf(member.name)}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold">{member.name || 'Unnamed member'}</h2>
              <Badge tone={member.hrType === 'contractual' ? 'solid' : 'success'}>{hrTypeLabel(member.hrType)}</Badge>
              {project && <Badge tone={STATUS_TONE[project.status]}>Project {PROJECT_STATUS_LABEL[project.status]}</Badge>}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-2"><Mail size={14} /> {member.email || EMPTY_DISPLAY}</span>
              <span className="inline-flex items-center gap-2"><Phone size={14} /> {member.phone || EMPTY_DISPLAY}</span>
            </div>
          </div>
          {member.hrType === 'contractual' && (
            <dl className="flex gap-6 text-sm">
              {[{ l: 'Lab', v: ctx.lab?.name }, { l: 'Theme', v: ctx.theme?.name }, { l: 'Project', v: project?.code }].map((x) => (
                <div key={x.l} className="min-w-0"><dt className="text-muted">{x.l}</dt><dd className="max-w-[170px] truncate font-medium" title={x.v}>{x.v ?? EMPTY_DISPLAY}</dd></div>
              ))}
            </dl>
          )}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <SectionCard key={g.id} title={g.title} icon={g.icon}>
            <dl className={cn('grid grid-cols-1 gap-x-5 gap-y-3 text-sm', COLUMNS[Math.min(g.columns, 2) as 1 | 2])}>
              {g.fields.map((f) => (
                <div key={f.id} className={cn('min-w-0', f.span === 'full' && 'sm:col-span-full')}>
                  <dt className="mb-0.5 truncate text-xs uppercase tracking-wide text-muted">{f.label}</dt>
                  <dd className="min-w-0 truncate font-medium">{renderValue(f)}</dd>
                </div>
              ))}
              {g.id === 'project' && project && (
                <div className="min-w-0">
                  <dt className="mb-0.5 text-xs uppercase tracking-wide text-muted">Project Status</dt>
                  <dd><Badge tone={STATUS_TONE[project.status]}>{PROJECT_STATUS_LABEL[project.status]}</Badge></dd>
                </div>
              )}
            </dl>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
