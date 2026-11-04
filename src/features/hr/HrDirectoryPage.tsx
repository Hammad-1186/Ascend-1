import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle2, ChevronLeft, ChevronRight, Eye, Pencil, Plus, RotateCcw, Search, UserSearch, Users, UsersRound, X } from 'lucide-react';
import { cn } from '../../lib';
import PageHeader from '../../components/layout/PageHeader';
import HrTypeBadge from './HrTypeBadge';
import ImageLightbox from '../../components/ui/ImageLightbox';
import { buttonClasses } from '../../components/ui/Button';
import SelectInput from '../../components/form/SelectInput';
import { useHrCatalog } from './useHrCatalog';
import { hrService } from './hrService';
import { EMPTY_DISPLAY, avatarColor, initialsOf, resolveMemberContext } from './hrFormat';
import { HR_TYPE_OPTIONS } from './hrFormConfig';
import { formatDate } from '../../utils/date';
import type { HrMember, HrType } from '../../types/hr';

/** Empty values show a quiet dash instead of competing with real data. */
const orDash = (v?: string) => (v ? v : <span className="text-muted/60">{EMPTY_DISPLAY}</span>);

const PAGE_SIZE = 5;
/** Two alternating row colours (defined for light AND dark in styles/theme.css). */
const ROW_STRIPE = 'odd:bg-row-a even:bg-row-b';

interface Filters { query: string; type: '' | HrType; theme: string; lab: string }
const NO_FILTERS: Filters = { query: '', type: '', theme: '', lab: '' };

