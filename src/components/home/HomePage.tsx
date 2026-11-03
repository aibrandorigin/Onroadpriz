import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { VehicleCard } from '../marketplace/VehicleCard';
import { QuickViewModal } from '../marketplace/QuickViewModal';
import { resolveCanonicalCity } from '../../data/locationData';
import { 
  Search, 
  MapPin, 
  Car, 
  Bike, 
  Truck, 
  Bus, 
  Tractor, 
  Wrench, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Check, 
  Sparkles, 
  FileCheck2, 
  PhoneCall, 
  BadgePercent,
  CheckCircle2,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  Star
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { 
    vehicles, 
    blogs, 
    testimonials, 
    navigate, 
    setActiveCategoryFilter, 
    selectedCity, 
    selectedLocality,
    setLocationModalOpen,
    setSelectedBlogSlug
  } = useApp();

  const [intentTab, setIntentTab] = useState<'buy' | 'sell'>('buy');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [quickViewVehicle, setQuickViewVehicle] = useState<Vehicle | null>(null);

  const activeCityName = useMemo(() => {
    if (!selectedCity || selectedCity === 'All India' || selectedCity === 'All Cities') {
      return '';
    }
    return resolveCanonicalCity(selectedCity);
  }, [selectedCity]);

  const displayLocation = activeCityName || 'All India';

  // Filter vehicles by status and detected/selected city (city-wide, not restricted to sub-locality)
  const publishedVehicles = useMemo(() => {
    const allPublished = vehicles.filter(v => v.status === 'Published');
    if (!activeCityName) return allPublished;
    const targetCity = activeCityName.toLowerCase();
    return allPublished.filter(v => {
      const vCity = resolveCanonicalCity(v.location?.city || v.city || '', v.location?.area).toLowerCase();
      return vCity && (vCity.includes(targetCity) || targetCity.includes(vCity));
    });
  }, [vehicles, activeCityName]);

  const featuredVehicles = useMemo(() => {
    // Show featured vehicles in the selected city (or all vehicles in that city if fewer are marked featured)
    const featuredInSelection = publishedVehicles.filter(v => v.isFeatured || v.featured);
    if (featuredInSelection.length >= publishedVehicles.length || featuredInSelection.length >= 6) {
      return featuredInSelection.slice(0, 6);
    }
    const nonFeaturedInSelection = publishedVehicles.filter(v => !v.isFeatured && !v.featured);
    return [...featuredInSelection, ...nonFeaturedInSelection].slice(0, 6);
  }, [publishedVehicles]);

  const recentListings = useMemo(() => {
    return [...publishedVehicles].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 6);
  }, [publishedVehicles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (intentTab === 'sell') {
      navigate('/sell');
      return;
    }
    navigate('/buy');
  };

  const handleCategoryCardClick = (categoryLabel: string) => {
    setActiveCategoryFilter(categoryLabel);
    navigate('/buy');
  };

  const handlePopularSearchChip = (tag: string) => {
    if (tag === 'Cars') setActiveCategoryFilter('Cars');
    else if (tag === 'Bikes') setActiveCategoryFilter('Bikes & Scooters');
    else if (tag === 'Commercial' || tag === 'Trucks') setActiveCategoryFilter('Trucks & Lorries');
    else setActiveCategoryFilter(null);
    navigate('/buy');
  };

  // Section 7: 6 Catalog Cards
  const catalogCategories = [
    {
      id: 'cars',
      title: 'Cars',
      subtitle: 'Hatchbacks, Sedans, SUVs & Luxury cars',
      filterLabel: 'Cars',
      icon: <Car className="w-6 h-6 text-[#77101F]" />,
      count: publishedVehicles.filter(v => v.category === 'Cars' || v.category === 'cars').length
    },
    {
      id: 'bikes',
      title: 'Bikes & Scooters',
      subtitle: 'Commuters, Sports, Cruisers & EVs',
      filterLabel: 'Bikes & Scooters',
      icon: <Bike className="w-6 h-6 text-[#77101F]" />,
      count: publishedVehicles.filter(v => v.category === 'Bikes & Scooters' || v.category === 'bikes').length
    },
    {
      id: 'trucks',
      title: 'Trucks & Lorries',
      subtitle: 'Light, Medium & Heavy commercial transport',
      filterLabel: 'Trucks & Lorries',
      icon: <Truck className="w-6 h-6 text-[#77101F]" />,
      count: publishedVehicles.filter(v => v.category === 'Trucks & Lorries' || v.category === 'trucks').length
    },
    {
      id: 'buses',
      title: 'Buses',
      subtitle: 'Staff, School, City & Luxury tour coaches',
      filterLabel: 'Buses',
      icon: <Bus className="w-6 h-6 text-[#77101F]" />,
      count: publishedVehicles.filter(v => v.category === 'Buses' || v.category === 'buses').length
    },
    {
      id: 'tractors',
      title: 'Tractors & Backhoe Loaders',
      subtitle: 'Agricultural tractors, loaders & JCBs',
      filterLabel: 'Tractors & Backhoe Loaders',
      icon: <Tractor className="w-6 h-6 text-[#77101F]" />,
      count: publishedVehicles.filter(v => v.category === 'Tractors & Backhoe Loaders' || v.category === 'jcb').length
    },
    {
      id: 'heavy-machinery',
      title: 'Heavy Machinery Vehicles',
      subtitle: 'Excavators, Cranes, Road rollers & Mining',
      filterLabel: 'Heavy Machinery',
      icon: <Wrench className="w-6 h-6 text-[#77101F]" />,
      count: publishedVehicles.filter(v => v.category === 'Heavy Machinery' || v.category === 'Heavy Machinery Vehicles' || v.category === 'heavy-machinery').length
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* ====================================================
          SECTION 6: HOMEPAGE HERO — TRUSSETS STYLE
      ==================================================== */}
      <section className="relative bg-gradient-to-br from-[#77101F] via-[#660C19] to-[#5E0B17] text-white pt-14 pb-24 overflow-hidden border-b border-[#5E0B17]">
        {/* Subtle automotive mesh & grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* TOP PILL */}
          <div className="inline-block">
            <button
              onClick={() => setLocationModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-sm group"
            >
              <span>🚗 Direct Owner Vehicle Marketplace</span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1 text-amber-300 font-bold group-hover:underline">
                <MapPin className="w-3.5 h-3.5" />
                {displayLocation}
              </span>
            </button>
          </div>

          {/* MAIN TITLE & SECOND LINE */}
          <div className="max-w-4xl mx-auto space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-display">
              Direct Owner Vehicle Marketplace.
            </h1>
            <div className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#F59E0B] tracking-tight font-display">
              Zero Brokerage.
            </div>
          </div>

          {/* DESCRIPTION */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/80 font-normal leading-relaxed">
            Buy or sell verified used vehicles directly with owners. Discover cars, bikes, commercial vehicles and heavy machinery without unnecessary middlemen.
          </p>

          {/* CENTER SEARCH CARD (Trussets proportions) */}
          <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-2xl border border-[#DCE3EC] p-4 sm:p-6 text-left">
            {/* Tabs: BUY VEHICLES / SELL VEHICLE */}
            <div className="flex items-center gap-3 border-b border-[#DCE3EC] pb-3 mb-4">
              <button
                type="button"
                onClick={() => setIntentTab('buy')}
                className={`text-xs font-black tracking-wider uppercase px-4 py-2 rounded-lg transition-all ${
                  intentTab === 'buy'
                    ? 'bg-[#77101F] text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#101828] hover:bg-[#F5F7FA]'
                }`}
              >
                BUY VEHICLES
              </button>
              <button
                type="button"
                onClick={() => {
                  setIntentTab('sell');
                  navigate('/sell');
                }}
                className={`text-xs font-black tracking-wider uppercase px-4 py-2 rounded-lg transition-all ${
                  intentTab === 'sell'
                    ? 'bg-[#77101F] text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#101828] hover:bg-[#F5F7FA]'
                }`}
              >
                SELL VEHICLE
              </button>
            </div>

            {/* Search Input Row */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search cars, bikes, brands or models in ${selectedCity}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#F7F9FC] border border-[#DCE3EC] rounded-xl text-xs sm:text-sm text-[#101828] placeholder-[#98A2B3] focus:outline-hidden focus:border-[#77101F] focus:ring-1 focus:ring-[#77101F] focus:bg-white transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Search Vehicles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-[#DCE3EC]/60 text-xs">
              <span className="text-[#667085] font-bold">Popular searches:</span>
              {['Cars', 'Bikes', 'SUV', 'Sedan', 'Commercial', 'Trucks'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handlePopularSearchChip(chip)}
                  className="px-2.5 py-1 bg-[#F5F7FA] hover:bg-[#77101F]/10 hover:text-[#77101F] text-[#101828] font-semibold rounded-md border border-[#DCE3EC] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* 3 TRUST CARDS BELOW (Trussets proportions) */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
            {/* Card 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 space-y-1.5 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B] text-[#5E0B17] flex items-center justify-center font-black text-sm">
                0%
              </div>
              <h4 className="text-sm font-bold text-white font-display">
                0% Brokerage
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                No unnecessary middlemen or dealer margins. Connect and negotiate directly with real vehicle owners.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 space-y-1.5 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#087F5B] text-white flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <h4 className="text-sm font-bold text-white font-display">
                Verified Vehicle Listings
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                RC, registration document verification and background check options ensure 100% genuine vehicle history.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 space-y-1.5 hover:bg-white/15 transition-all">
              <div className="w-8 h-8 rounded-lg bg-white text-[#77101F] flex items-center justify-center font-bold text-sm">
                📞
              </div>
              <h4 className="text-sm font-bold text-white font-display">
                Direct Owner Contacts
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                Reach verified sellers instantly via direct phone call or WhatsApp without any platform hindrance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 7: EXPLORE VEHICLE CATALOG
      ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#77101F]">
              Browse by Category
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828] font-display mt-1">
              Explore Vehicle Catalog
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Choose a vehicle category to browse direct-owner listings near you.
            </p>
          </div>

          <button
            onClick={() => { setActiveCategoryFilter(null); navigate('/buy'); }}
            className="text-xs font-bold text-[#77101F] hover:text-[#5E0B17] flex items-center gap-1 group whitespace-nowrap"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {catalogCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryCardClick(cat.filterLabel)}
              className="group bg-white rounded-2xl border border-[#DCE3EC] hover:border-[#77101F]/50 hover:shadow-xl p-5 sm:p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#F7F9FC] border border-[#DCE3EC] group-hover:border-[#77101F]/30 group-hover:bg-[#77101F]/5 flex items-center justify-center transition-colors">
                  {cat.icon}
                </div>
                <span className="text-xs font-bold text-[#667085] bg-[#F5F7FA] px-2.5 py-1 rounded-full border border-[#DCE3EC]">
                  {cat.count} Listed
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-lg font-bold text-[#101828] group-hover:text-[#77101F] transition-colors font-display">
                  {cat.title}
                </h3>
                <p className="text-xs text-[#667085] mt-1 line-clamp-2">
                  {cat.subtitle}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#DCE3EC]/70 flex items-center justify-between text-xs font-bold text-[#77101F]">
                <span>Browse {cat.title}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====================================================
          SECTION 8: FEATURED VEHICLES FOR SALE (3-COLUMN)
      ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#77101F]">
                Curated Direct Listings
              </span>
              <span className="bg-[#087F5B]/10 text-[#087F5B] text-[10px] font-bold px-2 py-0.5 rounded-full">
                0% Middlemen
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828] font-display mt-1">
              Featured Vehicles for Sale
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Handpicked verified vehicles from genuine sellers in {selectedCity} and nearby districts.
            </p>
          </div>

          <button
            onClick={() => { setActiveCategoryFilter(null); navigate('/buy'); }}
            className="text-xs font-bold text-white bg-[#77101F] hover:bg-[#5E0B17] px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Explore All Vehicles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Column Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVehicles.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onQuickView={(v) => setQuickViewVehicle(v)}
            />
          ))}
        </div>
      </section>

      {/* ====================================================
          DIRECT OWNER ADVANTAGE / VERIFICATION BANNER
      ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#77101F] bg-[#77101F]/5 px-3 py-1 rounded-full">
                Safe & Transparent Auto Trading
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#101828] font-display leading-tight">
                Why Thousands Choose OnRoadPriz Over Traditional Dealers
              </h2>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                Traditional vehicle purchases involve heavy broker cuts, manipulated odometers, and undisclosed accident damages. OnRoadPriz connects you straight to the vehicle's legitimate owner.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101828]">Direct Negotiations</h4>
                    <p className="text-[11px] text-[#667085]">Agree on a fair price with no dealer commissions</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101828]">Verified RC & History</h4>
                    <p className="text-[11px] text-[#667085]">Smart RC check & insurance validity verification</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101828]">All Vehicle Types</h4>
                    <p className="text-[11px] text-[#667085]">Cars, Bikes, Lorries, Buses, JCB & Heavy Machinery</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101828]">Free Listing Options</h4>
                    <p className="text-[11px] text-[#667085]">Sellers can post vehicles with 0 upfront cost</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/sell')}
                  className="px-6 py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Your Vehicle Today</span>
                </button>
              </div>
            </div>

            {/* Comparison Box */}
            <div className="bg-[#F7F9FC] border border-[#DCE3EC] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#101828] uppercase tracking-wider text-center">
                Platform Comparison
              </h3>

              <div className="space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#DCE3EC] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#101828]">Middlemen Commission</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-red-600 line-through">Dealers: 4%–8%</span>
                    <span className="font-bold text-[#087F5B] bg-[#087F5B]/10 px-2 py-0.5 rounded">
                      OnRoadPriz: 0%
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#DCE3EC] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#101828]">Seller Contact Access</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#667085]">Blocked on apps</span>
                    <span className="font-bold text-[#087F5B] bg-[#087F5B]/10 px-2 py-0.5 rounded">
                      Direct WhatsApp & Call
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#DCE3EC] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#101828]">Heavy Machinery & Lorries</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#667085]">Cars only on most sites</span>
                    <span className="font-bold text-[#77101F] bg-[#77101F]/10 px-2 py-0.5 rounded">
                      Full Commercial Fleet
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          RECENT DIRECT LISTINGS (3-COLUMN)
      ==================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828] font-display">
              Latest Direct Owner Vehicles
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Freshly listed vehicles in {selectedCity} and across India.
            </p>
          </div>
          <button
            onClick={() => { setActiveCategoryFilter(null); navigate('/buy'); }}
            className="text-xs font-bold text-[#77101F] hover:text-[#5E0B17] flex items-center gap-1 group"
          >
            <span>See All ({publishedVehicles.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentListings.map((vehicle) => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onQuickView={(v) => setQuickViewVehicle(v)}
            />
          ))}
        </div>
      </section>

      {/* ====================================================
          TESTIMONIALS (Direct Buyers & Sellers)
      ==================================================== */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#77101F]">
              Real Customer Stories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828] font-display mt-1">
              Direct Sellers & Happy Buyers
            </h2>
            <p className="text-xs text-[#667085] mt-1">
              See how verified vehicle transactions happen without unnecessary dealer commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-[#DCE3EC] p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#101828] leading-relaxed italic">
                    "{item.quote || item.testimonial || 'Smooth direct owner buying experience.'}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#DCE3EC] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#101828]">{item.name || item.customerName || 'Verified Member'}</h4>
                    <p className="text-[11px] text-[#667085]">{item.location || 'Direct Marketplace'} • {item.vehiclePurchased || 'Direct Owner'}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#087F5B] bg-[#087F5B]/10 px-2 py-0.5 rounded-full">
                    Verified Deal
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* QUICK VIEW MODAL */}
      <QuickViewModal
        vehicle={quickViewVehicle}
        onClose={() => setQuickViewVehicle(null)}
      />
    </div>
  );
};
