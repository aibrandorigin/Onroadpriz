export interface CityLocation {
  city: string;
  state: string;
  popularPlaces: string[];
}

export const POPULAR_LOCATIONS_DATA: CityLocation[] = [
  {
    city: 'Hyderabad',
    state: 'Telangana',
    popularPlaces: [
      'Kokapet',
      'Financial District',
      'Gachibowli',
      'HITEC City',
      'Madhapur',
      'Jubilee Hills',
      'Banjara Hills',
      'Kondapur',
      'Tellapur',
      'Miyapur',
      'Kukatpally',
      'Nanakramguda',
      'Manikonda',
      'Begumpet',
      'Secunderabad',
      'Dilsukhnagar',
      'LB Nagar',
      'Ameerpet',
      'Uppal',
      'Shamshabad'
    ]
  },
  {
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    popularPlaces: [
      'Benz Circle',
      'Auto Nagar',
      'Governorpet',
      'Kanuru',
      'Bhavanipuram',
      'Poranki',
      'Patamata',
      'Moghalrajpuram',
      'Gannavaram',
      'Gollapudi',
      'Labbipet',
      'Currency Nagar'
    ]
  },
  {
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    popularPlaces: [
      'Madhurawada',
      'MVP Colony',
      'Gajuwaka',
      'Dwaraka Nagar',
      'Siripuram',
      'Rushikonda',
      'Pendurthi',
      'Seethammadhara',
      'Kurmannapalem',
      'Waltair Uplands',
      'Akkayyapalem',
      'NAD Junction'
    ]
  },
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    popularPlaces: [
      'Whitefield',
      'Koramangala',
      'Indiranagar',
      'HSR Layout',
      'Electronic City',
      'Jayanagar',
      'Marathahalli',
      'Hebbal',
      'Bellandur',
      'Sarjapur Road',
      'Malleshwaram',
      'Banashankari',
      'Yelahanka'
    ]
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    popularPlaces: [
      'Bandra West',
      'Andheri West',
      'Powai',
      'Juhu',
      'Worli',
      'Thane West',
      'Navi Mumbai',
      'Malad West',
      'Borivali',
      'Dadar',
      'Lower Parel',
      'Goregaon',
      'Chembur'
    ]
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    popularPlaces: [
      'Baner',
      'Wakad',
      'Hinjewadi',
      'Kothrud',
      'Koregaon Park',
      'Viman Nagar',
      'Kharadi',
      'Aundh',
      'Hadapsar',
      'Pimple Saudagar',
      'Magarpatta'
    ]
  },
  {
    city: 'Delhi NCR',
    state: 'Delhi',
    popularPlaces: [
      'South Extension',
      'Connaught Place',
      'Dwarka',
      'Rohini',
      'Vasant Kunj',
      'DLF Phase 5 (Gurgaon)',
      'Golf Course Road',
      'Cyber City',
      'Sector 62 (Noida)',
      'Greater Noida',
      'Saket'
    ]
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    popularPlaces: [
      'Anna Nagar',
      'T. Nagar',
      'OMR',
      'Adyar',
      'Velachery',
      'Besant Nagar',
      'Alwarpet',
      'Nungambakkam',
      'Guindy',
      'Porur',
      'Sholinganallur'
    ]
  },
  {
    city: 'Ahmedabad',
    state: 'Gujarat',
    popularPlaces: [
      'SG Highway',
      'Bodakdev',
      'Prahlad Nagar',
      'Vastrapur',
      'Satellite',
      'Bopal',
      'Thaltej',
      'Navrangpura',
      'Chandkheda',
      'Science City'
    ]
  },
  {
    city: 'Amaravati',
    state: 'Andhra Pradesh',
    popularPlaces: [
      'Rayapudi',
      'Thullur',
      'Mandadam',
      'Velagapudi',
      'Mangalagiri',
      'Tadepalli',
      'Undavalli'
    ]
  },
  {
    city: 'Guntur',
    state: 'Andhra Pradesh',
    popularPlaces: [
      'Brodipet',
      'Arundelpet',
      'Lakshmipuram',
      'Koretipadu',
      'Pattabhipuram',
      'Amaravathi Road',
      'Gujjanagundla'
    ]
  }
];

export const ALL_CITIES = POPULAR_LOCATIONS_DATA.map(c => c.city);

