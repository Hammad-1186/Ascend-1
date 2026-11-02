import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronLeft, ChevronRight, Eye, Pencil, Plus, RotateCcw, Search, UserSearch, Users, UsersRound } from 'lucide-react';
import { cn } from '../../lib';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import { buttonClasses } from '../../components/ui/Button';
import SelectInput from '../../components/form/SelectInput';
import { useHrCatalog } from './useHrCatalog';
import { hrService } from './hrService';
import { EMPTY_DISPLAY, initialsOf, resolveMemberContext } from './hrFormat';
import { HR_TYPE_OPTIONS, hrTypeLabel } from './hrFormConfig';
import { formatDate } from '../../utils/date';
import type { HrMember, HrType } from '../../types/hr';

const PAGE_SIZE = 10;
const AVATAR_COLORS = ['bg-primary', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-fuchsia-500', 'bg-cyan-600'];
const avatarColor = (name: string) => AVATAR_COLORS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

interface Filters { query: string; type: '' | HrType; theme: string; lab: string; floor: string }
const NO_FILTERS: Filters = { query: '', type: '', theme: '', lab: '', floor: '' };

export default function HrDirectoryPage() {
  const { catalog } = useHrCatalog();
  const [members, setMembers] = useState<HrMember[]>([]);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { hrService.listMembers().then(setMembers); }, []);

  const setFilter = (patch: Partial<Filters>) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); };

  const rows = useMemo(() => members.map((m) => ({ m, ctx: resolveMemberContext(m, catalog) })), [members, catalog]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return rows.filter(({ m, ctx }) =>
      (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) &&
      (!filters.type || m.hrType === filters.type) &&
      (!filters.theme || ctx.theme?.id === filters.theme) &&
      (!filters.lab || m.lab === filters.lab) &&
      (!filters.floor || String(ctx.lab?.floor) === filters.floor));
  }, [rows, filters]);

  const counts = {
    total: members.length,
    contractual: members.filter((m) => m.hrType === 'contractual').length,
    strategic: members.filter((m) => m.hrType === 'strategic').length,
  };

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
  const to = Math.min(current * PAGE_SIZE, filtered.length);

  // Lab dropdown narrows to the chosen theme / floor, mirroring the form's Theme -> Lab cascade.
  const labOptions = (catalog?.labs ?? [])
    .filter((l) => (!filters.theme || l.themeId === filters.theme) && (!filters.floor || String(l.floor) === filters.floor))
    .map((l) => ({ value: l.id, label: l.name }));
  const floorOptions = [...new Set((catalog?.labs ?? []).map((l) => l.floor))].sort((a, b) => a - b).map((f) => ({ value: String(f), label: `Floor ${f}` }));
  const themeOptions = (catalog?.themes ?? []).map((t) => ({ value: t.id, label: t.name }));

  const allOnPageSelected = pageRows.length > 0 && pageRows.every(({ m }) => selected.has(m.id));
  const toggleAll = () => setSelected((s) => {
    const next = new Set(s);
    pageRows.forEach(({ m }) => (allOnPageSelected ? next.delete(m.id) : next.add(m.id)));
    return next;
  });
  const toggleOne = (id: string) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => Math.abs(p - current) <= 2 || p === 1 || p === pageCount);
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS);

  return (
    <div className="px-6 py-4">
      <PageHeader
        backTo="/dashboard"
        backLabel="Back to Dashboard"
        icon={Users}
        title="HR Directory"
        subtitle="Manage and review HR members"
        actions={<Link to="/people/new" className={buttonClasses('primary')}><Plus size={16} /> Add HR Member</Link>}
      />

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={UsersRound} label="Total HR Members" value={counts.total} tone="bg-primary-soft" />
        <StatCard icon={Briefcase} label="Contractual HR (RA)" value={counts.contractual} tone="bg-primary-soft" />
        <StatCard icon={UsersRound} label="Strategic HR" value={counts.strategic} tone="bg-emerald-600" />
      </div>

      <div className="mb-3 grid grid-cols-2 items-center gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1.2fr_auto]">
        <div className="relative col-span-2 lg:col-span-1">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={filters.query}
            onChange={(e) => setFilter({ query: e.target.value })}
            placeholder="Search by name or email..."
            className="h-10 w-full rounded-md border border-field-line bg-field pl-10 pr-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <SelectInput aria-label="HR Type" placeholder="All HR Types" options={HR_TYPE_OPTIONS} value={filters.type} onChange={(e) => setFilter({ type: e.target.value as Filters['type'] })} />
        <SelectInput aria-label="Lab" placeholder="All Labs" options={labOptions} value={filters.lab} onChange={(e) => setFilter({ lab: e.target.value })} />
        <SelectInput aria-label="Floor" placeholder="All Floors" options={floorOptions} value={filters.floor} onChange={(e) => setFilter({ floor: e.target.value, lab: '' })} />
        <SelectInput aria-label="Technology Theme" placeholder="All Themes" options={themeOptions} value={filters.theme} onChange={(e) => setFilter({ theme: e.target.value, lab: '' })} />
        <button type="button" onClick={() => { setFilters(NO_FILTERS); setPage(1); }} disabled={!hasFilters} className="inline-flex items-center gap-2 justify-self-end text-sm text-info hover:underline disabled:opacity-40 disabled:no-underline">
          <RotateCcw size={15} /> Clear Filters
        </button>
      </div>

      <div className="mb-3 flex gap-3">
        {[{ value: '' as const, label: 'All HR' }, ...HR_TYPE_OPTIONS.map((o) => ({ value: o.value as HrType, label: o.label }))].map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => setFilter({ type: t.value })}
            className={cn('rounded-full border px-5 py-1.5 text-sm font-medium transition', filters.type === t.value ? 'border-primary bg-primary text-white' : 'border-line text-white hover:bg-surface')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface/60">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-primary-soft/40 text-xs font-semibold uppercase tracking-wide">
              <th className="w-12 px-3 py-3"><input type="checkbox" aria-label="Select all" checked={allOnPageSelected} onChange={toggleAll} className="h-4 w-4 accent-primary" /></th>
              {['Name', 'Contact', 'Lab', 'Project', 'Organization', 'Joining Date', 'HR Type'].map((h) => <th key={h} className="px-2.5 py-3">{h}</th>)}
              <th className="px-2.5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(({ m, ctx }) => (
              <tr key={m.id} className="border-b border-line/60 last:border-0 hover:bg-white/[0.03]">
                <td className="px-3 py-3"><input type="checkbox" aria-label={`Select ${m.name}`} checked={selected.has(m.id)} onChange={() => toggleOne(m.id)} className="h-4 w-4 accent-primary" /></td>
                <td className="px-2.5 py-3">
                  <Link to={`/people/${m.id}`} className="flex items-center gap-3">
                    <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold', avatarColor(m.name || m.id))}>{initialsOf(m.name)}</span>
                    <span className="min-w-0 leading-tight">
                      <span className="block max-w-[150px] truncate font-medium">{m.name || 'Unnamed'}</span>
                      <span className="block max-w-[150px] truncate text-xs text-muted">{m.email || EMPTY_DISPLAY}</span>
                    </span>
                  </Link>
                </td>
                <td className="whitespace-nowrap px-2.5 py-3">{m.phone || EMPTY_DISPLAY}</td>
                <td className="whitespace-nowrap px-2.5 py-3">{ctx.lab?.name ?? EMPTY_DISPLAY}</td>
                <td className="px-2.5 py-3"><span className="block max-w-[150px] truncate" title={ctx.project?.title}>{ctx.project?.title ?? EMPTY_DISPLAY}</span></td>
                <td className="whitespace-nowrap px-2.5 py-3">{ctx.organization || EMPTY_DISPLAY}</td>
                <td className="whitespace-nowrap px-2.5 py-3">{m.dateOfJoining ? formatDate(m.dateOfJoining) : EMPTY_DISPLAY}</td>
                <td className="px-2.5 py-3"><Badge tone={m.hrType === 'contractual' ? 'solid' : 'success'}>{hrTypeLabel(m.hrType)}</Badge></td>
                <td className="px-2.5 py-3">
                  <div className="flex items-center justify-center gap-4">
                    <Link to={`/people/${m.id}`} aria-label={`View ${m.name}`} title="View" className="text-white hover:text-info"><Eye size={18} /></Link>
                    <Link to={`/people/${m.id}/edit`} aria-label={`Edit ${m.name}`} title="Edit" className="text-white hover:text-info"><Pencil size={17} /></Link>
                  </div>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-14 text-center text-muted"><UserSearch size={28} className="mx-auto mb-2" />No HR members match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted">Showing {from}–{to} of {filtered.length} HR members</p>
        <div className="flex items-center gap-2">
          <PageBtn aria-label="Previous page" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft size={16} /></PageBtn>
          {pages.map((p, i) => (
            <span key={p} className="flex items-center gap-2">
              {i > 0 && p - pages[i - 1] > 1 && <span className="text-muted">…</span>}
              <PageBtn active={p === current} onClick={() => setPage(p)}>{p}</PageBtn>
            </span>
          ))}
          <PageBtn aria-label="Next page" disabled={current === pageCount} onClick={() => setPage(current + 1)}><ChevronRight size={16} /></PageBtn>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-line bg-surface/60 p-4">
      <span className={cn('grid h-14 w-14 place-items-center rounded-full ring-2 ring-primary/40', tone)}><Icon size={24} /></span>
      <div><p className="text-sm">{label}</p><p className="text-3xl font-bold leading-tight">{value}</p></div>
    </div>
  );
}

function PageBtn({ active, className, ...rest }: { active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn('grid h-9 min-w-9 place-items-center rounded-md border px-2 text-sm transition disabled:opacity-40', active ? 'border-primary bg-primary text-white' : 'border-line hover:bg-surface', className)}
      {...rest}
    />
  );
}
