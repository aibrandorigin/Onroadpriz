import React from 'react';
import { Vehicle } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatPriceIndian, formatListingDate } from './VehicleCard';
import { 
  X, 
  MapPin, 
  Check, 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  Heart, 
  ShieldCheck, 
  Gauge, 
  Fuel, 
  Calendar, 
  Users 
} from 'lucide-react';

interface QuickViewModalProps {
  vehicle: Vehicle | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ vehicle, onClose }) => {
  const { 
    navigate, 
    setSelectedVehicleId, 
    isInWishlist, 
    toggleWishlist, 
    recordVehicleInteraction,
    showToast 
  } = useApp();

  if (!vehicle) return null;

  const isSaved = isInWishlist(vehicle.id);
  const coverImage = vehicle.images[0] || '';

  const handleFullDetails = () => {
    recordVehicleInteraction(vehicle.id, 'view');
    setSelectedVehicleId(vehicle.id);
    onClose();
    navigate(`/buy/${vehicle.id}`);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordVehicleInteraction(vehicle.id, 'call');
    showToast('Direct Owner Contact', `Seller Phone: ${vehicle.seller.phone}`, 'info');
    window.open(`tel:${vehicle.seller.phone}`, '_self');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordVehicleInteraction(vehicle.id, 'whatsapp');
    const msg = encodeURIComponent(`Hi ${vehicle.seller.name}, I am interested in your ${vehicle.title} (Listed at ${formatPriceIndian(vehicle.price)} on OnRoadPriz). Is it still available?`);
    window.open(`https://wa.me/${vehicle.seller.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#DCE3EC] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DCE3EC] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="bg-[#087F5B] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              Verified Vehicle
            </span>
            <span className="bg-black text-[#F59E0B] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              0% Brokerage
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#98A2B3] hover:text-[#101828] hover:bg-[#F5F7FA] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Image Preview */}
            <div className="sm:w-1/2 aspect-[4/3] rounded-xl overflow-hidden bg-[#F5F7FA] border border-[#DCE3EC] relative shrink-0">
              {coverImage ? (
                <img 
                  src={coverImage} 
                  alt={vehicle.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🚗</div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                {vehicle.images.length} Photos
              </div>
            </div>

            {/* Key Information */}
            <div className="sm:w-1/2 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-xs font-bold text-[#667085] uppercase tracking-wider">
                  {vehicle.brand} • {vehicle.bodyType || vehicle.category}
                </p>
                <h3 className="text-lg font-bold text-[#101828] font-display mt-0.5">
                  {vehicle.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[#101828] mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#77101F]" />
                  <span>{vehicle.location?.area ? `${vehicle.location.area}, ` : ''}{vehicle.location?.city || vehicle.city || 'India'}</span>
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-[#77101F] font-display">
                  {formatPriceIndian(vehicle.price)}
                </div>
                {vehicle.negotiable && (
                  <span className="text-xs font-semibold text-[#087F5B]">
                    Price is Negotiable
                  </span>
                )}
              </div>

              {/* Direct Seller Card */}
              <div className="p-3 bg-[#F7F9FC] border border-[#DCE3EC] rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#101828]">{vehicle.seller.name}</span>
                  <span className="text-[10px] font-bold text-[#087F5B] bg-[#087F5B]/10 px-2 py-0.5 rounded-full">
                    Direct Owner
                  </span>
                </div>
                <p className="text-[11px] text-[#667085]">
                  Member since {vehicle.seller.memberSince || '2024'} • Fast response
                </p>
              </div>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#DCE3EC]">
            <div className="p-2.5 bg-[#F5F7FA] rounded-xl text-center">
              <span className="text-[10px] text-[#667085] block">Year</span>
              <span className="text-xs font-bold text-[#101828]">{vehicle.year}</span>
            </div>
            <div className="p-2.5 bg-[#F5F7FA] rounded-xl text-center">
              <span className="text-[10px] text-[#667085] block">KM Driven</span>
              <span className="text-xs font-bold text-[#101828]">{vehicle.kmDriven.toLocaleString('en-IN')} km</span>
            </div>
            <div className="p-2.5 bg-[#F5F7FA] rounded-xl text-center">
              <span className="text-[10px] text-[#667085] block">Fuel</span>
              <span className="text-xs font-bold text-[#101828]">{vehicle.fuelType}</span>
            </div>
            <div className="p-2.5 bg-[#F5F7FA] rounded-xl text-center">
              <span className="text-[10px] text-[#667085] block">Transmission</span>
              <span className="text-xs font-bold text-[#101828]">{vehicle.transmission}</span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-[#667085] line-clamp-2 leading-relaxed">
            {vehicle.description}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#DCE3EC] bg-[#F7F9FC] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => toggleWishlist(vehicle.id)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isSaved 
                ? 'bg-red-50 text-red-600 border-red-200' 
                : 'bg-white text-[#101828] border-[#DCE3EC] hover:border-[#77101F]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Wishlist'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCall}
              className="px-3.5 py-2 bg-white border border-[#DCE3EC] hover:border-[#77101F] text-[#101828] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#77101F]" />
              <span>Call Owner</span>
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleFullDetails}
              className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