export function getPlacesForCity(cityName: string): string[] {
  const match = POPULAR_LOCATIONS_DATA.find(
    c => c.city.toLowerCase() === cityName.toLowerCase()
  );
  return match ? match.popularPlaces : ['City Center', 'Suburbs', 'North Zone', 'South Zone'];
}

const CITY_SYNONYMS: Record<string, string> = {
  'vizag': 'Visakhapatnam',
  'visakhapatnam urban': 'Visakhapatnam',
  'visakhapatnam rural': 'Visakhapatnam',
  'greater visakhapatnam municipal corporation': 'Visakhapatnam',
  'gvmc': 'Visakhapatnam',
  'anakapalle': 'Visakhapatnam',
  'bheemunipatnam': 'Visakhapatnam',
  'secunderabad': 'Hyderabad',
  'cyberabad': 'Hyderabad',
  'greater hyderabad municipal corporation': 'Hyderabad',
  'ghmc': 'Hyderabad',
  'rangareddy': 'Hyderabad',
  'ranga reddy': 'Hyderabad',
  'medchal': 'Hyderabad',
  'medchal malkajgiri': 'Hyderabad',
  'sangareddy': 'Hyderabad',
  'bangalore': 'Bengaluru',
  'bengaluru urban': 'Bengaluru',
  'bbmp': 'Bengaluru',
  'bruhat bengaluru mahanagara palike': 'Bengaluru',
  'new delhi': 'Delhi NCR',
  'delhi': 'Delhi NCR',
  'noida': 'Delhi NCR',
  'greater noida': 'Delhi NCR',
  'gurgaon': 'Delhi NCR',
  'gurugram': 'Delhi NCR',
  'faridabad': 'Delhi NCR',
  'ghaziabad': 'Delhi NCR',
  'navi mumbai': 'Mumbai',
  'thane': 'Mumbai',
  'pimpri chinchwad': 'Pune',
  'pimpri-chinchwad': 'Pune',
  'ntr': 'Vijayawada',
  'krishna': 'Vijayawada'
};

/**
 * Resolves any reverse-geocoded address components (city, district, area, locality, formatted_address)
 * to the canonical city name so vehicle filtering operates on the entire city rather than a sub-locality.
 */
export function resolveCanonicalCity(
  ...candidates: (string | undefined | null)[]
): string {
  const cleanCandidates = candidates
    .map(c => (c || '').trim())
    .filter(Boolean);

  if (cleanCandidates.length === 0) return '';

  // 1. Check direct city match or synonym match first
  for (const raw of cleanCandidates) {
    const lower = raw.toLowerCase();
    if (CITY_SYNONYMS[lower]) {
      return CITY_SYNONYMS[lower];
    }
    const exactCity = POPULAR_LOCATIONS_DATA.find(c => c.city.toLowerCase() === lower);
    if (exactCity) {
      return exactCity.city;
    }
  }

  // 2. Check if any candidate contains a known canonical city or synonym
  for (const raw of cleanCandidates) {
    const lower = raw.toLowerCase();
    for (const [syn, canonical] of Object.entries(CITY_SYNONYMS)) {
      if (lower.includes(syn)) {
        return canonical;
      }
    }
    for (const cityObj of POPULAR_LOCATIONS_DATA) {
      if (lower.includes(cityObj.city.toLowerCase())) {
        return cityObj.city;
      }
    }
  }

  // 3. Check if any candidate matches a known locality/suburb inside one of our cities
  for (const raw of cleanCandidates) {
    const lower = raw.toLowerCase();
    for (const cityObj of POPULAR_LOCATIONS_DATA) {
      const matchedPlace = cityObj.popularPlaces.some(
        place => lower === place.toLowerCase() || lower.includes(place.toLowerCase())
      );
      if (matchedPlace) {
        return cityObj.city;
      }
    }
  }

  // 4. Fallback: clean municipal/administrative suffixes from the primary city candidate
  const primary = cleanCandidates[0]
    .replace(/^greater\s+/i, '')
    .replace(/\s+municipal\s+corporation$/i, '')
    .replace(/\s+(urban|rural|district|mandal|tehsil|taluk|division)$/i, '')
    .trim();

  return primary || cleanCandidates[0];
}

