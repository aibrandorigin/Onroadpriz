/**
 * Authorized Vehicle Lookup Provider Abstraction
 * Supports swappable authorized providers (Signzy, Surepass, Karza, Sandbox, or G2B VAHAN gateway)
 * Enforces zero-PII leakage: Never exposes owner private addresses, phone numbers, or identity documents.
 */

import { NormalizedVehicleLookupResponse, NormalizedVehicleData, NormalizedComplianceData, NormalizedVerificationData } from '../../types';

export interface VehicleLookupProvider {
  name: string;
  isConfigured(): boolean;
  lookup(registrationNumber: string): Promise<NormalizedVehicleLookupResponse>;
}

export class ConfiguredVehicleLookupProvider implements VehicleLookupProvider {
  public readonly name: string;
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor() {
    this.name = process.env.VEHICLE_LOOKUP_PROVIDER || 'Authorized VAHAN Gateway';
    this.apiUrl = process.env.VEHICLE_LOOKUP_API_URL || '';
    this.apiKey = process.env.VEHICLE_LOOKUP_API_KEY || '';
    this.timeoutMs = parseInt(process.env.VEHICLE_LOOKUP_TIMEOUT_MS || '8000', 10);
  }

  /**
   * Check if legitimate provider credentials have been supplied
   */
  public isConfigured(): boolean {
    return Boolean(this.apiUrl && this.apiUrl.trim() && this.apiKey && this.apiKey.trim());
  }

