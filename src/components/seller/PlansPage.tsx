import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SellerPlan, BuyerPlan } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  CreditCard, 
  ArrowRight, 
  X, 
  Lock,
  QrCode,
  Building2,
  Car,
  Phone,
  MessageSquare,
  FileCheck,
  AlertCircle,
  HelpCircle,
  BadgeCheck
} from 'lucide-react';

export const PlansPage: React.FC = () => {
  const { 
    sellerPlans, 
    buyerPlans, 
    currentUser, 
    purchasePlan, 
    showToast, 
    navigate,
    currentPath,
    authReturnTo,
    setAuthReturnTo,
    setAuthModalOpen
  } = useApp();

  // Extract returnTo from URL search or state
  const [returnTo, setReturnTo] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('returnTo') || authReturnTo;
    } catch {
      return authReturnTo;
    }
  });

  // Active Tab: 'buyer' or 'seller'
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>(() => {
    if (currentPath.includes('seller') || currentPath.includes('post')) return 'seller';
    if (currentPath.includes('buyer')) return 'buyer';
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'seller') return 'seller';
    if (params.get('tab') === 'buyer' || params.get('returnTo')) return 'buyer';
    return 'buyer';
  });

  // Update tab if path changes
  useEffect(() => {
    if (currentPath.includes('/plans/seller') || currentPath === '/seller/plans') {
      setActiveTab('seller');
    } else if (currentPath.includes('/plans/buyer') || currentPath === '/buyer/plans') {
      setActiveTab('buyer');
    }
  }, [currentPath]);

  // Payment Modal State
  const [selectedPlan, setSelectedPlan] = useState<SellerPlan | BuyerPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('onroadpriz@upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChoosePlan = (plan: SellerPlan | BuyerPlan) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      showToast('Sign In Required', 'Please sign in or register to select and activate this plan.', 'info');
      return;
    }
    setSelectedPlan(plan);
  };

  const handleProcessPayment = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);

    const planType = activeTab === 'buyer' ? 'Buyer' : 'Seller';
    const result = await purchasePlan(selectedPlan.id, planType, paymentMethod === 'upi' ? 'UPI' : 'Card');
    setIsProcessing(false);
    setSelectedPlan(null);

    if (result.success) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // safe
      }

      // If customer was redirected here while trying to access a vehicle or sell, return them automatically!
      if (returnTo) {
        const target = returnTo;
        setReturnTo(null);
        setAuthReturnTo(null);
        showToast(
          'Access Granted!',
          target.includes('/sell')
            ? 'Returning you to Sell Vehicle...'
            : 'Returning you to your selected vehicle...',
          'success'
        );
        setTimeout(() => {
          navigate(target);
        }, 800);
      }
    }
  };

  const isSellerReturn = returnTo?.includes('/sell');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* ACCESS REQUIREMENT NOTIFICATION BANNER (Requirements 2, 5, 6, 8) */}
      {returnTo && (
        <div className="bg-gradient-to-r from-[#77101F] to-[#5E0B17] text-white rounded-2xl p-5 shadow-xl border border-white/20 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <span>
                    {isSellerReturn
                      ? 'An active Seller Plan is required to list your vehicle.'
                      : 'An active Buyer Plan is required to view complete vehicle details.'}
                  </span>
                  <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    {isSellerReturn ? 'Seller Subscription' : 'Buyer Membership'}
                  </span>
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  {isSellerReturn
                    ? 'Select an eligible Seller Plan below to publish your vehicle with 0% brokerage and verified buyer leads. You will return automatically to start listing.'
                    : 'Select an eligible Buyer Plan below to unlock the verified owner\'s direct phone number, WhatsApp contact, and RTO RC report. You will return automatically upon activation.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const target = returnTo;
                setReturnTo(null);
                navigate(target);
              }}
              className="text-xs text-white/70 hover:text-white underline self-end sm:self-auto shrink-0"
            >
              {isSellerReturn ? 'Back to Sell' : 'Back to Vehicle'}
            </button>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#77101F]/10 text-[#77101F] text-xs font-bold">
          <Zap className="w-3.5 h-3.5" />
          <span>Transparent Membership & Access Plans</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#101828] font-display">
          OnRoadPriz Membership Plans
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
          Whether you want to discover and purchase verified vehicles directly from individual owners or list your personal vehicle or commercial fleet with zero brokerage commission, we have transparent plans tailored to your needs.
        </p>

        {/* TABS SWITCHER: [ BUYER PLANS ] [ SELLER PLANS ] */}
        <div className="pt-4 flex justify-center">
          <div className="bg-[#EAEFF5] p-1.5 rounded-2xl inline-flex items-center gap-1 shadow-inner border border-[#DCE3EC]">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'buyer'
                  ? 'bg-white text-[#77101F] shadow-sm'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <Phone className="w-4 h-4 text-[#77101F]" />
              <span>Buyer Plans</span>
              <span className="bg-[#77101F]/10 text-[#77101F] text-[10px] px-1.5 py-0.2 rounded font-bold">
                Unlock Vehicles
              </span>
            </button>

            <button
              onClick={() => setActiveTab('seller')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'seller'
                  ? 'bg-white text-[#77101F] shadow-sm'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <Car className="w-4 h-4 text-[#77101F]" />
              <span>Seller Plans</span>
              <span className="bg-[#087F5B]/10 text-[#087F5B] text-[10px] px-1.5 py-0.2 rounded font-bold">
                List & Sell
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* PLAN TYPE EXPLANATION CARD */}
      <div className="bg-white rounded-2xl border border-[#DCE3EC] p-5 shadow-xs max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {activeTab === 'buyer' ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#101828]">What is a Buyer Plan?</h4>
              <p className="text-xs text-[#667085] mt-0.5">
                Buyer Plans are required for customers who want to access & unlock vehicle contact details, inspect verified RC records, view owner phone/WhatsApp, and schedule direct vehicle test inspections with 0% brokerage.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#101828]">What is a Seller Plan?</h4>
              <p className="text-xs text-[#667085] mt-0.5">
                Seller Plans are required for vehicle owners and commercial fleet operators to list vehicles on OnRoadPriz with high visibility, priority search placement, verified badges, and lead analytics.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab(activeTab === 'buyer' ? 'seller' : 'buyer')}
            className="text-xs font-bold text-[#77101F] hover:underline whitespace-nowrap"
          >
            Switch to {activeTab === 'buyer' ? 'Seller Plans' : 'Buyer Plans'} →
          </button>
        </div>
      </div>

      {/* ACTIVE USER SUBSCRIPTION SUMMARY */}
      {currentUser && (
        <div className="bg-[#77101F]/5 border border-[#77101F]/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#77101F] text-white flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#667085]">Logged In As:</div>
              <div className="text-sm font-bold text-[#101828]">
                {currentUser.name} ({currentUser.role} Account)
              </div>
              <div className="text-xs font-semibold text-[#77101F] mt-0.5 flex items-center gap-2">
                <span>Active Plan: {currentUser.activePlan || 'No Active Plan'}</span>
                {currentUser.buyerPlan && (
                  <span className="bg-[#77101F]/10 text-[#77101F] text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {currentUser.buyerPlan.listingViewsRemaining ?? 'Unlimited'} Unlocks Left
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'buyer' ? (
              <button
                onClick={() => navigate('/buy')}
                className="px-4 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#5E0B17] transition-all"
              >
                Browse Marketplace
              </button>
            ) : (
              <button
                onClick={() => navigate('/sell')}
                className="px-4 py-2 bg-[#77101F] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#5E0B17] transition-all"
              >
                Post Vehicle Listing
              </button>
            )}
          </div>
        </div>
      )}

      {/* BUYER PLANS PRICING GRID */}
      {activeTab === 'buyer' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {buyerPlans.map((plan) => {
            const isCurrent = currentUser?.buyerPlan?.planId === plan.id || currentUser?.activePlan === plan.name;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 sm:p-7 border-2 transition-all flex flex-col justify-between ${
                  plan.popular
                    ? 'border-[#77101F] shadow-xl ring-1 ring-[#77101F]/20'
                    : 'border-[#DCE3EC] hover:border-[#77101F]/40 shadow-xs'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#77101F] text-white text-[11px] font-bold px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#101828] font-display">{plan.name}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      Buyer Pass
                    </span>
                  </div>
                  <p className="text-xs text-[#667085] mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="mt-4 mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-[#101828] font-display">
                      {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-xs font-semibold text-[#98A2B3]">
                        {' '}+ GST / {plan.validityDays || plan.durationDays} Days
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-xs text-[#101828] pt-4 border-t border-[#DCE3EC]/70">
                    <div className="font-bold text-[#98A2B3] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      Buyer Entitlements
                    </div>
                    
                    <div className="flex items-center gap-2 font-bold text-[#087F5B]">
                      <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0" />
                      <span>{plan.contactsLimit || plan.listingViewsAllowed} Verified Vehicle Unlocks</span>
                    </div>

                    <div className="flex items-center gap-2 font-semibold text-[#101828]">
                      <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0" />
                      <span>{plan.validityDays || plan.durationDays} Days Active Access</span>
                    </div>

                    {(plan.features || [
                      'Direct Owner Phone & WhatsApp details',
                      'Verified RC Document & RTO registration lookup',
                      'Direct in-person inspection request',
                      'Vehicle Comparison Dock (up to 4 vehicles)',
                      '0% Broker Commission Guarantee'
                    ]).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#DCE3EC]/70">
                  <button
                    onClick={() => handleChoosePlan(plan)}
                    disabled={isCurrent}
                    className={`w-full py-3 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-[#F5F7FA] text-[#98A2B3] cursor-default'
                        : 'bg-[#77101F] hover:bg-[#5E0B17] text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    <span>{isCurrent ? 'Active Subscription' : 'Unlock Vehicles Now'}</span>
                    {!isCurrent && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SELLER PLANS PRICING GRID */}
      {activeTab === 'seller' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {sellerPlans.map((plan) => {
            const isCurrent = currentUser?.activePlan === plan.name;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 sm:p-7 border-2 transition-all flex flex-col justify-between ${
                  plan.popular
                    ? 'border-[#77101F] shadow-xl ring-1 ring-[#77101F]/20'
                    : 'border-[#DCE3EC] hover:border-[#77101F]/40 shadow-xs'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#77101F] text-white text-[11px] font-bold px-3.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#101828] font-display">{plan.name}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Seller Plan
                    </span>
                  </div>
                  <p className="text-xs text-[#667085] mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="mt-4 mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-[#101828] font-display">
                      {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-xs font-semibold text-[#98A2B3]">
                        {' '}+ GST / {plan.validityDays || plan.durationDays} Days
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 text-xs text-[#101828] pt-4 border-t border-[#DCE3EC]/70">
                    <div className="font-bold text-[#98A2B3] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      Listing Entitlements
                    </div>
                    <div className="flex items-center gap-2 font-bold text-[#087F5B]">
                      <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0" />
                      <span>{((plan.listingsLimit ?? plan.listingLimit ?? 1) >= 999) ? 'Unlimited' : (plan.listingsLimit ?? plan.listingLimit ?? 1)} Vehicle {(plan.listingsLimit ?? plan.listingLimit ?? 1) === 1 ? 'Listing' : 'Listings'}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0" />
                      <span>{plan.validityDays || plan.durationDays} Days Listing Validity</span>
                    </div>
                    {(plan.features || [
                      `${plan.imageLimitPerVehicle || 15} High-Res Photos per vehicle`,
                      (plan.featuredSlots ?? 0) > 0 ? `${plan.featuredSlots} Featured Homepage Slots` : 'Standard Marketplace Placement',
                      plan.analyticsAccess ? 'Real-time View & Lead Analytics' : 'Basic Analytics',
                      plan.prioritySupport ? '24/7 Priority Seller Helpline' : 'Standard Email Support'
                    ]).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-[#DCE3EC]/70">
                  <button
                    onClick={() => handleChoosePlan(plan)}
                    disabled={isCurrent}
                    className={`w-full py-3 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'bg-[#F5F7FA] text-[#98A2B3] cursor-default'
                        : 'bg-[#77101F] hover:bg-[#5E0B17] text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    <span>{isCurrent ? 'Current Plan' : 'Select Plan'}</span>
                    {!isCurrent && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FREQUENTLY ASKED QUESTIONS */}
      <div className="bg-white rounded-3xl border border-[#DCE3EC] p-6 sm:p-8 max-w-4xl mx-auto space-y-6 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 font-display font-black text-lg sm:text-xl">
          <HelpCircle className="w-5 h-5 text-[#77101F]" />
          <span>Frequently Asked Questions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-[#667085]">
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#F7F9FC]">
            <h4 className="font-bold text-[#101828] text-sm">Why is a Buyer Plan required?</h4>
            <p>
              OnRoadPriz connects verified buyers directly with genuine vehicle owners without dealers or commission. Buyer subscriptions filter out spam callers and commercial brokers, giving sellers serious direct buyers.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-[#F7F9FC]">
            <h4 className="font-bold text-[#101828] text-sm">What happens after I subscribe?</h4>
            <p>
              Your account is instantly credited with vehicle view/unlock quota. You can view the owner's mobile number, chat directly on WhatsApp, and verify RC documents. If you were viewing a vehicle, you will be returned immediately.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-[#F7F9FC]">
            <h4 className="font-bold text-[#101828] text-sm">Can I sell multiple vehicles?</h4>
            <p>
              Yes! For individuals selling up to 2 vehicles, the Standard Owner Plan is free. For dealers or commercial fleets with 6–25+ vehicles, our Premium and Fleet packages provide featured visibility.
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-2xl bg-[#F7F9FC]">
            <h4 className="font-bold text-[#101828] text-sm">Is GST invoice provided?</h4>
            <p>
              Yes, an automated GST tax invoice is generated with your business/personal details and sent to your email immediately upon successful payment.
            </p>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCE3EC] max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
              <div className="space-y-1">
                <BrandLogo variant="auth" />
                <h3 className="font-black text-slate-900 text-lg font-display mt-2">
                  Complete {activeTab === 'buyer' ? 'Buyer Subscription' : 'Seller Plan'}
                </h3>
                <p className="text-xs text-[#667085]">{selectedPlan.name}</p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-slate-100 self-start"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Breakdown */}
            <div className="bg-[#F7F9FC] p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-[#667085]">
                <span>Base Price</span>
                <span>₹{selectedPlan.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#667085]">
                <span>GST (18%)</span>
                <span>₹{Math.round(selectedPlan.price * 0.18).toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-[#DCE3EC] pt-2 flex justify-between font-black text-sm text-[#101828]">
                <span>Total Amount</span>
                <span className="text-[#77101F]">
                  ₹{Math.round(selectedPlan.price * 1.18).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Select Payment Method:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#77101F] bg-[#77101F]/5 text-[#77101F]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#77101F] bg-[#77101F]/5 text-[#77101F]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-[#77101F] bg-[#77101F]/5 text-[#77101F]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Netbanking</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'upi' && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-center">
                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-20 h-20 text-slate-800 mx-auto" />
                    <span className="text-[9px] font-bold text-slate-500">Scan via GPay / PhonePe / Paytm</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#667085]">
                  Virtual UPI ID: <span className="font-mono font-bold text-[#101828]">{upiId}</span>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-slate-700 leading-relaxed">
              <strong>Non-Refund Policy:</strong> Payments made for listing or contact purchases (Owner Access) are non-refundable. By proceeding, you confirm that you have read, understood, and accepted Onroadpriz’s{' '}
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(null);
                  navigate('/terms');
                }}
                className="text-[#77101F] font-bold underline cursor-pointer"
              >
                Terms, Guidelines
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => {
                  setSelectedPlan(null);
                  navigate('/privacy-policy');
                }}
                className="text-[#77101F] font-bold underline cursor-pointer"
              >
                Privacy Policy
              </button>.
            </div>

            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Activating Subscription...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    Pay ₹{Math.round(selectedPlan.price * 1.18).toLocaleString('en-IN')} & Activate
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