export default function HrDirectoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { catalog } = useHrCatalog();
  const [members, setMembers] = useState<HrMember[]>([]);
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null);
  const [notice, setNotice] = useState<string>((location.state as { notice?: string } | null)?.notice ?? '');

  useEffect(() => { hrService.listMembers().then(setMembers); }, []);

  // Success message handed over by the form page. Clear the router state so a refresh doesn't show it again.
  useEffect(() => {
    if (!(location.state as { notice?: string } | null)?.notice) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const setFilter = (patch: Partial<Filters>) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); };

  const rows = useMemo(() => members.map((m) => ({ m, ctx: resolveMemberContext(m, catalog) })), [members, catalog]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return rows.filter(({ m, ctx }) =>
      (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) &&
      (!filters.type || m.hrType === filters.type) &&
      (!filters.theme || ctx.theme?.id === filters.theme) &&
      (!filters.lab || m.lab === filters.lab));
  }, [rows, filters]);

  const counts = {
    total: members.length,
    contractual: members.filter((m) => m.hrType === 'contractual').length,
    strategic: members.filter((m) => m.hrType === 'strategic').length,
  };

  const pageSize = PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const pageRows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const from = filtered.length === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, filtered.length);

  // Lab dropdown narrows to the chosen theme, mirroring the form's Theme -> Lab cascade.
  const labOptions = (catalog?.labs ?? [])
    .filter((l) => !filters.theme || l.themeId === filters.theme)
    .map((l) => ({ value: l.id, label: l.name }));
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

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => Math.abs(p - current) <= 1 || p === 1 || p === pageCount);
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS);

  return (
    <div className="px-4 py-3 sm:px-6 sm:py-4">
      <PageHeader
        title="HR Directory"
        actions={<Link to="/people/new" className={buttonClasses('primary')}><Plus size={16} /> Add HR</Link>}
      />

      {notice && (
        <div role="status" className="mb-3 flex items-center gap-2.5 rounded-lg border border-primary/40 bg-primary-soft px-4 py-3 text-base font-medium text-info">
          <CheckCircle2 size={20} className="shrink-0" />
          <span className="flex-1">{notice}</span>
          <button type="button" aria-label="Dismiss message" onClick={() => setNotice('')} className="rounded p-1 hover:bg-ink/10"><X size={16} /></button>
        </div>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard icon={UsersRound} label="Total HR Members" value={counts.total} tone="bg-primary-soft text-info" />
        <StatCard icon={Briefcase} label="Contractual" value={counts.contractual} tone="bg-primary-soft text-info" />
        <StatCard icon={UsersRound} label="Strategic" value={counts.strategic} tone="bg-emerald-600 text-white" />
      </div>

      <div className="mb-3 grid grid-cols-2 items-center gap-3 lg:grid-cols-[1.8fr_1fr_1fr_1.2fr_auto]">
        <div className="relative col-span-2 lg:col-span-1">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={filters.query}
            onChange={(e) => setFilter({ query: e.target.value })}
            placeholder="Search"
            className="h-11 w-full rounded-md border border-field-line bg-field pl-10 pr-3 text-base text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <SelectInput aria-label="HR Type" placeholder="All HR Types" options={HR_TYPE_OPTIONS} value={filters.type} onChange={(e) => setFilter({ type: e.target.value as Filters['type'] })} />
        <SelectInput aria-label="Lab" placeholder="All Labs" options={labOptions} value={filters.lab} onChange={(e) => setFilter({ lab: e.target.value })} />
        <SelectInput aria-label="Technology Theme" placeholder="All Themes" options={themeOptions} value={filters.theme} onChange={(e) => setFilter({ theme: e.target.value, lab: '' })} />
        <button type="button" onClick={() => { setFilters(NO_FILTERS); setPage(1); }} disabled={!hasFilters} className="col-span-2 inline-flex items-center gap-2 justify-self-end text-sm text-info lg:col-span-1 hover:underline disabled:opacity-40 disabled:no-underline">
          <RotateCcw size={15} /> Clear Filters
        </button>
      </div>

      {/* Same table on every screen size; on narrow screens it scrolls horizontally. */}
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-primary-soft/40 text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="w-10 px-3 py-3"><input type="checkbox" aria-label="Select all" checked={allOnPageSelected} onChange={toggleAll} className="h-4 w-4 accent-primary" /></th>
                  {['Name', 'Contact', 'Lab', 'Project', 'Organization', 'Joining Date', 'HR Type'].map((h) => <th key={h} className="whitespace-nowrap px-2 py-3">{h}</th>)}
                  <th className="whitespace-nowrap px-2 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(({ m, ctx }) => (
                  <tr key={m.id} onClick={() => navigate(`/people/${m.id}`)} className={cn('group/row cursor-pointer border-b border-line/60 last:border-0 hover:bg-primary/[0.06]', ROW_STRIPE)}>
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={`Select ${m.name}`} checked={selected.has(m.id)} onChange={() => toggleOne(m.id)} className="h-4 w-4 accent-primary" /></td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2.5">
                        {m.photo ? (
                          // Clicking the photo opens it full size (and does NOT open the member page).
                          <button type="button" aria-label={`View photo of ${m.name}`} title="View photo" onClick={(e) => { e.stopPropagation(); setPreview({ src: m.photo, name: m.name }); }} className="shrink-0 cursor-zoom-in rounded-full ring-primary/60 transition hover:ring-2">
                            <img src={m.photo} alt="" className="h-9 w-9 rounded-full object-cover" />
                          </button>
                        ) : (
                          <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-white', avatarColor(m.name || m.id))}>{initialsOf(m.name)}</span>
                        )}
                        <Link to={`/people/${m.id}`} className="min-w-0 leading-tight">
                          <span className="block whitespace-nowrap font-semibold text-info group-hover/row:underline">{m.name || 'Unnamed'}</span>
                          <span className="block whitespace-nowrap text-xs text-muted">{m.email || EMPTY_DISPLAY}</span>
                        </Link>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 tabular-nums text-ink/90">{orDash(m.phone)}</td>
                    <td className="whitespace-nowrap px-2 py-3 font-mono text-[13px] font-medium">{orDash(ctx.lab?.name)}</td>
                    <td className="px-2 py-3"><span className="block min-w-[150px] max-w-[230px] leading-snug text-ink/90">{orDash(ctx.project?.title)}</span></td>
                    <td className="whitespace-nowrap px-2 py-3 text-ink/90">{orDash(ctx.organization)}</td>
                    <td className="whitespace-nowrap px-2 py-3 tabular-nums text-muted">{orDash(m.dateOfJoining ? formatDate(m.dateOfJoining) : undefined)}</td>
                    <td className="px-2 py-3"><HrTypeBadge type={m.hrType} /></td>
                    <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Link to={`/people/${m.id}`} aria-label={`View ${m.name}`} title="View" className="rounded-md p-1.5 text-muted transition hover:bg-primary/10 hover:text-info"><Eye size={18} /></Link>
                        <Link to={`/people/${m.id}/edit`} aria-label={`Edit ${m.name}`} title="Edit" className="rounded-md p-1.5 text-muted transition hover:bg-primary/10 hover:text-info"><Pencil size={17} /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr><td colSpan={9}><EmptyState /></td></tr>
                )}
              </tbody>
            </table>
          </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Showing {from}–{to} of {filtered.length} HR members</p>
        <div className="flex items-center gap-2 self-center sm:self-auto">
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
      {preview && <ImageLightbox src={preview.src} title={preview.name} onClose={() => setPreview(null)} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-4 py-14 text-center text-muted">
      <UserSearch size={28} className="mx-auto mb-2" />No HR members match these filters.
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: number; tone: string }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-lg border border-line bg-surface/60 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full ring-2 ring-primary/40 sm:h-14 sm:w-14', tone)}><Icon size={18} className="sm:h-6 sm:w-6" /></span>
      <div className="min-w-0"><p className="text-xs leading-tight sm:text-sm">{label}</p><p className="text-2xl font-bold leading-tight sm:text-3xl">{value}</p></div>
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