  /**
   * Perform lookup against the configured external vehicle verification gateway
   */
  public async lookup(registrationNumber: string): Promise<NormalizedVehicleLookupResponse> {
    const regUpper = registrationNumber.toUpperCase().trim();

    // 1. If provider credentials are not configured, reject with clear UNCONFIGURED status
    if (!this.isConfigured()) {
      return {
        success: false,
        providerConfigured: false,
        registrationNumber: regUpper,
        error: 'Vehicle data provider not configured in server environment. Please configure VEHICLE_LOOKUP_API_KEY and VEHICLE_LOOKUP_API_URL on the server.',
        errorCode: 'UNCONFIGURED',
      };
    }

    // 2. Prepare authorized HTTP call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      // Secure server-to-server call. Header/payload format adapts to provider conventions.
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'x-api-key': this.apiKey,
        'User-Agent': 'OnRoadPriz-VehicleVerification/2.0',
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          registrationNumber: regUpper,
          vehicleNumber: regUpper,
          rc_number: regUpper,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP status codes gracefully
      if (response.status === 401 || response.status === 403) {
        console.error(`[VehicleLookup] Provider authentication failed (${response.status})`);
        return {
          success: false,
          providerConfigured: true,
          registrationNumber: regUpper,
          error: 'Vehicle verification provider authentication failed. Check server API credentials.',
          errorCode: 'AUTH_ERROR',
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          providerConfigured: true,
          registrationNumber: regUpper,
          error: `No vehicle records found for registration number "${regUpper}" in the national register.`,
          errorCode: 'NOT_FOUND',
        };
      }

      if (response.status === 429) {
        return {
          success: false,
          providerConfigured: true,
          registrationNumber: regUpper,
          error: 'Vehicle verification provider quota exceeded. Please try again shortly.',
          errorCode: 'RATE_LIMITED',
        };
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[VehicleLookup] Provider responded with HTTP ${response.status}: ${errorText.slice(0, 150)}`);
        return {
          success: false,
          providerConfigured: true,
          registrationNumber: regUpper,
          error: `Vehicle verification service returned error status (${response.status}).`,
          errorCode: 'PROVIDER_ERROR',
        };
      }

      const rawData = await response.json();

      // Normalize provider specific data into OnRoadPriz internal standard
      return this.normalizeProviderPayload(regUpper, rawData);
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        return {
          success: false,
          providerConfigured: true,
          registrationNumber: regUpper,
          error: 'Vehicle lookup request timed out after 8 seconds. Please try again or enter details manually.',
          errorCode: 'TIMEOUT',
        };
      }

      console.error('[VehicleLookup] Network or provider call failure:', err.message);
      return {
        success: false,
        providerConfigured: true,
        registrationNumber: regUpper,
        error: 'Unable to reach the vehicle verification provider. Please check network connection.',
        errorCode: 'PROVIDER_ERROR',
      };
    }
  }

  /**
   * Normalizes disparate provider JSON formats (Signzy, Surepass, Karza, Sandbox, G2B)
   * while STRICTLY removing any owner private personal data.
   */
  private normalizeProviderPayload(registrationNumber: string, raw: any): NormalizedVehicleLookupResponse {
    // Traverse common root paths: raw.data, raw.result, raw.response, or raw
    const r = raw.data || raw.result || raw.response || raw;

    if (!r) {
      return {
        success: false,
        providerConfigured: true,
        registrationNumber,
        error: 'Empty or unrecognized response structure from vehicle verification service.',
        errorCode: 'PROVIDER_ERROR',
      };
    }

    // Extract Maker / Brand
    const manufacturer = (
      r.maker_description ||
      r.maker_name ||
      r.maker ||
      r.manufacturer ||
      r.brand ||
      ''
    ).trim();

    // Extract Model
    const model = (
      r.maker_model ||
      r.model ||
      r.vehicle_model ||
      ''
    ).trim();

    // Extract Variant
    const variant = (
      r.variant ||
      r.model_variant ||
      r.trim ||
      ''
    ).trim();

    // Extract Fuel
    const rawFuel = (r.fuel_type || r.fuel || r.type_of_fuel || '').toUpperCase();
    let fuelType = 'Petrol';
    if (rawFuel.includes('DIESEL')) fuelType = 'Diesel';
    else if (rawFuel.includes('ELEC') || rawFuel.includes('EV')) fuelType = 'Electric';
    else if (rawFuel.includes('CNG')) fuelType = 'CNG';
    else if (rawFuel.includes('HYBRID')) fuelType = 'Hybrid';
    else if (rawFuel.includes('LPG')) fuelType = 'LPG';

    // Transmission (if provided by commercial database, else fallback)
    const transmission = (r.transmission || r.gear_box || 'Manual').includes('AUTO') ? 'Automatic' : 'Manual';

    // Years
    const manufacturingYear = r.manufacturing_year || r.manufacture_year || r.m_year || new Date().getFullYear();
    const registrationDate = r.registration_date || r.reg_date || r.registered_on || '';

    // Color & Body
    const color = (r.color || r.colour || r.vehicle_color || '').trim();
    const bodyType = (r.body_type_description || r.body_type || r.body || '').trim();

    // Engine & Seating
    const engineCapacityCC = parseInt(r.cubic_capacity || r.engine_capacity || r.cc || '0', 10) || null;
    const seatingCapacity = parseInt(r.seating_capacity || r.seats || '5', 10) || 5;

    // RTO & Jurisdiction
    const rtoCode = (r.rto_code || r.rto || registrationNumber.substring(0, 4)).toUpperCase();
    const rtoName = (r.registered_at || r.rto_name || r.registering_authority || '').trim();
    const state = (r.state || r.state_name || '').trim();

    // Status
    const registrationStatus = (r.status || r.rc_status || r.registration_status || 'Active').trim();

    const vehicle: NormalizedVehicleData = {
      manufacturer: manufacturer || 'Verified Vehicle',
      model: model || 'Registered Model',
      variant: variant || '',
      vehicleClass: r.vehicle_class || r.class || 'Motor Car (LMV)',
      vehicleCategory: r.vehicle_category || 'Cars',
      fuelType,
      transmission,
      manufacturingMonth: r.manufacturing_month || '',
      manufacturingYear,
      registrationDate,
      color: color || 'Standard',
      bodyType: bodyType || 'Sedan / SUV',
      engineCapacityCC,
      seatingCapacity,
      rtoCode,
      rtoName,
      state,
      registrationStatus,
    };

    const compliance: NormalizedComplianceData = {
      insuranceStatus: r.insurance_status || (r.insurance_upto ? 'Active' : 'Unverified'),
      insuranceValidUntil: r.insurance_upto || r.insurance_valid_upto || '',
      pucStatus: r.pucc_status || (r.pucc_upto ? 'Active' : 'Unverified'),
      pucValidUntil: r.pucc_upto || r.puc_valid_upto || '',
      fitnessValidUntil: r.fitness_upto || '',
      taxValidUntil: r.tax_upto || '',
      hypothecation: r.financer || r.hypothecated_to || null,
    };

    const verification: NormalizedVerificationData = {
      lookupCompleted: true,
      provider: this.name,
      verifiedAt: new Date().toISOString(),
      referenceId: r.request_id || r.transaction_id || `REF-${Date.now()}`,
    };

    return {
      success: true,
      providerConfigured: true,
      registrationNumber,
      vehicle,
      compliance,
      verification,
    };
  }
}

// Export singleton instance of the configured provider
export const vehicleLookupProvider = new ConfiguredVehicleLookupProvider();
