import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Vehicle, 
  VehicleStatus, 
  DocumentVerificationStatus, 
  VehicleCategory,
  FuelType,
  TransmissionType,
  calculateInsuranceStatus 
} from '../../types';
import { 
  Search, 
  Car, 
  Check, 
  X, 
  Eye, 
  Trash2, 
  ShieldCheck, 
  Calendar, 
  Gauge, 
  Fuel, 
  MapPin, 
  FileText,
  AlertCircle,
  Edit3,
  Save,
  Building2,
  Key,
  Wrench,
  Weight,
  Layers,
  AlertTriangle
} from 'lucide-react';

export const VehiclesTab: React.FC = () => {
  const { 
    vehicles, 
    updateVehicle,
    updateVehicleStatus, 
    deleteVehicle, 
    addAuditLog, 
    showToast, 
    navigate,
    setSelectedVehicleId,
    verifyVehicleRc,
    verifyVehicleInsurance,
    getBrandsForCategory,
    getModelsForBrand,
    getVariantsForModel
  } = useApp();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [brandFilter, setBrandFilter] = useState('All');
  const [modelFilter, setModelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fuelFilter, setFuelFilter] = useState('All');

  // Inspection Modal & RC Verification
  const [inspectVehicle, setInspectVehicle] = useState<Vehicle | null>(null);
  const [rcViewerImage, setRcViewerImage] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    vehicleId: string;
    docType: 'RC' | 'Insurance';
    status: DocumentVerificationStatus;
    actionLabel: string;
    notes: string;
  } | null>(null);

  // Admin Vehicle Editor Modal State (Requirement 7)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Dynamic Brands for Filter by Category (Requirement 7)
  const availableBrandsForFilter = useMemo(() => {
    if (categoryFilter === 'All') {
      const all = vehicles.map(v => v.brand);
      return Array.from(new Set(all)).filter(Boolean).sort();
    }
    const fromMaster = getBrandsForCategory(categoryFilter).map(b => b.name);
    const fromVehicles = vehicles
      .filter(v => v.category.toLowerCase().includes(categoryFilter.toLowerCase()))
      .map(v => v.brand);
    return Array.from(new Set([...fromMaster, ...fromVehicles])).filter(Boolean).sort();
  }, [categoryFilter, getBrandsForCategory, vehicles]);

  // Dynamic Models for Filter by Brand (Requirement 7)
  const availableModelsForFilter = useMemo(() => {
    if (brandFilter === 'All') return [];
    const fromMaster = getModelsForBrand(brandFilter).map(m => m.name);
    const fromVehicles = vehicles
      .filter(v => v.brand.toLowerCase() === brandFilter.toLowerCase())
      .map(v => v.model);
    return Array.from(new Set([...fromMaster, ...fromVehicles])).filter(Boolean).sort();
  }, [brandFilter, getModelsForBrand, vehicles]);

  // Cascade Filter Handlers (Requirement 7 & 16)
  const handleCategoryFilterChange = (cat: string) => {
    setCategoryFilter(cat);
    setBrandFilter('All');
    setModelFilter('All');
  };

  const handleBrandFilterChange = (br: string) => {
    setBrandFilter(br);
    setModelFilter('All');
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        v.title.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        (v.seller?.name && v.seller.name.toLowerCase().includes(q)) ||
        (v.location?.city && v.location.city.toLowerCase().includes(q));

      const matchesCat = categoryFilter === 'All' || v.category === categoryFilter;
      const matchesBrand = brandFilter === 'All' || v.brand.toLowerCase() === brandFilter.toLowerCase();
      const matchesModel = modelFilter === 'All' || v.model.toLowerCase() === modelFilter.toLowerCase();
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchesFuel = fuelFilter === 'All' || v.fuelType === fuelFilter;

      return matchesSearch && matchesCat && matchesBrand && matchesModel && matchesStatus && matchesFuel;
    });
  }, [vehicles, searchQuery, categoryFilter, brandFilter, modelFilter, statusFilter, fuelFilter]);

  const handleStatusChange = (v: Vehicle, newStatus: VehicleStatus) => {
    updateVehicleStatus(v.id, newStatus);
    addAuditLog({
      action: `Vehicle Status Changed to ${newStatus}`,
      module: 'Vehicle Management',
      recordId: v.id,
      oldValue: `Status: ${v.status}`,
      newValue: `Status: ${newStatus}`
    });
    showToast('Listing Updated', `"${v.title}" marked as ${newStatus}.`, 'success');
  };

  const handleDeleteVehicle = (v: Vehicle) => {
    if (confirm(`Are you sure you want to permanently delete vehicle "${v.title}"?`)) {
      deleteVehicle(v.id);
      addAuditLog({
        action: 'Vehicle Deleted',
        module: 'Vehicle Management',
        recordId: v.id,
        oldValue: `Vehicle: ${v.title}`,
        newValue: 'Deleted'
      });
      if (inspectVehicle?.id === v.id) setInspectVehicle(null);
    }
  };

  // Editor Cascade Options
  const editorBrands = useMemo(() => {
    if (!editingVehicle) return [];
    return getBrandsForCategory(editingVehicle.category);
  }, [editingVehicle?.category, getBrandsForCategory]);

  const editorModels = useMemo(() => {
    if (!editingVehicle || !editingVehicle.brand) return [];
    return getModelsForBrand(editingVehicle.brand);
  }, [editingVehicle?.brand, getModelsForBrand]);

  const editorVariants = useMemo(() => {
    if (!editingVehicle || !editingVehicle.model) return [];
    return getVariantsForModel(editingVehicle.model);
  }, [editingVehicle?.model, getVariantsForModel]);

  const handleSaveEditedVehicle = () => {
    if (!editingVehicle) return;
    const title = `${editingVehicle.year} ${editingVehicle.brand} ${editingVehicle.model} ${editingVehicle.variant || ''}`.trim();
    const updated = {
      ...editingVehicle,
      title
    };
    updateVehicle(editingVehicle.id, updated);
    addAuditLog({
      action: 'Admin Vehicle Updated',
      module: 'Vehicle Management',
      recordId: editingVehicle.id,
      oldValue: 'Previous Specifications',
      newValue: 'Updated Specifications'
    });
    showToast('Vehicle Updated', `"${title}" updated successfully by Admin.`, 'success');
    setEditingVehicle(null);
  };

  // Missing fields helper for Admin audit inspection (Requirement 23)
  const getMissingFields = (v: Vehicle): string[] => {
    const missing: string[] = [];
    if (!v.insurance_valid_until) missing.push('Insurance Validity Date');
    if (v.has_spare_key === undefined || v.has_spare_key === null) missing.push('Spare Key Status');
    if (!v.hypothecation_status) missing.push('Hypothecation Status');
    if (!v.oem_service_status) missing.push('OEM Service History');
    if (!v.engine_warranty_status) missing.push('Engine Warranty Status');
    if (!v.major_accident_history) missing.push('Major Accident History');
    const isComm = v.category === 'Trucks & Lorries' || v.category === 'Buses' || v.category === 'Heavy Machinery Vehicles';
    if (isComm) {
      if (v.load_capacity === undefined && !v.loadCapacity) missing.push('Load Capacity');
      if (v.max_operating_weight === undefined && !v.maxOperatingWeight) missing.push('Operating Weight');
    }
    if (v.category === 'Heavy Machinery Vehicles') {
      if (v.maximum_digging_power === undefined) missing.push('Digging Power');
      if (v.engine_power === undefined) missing.push('Engine Power');
    }
    return missing;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Vehicle Inventory & Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, audit specifications, inspect documents, and moderate vehicle listings across all segments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Total: {vehicles.length} listings
          </span>
        </div>
      </div>

      {/* Filter Toolbar (Requirement 7: Category -> Brand -> Model Cascade) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs space-y-3">
        {/* Mobile Status Pills for 1-Tap Filtering */}
        <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {['All', 'Published', 'Pending Approval', 'Sold', 'Rejected'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                statusFilter === st
                  ? 'bg-[#77101F] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'Pending Approval' ? 'Pending' : st}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, brand, seller, city..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#77101F] focus:bg-white"
            />
          </div>

          {/* 1. Category */}
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
            className="px-2.5 sm:px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Cars">Cars</option>
            <option value="Bikes & Scooters">Bikes & Scooters</option>
            <option value="Trucks & Lorries">Trucks & Lorries</option>
            <option value="Buses">Buses</option>
            <option value="Tractors & Backhoe Loaders">Tractors</option>
            <option value="Heavy Machinery Vehicles">Heavy Machinery</option>
          </select>

          {/* 2. Brand (Dynamic by Category) */}
          <select
            value={brandFilter}
            onChange={(e) => handleBrandFilterChange(e.target.value)}
            className="px-2.5 sm:px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="All">{categoryFilter !== 'All' ? `All Brands` : 'All Brands'}</option>
            {availableBrandsForFilter.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* 3. Model (Dynamic by Brand) */}
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            disabled={brandFilter === 'All'}
            className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold border ${
              brandFilter === 'All'
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-slate-50 text-slate-700 border-slate-200 focus:outline-hidden'
            }`}
          >
            <option value="All">{brandFilter === 'All' ? 'Select Brand' : `All Models`}</option>
            {availableModelsForFilter.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* 4. Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="hidden sm:block px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published (Live)</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Sold">Sold</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Inventory Container: MOBILE CARDS + DESKTOP TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* MOBILE CARD VIEW (Active on phones & small tablets) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredVehicles.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-400 text-xs">
              No vehicles found matching the selected filters.
            </div>
          ) : (
            filteredVehicles.map(v => (
              <div key={v.id} className="p-3.5 space-y-3 hover:bg-slate-50/60 transition-colors">
                {/* Top Row: Photo + Title + Badges */}
                <div className="flex items-start gap-3">
                  <img
                    src={v.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200'}
                    alt=""
                    className="w-16 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {v.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'Published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'Pending Approval'
                          ? 'bg-amber-100 text-amber-800'
                          : v.status === 'Sold'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {v.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs mt-1 truncate">
                      {v.title}
                    </h4>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {v.id}
                    </div>
                  </div>
                </div>

                {/* Key Specs Bar */}
                <div className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-black text-sm text-[#77101F]">
                    ₹{v.price.toLocaleString('en-IN')}
                  </span>
                  <div className="text-[11px] text-slate-600 font-medium">
                    {v.kmDriven.toLocaleString('en-IN')} {v.category === 'Heavy Machinery Vehicles' || v.category === 'Tractors & Backhoe Loaders' ? 'Hrs' : 'KM'}
                    <span className="text-slate-300 mx-1.5">•</span>
                    {v.fuelType}
                  </div>
                </div>

                {/* Location & Seller Snippet */}
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 truncate max-w-[50%]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{v.location?.city || v.city || 'India'}</span>
                  </div>
                  <div className="text-right truncate max-w-[45%]">
                    <span className="font-semibold text-slate-800">{v.seller?.name || 'Seller'}</span>
                    <span className="text-slate-400 text-[10px] block">{v.seller?.type || 'Direct Owner'}</span>
                  </div>
                </div>

                {/* Touch-Friendly Action Buttons Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setInspectVehicle(v)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                    <button
                      onClick={() => setEditingVehicle({ ...v })}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {v.status === 'Pending Approval' && (
                      <button
                        onClick={() => handleStatusChange(v, 'Published')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                    {v.status === 'Published' && (
                      <button
                        onClick={() => handleStatusChange(v, 'Sold')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                      >
                        Sold
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteVehicle(v)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW (Visible on tablet & desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">KM / Hours</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No vehicles found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Vehicle */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200'}
                          alt=""
                          className="w-12 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-[220px]">
                            {v.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {v.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {v.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <span className="font-black text-[#77101F]">
                        ₹{v.price.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* KM / Hours */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {v.kmDriven.toLocaleString('en-IN')} {v.category === 'Heavy Machinery Vehicles' || v.category === 'Tractors & Backhoe Loaders' ? 'Hrs' : 'KM'}
                      </div>
                      <div className="text-[11px] text-slate-400">{v.fuelType} • {v.transmission}</div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-medium">{v.location?.city || v.city || '—'}</span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{v.location?.area || ''}</div>
                    </td>

                    {/* Seller */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{v.seller?.name || 'Seller'}</div>
                      <div className="text-[10px] text-slate-400">{v.seller?.type || 'Direct Owner'}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'Published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'Pending Approval'
                          ? 'bg-amber-100 text-amber-800'
                          : v.status === 'Sold'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {v.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Inspect Details */}
                        <button
                          onClick={() => setInspectVehicle(v)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Inspect All Vehicle Specifications & Documents"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Admin Vehicle Editor (Requirement 7) */}
                        <button
                          onClick={() => setEditingVehicle({ ...v })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Vehicle Details & Cascade"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Approve if Pending */}
                        {v.status === 'Pending Approval' && (
                          <button
                            onClick={() => handleStatusChange(v, 'Published')}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Approve & Publish Listing"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Mark Sold if Published */}
                        {v.status === 'Published' && (
                          <button
                            onClick={() => handleStatusChange(v, 'Sold')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md"
                            title="Mark as Sold"
                          >
                            Sold
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteVehicle(v)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================
          REQUIREMENT 23: ADMIN VEHICLE INSPECTION VIEW
          Displays ALL applicable fields organized into sections:
          - Basic Details
          - Technical Specifications
          - Condition & Additional Details
          - Commercial Specifications
          - Heavy Machinery Specifications
          - RC & Insurance Documents
          - Seller Information
          - Verification & Audit Status
      ==================================================== */}
      {inspectVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#77101F] uppercase tracking-wider">
                    {inspectVehicle.category} • {inspectVehicle.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    inspectVehicle.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inspectVehicle.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {inspectVehicle.title}
                </h2>
              </div>
              <button onClick={() => setInspectVehicle(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Incomplete / Missing Fields Alert (Requirement 23) */}
            {(() => {
              const missing = getMissingFields(inspectVehicle);
              if (missing.length === 0) return null;
              return (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Missing or Incomplete Specifications:</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {missing.join(', ')}. Use the Admin Editor to update these fields.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* 1. Basic Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Car className="w-4 h-4 text-[#77101F]" />
                <span>1. Basic Details</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Brand</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{inspectVehicle.brand}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Model</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{inspectVehicle.model}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Variant</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{inspectVehicle.variant || 'Not Specified'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Year / Reg Year</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{inspectVehicle.year} / {inspectVehicle.registrationYear}</span>
                </div>
              </div>
            </div>

            {/* 2. Technical Specifications */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#77101F]" />
                <span>2. Technical Specifications</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Fuel Type</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{inspectVehicle.fuelType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Transmission</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{inspectVehicle.transmission}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Displacement</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{inspectVehicle.engineCapacity || 'Not Provided'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Mileage / Range</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{inspectVehicle.mileage || 'Not Provided'}</span>
                </div>
              </div>
            </div>

            {/* 3. Vehicle Condition & Additional Details (Requirement 23) */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#77101F]" />
                <span>3. Vehicle Condition & Additional Details</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {/* Spare Key */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Key className="w-3 h-3 text-[#77101F]" /> Spare Key
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    {inspectVehicle.has_spare_key !== undefined
                      ? (inspectVehicle.has_spare_key ? 'Yes (Available)' : 'No')
                      : (inspectVehicle.spareKeyAvailable || 'Not Provided')}
                  </span>
                </div>

                {/* Insurance Validity */}
                {(() => {
                  const ins = calculateInsuranceStatus(inspectVehicle.insurance_valid_until);
                  return (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#77101F]" /> Insurance Validity
                        </span>
                        {inspectVehicle.insurance_valid_until && (
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${ins.badgeClass}`}>
                            {ins.status}
                          </span>
                        )}
                      </div>
                      <span className={`font-bold mt-1 block ${inspectVehicle.insurance_valid_until ? ins.colorClass : 'text-slate-900'}`}>
                        {inspectVehicle.insurance_valid_until || 'Not Provided'}
                      </span>
                    </div>
                  );
                })()}

                {/* Hypothecation Status */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#77101F]" /> Hypothecation
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    {inspectVehicle.hypothecation_status || 'No Hypothecation / Clear'}
                  </span>
                  {inspectVehicle.financier_name && (
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      Financier: {inspectVehicle.financier_name}
                    </span>
                  )}
                </div>

                {/* OEM Service History */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Wrench className="w-3 h-3 text-[#77101F]" /> OEM Service History
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    {inspectVehicle.oem_service_status || 'Full OEM Service History'}
                  </span>
                </div>

                {/* Engine Warranty */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#77101F]" /> Engine Warranty
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    {inspectVehicle.engine_warranty_status || 'Active'}
                    {inspectVehicle.engine_warranty_valid_until && (
                      <span className="text-[10px] text-slate-500 block">Until {inspectVehicle.engine_warranty_valid_until}</span>
                    )}
                  </span>
                </div>

                {/* Major Accident History */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-[#77101F]" /> Accident History
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    {inspectVehicle.major_accident_history || inspectVehicle.accidentHistory || 'No Major Accident'}
                  </span>
                  {inspectVehicle.major_accident_details && (
                    <span className="text-[10px] text-rose-700 italic block">{inspectVehicle.major_accident_details}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Commercial Specifications (if applicable) */}
            {(inspectVehicle.category === 'Trucks & Lorries' || 
              inspectVehicle.category === 'Buses' || 
              inspectVehicle.category === 'Heavy Machinery Vehicles' ||
              inspectVehicle.load_capacity || 
              inspectVehicle.max_operating_weight) && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <Weight className="w-4 h-4 text-blue-600" />
                  <span>4. Commercial Specifications</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-600 font-bold uppercase block">Load Capacity</span>
                    <span className="font-bold text-blue-950 mt-1 block">
                      {inspectVehicle.load_capacity || inspectVehicle.loadCapacity || 'Not Provided'} {inspectVehicle.load_capacity_unit || 'Tonnes'}
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-600 font-bold uppercase block">Operating Weight</span>
                    <span className="font-bold text-blue-950 mt-1 block">
                      {inspectVehicle.max_operating_weight || inspectVehicle.maxOperatingWeight || 'Not Provided'} {inspectVehicle.max_operating_weight_unit || 'tonnes'}
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-600 font-bold uppercase block">Max Height</span>
                    <span className="font-bold text-blue-950 mt-1 block">
                      {inspectVehicle.max_height_capacity || inspectVehicle.maxHeightCapacity || 'Not Provided'} {inspectVehicle.max_height_capacity_unit || 'metres'}
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-600 font-bold uppercase block">Max Lift</span>
                    <span className="font-bold text-blue-950 mt-1 block">
                      {inspectVehicle.max_lift_capacity || inspectVehicle.maxLiftCapacity || 'Not Provided'} {inspectVehicle.max_lift_capacity_unit || 'tonnes'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Heavy Machinery Specifications (if applicable) */}
            {(inspectVehicle.category === 'Heavy Machinery Vehicles' || 
              inspectVehicle.maximum_digging_power || 
              inspectVehicle.engine_power) && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-amber-600" />
                  <span>5. Heavy Machinery Specifications</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-800 font-bold uppercase block">Max Digging Power</span>
                    <span className="font-bold text-amber-950 mt-1 block">
                      {inspectVehicle.maximum_digging_power ? `${inspectVehicle.maximum_digging_power} ${inspectVehicle.maximum_digging_power_unit || 'kN'}` : 'Not Provided'}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-800 font-bold uppercase block">Engine Power Rating</span>
                    <span className="font-bold text-amber-950 mt-1 block">
                      {inspectVehicle.engine_power ? `${inspectVehicle.engine_power} ${inspectVehicle.engine_power_unit || 'HP'}` : 'Not Provided'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. RC & Insurance Documents */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#77101F]" />
                <span>6. Legal RC & Insurance Documents</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* RC Document */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Registration Certificate (RC)</span>
                    <span className="text-[10px] text-slate-500">Status: {inspectVehicle.rc_verification_status || 'PENDING'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRcViewerImage(inspectVehicle.rc_front_url || inspectVehicle.rcDocumentUrl || 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800')}
                    className="px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:border-[#77101F]"
                  >
                    View RC
                  </button>
                </div>

                {/* Insurance Document */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Insurance Policy Certificate</span>
                    <span className="text-[10px] text-slate-500">Status: {inspectVehicle.insurance_verification_status || 'PENDING'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRcViewerImage(inspectVehicle.insurance_document_url || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800')}
                    className="px-3 py-1 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:border-[#77101F]"
                  >
                    View Policy
                  </button>
                </div>
              </div>
            </div>

            {/* 7. Seller Information */}
            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-purple-700 uppercase block">Seller Information</span>
                <span className="font-bold text-slate-900">{inspectVehicle.seller?.name} • {inspectVehicle.seller?.phone}</span>
                <span className="text-[11px] text-slate-500 block">{inspectVehicle.location?.city}, {inspectVehicle.location?.state}</span>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-white px-3 py-1 rounded-lg border border-purple-200">
                {inspectVehicle.seller?.type || 'Direct Owner'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedVehicleId(inspectVehicle.id);
                  navigate(`/buy/${inspectVehicle.id}`);
                }}
                className="text-xs font-bold text-[#77101F] hover:underline"
              >
                Open Live Marketplace Page →
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingVehicle({ ...inspectVehicle });
                    setInspectVehicle(null);
                  }}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => setInspectVehicle(null)}
                  className="px-5 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          ADMIN VEHICLE EDITOR MODAL (Requirement 7)
          Category -> Brand -> Model -> Variant Architecture
      ==================================================== */}
      {editingVehicle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Edit Vehicle Specifications
                </h3>
                <p className="text-xs text-slate-500">
                  Update category, brand, model, condition, and commercial specifications.
                </p>
              </div>
              <button onClick={() => setEditingVehicle(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Category -> Brand -> Model -> Variant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Category *</label>
                  <select
                    value={editingVehicle.category}
                    onChange={(e) => {
                      const newCat = e.target.value as VehicleCategory;
                      setEditingVehicle({
                        ...editingVehicle,
                        category: newCat,
                        brand: '',
                        model: '',
                        variant: ''
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Cars">Cars</option>
                    <option value="Bikes & Scooters">Bikes & Scooters</option>
                    <option value="Trucks & Lorries">Trucks & Lorries</option>
                    <option value="Buses">Buses</option>
                    <option value="Tractors & Backhoe Loaders">Tractors & Backhoe Loaders</option>
                    <option value="Heavy Machinery Vehicles">Heavy Machinery Vehicles</option>
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Make / Brand *</label>
                  {editorBrands.length > 0 ? (
                    <select
                      value={editingVehicle.brand}
                      onChange={(e) => {
                        const newBrand = e.target.value;
                        setEditingVehicle({
                          ...editingVehicle,
                          brand: newBrand,
                          model: '',
                          variant: ''
                        });
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="">Select Brand...</option>
                      {editorBrands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editingVehicle.brand}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, brand: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  )}
                </div>

                {/* Model */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model Name *</label>
                  {editorModels.length > 0 ? (
                    <select
                      value={editingVehicle.model}
                      onChange={(e) => {
                        const newModel = e.target.value;
                        setEditingVehicle({
                          ...editingVehicle,
                          model: newModel,
                          variant: ''
                        });
                      }}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="">Select Model...</option>
                      {editorModels.map(m => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editingVehicle.model}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  )}
                </div>

                {/* Variant */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Variant / Trim</label>
                  {editorVariants.length > 0 ? (
                    <select
                      value={editingVehicle.variant || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, variant: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="">Select Variant...</option>
                      {editorVariants.map(v => (
                        <option key={v.id} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editingVehicle.variant || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, variant: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={editingVehicle.price}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                {/* KM Driven */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">KM Driven / Hours *</label>
                  <input
                    type="number"
                    value={editingVehicle.kmDriven}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, kmDriven: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Condition Section */}
              <div className="border-t border-slate-100 pt-4">
                <span className="font-black text-slate-900 uppercase tracking-wider block mb-3">
                  Condition & Legal Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Spare Key */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Spare Key *</label>
                    <select
                      value={editingVehicle.has_spare_key ? 'Yes' : 'No'}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, has_spare_key: e.target.value === 'Yes' })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="Yes">Yes (Available)</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {/* Insurance Validity Date */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Insurance Validity *</label>
                    <input
                      type="date"
                      value={editingVehicle.insurance_valid_until || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, insurance_valid_until: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  </div>

                  {/* Hypothecation Status */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hypothecation Status *</label>
                    <select
                      value={editingVehicle.hypothecation_status || 'No Hypothecation / Clear'}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, hypothecation_status: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="No Hypothecation / Clear">No Hypothecation / Clear</option>
                      <option value="Active Loan / Hypothecated">Active Loan / Hypothecated</option>
                      <option value="NOC Available">NOC Available</option>
                      <option value="Loan Closed - Removal Pending">Loan Closed - Removal Pending</option>
                      <option value="Not Sure">Not Sure</option>
                    </select>
                  </div>

                  {/* OEM Service History */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">OEM Service History *</label>
                    <select
                      value={editingVehicle.oem_service_status || 'Full OEM Service History'}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, oem_service_status: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="Full OEM Service History">Full OEM Service History</option>
                      <option value="Partial OEM Service History">Partial OEM Service History</option>
                      <option value="Independent Service History">Independent Service History</option>
                      <option value="No Service Records">No Service Records</option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingVehicle(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedVehicle}
                className="px-5 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RC Viewer Modal */}
      {rcViewerImage && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#77101F]" />
                <h3 className="text-sm font-bold text-slate-900">Document Audit Viewer</h3>
              </div>
              <button 
                onClick={() => setRcViewerImage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-900 rounded-xl p-2">
              <img src={rcViewerImage} alt="Document" className="max-h-[65vh] w-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
