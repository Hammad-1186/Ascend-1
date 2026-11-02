import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Logo from './Logo';
import { CURRENT_USER } from '../../mocks/currentUser';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { pathname } = useLocation();

  // Close the mobile drawer after navigating, and whenever we leave mobile width.
  useEffect(() => { setDrawerOpen(false); }, [pathname, isMobile]);

  return (
    <div className="app-bg flex h-full flex-col md:flex-row">
      {isMobile && (
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-sidebar-from px-4">
          <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open menu" aria-expanded={drawerOpen} className="grid h-9 w-9 place-items-center rounded-md text-white hover:bg-white/10">
            <Menu size={22} />
          </button>
          <Logo className="h-7 w-7" />
          <span className="text-[15px] font-semibold">ASCEND Lab Systems</span>
        </header>
      )}
      {/* TODO(api): replace CURRENT_USER with the auth context user, wire onLogout to auth. */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        user={CURRENT_USER}
        onLogout={() => {}}
        mobile={isMobile}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  );
}
