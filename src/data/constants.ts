import { CategoryId } from '../types';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  iconHint: string;
  description: string;
}

export const VEHICLE_CATEGORIES: CategoryMeta[] = [
  {
    id: 'cars',
    label: 'Cars',
    iconHint: 'car',
    description: 'Hatchback, Sedan, SUV, MUV & more'
  },
  {
    id: 'bikes',
    label: 'Bikes & Scooters',
    iconHint: 'two-wheeler',
    description: 'Two-wheelers & Electric bikes'
  },
  {
    id: 'trucks',
    label: 'Trucks & Lorries',
    iconHint: 'truck',
    description: 'Commercial vehicles & Lorries'
  },
  {
    id: 'buses',
    label: 'Buses',
    iconHint: 'bus',
    description: 'Passenger transport vehicles'
  },
  {
    id: 'jcb',
    label: 'Tractors & Backhoe Loaders',
    iconHint: 'construction',
    description: 'Loaders & Construction equipment'
  },
  {
    id: 'heavy-machinery',
    label: 'Heavy Machinery Vehicles',
    iconHint: 'engineering',
    description: 'Excavators, Cranes & Heavy equipment'
  }
];

// Exact brands per category
export const CATEGORY_BRANDS: Record<CategoryId, string[]> = {
  cars: [
    'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'Ford', 'Renault',
    'Nissan', 'Volkswagen', 'Kia', 'MG', 'Skoda', 'BMW', 'Audi', 'Mercedes-Benz',
    'Jaguar', 'Land Rover', 'Volvo', 'Porsche', 'Lexus', 'Isuzu', 'Force', 'Ashok Leyland',
    'BharatBenz', 'Others'
  ],
  bikes: [
    'Bajaj', 'Hero MotoCorp', 'Honda', 'TVS', 'Yamaha', 'Suzuki', 'Royal Enfield', 'Vespa',
    'Aprilia', 'Jawa', 'Yezdi', 'KTM', 'Husqvarna', 'BMW Motorrad', 'Ducati', 'Triumph',
    'Harley Davidson', 'Kawasaki', 'Benelli', 'Ather Energy', 'Ola Electric', 'Okinawa',
    'Revolt Motors', 'Ultraviolette', 'Others'
  ],
  trucks: [
    'Tata', 'Ashok Leyland', 'Mahindra', 'BharatBenz', 'Volvo', 'Eicher', 'Force', 'Isuzu',
    'MAN', 'Scania', 'Mercedes-Benz', 'Others'
  ],
  buses: [
    'Tata', 'Ashok Leyland', 'Mahindra', 'BharatBenz', 'Volvo', 'Eicher', 'Force', 'Isuzu',
    'MAN', 'Scania', 'Mercedes-Benz', 'Others'
  ],
  jcb: [
    'JCB', 'Mahindra', 'Tata Hitachi', 'ACE', 'Volvo', 'Swarag', 'Sonalika', 'Eicher',
    'Caterpillar', 'Komatsu', 'CAT', 'CASE', 'Escorts', 'Others'
  ],
  'heavy-machinery': [
    'JCB', 'CAT', 'CASE', 'Tata Hitachi', 'Komatsu', 'Volvo', 'Hyundai', 'Sany',
    'XCMG', 'Zoomlion', 'Liebherr', 'Others'
  ]
};

// Body types per category
export const CATEGORY_BODY_TYPES: Record<CategoryId, string[]> = {
  cars: [
    'Hatchback', 'Sedan', 'Coupe', 'Convertible', 'Station Wagon', 'SUV', 'Crossover',
    'MPV', 'Minivan', 'Pickup Single Cab', 'Pickup Double Cab', 'Others'
  ],
  bikes: [
    'Bike', 'Scooter', 'Others'
  ],
  trucks: [
    'Trucks', 'Pickup Truck Light Duty', 'Mini Truck', 'Box Truck', 'Flatbed Truck',
    'Refrigerated Truck', 'Tipper Truck', 'Dump Truck', 'Tanker Truck', 'Car Carrier Truck',
    'Trailers', 'Transit Mixer', 'Others'
  ],
  buses: [
    'Bus', 'Van', 'Minibus', 'City Bus Single Decker', 'Double Decker Bus', 'School Bus',
    'Coach Bus', 'Shuttle Bus', 'Others'
  ],
  jcb: [
    'Tractor', 'Backhoe Loader', 'Skid Steer Loader', 'Wheel Loader', 'Mini Loader', 'Others'
  ],
  'heavy-machinery': [
    'Excavator', 'Bulldozer', 'Road Roller', 'Motor Grader', 'Crawler Cranes', 'Truck Crane',
    'Forklift', 'Telehandler', 'Others'
  ]
};

// Fuel types per category
export const CATEGORY_FUEL_TYPES: Record<CategoryId, string[]> = {
  cars: [
    'Petrol', 'Diesel', 'CNG (Compressed Natural Gas)', 'Petrol Hybrid', 'Diesel Hybrid',
    'Electric', 'Others'
  ],
  bikes: [
    'Petrol', 'Electric', 'Others'
  ],
  trucks: [
    'Diesel', 'CNG (Compressed Natural Gas)', 'Electric', 'Hydrogen', 'Others'
  ],
  buses: [
    'Diesel', 'CNG (Compressed Natural Gas)', 'Electric', 'Diesel Hybrid', 'Hydrogen', 'Others'
  ],
  jcb: [
    'Diesel', 'Electric', 'Others'
  ],
  'heavy-machinery': [
    'Diesel', 'Electric', 'Hybrid', 'Others'
  ]
};

