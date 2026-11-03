import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Users, 
  Car, 
  BarChart3, 
  CreditCard, 
  Image as ImageIcon, 
  BookOpen, 
  MessageSquare, 
  ShieldAlert, 
  Mail, 
  Bell, 
  Clock, 
  Settings, 
  ArrowUpDown, 
  FolderTree, 
  X, 
  ShieldCheck 
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  collapsed: boolean;
  unreadNotificationsCount?: number;
  newContactsCount?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  unreadNotificationsCount = 3,
  newContactsCount = 0,
  mobileOpen = false,
  onCloseMobile
}) => {
  const [isReordering, setIsReordering] = useState(false);

  // 13 Navigation items in exact order as screenshot reference
  const navItems: NavItemConfig[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'master-data', label: 'Master Data', icon: FolderTree },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'plans', label: 'Plans', icon: CreditCard },
    { id: 'banners', label: 'Banners Management', icon: ImageIcon },
    { id: 'blogs', label: 'Blogs Management', icon: BookOpen },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'reports', label: 'Seller Reports', icon: ShieldAlert },
    { id: 'contacts', label: 'Contact Submissions', icon: Mail, badgeCount: newContactsCount },
    { id: 'notifications', label: 'Notifications', icon: Bell, badgeCount: unreadNotificationsCount },
    { id: 'audit', label: 'Audit Logs', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleMobileNavClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* MOBILE DRAWER (Only rendered on mobile when mobileOpen is true) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200 border-r border-slate-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <BrandLogo variant="admin" />
              </div>
              <button 
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Staff Badge in Drawer */}
            <div className="px-4 py-3 bg-[#77101F]/5 border-b border-[#77101F]/10 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#77101F] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                OP
              </div>
              <div className="leading-tight overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">Admin Console</div>
                <div className="text-[10px] text-[#77101F] font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Staff Portal</span>
                </div>
              </div>
            </div>

            {/* Navigation items */}
            <nav className="p-3 space-y-1 overflow-y-auto flex-1">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Menu Navigation
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                      isActive
                        ? 'bg-[#77101F] text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="flex-1 text-left truncate">{item.label}</span>

                    {item.badgeCount && item.badgeCount > 0 ? (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white text-[#77101F]'
                            : 'bg-red-600 text-white shadow-2xs'
                        }`}
                      >
                        {item.badgeCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-3.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
              <span>OnRoadPriz v2.4</span>
              <span className="text-[10px] text-slate-400">Staff Console</span>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (Hidden on mobile devices) */}
      <aside 
        className={`hidden md:flex bg-white border-r border-slate-200/80 flex-col shrink-0 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
      {/* Header bar: NAVIGATION and Reorder */}
      {!collapsed ? (
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            NAVIGATION
          </span>
          <button
            onClick={() => setIsReordering(!isReordering)}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
            title="Toggle reordering mode"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>Reorder</span>
          </button>
        </div>
      ) : (
        <div className="py-4 text-center border-b border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            NAV
          </span>
        </div>
      )}

      {/* Nav List */}
      <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                isActive
                  ? 'bg-[#77101F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              
              {!collapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}

              {/* Notification Badge */}
              {item.badgeCount && item.badgeCount > 0 ? (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white text-[#77101F]'
                      : 'bg-red-600 text-white shadow-2xs'
                  } ${collapsed ? 'absolute -top-1 -right-1' : ''}`}
                >
                  {item.badgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>OnRoadPriz Console</span>
          <span className="font-bold text-slate-500">v2.4.0</span>
        </div>
      )}
    </aside>
  </>
);
};
