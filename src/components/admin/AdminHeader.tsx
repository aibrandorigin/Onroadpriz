import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  ExternalLink, 
  Bell, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  X,
  Car,
  User,
  CreditCard,
  BookOpen,
  ShieldAlert,
  Mail,
  Menu
} from 'lucide-react';

interface AdminHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onSelectNav: (nav: string) => void;
  onToggleMobileMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  collapsed,
  onToggleCollapse,
  onOpenNotifications,
  unreadNotificationsCount,
  onSelectNav,
  onToggleMobileMenu
}) => {
  const { 
    currentUser, 
    logout, 
    navigate,
    users,
    vehicles,
    blogs,
    sellerPlans,
    buyerPlans,
    sellerReports,
    contactSubmissions
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Global search filtering across entities
  const q = searchQuery.toLowerCase().trim();
  
  const matchedUsers = q ? users.filter(u => 
    (u.name && u.name.toLowerCase().includes(q)) ||
    (u.email && u.email.toLowerCase().includes(q)) ||
    (u.phone && u.phone.includes(q))
  ).slice(0, 4) : [];

  const matchedVehicles = q ? vehicles.filter(v =>
    v.title.toLowerCase().includes(q) ||
    v.brand.toLowerCase().includes(q) ||
    v.model.toLowerCase().includes(q) ||
    v.id.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const matchedPlans = q ? [...sellerPlans, ...buyerPlans].filter(p =>
    p.name.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedBlogs = q ? blogs.filter(b =>
    b.title.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedReports = q ? sellerReports.filter(r =>
    (r.reason && r.reason.toLowerCase().includes(q)) ||
    (r.vehicleTitle && r.vehicleTitle.toLowerCase().includes(q)) ||
    (r.sellerName && r.sellerName.toLowerCase().includes(q))
  ).slice(0, 3) : [];

  const matchedContacts = q ? contactSubmissions.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.subject.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const hasResults = matchedUsers.length > 0 || 
    matchedVehicles.length > 0 || 
    matchedPlans.length > 0 || 
    matchedBlogs.length > 0 || 
    matchedReports.length > 0 || 
    matchedContacts.length > 0;

  const handleSelectResult = (navTab: string) => {
    onSelectNav(navTab);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  const adminName = currentUser?.name || 'Super Admin';
  const adminEmail = currentUser?.email || 'admin@onroadpriz.com';
  const initials = adminName
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SA';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left side: Collapse toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="Open Admin Navigation"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:inline-flex p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Global Search Bar */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Global Search (Users, Vehicles, Blogs, Plans, Fraud Reports)..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#77101F] focus:bg-white focus:ring-1 focus:ring-[#77101F]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Modal */}
          {isSearchFocused && searchQuery.trim() && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/10" 
                onClick={() => setIsSearchFocused(false)} 
              />
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 max-h-96 overflow-y-auto space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Search Results for "{searchQuery}"
                </div>

                {!hasResults && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No records found matching your query.
                  </div>
                )}

                {matchedUsers.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
                      <User className="w-3 h-3 text-blue-600" /> Users ({matchedUsers.length})
                    </span>
                    {matchedUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => handleSelectResult('users')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">{u.name} <span className="text-slate-400 font-normal">({u.email})</span></span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{u.role}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchedVehicles.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
                      <Car className="w-3 h-3 text-[#77101F]" /> Vehicles ({matchedVehicles.length})
                    </span>
                    {matchedVehicles.map(v => (
                      <button
                        key={v.id}
                        onClick={() => handleSelectResult('vehicles')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">{v.title}</span>
                        <span className="text-[10px] text-[#77101F] font-bold">₹{v.price.toLocaleString('en-IN')}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchedPlans.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-purple-600" /> Plans ({matchedPlans.length})
                    </span>
                    {matchedPlans.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectResult('plans')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="text-[10px] text-purple-700 font-bold">₹{p.price}</span>
                      </button>
                    ))}
                  </div>
                )}

                {matchedReports.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-600" /> Reports ({matchedReports.length})
                    </span>
                    {matchedReports.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleSelectResult('reports')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">{r.reason}</span>
                        <span className="text-[10px] text-rose-700 font-bold">{r.status || 'Open'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side: Live Marketplace, Notifications, Admin profile, Logout */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Live Marketplace link */}
        <button
          onClick={() => navigate('/buy')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>Live Marketplace</span>
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Admin Avatar & Details */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#77101F] text-white flex items-center justify-center text-xs font-black shadow-xs">
            {initials}
          </div>
          <div className="hidden md:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-900">{adminName}</div>
            <div className="text-[11px] text-slate-400 font-normal truncate max-w-[130px]">{adminEmail}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Sign out from Admin Console"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
