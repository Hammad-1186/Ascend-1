import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronRight, LogOut, type LucideIcon } from 'lucide-react';
import { NAV_GROUPS } from '../../config/navigation';
import { cn } from '../../lib';
import type { CurrentUser } from '../../mocks/currentUser';
import ThemeToggle from './ThemeToggle';

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="h-9 w-9 shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#logo-g)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4 4 10l12 6 12-6z" /><path d="M4 16l12 6 12-6" /><path d="M4 22l12 6 12-6" />
      </g>
    </svg>
  );
}

function SectionLabel({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
  if (collapsed) return <div className="mx-4 mt-4 h-px bg-line" />;
  return (
    <div className="flex items-center gap-2 px-5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
      <span>{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

function NavItem({ to, label, icon: Icon, collapsed }: { to: string; label: string; icon: LucideIcon; collapsed: boolean }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'mx-2.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
          isActive
            ? 'bg-gradient-to-r from-primary to-primary-2 font-medium text-white shadow-lg shadow-primary/30'
            : 'text-muted hover:bg-white/5 hover:text-white',
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

interface Props { collapsed: boolean; onToggle: () => void; user: CurrentUser; onLogout: () => void }

/** `user` = { name, role } - static now, from auth context later. */
export default function Sidebar({ collapsed, onToggle, user, onLogout }: Props) {
  return (
    <aside className={cn('flex h-full shrink-0 flex-col border-r border-line bg-gradient-to-b from-sidebar-from to-sidebar-to transition-[width]', collapsed ? 'w-[76px]' : 'w-[230px]')}>
      <div className={cn('flex items-center gap-2.5 px-4 py-4', collapsed && 'flex-col')}>
        <Logo />
        {!collapsed && <span className="flex-1 text-[15px] font-semibold leading-tight">ASCEND Lab<br />Systems</span>}
        <button type="button" onClick={onToggle} aria-label="Toggle sidebar" className="text-muted hover:text-white">
          <ChevronsLeft size={16} className={cn(collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto pb-2">
        {NAV_GROUPS.map((g) => (
          <div key={g.label}>
            <SectionLabel collapsed={collapsed}>{g.label}</SectionLabel>
            <div className="mt-1 flex flex-col gap-0.5">
              {g.items.map((i) => <NavItem key={i.to} {...i} collapsed={collapsed} />)}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-3 p-3">
        <ThemeToggle collapsed={collapsed} />
        <div className={cn('flex items-center gap-2.5 px-1', collapsed && 'flex-col')}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold ring-2 ring-primary-2/60">
            {user.name.charAt(0).toUpperCase()}
          </span>
          {!collapsed && (
            <div className="flex-1 leading-tight">
              <p className="text-sm font-semibold">{user.name}</p>
              <span className="mt-1 inline-block rounded-full bg-primary-soft px-2 text-[10px] font-semibold text-info">{user.role}</span>
            </div>
          )}
          <button type="button" onClick={onLogout} aria-label="Log out" className="text-muted hover:text-white"><LogOut size={16} /></button>
        </div>
      </div>
    </aside>
  );
}
