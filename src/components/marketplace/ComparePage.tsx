import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  SlidersHorizontal, 
  Trash2, 
  Plus, 
  X, 
  Check, 
  MapPin, 
  ShieldCheck, 
  ArrowLeft, 
  Phone, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { 
    vehicles, 
    compareList, 
    removeFromCompare, 
    clearCompare, 
    addToCompare, 
    navigate, 
    setSelectedVehicleId,
    recordVehicleInteraction,
    showToast
  } = useApp();

  const comparedVehicles = vehicles.filter(v => compareList.includes(v.id));
  const availableToAdd = vehicles.filter(v => v.status === 'Published' && !compareList.includes(v.id));

  const formatPrice = (val: number) => '₹' + val.toLocaleString('en-IN');

  const handleCall = (v: typeof vehicles[0]) => {
    recordVehicleInteraction(v.id, 'call');
    showToast('Direct Owner Contact', `Seller: ${v.seller.name} (${v.seller.phone})`, 'info');
    window.open(`tel:${v.seller.phone}`, '_self');
  };

  const handleWhatsApp = (v: typeof vehicles[0]) => {
    recordVehicleInteraction(v.id, 'whatsapp');
    const msg = encodeURIComponent(`Hi ${v.seller.name}, I am comparing your ${v.title} on OnRoadPriz (Listed for ${formatPrice(v.price)}). Is this vehicle still available?`);
    window.open(`https://wa.me/${v.seller.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
  };

  if (comparedVehicles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-[#77101F]/10 text-[#77101F] flex items-center justify-center mx-auto">
          <SlidersHorizontal className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#101828] font-display">
          No Vehicles in Comparison
        </h2>
        <p className="text-xs sm:text-sm text-[#667085] max-w-md mx-auto leading-relaxed">
          You can select up to 4 vehicles from the marketplace to evaluate technical specifications, pricing, and ownership details side-by-side.
        </p>
        <button
          onClick={() => navigate('/buy')}
          className="px-6 py-3 bg-[#77101F] hover:bg-[#5E0B17] text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Explore Verified Vehicles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
            <span>Vehicle Comparison Matrix</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#77101F]/10 text-[#77101F]">
              {comparedVehicles.length} / 4 Selected
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {comparedVehicles.length < 4 && availableToAdd.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addToCompare(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="text-xs font-bold p-2.5 border border-[#DCE3EC] rounded-xl bg-white text-[#101828] focus:outline-hidden focus:border-[#77101F]"
            >
              <option value="" disabled>+ Add Another Vehicle...</option>
              {availableToAdd.map(v => (
                <option key={v.id} value={v.id}>{v.title} ({formatPrice(v.price)})</option>
              ))}
            </select>
          )}

          <button
            onClick={clearCompare}
            className="px-3.5 py-2 text-xs font-bold text-[#77101F] hover:bg-[#77101F]/5 border border-[#77101F]/30 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Matrix</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="overflow-x-auto bg-white rounded-3xl border border-[#DCE3EC] shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#DCE3EC] bg-[#F5F7FA]">
              <th className="p-4 w-48 text-xs font-bold text-[#667085] uppercase tracking-wider">
                Specification
              </th>
              {comparedVehicles.map(v => (
                <th key={v.id} className="p-4 text-left align-top min-w-[240px]">
                  <div className="space-y-3">
                    <div className="relative h-36 rounded-2xl overflow-hidden bg-[#F5F7FA] border border-[#DCE3EC]">
                      <img
                        src={v.images[0]}
                        alt={v.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeFromCompare(v.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-[#77101F] text-white transition-colors"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#98A2B3] uppercase">
                        {v.brand} • {v.year}
                      </span>
                      <h3 
                        onClick={() => { setSelectedVehicleId(v.id); navigate(`/buy/${v.id}`); }}
                        className="text-sm font-bold text-[#101828] hover:text-[#77101F] cursor-pointer line-clamp-1 font-display"
                      >
                        {v.title}
                      </h3>
                      <div className="text-lg font-black text-[#77101F] mt-1 font-display">
                        {formatPrice(v.price)}
                      </div>
                      <p className="text-[10px] text-[#667085]">
                        {v.negotiable ? 'Negotiable Price' : 'Fixed Price'}
                      </p>
                    </div>

                    <div className="flex gap-1.5 pt-1">
                      <button
                        onClick={() => handleCall(v)}
                        className="flex-1 py-1.5 text-[11px] font-bold rounded-xl border border-[#DCE3EC] hover:border-[#77101F] text-[#101828] hover:text-[#77101F] flex items-center justify-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </button>
                      <button
                        onClick={() => handleWhatsApp(v)}
                        className="flex-1 py-1.5 text-[11px] font-bold rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white flex items-center justify-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#DCE3EC]/60 text-xs">
            <tr>
              <td className="p-4 font-bold text-[#667085] bg-[#F5F7FA]">Category</td>
              {comparedVehicles.map(v => (
                <td key={v.id} className="p-4 font-semibold text-[#101828]">{v.category}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#667085] bg-[#F5F7FA]">KM Driven</td>
              {comparedVehicles.map(v => (
                <td key={v.id} className="p-4 font-black text-[#101828]">{v.kmDriven.toLocaleString('en-IN')} KM</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#667085] bg-[#F5F7FA]">Fuel Type</td>
              {comparedVehicles.map(v => (
                <td key={v.id} className="p-4 font-semibold text-[#101828]">{v.fuelType}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#667085] bg-[#F5F7FA]">Transmission</td>
              {comparedVehicles.map(v => (
                <td key={v.id} className="p-4 font-semibold text-[#101828]">{v.transmission}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#667085] bg-[#F5F7FA]">Ownership</td>
              {comparedVehicles.map(v => (
                <td key={v.id} className="p-4 font-semibold text-[#101828]">{v.ownership}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#667085] bg-[#F5F7FA]">Condition</td>
              {comparedVehicles.map(v => (
                <td key={v.id} className="p-4 font-bold text-[#087F5B]">{v.condition}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#667085] bg-[#F5F7FA]">Engine Displacement</td>
              {comparedVehicles.map(v => (
                <td key={v.id} className="p-4 text-[#667085]">{v.engineCapacity || 'N/A'}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#667085] bg-[#F5F7FA]">RTO Registration</td>
              {comparedVehicles.map(v => (
                <td key={v.id} className="p-4 font-semibold text-[#101828]">{v.rtoCity}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#667085] bg-[#F5F7FA]">Location</td>
              {comparedVehicles.map(v => (
                <td key={v.id} className="p-4 text-[#667085]">
                  {v.location?.city || v.city || 'India'}{v.location?.state || v.state ? `, ${v.location?.state || v.state}` : ''}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#667085] bg-[#F5F7FA]">Seller Verification</td>
              {comparedVehicles.map(v => (
                <td key={v.id} className="p-4">
                  <span className="inline-flex items-center gap-1 font-bold text-[#087F5B]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {v.seller?.type || 'Direct Owner'} (Verified)
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-[#667085] bg-[#F5F7FA]">Features Included</td>
              {comparedVehicles.map(v => (
                <td key={v.id} className="p-4 align-top">
                  <ul className="space-y-1 text-[11px] text-[#667085]">
                    {v.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-[#087F5B] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
