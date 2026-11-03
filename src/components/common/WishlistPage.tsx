import React from 'react';
import { useApp } from '../../context/AppContext';
import { VehicleCard } from '../marketplace/VehicleCard';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { vehicles, wishlist, navigate, clearWishlist } = useApp();

  const savedVehicles = vehicles.filter(v => wishlist.includes(v.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE3EC] pb-6">
        <div>
          <button
            onClick={() => navigate('/buy')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#667085] hover:text-[#77101F] mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#101828] font-display flex items-center gap-3">
            <span>Saved Vehicles</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#77101F]/10 text-[#77101F]">
              {savedVehicles.length} Saved
            </span>
          </h1>
        </div>

        {savedVehicles.length > 0 && (
          <button
            onClick={clearWishlist}
            className="px-3.5 py-2 text-xs font-bold text-[#77101F] hover:bg-[#77101F]/5 border border-[#77101F]/30 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Saved List</span>
          </button>
        )}
      </div>

      {savedVehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DCE3EC] p-16 text-center space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#77101F]/10 text-[#77101F] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#101828] font-display">Your Wishlist is Empty</h3>
          <p className="text-xs text-[#667085] leading-relaxed">
            Browse verified cars, bikes, commercial trucks, or heavy machinery and click the heart icon to save your favorites for direct owner inspection.
          </p>
          <button
            onClick={() => navigate('/buy')}
            className="px-6 py-2.5 bg-[#77101F] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#5E0B17] transition-all"
          >
            Explore Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedVehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} viewMode="grid" />
          ))}
        </div>
      )}
    </div>
  );
};
