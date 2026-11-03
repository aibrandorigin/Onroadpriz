import { Vehicle } from '../types';

export interface VehicleFilterCriteria {
  searchQuery?: string;
  category?: string;
  brand?: string;
  model?: string;
  variant?: string;
  fuelType?: string;
  transmission?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxKm?: number;
  ownership?: string;
  verifiedOnly?: boolean;
  sortBy?: 'relevance' | 'newest' | 'price_low' | 'price_high' | 'km_low' | 'year_newest';
}

/**
 * Normalizes text for case-insensitive, whitespace-tolerant matching
 */
export function normalizeSearchTerm(term: string): string {
  return (term || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\d]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Tokenize a search phrase into individual keywords
 * e.g. "Hyundai Creta 2022 petrol" -> ["hyundai", "creta", "2022", "petrol"]
 */
export function extractTokens(query: string): string[] {
  const normalized = normalizeSearchTerm(query);
  if (!normalized) return [];
  return normalized.split(' ').filter(token => token.length > 0);
}

/**
 * Calculate match score for a vehicle against search tokens
 * Higher score = more relevant
 */
export function scoreVehicleMatch(vehicle: Vehicle, tokens: string[]): { matches: boolean; score: number } {
  if (tokens.length === 0) return { matches: true, score: 0 };

  const title = (vehicle.title || '').toLowerCase();
  const brand = (vehicle.brand || '').toLowerCase();
  const model = (vehicle.model || '').toLowerCase();
  const variant = (vehicle.variant || '').toLowerCase();
  const category = (vehicle.category || '').toLowerCase();
  const fuel = (vehicle.fuelType || '').toLowerCase();
  const transmission = (vehicle.transmission || '').toLowerCase();
  const color = (vehicle.color || '').toLowerCase();
  const city = (vehicle.location?.city || vehicle.city || '').toLowerCase();
  const state = (vehicle.location?.state || vehicle.state || '').toLowerCase();
  const area = (vehicle.location?.area || '').toLowerCase();
  const regNo = (vehicle.registrationNumber || vehicle.vehicleRegistrationNumber || '').toLowerCase();
  const yearStr = String(vehicle.year || '');
  const description = (vehicle.description || '').toLowerCase();
  const bodyType = (vehicle.bodyType || '').toLowerCase();

  let totalScore = 0;

  // Every token must match somewhere in the vehicle's attributes
  for (const token of tokens) {
    let tokenScore = 0;

    if (model === token || model.includes(token)) {
      tokenScore += 50;
    } else if (brand === token || brand.includes(token)) {
      tokenScore += 40;
    } else if (title.includes(token)) {
      tokenScore += 30;
    } else if (yearStr === token) {
      tokenScore += 35;
    } else if (city === token || city.includes(token)) {
      tokenScore += 30;
    } else if (fuel.includes(token)) {
      tokenScore += 25;
    } else if (transmission.includes(token)) {
      tokenScore += 25;
    } else if (color.includes(token)) {
      tokenScore += 20;
    } else if (category.includes(token) || bodyType.includes(token)) {
      tokenScore += 20;
    } else if (regNo.includes(token)) {
      tokenScore += 35;
    } else if (state.includes(token) || area.includes(token)) {
      tokenScore += 15;
    } else if (variant.includes(token)) {
      tokenScore += 25;
    } else if (description.includes(token)) {
      tokenScore += 10;
    }

    // If a token has zero matches, this vehicle does not satisfy the query
    if (tokenScore === 0) {
      return { matches: false, score: 0 };
    }

    totalScore += tokenScore;
  }

  // Bonus for featured and verified listings
  if (vehicle.isFeatured || vehicle.featured) totalScore += 15;
  if (vehicle.registrationVerified || vehicle.isVerified) totalScore += 10;

  return { matches: true, score: totalScore };
}

/**
 * Filter and sort vehicles with advanced multi-token query and relational filters
 */
export function searchAndFilterVehicles(
  vehicles: Vehicle[],
  criteria: VehicleFilterCriteria
): Vehicle[] {
  const {
    searchQuery = '',
    category,
    brand,
    model,
    fuelType,
    transmission,
    city,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxKm,
    ownership,
    verifiedOnly,
    sortBy = 'relevance'
  } = criteria;

  const tokens = extractTokens(searchQuery);

  // 1. Filter vehicles
  const matching = vehicles
    .map(vehicle => {
      // Must be Published / Active on public catalog
      if (vehicle.status !== 'Published' && vehicle.status !== 'active') {
        return null;
      }

      // Check text tokens
      const { matches: textMatches, score } = scoreVehicleMatch(vehicle, tokens);
      if (!textMatches) return null;

      // Category filter
      if (category && category !== 'All') {
        const vCat = (vehicle.category || '').toLowerCase();
        const cCat = category.toLowerCase();
        if (!vCat.includes(cCat) && !cCat.includes(vCat)) {
          return null;
        }
      }

      // Brand filter
      if (brand && brand !== 'All') {
        if ((vehicle.brand || '').toLowerCase() !== brand.toLowerCase()) {
          return null;
        }
      }

      // Model filter
      if (model && model !== 'All') {
        if ((vehicle.model || '').toLowerCase() !== model.toLowerCase()) {
          return null;
        }
      }

      // Fuel filter
      if (fuelType && fuelType !== 'All') {
        if ((vehicle.fuelType || '').toLowerCase() !== fuelType.toLowerCase()) {
          return null;
        }
      }

      // Transmission filter
      if (transmission && transmission !== 'All') {
        if ((vehicle.transmission || '').toLowerCase() !== transmission.toLowerCase()) {
          return null;
        }
      }

      // City filter
      if (city && city !== 'All') {
        const vCity = (vehicle.location?.city || '').toLowerCase();
        const cCity = city.toLowerCase();
        if (!vCity.includes(cCity)) {
          return null;
        }
      }

      // Price range
      if (minPrice !== undefined && vehicle.price < minPrice) return null;
      if (maxPrice !== undefined && vehicle.price > maxPrice) return null;

      // Year range
      if (minYear !== undefined && vehicle.year < minYear) return null;
      if (maxYear !== undefined && vehicle.year > maxYear) return null;

      // KM limit
      if (maxKm !== undefined && vehicle.kmDriven > maxKm) return null;

      // Ownership
      if (ownership && ownership !== 'All') {
        if ((vehicle.ownership || '').toLowerCase() !== ownership.toLowerCase()) {
          return null;
        }
      }

      // Verified only
      if (verifiedOnly && !vehicle.registrationVerified && !vehicle.isVerified) {
        return null;
      }

      return { vehicle, score };
    })
    .filter((item): item is { vehicle: Vehicle; score: number } => item !== null);

  // 2. Sort results
  matching.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.vehicle.createdAt || 0).getTime() - new Date(a.vehicle.createdAt || 0).getTime();
      case 'price_low':
        return a.vehicle.price - b.vehicle.price;
      case 'price_high':
        return b.vehicle.price - a.vehicle.price;
      case 'km_low':
        return a.vehicle.kmDriven - b.vehicle.kmDriven;
      case 'year_newest':
        return b.vehicle.year - a.vehicle.year;
      case 'relevance':
      default:
        // Score descending, tiebreak by newest date
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.vehicle.createdAt || 0).getTime() - new Date(a.vehicle.createdAt || 0).getTime();
    }
  });

  return matching.map(m => m.vehicle);
}
