import { MasterCategory, MasterBrand, MasterModel, MasterVariant } from '../types';

export const INITIAL_MASTER_CATEGORIES: MasterCategory[] = [
  { id: 'cat-1', name: 'Cars', active: true, order: 1 },
  { id: 'cat-2', name: 'Bikes & Scooters', active: true, order: 2 },
  { id: 'cat-3', name: 'Trucks & Lorries', active: true, order: 3 },
  { id: 'cat-4', name: 'Buses', active: true, order: 4 },
  { id: 'cat-5', name: 'Tractors & Backhoe Loaders', active: true, order: 5 },
  { id: 'cat-6', name: 'Heavy Machinery', active: true, order: 6 },
];

export const INITIAL_MASTER_BRANDS: MasterBrand[] = [
  // Cars
  { id: 'b-car-1', categoryId: 'Cars', name: 'Hyundai', active: true, order: 1 },
  { id: 'b-car-2', categoryId: 'Cars', name: 'Maruti Suzuki', active: true, order: 2 },
  { id: 'b-car-3', categoryId: 'Cars', name: 'Mahindra', active: true, order: 3 },
  { id: 'b-car-4', categoryId: 'Cars', name: 'Tata Motors', active: true, order: 4 },
  { id: 'b-car-5', categoryId: 'Cars', name: 'Toyota', active: true, order: 5 },
  { id: 'b-car-6', categoryId: 'Cars', name: 'Kia', active: true, order: 6 },
  { id: 'b-car-7', categoryId: 'Cars', name: 'Honda', active: true, order: 7 },
  { id: 'b-car-8', categoryId: 'Cars', name: 'Volkswagen', active: true, order: 8 },
  { id: 'b-car-9', categoryId: 'Cars', name: 'Skoda', active: true, order: 9 },
  { id: 'b-car-10', categoryId: 'Cars', name: 'MG', active: true, order: 10 },
  { id: 'b-car-11', categoryId: 'Cars', name: 'BMW', active: true, order: 11 },
  { id: 'b-car-12', categoryId: 'Cars', name: 'Mercedes-Benz', active: true, order: 12 },

  // Bikes & Scooters
  { id: 'b-bike-1', categoryId: 'Bikes & Scooters', name: 'Royal Enfield', active: true, order: 1 },
  { id: 'b-bike-2', categoryId: 'Bikes & Scooters', name: 'Honda Two Wheelers', active: true, order: 2 },
  { id: 'b-bike-3', categoryId: 'Bikes & Scooters', name: 'Hero MotoCorp', active: true, order: 3 },
  { id: 'b-bike-4', categoryId: 'Bikes & Scooters', name: 'Bajaj Auto', active: true, order: 4 },
  { id: 'b-bike-5', categoryId: 'Bikes & Scooters', name: 'TVS Motor', active: true, order: 5 },
  { id: 'b-bike-6', categoryId: 'Bikes & Scooters', name: 'Yamaha', active: true, order: 6 },
  { id: 'b-bike-7', categoryId: 'Bikes & Scooters', name: 'KTM', active: true, order: 7 },
  { id: 'b-bike-8', categoryId: 'Bikes & Scooters', name: 'Suzuki Two Wheelers', active: true, order: 8 },
  { id: 'b-bike-9', categoryId: 'Bikes & Scooters', name: 'Ather Energy', active: true, order: 9 },
  { id: 'b-bike-10', categoryId: 'Bikes & Scooters', name: 'Ola Electric', active: true, order: 10 },

  // Trucks & Lorries
  { id: 'b-trk-1', categoryId: 'Trucks & Lorries', name: 'Tata Commercial', active: true, order: 1 },
  { id: 'b-trk-2', categoryId: 'Trucks & Lorries', name: 'Ashok Leyland', active: true, order: 2 },
  { id: 'b-trk-3', categoryId: 'Trucks & Lorries', name: 'BharatBenz', active: true, order: 3 },
  { id: 'b-trk-4', categoryId: 'Trucks & Lorries', name: 'Eicher Trucks', active: true, order: 4 },
  { id: 'b-trk-5', categoryId: 'Trucks & Lorries', name: 'Mahindra Commercial', active: true, order: 5 },
  { id: 'b-trk-6', categoryId: 'Trucks & Lorries', name: 'Isuzu Commercial', active: true, order: 6 },

  // Buses
  { id: 'b-bus-1', categoryId: 'Buses', name: 'Ashok Leyland Buses', active: true, order: 1 },
  { id: 'b-bus-2', categoryId: 'Buses', name: 'Tata Starbus', active: true, order: 2 },
  { id: 'b-bus-3', categoryId: 'Buses', name: 'Volvo Buses', active: true, order: 3 },
  { id: 'b-bus-4', categoryId: 'Buses', name: 'Eicher Skyline', active: true, order: 4 },
  { id: 'b-bus-5', categoryId: 'Buses', name: 'Force Motors', active: true, order: 5 },

  // Tractors & Backhoe Loaders
  { id: 'b-trc-1', categoryId: 'Tractors & Backhoe Loaders', name: 'Mahindra Tractors', active: true, order: 1 },
  { id: 'b-trc-2', categoryId: 'Tractors & Backhoe Loaders', name: 'Swaraj', active: true, order: 2 },
  { id: 'b-trc-3', categoryId: 'Tractors & Backhoe Loaders', name: 'John Deere', active: true, order: 3 },
  { id: 'b-trc-4', categoryId: 'Tractors & Backhoe Loaders', name: 'Massey Ferguson', active: true, order: 4 },
  { id: 'b-trc-5', categoryId: 'Tractors & Backhoe Loaders', name: 'Sonalika', active: true, order: 5 },
  { id: 'b-trc-6', categoryId: 'Tractors & Backhoe Loaders', name: 'New Holland', active: true, order: 6 },
  { id: 'b-trc-7', categoryId: 'Tractors & Backhoe Loaders', name: 'JCB Backhoe', active: true, order: 7 },

  // Heavy Machinery
  { id: 'b-hvy-1', categoryId: 'Heavy Machinery', name: 'JCB Heavy Machinery', active: true, order: 1 },
  { id: 'b-hvy-2', categoryId: 'Heavy Machinery', name: 'Tata Hitachi', active: true, order: 2 },
  { id: 'b-hvy-3', categoryId: 'Heavy Machinery', name: 'Caterpillar (CAT)', active: true, order: 3 },
  { id: 'b-hvy-4', categoryId: 'Heavy Machinery', name: 'Komatsu', active: true, order: 4 },
  { id: 'b-hvy-5', categoryId: 'Heavy Machinery', name: 'Hyundai Construction', active: true, order: 5 },
  { id: 'b-hvy-6', categoryId: 'Heavy Machinery', name: 'Volvo CE', active: true, order: 6 },
];

