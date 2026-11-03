import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ALL_CITIES, getPlacesForCity } from '../../data/locationData';
import { ConfirmedLocation } from '../../types';
import { 
  MapPin, 
  Search, 
  LocateFixed, 
  X, 
  Check, 
  RotateCcw, 
  AlertTriangle, 
  Navigation,
  ShieldCheck,
  Compass,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const LocationModal: React.FC = () => {
  const { 
    selectedCity, 
    selectedLocality, 
    setSelectedLocation, 
    isLocationModalOpen, 
    setLocationModalOpen,
    confirmedLocation,
    pendingDetectedLocation,
    setPendingDetectedLocation,
    confirmLocation,
    detectLocationHighAccuracy,
    updateUserLocation,
    currentUser,
    showToast 
  } = useApp();

  type ModalView = 'prompt' | 'detecting' | 'detected' | 'manual' | 'denied';

  const [view, setView] = useState<ModalView>('manual');
  const [detectionProgress, setDetectionProgress] = useState<string>('');
  const [detectionError, setDetectionError] = useState<string>('');
  const [activeCity, setActiveCity] = useState<string>(selectedCity || '');
  const [activeLocality, setActiveLocality] = useState<string>(selectedLocality || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customLocality, setCustomLocality] = useState<string>('');

  // Sync state whenever modal opens
  useEffect(() => {
    if (isLocationModalOpen) {
      if (pendingDetectedLocation) {
        setView('detected');
      } else if (confirmedLocation && confirmedLocation.location_source === 'DEVICE_GEOLOCATION') {
        setView('detected');
      } else {
        setView('manual');
      }
      setActiveCity(selectedCity || '');
      setActiveLocality(selectedLocality || '');
      setSearchQuery('');
      setDetectionError('');
    }
  }, [isLocationModalOpen, pendingDetectedLocation, confirmedLocation, selectedCity, selectedLocality]);

  if (!isLocationModalOpen) return null;

  const currentDisplayLocation = pendingDetectedLocation || confirmedLocation;
  const currentPlaces = activeCity ? getPlacesForCity(activeCity) : [];

  const queryLower = searchQuery.toLowerCase().trim();
  const filteredCities = queryLower
    ? ALL_CITIES.filter(c => c.toLowerCase().includes(queryLower))
    : ALL_CITIES;

  const filteredPlaces = queryLower
    ? currentPlaces.filter(p => p.toLowerCase().includes(queryLower))
    : currentPlaces;

  const handleStartDetection = async () => {
    setView('detecting');
    setDetectionError('');
    setDetectionProgress('Requesting high-accuracy device location...');

    const res = await detectLocationHighAccuracy((msg) => {
      setDetectionProgress(msg);
    });

    if (res.status === 'granted' && res.location) {
      setView('detected');
    } else if (res.status === 'denied') {
      setView('denied');
      setDetectionError('Location permission required for precise location.');
    } else {
      setView('manual');
      setDetectionError(res.error || 'Could not obtain precise device location.');
      showToast('Location Detection Notice', res.error || 'Please select your location manually.', 'info');
    }
  };

  const handleConfirmDetected = async () => {
    const target = pendingDetectedLocation || confirmedLocation;
    if (target) {
      await confirmLocation(target);
    }
  };

  const handleApplyManual = async () => {
    if (!activeCity) {
      showToast('Select City', 'Please select a city first from the list below.', 'warning');
      return;
    }
    const finalLocality = (customLocality.trim() || activeLocality || 'All Places').trim();
    const shortDisplay = finalLocality !== 'All Places' ? `${finalLocality}, ${activeCity}` : activeCity;

    const manualLoc: ConfirmedLocation = {
      city: activeCity,
      area: finalLocality !== 'All Places' ? finalLocality : undefined,
      locality: finalLocality !== 'All Places' ? finalLocality : undefined,
      formatted_address: shortDisplay,
      short_display: shortDisplay,
      location_source: 'MANUAL',
      location_confirmed_at: new Date().toISOString()
    };

    await confirmLocation(manualLoc);
  };

  const handleResetToAllIndia = async () => {
    setActiveCity('');
    setActiveLocality('');
    setCustomLocality('');
    setSelectedLocation('', '');
    setPendingDetectedLocation(null);
    await updateUserLocation({
      city: '',
      area: '',
      locality: '',
      formatted_address: '',
      location_name: '',
      location_source: 'MANUAL'
    });
    setLocationModalOpen(false);
    showToast('Location Cleared', 'Location reset. Showing vehicles across India.', 'info');
  };

  const accuracyMeters = currentDisplayLocation?.location_accuracy_meters;
  const isLowAccuracy = typeof accuracyMeters === 'number' && accuracyMeters > 100;
  const isHighAccuracy = typeof accuracyMeters === 'number' && accuracyMeters <= 25;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#DCE3EC] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#DCE3EC] flex items-start justify-between bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#77101F] text-white flex items-center justify-center font-black text-lg shadow-sm">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[#77101F] tracking-tight">OnRoadPriz Location</span>
                <span className="text-[10px] font-bold bg-[#77101F]/10 text-[#77101F] px-1.5 py-0.5 rounded">DIRECT RADIUS</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#101828] flex items-center gap-1.5 mt-0.5 font-display">
                Location Selection
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Detect high-precision device location or select your city & area manually.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setLocationModalOpen(false)}
            className="p-2 text-[#98A2B3] hover:text-[#101828] hover:bg-[#F5F7FA] rounded-full transition-colors"
            aria-label="Close location selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VIEW 1: DETECTING IN PROGRESS (ANIMATED RADAR) */}
        {view === 'detecting' && (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 flex-1">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#77101F]/10 animate-ping absolute" />
              <div className="w-20 h-20 rounded-full bg-[#77101F]/20 animate-pulse absolute" />
              <div className="w-16 h-16 rounded-full bg-[#77101F] text-white flex items-center justify-center shadow-lg relative z-10">
                <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-base sm:text-lg font-bold text-[#101828]">
                Requesting High-Accuracy Device Location
              </h3>
              <p className="text-xs text-[#667085] font-medium leading-relaxed">
                {detectionProgress || 'Acquiring GPS / GNSS coordinates with high accuracy radius...'}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-semibold mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>enableHighAccuracy: true • timeout: 15s • zero guessing</span>
              </div>
            </div>
            <button
              onClick={() => setView('manual')}
              className="text-xs font-bold text-[#667085] hover:text-[#101828] underline pt-2"
            >
              Cancel and select manually
            </button>
          </div>
        )}

        {/* VIEW 2: PERMISSION DENIED (SECTION 9) */}
        {view === 'denied' && (
          <div className="p-6 sm:p-8 space-y-5 flex-1 flex flex-col justify-center">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-900">
                  Location permission required for precise location
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Browser location permission was denied. We do NOT guess your location or default to any city. You can try allowing permission again or choose your city and locality manually below.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <button
                onClick={handleStartDetection}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#77101F] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#5E0B17] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => setView('manual')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#DCE3EC] text-[#101828] text-xs font-bold rounded-xl hover:bg-[#F5F7FA] transition-all"
              >
                <span>Select Location Manually</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: DETECTED LOCATION CONFIRMATION (SECTION 4 & 7) */}
        {view === 'detected' && currentDisplayLocation && (
          <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#667085]">
                  Detected Location:
                </span>
                <span className="text-[11px] font-semibold text-[#087F5B] bg-[#087F5B]/10 px-2.5 py-0.5 rounded-full">
                  Reverse-Geocoded Postal Address
                </span>
              </div>
              <div className="p-4 bg-[#F7F9FC] border border-[#DCE3EC] rounded-2xl space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#77101F] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-base sm:text-lg font-black text-[#101828] leading-snug">
                      {currentDisplayLocation?.city || 'Detected City'}
                      {currentDisplayLocation?.state ? `, ${currentDisplayLocation.state}` : ''}
                    </p>
                    <p className="text-xs font-semibold text-[#77101F]">
                      Showing all vehicles in {currentDisplayLocation?.city || 'your city'}
                    </p>
                    <p className="text-xs text-[#667085]">
                      Detected Address: {currentDisplayLocation?.formatted_address || [currentDisplayLocation?.premise, currentDisplayLocation?.street, currentDisplayLocation?.area, currentDisplayLocation?.city, currentDisplayLocation?.state, currentDisplayLocation?.postal_code].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>

                {/* Device Coordinates & Accuracy Radius */}
                <div className="pt-3 border-t border-[#DCE3EC]/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#667085]">Accuracy:</span>
                    <span className={`px-2.5 py-1 rounded-lg font-black text-xs inline-flex items-center gap-1.5 ${
                      isHighAccuracy 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : (isLowAccuracy 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                            : 'bg-blue-50 text-blue-700 border border-blue-200')
                    }`}>
                      <span>±{accuracyMeters !== undefined ? Math.round(accuracyMeters) : 10} metres</span>
                      <span>•</span>
                      <span>
                        {isHighAccuracy ? 'HIGH accuracy' : (isLowAccuracy ? 'LOW accuracy' : 'MEDIUM accuracy')}
                      </span>
                    </span>
                  </div>

                  {currentDisplayLocation.latitude && currentDisplayLocation.longitude && (
                    <span className="text-[11px] text-[#98A2B3] font-mono">
                      {currentDisplayLocation.latitude.toFixed(5)}° N, {currentDisplayLocation.longitude.toFixed(5)}° E
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Low accuracy warning callout (Section 7) */}
            {isLowAccuracy && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2 text-xs text-amber-800">
                  <p className="font-semibold">
                    Location accuracy is low (±{Math.round(accuracyMeters || 0)}m). Try detecting again or choose your location manually.
                  </p>
                  <button
                    onClick={handleStartDetection}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Detect Again</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons (Section 4) */}
            <div className="p-4 bg-white border border-[#DCE3EC] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setView('manual')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#DCE3EC] hover:border-[#77101F] text-xs font-bold text-[#101828] hover:bg-[#F5F7FA] transition-colors whitespace-nowrap"
                >
                  Change Location
                </button>
                <button
                  onClick={handleStartDetection}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#DCE3EC] text-xs font-bold text-[#667085] hover:text-[#101828] hover:bg-[#F5F7FA] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Detect Again</span>
                </button>
              </div>

              <button
                onClick={handleConfirmDetected}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                <span>Show Vehicles in {currentDisplayLocation?.city || 'This City'}</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: MANUAL CORRECTION & HUB SEARCH (SECTION 14) */}
        {view === 'manual' && (
          <>
            {/* Action bar: Detect exact location & Search */}
            <div className="p-4 sm:p-5 bg-[#F7F9FC] border-b border-[#DCE3EC] space-y-3 shrink-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={handleStartDetection}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#DCE3EC] hover:border-[#77101F] text-[#77101F] font-bold text-xs rounded-xl shadow-xs hover:bg-[#77101F]/5 transition-all"
                >
                  <LocateFixed className="w-4 h-4 text-[#77101F]" />
                  <span>Detect My Exact Location (High Accuracy)</span>
                </button>

                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search city, town, or locality..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#DCE3EC] rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-hidden focus:border-[#77101F] focus:ring-1 focus:ring-[#77101F]"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#98A2B3] hover:text-[#101828]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Body: City chips + Localities + Custom entry */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Primary City Chips */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                    Select City {queryLower ? `(Matching "${searchQuery}")` : ''}
                  </span>
                  <span className="text-[11px] text-[#98A2B3]">
                    {filteredCities.length} Indian Hubs
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                  {filteredCities.map((city) => {
                    const isSelected = activeCity.toLowerCase() === city.toLowerCase();
                    return (
                      <button
                        key={city}
                        onClick={() => {
                          setActiveCity(city);
                          setActiveLocality('All Places');
                          setCustomLocality('');
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-[#77101F] text-white border-[#77101F] shadow-sm font-bold'
                            : 'bg-white text-[#101828] border-[#DCE3EC] hover:border-[#77101F] hover:bg-[#F5F7FA]'
                        }`}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Localities in selected City */}
              {activeCity && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
                      Popular Localities in {activeCity}
                    </span>
                    <button
                      onClick={() => {
                        setActiveLocality('All Places');
                        setCustomLocality('');
                      }}
                      className={`text-xs font-bold flex items-center gap-1 transition-colors ${
                        activeLocality === 'All Places' && !customLocality ? 'text-[#77101F]' : 'text-[#667085] hover:text-[#77101F]'
                      }`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>All {activeCity}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                    {/* All Places option */}
                    <button
                      onClick={() => {
                        setActiveLocality('All Places');
                        setCustomLocality('');
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        activeLocality === 'All Places' && !customLocality
                          ? 'border-[#77101F] bg-[#77101F]/5 text-[#77101F] font-bold shadow-xs'
                          : 'border-[#DCE3EC] bg-white text-[#101828] hover:border-[#77101F]/50'
                      }`}
                    >
                      <span className="truncate">All {activeCity}</span>
                      {activeLocality === 'All Places' && !customLocality && (
                        <Check className="w-3.5 h-3.5 text-[#77101F] shrink-0" />
                      )}
                    </button>

                    {filteredPlaces.map((place) => {
                      const isSelected = activeLocality.toLowerCase() === place.toLowerCase() && !customLocality;
                      return (
                        <button
                          key={place}
                          onClick={() => {
                            setActiveLocality(place);
                            setCustomLocality('');
                          }}
                          className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[#77101F] bg-[#77101F]/5 text-[#77101F] font-bold shadow-xs'
                              : 'border-[#DCE3EC] bg-white text-[#101828] hover:border-[#77101F]/50'
                          }`}
                        >
                          <span className="truncate">{place}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#77101F] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Manual custom locality / building correction (Section 14) */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-[#667085] uppercase mb-1">
                      Or type custom building / street / area in {activeCity}:
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. Madhapur, Financial District, Road No. 36...`}
                      value={customLocality}
                      onChange={(e) => setCustomLocality(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-[#DCE3EC] rounded-xl text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-hidden focus:border-[#77101F]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM STICKY ACTIONS */}
            <div className="p-4 sm:p-5 bg-white border-t border-[#DCE3EC] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-lg">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#98A2B3]">
                  Selected Location:
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-black text-[#101828]">
                    {activeCity 
                      ? `${activeCity}${customLocality ? ` (${customLocality})` : (activeLocality && activeLocality !== 'All Places' ? ` (${activeLocality})` : '')}`
                      : 'All India (Select Location)'}
                  </span>
                  {activeCity && (
                    <span className="text-[10px] font-bold text-[#087F5B] bg-[#087F5B]/10 px-2 py-0.5 rounded-full">
                      Confirmed Filter
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleResetToAllIndia}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-red-200 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors whitespace-nowrap"
                  title="Clear location filter"
                >
                  Clear Filter
                </button>
                <button
                  onClick={handleApplyManual}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-md transition-all whitespace-nowrap"
                >
                  Apply Location
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
