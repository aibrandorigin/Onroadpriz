import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle, calculateInsuranceStatus } from '../../types';
import { VehicleCard, formatPriceIndian } from './VehicleCard';
import { 
  Heart, 
  SlidersHorizontal, 
  Share2, 
  Flag, 
  MapPin, 
  Fuel, 
  Gauge, 
  Calendar, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  CalendarCheck,
  Send,
  AlertTriangle,
  User as UserIcon,
  Sparkles,
  DollarSign,
  Tag,
  Lock,
  Key,
  Building2,
  Wrench,
  Weight
} from 'lucide-react';

export const VehicleDetailPage: React.FC = () => {
  const { 
    vehicles, 
    selectedVehicleId, 
    navigate, 
    toggleWishlist, 
    isInWishlist, 
    addToCompare, 
    isInCompare,
    addEnquiry,
    recordVehicleInteraction,
    showToast,
    currentUser,
    currentPath,
    checkBuyerAccess,
    recordBuyerVehicleUnlock,
    setAuthModalOpen,
    setAuthReturnTo
  } = useApp();

  // Resolve Vehicle from URL route or selected ID
  const routeVehicleId = currentPath.startsWith('/vehicle/')
    ? currentPath.replace('/vehicle/', '').split('?')[0]
    : currentPath.startsWith('/buy/')
    ? currentPath.replace('/buy/', '').split('?')[0]
    : selectedVehicleId;

  const vehicle = vehicles.find(v => v.id === routeVehicleId) || vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Access check & Direct URL Protection (Requirement 4)
  const access = vehicle ? checkBuyerAccess(vehicle.id) : { granted: true };

  React.useEffect(() => {
    if (vehicle && !access.granted) {
      setAuthReturnTo(`/vehicle/${vehicle.id}`);
      showToast('Subscription Required', 'An active Buyer Plan is required to view complete vehicle details.', 'info');
      navigate(`/plans/buyer?returnTo=/vehicle/${vehicle.id}`);
    }
  }, [vehicle?.id, access.granted]);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  // Modals state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState<string>('');

  // Enquiry form fields
  const [buyerName, setBuyerName] = useState(currentUser?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '');
  const [buyerEmail, setBuyerEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState(`Hi ${vehicle?.seller?.name || 'Owner'}, I am interested in your ${vehicle?.title}. Please contact me.`);
  const [inspectionDate, setInspectionDate] = useState('');
  const [reportReason, setReportReason] = useState('Incorrect Price or Details');

  const insuranceCalc = useMemo(() => {
    return calculateInsuranceStatus(vehicle?.insurance_valid_until);
  }, [vehicle?.insurance_valid_until]);

  const canViewFinancialDetails = Boolean(currentUser && (
    currentUser.role === 'Super Admin' || 
    currentUser.role === 'Admin' || 
    currentUser.role === 'admin' ||
    currentUser.id === vehicle?.seller?.id ||
    access.granted
  ));

  // If vehicle is protected and access is not granted
  if (vehicle && !access.granted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-[#DCE3EC] p-8 sm:p-12 shadow-xl max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#77101F]/10 text-[#77101F] flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#77101F] bg-[#77101F]/10 px-3 py-1 rounded-full">
              Protected Vehicle Details
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828] font-display mt-3">
              {access.reason === 'AUTH_REQUIRED' 
                ? 'Sign In to Access Vehicle Details' 
                : access.reason === 'EXPIRED' 
                ? 'Your Buyer Plan Has Expired' 
                : access.reason === 'QUOTA_EXHAUSTED'
                ? 'Vehicle Contact Unlocks Exhausted'
                : 'Choose a Buyer Plan to Access This Vehicle'}
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-2 max-w-lg mx-auto">
              You are accessing <strong className="text-[#101828]">{vehicle.title}</strong>. Under OnRoadPriz rules, active buyer membership is required to view verified owner telephone/WhatsApp contacts, inspect RTO RC certificates, and connect with direct sellers.
            </p>
          </div>

          <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#DCE3EC] text-left text-xs space-y-2">
            <div className="font-bold text-[#101828]">What you get with an OnRoadPriz Buyer Pass:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#667085]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
                <span>Direct Owner Phone & WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
                <span>Verified RC Document & RTO Data</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
                <span>Direct in-person inspection scheduling</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
                <span>0% Brokerage & Direct Negotiation</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {access.reason === 'AUTH_REQUIRED' ? (
              <button
                onClick={() => {
                  setAuthReturnTo(`/vehicle/${vehicle.id}`);
                  setAuthModalOpen(true);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Register to Continue</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthReturnTo(`/vehicle/${vehicle.id}`);
                  navigate(`/plans/buyer?returnTo=/vehicle/${vehicle.id}`);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>View Buyer Plans (from ₹199)</span>
              </button>
            )}

            <button
              onClick={() => navigate('/buy')}
              className="w-full sm:w-auto px-5 py-3 border border-slate-200 text-[#667085] hover:text-[#101828] text-xs font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              Return to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Vehicle Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested listing may have expired or been removed.</p>
        <button
          onClick={() => navigate('/buy')}
          className="mt-4 px-6 py-2.5 bg-[#77101F] text-white font-bold text-xs rounded-xl"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const isSaved = isInWishlist(vehicle.id);
  const inCompare = isInCompare(vehicle.id);

  const images = vehicle.images.length > 0 ? vehicle.images : [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80'
  ];

  const formatPrice = (val: number) => '₹' + val.toLocaleString('en-IN');

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Listing Link Copied', 'Vehicle link copied to clipboard. Share with friends or mechanics!', 'success');
  };

  const handleWhatsApp = () => {
    recordVehicleInteraction(vehicle.id, 'whatsapp');
    const msg = encodeURIComponent(`Hi ${vehicle.seller.name}, I am viewing your ${vehicle.title} on OnRoadPriz (Listed for ${formatPrice(vehicle.price)}). Is this vehicle still available for a direct personal inspection?`);
    window.open(`https://wa.me/${vehicle.seller.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEnquiry({
      vehicleId: vehicle.id,
      vehicleTitle: vehicle.title,
      vehiclePrice: vehicle.price,
      vehicleImage: images[0],
      sellerId: vehicle.seller.id,
      buyerName: buyerName || 'Interested Buyer',
      buyerPhone: buyerPhone || '+91 98480 12345',
      buyerEmail: buyerEmail || 'buyer@onroadpriz.com',
      message,
      inspectionRequested: false
    });
    setEnquiryModalOpen(false);
  };

  const handleInspectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEnquiry({
      vehicleId: vehicle.id,
      vehicleTitle: vehicle.title,
      vehiclePrice: vehicle.price,
      vehicleImage: images[0],
      sellerId: vehicle.seller.id,
      buyerName: buyerName || 'Interested Buyer',
      buyerPhone: buyerPhone || '+91 98480 12345',
      buyerEmail: buyerEmail || 'buyer@onroadpriz.com',
      message: `Inspection Request for ${inspectionDate || 'this weekend'}: ${message}`,
      inspectionRequested: true,
      preferredDate: inspectionDate
    });
    setInspectionModalOpen(false);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Listing Flagged for Audit', `Moderators have received your report: "${reportReason}". We will inspect the seller credentials immediately.`, 'info');
    setReportModalOpen(false);
  };

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAmount) {
      showToast('Enter Offer Amount', 'Please specify your counter-offer price.', 'warning');
      return;
    }
    addEnquiry({
      vehicleId: vehicle.id,
      vehicleTitle: vehicle.title,
      vehiclePrice: vehicle.price,
      vehicleImage: images[0],
      sellerId: vehicle.seller.id,
      buyerName: buyerName || 'Interested Buyer',
      buyerPhone: buyerPhone || '+91 98480 12345',
      buyerEmail: buyerEmail || 'buyer@onroadpriz.com',
      message: `Direct Offer: ₹${Number(offerAmount).toLocaleString('en-IN')}. ${message}`,
      inspectionRequested: false
    });
    showToast('Offer Sent to Owner', `Your direct offer of ₹${Number(offerAmount).toLocaleString('en-IN')} was dispatched to ${vehicle.seller.name}.`, 'success');
    setOfferModalOpen(false);
  };

  // Similar Vehicles
  const similarVehicles = vehicles
    .filter(v => v.status === 'Published' && v.id !== vehicle.id && (v.category === vehicle.category || v.brand === vehicle.brand))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/buy')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#77101F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search Results</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-[#77101F] hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={() => setReportModalOpen(true)}
            className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Report Listing"
          >
            <Flag className="w-4 h-4" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>

      {/* Primary Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLUMNS: GALLERY & SPECS */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Gallery Showcase */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-3 p-3">
            <div className="relative h-[360px] sm:h-[480px] bg-slate-900 rounded-xl overflow-hidden group">
              <img
                src={images[activeImageIndex]}
                alt={`${vehicle.title} view ${activeImageIndex + 1}`}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              />

              {/* Prev / Next buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Lightbox zoom button */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Screen & Zoom</span>
              </button>

              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-md">
                Photo {activeImageIndex + 1} of {images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx ? 'border-[#77101F] scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Specifications Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>Vehicle Specifications</span>
              <span className="text-xs font-bold text-slate-400 font-sans">
                (Verified via RTO Smart Card)
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Kilometers Driven</span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                  {vehicle.kmDriven.toLocaleString('en-IN')} KM
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Fuel Type</span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">{vehicle.fuelType}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Transmission</span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">{vehicle.transmission}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Ownership</span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">{vehicle.ownership}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Manufacturing Year</span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">{vehicle.year}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Registration Year</span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">{vehicle.registrationYear}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">RTO Jurisdiction</span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">{vehicle.rtoCity}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Vehicle Color</span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">{vehicle.color}</span>
              </div>
              {vehicle.engineCapacity && (
                <div className="bg-slate-50 p-3.5 rounded-xl">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">Engine Displacement</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-1 block">{vehicle.engineCapacity}</span>
                </div>
              )}
              {vehicle.mileage && (
                <div className="bg-slate-50 p-3.5 rounded-xl">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">Mileage / Efficiency</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-1 block">{vehicle.mileage}</span>
                </div>
              )}
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Overall Condition</span>
                <span className="text-sm font-extrabold text-emerald-700 mt-1 block">{vehicle.condition}</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl">
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Seller Category</span>
                <span className="text-sm font-extrabold text-[#77101F] mt-1 block">{vehicle.seller.type}</span>
              </div>
            </div>
          </div>

          {/* ====================================================
              REQUIREMENT 20: VEHICLE CONDITION (ALL CATEGORIES)
          ==================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#77101F]" />
              <span>VEHICLE CONDITION & ADDITIONAL DETAILS</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {/* Spare Key */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#77101F]" />
                  <span>Spare Key</span>
                </span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                  {vehicle.has_spare_key !== undefined 
                    ? (vehicle.has_spare_key ? 'Yes (Available)' : 'No')
                    : (vehicle.spareKeyAvailable || 'Not Provided')}
                </span>
              </div>

              {/* Insurance Validity with dynamic status badge */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#77101F]" />
                    <span>Insurance Validity</span>
                  </span>
                  {vehicle.insurance_valid_until && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${insuranceCalc.badgeClass}`}>
                      {insuranceCalc.status}
                    </span>
                  )}
                </div>
                <span className={`text-sm font-extrabold mt-1 block ${vehicle.insurance_valid_until ? insuranceCalc.colorClass : 'text-slate-900'}`}>
                  {vehicle.insurance_valid_until 
                    ? `${vehicle.insurance_valid_until} (${insuranceCalc.label})` 
                    : 'Not Provided'}
                </span>
              </div>

              {/* Hypothecation Status */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#77101F]" />
                  <span>Hypothecation Status</span>
                </span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                  {vehicle.hypothecation_status || 'No Hypothecation / Clear'}
                </span>
                {vehicle.financier_name && canViewFinancialDetails && (
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                    Financier: {vehicle.financier_name}
                  </span>
                )}
              </div>

              {/* OEM / Authorized Service History */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#77101F]" />
                  <span>OEM Service History</span>
                </span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                  {vehicle.oem_service_status || 'Full OEM Service History'}
                </span>
                {vehicle.service_records_docs && vehicle.service_records_docs.length > 0 && (
                  <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
                    ✓ {vehicle.service_records_docs.length} Service Document(s) On File
                  </span>
                )}
              </div>

              {/* Engine Warranty */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#77101F]" />
                  <span>Engine Warranty</span>
                </span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                  {vehicle.engine_warranty_status || 'Active'}
                  {vehicle.engine_warranty_status === 'Active' && vehicle.engine_warranty_valid_until && (
                    <span className="text-xs text-slate-600 font-medium block">
                      Valid Until {vehicle.engine_warranty_valid_until}
                    </span>
                  )}
                </span>
              </div>

              {/* Major Accident History */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#77101F]" />
                  <span>Major Accident History</span>
                </span>
                <span className="text-sm font-extrabold text-slate-900 mt-1 block">
                  {vehicle.major_accident_history || vehicle.accidentHistory || 'No Major Accident'}
                </span>
                {vehicle.major_accident_history === 'Yes' && vehicle.major_accident_details && (
                  <span className="text-[11px] text-rose-700 mt-0.5 block italic">
                    Note: {vehicle.major_accident_details}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ====================================================
              REQUIREMENT 20: COMMERCIAL SPECIFICATIONS
          ==================================================== */}
          {(vehicle.category === 'Trucks & Lorries' || 
            vehicle.category === 'Buses' || 
            vehicle.category === 'Heavy Machinery Vehicles' || 
            vehicle.category === 'Heavy Machinery' ||
            vehicle.load_capacity || 
            vehicle.max_operating_weight) && (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-blue-950 border-b border-blue-100 pb-3 flex items-center gap-2">
                <Weight className="w-5 h-5 text-blue-700" />
                <span>COMMERCIAL / OPERATING SPECIFICATIONS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {(vehicle.load_capacity || vehicle.loadCapacity) ? (
                  <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                    <span className="block text-[11px] font-bold text-blue-600 uppercase">Load Capacity</span>
                    <span className="text-sm font-extrabold text-blue-950 mt-1 block">
                      {vehicle.load_capacity || vehicle.loadCapacity} {vehicle.load_capacity_unit || 'Tonnes'}
                    </span>
                  </div>
                ) : null}

                {(vehicle.bucket_capacity || vehicle.bucketCapacity) ? (
                  <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                    <span className="block text-[11px] font-bold text-blue-600 uppercase">Bucket Capacity</span>
                    <span className="text-sm font-extrabold text-blue-950 mt-1 block">
                      {vehicle.bucket_capacity || vehicle.bucketCapacity} {vehicle.bucket_capacity_unit || 'm³'}
                    </span>
                  </div>
                ) : null}

                {(vehicle.max_operating_weight || vehicle.maxOperatingWeight) ? (
                  <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                    <span className="block text-[11px] font-bold text-blue-600 uppercase">Maximum Operating Weight</span>
                    <span className="text-sm font-extrabold text-blue-950 mt-1 block">
                      {vehicle.max_operating_weight || vehicle.maxOperatingWeight} {vehicle.max_operating_weight_unit || 'tonnes'}
                    </span>
                  </div>
                ) : null}

                {(vehicle.max_height_capacity || vehicle.maxHeightCapacity) ? (
                  <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                    <span className="block text-[11px] font-bold text-blue-600 uppercase">Maximum Height Capacity</span>
                    <span className="text-sm font-extrabold text-blue-950 mt-1 block">
                      {vehicle.max_height_capacity || vehicle.maxHeightCapacity} {vehicle.max_height_capacity_unit || 'metres'}
                    </span>
                  </div>
                ) : null}

                {(vehicle.max_lift_capacity || vehicle.maxLiftCapacity) ? (
                  <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                    <span className="block text-[11px] font-bold text-blue-600 uppercase">Maximum Lift Capacity</span>
                    <span className="text-sm font-extrabold text-blue-950 mt-1 block">
                      {vehicle.max_lift_capacity || vehicle.maxLiftCapacity} {vehicle.max_lift_capacity_unit || 'tonnes'}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* ====================================================
              REQUIREMENT 20: HEAVY MACHINERY SPECIFICATIONS
          ==================================================== */}
          {(vehicle.category === 'Heavy Machinery Vehicles' || 
            vehicle.category === 'Heavy Machinery' ||
            vehicle.maximum_digging_power || 
            vehicle.engine_power) && (
            <div className="bg-white rounded-2xl border border-amber-300 p-6 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-amber-950 border-b border-amber-100 pb-3 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-amber-700" />
                <span>HEAVY MACHINERY SPECIFICATIONS</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {vehicle.maximum_digging_power ? (
                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                    <span className="block text-[11px] font-bold text-amber-800 uppercase">Maximum Digging Power</span>
                    <span className="text-sm font-extrabold text-amber-950 mt-1 block">
                      {vehicle.maximum_digging_power} {vehicle.maximum_digging_power_unit || 'kN'}
                    </span>
                  </div>
                ) : null}

                {vehicle.engine_power ? (
                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                    <span className="block text-[11px] font-bold text-amber-800 uppercase">Engine Power Rating</span>
                    <span className="text-sm font-extrabold text-amber-950 mt-1 block">
                      {vehicle.engine_power} {vehicle.engine_power_unit || 'HP'}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              Seller Description & Condition Notes
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {vehicle.description}
            </p>
          </div>

          {/* Standard & Key Features Checklist */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Key Features & Equipment
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicle.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Verification Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Verified Documents & History</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicle.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#77101F]" />
                    <span className="text-xs font-bold text-slate-800">{doc.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    doc.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {doc.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRICING & SELLER ACTION CARD (Sticky) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg sticky top-28 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {vehicle.brand} • {vehicle.year}
                </span>
                {vehicle.seller.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Verified Owner
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {vehicle.title}
              </h1>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                <MapPin className="w-3.5 h-3.5 text-[#77101F]" />
                <span>{vehicle.location?.area ? `${vehicle.location.area}, ` : ''}{vehicle.location?.city || vehicle.city || 'India'}{vehicle.location?.state || vehicle.state ? `, ${vehicle.location?.state || vehicle.state}` : ''}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-[#F7F9FC] p-4 rounded-xl border border-[#DCE3EC]">
              <span className="block text-[11px] font-bold text-[#667085] uppercase">
                Owner's Expected Price
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <span className="text-3xl font-black text-[#77101F] font-display">
                    {formatPriceIndian(vehicle.price)}
                  </span>
                  <span className="text-xs text-[#98A2B3] block font-mono">
                    (₹{vehicle.price.toLocaleString('en-IN')})
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#77101F]/10 text-[#77101F]">
                  {vehicle.negotiable ? 'Negotiable' : 'Fixed Price'}
                </span>
              </div>
              <p className="text-[11px] text-[#087F5B] font-semibold mt-1">
                ✓ 0% Middlemen & Dealer Brokerage
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setCallModalOpen(true)}
                className="w-full py-3.5 px-4 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Owner Directly</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </button>

              <button
                onClick={() => setOfferModalOpen(true)}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Make an Offer</span>
              </button>

              <button
                onClick={() => setEnquiryModalOpen(true)}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-[#DCE3EC] text-[#101828] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-[#77101F]" />
                <span>Send Direct Enquiry</span>
              </button>

              <button
                onClick={() => setInspectionModalOpen(true)}
                className="w-full py-2.5 px-4 bg-[#F7F9FC] hover:bg-[#F5F7FA] border border-[#DCE3EC] text-[#101828] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-[#77101F]" />
                <span>Schedule Personal Inspection</span>
              </button>
            </div>

            {/* Wishlist & Compare Toggles */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => toggleWishlist(vehicle.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors ${
                  isSaved ? 'text-red-600 bg-red-50' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={() => inCompare ? addToCompare(vehicle.id) : addToCompare(vehicle.id)}
                className={`flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors ${
                  inCompare ? 'text-[#77101F] bg-[#77101F]/5 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{inCompare ? 'In Comparison' : 'Compare'}</span>
              </button>
            </div>

            {/* Seller Profile Card */}
            <div className="border-t border-slate-100 pt-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Listed by Owner
              </div>
              <div className="flex items-center gap-3">
                {vehicle.seller.avatar ? (
                  <img
                    src={vehicle.seller.avatar}
                    alt={vehicle.seller.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#77101F] text-white flex items-center justify-center font-bold text-base">
                    {vehicle.seller.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{vehicle.seller.name}</h4>
                  <p className="text-[11px] text-slate-500">Member since {vehicle.seller.memberSince}</p>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" /> Phone Verified Direct Seller
                  </span>
                </div>
              </div>
            </div>

            {/* Safe Trading Advisory */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
              <strong className="block mb-0.5 font-bold">OnRoadPriz Buyer Safety Tip:</strong>
              Never transfer advance booking tokens before physically inspecting the vehicle and verifying the original Smart RC card with RTO Parivahan.
            </div>
          </div>
        </div>
      </div>

      {/* SIMILAR VEHICLES SECTION */}
      {similarVehicles.length > 0 && (
        <div className="pt-10 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Similar Verified Vehicles
            </h3>
            <button
              onClick={() => navigate('/buy')}
              className="text-xs font-bold text-[#77101F] hover:underline"
            >
              Browse all {vehicle.category}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarVehicles.map(sim => (
              <VehicleCard key={sim.id} vehicle={sim} viewMode="grid" />
            ))}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white p-2">
            <span className="text-sm font-bold">
              {vehicle.title} ({activeImageIndex + 1} of {images.length})
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center p-4">
            <img
              src={images[activeImageIndex]}
              alt={vehicle.title}
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          <div className="flex justify-center gap-2 overflow-x-auto py-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-12 rounded overflow-hidden border-2 shrink-0 ${
                  activeImageIndex === idx ? 'border-[#77101F]' : 'border-transparent opacity-50'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CALL MODAL */}
      {callModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#DCE3EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
              <h3 className="text-base font-bold text-[#101828] font-display">Direct Owner Contact</h3>
              <button onClick={() => setCallModalOpen(false)} className="text-[#98A2B3] hover:text-[#101828]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-2">
              <div className="w-14 h-14 rounded-full bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center mx-auto">
                <Phone className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-[#101828] font-display">{vehicle.seller.name}</h4>
              <p className="text-xs text-[#667085]">Direct Owner for {vehicle.title}</p>
              <div className="p-3 bg-[#F7F9FC] rounded-2xl border border-[#DCE3EC] text-xl font-mono font-bold text-[#101828]">
                {vehicle.seller.phone}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <a
                href={`tel:${vehicle.seller.phone}`}
                onClick={() => recordVehicleInteraction(vehicle.id, 'call')}
                className="flex-1 py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold text-xs rounded-xl text-center shadow-md transition-all"
              >
                Dial Now
              </a>
              <button
                onClick={() => setCallModalOpen(false)}
                className="flex-1 py-3 bg-[#F5F7FA] text-[#667085] hover:text-[#101828] font-bold text-xs rounded-xl text-center hover:bg-[#DCE3EC]/50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT ENQUIRY MODAL */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#DCE3EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#101828] font-display">Send Direct Lead to Owner</h3>
                <p className="text-xs text-[#667085]">Regarding: {vehicle.title}</p>
              </div>
              <button onClick={() => setEnquiryModalOpen(false)} className="text-[#98A2B3] hover:text-[#101828]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnquirySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  className="w-full text-xs p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                  placeholder="e.g. Anand Raju"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Your Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                  className="w-full text-xs p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                  placeholder="+91 98480 00000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Message to Owner</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full text-xs p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEnquiryModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#667085] hover:bg-[#F5F7FA] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Submit Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE INSPECTION MODAL */}
      {inspectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#DCE3EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#101828] font-display">Schedule Physical Inspection</h3>
                <p className="text-xs text-[#667085]">Coordinate with owner in {vehicle.location?.city || vehicle.city || 'India'}</p>
              </div>
              <button onClick={() => setInspectionModalOpen(false)} className="text-[#98A2B3] hover:text-[#101828]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInspectionSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Preferred Date</label>
                <input
                  type="date"
                  required
                  value={inspectionDate}
                  onChange={e => setInspectionDate(e.target.value)}
                  className="w-full text-xs p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Your Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={e => setBuyerPhone(e.target.value)}
                  className="w-full text-xs p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Special Notes for Inspection</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="e.g. Will bring my trusted mechanic to inspect chassis and engine..."
                  className="w-full text-xs p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInspectionModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#667085] hover:bg-[#F5F7FA] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Confirm Inspection Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAKE AN OFFER MODAL */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#DCE3EC] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101828]">Make a Counter Offer</h3>
                  <p className="text-[11px] text-[#667085]">Negotiate directly with {vehicle.seller.name}</p>
                </div>
              </div>
              <button onClick={() => setOfferModalOpen(false)} className="text-[#98A2B3] hover:text-[#101828]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div className="p-3 bg-[#F7F9FC] rounded-xl border border-[#DCE3EC] flex items-center justify-between text-xs">
                <span className="text-[#667085] font-semibold">Listed Price:</span>
                <span className="text-sm font-black text-[#77101F] font-display">
                  {formatPriceIndian(vehicle.price)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1.5">
                  Your Offer Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#77101F]">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    placeholder={`e.g. ${Math.round(vehicle.price * 0.95)}`}
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#DCE3EC] rounded-xl text-xs font-bold text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1.5">
                  Your Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCE3EC] rounded-xl text-xs font-medium text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1.5">
                  Note to Owner (Optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Immediate cash settlement ready upon vehicle inspection..."
                  className="w-full p-3 bg-white border border-[#DCE3EC] rounded-xl text-xs font-medium text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#667085] hover:bg-[#F5F7FA] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Send Direct Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT LISTING MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#DCE3EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE3EC] pb-3">
              <h3 className="text-base font-bold text-[#101828] flex items-center gap-2 font-display">
                <AlertTriangle className="w-5 h-5 text-[#77101F]" />
                <span>Report Vehicle Listing</span>
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-[#98A2B3] hover:text-[#101828]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#101828] mb-1">Reason for Report</label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full text-xs p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                >
                  <option value="Incorrect Price or Details">Incorrect Price or Details</option>
                  <option value="Vehicle Already Sold by Owner">Vehicle Already Sold by Owner</option>
                  <option value="Suspicious / Fraudulent Seller">Suspicious / Fraudulent Seller</option>
                  <option value="Duplicate Listing">Duplicate Listing</option>
                  <option value="Offensive Photos or Content">Offensive Photos or Content</option>
                </select>
              </div>

              <p className="text-xs text-[#667085] leading-relaxed">
                OnRoadPriz takes marketplace integrity very seriously. Our moderation team reviews every report against RTO data within 2 hours.
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#667085] hover:bg-[#F5F7FA] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