export const INITIAL_MASTER_MODELS: MasterModel[] = [
  // Hyundai Models
  { id: 'm-hyn-1', brandId: 'b-car-1', name: 'Creta', active: true, order: 1 },
  { id: 'm-hyn-2', brandId: 'b-car-1', name: 'Venue', active: true, order: 2 },
  { id: 'm-hyn-3', brandId: 'b-car-1', name: 'i20', active: true, order: 3 },
  { id: 'm-hyn-4', brandId: 'b-car-1', name: 'Verna', active: true, order: 4 },
  { id: 'm-hyn-5', brandId: 'b-car-1', name: 'Alcazar', active: true, order: 5 },
  { id: 'm-hyn-6', brandId: 'b-car-1', name: 'Tucson', active: true, order: 6 },
  { id: 'm-hyn-7', brandId: 'b-car-1', name: 'Grand i10 Nios', active: true, order: 7 },

  // Maruti Suzuki Models
  { id: 'm-mar-1', brandId: 'b-car-2', name: 'Swift', active: true, order: 1 },
  { id: 'm-mar-2', brandId: 'b-car-2', name: 'Baleno', active: true, order: 2 },
  { id: 'm-mar-3', brandId: 'b-car-2', name: 'Brezza', active: true, order: 3 },
  { id: 'm-mar-4', brandId: 'b-car-2', name: 'Ertiga', active: true, order: 4 },
  { id: 'm-mar-5', brandId: 'b-car-2', name: 'Dzire', active: true, order: 5 },
  { id: 'm-mar-6', brandId: 'b-car-2', name: 'Grand Vitara', active: true, order: 6 },
  { id: 'm-mar-7', brandId: 'b-car-2', name: 'Wagon R', active: true, order: 7 },
  { id: 'm-mar-8', brandId: 'b-car-2', name: 'Fronx', active: true, order: 8 },

  // Mahindra Models
  { id: 'm-mah-1', brandId: 'b-car-3', name: 'Thar', active: true, order: 1 },
  { id: 'm-mah-2', brandId: 'b-car-3', name: 'Scorpio-N', active: true, order: 2 },
  { id: 'm-mah-3', brandId: 'b-car-3', name: 'XUV700', active: true, order: 3 },
  { id: 'm-mah-4', brandId: 'b-car-3', name: 'Bolero', active: true, order: 4 },
  { id: 'm-mah-5', brandId: 'b-car-3', name: 'Scorpio Classic', active: true, order: 5 },
  { id: 'm-mah-6', brandId: 'b-car-3', name: 'XUV300', active: true, order: 6 },

  // Tata Motors Models
  { id: 'm-tat-1', brandId: 'b-car-4', name: 'Nexon', active: true, order: 1 },
  { id: 'm-tat-2', brandId: 'b-car-4', name: 'Harrier', active: true, order: 2 },
  { id: 'm-tat-3', brandId: 'b-car-4', name: 'Safari', active: true, order: 3 },
  { id: 'm-tat-4', brandId: 'b-car-4', name: 'Punch', active: true, order: 4 },
  { id: 'm-tat-5', brandId: 'b-car-4', name: 'Tiago', active: true, order: 5 },
  { id: 'm-tat-6', brandId: 'b-car-4', name: 'Altroz', active: true, order: 6 },

  // Toyota Models
  { id: 'm-toy-1', brandId: 'b-car-5', name: 'Innova Crysta', active: true, order: 1 },
  { id: 'm-toy-2', brandId: 'b-car-5', name: 'Fortuner', active: true, order: 2 },
  { id: 'm-toy-3', brandId: 'b-car-5', name: 'Urban Cruiser Hyryder', active: true, order: 3 },
  { id: 'm-toy-4', brandId: 'b-car-5', name: 'Glanza', active: true, order: 4 },
  { id: 'm-toy-5', brandId: 'b-car-5', name: 'Innova Hycross', active: true, order: 5 },

  // Kia Models
  { id: 'm-kia-1', brandId: 'b-car-6', name: 'Seltos', active: true, order: 1 },
  { id: 'm-kia-2', brandId: 'b-car-6', name: 'Sonet', active: true, order: 2 },
  { id: 'm-kia-3', brandId: 'b-car-6', name: 'Carens', active: true, order: 3 },

  // Royal Enfield Models
  { id: 'm-re-1', brandId: 'b-bike-1', name: 'Classic 350', active: true, order: 1 },
  { id: 'm-re-2', brandId: 'b-bike-1', name: 'Hunter 350', active: true, order: 2 },
  { id: 'm-re-3', brandId: 'b-bike-1', name: 'Bullet 350', active: true, order: 3 },
  { id: 'm-re-4', brandId: 'b-bike-1', name: 'Meteor 350', active: true, order: 4 },
  { id: 'm-re-5', brandId: 'b-bike-1', name: 'Himalayan 450', active: true, order: 5 },
  { id: 'm-re-6', brandId: 'b-bike-1', name: 'Continental GT 650', active: true, order: 6 },

  // Honda Two Wheelers
  { id: 'm-h2w-1', brandId: 'b-bike-2', name: 'Activa 6G', active: true, order: 1 },
  { id: 'm-h2w-2', brandId: 'b-bike-2', name: 'Shine 125', active: true, order: 2 },
  { id: 'm-h2w-3', brandId: 'b-bike-2', name: 'SP 125', active: true, order: 3 },
  { id: 'm-h2w-4', brandId: 'b-bike-2', name: 'Unicorn', active: true, order: 4 },
  { id: 'm-h2w-5', brandId: 'b-bike-2', name: 'Dio 125', active: true, order: 5 },

  // Hero MotoCorp
  { id: 'm-her-1', brandId: 'b-bike-3', name: 'Splendor Plus', active: true, order: 1 },
  { id: 'm-her-2', brandId: 'b-bike-3', name: 'HF Deluxe', active: true, order: 2 },
  { id: 'm-her-3', brandId: 'b-bike-3', name: 'Glamour', active: true, order: 3 },
  { id: 'm-her-4', brandId: 'b-bike-3', name: 'Xpulse 200 4V', active: true, order: 4 },

  // Bajaj Auto
  { id: 'm-baj-1', brandId: 'b-bike-4', name: 'Pulsar 150', active: true, order: 1 },
  { id: 'm-baj-2', brandId: 'b-bike-4', name: 'Pulsar NS200', active: true, order: 2 },
  { id: 'm-baj-3', brandId: 'b-bike-4', name: 'Platina 100', active: true, order: 3 },
  { id: 'm-baj-4', brandId: 'b-bike-4', name: 'Dominar 400', active: true, order: 4 },

  // Tata Commercial Trucks
  { id: 'm-tck-1', brandId: 'b-trk-1', name: 'Prima 5530.S', active: true, order: 1 },
  { id: 'm-tck-2', brandId: 'b-trk-1', name: 'Signa 4825.TK Tipper', active: true, order: 2 },
  { id: 'm-tck-3', brandId: 'b-trk-1', name: 'Ace Gold Mini Truck', active: true, order: 3 },
  { id: 'm-tck-4', brandId: 'b-trk-1', name: 'Intra V30', active: true, order: 4 },
  { id: 'm-tck-5', brandId: 'b-trk-1', name: '407 Gold LCV', active: true, order: 5 },

  // Ashok Leyland Trucks
  { id: 'm-alt-1', brandId: 'b-trk-2', name: 'AVTR 4220 Heavy Truck', active: true, order: 1 },
  { id: 'm-alt-2', brandId: 'b-trk-2', name: 'Dost Plus Mini Truck', active: true, order: 2 },
  { id: 'm-alt-3', brandId: 'b-trk-2', name: 'Bada Dost i4', active: true, order: 3 },
  { id: 'm-alt-4', brandId: 'b-trk-2', name: 'Ecomet Star 1215', active: true, order: 4 },

  // Buses
  { id: 'm-bus-1', brandId: 'b-bus-1', name: 'Viking 54 Seater', active: true, order: 1 },
  { id: 'm-bus-2', brandId: 'b-bus-1', name: 'Oyster Staff Bus', active: true, order: 2 },
  { id: 'm-bus-3', brandId: 'b-bus-2', name: 'Starbus Ultra 34 Seater', active: true, order: 1 },
  { id: 'm-bus-4', brandId: 'b-bus-3', name: '9600 Multi-Axle Luxury Sleeper', active: true, order: 1 },
  { id: 'm-bus-5', brandId: 'b-bus-5', name: 'Traveller 3050 17 Seater', active: true, order: 1 },

  // Tractors & Backhoe
  { id: 'm-trc-1', brandId: 'b-trc-1', name: '575 DI 45 HP', active: true, order: 1 },
  { id: 'm-trc-2', brandId: 'b-trc-1', name: '475 DI XP Plus', active: true, order: 2 },
  { id: 'm-trc-3', brandId: 'b-trc-2', name: '744 FE 48 HP', active: true, order: 1 },
  { id: 'm-trc-4', brandId: 'b-trc-2', name: '855 FE 52 HP', active: true, order: 2 },
  { id: 'm-trc-5', brandId: 'b-trc-3', name: '5050 D 50 HP', active: true, order: 1 },
  { id: 'm-trc-6', brandId: 'b-trc-7', name: '3DX Backhoe Loader', active: true, order: 1 },
  { id: 'm-trc-7', brandId: 'b-trc-7', name: '3DX Super EcoXcellence', active: true, order: 2 },

  // Heavy Machinery
  { id: 'm-hvy-1', brandId: 'b-hvy-1', name: 'JS205 Tracked Excavator', active: true, order: 1 },
  { id: 'm-hvy-2', brandId: 'b-hvy-1', name: '432ZX Heavy Wheel Loader', active: true, order: 2 },
  { id: 'm-hvy-3', brandId: 'b-hvy-2', name: 'EX 200LC Hydraulic Excavator', active: true, order: 1 },
  { id: 'm-hvy-4', brandId: 'b-hvy-3', name: '320D3 Heavy Duty Excavator', active: true, order: 1 },
];

