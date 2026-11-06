import { LayoutDashboard, Landmark, ClipboardList, Network, Users, GraduationCap, Wrench, type LucideIcon } from 'lucide-react';

export interface NavItemDef { to: string; label: string; icon: LucideIcon }
export interface NavGroupDef { label: string; items: NavItemDef[] }

/** Sidebar structure. Add/remove items here only. */
export const NAV_GROUPS: NavGroupDef[] = [
  { label: 'Overview', items: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/commissions', label: 'Commissions', icon: Landmark },
  ] },
  { label: 'Records', items: [
    { to: '/projects', label: 'Projects', icon: ClipboardList },
    { to: '/hierarchies', label: 'Hierarchies', icon: Network },
  ] },
  { label: 'Directory', items: [
    { to: '/people', label: 'HR', icon: Users },
    { to: '/universities', label: 'Universities', icon: GraduationCap },
  ] },
  { label: 'Operations', items: [
    { to: '/equipment', label: 'Equipment', icon: Wrench },
  ] },
];
