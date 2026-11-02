import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { CURRENT_USER } from '../../mocks/currentUser';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="app-bg flex h-full">
      {/* TODO(api): replace CURRENT_USER with the auth context user, wire onLogout to auth. */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} user={CURRENT_USER} onLogout={() => {}} />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  );
}