export const INITIAL_MASTER_VARIANTS: MasterVariant[] = [
  // Creta variants
  { id: 'v-crt-1', modelId: 'm-hyn-1', name: 'SX (O) Turbo Petrol DCT', active: true, order: 1 },
  { id: 'v-crt-2', modelId: 'm-hyn-1', name: 'SX 1.5 Diesel Automatic', active: true, order: 2 },
  { id: 'v-crt-3', modelId: 'm-hyn-1', name: 'S Plus Knight Edition', active: true, order: 3 },
  { id: 'v-crt-4', modelId: 'm-hyn-1', name: 'EX 1.5 Petrol Manual', active: true, order: 4 },

  // Thar variants
  { id: 'v-thr-1', modelId: 'm-mah-1', name: 'LX 4x4 Hard Top Diesel AT', active: true, order: 1 },
  { id: 'v-thr-2', modelId: 'm-mah-1', name: 'LX 4x4 Hard Top Diesel MT', active: true, order: 2 },
  { id: 'v-thr-3', modelId: 'm-mah-1', name: 'AX Opt Convertible Diesel MT', active: true, order: 3 },
  { id: 'v-thr-4', modelId: 'm-mah-1', name: 'Earth Edition 4x4 AT', active: true, order: 4 },

  // Swift variants
  { id: 'v-swf-1', modelId: 'm-mar-1', name: 'ZXi Plus AMT', active: true, order: 1 },
  { id: 'v-swf-2', modelId: 'm-mar-1', name: 'VXi CNG Manual', active: true, order: 2 },
  { id: 'v-swf-3', modelId: 'm-mar-1', name: 'LXi Manual Petrol', active: true, order: 3 },

  // Classic 350
  { id: 'v-cl-1', modelId: 'm-re-1', name: 'Signals Edition Dual Channel ABS', active: true, order: 1 },
  { id: 'v-cl-2', modelId: 'm-re-1', name: 'Dark Stealth Black Alloy', active: true, order: 2 },
  { id: 'v-cl-3', modelId: 'm-re-1', name: 'Halcyon Green Single Channel', active: true, order: 3 },
];

