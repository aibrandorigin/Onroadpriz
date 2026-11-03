import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MasterCategory, MasterBrand, MasterModel, MasterVariant } from '../../types';
import { 
  FolderTree, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Layers, 
  Car, 
  Fuel, 
  SlidersHorizontal, 
  ShieldCheck, 
  AlertTriangle, 
  Search,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export const MasterDataTab: React.FC = () => {
  const {
    masterCategories,
    masterBrands,
    masterModels,
    masterVariants,
    masterFuelTypes,
    masterTransmissionTypes,
    masterBodyTypes,
    addMasterBrand,
    updateMasterBrand,
    toggleMasterBrand,
    deleteMasterBrand,
    reorderMasterBrands,
    addMasterModel,
    updateMasterModel,
    toggleMasterModel,
    deleteMasterModel,
    reorderMasterModels,
    addMasterVariant,
    updateMasterVariant,
    toggleMasterVariant,
    deleteMasterVariant,
    addMasterFuelType,
    deleteMasterFuelType,
    addMasterTransmissionType,
    deleteMasterTransmissionType,
    addMasterBodyType,
    deleteMasterBodyType,
    isBrandInUse,
    isModelInUse,
    showToast
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'hierarchy' | 'variants' | 'specs'>('hierarchy');

  // Hierarchy Selection State
  const [selectedCategory, setSelectedCategory] = useState<string>(() => masterCategories[0]?.id || 'Cars');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  // Search filter
  const [brandSearch, setBrandSearch] = useState<string>('');
  const [modelSearch, setModelSearch] = useState<string>('');

  // Modals / Inline Edit states
  const [newBrandModalOpen, setNewBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState('');

  const [editBrandModal, setEditBrandModal] = useState<MasterBrand | null>(null);

  const [newModelModalOpen, setNewModelModalOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [editModelModal, setEditModelModal] = useState<MasterModel | null>(null);

  const [newVariantModalOpen, setNewVariantModalOpen] = useState(false);
  const [newVariantName, setNewVariantName] = useState('');
  const [editVariantModal, setEditVariantModal] = useState<MasterVariant | null>(null);

  // New spec inputs
  const [newFuelInput, setNewFuelInput] = useState('');
  const [newTransInput, setNewTransInput] = useState('');
  const [newBodyInput, setNewBodyInput] = useState('');

  // Filtered brands for current category
  const currentBrands = masterBrands
    .filter(b => {
      const bCat = (b.categoryId || '').toLowerCase();
      const sCat = (selectedCategory || '').toLowerCase();
      return bCat === sCat || 
        (sCat.includes('machinery') && bCat.includes('machinery')) || 
        (sCat.includes('tractor') && bCat.includes('tractor')) || 
        (sCat.includes('truck') && bCat.includes('truck')) || 
        (sCat.includes('bus') && bCat.includes('bus')) || 
        (sCat.includes('bike') && bCat.includes('bike')) || 
        (sCat.includes('car') && bCat.includes('car'));
    })
    .filter(b => !brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase()))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Current selected brand object
  const activeBrand = masterBrands.find(b => b.id === selectedBrandId) || currentBrands[0];

  // Filtered models for active brand
  const currentModels = masterModels
    .filter(m => activeBrand && m.brandId === activeBrand.id)
    .filter(m => !modelSearch || m.name.toLowerCase().includes(modelSearch.toLowerCase()))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Current selected model object
  const activeModel = masterModels.find(m => m.id === selectedModelId) || currentModels[0];

  // Filtered variants for active model
  const currentVariants = masterVariants
    .filter(v => activeModel && v.modelId === activeModel.id);

  // Move Brand Up/Down
  const handleMoveBrand = (brandId: string, direction: 'up' | 'down') => {
    const list = [...currentBrands];
    const index = list.findIndex(b => b.id === brandId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    reorderMasterBrands(selectedCategory, list.map(b => b.id));
  };

  // Move Model Up/Down
  const handleMoveModel = (modelId: string, direction: 'up' | 'down') => {
    if (!activeBrand) return;
    const list = [...currentModels];
    const index = list.findIndex(m => m.id === modelId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    reorderMasterModels(activeBrand.id, list.map(m => m.id));
  };

  const handleSaveNewBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    addMasterBrand({
      categoryId: selectedCategory,
      name: newBrandName.trim(),
      logo: newBrandLogo.trim() || undefined,
      active: true
    });
    setNewBrandName('');
    setNewBrandLogo('');
    setNewBrandModalOpen(false);
  };

  const handleSaveEditBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBrandModal || !editBrandModal.name.trim()) return;
    updateMasterBrand(editBrandModal.id, {
      name: editBrandModal.name.trim(),
      logo: editBrandModal.logo?.trim() || undefined
    });
    setEditBrandModal(null);
  };

  const handleSaveNewModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrand || !newModelName.trim()) return;
    addMasterModel({
      brandId: activeBrand.id,
      name: newModelName.trim(),
      active: true
    });
    setNewModelName('');
    setNewModelModalOpen(false);
  };

  const handleSaveEditModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModelModal || !editModelModal.name.trim()) return;
    updateMasterModel(editModelModal.id, {
      name: editModelModal.name.trim()
    });
    setEditModelModal(null);
  };

  const handleSaveNewVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModel || !newVariantName.trim()) return;
    addMasterVariant({
      modelId: activeModel.id,
      name: newVariantName.trim(),
      active: true
    });
    setNewVariantName('');
    setNewVariantModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#77101F]/10 text-[#77101F] text-xs font-bold mb-2">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Master Data Repository</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Vehicle Master Data Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Configure authoritative vehicle categories, manufacturer brands, models, variants, and technical specifications used across OnRoadPriz marketplace search and listing creation.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveSubTab('hierarchy')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeSubTab === 'hierarchy'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Brands & Models
          </button>
          <button
            onClick={() => setActiveSubTab('variants')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeSubTab === 'variants'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Variants Catalog
          </button>
          <button
            onClick={() => setActiveSubTab('specs')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeSubTab === 'specs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Technical Specs
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: HIERARCHY (CATEGORY -> BRAND -> MODEL) */}
      {activeSubTab === 'hierarchy' && (
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
              1. Select Vehicle Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {masterCategories.map(cat => {
                const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
                const brandCount = masterBrands.filter(b => b.categoryId.toLowerCase() === cat.id.toLowerCase()).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      const firstBrand = masterBrands.find(b => b.categoryId.toLowerCase() === cat.id.toLowerCase());
                      if (firstBrand) setSelectedBrandId(firstBrand.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#77101F] bg-[#77101F]/5 text-[#77101F] font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{cat.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{brandCount} Brands</span>
                      {isSelected && <Check className="w-3 h-3 text-[#77101F]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Column Master Grid: Brands (Left) & Models (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1: BRANDS MANAGEMENT (5 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#77101F]" />
                    <span>Brands ({currentBrands.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Click brand to view its associated models</p>
                </div>
                <button
                  onClick={() => setNewBrandModalOpen(true)}
                  className="px-3 py-1.5 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Brand</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={e => setBrandSearch(e.target.value)}
                    placeholder="Search brand name..."
                    className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#77101F]"
                  />
                  {brandSearch && (
                    <button onClick={() => setBrandSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Brands List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {currentBrands.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No brands found for this category.
                  </div>
                ) : (
                  currentBrands.map((brand, idx) => {
                    const isSelected = activeBrand && activeBrand.id === brand.id;
                    const inUse = isBrandInUse(brand.name);
                    const modelCount = masterModels.filter(m => m.brandId === brand.id).length;

                    return (
                      <div
                        key={brand.id}
                        onClick={() => {
                          setSelectedBrandId(brand.id);
                          const firstModel = masterModels.find(m => m.brandId === brand.id);
                          if (firstModel) setSelectedModelId(firstModel.id);
                        }}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? 'border-[#77101F] bg-[#77101F]/5 shadow-2xs'
                            : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Order Badges */}
                          <div className="flex flex-col gap-0.5 opacity-60 group-hover:opacity-100">
                            <button
                              disabled={idx === 0}
                              onClick={(e) => { e.stopPropagation(); handleMoveBrand(brand.id, 'up'); }}
                              className="p-0.5 hover:text-[#77101F] disabled:opacity-20"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={idx === currentBrands.length - 1}
                              onClick={(e) => { e.stopPropagation(); handleMoveBrand(brand.id, 'down'); }}
                              className="p-0.5 hover:text-[#77101F] disabled:opacity-20"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Brand Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#77101F]' : 'text-slate-800'}`}>
                                {brand.name}
                              </span>
                              {!brand.active && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                  Disabled
                                </span>
                              )}
                              {inUse && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700" title="Referenced in live vehicles">
                                  In Use
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {modelCount} Models listed
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          {/* Toggle Active */}
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleMasterBrand(brand.id); }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              brand.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={brand.active ? 'Active (Click to disable)' : 'Disabled (Click to enable)'}
                          >
                            {brand.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Brand */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditBrandModal({ ...brand }); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Brand Name"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Brand */}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteMasterBrand(brand.id); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={inUse ? 'Cannot delete: in use by existing vehicles (will deactivate)' : 'Delete Brand'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* COLUMN 2: MODELS MANAGEMENT FOR SELECTED BRAND (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#77101F]" />
                    <span>Models for {activeBrand?.name || 'Brand'} ({currentModels.length})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Manage models &amp; variants hierarchy</p>
                </div>
                <button
                  disabled={!activeBrand}
                  onClick={() => setNewModelModalOpen(true)}
                  className="px-3 py-1.5 bg-[#77101F] hover:bg-[#5E0B17] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Model</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={modelSearch}
                    onChange={e => setModelSearch(e.target.value)}
                    placeholder={`Search ${activeBrand?.name || ''} models...`}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-[#77101F]"
                  />
                  {modelSearch && (
                    <button onClick={() => setModelSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Models List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {currentModels.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No models registered for {activeBrand?.name}. Click "Add Model" above to create one.
                  </div>
                ) : (
                  currentModels.map((model, idx) => {
                    const isSelected = activeModel && activeModel.id === model.id;
                    const inUse = isModelInUse(model.name);
                    const variantCount = masterVariants.filter(v => v.modelId === model.id).length;

                    return (
                      <div
                        key={model.id}
                        onClick={() => setSelectedModelId(model.id)}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? 'border-[#77101F] bg-[#77101F]/5 shadow-2xs'
                            : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Order Up/Down */}
                          <div className="flex flex-col gap-0.5 opacity-60 group-hover:opacity-100">
                            <button
                              disabled={idx === 0}
                              onClick={(e) => { e.stopPropagation(); handleMoveModel(model.id, 'up'); }}
                              className="p-0.5 hover:text-[#77101F] disabled:opacity-20"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={idx === currentModels.length - 1}
                              onClick={(e) => { e.stopPropagation(); handleMoveModel(model.id, 'down'); }}
                              className="p-0.5 hover:text-[#77101F] disabled:opacity-20"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#77101F]' : 'text-slate-800'}`}>
                                {model.name}
                              </span>
                              {!model.active && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                                  Disabled
                                </span>
                              )}
                              {inUse && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700">
                                  In Use
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {variantCount} Variants configured
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleMasterModel(model.id); }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              model.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                            title={model.active ? 'Active' : 'Disabled'}
                          >
                            {model.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); setEditModelModal({ ...model }); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Model Name"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); deleteMasterModel(model.id); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Model"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 2: VARIANTS CATALOG */}
      {activeSubTab === 'variants' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#77101F]" />
                <span>Variants for {activeBrand?.name} {activeModel?.name}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Trim and edition levels (e.g., SX, Turbo, Titanium, ZXi+, etc.)
              </p>
            </div>

            <button
              disabled={!activeModel}
              onClick={() => setNewVariantModalOpen(true)}
              className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentVariants.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No trim variants configured for {activeModel?.name || 'this model'}. Click "Add Variant" above to add trims.
              </div>
            ) : (
              currentVariants.map(variant => (
                <div
                  key={variant.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900">{variant.name}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {variant.active ? 'Active' : 'Disabled'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleMasterVariant(variant.id)}
                      className={`p-1.5 rounded-lg ${variant.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'}`}
                      title="Toggle active"
                    >
                      {variant.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setEditVariantModal({ ...variant })}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMasterVariant(variant.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TECHNICAL SPECIFICATIONS (FUEL, TRANSMISSION, BODY TYPES) */}
      {activeSubTab === 'specs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Fuel Types */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-[#77101F]" />
                  <span>Fuel Types ({masterFuelTypes.length})</span>
                </h3>
              </div>
              <div className="space-y-1.5 mb-4">
                {masterFuelTypes.map((fuel, idx) => (
                  <div key={`master-fuel-${fuel}-${idx}`} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>{fuel}</span>
                    <button
                      onClick={() => deleteMasterFuelType(fuel)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Remove Fuel Type"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newFuelInput.trim()) return;
                addMasterFuelType(newFuelInput.trim());
                setNewFuelInput('');
              }}
              className="flex gap-2 pt-2 border-t border-slate-100"
            >
              <input
                type="text"
                value={newFuelInput}
                onChange={e => setNewFuelInput(e.target.value)}
                placeholder="New Fuel (e.g. Bio-CNG)"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#77101F]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#77101F] text-white text-xs font-bold rounded-lg hover:bg-[#5E0B17] shrink-0"
              >
                Add
              </button>
            </form>
          </div>

          {/* Transmission Types */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#77101F]" />
                  <span>Transmissions ({masterTransmissionTypes.length})</span>
                </h3>
              </div>
              <div className="space-y-1.5 mb-4">
                {masterTransmissionTypes.map((trans, idx) => (
                  <div key={`master-trans-${trans}-${idx}`} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>{trans}</span>
                    <button
                      onClick={() => deleteMasterTransmissionType(trans)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Remove Transmission"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTransInput.trim()) return;
                addMasterTransmissionType(newTransInput.trim());
                setNewTransInput('');
              }}
              className="flex gap-2 pt-2 border-t border-slate-100"
            >
              <input
                type="text"
                value={newTransInput}
                onChange={e => setNewTransInput(e.target.value)}
                placeholder="New Transmission (e.g. iMT)"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#77101F]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#77101F] text-white text-xs font-bold rounded-lg hover:bg-[#5E0B17] shrink-0"
              >
                Add
              </button>
            </form>
          </div>

          {/* Body Types */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#77101F]" />
                  <span>Body Types ({masterBodyTypes.length})</span>
                </h3>
              </div>
              <div className="space-y-1.5 mb-4 max-h-[300px] overflow-y-auto">
                {masterBodyTypes.map((body, idx) => (
                  <div key={`master-body-${body}-${idx}`} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>{body}</span>
                    <button
                      onClick={() => deleteMasterBodyType(body)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Remove Body Type"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newBodyInput.trim()) return;
                addMasterBodyType(newBodyInput.trim());
                setNewBodyInput('');
              }}
              className="flex gap-2 pt-2 border-t border-slate-100"
            >
              <input
                type="text"
                value={newBodyInput}
                onChange={e => setNewBodyInput(e.target.value)}
                placeholder="New Body Type (e.g. Station Wagon)"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#77101F]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#77101F] text-white text-xs font-bold rounded-lg hover:bg-[#5E0B17] shrink-0"
              >
                Add
              </button>
            </form>
          </div>

        </div>
      )}

      {/* MODAL: ADD BRAND */}
      {newBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add New Brand to Category</h3>
              <button onClick={() => setNewBrandModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveNewBrand} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand / Manufacturer Name *</label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  placeholder="e.g. BYD, Isuzu, Royal Enfield"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#77101F] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Logo Icon URL (Optional)</label>
                <input
                  type="url"
                  value={newBrandLogo}
                  onChange={e => setNewBrandLogo(e.target.value)}
                  placeholder="https://... logo.png"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#77101F] focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewBrandModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold rounded-xl"
                >
                  Create Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BRAND */}
      {editBrandModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit Brand Details</h3>
              <button onClick={() => setEditBrandModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditBrand} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editBrandModal.name}
                  onChange={e => setEditBrandModal({ ...editBrandModal, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#77101F] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Logo Icon URL</label>
                <input
                  type="url"
                  value={editBrandModal.logo || ''}
                  onChange={e => setEditBrandModal({ ...editBrandModal, logo: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#77101F] focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditBrandModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MODEL */}
      {newModelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add New Model for {activeBrand?.name}</h3>
              <button onClick={() => setNewModelModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveNewModel} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={newModelName}
                  onChange={e => setNewModelName(e.target.value)}
                  placeholder="e.g. Tucson, Alcazar, Ioniq 5"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#77101F] focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewModelModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold rounded-xl"
                >
                  Create Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MODEL */}
      {editModelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit Model</h3>
              <button onClick={() => setEditModelModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditModel} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={editModelModal.name}
                  onChange={e => setEditModelModal({ ...editModelModal, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#77101F] focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModelModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold rounded-xl"
                >
                  Save Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD VARIANT */}
      {newVariantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add Trim Variant for {activeModel?.name}</h3>
              <button onClick={() => setNewVariantModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveNewVariant} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Variant / Trim Title *</label>
                <input
                  type="text"
                  required
                  value={newVariantName}
                  onChange={e => setNewVariantName(e.target.value)}
                  placeholder="e.g. SX (O) Turbo, Prestige Plus, ZX"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#77101F] focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNewVariantModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold rounded-xl"
                >
                  Create Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT VARIANT */}
      {editVariantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Edit Trim Variant</h3>
              <button onClick={() => setEditVariantModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editVariantModal.name.trim()) return;
              updateMasterVariant(editVariantModal.id, { name: editVariantModal.name.trim() });
              setEditVariantModal(null);
            }} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Variant Name *</label>
                <input
                  type="text"
                  required
                  value={editVariantModal.name}
                  onChange={e => setEditVariantModal({ ...editVariantModal, name: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#77101F] focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditVariantModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold rounded-xl"
                >
                  Save Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
