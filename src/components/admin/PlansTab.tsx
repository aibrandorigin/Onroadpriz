import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerPlan, BuyerPlan } from '../../types';
import { 
  CreditCard, 
  Plus, 
  Check, 
  Edit2, 
  Copy, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Percent, 
  IndianRupee, 
  Layers, 
  X,
  Sparkles
} from 'lucide-react';

export const PlansTab: React.FC = () => {
  const { 
    sellerPlans, 
    buyerPlans, 
    addSellerPlan, 
    updateSellerPlan, 
    deleteSellerPlan, 
    addBuyerPlan, 
    updateBuyerPlan, 
    deleteBuyerPlan, 
    settings, 
    showToast 
  } = useApp();

  const [activePlanType, setActivePlanType] = useState<'seller' | 'buyer'>('seller');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Form Fields
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(999);
  const [taxPercent, setTaxPercent] = useState<number>(settings.gstRatePercent ?? 18);
  const [validityDays, setValidityDays] = useState<number>(30);
  const [listingsLimit, setListingsLimit] = useState<number>(2);
  const [featuresText, setFeaturesText] = useState('2 Vehicle Listings\n15 Photos per vehicle\nDirect buyer inquiries access');
  const [isPopular, setIsPopular] = useState(false);

  // Live tax calculation
  const taxAmount = (basePrice * (taxPercent / 100));
  const finalPrice = Math.round(basePrice + taxAmount);

  const handleOpenCreateModal = () => {
    setEditingPlanId(null);
    setPlanName('');
    setDescription('Perfect for individual direct vehicle owners.');
    setBasePrice(activePlanType === 'seller' ? 999 : 499);
    setTaxPercent(settings.gstRatePercent ?? 18);
    setValidityDays(30);
    setListingsLimit(activePlanType === 'seller' ? 2 : 10);
    setFeaturesText(activePlanType === 'seller' 
      ? '2 Vehicle Listings\n15 Photos per vehicle\nDirect Owner Badge\nZero Brokerage' 
      : '10 Owner Contact Unlocks\nDirect WhatsApp Access\nVehicle History Inspection\nInstant SMS Alerts');
    setIsPopular(false);
    setModalOpen(true);
  };

  const handleEditPlan = (plan: SellerPlan | BuyerPlan) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setDescription(plan.description || '');
    setBasePrice(plan.price);
    setTaxPercent(settings.gstRatePercent ?? 18);
    setValidityDays(plan.durationDays || plan.validityDays || 30);
    setListingsLimit('listingsLimit' in plan ? (plan.listingsLimit || 2) : ((plan as any).contactsLimit || 2));
    setFeaturesText((plan.features || []).join('\n'));
    setIsPopular(Boolean(plan.popular));
    setModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const features = featuresText.split('\n').map(f => f.trim()).filter(Boolean);

    if (activePlanType === 'seller') {
      if (editingPlanId) {
        updateSellerPlan(editingPlanId, {
          name: planName,
          description,
          price: basePrice,
          durationDays: validityDays,
          listingsLimit,
          features,
          popular: isPopular
        });
      } else {
        addSellerPlan({
          name: planName,
          description,
          price: basePrice,
          durationDays: validityDays,
          listingsLimit,
          features,
          popular: isPopular,
          active: true
        });
      }
    } else {
      if (editingPlanId) {
        updateBuyerPlan(editingPlanId, {
          name: planName,
          description,
          price: basePrice,
          durationDays: validityDays,
          features,
          popular: isPopular
        });
      } else {
        addBuyerPlan({
          name: planName,
          description,
          price: basePrice,
          durationDays: validityDays,
          features,
          popular: isPopular,
          active: true
        });
      }
    }

    setModalOpen(false);
  };

  const handleDuplicate = (plan: any) => {
    if (activePlanType === 'seller') {
      addSellerPlan({
        ...plan,
        id: undefined,
        name: `${plan.name} (Copy)`
      });
    } else {
      addBuyerPlan({
        ...plan,
        id: undefined,
        name: `${plan.name} (Copy)`
      });
    }
  };

  const handleToggleActive = (plan: any) => {
    const updated = !plan.active;
    if (activePlanType === 'seller') {
      updateSellerPlan(plan.id, { active: updated });
    } else {
      updateBuyerPlan(plan.id, { active: updated });
    }
    showToast('Plan Status Updated', `Plan marked as ${updated ? 'Active' : 'Inactive'}.`, 'info');
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete plan "${name}"?`)) {
      if (activePlanType === 'seller') {
        deleteSellerPlan(id);
      } else {
        deleteBuyerPlan(id);
      }
    }
  };

  const currentPlans = activePlanType === 'seller' ? sellerPlans : buyerPlans;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Plans Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#77101F]/10 text-[#77101F]">
              {currentPlans.length} Available Plans
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure subscription tiers, limits, GST calculations, and benefits for vehicle sellers and buyers.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl hover:bg-[#5E0B17] transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create {activePlanType === 'seller' ? 'Seller' : 'Buyer'} Plan</span>
        </button>
      </div>

      {/* Tabs Switcher: SELLER PLANS vs BUYER PLANS */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActivePlanType('seller')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activePlanType === 'seller'
              ? 'border-[#77101F] text-[#77101F]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Seller Membership Plans ({sellerPlans.length})</span>
        </button>

        <button
          onClick={() => setActivePlanType('buyer')}
          className={`pb-3 text-xs font-black uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            activePlanType === 'buyer'
              ? 'border-[#77101F] text-[#77101F]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Buyer Membership Plans ({buyerPlans.length})</span>
        </button>
      </div>

      {/* Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentPlans.map((plan: any, idx) => {
          const planGst = plan.price * ((settings.gstRatePercent ?? 18) / 100);
          const inclusivePrice = Math.round(plan.price + planGst);

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
                plan.active !== false ? 'border-slate-200/80 hover:border-slate-300' : 'border-slate-200/50 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{plan.name}</span>
                    {plan.popular && (
                      <span className="text-[10px] font-bold bg-[#77101F] text-white px-2 py-0.5 rounded-full uppercase">
                        Popular
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    plan.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {plan.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  {plan.description || 'Configured marketplace subscription tier.'}
                </p>

                {/* Price Breakdown */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Amount:</span>
                    <span className="font-semibold text-slate-800">₹{plan.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>GST ({settings.gstRatePercent ?? 18}%):</span>
                    <span>₹{planGst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/70 font-black text-slate-900 text-sm">
                    <span>Final Price:</span>
                    <span className="text-[#77101F]">₹{inclusivePrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Validity & Limits */}
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-4">
                  <div className="p-2 bg-slate-50/70 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Validity</span>
                    <span className="font-bold text-slate-800">{plan.durationDays || plan.validityDays || 30} Days</span>
                  </div>
                  <div className="p-2 bg-slate-50/70 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Listings / Unlocks</span>
                    <span className="font-bold text-slate-800">
                      {plan.listingsLimit || plan.contactsLimit || 'Standard'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-1.5 text-xs text-slate-600 mb-5">
                  {(plan.features || []).slice(0, 4).map((feat: string, i: number) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    {plan.active !== false ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDuplicate(plan)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Duplicate Plan"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Edit Plan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id, plan.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingPlanId ? `Edit ${activePlanType === 'seller' ? 'Seller' : 'Buyer'} Plan` : `Create New ${activePlanType === 'seller' ? 'Seller' : 'Buyer'} Plan`}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Standard Owner Plan, Dealer Pro Unlimited"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Price (INR) *</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Validity (Days) *</label>
                  <input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                    required
                  />
                </div>
              </div>

              {/* Live Price Reconcile Box */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Base Price:</span>
                  <span>₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST ({taxPercent}%):</span>
                  <span>+ ₹{taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                  <span>Final Customer Price:</span>
                  <span className="text-[#77101F]">₹{finalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded text-[#77101F]"
                />
                <label htmlFor="popularCheck" className="font-bold text-slate-700 cursor-pointer">
                  Tag as "Most Popular" Plan
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#77101F] text-white font-bold rounded-xl hover:bg-[#5E0B17]"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
