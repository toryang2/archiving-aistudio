import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Files, 
  GitBranch, 
  Users, 
  Settings, 
  History, 
  CheckCircle, 
  XCircle, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  Plus,
  X
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenNewPropertyModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile = false,
  onCloseMobile,
  onOpenNewPropertyModal,
}) => {
  const { activeTab, setActiveTab, taxDeclarations, settings, currentUser } = useApp();

  const totalCount = taxDeclarations.length;
  const currentCount = taxDeclarations.filter((t) => t.propertyState === 'CURRENT').length;
  const cancelledCount = taxDeclarations.filter((t) => t.propertyState === 'CANCELLED').length;

  const initials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'TA';

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    {
      id: 'properties',
      label: 'Real Property',
      icon: Files,
      badge: totalCount,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'lineage',
      label: 'Lineage Tree',
      icon: GitBranch,
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
    },
    {
      id: 'audit-logs',
      label: 'Audit Trail',
      icon: History,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        id="main-sidebar"
        className={`w-64 bg-white border-r border-blue-100 flex flex-col shrink-0 h-full no-print fixed md:static inset-y-0 left-0 z-40 md:z-20 transform md:transform-none transition-transform duration-200 ease-in-out overflow-hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-blue-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shadow-blue-200 shrink-0 text-xs">
              TA
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-blue-900 leading-tight truncate">TaxArchive</h1>
              <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold truncate">
                {settings.lguName || 'Assessor Portal'}
              </p>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Inventory Summary */}
        <div className="p-4 border-t border-blue-50">
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span>Archive Status</span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                {settings.psgcMunicipalityName || 'LGU'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="bg-white p-2 rounded border border-blue-50">
                <p className="text-[9px] text-slate-400 font-semibold">CURRENT</p>
                <p className="text-xs font-bold text-emerald-600">{currentCount}</p>
              </div>
              <div className="bg-white p-2 rounded border border-blue-50">
                <p className="text-[9px] text-slate-400 font-semibold">CANCELLED</p>
                <p className="text-xs font-bold text-slate-500">{cancelledCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-blue-50 bg-white">
          <div className="flex items-center gap-3 p-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{currentUser.fullName}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
