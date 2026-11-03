import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VEHICLE_CATEGORIES } from '../../data/constants';
import { BrandLogo } from '../common/BrandLogo';
import { 
  MapPin, 
  Heart, 
  ChevronDown, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  Car, 
  FileText, 
  CreditCard, 
  ShieldCheck, 
  LayoutDashboard, 
  Menu, 
  X,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentRoute, 
    navigate, 
    selectedCity, 
    selectedLocality,
    confirmedLocation,
    setLocationModalOpen,
    wishlist,
    compareList,
    currentUser,
    logout,
    setAuthModalOpen,
    setActiveCategoryFilter,
    settings,
    checkSellerAccess,
    setAuthReturnTo,
    showToast
  } = useApp();

  const [buyDropdownOpen, setBuyDropdownOpen] = useState(false);
  const [plansDropdownOpen, setPlansDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePlansExpanded, setMobilePlansExpanded] = useState(false);

  const buyDropdownRef = useRef<HTMLDivElement>(null);
  const plansDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const handleSellClick = () => {
    const access = checkSellerAccess();
    if (!access.granted) {
      if (access.reason === 'AUTH_REQUIRED') {
        setAuthReturnTo('/sell');
        setAuthModalOpen(true);
        showToast('Sign In Required', 'Please sign in to list your vehicle.', 'info');
        return;
      }
      showToast('Seller Plan Required', 'An active Seller Plan is required to list your vehicle.', 'warning');
      navigate('/plans/seller?returnTo=/sell');
      return;
    }
    navigate('/sell');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (buyDropdownRef.current && !buyDropdownRef.current.contains(e.target as Node)) {
        setBuyDropdownOpen(false);
      }
      if (plansDropdownRef.current && !plansDropdownRef.current.contains(e.target as Node)) {
        setPlansDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayLocation = selectedCity
    ? (selectedLocality && selectedLocality !== 'All Places'
      ? `${selectedLocality}, ${selectedCity}`
      : selectedCity)
    : (confirmedLocation?.city || 'Select Location');

  const handleCategorySelect = (categoryLabel: string | null) => {
    setActiveCategoryFilter(categoryLabel);
    setBuyDropdownOpen(false);
    navigate('/buy');
  };

  const isAdminUser = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Super Admin' || currentUser.role === 'admin');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#DCE3EC] shadow-xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 lg:h-[92px] transition-all duration-200">
          
          {/* LEFT: OnRoadPriz Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <button
              onClick={() => { setActiveCategoryFilter(null); navigate('/'); }}
              className="flex items-center text-left focus:outline-hidden py-0.5 shrink-0"
              aria-label="OnRoadPriz Home"
            >
              <BrandLogo variant="header" />
            </button>
          </div>

          {/* CENTER / RIGHT NAVIGATION */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Location Selector (Trussets layout) */}
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#DCE3EC] hover:border-[#77101F] bg-[#F7F9FC] hover:bg-white text-[#101828] text-xs font-semibold transition-all shadow-2xs group"
              title="Click to change city & locality"
            >
              <MapPin className="w-3.5 h-3.5 text-[#77101F] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="max-w-[170px] truncate font-bold text-[#101828]">
                {displayLocation}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#667085] shrink-0" />
            </button>

            {/* Home */}
            <button
              onClick={() => { setActiveCategoryFilter(null); navigate('/'); }}
              className={`text-xs font-bold tracking-wide transition-colors ${
                currentRoute === '/' || currentRoute === ''
                  ? 'text-[#77101F]'
                  : 'text-[#101828] hover:text-[#77101F]'
              }`}
            >
              Home
            </button>

            {/* Buy Vehicles Dropdown */}
            <div className="relative" ref={buyDropdownRef}>
              <button
                type="button"
                onClick={() => setBuyDropdownOpen(!buyDropdownOpen)}
                className={`flex items-center gap-1 text-xs font-bold tracking-wide transition-colors ${
                  currentRoute.startsWith('/buy')
                    ? 'text-[#77101F]'
                    : 'text-[#101828] hover:text-[#77101F]'
                }`}
              >
                <span>Buy Vehicles</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${buyDropdownOpen ? 'rotate-180 text-[#77101F]' : 'text-[#667085]'}`} />
              </button>

              {buyDropdownOpen && (
                <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-[#DCE3EC] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-[#DCE3EC]/60 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#98A2B3]">
                      Vehicle Categories
                    </p>
                  </div>
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-[#101828] hover:text-[#77101F] hover:bg-[#F5F7FA] rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>All Vehicle Types</span>
                    <span className="text-[10px] text-[#98A2B3]">100% Direct</span>
                  </button>
                  {VEHICLE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.label)}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-[#101828] hover:text-[#77101F] hover:bg-[#F5F7FA] rounded-xl transition-colors flex items-center justify-between"
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sell Vehicle */}
            <button
              onClick={handleSellClick}
              className={`text-xs font-bold tracking-wide transition-colors ${
                currentRoute === '/sell'
                  ? 'text-[#77101F]'
                  : 'text-[#101828] hover:text-[#77101F]'
              }`}
            >
              Sell Vehicle
            </button>

            {/* Plans Dropdown (Buyer Plans & Seller Plans) */}
            <div className="relative" ref={plansDropdownRef}>
              <button
                onClick={() => setPlansDropdownOpen(!plansDropdownOpen)}
                className={`flex items-center gap-1.5 text-xs font-bold tracking-wide transition-colors ${
                  currentRoute.startsWith('/plans')
                    ? 'text-[#77101F]'
                    : 'text-[#101828] hover:text-[#77101F]'
                }`}
              >
                <span>Plans</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${plansDropdownOpen ? 'rotate-180 text-[#77101F]' : 'text-[#667085]'}`} />
              </button>

              {plansDropdownOpen && (
                <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-[#DCE3EC] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                  <button
                    onClick={() => { setPlansDropdownOpen(false); navigate('/plans/buyer'); }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#F7F9FC] transition-colors group/item"
                  >
                    <div className="font-bold text-xs text-[#101828] group-hover/item:text-[#77101F]">
                      Buyer Plans
                    </div>
                    <div className="text-[11px] text-[#667085] mt-0.5">
                      Unlock owner contacts, RC verification & vehicle reports
                    </div>
                  </button>

                  <button
                    onClick={() => { setPlansDropdownOpen(false); navigate('/plans/seller'); }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#F7F9FC] transition-colors group/item"
                  >
                    <div className="font-bold text-xs text-[#101828] group-hover/item:text-[#77101F]">
                      Seller Plans
                    </div>
                    <div className="text-[11px] text-[#667085] mt-0.5">
                      Post listings, get verified badges & priority placement
                    </div>
                  </button>

                  <div className="border-t border-[#DCE3EC]/70 pt-1">
                    <button
                      onClick={() => { setPlansDropdownOpen(false); navigate('/plans'); }}
                      className="w-full text-left px-3 py-2 text-[11px] font-bold text-[#77101F] hover:bg-[#77101F]/5 rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>Compare All Plans</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Mobile Location Selector */}
            <button
              onClick={() => setLocationModalOpen(true)}
              className="lg:hidden flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border border-[#DCE3EC] bg-[#F7F9FC] text-[#101828] shrink-0"
            >
              <MapPin className="w-2.5 h-2.5 text-[#77101F] shrink-0" />
              <span className="max-w-[70px] xs:max-w-[85px] sm:max-w-[100px] truncate font-bold">{displayLocation}</span>
            </button>

            {/* Wishlist Heart */}
            <button
              onClick={() => navigate('/wishlist')}
              className="relative p-1.5 sm:p-2 text-[#101828] hover:text-[#77101F] hover:bg-[#F5F7FA] rounded-full transition-colors shrink-0"
              title="Saved Vehicles"
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlist.length > 0 ? 'text-[#77101F] fill-[#77101F]' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#77101F] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Profile Button - Direct navigation to /profile per user specification */}
            {currentUser ? (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1 sm:gap-2 p-0.5 sm:pl-2 sm:pr-3 sm:py-1 rounded-full border border-[#DCE3EC] hover:border-[#77101F] bg-white transition-all shadow-2xs hover:shadow-xs group shrink-0"
                title="View My Profile & Plans"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#77101F] text-white flex items-center justify-center font-bold text-[11px] sm:text-xs shrink-0 group-hover:scale-105 transition-transform">
                  {(currentUser.name || currentUser.fullName || currentUser.phone || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline-block text-xs font-bold text-[#101828] max-w-[90px] truncate group-hover:text-[#77101F] transition-colors">
                  {(currentUser.name || currentUser.fullName || currentUser.phone || 'User').split(' ')[0]}
                </span>
                <span className="hidden md:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#77101F]/10 text-[#77101F]">
                  Profile
                </span>
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-[11px] sm:text-xs font-bold px-2.5 sm:px-4 py-1 sm:py-2 text-[#101828] hover:text-[#77101F] hover:bg-[#F5F7FA] rounded-full border border-[#DCE3EC] transition-colors shrink-0"
              >
                Log In
              </button>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-[#101828] hover:text-[#77101F] rounded-lg shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#DCE3EC] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
            <BrandLogo variant="mobile" />
            <button
              onClick={() => { setMobileMenuOpen(false); setLocationModalOpen(true); }}
              className="text-xs font-bold text-[#77101F] flex items-center gap-1 bg-[#77101F]/5 px-3 py-1 rounded-full shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{displayLocation}</span>
            </button>
          </div>

          <div className="space-y-1.5 text-xs font-bold">
            {currentUser && (
              <button
                onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-[#77101F] text-white font-bold flex items-center justify-between shadow-xs mb-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white text-[#77101F] flex items-center justify-center text-[10px] font-black">
                    {(currentUser.name || currentUser.fullName || currentUser.phone || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span>My Profile & Plans</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Dashboard →</span>
              </button>
            )}

            <button
              onClick={() => { setActiveCategoryFilter(null); navigate('/'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2.5 px-3 rounded-xl bg-[#F7F9FC] text-[#101828] hover:bg-[#77101F] hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => { setActiveCategoryFilter(null); navigate('/buy'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2.5 px-3 rounded-xl bg-[#F7F9FC] text-[#101828] hover:bg-[#77101F] hover:text-white transition-colors"
            >
              Buy Vehicles
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSellClick();
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl bg-[#F7F9FC] text-[#101828] hover:bg-[#77101F] hover:text-white transition-colors"
            >
              Sell Vehicle
            </button>

            {/* Plans Expandable Accordion */}
            <div className="bg-[#F7F9FC] rounded-xl overflow-hidden">
              <button
                onClick={() => setMobilePlansExpanded(!mobilePlansExpanded)}
                className="w-full flex items-center justify-between py-2.5 px-3 text-[#101828] hover:text-[#77101F] transition-colors"
              >
                <span>Plans</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobilePlansExpanded ? 'rotate-180 text-[#77101F]' : ''}`} />
              </button>

              {mobilePlansExpanded && (
                <div className="bg-white border-t border-[#DCE3EC]/70 p-2 space-y-1 pl-4 animate-in fade-in">
                  <button
                    onClick={() => { navigate('/plans/buyer'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 text-xs font-semibold text-[#101828] hover:text-[#77101F] rounded-lg hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Buyer Plans</span>
                    <span className="text-[10px] text-[#667085]">Unlock Contacts</span>
                  </button>
                  <button
                    onClick={() => { navigate('/plans/seller'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 px-3 text-xs font-semibold text-[#101828] hover:text-[#77101F] rounded-lg hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Seller Plans</span>
                    <span className="text-[10px] text-[#667085]">Post Listings</span>
                  </button>
                  <button
                    onClick={() => { navigate('/plans'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-1.5 px-3 text-[11px] font-bold text-[#77101F] hover:underline"
                  >
                    Compare All Plans →
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => { navigate('/blogs'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2.5 px-3 rounded-xl bg-[#F7F9FC] text-[#101828] hover:bg-[#77101F] hover:text-white transition-colors"
            >
              Automotive Blogs & News
            </button>
            <button
              onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2.5 px-3 rounded-xl bg-[#F7F9FC] text-[#101828] hover:bg-[#77101F] hover:text-white transition-colors"
            >
              Contact Support
            </button>

            {isAdminUser && (
              <button
                onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl bg-amber-100 text-amber-900 font-bold flex items-center justify-between"
              >
                <span>Admin Console</span>
                <LayoutDashboard className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
