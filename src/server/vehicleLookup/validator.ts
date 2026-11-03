/**
 * Indian Vehicle Registration Number Validator & Normalizer
 * Conforms to Ministry of Road Transport and Highways (MoRTH) standards
 */

// Recognized Indian State & Union Territory codes
export const INDIAN_STATE_CODES: Record<string, string> = {
  AN: 'Andaman and Nicobar Islands',
  AP: 'Andhra Pradesh',
  AR: 'Arunachal Pradesh',
  AS: 'Assam',
  BR: 'Bihar',
  CG: 'Chhattisgarh',
  CH: 'Chandigarh',
  DD: 'Daman and Diu',
  DL: 'Delhi',
  DN: 'Dadra and Nagar Haveli',
  GA: 'Goa',
  GJ: 'Gujarat',
  HP: 'Himachal Pradesh',
  HR: 'Haryana',
  JH: 'Jharkhand',
  JK: 'Jammu and Kashmir',
  KA: 'Karnataka',
  KL: 'Kerala',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  MH: 'Maharashtra',
  ML: 'Meghalaya',
  MN: 'Manipur',
  MP: 'Madhya Pradesh',
  MZ: 'Mizoram',
  NL: 'Nagaland',
  OD: 'Odisha',
  PB: 'Punjab',
  PY: 'Puducherry',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  TR: 'Tripura',
  TS: 'Telangana',
  UK: 'Uttarakhand',
  UP: 'Uttar Pradesh',
  WB: 'West Bengal',
};

export interface RegistrationValidationResult {
  isValid: boolean;
  normalized: string;
  error?: string;
  stateCode?: string;
  stateName?: string;
  rtoCode?: string;
  isBharatSeries?: boolean;
}

/**
 * Normalizes input registration string:
 * - Trims leading/trailing whitespace
 * - Removes spaces, hyphens, periods, underscores
 * - Converts to uppercase
 *
 * e.g. "ap 39 ab 1234" -> "AP39AB1234"
 *      "TS-09-EA-9876" -> "TS09EA9876"
 *      "dl01a1234"     -> "DL01A1234"
 */
export function normalizeRegistrationNumber(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/[\s\-_.]+/g, '')
    .toUpperCase();
}

/**
 * Validates normalized registration number
 * Standard Indian format:
 *   [2 Letter State Code][1-2 Digit RTO Code][0-3 Letters Series][1-4 Digits Unique Number]
 *   Example: AP39AB1234, TS09EA4567, DL01A1234, MH12DE1433
 *
 * Bharat (BH) Series format (introduced Sept 2021):
 *   [2 Digit Year (e.g. 21, 22, 23, 24, 25, 26)]BH[4 Digits Number][1-2 Letters]
 *   Example: 22BH1234AA
 */
export function validateRegistrationNumber(rawInput: string): RegistrationValidationResult {
  const normalized = normalizeRegistrationNumber(rawInput);

  if (!normalized) {
    return {
      isValid: false,
      normalized: '',
      error: 'Please enter a vehicle registration number.',
    };
  }

  if (normalized.length < 6 || normalized.length > 11) {
    return {
      isValid: false,
      normalized,
      error: 'Registration number length is invalid (must be between 6 and 11 characters).',
    };
  }

  // Check Bharat (BH) series format: YYBH####XX
  const bhRegex = /^([0-9]{2})BH([0-9]{4})([A-Z]{1,2})$/;
  const bhMatch = normalized.match(bhRegex);
  if (bhMatch) {
    return {
      isValid: true,
      normalized,
      isBharatSeries: true,
      stateCode: 'BH',
      stateName: 'Bharat Series (Pan-India)',
      rtoCode: 'BH',
    };
  }

  // Standard Indian State registration regex
  // State code (2 letters), District RTO (1-2 digits), Series (0-3 letters), Number (1-4 digits)
  const standardRegex = /^([A-Z]{2})([0-9]{1,2})([A-Z]{0,3})([0-9]{1,4})$/;
  const match = normalized.match(standardRegex);

  if (!match) {
    return {
      isValid: false,
      normalized,
      error: 'Invalid format. Format should be like AP39AB1234 or TS09EA1234.',
    };
  }

  const stateCode = match[1];
  const rtoNum = match[2];
  const stateName = INDIAN_STATE_CODES[stateCode];

  if (!stateName) {
    return {
      isValid: false,
      normalized,
      error: `Unknown state code "${stateCode}". Please verify your registration number.`,
    };
  }

  return {
    isValid: true,
    normalized,
    stateCode,
    stateName,
    rtoCode: `${stateCode}-${rtoNum.padStart(2, '0')}`,
    isBharatSeries: false,
  };
}
