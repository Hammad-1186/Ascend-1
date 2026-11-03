import { useEffect, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronRight, LogOut, X, type LucideIcon } from 'lucide-react';
import { NAV_GROUPS } from '../../config/navigation';
import { cn } from '../../lib';
import type { CurrentUser } from '../../mocks/currentUser';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

function SectionLabel({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
  if (collapsed) return <div className="mx-4 mt-4 h-px bg-line" />;
  return (
    <div className="flex items-center gap-2 px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
      <span>{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function NavItem({ to, label, icon: Icon, collapsed, onNavigate }: { to: string; label: string; icon: LucideIcon; collapsed: boolean; onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'mx-2.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
          isActive
            ? 'bg-gradient-to-r from-primary to-primary-2 font-medium text-white shadow-lg shadow-primary/30'
            : 'text-muted hover:bg-ink/5 hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className="shrink-0" />
          {!collapsed && <span className="flex-1">{label}</span>}
          {!collapsed && isActive && <ChevronRight size={15} />}
        </>
      )}
    </NavLink>
  );
}

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  user: CurrentUser;
  onLogout: () => void;
  /** Phone layout: the sidebar becomes an off-canvas drawer opened from the hamburger button. */
  mobile: boolean;
  open: boolean;
  onClose: () => void;
}

/** `user` = { name, role } - static now, from auth context later. */
export default function Sidebar({ collapsed: collapsedProp, onToggle, user, onLogout, mobile, open, onClose }: Props) {
  const collapsed = collapsedProp && !mobile; // the drawer is always full width

  useEffect(() => {
    if (!mobile || !open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobile, open, onClose]);

  return (
    <>
      {mobile && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className={cn('fixed inset-0 z-30 bg-black/60 transition-opacity duration-200', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
        />
      )}
      <aside
        aria-hidden={mobile && !open ? true : undefined}
        className={cn(
          'flex h-full shrink-0 flex-col border-r border-line bg-gradient-to-b from-sidebar-from to-sidebar-to',
          mobile
            ? cn('fixed inset-y-0 left-0 z-40 w-[260px] transition-[transform,visibility] duration-200', open ? 'visible translate-x-0' : 'invisible -translate-x-full')
            : cn('transition-[width]', collapsed ? 'w-[76px]' : 'w-[230px]'),
        )}
      >
        <div className={cn('flex items-center gap-2.5 px-4 py-4', collapsed && 'flex-col')}>
          <Logo />
          {!collapsed && <span className="flex-1 text-[15px] font-semibold leading-tight">ASCEND Lab<br />Systems</span>}
          {mobile ? (
            <button type="button" onClick={onClose} aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-md text-muted hover:text-ink"><X size={20} /></button>
          ) : (
            <button type="button" onClick={onToggle} aria-label="Toggle sidebar" className="text-muted hover:text-ink">
              <ChevronsLeft size={16} className={cn(collapsed && 'rotate-180')} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto pb-2">
          {NAV_GROUPS.map((g) => (
            <div key={g.label}>
              <SectionLabel collapsed={collapsed}>{g.label}</SectionLabel>
              <div className="mt-1 flex flex-col gap-0.5">
                {g.items.map((i) => <NavItem key={i.to} {...i} collapsed={collapsed} onNavigate={mobile ? onClose : undefined} />)}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-3 p-3">
          <ThemeToggle collapsed={collapsed} />
          <div className={cn('flex items-center gap-2.5 px-1', collapsed && 'flex-col')}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-white ring-2 ring-primary-2/60">
              {user.name.charAt(0).toUpperCase()}
            </span>
            {!collapsed && (
              <div className="flex-1 leading-tight">
                <p className="text-sm font-semibold">{user.name}</p>
                <span className="mt-1 inline-block rounded-full bg-primary-soft px-2 text-[10px] font-semibold text-info">{user.role}</span>
              </div>
            )}
            <button type="button" onClick={onLogout} aria-label="Log out" className="text-muted hover:text-ink"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}
