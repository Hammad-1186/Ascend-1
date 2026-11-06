import type { HrCatalog, HrFormValues, HrMember, Lab, Project, Theme } from '../../types/hr';
import { formatDate } from '../../utils/date';
import { YES_NO_OPTIONS, type FieldDef } from './hrFormConfig';

export const EMPTY_DISPLAY = '—';

export function findProject(catalog: HrCatalog | null, id: string): Project | undefined {
  return catalog?.projects.find((p) => p.id === id);
}

/** Human-readable value of one field (used by the Review step and the View page). */
export function getFieldDisplay(field: FieldDef, values: HrFormValues, catalog: HrCatalog | null): string {
  const raw = values[field.name]?.trim() ?? '';
  if (!raw) return EMPTY_DISPLAY;

  switch (field.optionsKey) {
    case 'themes': return catalog?.themes.find((t) => t.id === raw)?.name ?? raw;
    case 'labs': return catalog?.labs.find((l) => l.id === raw)?.name ?? raw;
    case 'projectCodes': return findProject(catalog, raw)?.code ?? raw;
    case 'projectTitles': return findProject(catalog, raw)?.title ?? raw;
    case 'qualifications': return catalog?.qualifications.find((o) => o.value === raw)?.label ?? raw;
    case 'roles': return catalog?.roles.find((o) => o.value === raw)?.label ?? raw;
    case 'commissions': return catalog?.commissions.find((o) => o.value === raw)?.label ?? raw;
    case 'organizations': return catalog?.organizations.find((o) => o.value === raw)?.label ?? raw;
    case 'yesNo': return YES_NO_OPTIONS.find((o) => o.value === raw)?.label ?? raw;
    default: break;
  }
  switch (field.format) {
    case 'date': return formatDate(raw) || raw;
    case 'currency': return `PKR ${Number(raw).toLocaleString('en-US')} / month`;
    case 'months': return `${raw} ${Number(raw) === 1 ? 'month' : 'months'}`;
    default: return field.component === 'date' ? formatDate(raw) || raw : raw;
  }
}

/** Lab / theme / project / organisation text for a directory row. */
export interface MemberContext {
  lab?: Lab;
  theme?: Theme;
  project?: Project;
  role: string;
  commission: string;
  organization: string;
}

export function resolveMemberContext(member: HrMember, catalog: HrCatalog | null): MemberContext {
  const lab = catalog?.labs.find((l) => l.id === member.lab);
  return {
    lab,
    theme: catalog?.themes.find((t) => t.id === (member.technologyTheme || lab?.themeId)),
    project: findProject(catalog, member.projectId),
    role: catalog?.roles.find((o) => o.value === member.role)?.label ?? '',
    commission: catalog?.commissions.find((o) => o.value === member.commission)?.label ?? '',
    organization: catalog?.organizations.find((o) => o.value === member.organization)?.label ?? '',
  };
}

export const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

const AVATAR_COLORS = ['bg-primary', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-fuchsia-500', 'bg-cyan-600'];

/** Stable avatar colour per person (same name -> same colour in the table and the grid cards). */
export const avatarColor = (name: string): string => AVATAR_COLORS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
