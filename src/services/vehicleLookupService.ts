import { NormalizedVehicleLookupResponse } from '../types';
import { normalizeRegistrationNumber, validateRegistrationNumber } from '../server/vehicleLookup/validator';

export { normalizeRegistrationNumber, validateRegistrationNumber };

/**
 * Service to execute registration number lookup against OnRoadPriz backend API
 */
export async function lookupVehicleRegistration(rawRegistration: string): Promise<NormalizedVehicleLookupResponse> {
  const normalized = normalizeRegistrationNumber(rawRegistration);
  const validation = validateRegistrationNumber(normalized);

  if (!validation.isValid) {
    return {
      success: false,
      registrationNumber: normalized,
      error: validation.error || 'Invalid vehicle registration number.',
      errorCode: 'INVALID_REGISTRATION',
    };
  }

  try {
    const res = await fetch('/api/vehicle/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationNumber: normalized,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!data) {
      return {
        success: false,
        registrationNumber: normalized,
        error: 'Unable to parse vehicle lookup response from server.',
        errorCode: 'MALFORMED_RESPONSE',
      };
    }

    return data;
  } catch (err: any) {
    console.error('Vehicle lookup network error:', err);
    return {
      success: false,
      registrationNumber: normalized,
      error: 'Network connectivity error while contacting vehicle verification server. Please check your internet connection or enter details manually.',
      errorCode: 'NETWORK_ERROR',
    };
  }
}

/**
 * Check if the external VAHAN provider is configured on the backend
 */
export async function checkProviderStatus(): Promise<{ providerConfigured: boolean; providerName: string }> {
  try {
    const res = await fetch('/api/vehicle/provider-status');
    if (!res.ok) throw new Error('Provider status check failed');
    return await res.json();
  } catch {
    return {
      providerConfigured: false,
      providerName: 'Authorized VAHAN Gateway',
    };
  }
}