/**
 * Normalization helper: matches category variations (e.g. "cars" vs "Cars")
 */
export function normalizeCategoryName(raw: string): string {
  const lower = (raw || '').toLowerCase().trim();
  if (lower.includes('bike') || lower.includes('scooter')) return 'Bikes & Scooters';
  if (lower.includes('truck') || lower.includes('lorr')) return 'Trucks & Lorries';
  if (lower.includes('bus')) return 'Buses';
  if (lower.includes('tractor') || lower.includes('backhoe')) return 'Tractors & Backhoe Loaders';
  if (lower.includes('machinery') || lower.includes('heavy') || lower.includes('jcb')) return 'Heavy Machinery';
  return 'Cars';
}

/**
 * Filter brands strictly by selected vehicle category
 */
export function getBrandsForCategory(
  categoryName: string, 
  brands: MasterBrand[] = INITIAL_MASTER_BRANDS
): MasterBrand[] {
  if (!categoryName || categoryName === 'All') return brands.filter(b => b.active);
  const normalized = normalizeCategoryName(categoryName);
  return brands.filter(b => b.active && normalizeCategoryName(b.categoryId) === normalized);
}

/**
 * Filter models strictly by selected brand
 */
export function getModelsForBrand(
  brandNameOrId: string, 
  brands: MasterBrand[] = INITIAL_MASTER_BRANDS,
  models: MasterModel[] = INITIAL_MASTER_MODELS
): MasterModel[] {
  if (!brandNameOrId || brandNameOrId === 'All') return models.filter(m => m.active);

  // Check if passed as brand name or id
  const brand = brands.find(b => 
    b.id === brandNameOrId || 
    b.name.toLowerCase() === brandNameOrId.toLowerCase()
  );

  if (!brand) {
    // If brand not found in master records, match model by name directly
    return models.filter(m => m.active);
  }

  return models.filter(m => m.active && m.brandId === brand.id);
}

/**
 * Filter variants strictly by selected model
 */
export function getVariantsForModel(
  modelNameOrId: string,
  models: MasterModel[] = INITIAL_MASTER_MODELS,
  variants: MasterVariant[] = INITIAL_MASTER_VARIANTS
): MasterVariant[] {
  if (!modelNameOrId || modelNameOrId === 'All') return variants.filter(v => v.active);

  const model = models.find(m => 
    m.id === modelNameOrId || 
    m.name.toLowerCase() === modelNameOrId.toLowerCase()
  );

  if (!model) return [];
  return variants.filter(v => v.active && v.modelId === model.id);
}
