import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { VehicleCard } from './VehicleCard';
import { QuickViewModal } from './QuickViewModal';
import { getPlacesForCity } from '../../data/locationData';
import { filterAndSortVehicles, SortOption } from '../../services/searchService';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  RotateCcw, 
  Check, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  Car, 
  ChevronRight,
  Filter,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

export const BuyVehiclesPage: React.FC = () => {
  const { 
    vehicles, 
    activeCategoryFilter, 
    setActiveCategoryFilter, 
    selectedCity, 
    selectedLocality,
    setSelectedLocality,
    setLocationModalOpen,
    getBrandsForCategory,
    getModelsForBrand,
    getVariantsForModel,
    masterCategories,
    masterFuelTypes,
    masterTransmissionTypes,
    masterBodyTypes
  } = useApp();

  const [quickViewVehicle, setQuickViewVehicle] = useState<Vehicle | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Category -> Brand -> Model -> Variant Relational State
  const [category, setCategory] = useState<string>(activeCategoryFilter || 'All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [selectedModel, setSelectedModel] = useState<string>('All');
  const [selectedVariant, setSelectedVariant] = useState<string>('All');

  // Other Filter States
  const [placeFilter, setPlaceFilter] = useState<string>(selectedLocality || 'All Places');
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [rcVerifiedOnly, setRcVerifiedOnly] = useState<boolean>(false);
  const [budgetRange, setBudgetRange] = useState<number>(20000000); // Max 2 Cr
  const [maxKm, setMaxKm] = useState<number>(200000);
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // Sync category if set from Navbar or Home
  useEffect(() => {
    if (activeCategoryFilter) {
      setCategory(activeCategoryFilter);
      setSelectedBrand('All');
      setSelectedModel('All');
      setSelectedVariant('All');
    }
  }, [activeCategoryFilter]);

  // Sync locality when selectedLocality or selectedCity changes
  useEffect(() => {
    setPlaceFilter(selectedLocality || 'All Places');
  }, [selectedLocality, selectedCity]);

  // 1. Dynamic Brands filtered by Category
  const [brandSearch, setBrandSearch] = useState('');

  const availableBrands = useMemo(() => {
    if (category === 'All' || !category) {
      return [];
    }
    const brands = getBrandsForCategory(category);
    if (brands.length > 0) {
      return Array.from(new Set(brands.map(b => b.name))).sort();
    }
    // Fallback to existing vehicles in that category
    const fromVehicles = vehicles
      .filter(v => v.category.toLowerCase().includes(category.toLowerCase()))
      .map(v => v.brand);
    return Array.from(new Set(fromVehicles)).sort();
  }, [category, getBrandsForCategory, vehicles]);

  const filteredAvailableBrands = useMemo(() => {
    if (!brandSearch.trim()) return availableBrands;
    const q = brandSearch.toLowerCase().trim();
    return availableBrands.filter(b => b.toLowerCase().includes(q));
  }, [availableBrands, brandSearch]);

  // 2. Dynamic Models filtered by Brand
  const availableModels = useMemo(() => {
    if (selectedBrand === 'All' || !selectedBrand) return [];
    const models = getModelsForBrand(selectedBrand);
    if (models.length > 0) {
      return Array.from(new Set(models.map(m => m.name))).sort();
    }
    const fromVehicles = vehicles
      .filter(v => v.brand.toLowerCase() === selectedBrand.toLowerCase())
      .map(v => v.model);
    return Array.from(new Set(fromVehicles)).sort();
  }, [selectedBrand, getModelsForBrand, vehicles]);

  // 3. Dynamic Variants filtered by Model
  const availableVariants = useMemo(() => {
    if (selectedModel === 'All' || !selectedModel) return [];
    const variants = getVariantsForModel(selectedModel);
    if (variants.length > 0) {
      return Array.from(new Set(variants.map(v => v.name))).sort();
    }
    const fromVehicles = vehicles
      .filter(v => v.model.toLowerCase().includes(selectedModel.toLowerCase()))
      .map(v => v.variant)
      .filter(Boolean) as string[];
    return Array.from(new Set(fromVehicles)).sort();
  }, [selectedModel, getVariantsForModel, vehicles]);

  // Handle Category Change (Resets downstream Brand, Model, Variant)
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setActiveCategoryFilter(newCat === 'All' ? null : newCat);
    setSelectedBrand('All');
    setSelectedModel('All');
    setSelectedVariant('All');
    setBrandSearch('');
  };

  // Handle Brand Change (Resets downstream Model, Variant)
  const handleBrandChange = (newBrand: string) => {
    setSelectedBrand(newBrand);
    setSelectedModel('All');
    setSelectedVariant('All');
  };

  // Handle Model Change (Resets downstream Variant)
  const handleModelChange = (newModel: string) => {
    setSelectedModel(newModel);
    setSelectedVariant('All');
  };

  const places = useMemo(() => {
    return ['All Places', ...getPlacesForCity(selectedCity)];
  }, [selectedCity]);

  const categoryChips = [
    'All',
    'Cars',
    'Bikes & Scooters',
    'Trucks & Lorries',
    'Buses',
    'Tractors & Backhoe Loaders',
    'Heavy Machinery Vehicles'
  ];

  const fuelOptions = useMemo(() => {
    const rawList = masterFuelTypes.length > 0 
      ? masterFuelTypes.map(f => {
          const lower = f.toLowerCase();
          if (lower.includes('hybrid')) return 'Hybrid';
          if (lower.includes('cng')) return 'CNG';
          if (lower.includes('electric') || lower.includes('ev')) return 'Electric';
          return f.split(' ')[0];
        }) 
      : ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

    return Array.from(new Set(rawList.filter(Boolean)));
  }, [masterFuelTypes]);

  const transmissionOptions = ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT'];
  const ownerOptions = ['1st Owner', '2nd Owner', '3rd Owner', '4th Owner+'];
  const bodyTypes = ['Hatchback', 'Sedan', 'SUV', 'Compact SUV', 'MUV', 'Pickup', 'Truck', 'Bus'];

  const toggleFuel = (f: string) => {
    setSelectedFuels(prev => 
      prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]
    );
  };

  const toggleTransmission = (t: string) => {
    setSelectedTransmissions(prev => 
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const toggleOwner = (o: string) => {
    setSelectedOwners(prev => 
      prev.includes(o) ? prev.filter(item => item !== o) : [...prev, o]
    );
  };

  const toggleBodyType = (bt: string) => {
    setSelectedBodyTypes(prev => 
      prev.includes(bt) ? prev.filter(item => item !== bt) : [...prev, bt]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategory('All');
    setActiveCategoryFilter(null);
    setSelectedBrand('All');
    setSelectedModel('All');
    setSelectedVariant('All');
    setPlaceFilter('All Places');
    setSelectedLocality('All Places');
    setSelectedFuels([]);
    setSelectedTransmissions([]);
    setSelectedOwners([]);
    setSelectedBodyTypes([]);
    setVerifiedOnly(false);
    setRcVerifiedOnly(false);
    setBudgetRange(20000000);
    setMaxKm(200000);
    setSelectedYear('All');
    setSortBy('relevance');
  };

  // Year filter bounds
  const yearBounds = useMemo(() => {
    if (selectedYear === 'All') return {};
    if (selectedYear === '2022+') return { minYear: 2022 };
    if (selectedYear === '2020–2021') return { minYear: 2020, maxYear: 2021 };
    if (selectedYear === '2017–2019') return { minYear: 2017, maxYear: 2019 };
    if (selectedYear === 'Before 2017') return { maxYear: 2016 };
    const num = parseInt(selectedYear);
    return isNaN(num) ? {} : { minYear: num, maxYear: num };
  }, [selectedYear]);

  // Execute advanced multi-attribute search and sorting
  const filteredVehicles = useMemo(() => {
    return filterAndSortVehicles(
      vehicles,
      searchQuery,
      {
        category: category !== 'All' ? category : undefined,
        brand: selectedBrand !== 'All' ? selectedBrand : undefined,
        model: selectedModel !== 'All' ? selectedModel : undefined,
        variant: selectedVariant !== 'All' ? selectedVariant : undefined,
        city: selectedCity !== 'All India' ? selectedCity : undefined,
        locality: placeFilter !== 'All Places' ? placeFilter : undefined,
        fuelTypes: selectedFuels,
        transmissions: selectedTransmissions,
        ownerships: selectedOwners,
        bodyTypes: selectedBodyTypes,
        maxPrice: budgetRange < 20000000 ? budgetRange : undefined,
        maxKm: maxKm < 200000 ? maxKm : undefined,
        minYear: yearBounds.minYear,
        maxYear: yearBounds.maxYear,
        verifiedOnly,
        rcVerifiedOnly
      },
      sortBy
    );
  }, [
    vehicles,
    searchQuery,
    category,
    selectedBrand,
    selectedModel,
    selectedVariant,
    selectedCity,
    placeFilter,
    selectedFuels,
    selectedTransmissions,
    selectedOwners,
    selectedBodyTypes,
    budgetRange,
    maxKm,
    yearBounds,
    verifiedOnly,
    rcVerifiedOnly,
    sortBy
  ]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (category !== 'All') count++;
    if (selectedBrand !== 'All') count++;
    if (selectedModel !== 'All') count++;
    if (selectedVariant !== 'All') count++;
    if (placeFilter !== 'All Places') count++;
    count += selectedFuels.length;
    count += selectedTransmissions.length;
    count += selectedOwners.length;
    count += selectedBodyTypes.length;
    if (verifiedOnly) count++;
    if (rcVerifiedOnly) count++;
    if (budgetRange < 20000000) count++;
    if (maxKm < 200000) count++;
    if (selectedYear !== 'All') count++;
    return count;
  }, [
    searchQuery,
    category,
    selectedBrand,
    selectedModel,
    selectedVariant,
    placeFilter,
    selectedFuels,
    selectedTransmissions,
    selectedOwners,
    selectedBodyTypes,
    verifiedOnly,
    rcVerifiedOnly,
    budgetRange,
    maxKm,
    selectedYear
  ]);

  return (
    <div className="space-y-6 pb-20">
      {/* ====================================================
          REQUIREMENTS 16 & 17: COMPACT BANNER & SEARCH BAR
          Desktop: ~180-220px, Tablet: ~150-180px, Mobile: ~120-140px
      ==================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#77101F] via-[#660C19] to-[#5E0B17] text-white py-4 sm:py-5 lg:py-6 border-b border-[#5E0B17] shadow-sm">
        {/* Subtle background overlay */}
        <div 
          className="absolute inset-0 opacity-10 bg-center bg-cover pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&auto=format&fit=crop&q=80')` }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                  BUY DIRECT • 0% BROKERAGE
                </span>
                <span className="text-[10px] text-white/60 font-semibold">•</span>
                <span className="text-[10px] text-white/80 font-bold">{selectedCity}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-display">
                Used Vehicles for Sale in {selectedCity}
              </h1>
            </div>

            <div className="self-start sm:self-auto shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-xs border border-white/20 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{filteredVehicles.length} Vehicles Available</span>
              </span>
            </div>
          </div>

          {/* COMPACT SEARCH BAR (Above-the-fold) */}
          <div className="relative max-w-4xl">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by vehicle name, brand, model, year, fuel... (e.g. 'Creta petrol', '2022 Thar')"
                className="w-full pl-10 pr-24 py-2.5 bg-white text-[#101828] placeholder:text-slate-400 rounded-xl text-xs sm:text-sm font-semibold shadow-md focus:outline-hidden focus:ring-2 focus:ring-amber-300"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#101828] text-xs font-bold rounded-lg transition-colors"
                >
                  Clear
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-1 absolute right-3 pointer-events-none text-[11px] font-bold text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-[#77101F]" />
                  <span>Smart Match</span>
                </div>
              )}
            </div>
          </div>

          {/* COMPACT CATEGORY CHIPS */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {categoryChips.map((c) => {
              const isActive = (c === 'All' && category === 'All') || category === c;
              return (
                <button
                  key={c}
                  onClick={() => handleCategoryChange(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-[#77101F] shadow-sm font-black'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ====================================================
          SUB-BAR: PLACE-WISE LOCATIONS
      ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#DCE3EC] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#101828] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#77101F]" />
                Browse Place-wise Locations ({selectedCity})
              </span>
            </div>
            <button
              onClick={() => setLocationModalOpen(true)}
              className="text-xs font-bold text-[#77101F] hover:underline"
            >
              Change City
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {places.map((place) => {
              const isSelected = placeFilter.toLowerCase() === place.toLowerCase();
              return (
                <button
                  key={place}
                  onClick={() => {
                    setPlaceFilter(place);
                    setSelectedLocality(place);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#77101F] text-white font-bold shadow-xs'
                      : 'bg-[#F7F9FC] text-[#667085] hover:text-[#101828] hover:bg-[#EAEFF5]'
                  }`}
                >
                  {place}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ====================================================
          MAIN CONTENT AREA (FILTERS + VEHICLE LISTINGS)
      ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-[#101828]">
              Showing {filteredVehicles.length} Vehicles
            </span>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#77101F]/10 text-[#77101F]">
                    <span>Search: "{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {category !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    <span>{category}</span>
                    <button onClick={() => handleCategoryChange('All')} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedBrand !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    <span>Brand: {selectedBrand}</span>
                    <button onClick={() => handleBrandChange('All')} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedModel !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    <span>Model: {selectedModel}</span>
                    <button onClick={() => handleModelChange('All')} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedVariant !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    <span>Variant: {selectedVariant}</span>
                    <button onClick={() => setSelectedVariant('All')} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {placeFilter !== 'All Places' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                    <span>{placeFilter}</span>
                    <button onClick={() => { setPlaceFilter('All Places'); setSelectedLocality('All Places'); }} className="hover:text-black">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#77101F] hover:underline ml-1"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#667085] hidden sm:inline font-bold">Sort By:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-[#DCE3EC] text-[#101828] text-xs font-bold rounded-xl pl-3 pr-8 py-2 shadow-2xs focus:outline-hidden focus:border-[#77101F]"
              >
                <option value="relevance">Relevance / Best Match</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="km_asc">KM: Low → High</option>
                <option value="year_desc">Year: Newest → Oldest</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-[#DCE3EC] text-xs font-bold rounded-xl"
            >
              <Filter className="w-3.5 h-3.5 text-[#77101F]" />
              <span>Filters ({activeFiltersCount})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* ====================================================
              LEFT SIDEBAR: HIERARCHICAL FILTERS
          ==================================================== */}
          <div className={`space-y-5 bg-white p-5 rounded-2xl border border-[#DCE3EC] shadow-xs lg:block ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#77101F]" />
                <h3 className="font-bold text-sm text-[#101828]">Refine Search</h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#77101F] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* 1. VEHICLE TYPE / CATEGORY */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#101828]">1. Vehicle Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-2.5 text-xs font-semibold bg-[#F7F9FC] border border-[#DCE3EC] rounded-xl text-[#101828] focus:bg-white focus:border-[#77101F]"
              >
                <option value="All">All Categories</option>
                {categoryChips.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 2. DYNAMIC BRAND FILTER BY VEHICLE TYPE (Requirements 15, 16, 17) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#101828]">
                  2. Brand {category !== 'All' ? `(${category})` : ''}
                </label>
                {category !== 'All' && (
                  <span className="text-[10px] text-[#667085]">
                    {filteredAvailableBrands.length} of {availableBrands.length} Brands
                  </span>
                )}
              </div>

              {category === 'All' ? (
                <div className="p-2.5 text-xs font-semibold bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed">
                  Select vehicle category first
                </div>
              ) : (
                <div className="space-y-1.5">
                  {/* Searchable Brand Input (Requirement 17) */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      placeholder="Search brands (e.g. roy, bm)..."
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-[#DCE3EC] rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#77101F]"
                    />
                  </div>

                  <select
                    value={selectedBrand}
                    onChange={(e) => handleBrandChange(e.target.value)}
                    className="w-full p-2.5 text-xs font-semibold bg-[#F7F9FC] border border-[#DCE3EC] rounded-xl text-[#101828] focus:bg-white focus:border-[#77101F]"
                  >
                    <option value="All">All {category} Brands</option>
                    {filteredAvailableBrands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 3. DYNAMIC MODEL FILTER BY BRAND */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#101828]">
                3. Model {selectedBrand !== 'All' ? `(${selectedBrand})` : ''}
              </label>
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={selectedBrand === 'All'}
                className={`w-full p-2.5 text-xs font-semibold rounded-xl border ${
                  selectedBrand === 'All'
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-[#F7F9FC] text-[#101828] border-[#DCE3EC] focus:bg-white focus:border-[#77101F]'
                }`}
              >
                <option value="All">
                  {selectedBrand === 'All' ? 'Select a Brand First' : 'All Models'}
                </option>
                {availableModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* 4. DYNAMIC VARIANT FILTER BY MODEL */}
            {availableVariants.length > 0 && selectedModel !== 'All' && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="block text-xs font-bold text-[#101828]">
                  4. Variant ({selectedModel})
                </label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full p-2.5 text-xs font-semibold bg-[#F7F9FC] border border-[#DCE3EC] rounded-xl text-[#101828] focus:bg-white focus:border-[#77101F]"
                >
                  <option value="All">All Variants</option>
                  {availableVariants.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 5. BUDGET SLIDER */}
            <div className="space-y-2 pt-2 border-t border-[#DCE3EC]">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#101828]">Max Budget</span>
                <span className="text-[#77101F]">
                  {budgetRange >= 20000000 ? 'Any Budget' : `₹${(budgetRange / 100000).toFixed(1)} Lakhs`}
                </span>
              </div>
              <input
                type="range"
                min={100000}
                max={20000000}
                step={50000}
                value={budgetRange}
                onChange={(e) => setBudgetRange(Number(e.target.value))}
                className="w-full accent-[#77101F]"
              />
              <div className="flex justify-between text-[10px] text-[#667085]">
                <span>₹1 Lakh</span>
                <span>₹50L</span>
                <span>₹2 Cr</span>
              </div>
            </div>

            {/* 6. FUEL TYPES */}
            <div className="space-y-2 pt-2 border-t border-[#DCE3EC]">
              <span className="block text-xs font-bold text-[#101828]">Fuel Type</span>
              <div className="flex flex-wrap gap-1.5">
                {fuelOptions.map((f, idx) => {
                  const isChecked = selectedFuels.includes(f);
                  return (
                    <button
                      key={`fuel-filter-${f}-${idx}`}
                      onClick={() => toggleFuel(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isChecked
                          ? 'bg-[#77101F] text-white font-bold'
                          : 'bg-[#F7F9FC] text-[#667085] hover:bg-[#EAEFF5]'
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. TRANSMISSION */}
            <div className="space-y-2 pt-2 border-t border-[#DCE3EC]">
              <span className="block text-xs font-bold text-[#101828]">Transmission</span>
              <div className="flex flex-wrap gap-1.5">
                {transmissionOptions.map((t, idx) => {
                  const isChecked = selectedTransmissions.includes(t);
                  return (
                    <button
                      key={`trans-filter-${t}-${idx}`}
                      onClick={() => toggleTransmission(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isChecked
                          ? 'bg-[#77101F] text-white font-bold'
                          : 'bg-[#F7F9FC] text-[#667085] hover:bg-[#EAEFF5]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 8. OWNERSHIP */}
            <div className="space-y-2 pt-2 border-t border-[#DCE3EC]">
              <span className="block text-xs font-bold text-[#101828]">Ownership</span>
              <div className="grid grid-cols-2 gap-1.5">
                {ownerOptions.map((o, idx) => {
                  const isChecked = selectedOwners.includes(o);
                  return (
                    <button
                      key={`owner-filter-${o}-${idx}`}
                      onClick={() => toggleOwner(o)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all text-left ${
                        isChecked
                          ? 'bg-[#77101F] text-white font-bold'
                          : 'bg-[#F7F9FC] text-[#667085] hover:bg-[#EAEFF5]'
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 9. VERIFIED BADGES ONLY */}
            <div className="space-y-2 pt-2 border-t border-[#DCE3EC]">
              <span className="block text-xs font-bold text-[#101828]">Verification Status</span>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#101828] cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-[#77101F] focus:ring-[#77101F]"
                />
                <span>✓ Verified Owners Only</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#101828] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rcVerifiedOnly}
                  onChange={(e) => setRcVerifiedOnly(e.target.checked)}
                  className="rounded text-[#77101F] focus:ring-[#77101F]"
                />
                <span>✓ RC Verified Listings Only</span>
              </label>
            </div>
          </div>

          {/* ====================================================
              RIGHT GRID: VEHICLES LISTINGS
          ==================================================== */}
          <div className="lg:col-span-3 space-y-6">
            {filteredVehicles.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#DCE3EC] p-12 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                  🚗
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#101828] font-display">
                    No matching vehicles found
                  </h3>
                  <p className="text-xs text-[#667085] mt-1 max-w-md mx-auto">
                    We couldn't find vehicles matching your search criteria. Try removing some filters or exploring all cities.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Clear All Filters & Reset
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onQuickView={(v) => setQuickViewVehicle(v)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewVehicle && (
        <QuickViewModal
          vehicle={quickViewVehicle}
          isOpen={Boolean(quickViewVehicle)}
          onClose={() => setQuickViewVehicle(null)}
        />
      )}
    </div>
  );
};
