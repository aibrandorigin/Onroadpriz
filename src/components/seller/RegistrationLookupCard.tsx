import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw, 
  ShieldCheck, 
  ExternalLink, 
  Edit3, 
  HelpCircle,
  FileCheck2,
  X,
  Sparkles
} from 'lucide-react';
import { Vehicle, RegistrationLookupStatus, NormalizedVehicleLookupResponse } from '../../types';
import { 
  normalizeRegistrationNumber, 
  validateRegistrationNumber, 
  lookupVehicleRegistration 
} from '../../services/vehicleLookupService';

interface RegistrationLookupCardProps {
  registrationNumber: string;
  onRegistrationChange: (reg: string) => void;
  onLookupSuccess: (data: NormalizedVehicleLookupResponse) => void;
  onManualEntrySelect: (reason?: string) => void;
  existingVehicles: Vehicle[];
  onViewExistingVehicle: (vehicleId: string) => void;
  lookupStatus: RegistrationLookupStatus;
  setLookupStatus: (status: RegistrationLookupStatus) => void;
  verifiedResult: NormalizedVehicleLookupResponse | null;
  allowManualEdit: boolean;
  onRequestManualCorrection: () => void;
}

export const RegistrationLookupCard: React.FC<RegistrationLookupCardProps> = ({
  registrationNumber,
  onRegistrationChange,
  onLookupSuccess,
  onManualEntrySelect,
  existingVehicles,
  onViewExistingVehicle,
  lookupStatus,
  setLookupStatus,
  verifiedResult,
  allowManualEdit,
  onRequestManualCorrection,
}) => {
  const [inputVal, setInputVal] = useState(registrationNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [duplicateVehicle, setDuplicateVehicle] = useState<Vehicle | null>(null);
  const [lookupError, setLookupError] = useState<{ message: string; code?: string; isUnconfigured?: boolean } | null>(null);

  // Handle typing & dynamic uppercase normalization
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputVal(raw);
    setValidationError(null);
    setDuplicateVehicle(null);
    setLookupError(null);
  };

  // Perform lookup action
  const handleFetchDetails = async () => {
    setValidationError(null);
    setDuplicateVehicle(null);
    setLookupError(null);

    const normalized = normalizeRegistrationNumber(inputVal);

    if (!normalized) {
      setValidationError('Please enter your vehicle registration number.');
      return;
    }

    // Step 1: Validate registration format
    const validation = validateRegistrationNumber(normalized);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Please enter a valid Indian registration number (e.g. AP39AB1234 or TS09EA1234).');
      return;
    }

    // Update parent registration state
    onRegistrationChange(normalized);
    setInputVal(normalized);

    // Step 2: Uniqueness Check in existing active inventory
    const activeDuplicate = existingVehicles.find(v => {
      if (v.status === 'Sold' || v.status === 'Rejected') return false;
      const vReg = normalizeRegistrationNumber(v.registrationNumber || v.vehicleRegistrationNumber || '');
      return vReg === normalized;
    });

    if (activeDuplicate) {
      setDuplicateVehicle(activeDuplicate);
      return;
    }

    // Step 3: Trigger Server Lookup
    setIsLoading(true);
    setLookupStatus('NOT_CHECKED');

    try {
      const response = await lookupVehicleRegistration(normalized);

      if (response.success && response.vehicle) {
        setLookupStatus('LOOKUP_SUCCESS');
        onLookupSuccess(response);
      } else {
        // Distinguish unconfigured provider vs not found / timeout
        if (response.errorCode === 'UNCONFIGURED' || response.providerConfigured === false) {
          setLookupStatus('LOOKUP_FAILED');
          setLookupError({
            message: 'Vehicle data provider not configured on server. You can enter vehicle details manually.',
            code: 'UNCONFIGURED',
            isUnconfigured: true,
          });
        } else if (response.errorCode === 'NOT_FOUND') {
          setLookupStatus('LOOKUP_FAILED');
          setLookupError({
            message: `No registration record found for "${normalized}". Please verify the number or proceed with manual entry.`,
            code: 'NOT_FOUND',
          });
        } else if (response.errorCode === 'TIMEOUT') {
          setLookupStatus('LOOKUP_FAILED');
          setLookupError({
            message: 'Verification request timed out. Please try again or enter details manually.',
            code: 'TIMEOUT',
          });
        } else if (response.errorCode === 'RATE_LIMITED') {
          setLookupStatus('LOOKUP_FAILED');
          setLookupError({
            message: response.error || 'Lookup rate limit exceeded. Please wait a moment before trying again.',
            code: 'RATE_LIMITED',
          });
        } else {
          setLookupStatus('LOOKUP_FAILED');
          setLookupError({
            message: response.error || "We couldn't automatically retrieve the vehicle details.",
            code: response.errorCode || 'LOOKUP_FAILED',
          });
        }
      }
    } catch {
      setLookupStatus('LOOKUP_FAILED');
      setLookupError({
        message: 'Unexpected network error while contacting verification server.',
        code: 'NETWORK_ERROR',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInputVal('');
    onRegistrationChange('');
    setLookupStatus('NOT_CHECKED');
    setDuplicateVehicle(null);
    setLookupError(null);
    setValidationError(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#DCE3EC] p-6 sm:p-7 shadow-xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCE3EC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#101828] font-display">
              Tell us about your vehicle
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#77101F]/10 text-[#77101F]">
              STEP 1: REGISTRATION LOOKUP
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Enter your vehicle registration number to automatically fetch verified vehicle details.
          </p>
        </div>

        {lookupStatus === 'LOOKUP_SUCCESS' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>✓ Verified by Registration</span>
          </span>
        )}
      </div>

      {/* Input Row */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#101828]">
          Vehicle Registration Number *
        </label>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
              <span className="text-[11px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                IND
              </span>
            </div>
            
            <input
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleFetchDetails();
                }
              }}
              disabled={isLoading || (lookupStatus === 'LOOKUP_SUCCESS' && !allowManualEdit)}
              placeholder="e.g. AP39AB1234 or TS09EA4567"
              className="w-full pl-16 pr-4 py-3 bg-[#F8FAFC] border border-[#DCE3EC] rounded-xl text-sm font-mono font-bold tracking-wider text-[#101828] uppercase placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal focus:bg-white focus:outline-hidden focus:border-[#77101F] focus:ring-1 focus:ring-[#77101F] transition-all disabled:bg-slate-50 disabled:text-slate-500"
            />

            {inputVal && !isLoading && (
              <button
                type="button"
                onClick={handleReset}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleFetchDetails}
            disabled={isLoading || !inputVal.trim() || (lookupStatus === 'LOOKUP_SUCCESS' && !allowManualEdit)}
            className="px-6 py-3 bg-[#77101F] hover:bg-[#5E0B17] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Fetching vehicle details...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Fetch Vehicle Details</span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-[#667085]">
          Format: 2-letter state code + 2-digit RTO + series + 4 digits (e.g. <strong>AP39AB1234</strong>, <strong>TS09EA1234</strong>, or Bharat series <strong>22BH1234AA</strong>).
        </p>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Invalid Registration: </span>
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {/* Loading Skeleton Indicator */}
      {isLoading && (
        <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3 animate-pulse">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
            <RotateCw className="w-4 h-4 animate-spin text-[#77101F]" />
            <span>Connecting to vehicle verification gateway & looking up records...</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="h-12 bg-slate-200/70 rounded-xl" />
            <div className="h-12 bg-slate-200/70 rounded-xl" />
            <div className="h-12 bg-slate-200/70 rounded-xl" />
            <div className="h-12 bg-slate-200/70 rounded-xl" />
          </div>
        </div>
      )}

      {/* Uniqueness Collision: Already Listed Vehicle */}
      {duplicateVehicle && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 animate-in zoom-in-95">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-900">
                This vehicle appears to already be listed on OnRoadPriz
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Registration number <strong>{inputVal.toUpperCase()}</strong> is associated with an active listing:{' '}
                <strong>{duplicateVehicle.title}</strong> (₹{duplicateVehicle.price.toLocaleString('en-IN')}) listed by{' '}
                {duplicateVehicle.seller?.name || 'Seller'}.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-amber-200/70">
            <button
              type="button"
              onClick={() => onViewExistingVehicle(duplicateVehicle.id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Existing Listing</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-white border border-amber-300 text-amber-900 text-xs font-bold rounded-xl hover:bg-amber-100/50 transition-colors"
            >
              Use Different Registration
            </button>
            <span className="text-[11px] text-amber-700 italic">
              Need ownership transfer assistance? Contact moderation support.
            </span>
          </div>
        </div>
      )}

      {/* Lookup Error / Provider Unconfigured */}
      {lookupError && !duplicateVehicle && (
        <div className={`p-5 rounded-2xl border space-y-3 animate-in zoom-in-95 ${
          lookupError.isUnconfigured
            ? 'bg-blue-50/70 border-blue-200 text-blue-900'
            : 'bg-rose-50/70 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-start gap-3">
            {lookupError.isUnconfigured ? (
              <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="text-xs font-bold">
                {lookupError.isUnconfigured 
                  ? 'Vehicle data provider not configured' 
                  : "We couldn't automatically retrieve the vehicle details."}
              </h4>
              <p className="text-xs opacity-90 leading-relaxed">
                {lookupError.message}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-current/10">
            {!lookupError.isUnconfigured && (
              <button
                type="button"
                onClick={handleFetchDetails}
                className="px-4 py-2 bg-white border border-rose-300 text-rose-900 text-xs font-bold rounded-xl hover:bg-rose-100/60 transition-colors shadow-2xs"
              >
                Try Again
              </button>
            )}

            <button
              type="button"
              onClick={() => onManualEntrySelect(lookupError.message)}
              className="px-4 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
            >
              Enter Details Manually
            </button>

            <span className="text-[11px] opacity-75">
              (Listing will be routed for manual RC inspection before final badge issuance)
            </span>
          </div>
        </div>
      )}

      {/* SUCCESS STATE: Compact Summary Card matching specification */}
      {lookupStatus === 'LOOKUP_SUCCESS' && verifiedResult && verifiedResult.vehicle && (
        <div className="bg-emerald-50/40 border border-emerald-200/90 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="text-sm font-bold text-emerald-950 font-display">
                ✓ Vehicle details found
              </h3>
            </div>
            <span className="text-[11px] text-emerald-800 font-semibold">
              Source: {verifiedResult.verification?.provider || 'Authorized VAHAN Database'}
            </span>
          </div>

          {/* Compact Summary Card */}
          <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Registration Number
                </span>
                <span className="font-mono font-bold text-[#101828] text-sm mt-0.5 block">
                  {verifiedResult.registrationNumber}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Brand / Maker
                </span>
                <span className="font-bold text-[#101828] mt-0.5 block">
                  {verifiedResult.vehicle.manufacturer}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Model
                </span>
                <span className="font-bold text-[#101828] mt-0.5 block">
                  {verifiedResult.vehicle.model} {verifiedResult.vehicle.variant || ''}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Manufacturing Year
                </span>
                <span className="font-bold text-[#101828] mt-0.5 block">
                  {verifiedResult.vehicle.manufacturingYear}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Fuel Type
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {verifiedResult.vehicle.fuelType}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Colour
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {verifiedResult.vehicle.color || 'Standard'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  RTO Jurisdiction
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {verifiedResult.vehicle.rtoCode} {verifiedResult.vehicle.rtoName ? `(${verifiedResult.vehicle.rtoName})` : ''}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Registration Status
                </span>
                <span className="font-bold text-emerald-700 mt-0.5 block">
                  {verifiedResult.vehicle.registrationStatus || 'Active'}
                </span>
              </div>
            </div>

            {/* Compliance strip if available */}
            {verifiedResult.compliance && (verifiedResult.compliance.insuranceValidUntil || verifiedResult.compliance.pucValidUntil) && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
                {verifiedResult.compliance.insuranceValidUntil && (
                  <span className="inline-flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Insurance Valid: <strong>{verifiedResult.compliance.insuranceValidUntil}</strong></span>
                  </span>
                )}
                {verifiedResult.compliance.pucValidUntil && (
                  <span className="inline-flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PUC Valid: <strong>{verifiedResult.compliance.pucValidUntil}</strong></span>
                  </span>
                )}
                {verifiedResult.compliance.hypothecation && (
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <span>Hypothecated: {verifiedResult.compliance.hypothecation}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="text-xs text-emerald-900">
              ✓ Available specifications have been automatically mapped into the form below.
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {!allowManualEdit ? (
                <button
                  type="button"
                  onClick={onRequestManualCorrection}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Vehicle information incorrect?</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                  Manual Correction Mode (Requires Review)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
