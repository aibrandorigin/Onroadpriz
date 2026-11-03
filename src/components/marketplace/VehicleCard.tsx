import React, { useState } from 'react';
import { Vehicle } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Heart, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Fuel, 
  Gauge, 
  SlidersHorizontal,
  ArrowRight,
  Eye,
  Check,
  Phone,
  MessageSquare,
  X
} from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  viewMode?: 'grid' | 'list';
  onQuickView?: (vehicle: Vehicle) => void;
}

export function formatPriceIndian(val: number): string {
  if (!val || isNaN(val)) return '₹0';
  if (val >= 10000000) {
    const cr = (val / 10000000).toFixed(2);
    return `₹${cr.replace(/\.00$/, '')} Cr`;
  }
  if (val >= 100000) {
    const lakhs = (val / 100000).toFixed(2);
    return `₹${lakhs.replace(/\.00$/, '')} Lakhs`;
  }
  return '₹' + val.toLocaleString('en-IN');
}

export function formatListingDate(dateStr?: string): string {
  if (!dateStr) return 'Listed recently';
  try {
    const d = new Date(dateStr);
    return `Listed on ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  } catch {
    return 'Listed on 18 Sep 2026';
  }
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ 
  vehicle, 
  viewMode = 'grid',
  onQuickView 
}) => {
  const { 
    navigate, 
    setSelectedVehicleId, 
    toggleWishlist, 
    isInWishlist, 
    addToCompare, 
    removeFromCompare, 
    isInCompare,
    recordVehicleInteraction,
    showToast,
    checkBuyerAccess,
    recordBuyerVehicleUnlock,
    setAuthModalOpen,
    setAuthReturnTo
  } = useApp();

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const isSaved = isInWishlist(vehicle.id);
  const inCompare = isInCompare(vehicle.id);

  const handleCardClick = () => {
    recordVehicleInteraction(vehicle.id, 'view');
    setSelectedVehicleId(vehicle.id);

    // Requirement 2 & 4: Buyer Subscription Access Control
    const access = checkBuyerAccess(vehicle.id);

    if (!access.granted) {
      setAuthReturnTo(`/vehicle/${vehicle.id}`);
      showToast('Subscription Required', 'An active Buyer Plan is required to view complete vehicle details.', 'info');
      navigate(`/plans/buyer?returnTo=/vehicle/${vehicle.id}`);
      return;
    }

    // Access permitted: record vehicle unlock
    recordBuyerVehicleUnlock(vehicle.id);
    navigate(`/vehicle/${vehicle.id}`);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCardClick();
  };

  const coverImage = vehicle.images && vehicle.images.length > 0
    ? vehicle.images[vehicle.coverImageIndex ?? 0] || vehicle.images[0]
    : '';

  const locationDisplay = vehicle.location?.area 
    ? `${vehicle.location.area}, ${vehicle.location.city}` 
    : (vehicle.location?.city || vehicle.city || 'India');

  const verificationBadgeText = vehicle.documents && vehicle.documents.some(d => d.type === 'RC' && d.verified)
    ? 'RC Verified'
    : 'Verified Owner';

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-[#DCE3EC] hover:border-[#77101F]/40 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* CARD IMAGE CONTAINER */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F7FA]">
        {coverImage && !imgFailed ? (
          <img 
            src={coverImage} 
            alt={vehicle.title}
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F7FA] to-[#DCE3EC] text-[#667085] p-4 text-center">
            <span className="text-3xl mb-1">🚗</span>
            <span className="text-xs font-bold text-[#101828]">{vehicle.brand} {vehicle.model}</span>
            <span className="text-[10px] text-[#667085]">{vehicle.year} • Direct Owner</span>
          </div>
        )}

        {/* TOP LEFT BADGE: ✓ Verified Owner / ✓ RC Verified */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 bg-[#087F5B] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{verificationBadgeText}</span>
          </span>
        </div>

        {/* TOP RIGHT: ♡ Wishlist */}
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(vehicle.id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
              isSaved 
                ? 'bg-[#77101F] text-white' 
                : 'bg-white/90 backdrop-blur-xs text-[#101828] hover:bg-white hover:text-[#77101F]'
            }`}
            title="Save to Wishlist"
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* IMAGE BOTTOM RIGHT: 0% Brokerage */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-flex items-center bg-black/80 backdrop-blur-xs text-[#F59E0B] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
            0% Brokerage
          </span>
        </div>
      </div>

      {/* CARD CONTENT */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Brand & Body Subtitle */}
          <div className="text-xs font-bold text-[#667085] tracking-wide mb-1">
            {vehicle.brand} • {vehicle.bodyType || vehicle.category}
          </div>

          {/* Vehicle Title */}
          <h3 className="text-base sm:text-lg font-bold text-[#101828] group-hover:text-[#77101F] transition-colors line-clamp-1 font-display">
            {vehicle.title}
          </h3>

          {/* CHIPS: High-value summary info (Requirement 21) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#667085] mt-2.5">
            <span className="bg-[#F5F7FA] border border-[#DCE3EC] px-2 py-0.5 rounded-md font-semibold text-[#101828]">
              {vehicle.year}
            </span>
            <span className="bg-[#F5F7FA] border border-[#DCE3EC] px-2 py-0.5 rounded-md font-semibold text-[#101828]">
              {vehicle.fuelType}
            </span>
            <span className="bg-[#F5F7FA] border border-[#DCE3EC] px-2 py-0.5 rounded-md font-semibold text-[#101828]">
              {vehicle.category === 'Heavy Machinery Vehicles' || vehicle.category === 'Tractors & Backhoe Loaders'
                ? `${vehicle.kmDriven?.toLocaleString('en-IN') || '0'} hrs`
                : `${vehicle.kmDriven ? vehicle.kmDriven.toLocaleString('en-IN') : 'Low'} km`}
            </span>
            {(vehicle.load_capacity || vehicle.loadCapacity) ? (
              <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-bold text-blue-900">
                {vehicle.load_capacity || vehicle.loadCapacity} {vehicle.load_capacity_unit || 'T'}
              </span>
            ) : (
              <span className="bg-[#F5F7FA] border border-[#DCE3EC] px-2 py-0.5 rounded-md font-semibold text-[#101828]">
                {vehicle.transmission}
              </span>
            )}
          </div>
        </div>

        {/* LOCATION & DATE */}
        <div className="space-y-1 pt-2 border-t border-[#DCE3EC]/70 text-xs">
          <div className="flex items-center gap-1 text-[#101828] font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-[#77101F] shrink-0" />
            <span className="truncate">{locationDisplay}</span>
          </div>
          <div className="text-[11px] text-[#98A2B3]">
            {formatListingDate(vehicle.createdAt)}
          </div>
        </div>

        {/* PRICE & ACTION BUTTONS */}
        <div className="pt-3 border-t border-[#DCE3EC] flex items-center justify-between gap-2">
          <div>
            <span className="text-lg sm:text-xl font-black text-[#77101F] tracking-tight font-display">
              {formatPriceIndian(vehicle.price)}
            </span>
            {vehicle.negotiable && (
              <span className="block text-[10px] font-semibold text-[#667085]">
                Negotiable
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleQuickViewClick}
              className="px-2.5 py-1.5 text-xs font-bold text-[#101828] hover:text-[#77101F] bg-[#F5F7FA] hover:bg-[#DCE3EC]/50 border border-[#DCE3EC] rounded-lg transition-colors"
            >
              Quick View
            </button>
            <button
              type="button"
              onClick={handleCardClick}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#77101F] hover:bg-[#5E0B17] rounded-lg shadow-xs transition-colors flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
