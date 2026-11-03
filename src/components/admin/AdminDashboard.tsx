import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { OverviewTab } from './OverviewTab';
import { UsersTab } from './UsersTab';
import { VehiclesTab } from './VehiclesTab';
import { AnalyticsTab } from './AnalyticsTab';
import { PlansTab } from './PlansTab';
import { BannersTab } from './BannersTab';
import { BlogsTab } from './BlogsTab';
import { MasterDataTab } from './MasterDataTab';
import { ModerationTab } from './ModerationTab';
import { BrandLogo } from '../common/BrandLogo';
import { ShieldCheck, Lock } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser, navigate, setAuthModalOpen, notifications, contactSubmissions, loginWithEmail } = useApp();

  const isAdmin = currentUser && (
    currentUser.role === 'Admin' || 
    currentUser.role === 'Super Admin' || 
    currentUser.role === 'admin' ||
    currentUser.role === 'Moderator'
  );

  // Active Tab state preserved in localStorage
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('onroadpriz_admin_tab');
      return stored || 'overview';
    } catch {
      return 'overview';
    }
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('onroadpriz_admin_tab', activeTab);
    } catch {
      // ignore
    }
  }, [activeTab]);

  // If user is not authorized staff
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 max-w-lg w-full text-center shadow-xl space-y-5 animate-in zoom-in-95">
          <div className="flex justify-center mb-1">
            <BrandLogo variant="admin" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-display">
              Staff Authentication Required
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              The OnRoadPriz Enterprise Administrative Console is restricted to verified staff administrators and moderators. Please sign in with staff credentials to continue.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Return to Marketplace
            </button>
            <button
              onClick={() => loginWithEmail('admin@onroadpriz.com', 'admin123')}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              One-Click Staff Sign-In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length || 3;
  const newContactsCount = contactSubmissions.filter(c => !c.status || c.status === 'new').length;

  // Key quick-nav tabs for mobile pill bar
  const mobileQuickTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'users', label: 'Users' },
    { id: 'contacts', label: 'Inquiries' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'plans', label: 'Plans' },
    { id: 'reports', label: 'Reports' },
    { id: 'master-data', label: 'Master Data' },
    { id: 'banners', label: 'Banners' },
    { id: 'blogs', label: 'Blogs' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      {/* Top Admin Header Bar */}
      <AdminHeader
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenNotifications={() => setActiveTab('notifications')}
        unreadNotificationsCount={unreadCount}
        onSelectNav={(tab) => setActiveTab(tab)}
        onToggleMobileMenu={() => setMobileDrawerOpen(!mobileDrawerOpen)}
      />

      {/* Main Layout: Left Sidebar + Right Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop Collapsible + Mobile Off-Canvas Drawer) */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            setActiveTab(tabId);
            setMobileDrawerOpen(false);
          }}
          collapsed={sidebarCollapsed}
          unreadNotificationsCount={unreadCount}
          newContactsCount={newContactsCount}
          mobileOpen={mobileDrawerOpen}
          onCloseMobile={() => setMobileDrawerOpen(false)}
        />

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 max-w-[1600px] w-full">
          {/* Mobile Quick-Navigation Pill Bar */}
          <div className="md:hidden sticky top-0 z-20 -mx-3.5 -mt-3.5 px-3.5 py-2.5 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-slate-200/80 mb-3.5 flex items-center gap-2">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="shrink-0 text-[11px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-slate-200/70 text-slate-700 hover:bg-slate-300 transition-colors flex items-center gap-1"
            >
              <span>Tabs</span>
              <span className="text-[10px] text-slate-500">▼</span>
            </button>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5">
              {mobileQuickTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#77101F] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && (
            <OverviewTab onSelectNav={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'users' && <UsersTab />}

          {activeTab === 'vehicles' && <VehiclesTab />}

          {activeTab === 'master-data' && <MasterDataTab />}

          {activeTab === 'analytics' && <AnalyticsTab />}

          {activeTab === 'plans' && <PlansTab />}

          {activeTab === 'banners' && <BannersTab />}

          {activeTab === 'blogs' && <BlogsTab />}

          {activeTab === 'testimonials' && (
            <ModerationTab activeSection="testimonials" />
          )}

          {activeTab === 'reports' && (
            <ModerationTab activeSection="reports" />
          )}

          {activeTab === 'contacts' && (
            <ModerationTab activeSection="contacts" />
          )}

          {activeTab === 'notifications' && (
            <ModerationTab activeSection="notifications" />
          )}

          {activeTab === 'audit' && (
            <ModerationTab activeSection="audit" />
          )}

          {activeTab === 'settings' && (
            <ModerationTab activeSection="settings" />
          )}
        </main>
      </div>
    </div>
  );
};
