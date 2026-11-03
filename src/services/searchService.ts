import { Vehicle } from '../types';
import { resolveCanonicalCity } from '../data/locationData';

/**
 * Normalizes text for search: lowercase, removes punctuation, reduces whitespace
 */
export function normalizeSearchText(text: string | number | undefined | null): string {
  if (text === undefined || text === null) return '';
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Checks if a search token matches a target word (exact, prefix, or minor typo)
 */
function tokenMatches(token: string, targetWord: string): { matched: boolean; score: number } {
  if (token === targetWord) {
    return { matched: true, score: 10 };
  }
  if (targetWord.startsWith(token)) {
    return { matched: true, score: 7 };
  }
  if (targetWord.includes(token)) {
    return { matched: true, score: 5 };
  }
  // Minor typo tolerance for tokens with length >= 4
  if (token.length >= 4 && targetWord.length >= 4) {
    const dist = levenshteinDistance(token, targetWord);
    if (dist <= 1) {
      return { matched: true, score: 4 };
    }
  }
  return { matched: false, score: 0 };
}

export interface SearchMatchResult {
  vehicle: Vehicle;
  score: number;
}

/**
 * Evaluates how well a vehicle matches a multi-attribute search query
 */
export function scoreVehicleSearch(vehicle: Vehicle, query: string): number {
  const normQuery = normalizeSearchText(query);
  if (!normQuery) return 1;

  const tokens = normQuery.split(' ').filter(t => t.length > 0);
  if (tokens.length === 0) return 1;

  // Build searchable index strings with weights
  const fields: { text: string; weight: number }[] = [
    { text: normalizeSearchText(vehicle.title), weight: 5 },
    { text: normalizeSearchText(vehicle.brand), weight: 6 },
    { text: normalizeSearchText(vehicle.model), weight: 6 },
    { text: normalizeSearchText(vehicle.variant), weight: 5 },
    { text: normalizeSearchText(vehicle.category), weight: 4 },
    { text: normalizeSearchText(vehicle.year), weight: 5 },
    { text: normalizeSearchText(vehicle.fuelType), weight: 4 },
    { text: normalizeSearchText(vehicle.transmission), weight: 4 },
    { text: normalizeSearchText(vehicle.bodyType), weight: 4 },
    { text: normalizeSearchText(vehicle.color), weight: 3 },
    { text: normalizeSearchText(vehicle.location?.city || vehicle.city), weight: 5 },
    { text: normalizeSearchText(vehicle.location?.state || vehicle.state), weight: 3 },
    { text: normalizeSearchText(vehicle.location?.area), weight: 4 },
    { text: normalizeSearchText(vehicle.registrationNumber), weight: 8 },
    { text: normalizeSearchText(vehicle.rtoCity), weight: 4 },
    { text: normalizeSearchText(vehicle.description), weight: 2 },
    { text: normalizeSearchText(vehicle.ownership), weight: 3 }
  ];

  let totalScore = 0;
  let matchedTokensCount = 0;

  for (const token of tokens) {
    let bestTokenScore = 0;

    for (const field of fields) {
      if (!field.text) continue;
      const words = field.text.split(' ');
      for (const word of words) {
        const { matched, score } = tokenMatches(token, word);
        if (matched) {
          const weightedScore = score * field.weight;
          if (weightedScore > bestTokenScore) {
            bestTokenScore = weightedScore;
          }
        }
      }
    }

    if (bestTokenScore > 0) {
      matchedTokensCount++;
      totalScore += bestTokenScore;
    }
  }

  // All tokens in the query should match at least one attribute
  if (matchedTokensCount === tokens.length) {
    return totalScore + 100; // Bonus for full query match
  }

  // For 3+ words, allow n-1 token matches with lower score
  if (tokens.length >= 3 && matchedTokensCount >= tokens.length - 1) {
    return totalScore;
  }

  return 0; // Did not match
}

export type SortOption = 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'km_asc' | 'year_desc';

/**
 * Filter & sort vehicles based on search query, filter criteria, and sorting
 */
export function filterAndSortVehicles(
  vehicles: Vehicle[],
  query: string,
  filters: {
    category?: string;
    brand?: string;
    model?: string;
    variant?: string;
    city?: string;
    locality?: string;
    fuelTypes?: string[];
    transmissions?: string[];
    ownerships?: string[];
    bodyTypes?: string[];
    minPrice?: number;
    maxPrice?: number;
    maxKm?: number;
    minYear?: number;
    maxYear?: number;
    verifiedOnly?: boolean;
    rcVerifiedOnly?: boolean;
  },
  sortBy: SortOption = 'relevance'
): Vehicle[] {
  // 1. Filter
  const filteredWithScores: SearchMatchResult[] = [];

  for (const v of vehicles) {
    if (v.status !== 'Published') continue;

    // Category filter
    if (filters.category && filters.category !== 'All' && filters.category !== 'All Vehicle Types') {
      const matchCat = v.category.toLowerCase().includes(filters.category.toLowerCase()) ||
        filters.category.toLowerCase().includes(v.category.toLowerCase());
      if (!matchCat) continue;
    }

    // Brand filter
    if (filters.brand && filters.brand !== 'All' && filters.brand !== '') {
      if (v.brand.toLowerCase() !== filters.brand.toLowerCase()) continue;
    }

    // Model filter
    if (filters.model && filters.model !== 'All' && filters.model !== '') {
      if (!v.model.toLowerCase().includes(filters.model.toLowerCase())) continue;
    }

    // Variant filter
    if (filters.variant && filters.variant !== 'All' && filters.variant !== '') {
      if (!v.variant || !v.variant.toLowerCase().includes(filters.variant.toLowerCase())) continue;
    }

    // City & Locality
    if (filters.city && filters.city !== 'All Cities' && filters.city !== 'All India' && filters.city !== '') {
      const vehicleRawCity = v.location?.city || v.city || '';
      const vehicleCity = resolveCanonicalCity(vehicleRawCity, v.location?.area).toLowerCase();
      const targetCity = resolveCanonicalCity(filters.city).toLowerCase();
      if (!vehicleCity || (!vehicleCity.includes(targetCity) && !targetCity.includes(vehicleCity))) continue;
    }
    if (filters.locality && filters.locality !== 'All Places' && filters.locality !== '') {
      const area = v.location?.area || '';
      if (!area.toLowerCase().includes(filters.locality.toLowerCase())) continue;
    }

    // Fuel
    if (filters.fuelTypes && filters.fuelTypes.length > 0) {
      const matchesFuel = filters.fuelTypes.some(f => 
        v.fuelType.toLowerCase().includes(f.toLowerCase())
      );
      if (!matchesFuel) continue;
    }

    // Transmission
    if (filters.transmissions && filters.transmissions.length > 0) {
      const matchesTrans = filters.transmissions.some(t => 
        v.transmission.toLowerCase().includes(t.toLowerCase())
      );
      if (!matchesTrans) continue;
    }

    // Ownership
    if (filters.ownerships && filters.ownerships.length > 0) {
      const matchesOwner = filters.ownerships.some(o => 
        v.ownership.toLowerCase().includes(o.toLowerCase())
      );
      if (!matchesOwner) continue;
    }

    // Body Types
    if (filters.bodyTypes && filters.bodyTypes.length > 0) {
      const matchesBt = filters.bodyTypes.some(bt => 
        (v.bodyType || '').toLowerCase().includes(bt.toLowerCase())
      );
      if (!matchesBt) continue;
    }

    // Price
    if (filters.minPrice !== undefined && v.price < filters.minPrice) continue;
    if (filters.maxPrice !== undefined && v.price > filters.maxPrice) continue;

    // KM
    if (filters.maxKm !== undefined && v.kmDriven > filters.maxKm) continue;

    // Year
    if (filters.minYear !== undefined && v.year < filters.minYear) continue;
    if (filters.maxYear !== undefined && v.year > filters.maxYear) continue;

    // Verified Owner only
    if (filters.verifiedOnly && !v.seller?.verified) continue;

    // RC Verified only
    if (filters.rcVerifiedOnly) {
      const hasVerifiedRc = (v.rcStatus === 'RC_VERIFIED') || 
        v.registrationVerified || 
        (v.documents && v.documents.some(d => d.type === 'RC' && d.verified));
      if (!hasVerifiedRc) continue;
    }

    // Score search query
    const score = query ? scoreVehicleSearch(v, query) : 10;
    if (query && score <= 0) continue;

    filteredWithScores.push({ vehicle: v, score });
  }

  // 2. Sort
  filteredWithScores.sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        if (query) {
          if (b.score !== a.score) return b.score - a.score;
        }
        // Fallback to newest
        return new Date(b.vehicle.createdAt || 0).getTime() - new Date(a.vehicle.createdAt || 0).getTime();
      case 'newest':
        return new Date(b.vehicle.createdAt || 0).getTime() - new Date(a.vehicle.createdAt || 0).getTime();
      case 'price_asc':
        return a.vehicle.price - b.vehicle.price;
      case 'price_desc':
        return b.vehicle.price - a.vehicle.price;
      case 'km_asc':
        return a.vehicle.kmDriven - b.vehicle.kmDriven;
      case 'year_desc':
        return b.vehicle.year - a.vehicle.year;
      default:
        return 0;
    }
  });

  return filteredWithScores.map(res => res.vehicle);
}
