import { MasterCategory, MasterBrand, MasterModel, MasterVariant } from '../types';

export interface VehicleMasterData {
  categories: MasterCategory[];
  brands: MasterBrand[];
  models: MasterModel[];
  variants: MasterVariant[];
  fuelTypes: string[];
  transmissionTypes: string[];
  bodyTypes: string[];
}

export const INITIAL_MASTER_CATEGORIES: MasterCategory[] = [
  { id: 'Cars', name: 'Cars', active: true, order: 1 },
  { id: 'Bikes & Scooters', name: 'Bikes & Scooters', active: true, order: 2 },
  { id: 'Trucks & Lorries', name: 'Trucks & Lorries', active: true, order: 3 },
  { id: 'Buses', name: 'Buses', active: true, order: 4 },
  { id: 'Tractors & Backhoe Loaders', name: 'Tractors & Backhoe Loaders', active: true, order: 5 },
  { id: 'Heavy Machinery Vehicles', name: 'Heavy Machinery Vehicles', active: true, order: 6 }
];

// Helper to generate slug ID
const makeId = (prefix: string, name: string) => 
  `${prefix}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

// Raw supplied brand lists per category
const CAR_BRANDS_LIST = [
  'Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Mahindra', 'Kia', 'Toyota', 'Honda', 'MG', 
  'Renault', 'Skoda', 'Volkswagen', 'Citroen', 'Nissan', 'BYD', 'Lexus', 'Jeep', 
  'BMW', 'Mercedes-Benz', 'Audi', 'Volvo', 'Porsche', 'Jaguar', 'Land Rover', 'MINI', 
  'Ferrari', 'Lamborghini', 'Maserati', 'Bentley', 'Rolls-Royce', 'Aston Martin', 
  'Ford', 'Chevrolet', 'Fiat', 'Mitsubishi', 'Others'
];

const BUS_BRANDS_LIST = [
  'Tata', 'Ashok Leyland', 'Eicher', 'BharatBenz', 'SML Isuzu', 'Volvo Buses', 
  'Scania', 'Force Motors', 'MAN', 'Swaraj Mazda', 'Isuzu', 'Others'
];

const TRUCK_BRANDS_LIST = [
  'Tata', 'Ashok Leyland', 'Eicher', 'Mahindra', 'BharatBenz', 'SML Isuzu', 
  'Volvo', 'Isuzu', 'Force', 'MAN', 'AMW Trucks', 'Kamaz', 'Hino', 'Others'
];

const TRACTOR_BRANDS_LIST = [
  'JCB', 'Mahindra', 'Tata Hitachi', 'ACE', 'Volvo', 'Swaraj', 'Sonalika', 
  'Eicher', 'Caterpillar', 'Komatsu', 'CAT', 'CASE', 'Escorts', 'JB Industries', 'Others'
];

const HEAVY_MACHINERY_BRANDS_LIST = [
  'JCB', 'CAT', 'CASE', 'Tata Hitachi', 'Komatsu', 'Volvo', 'Hyundai', 
  'SANY', 'XCMG', 'Zoomlion', 'Liebherr', 'Others'
];

const BIKE_BRANDS_LIST = [
  'Bajaj', 'Hero MotoCorp', 'Honda', 'TVS', 'Yamaha', 'Suzuki', 'Royal Enfield', 
  'Vespa', 'Aprilia', 'Jawa', 'Yezdi', 'KTM', 'Husqvarna', 'Mahindra Two Wheelers', 
  'LML', 'BMW Motorrad', 'Ducati', 'Triumph', 'Harley-Davidson', 'Indian Motorcycle', 
  'Kawasaki', 'Benelli', 'CFMoto', 'Keeway', 'QJMotor', 'Moto Morini', 'Zontes', 
  'Moto Guzzi', 'MV Agusta', 'Cleveland CycleWerks', 'Hyosung', 'UM Motorcycles', 
  'SWM', 'FB Mondial', 'Norton', 'Ather Energy', 'Ola Electric', 'Okinawa', 
  'Ampere', 'PURE EV', 'Joy e-bike', 'Bounce Infinity', 'Okaya EV', 'BGauss', 
  'Revolt Motors', 'Ultraviolette', 'Tork Motors', 'Simple Energy', 'River', 
  'Matter', 'Oben Electric', 'Lectrix EV', 'Hop Electric', 'Kinetic Green', 
  'Vida', 'Evolet', 'Polarity Smart Bikes', 'Others'
];

export const INITIAL_MASTER_BRANDS: MasterBrand[] = [
  // 1. Cars
  ...CAR_BRANDS_LIST.map((name, idx) => ({
    id: makeId('b-car', name),
    categoryId: 'Cars',
    name,
    active: true,
    order: idx + 1
  })),

  // 2. Bikes & Scooters
  ...BIKE_BRANDS_LIST.map((name, idx) => ({
    id: makeId('b-bike', name),
    categoryId: 'Bikes & Scooters',
    name,
    active: true,
    order: idx + 1
  })),

  // 3. Trucks & Lorries
  ...TRUCK_BRANDS_LIST.map((name, idx) => ({
    id: makeId('b-truck', name),
    categoryId: 'Trucks & Lorries',
    name,
    active: true,
    order: idx + 1
  })),

  // 4. Buses
  ...BUS_BRANDS_LIST.map((name, idx) => ({
    id: makeId('b-bus', name),
    categoryId: 'Buses',
    name,
    active: true,
    order: idx + 1
  })),

  // 5. Tractors & Backhoe Loaders
  ...TRACTOR_BRANDS_LIST.map((name, idx) => ({
    id: makeId('b-trac', name),
    categoryId: 'Tractors & Backhoe Loaders',
    name,
    active: true,
    order: idx + 1
  })),

  // 6. Heavy Machinery Vehicles
  ...HEAVY_MACHINERY_BRANDS_LIST.map((name, idx) => ({
    id: makeId('b-hm', name),
    categoryId: 'Heavy Machinery Vehicles',
    name,
    active: true,
    order: idx + 1
  }))
];

export const INITIAL_MASTER_MODELS: MasterModel[] = [
  // Cars -> Hyundai
  { id: 'm-creta', brandId: makeId('b-car', 'Hyundai'), name: 'Creta', active: true, order: 1 },
  { id: 'm-venue', brandId: makeId('b-car', 'Hyundai'), name: 'Venue', active: true, order: 2 },
  { id: 'm-i20', brandId: makeId('b-car', 'Hyundai'), name: 'i20', active: true, order: 3 },
  { id: 'm-verna', brandId: makeId('b-car', 'Hyundai'), name: 'Verna', active: true, order: 4 },
  { id: 'm-alcazar', brandId: makeId('b-car', 'Hyundai'), name: 'Alcazar', active: true, order: 5 },
  { id: 'm-tucson', brandId: makeId('b-car', 'Hyundai'), name: 'Tucson', active: true, order: 6 },

  // Cars -> Maruti Suzuki
  { id: 'm-swift', brandId: makeId('b-car', 'Maruti Suzuki'), name: 'Swift', active: true, order: 1 },
  { id: 'm-brezza', brandId: makeId('b-car', 'Maruti Suzuki'), name: 'Brezza', active: true, order: 2 },
  { id: 'm-baleno', brandId: makeId('b-car', 'Maruti Suzuki'), name: 'Baleno', active: true, order: 3 },
  { id: 'm-ertiga', brandId: makeId('b-car', 'Maruti Suzuki'), name: 'Ertiga', active: true, order: 4 },
  { id: 'm-grand-vitara', brandId: makeId('b-car', 'Maruti Suzuki'), name: 'Grand Vitara', active: true, order: 5 },

  // Cars -> Tata Motors
  { id: 'm-nexon', brandId: makeId('b-car', 'Tata Motors'), name: 'Nexon', active: true, order: 1 },
  { id: 'm-harrier', brandId: makeId('b-car', 'Tata Motors'), name: 'Harrier', active: true, order: 2 },
  { id: 'm-safari', brandId: makeId('b-car', 'Tata Motors'), name: 'Safari', active: true, order: 3 },
  { id: 'm-punch', brandId: makeId('b-car', 'Tata Motors'), name: 'Punch', active: true, order: 4 },

  // Cars -> Mahindra
  { id: 'm-thar', brandId: makeId('b-car', 'Mahindra'), name: 'Thar', active: true, order: 1 },
  { id: 'm-xuv700', brandId: makeId('b-car', 'Mahindra'), name: 'XUV700', active: true, order: 2 },
  { id: 'm-scorpio', brandId: makeId('b-car', 'Mahindra'), name: 'Scorpio-N', active: true, order: 3 },
  { id: 'm-bolero', brandId: makeId('b-car', 'Mahindra'), name: 'Bolero Neo', active: true, order: 4 },

  // Cars -> BMW
  { id: 'm-bmw-3series', brandId: makeId('b-car', 'BMW'), name: '3 Series Gran Limousine', active: true, order: 1 },
  { id: 'm-bmw-x1', brandId: makeId('b-car', 'BMW'), name: 'X1 sDrive', active: true, order: 2 },
  { id: 'm-bmw-x5', brandId: makeId('b-car', 'BMW'), name: 'X5 xDrive', active: true, order: 3 },
  { id: 'm-bmw-5series', brandId: makeId('b-car', 'BMW'), name: '5 Series Long Wheelbase', active: true, order: 4 },

  // Bikes -> Royal Enfield
  { id: 'm-re-classic350', brandId: makeId('b-bike', 'Royal Enfield'), name: 'Classic 350', active: true, order: 1 },
  { id: 'm-re-hunter350', brandId: makeId('b-bike', 'Royal Enfield'), name: 'Hunter 350', active: true, order: 2 },
  { id: 'm-re-bullet350', brandId: makeId('b-bike', 'Royal Enfield'), name: 'Bullet 350', active: true, order: 3 },
  { id: 'm-re-himalayan', brandId: makeId('b-bike', 'Royal Enfield'), name: 'Himalayan 450', active: true, order: 4 },
  { id: 'm-re-interceptor', brandId: makeId('b-bike', 'Royal Enfield'), name: 'Interceptor 650', active: true, order: 5 },

  // Bikes -> Ola Electric
  { id: 'm-ola-s1pro', brandId: makeId('b-bike', 'Ola Electric'), name: 'S1 Pro Gen 2', active: true, order: 1 },
  { id: 'm-ola-s1air', brandId: makeId('b-bike', 'Ola Electric'), name: 'S1 Air', active: true, order: 2 },
  { id: 'm-ola-s1x', brandId: makeId('b-bike', 'Ola Electric'), name: 'S1 X+', active: true, order: 3 },

  // Bikes -> Honda
  { id: 'm-activa', brandId: makeId('b-bike', 'Honda'), name: 'Activa 6G', active: true, order: 1 },
  { id: 'm-shine', brandId: makeId('b-bike', 'Honda'), name: 'Shine 125', active: true, order: 2 },
  { id: 'm-sp125', brandId: makeId('b-bike', 'Honda'), name: 'SP 125', active: true, order: 3 },

  // Buses -> Ashok Leyland
  { id: 'm-bus-viking', brandId: makeId('b-bus', 'Ashok Leyland'), name: 'Viking 222 Passenger Bus', active: true, order: 1 },
  { id: 'm-bus-oyster', brandId: makeId('b-bus', 'Ashok Leyland'), name: 'Oyster Staff Coach', active: true, order: 2 },
  { id: 'm-bus-mitr', brandId: makeId('b-bus', 'Ashok Leyland'), name: 'MiTR School / Staff Bus', active: true, order: 3 },

  // Buses -> Tata
  { id: 'm-bus-starbus', brandId: makeId('b-bus', 'Tata'), name: 'Starbus Ultra 34 Seater', active: true, order: 1 },
  { id: 'm-bus-magna', brandId: makeId('b-bus', 'Tata'), name: 'Magna Luxury Intercity Coach', active: true, order: 2 },

  // Trucks -> BharatBenz
  { id: 'm-bb-2823r', brandId: makeId('b-truck', 'BharatBenz'), name: '2823R Multi-Axle Haulage', active: true, order: 1 },
  { id: 'm-bb-3528r', brandId: makeId('b-truck', 'BharatBenz'), name: '3528R Heavy Duty Tipper', active: true, order: 2 },
  { id: 'm-bb-1917r', brandId: makeId('b-truck', 'BharatBenz'), name: '1917R Medium Duty Truck', active: true, order: 3 },

  // Trucks -> Tata
  { id: 'm-signa', brandId: makeId('b-truck', 'Tata'), name: 'Signa 4825.TK Tipper', active: true, order: 1 },
  { id: 'm-ace', brandId: makeId('b-truck', 'Tata'), name: 'Ace Gold (Chhota Hathi)', active: true, order: 2 },
  { id: 'm-prima', brandId: makeId('b-truck', 'Tata'), name: 'Prima 2830.K Heavy Haulage', active: true, order: 3 },

  // Tractors & Backhoe -> JCB
  { id: 'm-jcb-3dx', brandId: makeId('b-trac', 'JCB'), name: '3DX Plus EcoXcellence Backhoe', active: true, order: 1 },
  { id: 'm-jcb-4dx', brandId: makeId('b-trac', 'JCB'), name: '4DX Heavy Duty Loader', active: true, order: 2 },

  // Tractors & Backhoe -> Swaraj
  { id: 'm-swaraj-744', brandId: makeId('b-trac', 'Swaraj'), name: '744 FE 48HP Tractor', active: true, order: 1 },
  { id: 'm-swaraj-855', brandId: makeId('b-trac', 'Swaraj'), name: '855 FE 52HP 4WD', active: true, order: 2 },

  // Heavy Machinery -> Komatsu
  { id: 'm-komatsu-pc210', brandId: makeId('b-hm', 'Komatsu'), name: 'PC210-10M0 Hydraulic Excavator', active: true, order: 1 },
  { id: 'm-komatsu-pc71', brandId: makeId('b-hm', 'Komatsu'), name: 'PC71 Mini Hydraulic Excavator', active: true, order: 2 },
  { id: 'm-komatsu-d85', brandId: makeId('b-hm', 'Komatsu'), name: 'D85ESS Crawler Dozer', active: true, order: 3 },

  // Heavy Machinery -> SANY
  { id: 'm-sany-sy215c', brandId: makeId('b-hm', 'SANY'), name: 'SY215C-9 Heavy Excavator', active: true, order: 1 },
  { id: 'm-sany-sy140c', brandId: makeId('b-hm', 'SANY'), name: 'SY140C-9 Medium Excavator', active: true, order: 2 },
  { id: 'm-sany-sy20c', brandId: makeId('b-hm', 'SANY'), name: 'SY20C Compact Mini Excavator', active: true, order: 3 },

  // Heavy Machinery -> Tata Hitachi
  { id: 'm-hm-ex200', brandId: makeId('b-hm', 'Tata Hitachi'), name: 'EX 200LC Hydraulic Excavator', active: true, order: 1 },
  { id: 'm-hm-zaxis', brandId: makeId('b-hm', 'Tata Hitachi'), name: 'Zaxis 220LC-GI Excavator', active: true, order: 2 },

  // Heavy Machinery -> CAT
  { id: 'm-hm-cat320', brandId: makeId('b-hm', 'CAT'), name: '320 Next Gen Hydraulic Excavator', active: true, order: 1 },
  { id: 'm-hm-cat424', brandId: makeId('b-hm', 'CAT'), name: '424 B2 Backhoe Loader', active: true, order: 2 }
];

export const INITIAL_MASTER_VARIANTS: MasterVariant[] = [
  // Creta variants
  { id: 'v-creta-sx', modelId: 'm-creta', name: 'SX', active: true, order: 1 },
  { id: 'v-creta-sxo', modelId: 'm-creta', name: 'SX (O)', active: true, order: 2 },
  { id: 'v-creta-sxoturbo', modelId: 'm-creta', name: 'SX (O) Turbo', active: true, order: 3 },
  { id: 'v-creta-s', modelId: 'm-creta', name: 'S+', active: true, order: 4 },
  { id: 'v-creta-e', modelId: 'm-creta', name: 'E', active: true, order: 5 },

  // Brezza variants
  { id: 'v-brezza-zxiplus', modelId: 'm-brezza', name: 'ZXi Plus AT', active: true, order: 1 },
  { id: 'v-brezza-zxi', modelId: 'm-brezza', name: 'ZXi', active: true, order: 2 },
  { id: 'v-brezza-vxi', modelId: 'm-brezza', name: 'VXi', active: true, order: 3 },

  // Thar variants
  { id: 'v-thar-lx-diesel', modelId: 'm-thar', name: 'LX Hard Top Diesel AT 4x4', active: true, order: 1 },
  { id: 'v-thar-lx-petrol', modelId: 'm-thar', name: 'LX Hard Top Petrol 4x4', active: true, order: 2 },
  { id: 'v-thar-ax', modelId: 'm-thar', name: 'AX Opt Convertible', active: true, order: 3 },

  // Classic 350
  { id: 'v-c350-dark', modelId: 'm-re-classic350', name: 'Dark Stealth Black (Dual Channel)', active: true, order: 1 },
  { id: 'v-c350-halcyon', modelId: 'm-re-classic350', name: 'Halcyon Green', active: true, order: 2 },
  { id: 'v-c350-chrome', modelId: 'm-re-classic350', name: 'Chrome Bronze', active: true, order: 3 },

  // Hunter 350
  { id: 'v-h350-dapper', modelId: 'm-re-hunter350', name: 'Dapper Ash', active: true, order: 1 },
  { id: 'v-h350-rebel', modelId: 'm-re-hunter350', name: 'Rebel Blue', active: true, order: 2 },

  // Ola S1 Pro
  { id: 'v-ola-s1pro-4kwh', modelId: 'm-ola-s1pro', name: 'Gen 2 4kWh', active: true, order: 1 },

  // 3DX Plus
  { id: 'v-3dx-plus', modelId: 'm-jcb-3dx', name: '4WD Heavy Duty Bucket with EcoMAX', active: true, order: 1 },
  { id: 'v-3dx-std', modelId: 'm-jcb-3dx', name: '2WD Standard 0.24m³ Bucket', active: true, order: 2 }
];

export const INITIAL_FUEL_TYPES: string[] = [
  'Petrol',
  'Diesel',
  'CNG (Compressed Natural Gas)',
  'Petrol Hybrid',
  'Diesel Hybrid',
  'Electric',
  'Hydrogen',
  'LPG'
];

export const INITIAL_TRANSMISSION_TYPES: string[] = [
  'Manual',
  'Automatic',
  'AMT',
  'IMT',
  'CVT',
  'DCT',
  'Powershift',
  'Hydrostatic',
  'Single-Speed Direct Drive'
];

export const INITIAL_BODY_TYPES: string[] = [
  'Hatchback',
  'Sedan',
  'SUV',
  'Compact SUV',
  'MUV',
  'Pickup Truck',
  'Van',
  'Mini Truck',
  'Commercial Tipper',
  'Multi-Axle Truck',
  'City Passenger Bus',
  'Luxury Sleeper Coach',
  'Agricultural Tractor',
  'Backhoe Loader',
  'Tracked Excavator',
  'Hydraulic Crane',
  'Soil Compactor'
];