// Transmission per category
export const CATEGORY_TRANSMISSION: Record<CategoryId, string[]> = {
  cars: [
    'Manual', 'Automatic (AT)', 'IMT', 'AMT', 'CVT', 'DCT', 'Others'
  ],
  bikes: [
    'Gear', 'Gearless', 'Others'
  ],
  trucks: [
    'Manual', 'Automatic', 'AMT', 'Others'
  ],
  buses: [
    'Manual', 'Automatic', 'AMT', 'Others'
  ],
  jcb: [
    'Manual', 'Powershift', 'Others'
  ],
  'heavy-machinery': [
    'Manual', 'Powershift', 'Hydrostatic', 'Others'
  ]
};

// Other exact dropdowns
export const OWNERSHIP_OPTIONS = [
  '1st Owner', '2nd Owner', '3rd Owner', '4th Owner', '5th+ Owner', 'Others'
];

export const INSURANCE_OPTIONS = [
  'Comprehensive', 'Third Party', 'Insurance Expired', 'Zero Depreciation', 'Others'
];

export const HYPOTHECATION_OPTIONS = [
  'No Loan', 'Loan Active', 'Loan Closed'
];

export const RC_TYPE_OPTIONS = [
  'Smart card RC', 'Paper RC', 'Digital RC', 'Others'
];

export const ACCIDENT_HISTORY_OPTIONS = [
  'No Accident', 'Minor Accident', 'Major Accident', 'Others'
];

export const SPARE_KEY_OPTIONS = [
  'Yes', 'No', 'Others'
];

export const VEHICLE_USAGE_OPTIONS = [
  'Personal', 'Commercial', 'Taxi', 'Rental', 'Others'
];

export const UPLOADED_BY_OPTIONS = [
  'Vehicle Owner', "Owner's Father", "Owner's Mother", "Owner's Son", "Owner's Daughter", "Owner's Spouse"
];

export const OWNERSHIP_PROOF_TYPES = [
  'Aadhar', 'PAN', 'Voter ID', 'Driving License', 'Passport', 'Others'
];

export const RELATIONSHIP_PROOF_TYPES = [
  'Voter ID', 'Driving License', 'Passport'
];

export const INDIAN_STATES = [
  'Jammu and Kashmir (UT)', 'Ladakh (UT)', 'Himachal Pradesh', 'Punjab', 'Haryana',
  'Uttarakhand', 'Uttar Pradesh', 'Chandigarh (UT)', 'Delhi (UT)', 'Andhra Pradesh',
  'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 'Puducherry (UT)',
  'Andaman and Nicobar Islands (UT)', 'Lakshadweep (UT)', 'Bihar', 'Jharkhand', 'Odisha',
  'West Bengal', 'Rajasthan', 'Gujarat', 'Maharashtra', 'Goa',
  'Dadra Haveli Daman and Diu (UT)', 'Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Tripura', 'Sikkim', 'Madhya Pradesh', 'Chhattisgarh', 'Others'
];

export const POPULAR_CITIES = [
  'New Delhi', 'Mumbai', 'Chennai', 'Lucknow', 'Bengaluru', 'Gandhinagar', 'Kolkata', 'Jaipur',
  'Hyderabad', 'Amaravati', 'Bhopal', 'Thiruvananthapuram', 'Chandigarh', 'Patna', 'Bhubaneswar',
  'Dispur', 'Raipur', 'Ranchi', 'Dehradun', 'Shimla', 'Panaji', 'Agartala', 'Imphal', 'Shillong',
  'Kohima', 'Itanagar', 'Aizawl', 'Gangtok', 'Puducherry', 'Pune', 'Gurgaon', 'Noida',
  'Ahmedabad', 'Thane', 'Navi Mumbai', 'Warangal', 'Visakhapatnam', 'Coimbatore', 'Madurai', 'Nagpur', 'Others'
];

export const FILTER_PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: 200000000 },
  { label: 'Under ₹2 Lakh', min: 0, max: 200000 },
  { label: '₹2–5 Lakh', min: 200000, max: 500000 },
  { label: '₹5–10 Lakh', min: 500000, max: 1000000 },
  { label: '₹10–20 Lakh', min: 1000000, max: 2000000 },
  { label: 'Above ₹20 Lakh', min: 2000000, max: 200000000 }
];

export const FILTER_YEAR_RANGES = [
  { label: 'All Years', min: 1980, max: 2030 },
  { label: '2020 & Above', min: 2020, max: 2030 },
  { label: '2015–2019', min: 2015, max: 2019 },
  { label: '2010–2014', min: 2010, max: 2014 },
  { label: 'Below 2010', min: 1980, max: 2009 }
];

// Currency Formatter for Indian format: e.g. ₹1,50,000
export function formatINR(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
}

// Indian mobile validator: 10 digits starting with 6-9
export function isValidIndianMobile(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

// Clean phone (keeps last 10 digits)
export function sanitizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length > 10 && (digits.startsWith('91') || digits.startsWith('0'))) {
    return digits.slice(-10);
  }
  return digits;
}
