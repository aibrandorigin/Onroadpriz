import { 
  Vehicle, 
  User, 
  SellerPlan, 
  BuyerPlan, 
  OrderPayment, 
  VehicleEnquiry, 
  Banner, 
  BlogPost, 
  Testimonial, 
  AuditLog, 
  PlatformNotification, 
  PlatformSettings,
  ContactSubmission,
  SellerReport,
  TeamMember 
} from '../types';

export const INITIAL_SETTINGS: PlatformSettings = {
  siteName: 'OnRoadPriz',
  tagline: 'Buy & Sell Used Vehicles Directly From Owners',
  primaryColor: '#77101F',
  currencySymbol: '₹',
  currencyCode: 'INR',
  supportPhone: '+91 891 278 4590',
  supportEmail: 'support@onroadpriz.com',
  headquartersTitle: 'Operational Center',
  headquartersAddress: 'OnRoadPriz Towers, VIP Road, Siripuram, Visakhapatnam, AP 530003',
  supportHours: 'Monday – Saturday, 9:00 AM – 8:00 PM IST',
  gstRatePercent: 18,
  maintenanceMode: false,
  autoApproveVerifiedSellers: false,
  metaTitle: 'OnRoadPriz - Direct Owner-to-Buyer Used Vehicles Marketplace in India',
  metaDescription: 'Buy and sell second hand cars, bikes, commercial trucks, buses, tractors and heavy equipment directly with verified owners. No dealer commission.',
  websiteLogo: '/branding/onroadpriz-logo.png',
  logoUrl: '/branding/onroadpriz-logo.png',
  logo_url: '/branding/onroadpriz-logo.png',
  mobileLogo: '',
  adminLogo: '',
  favicon: '/favicon.svg',
  faviconUrl: '/favicon.svg',
  favicon_url: '/favicon.svg',
  logoVersion: 1,
  faviconVersion: 1,
  socialLinks: {
    facebook: 'https://facebook.com/onroadpriz',
    twitter: 'https://twitter.com/onroadpriz',
    instagram: 'https://instagram.com/onroadpriz',
    youtube: 'https://youtube.com/onroadpriz',
    linkedin: 'https://linkedin.com/company/onroadpriz'
  },
  vehicleFieldsConfig: {
    'Cars': {
      spareKey: 'Required',
      insuranceValidity: 'Required',
      hypothecationStatus: 'Required',
      oemService: 'Required',
      engineWarranty: 'Optional',
      majorAccidentHistory: 'Required'
    },
    'Bikes & Scooters': {
      spareKey: 'Required',
      insuranceValidity: 'Required',
      hypothecationStatus: 'Required',
      oemService: 'Optional',
      engineWarranty: 'Optional',
      majorAccidentHistory: 'Required'
    },
    'Trucks & Lorries': {
      spareKey: 'Required',
      insuranceValidity: 'Required',
      hypothecationStatus: 'Required',
      oemService: 'Required',
      engineWarranty: 'Optional',
      majorAccidentHistory: 'Required',
      loadCapacity: 'Required',
      bucketCapacity: 'Optional',
      maxOperatingWeight: 'Required',
      maxHeightCapacity: 'Optional',
      maxLiftCapacity: 'Optional'
    },
    'Buses': {
      spareKey: 'Required',
      insuranceValidity: 'Required',
      hypothecationStatus: 'Required',
      oemService: 'Required',
      engineWarranty: 'Optional',
      majorAccidentHistory: 'Required',
      loadCapacity: 'Optional',
      bucketCapacity: 'Hidden',
      maxOperatingWeight: 'Required',
      maxHeightCapacity: 'Optional',
      maxLiftCapacity: 'Optional'
    },
    'Tractors & Backhoe Loaders': {
      spareKey: 'Required',
      insuranceValidity: 'Required',
      hypothecationStatus: 'Required',
      oemService: 'Optional',
      engineWarranty: 'Optional',
      majorAccidentHistory: 'Required',
      loadCapacity: 'Optional',
      bucketCapacity: 'Optional',
      maxOperatingWeight: 'Optional',
      maxHeightCapacity: 'Optional',
      maxLiftCapacity: 'Optional'
    },
    'Heavy Machinery Vehicles': {
      spareKey: 'Required',
      insuranceValidity: 'Required',
      hypothecationStatus: 'Required',
      oemService: 'Required',
      engineWarranty: 'Required',
      majorAccidentHistory: 'Required',
      loadCapacity: 'Optional',
      bucketCapacity: 'Required',
      maxOperatingWeight: 'Required',
      maxHeightCapacity: 'Optional',
      maxLiftCapacity: 'Optional',
      maximumDiggingPower: 'Required',
      enginePower: 'Required'
    }
  }
};

export const CITIES_LIST = [
  'Visakhapatnam',
  'Hyderabad',
  'Vijayawada',
  'Bengaluru',
  'Chennai',
  'Mumbai',
  'Pune',
  'Delhi NCR',
  'Kolkata',
  'Guntur',
  'Tirupati',
  'Coimbatore'
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'ORP-VEH-1001',
    title: '2022 Hyundai Creta SX',
    category: 'Cars',
    brand: 'Hyundai',
    model: 'Creta',
    variant: 'SX 1.5 Executive',
    year: 2022,
    registrationYear: 2022,
    rtoState: 'Telangana',
    rtoCity: 'Hyderabad (TS-09)',
    registrationNumber: 'TS09EA1001',
    registrationLookupStatus: 'VERIFIED',
    registrationVerified: true,
    registrationVerifiedAt: '2026-09-18T10:35:00Z',
    vehicleLookupProvider: 'Authorized VAHAN Gateway',
    price: 1425000,
    negotiable: true,
    kmDriven: 42000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'SUV',
    engineCapacity: '1497 cc',
    color: 'Polar White',
    mileage: '16.8 kmpl',
    ownership: '1st Owner',
    condition: 'Excellent',
    has_spare_key: true,
    insurance_valid_until: '2026-12-30',
    hypothecation_status: 'No Hypothecation / Clear',
    oem_service_status: 'Full OEM Service History',
    engine_warranty_status: 'Active',
    engine_warranty_valid_until: '2027-05-15',
    major_accident_history: 'No Major Accident',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Gachibowli',
      pincode: '500032'
    },
    seller: {
      id: 'usr-sel-201',
      name: 'Praveen Varma',
      phone: '+91 98480 12345',
      email: 'praveen.varma@gmail.com',
      type: 'Direct Owner',
      verified: true,
      memberSince: 'Mar 2023',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1200&auto=format&fit=crop&q=80'
    ],
    coverImageIndex: 0,
    description: 'Single owner driven 2022 Hyundai Creta SX Automatic in pristine showroom condition. Comprehensive zero-depreciation insurance valid till Dec 2026. Complete authorized Hyundai showroom service history available. Brand new Michelin tyres installed 3,000 km ago. Panoramic sunroof, ventilated seats, wireless Apple CarPlay/Android Auto.',
    features: [
      'Panoramic Sunroof',
      'Ventilated Front Seats',
      'Wireless Phone Charger',
      'Touchscreen Infotainment (10.25 inch)',
      'Reverse Parking Camera with Dynamic Guidelines',
      'Automatic Climate Control',
      'Cruise Control',
      'Push Button Start / Keyless Entry',
      'Electronic Stability Program (ESP)',
      '6 Airbags'
    ],
    documents: [
      { id: 'doc-1', name: 'Registration Certificate (RC)', type: 'RC', verified: true },
      { id: 'doc-2', name: 'Comprehensive Insurance Policy', type: 'Insurance', verified: true },
      { id: 'doc-3', name: 'Pollution Under Control (PUC)', type: 'PUC', verified: true },
      { id: 'doc-4', name: 'Hyundai Service Log Book', type: 'Service Records', verified: true }
    ],
    status: 'Published',
    isFeatured: true,
    viewsCount: 1420,
    wishlistCount: 68,
    enquiriesCount: 14,
    whatsappClicksCount: 22,
    callsCount: 31,
    createdAt: '2026-09-18T10:30:00Z',
    updatedAt: '2026-09-12T14:20:00Z'
  },
  {
    id: 'ORP-VEH-1002',
    title: '2023 Mahindra Thar LX 4x4 Hard Top Diesel',
    category: 'Cars',
    brand: 'Mahindra',
    model: 'Thar',
    variant: 'LX 4x4 Hard Top',
    year: 2023,
    registrationYear: 2023,
    rtoState: 'Telangana',
    rtoCity: 'Hyderabad (TS-09)',
    registrationNumber: 'TS09FH2002',
    registrationLookupStatus: 'LOOKUP_SUCCESS',
    registrationVerified: true,
    registrationVerifiedAt: '2026-08-20T08:05:00Z',
    vehicleLookupProvider: 'Authorized VAHAN Gateway',
    price: 1580000,
    negotiable: false,
    kmDriven: 24500,
    fuelType: 'Diesel',
    transmission: 'Manual',
    bodyType: 'SUV / 4x4',
    engineCapacity: '2184 cc mHawk',
    color: 'Napoli Black',
    mileage: '15.2 kmpl',
    ownership: '1st Owner',
    condition: 'Excellent',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Jubilee Hills',
      pincode: '500033'
    },
    seller: {
      id: 'usr-sel-202',
      name: 'K. Rajesh Reddy',
      phone: '+91 97010 44556',
      email: 'rajesh.reddy@outlook.com',
      type: 'Direct Owner',
      verified: true,
      memberSince: 'Jan 2024',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&auto=format&fit=crop&q=80'
    ],
    coverImageIndex: 0,
    description: 'Mahindra Thar LX 4x4 with factory fitted Hard Top. Genuine 24,500 km only, strictly serviced at Automotive Manufacturers Hyderabad. Installed original rear camera, 7D mats, and off-road arm rests. Non-accidental, non-flood affected, direct owner sale due to relocation abroad.',
    features: [
      'Mechanical Locking Differential',
      'Electric Driveline Disconnect',
      'Touchscreen with Adventure Statistics',
      'Roll Cage Architecture',
      'Dual Airbags & ABS with EBD',
      'Tire Pressure Monitoring System (TPMS)',
      'Hill Hold & Descent Assist'
    ],
    documents: [
      { id: 'doc-5', name: 'Original Smart RC Card', type: 'RC', verified: true },
      { id: 'doc-6', name: 'Bumper-to-Bumper Insurance', type: 'Insurance', verified: true }
    ],
    status: 'Published',
    isFeatured: true,
    viewsCount: 2150,
    wishlistCount: 94,
    enquiriesCount: 28,
    whatsappClicksCount: 45,
    callsCount: 39,
    createdAt: '2026-08-20T08:00:00Z',
    updatedAt: '2026-09-15T11:15:00Z'
  },
  {
    id: 'ORP-VEH-1003',
    title: '2022 Tata Nexon EV Max XZ+ Lux 40.5kWh',
    category: 'Cars',
    brand: 'Tata',
    model: 'Nexon EV Max',
    variant: 'XZ+ Lux',
    year: 2022,
    registrationYear: 2022,
    rtoState: 'Karnataka',
    rtoCity: 'Bengaluru (KA-04)',
    price: 1340000,
    negotiable: true,
    kmDriven: 31000,
    fuelType: 'Electric',
    transmission: 'Automatic',
    bodyType: 'Compact SUV',
    engineCapacity: '143 PS / 250 Nm',
    color: 'Intensi-Teal Dual Tone',
    mileage: '340 km real range',
    ownership: '1st Owner',
    condition: 'Excellent',
    location: {
      city: 'Bengaluru',
      state: 'Karnataka',
      area: 'Whitefield',
      pincode: '560066'
    },
    seller: {
      id: 'usr-sel-203',
      name: 'Aditi Sharma',
      phone: '+91 99800 77661',
      email: 'aditi.ev@gmail.com',
      type: 'Direct Owner',
      verified: true,
      memberSince: 'Jun 2023',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&auto=format&fit=crop&q=80'
    ],
    coverImageIndex: 0,
    description: 'Tata Nexon EV Max with 40.5 kWh battery pack, battery health report at 98.4%. Includes Tata 7.2 kW home fast charger and portable emergency charger. 8 years battery and motor warranty intact till 2030. Ventilated seats, electronic parking brake with auto hold.',
    features: [
      'Multi-mode Regenerative Braking',
      'Ventilated Leatherette Seats',
      'Electronic Parking Brake with Auto Hold',
      'Air Purifier with AQI Display',
      'Harman 8-Speaker Audio System',
      'Sunroof with anti-pinch'
    ],
    documents: [
      { id: 'doc-7', name: 'Digital RC Card', type: 'RC', verified: true },
      { id: 'doc-8', name: 'Tata Battery Health Certificate', type: 'Service Records', verified: true }
    ],
    status: 'Published',
    isFeatured: false,
    viewsCount: 980,
    wishlistCount: 42,
    enquiriesCount: 11,
    whatsappClicksCount: 19,
    callsCount: 15,
    createdAt: '2026-08-25T14:10:00Z',
    updatedAt: '2026-09-10T16:00:00Z'
  },
  {
    id: 'ORP-VEH-1004',
    title: '2021 Toyota Fortuner 4x4 Automatic Diesel',
    category: 'Cars',
    brand: 'Toyota',
    model: 'Fortuner',
    variant: '4x4 AT',
    year: 2021,
    registrationYear: 2021,
    rtoState: 'Andhra Pradesh',
    rtoCity: 'Vijayawada (AP-16)',
    price: 3450000,
    negotiable: true,
    kmDriven: 68000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'Full-Size SUV',
    engineCapacity: '2755 cc D-4D (204 PS)',
    color: 'Super White',
    mileage: '14.2 kmpl',
    ownership: '1st Owner',
    condition: 'Excellent',
    location: {
      city: 'Vijayawada',
      state: 'Andhra Pradesh',
      area: 'Benz Circle',
      pincode: '520010'
    },
    seller: {
      id: 'usr-sel-204',
      name: 'V. Sitarama Raju',
      phone: '+91 94401 88990',
      email: 'sitaram.raju@gmail.com',
      type: 'Direct Owner',
      verified: true,
      memberSince: 'Feb 2023',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    },
    images: [
      'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=1200&auto=format&fit=crop&q=80'
    ],
    coverImageIndex: 0,
    description: 'Toyota Fortuner 4x4 AT flagship SUV. Single hand driven by senior executive. 100% genuine service records at Harsha Toyota Vijayawada. Brand new Bridgestone tyres, 11-speaker JBL sound setup, 7 airbags. Spotless leather interior.',
    features: [
      '4x4 with High and Low Range',
      'Differential Lock',
      'JBL 11-Speaker Audio System',
      'Ventilated Seats',
      'Powered Tailgate with Kick Sensor',
      'Auto Bi-Beam LED Headlamps'
    ],
    documents: [
      { id: 'doc-9', name: 'AP-16 Registration Certificate', type: 'RC', verified: true },
      { id: 'doc-10', name: 'Zero Dep Toyota Protect Insurance', type: 'Insurance', verified: true }
    ],
    status: 'Published',
    isFeatured: true,
    viewsCount: 3120,
    wishlistCount: 145,
    enquiriesCount: 42,
    whatsappClicksCount: 58,
    callsCount: 67,
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-09-16T12:00:00Z'
  },
  {
    id: 'ORP-VEH-1005',
    title: '2023 Royal Enfield Classic 350 Reborn Dark Stealth Black',
    category: 'Bikes & Scooters',
    brand: 'Royal Enfield',
    model: 'Classic 350',
    variant: 'Dark Stealth Black Dual ABS',
    year: 2023,
    registrationYear: 2023,
    rtoState: 'Andhra Pradesh',
    rtoCity: 'Visakhapatnam (AP-31)',
    price: 195000,
    negotiable: false,
    kmDriven: 9200,
    fuelType: 'Petrol',
    transmission: 'Manual',
    color: 'Stealth Black Matte',
    ownership: '1st Owner',
    condition: 'Excellent',
    location: {
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      area: 'Gajuwaka',
      pincode: '530026'
    },
    seller: {
      id: 'usr-sel-205',
      name: 'M. Santosh Kumar',
      phone: '+91 89190 33445',
      email: 'santosh.rider@gmail.com',
      type: 'Direct Owner',
      verified: true,
      memberSince: 'Apr 2024'
    },
    images: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&auto=format&fit=crop&q=80'
    ],
    coverImageIndex: 0,
    description: 'RE Classic 350 J-Series engine, dual channel ABS with alloy wheels and tubeless tyres. Driven strictly 9,200 km. Fitted with genuine Royal Enfield touring mirrors, sump guard, and touring seat.',
    features: [
      'Dual Channel ABS',
      'Alloy Wheels & Tubeless Tyres',
      'Tripper Navigation Pod',
      'USB Charging Port',
      'Genuine Touring Accessories'
    ],
    documents: [
      { id: 'doc-11', name: 'RC Book & Smart Card', type: 'RC', verified: true }
    ],
    status: 'Published',
    isFeatured: true,
    viewsCount: 1650,
    wishlistCount: 88,
    enquiriesCount: 23,
    whatsappClicksCount: 34,
    callsCount: 40,
    createdAt: '2026-08-18T15:00:00Z',
    updatedAt: '2026-09-14T09:30:00Z'
  },
  {
    id: 'ORP-VEH-1006',
    title: '2021 BharatBenz 2823R Heavy Multi-Axle Truck',
    category: 'Trucks & Lorries',
    brand: 'BharatBenz',
    model: '2823R',
    variant: '6x2 Heavy Commercial',
    year: 2021,
    registrationYear: 2021,
    rtoState: 'Maharashtra',
    rtoCity: 'Mumbai (MH-04)',
    price: 2850000,
    negotiable: true,
    kmDriven: 115000,
    fuelType: 'Diesel',
    transmission: 'Manual',
    color: 'Industrial Blue',
    ownership: '1st Owner',
    condition: 'Good',
    has_spare_key: true,
    insurance_valid_until: '2026-11-15',
    hypothecation_status: 'Active Loan / Hypothecated',
    financier_name: 'HDFC Commercial Vehicle Finance',
    oem_service_status: 'Full OEM Service History',
    engine_warranty_status: 'Active',
    engine_warranty_valid_until: '2027-08-30',
    major_accident_history: 'No Major Accident',
    load_capacity: 28,
    load_capacity_unit: 'Tonnes',
    max_operating_weight: 35,
    max_operating_weight_unit: 'tonnes',
    max_height_capacity: 3.8,
    max_height_capacity_unit: 'metres',
    max_lift_capacity: 18,
    max_lift_capacity_unit: 'tonnes',
    location: {
      city: 'Mumbai',
      state: 'Maharashtra',
      area: 'Navi Mumbai APMC Market',
      pincode: '400705'
    },
    seller: {
      id: 'usr-sel-206',
      name: 'Balwinder Logistics',
      phone: '+91 98200 99881',
      email: 'balwinder.fleet@gmail.com',
      type: 'Direct Owner',
      verified: true,
      memberSince: 'Oct 2022'
    },
    images: [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586191582152-32a2fca03e67?w=1200&auto=format&fit=crop&q=80'
    ],
    coverImageIndex: 0,
    description: '28-ton Gross Vehicle Weight (GVW) 6x2 multi-axle cargo carrier. OM 926 BS6 7.2L engine with 241 HP output. 28ft container body installed, ideal for FMCG/parcels. National Permit valid till 2027. Fitness certificate recently renewed.',
    features: [
      'Pneumatic Air Brakes with ABS',
      'Sleeper Cabin with Factory AC',
      'Truckonnect Telematics System',
      'Power Steering with Tilt Adjustment',
      'Tubeless Heavy Radial Tyres'
    ],
    documents: [
      { id: 'doc-12', name: 'National Goods Permit', type: 'Other', verified: true },
      { id: 'doc-13', name: 'Commercial Vehicle Fitness', type: 'Other', verified: true }
    ],
    status: 'Published',
    isFeatured: false,
    viewsCount: 780,
    wishlistCount: 29,
    enquiriesCount: 16,
    whatsappClicksCount: 25,
    callsCount: 30,
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-09-08T17:00:00Z'
  },
  {
    id: 'ORP-VEH-1007',
    title: '2022 JCB 3DX Super 4WD Backhoe Loader',
    category: 'Tractors & Backhoe Loaders',
    brand: 'JCB',
    model: '3DX Super',
    variant: '4WD EcoMAX',
    year: 2022,
    registrationYear: 2022,
    rtoState: 'Andhra Pradesh',
    rtoCity: 'Visakhapatnam (AP-31)',
    price: 2650000,
    negotiable: true,
    kmDriven: 3400, // hours
    fuelType: 'Diesel',
    transmission: 'Manual',
    color: 'JCB Signature Yellow',
    ownership: '1st Owner',
    condition: 'Excellent',
    location: {
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      area: 'Anakapalli Industrial Area',
      pincode: '531001'
    },
    seller: {
      id: 'usr-sel-207',
      name: 'R. K. Infrastructure',
      phone: '+91 89199 44332',
      email: 'rkinfra.equipment@gmail.com',
      type: 'Direct Owner',
      verified: true,
      memberSince: 'Nov 2023'
    },
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80'
    ],
    coverImageIndex: 0,
    description: 'JCB 3DX Super 4-Wheel Drive backhoe loader with only 3,400 operational meter hours. Fully maintained under JCB LiveLink genuine service contract. Heavy-duty loader bucket and backhoe excavator bucket with standard teeth in excellent condition.',
    features: [
      '4-Wheel Drive (4WD)',
      'LiveLink Advanced Telematics',
      'Heavy Duty Boom & Dipper',
      'Spacious Operator Cabin with Fan',
      'Fuel Efficient EcoMAX 76HP Engine'
    ],
    documents: [
      { id: 'doc-14', name: 'JCB Invoice & RTO Form 21/22', type: 'Invoice', verified: true }
    ],
    status: 'Published',
    isFeatured: true,
    viewsCount: 1890,
    wishlistCount: 71,
    enquiriesCount: 29,
    whatsappClicksCount: 38,
    callsCount: 44,
    createdAt: '2026-08-05T12:00:00Z',
    updatedAt: '2026-09-11T13:45:00Z'
  },
  {
    id: 'ORP-VEH-1008',
    title: '2020 Ashok Leyland 42-Seater Staff / Tourist Bus',
    category: 'Buses',
    brand: 'Ashok Leyland',
    model: 'Viking 222',
    variant: '42 Seater Push Back',
    year: 2020,
    registrationYear: 2020,
    rtoState: 'Telangana',
    rtoCity: 'Hyderabad (TS-07)',
    price: 2200000,
    negotiable: true,
    kmDriven: 92000,
    fuelType: 'Diesel',
    transmission: 'Manual',
    color: 'White & Maroon Striped',
    ownership: '1st Owner',
    condition: 'Good',
    location: {
      city: 'Hyderabad',
      state: 'Telangana',
      area: 'Kukatpally',
      pincode: '500072'
    },
    seller: {
      id: 'usr-sel-208',
      name: 'Sri Krishna Travels',
      phone: '+91 98490 55112',
      email: 'srikrishna.tours@yahoo.com',
      type: 'Direct Owner',
      verified: true,
      memberSince: 'Jul 2023'
    },
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&auto=format&fit=crop&q=80'
    ],
    coverImageIndex: 0,
    description: '42 Push-Back 2x2 luxury passenger seating. Powered by Ashok Leyland H-Series 6-cylinder diesel engine. Equipped with roof luggage rack, individual reading lights, and entertainment system. Clean tourist bus permit.',
    features: [
      '2x2 Reclining Push Back Seats',
      'Full Air Suspension (Rear)',
      'Substantial Luggage Boot Space',
      'Dual Camera System & GPS'
    ],
    documents: [
      { id: 'doc-15', name: 'All India Tourist Permit', type: 'Other', verified: true }
    ],
    status: 'Published',
    isFeatured: false,
    viewsCount: 1100,
    wishlistCount: 38,
    enquiriesCount: 19,
    whatsappClicksCount: 27,
    callsCount: 22,
    createdAt: '2026-08-12T16:00:00Z',
    updatedAt: '2026-09-09T10:10:00Z'
  },
  {
    id: 'ORP-VEH-1009',
    title: '2023 Mahindra 575 DI Sarpanch 47HP Tractor',
    category: 'Tractors & Backhoe Loaders',
    brand: 'Mahindra',
    model: '575 DI',
    variant: 'Sarpanch 47 HP',
    year: 2021,
    registrationYear: 2021,
    rtoState: 'Andhra Pradesh',
    rtoCity: 'Guntur (AP-07)',
    price: 540000,
    negotiable: true,
    kmDriven: 2100, // hours
    fuelType: 'Diesel',
    transmission: 'Manual',
    color: 'Mahindra Signature Red',
    ownership: '1st Owner',
    condition: 'Excellent',
    location: {
      city: 'Guntur',
      state: 'Andhra Pradesh',
      area: 'Tenali Rural',
      pincode: '522201'
    },
    seller: {
      id: 'usr-sel-209',
      name: 'N. Venkateswara Rao',
      phone: '+91 94405 22114',
      email: 'venkat.agri@gmail.com',
      type: 'Direct Owner',
      verified: true,
      memberSince: 'May 2024'
    },
    images: [
      'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=1200&auto=format&fit=crop&q=80'
    ],
    coverImageIndex: 0,
    description: '47 HP powerful 4-cylinder engine tractor, sparingly used on personal farm for 2,100 hours only. Includes hydraulic tipping 2-wheel trolley, cultivator, and rotavator set. Power steering, brand new MRF rear tractor tyres.',
    features: [
      'Power Steering',
      'Oil Immersed Brakes (OIB)',
      'Dual Clutch with High/Low Range',
      'Hydraulic Tipping Trolley Included'
    ],
    documents: [
      { id: 'doc-16', name: 'AP-07 Farmer Agricultural RC', type: 'RC', verified: true }
    ],
    status: 'Published',
    isFeatured: false,
    viewsCount: 840,
    wishlistCount: 33,
    enquiriesCount: 15,
    whatsappClicksCount: 28,
    callsCount: 31,
    createdAt: '2026-08-22T07:30:00Z',
    updatedAt: '2026-09-13T15:00:00Z'
  },
  {
    id: 'ORP-VEH-1010',
    title: '2023 Tata Hitachi EX 200LC Hydraulic Excavator',
    category: 'Heavy Machinery Vehicles',
    brand: 'Tata Hitachi',
    model: 'EX 200LC',
    variant: 'Super Plus Heavy Excavator',
    year: 2023,
    registrationYear: 2023,
    rtoState: 'Andhra Pradesh',
    rtoCity: 'Visakhapatnam',
    price: 4850000,
    negotiable: true,
    kmDriven: 2800, // hours
    fuelType: 'Diesel',
    transmission: 'Automatic',
    color: 'Orange and Grey',
    ownership: '1st Owner',
    condition: 'Excellent',
    has_spare_key: true,
    insurance_valid_until: '2027-01-20',
    hypothecation_status: 'No Hypothecation / Clear',
    oem_service_status: 'Full OEM Service History',
    engine_warranty_status: 'Active',
    engine_warranty_valid_until: '2027-09-30',
    major_accident_history: 'No Major Accident',
    load_capacity: 20,
    load_capacity_unit: 'Tonnes',
    bucket_capacity: 0.9,
    bucket_capacity_unit: 'm³',
    max_operating_weight: 20.2,
    max_operating_weight_unit: 'tonnes',
    max_height_capacity: 9.6,
    max_height_capacity_unit: 'metres',
    max_lift_capacity: 8.5,
    max_lift_capacity_unit: 'tonnes',
    maximum_digging_power: 147,
    maximum_digging_power_unit: 'kN',
    engine_power: 133,
    engine_power_unit: 'HP',
    location: {
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      area: 'Sheela Nagar Port Area',
      pincode: '530012'
    },
    seller: {
      id: 'usr-sel-207',
      name: 'R. K. Infrastructure',
      phone: '+91 89199 44332',
      email: 'rkinfra.equipment@gmail.com',
      type: 'Direct Owner',
      verified: true,
      memberSince: 'Nov 2023'
    },
    images: [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80'
    ],
    coverImageIndex: 0,
    description: 'Heavy 20-ton tracked hydraulic crawler excavator. ISUZU 6BG1T Turbo diesel engine with exceptional fuel efficiency. Full hydraulic pump pressure tested, zero leaks. Cabin fitted with factory air-conditioning and digital telematics monitor.',
    features: [
      '20-Ton Heavy Class Crawler Tracks',
      'ISUZU 6BG1T Turbo Engine (133 HP)',
      'Factory Fitted Air-Conditioned Cabin',
      'Consite Telematics Health Monitoring'
    ],
    documents: [
      { id: 'doc-17', name: 'Purchase Invoice & Customs Clearance', type: 'Invoice', verified: true }
    ],
    status: 'Published',
    isFeatured: true,
    viewsCount: 1540,
    wishlistCount: 52,
    enquiriesCount: 22,
    whatsappClicksCount: 30,
    callsCount: 35,
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-09-15T10:00:00Z'
  },
  // Pending Approval Vehicle for Admin Moderation Queue
  {
    id: 'ORP-VEH-1011',
    title: '2022 Maruti Suzuki Brezza ZXi Plus Dual Tone',
    category: 'Cars',
    brand: 'Maruti Suzuki',
    model: 'Brezza',
    variant: 'ZXi Plus AT',
    year: 2022,
    registrationYear: 2022,
    rtoState: 'Andhra Pradesh',
    rtoCity: 'Visakhapatnam (AP-31)',
    price: 1120000,
    negotiable: true,
    kmDriven: 21000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'Compact SUV',
    color: 'Sizzling Red with Black Roof',
    ownership: '1st Owner',
    condition: 'Excellent',
    location: {
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      area: 'Madhurawada',
      pincode: '530048'
    },
    seller: {
      id: 'usr-sel-210',
      name: 'Chaitanya Naidu',
      phone: '+91 96180 88772',
      email: 'chaitanya.brezza@gmail.com',
      type: 'Direct Owner',
      verified: true,
      memberSince: 'Sep 2026'
    },
    images: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80'
    ],
    coverImageIndex: 0,
    description: 'Submitted for verification: Top-end Brezza ZXi Plus Automatic with 360-degree camera and Head-Up Display (HUD). Single owner driven, zero issues.',
    features: [
      'Head-Up Display (HUD)',
      '360 Degree View Camera',
      'SmartPlay Pro+ 9-Inch Screen',
      'Wireless Charging',
      'Electric Sunroof'
    ],
    documents: [
      { id: 'doc-18', name: 'AP-31 RC Copy Uploaded', type: 'RC', verified: false },
      { id: 'doc-19', name: 'ICICI Lombard Insurance Copy', type: 'Insurance', verified: false }
    ],
    status: 'Pending Approval',
    viewsCount: 0,
    wishlistCount: 0,
    enquiriesCount: 0,
    whatsappClicksCount: 0,
    callsCount: 0,
    createdAt: '2026-09-17T11:00:00Z',
    updatedAt: '2026-09-17T11:00:00Z'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-adm-orp-01',
    name: 'OnRoadPriz Admin',
    fullName: 'OnRoadPriz Administrator',
    email: 'onroadpriz@admin.com',
    phone: '+91 99000 11111',
    role: 'Super Admin',
    location: 'Hyderabad, TS',
    status: 'Active',
    verified: true,
    password: '111111',
    listingsCount: 0,
    enquiriesCount: 0,
    registeredAt: '2024-01-01T00:00:00Z',
    lastLogin: '2026-09-25T07:00:00Z'
  },
  {
    id: 'usr-adm-001',
    name: 'Harsha Vardhan (Super Admin)',
    fullName: 'Harsha Vardhan',
    email: 'admin@onroadpriz.com',
    phone: '+91 891 278 4590',
    role: 'Super Admin',
    location: 'Visakhapatnam, AP',
    status: 'Active',
    verified: true,
    password: 'admin',
    listingsCount: 0,
    enquiriesCount: 0,
    registeredAt: '2024-01-01T00:00:00Z',
    lastLogin: '2026-09-18T22:30:00Z'
  },
  {
    id: 'usr-mod-002',
    name: 'Sunil Verma (Moderator)',
    email: 'moderator@onroadpriz.com',
    phone: '+91 98480 99001',
    role: 'Moderator',
    location: 'Hyderabad, TS',
    status: 'Active',
    verified: true,
    listingsCount: 0,
    enquiriesCount: 0,
    registeredAt: '2024-03-15T10:00:00Z',
    lastLogin: '2026-09-18T18:15:00Z'
  },
  {
    id: 'usr-sel-201',
    name: 'Praveen Varma',
    email: 'praveen.varma@gmail.com',
    phone: '+91 98480 12345',
    role: 'Seller',
    location: 'Visakhapatnam, AP',
    status: 'Active',
    verified: true,
    subscriptionPlanId: 'plan-sel-pro',
    subscriptionExpiry: '2026-12-31T23:59:59Z',
    listingsCount: 2,
    enquiriesCount: 14,
    registeredAt: '2024-03-10T12:00:00Z',
    lastLogin: '2026-09-18T14:40:00Z'
  },
  {
    id: 'usr-sel-202',
    name: 'K. Rajesh Reddy',
    email: 'rajesh.reddy@outlook.com',
    phone: '+91 97010 44556',
    role: 'Seller',
    location: 'Hyderabad, TS',
    status: 'Active',
    verified: true,
    subscriptionPlanId: 'plan-sel-basic',
    subscriptionExpiry: '2026-10-15T23:59:59Z',
    listingsCount: 1,
    enquiriesCount: 28,
    registeredAt: '2024-01-22T08:30:00Z',
    lastLogin: '2026-09-17T19:20:00Z'
  },
  {
    id: 'usr-buy-301',
    name: 'Suresh Kumar (Buyer)',
    email: 'suresh.k@gmail.com',
    phone: '+91 99590 11223',
    role: 'Buyer',
    location: 'Vijayawada, AP',
    status: 'Active',
    verified: true,
    subscriptionPlanId: 'plan-buy-premium',
    subscriptionExpiry: '2026-11-20T23:59:59Z',
    listingsCount: 0,
    enquiriesCount: 8,
    registeredAt: '2024-05-18T11:00:00Z',
    lastLogin: '2026-09-18T21:10:00Z'
  }
];

export const INITIAL_SELLER_PLANS: SellerPlan[] = [
  {
    id: 'plan-sel-basic',
    name: 'Standard Owner Plan',
    price: 999, // Base Amount
    taxRate: 0.18, // 18% GST (₹179.82) -> Total ₹1,178.82
    durationDays: 30,
    listingsLimit: 2,
    imageLimitPerVehicle: 15,
    featuredSlots: 0,
    boostListings: false,
    analyticsAccess: true,
    leadAccess: true,
    prioritySupport: false,
    active: true,
    description: 'Perfect for individual vehicle owners looking to sell 1-2 personal vehicles directly.'
  },
  {
    id: 'plan-sel-pro',
    name: 'Premium Seller Pro',
    price: 2499, // Base Amount
    taxRate: 0.18, // 18% GST (₹449.82) -> Total ₹2,948.82
    durationDays: 90,
    listingsLimit: 6,
    imageLimitPerVehicle: 25,
    featuredSlots: 2,
    boostListings: true,
    analyticsAccess: true,
    leadAccess: true,
    prioritySupport: true,
    active: true,
    description: 'For active vehicle sellers & fleet owners needing featured spots, WhatsApp alerts, and extended duration.'
  },
  {
    id: 'plan-sel-enterprise',
    name: 'Fleet & Commercial Dealer',
    price: 6999, // Base Amount
    taxRate: 0.18, // 18% GST (₹1,259.82) -> Total ₹8,258.82
    durationDays: 180,
    listingsLimit: 25,
    imageLimitPerVehicle: 35,
    featuredSlots: 8,
    boostListings: true,
    analyticsAccess: true,
    leadAccess: true,
    prioritySupport: true,
    active: true,
    description: 'Comprehensive package for commercial fleets, equipment owners, and heavy vehicle operators.'
  }
];

export const INITIAL_BUYER_PLANS: BuyerPlan[] = [
  {
    id: 'plan-buy-starter',
    name: 'Buyer Starter Pass',
    tagline: 'Best for single car or bike buyers',
    price: 199,
    taxRate: 0.18,
    durationDays: 15,
    validityDays: 15,
    contactsLimit: 5,
    listingViewsAllowed: 5,
    savedSearchesLimit: 5,
    unlimitedWishlist: true,
    instantAlerts: true,
    priorityEnquiry: false,
    detailedInspectionReport: true,
    compareVehiclesLimit: 3,
    active: true,
    popular: false,
    description: 'Unlock direct owner phone number, WhatsApp contact & RC verification for up to 5 vehicles.',
    features: [
      'Unlock up to 5 Direct Owner Phone & WhatsApp contacts',
      '15 Days unrestricted access',
      'View Verified RC & RTO Registration Details',
      '3 Vehicles Side-by-Side Spec Comparison',
      'Instant Email & SMS alerts on price drops'
    ]
  },
  {
    id: 'plan-buy-premium',
    name: 'VIP Buyer Pass',
    tagline: 'Most popular for serious vehicle buyers',
    price: 499,
    taxRate: 0.18,
    durationDays: 45,
    validityDays: 45,
    contactsLimit: 25,
    listingViewsAllowed: 25,
    savedSearchesLimit: 20,
    unlimitedWishlist: true,
    instantAlerts: true,
    priorityEnquiry: true,
    detailedInspectionReport: true,
    compareVehiclesLimit: 4,
    active: true,
    popular: true,
    description: 'Direct owner contact access for up to 25 vehicles, verified RC reports & priority inspections.',
    features: [
      'Unlock up to 25 Direct Owner Phone & WhatsApp contacts',
      '45 Days uninterrupted membership',
      'Full VAHAN & RC Document Verification Access',
      '4 Vehicles Comparison Dock with PDF spec export',
      'Priority direct owner inspection scheduling',
      '0% Brokerage & Direct Owner Negotiation'
    ]
  },
  {
    id: 'plan-buy-elite',
    name: 'Commercial & Fleet Buyer Elite',
    tagline: 'For business, fleet & heavy equipment buyers',
    price: 1499,
    taxRate: 0.18,
    durationDays: 90,
    validityDays: 90,
    contactsLimit: 100,
    listingViewsAllowed: 100,
    savedSearchesLimit: 50,
    unlimitedWishlist: true,
    instantAlerts: true,
    priorityEnquiry: true,
    detailedInspectionReport: true,
    compareVehiclesLimit: 6,
    active: true,
    popular: false,
    description: 'High-volume access for commercial trucks, luxury buses, JCB loaders & heavy machinery.',
    features: [
      'Unlock up to 100 Direct Owner & Fleet Contacts',
      '90 Days extended validity',
      'Commercial Permit, Tax & Fitness validity verification',
      'Direct contact with fleet owners & equipment managers',
      'Dedicated OnRoadPriz Buyer Concierge assistance',
      'Instant WhatsApp notifications for new commercial listings'
    ]
  }
];

export const INITIAL_ORDERS: OrderPayment[] = [
  {
    id: 'ord-1001',
    transactionId: 'TXN-RAZ-988210',
    userId: 'usr-sel-201',
    userName: 'Praveen Varma',
    userEmail: 'praveen.varma@gmail.com',
    planId: 'plan-sel-pro',
    planName: 'Premium Seller Pro (90 Days)',
    planType: 'Seller',
    baseAmount: 2499,
    taxAmount: 449.82,
    totalAmount: 2948.82,
    paymentGateway: 'Razorpay',
    status: 'Successful',
    date: '2026-08-01T14:32:00Z',
    invoiceNumber: 'INV-ORP-2026-0801'
  },
  {
    id: 'ord-1002',
    transactionId: 'TXN-UPI-449102',
    userId: 'usr-sel-202',
    userName: 'K. Rajesh Reddy',
    userEmail: 'rajesh.reddy@outlook.com',
    planId: 'plan-sel-basic',
    planName: 'Standard Owner Plan (30 Days)',
    planType: 'Seller',
    baseAmount: 999,
    taxAmount: 179.82,
    totalAmount: 1178.82,
    paymentGateway: 'UPI',
    status: 'Successful',
    date: '2026-08-10T09:12:00Z',
    invoiceNumber: 'INV-ORP-2026-0810'
  },
  {
    id: 'ord-1003',
    transactionId: 'TXN-RAZ-119284',
    userId: 'usr-buy-301',
    userName: 'Suresh Kumar',
    userEmail: 'suresh.k@gmail.com',
    planId: 'plan-buy-premium',
    planName: 'VIP Buyer Pass (60 Days)',
    planType: 'Buyer',
    baseAmount: 499,
    taxAmount: 89.82,
    totalAmount: 588.82,
    paymentGateway: 'Razorpay',
    status: 'Successful',
    date: '2026-08-15T18:40:00Z',
    invoiceNumber: 'INV-ORP-2026-0815'
  },
  {
    id: 'ord-1004',
    transactionId: 'TXN-CARD-881920',
    userId: 'usr-sel-207',
    userName: 'R. K. Infrastructure',
    userEmail: 'rkinfra.equipment@gmail.com',
    planId: 'plan-sel-enterprise',
    planName: 'Fleet & Commercial Dealer (180 Days)',
    planType: 'Seller',
    baseAmount: 6999,
    taxAmount: 1259.82,
    totalAmount: 8258.82,
    paymentGateway: 'Card',
    status: 'Successful',
    date: '2026-09-02T11:25:00Z',
    invoiceNumber: 'INV-ORP-2026-0902'
  }
];

export const INITIAL_ENQUIRIES: VehicleEnquiry[] = [
  {
    id: 'enq-5001',
    vehicleId: 'ORP-VEH-1001',
    vehicleTitle: '2022 Hyundai Creta SX 1.5 Executive',
    vehiclePrice: 1425000,
    vehicleImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
    sellerId: 'usr-sel-201',
    buyerName: 'Suresh Kumar',
    buyerPhone: '+91 99590 11223',
    buyerEmail: 'suresh.k@gmail.com',
    message: 'Hello Praveen sir, I am very interested in your 2022 Creta. Is the price slightly negotiable? Can I visit MVP Colony tomorrow morning for an inspection?',
    inspectionRequested: true,
    preferredDate: '2026-09-20',
    status: 'Contacted',
    adminNotes: 'Buyer verified, seller shared location coordinates.',
    createdAt: '2026-09-17T14:20:00Z'
  },
  {
    id: 'enq-5002',
    vehicleId: 'ORP-VEH-1002',
    vehicleTitle: '2023 Mahindra Thar LX 4x4 Hard Top',
    vehiclePrice: 1580000,
    vehicleImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
    sellerId: 'usr-sel-202',
    buyerName: 'Vikram Joshi',
    buyerPhone: '+91 98491 66778',
    buyerEmail: 'vikram.j@gmail.com',
    message: 'Hi Rajesh, is the Thar still available? Looking for immediate token transfer if documents are clear.',
    inspectionRequested: false,
    status: 'New',
    adminNotes: 'Direct buyer enquiry.',
    createdAt: '2026-09-18T09:15:00Z'
  },
  {
    id: 'enq-5003',
    vehicleId: 'ORP-VEH-1007',
    vehicleTitle: '2022 JCB 3DX Super 4WD Backhoe Loader',
    vehiclePrice: 2650000,
    vehicleImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    sellerId: 'usr-sel-207',
    buyerName: 'Appa Rao Constructions',
    buyerPhone: '+91 89190 77112',
    buyerEmail: 'apparao.civil@gmail.com',
    message: 'We require this 3DX machine for our Anakapalli project site. Please confirm if finance assistance or noc transfer can be arranged.',
    inspectionRequested: true,
    preferredDate: '2026-09-22',
    status: 'Follow-up',
    adminNotes: 'Follow-up call scheduled on Tuesday.',
    createdAt: '2026-09-16T16:45:00Z'
  }
];

// Recreating and improving Banner Management from the screenshot with proper sections
export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-001',
    section: 'Main Banner',
    name: 'Direct Owner Mega Marketplace',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&auto=format&fit=crop&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    targetUrl: '/buy',
    openInNewTab: false,
    altText: 'Direct Owner Used Cars and Vehicles',
    trackingId: 'HERO_MAIN_01',
    displayOrder: 1,
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    dimensions: '1920x600 px',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ban-002',
    section: 'Main Banner',
    name: 'Sell Your Vehicle with Zero Middlemen',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&auto=format&fit=crop&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
    targetUrl: '/sell',
    openInNewTab: false,
    altText: 'Sell Second Hand Cars Directly to Buyers',
    trackingId: 'HERO_MAIN_02',
    displayOrder: 2,
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    dimensions: '1920x600 px',
    createdAt: '2026-08-05T00:00:00Z',
    updatedAt: '2026-08-05T00:00:00Z'
  },
  {
    id: 'ban-003',
    section: 'Main Banner Mobile View',
    name: 'Mobile App Exclusive Direct Deals',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
    targetUrl: '/buy',
    openInNewTab: false,
    altText: 'Mobile Marketplace Banner',
    trackingId: 'MOB_MAIN_01',
    displayOrder: 1,
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    dimensions: '750x450 px',
    createdAt: '2026-08-10T00:00:00Z',
    updatedAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'ban-004',
    section: 'Additional Promotional Banners',
    name: 'Commercial Trucks & Heavy Machinery Hub',
    imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&auto=format&fit=crop&q=80',
    targetUrl: '/buy?category=Trucks+%26+Lorries',
    openInNewTab: false,
    altText: 'Trucks and Heavy Equipment',
    trackingId: 'PROMO_TRUCKS_01',
    displayOrder: 1,
    status: 'Active',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    dimensions: '1200x400 px',
    createdAt: '2026-08-15T00:00:00Z',
    updatedAt: '2026-08-15T00:00:00Z'
  },
  {
    id: 'ban-005',
    section: 'Category Banners',
    name: 'Certified Two-Wheelers & Superbikes',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop&q=80',
    targetUrl: '/buy?category=Bikes+%26+Scooters',
    openInNewTab: false,
    altText: 'Used Bikes and Scooters',
    trackingId: 'CAT_BIKES_01',
    displayOrder: 1,
    status: 'Active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    dimensions: '1200x350 px',
    createdAt: '2026-08-20T00:00:00Z',
    updatedAt: '2026-08-20T00:00:00Z'
  },
  {
    id: 'ban-006',
    section: 'Popup Banners',
    name: 'Zero Commission Launch Celebration',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
    targetUrl: '/sell',
    openInNewTab: false,
    altText: 'Special Direct Owner Offer',
    trackingId: 'POPUP_LAUNCH_01',
    displayOrder: 1,
    status: 'Inactive',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    dimensions: '600x600 px',
    createdAt: '2026-08-25T00:00:00Z',
    updatedAt: '2026-08-25T00:00:00Z'
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-101',
    title: 'Top 7 Things to Inspect When Buying a Second-Hand Car Directly from an Owner in India',
    slug: 'top-7-things-inspect-buying-used-car-owner-india',
    excerpt: 'Avoid costly surprises by following this foolproof checklist on RC verification, insurance transfer, chassis inspection, and engine health.',
    content: `Buying a used vehicle directly from an owner is one of the smartest financial decisions in India today. By bypassing intermediary dealers and aggressive commission markups, buyers routinely save between 15% and 25% on the vehicle's net price.

However, purchasing directly requires diligent due diligence. Here is our expert guide on what to inspect before closing the deal:

### 1. Parivahan Digital RC Verification
Always verify the Registration Certificate (RC) through the official VAHAN portal or the OnRoadPriz vehicle inspection tool. Check:
- Engine and Chassis number match the physical stamp under the hood/door frame.
- Hypothecation status (ensure there is no active unpaid bank loan or get an official bank NOC with Form 35).
- RTO blacklisting or pending traffic challans.

### 2. Physical Engine & Fluid Check
Inspect the oil filler cap for white residue (milky emulsion indicates head gasket failure). Check coolant color and ensure there are no active oil seepages around the valve cover.

### 3. Service Log History
Ask the seller for the original service records. A car serviced consistently at an authorized brand center with authentic odometer intervals is ten times safer than one serviced at roadside garages with unverifiable histories.

### 4. Frame & Pillar Structural Integrity
Peel back the rubber weatherstripping around the doors. Factory spot welds are circular and uniform. If the welds look uneven or filled with putty, the car has suffered structural collision damage.`,
    category: 'Buying Guides',
    tags: ['Used Car Tips', 'RC Verification', 'Direct Owner', 'Inspection'],
    featuredImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
    author: {
      name: 'Kalyan Chakravarthy',
      role: 'Automotive Inspection Specialist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    status: 'Published',
    publishedAt: '2026-09-05T09:00:00Z',
    readTimeMinutes: 5,
    seoTitle: 'Inspection Checklist for Buying Used Cars Directly from Owners',
    seoDescription: 'Foolproof guide to inspecting second hand vehicles, smart RC cards, and chassis integrity in India.',
    viewsCount: 2450
  },
  {
    id: 'blog-102',
    title: 'How to Transfer Vehicle Ownership (RTO Form 29 & 30) Step-by-Step in Andhra Pradesh & Telangana',
    slug: 'how-to-transfer-vehicle-ownership-rto-form-29-30-ap-ts',
    excerpt: 'Everything you need to know about transferring the RC card, signing Form 29/30, and completing online Parivahan Aadhaar e-KYC without touts.',
    content: `Transferring vehicle ownership across Andhra Pradesh and Telangana RTOs has become significantly streamlined thanks to Sarathi and Vahan online Aadhaar authentication.

Here is the straightforward step-by-step procedure:

### Documents Required:
1. Original Registration Certificate (RC)
2. Form 29 (Notice of Transfer of Ownership) signed in duplicate
3. Form 30 (Application for Intimation and Transfer of Ownership)
4. Valid Pollution Under Control (PUC) certificate
5. Valid Motor Insurance policy certificate
6. Address proof of the buyer (Aadhaar / Passport)
7. Active Bank NOC and Form 35 (if vehicle had a loan)

### Online Parivahan Filing:
Visit parivahan.gov.in, select your State RTO, and navigate to 'Transfer of Ownership'. Complete Aadhaar OTP verification for both seller and buyer to bypass physical submission in many modern RTO jurisdictions!`,
    category: 'RTO & Legal',
    tags: ['RTO Process', 'Form 29', 'Form 30', 'Ownership Transfer', 'AP & TS'],
    featuredImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1000&auto=format&fit=crop&q=80',
    author: {
      name: 'Sravani Rao',
      role: 'Legal & RTO Compliance Lead',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    },
    status: 'Published',
    publishedAt: '2026-08-28T14:30:00Z',
    readTimeMinutes: 6,
    seoTitle: 'RTO Vehicle Ownership Transfer Guide - AP and Telangana',
    seoDescription: 'Simple guide for Form 29 and Form 30 vehicle transfer without middlemen or brokers.',
    viewsCount: 3890
  },
  {
    id: 'blog-103',
    title: 'Commercial Trucks vs Pickups: Which Used Vehicle Gives Higher ROI for Intra-City Logistics?',
    slug: 'commercial-trucks-vs-pickups-used-vehicle-roi-logistics',
    excerpt: 'Comparing operating expenses, maintenance costs, and freight rates for BharatBenz, Ashok Leyland, and Tata commercial carriers.',
    content: `For transport operators and logistics businesses, selecting between a heavy multi-axle carrier and a compact light commercial vehicle (LCV) directly dictates profitability. In this deep dive, we evaluate operating expenses (OPEX) including tyre wear, diesel consumption, toll charges, and residual resale valuations.`,
    category: 'Commercial & Fleet',
    tags: ['Commercial Vehicles', 'Trucks', 'Logistics', 'ROI'],
    featuredImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1000&auto=format&fit=crop&q=80',
    author: {
      name: 'Mohit Agarwal',
      role: 'Fleet Logistics Analyst',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    status: 'Published',
    publishedAt: '2026-08-14T10:15:00Z',
    readTimeMinutes: 4,
    seoTitle: 'Used Commercial Vehicle ROI: Trucks vs LCVs in India',
    seoDescription: 'Operating expenses and profitability comparison for second hand commercial haulers.',
    viewsCount: 1620
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-01',
    name: 'Venkata Ramana Murthy',
    designation: 'Retired Bank Manager',
    location: 'Visakhapatnam, AP',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    vehiclePurchased: '2021 Honda City ZX',
    quote: 'Selling my Honda City on OnRoadPriz was an absolute breeze. Within 4 days of listing, 3 genuine direct buyers contacted me. I received full market value without paying a single rupee in dealer brokerage!',
    rating: 5,
    status: 'Active',
    displayOrder: 1
  },
  {
    id: 'test-02',
    name: 'Srinivas Goud',
    designation: 'IT Director',
    location: 'Hyderabad, TS',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    vehiclePurchased: '2022 Mahindra Thar LX',
    quote: 'I was hesitant to buy a pre-owned Thar from regular used car dealers who inflate prices by 2-3 lakhs. Through OnRoadPriz, I met the real first owner directly in Jubilee Hills, saw the original service bill, and closed the deal in 48 hours.',
    rating: 5,
    status: 'Active',
    displayOrder: 2
  },
  {
    id: 'test-03',
    name: 'Ch. Satyanarayana',
    designation: 'Civil Contractor',
    location: 'Vijayawada, AP',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    vehiclePurchased: '2022 JCB 3DX Backhoe',
    quote: 'Finding certified construction machinery with authentic meter hours used to be painful. OnRoadPriz gave us verified RTO and equipment invoices. Highly recommended for heavy commercial equipment!',
    rating: 5,
    status: 'Active',
    displayOrder: 3
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-901',
    adminName: 'Harsha Vardhan (Super Admin)',
    action: 'Vehicle Approved',
    module: 'Vehicle Management',
    recordId: 'ORP-VEH-1001',
    oldValue: 'Status: Pending Approval',
    newValue: 'Status: Published',
    ipAddress: '157.48.192.12',
    timestamp: '2026-08-15T11:00:00Z'
  },
  {
    id: 'aud-902',
    adminName: 'Harsha Vardhan (Super Admin)',
    action: 'Plan Updated',
    module: 'Seller Plans',
    recordId: 'plan-sel-pro',
    oldValue: 'Price: ₹1999',
    newValue: 'Price: ₹2499',
    ipAddress: '157.48.192.12',
    timestamp: '2026-08-20T16:20:00Z'
  },
  {
    id: 'aud-903',
    adminName: 'Sunil Verma (Moderator)',
    action: 'Banner Reordered',
    module: 'Banner Management',
    recordId: 'ban-001',
    oldValue: 'Display Order: 2',
    newValue: 'Display Order: 1',
    ipAddress: '183.82.110.45',
    timestamp: '2026-09-01T10:15:00Z'
  },
  {
    id: 'aud-904',
    adminName: 'Harsha Vardhan (Super Admin)',
    action: 'User Role Verified',
    module: 'User Management',
    recordId: 'usr-sel-201',
    oldValue: 'Verified: false',
    newValue: 'Verified: true',
    ipAddress: '157.48.192.12',
    timestamp: '2026-09-10T14:40:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: PlatformNotification[] = [
  {
    id: 'notif-01',
    title: 'New Vehicle Enquiry Received',
    message: 'Suresh Kumar enquired about your 2022 Hyundai Creta SX.',
    type: 'enquiry',
    read: false,
    createdAt: '2026-09-17T14:20:00Z',
    link: '/seller/enquiries'
  },
  {
    id: 'notif-02',
    title: 'Listing Approved & Live',
    message: 'Your 2023 Mahindra Thar LX listing has been approved by moderators and is now visible.',
    type: 'vehicle_status',
    read: true,
    createdAt: '2026-08-20T09:00:00Z',
    link: '/buy/ORP-VEH-1002'
  },
  {
    id: 'notif-03',
    title: 'Plan Purchase Confirmed',
    message: 'Invoice INV-ORP-2026-0801 for Premium Seller Pro generated successfully.',
    type: 'payment',
    read: true,
    createdAt: '2026-08-01T14:32:00Z',
    link: '/seller/plans'
  }
];

export const INITIAL_SELLER_REPORTS: SellerReport[] = [
  {
    id: 'rep-001',
    reporterName: 'K. Vijay Kumar',
    reporterPhone: '+91 98480 33441',
    reporterEmail: 'vijay.k@gmail.com',
    sellerId: 'usr-sel-202',
    sellerName: 'K. Rajesh Reddy',
    vehicleId: 'ORP-VEH-1002',
    vehicleTitle: '2023 Mahindra Thar LX Hard Top Diesel',
    reason: 'Odometer Reading Discrepancy',
    details: 'Inspection showed 45,000 km on dealership records whereas listing states 18,500 km.',
    priority: 'High',
    status: 'Open',
    assignedAdmin: 'Harsha Vardhan (Super Admin)',
    adminNotes: 'Contacting seller to provide authentic dealership service history.',
    createdAt: '2026-09-19T08:30:00Z'
  },
  {
    id: 'rep-002',
    reporterName: 'Anil Swamy',
    reporterPhone: '+91 99887 11223',
    reporterEmail: 'anil.swamy@outlook.com',
    sellerId: 'usr-sel-207',
    sellerName: 'R. K. Infrastructure',
    vehicleId: 'ORP-VEH-1010',
    vehicleTitle: '2023 Tata Hitachi EX 200LC Hydraulic Excavator',
    reason: 'Commercial Broker Operating as Direct Owner',
    details: 'Seller claims to be individual owner but is operating a commercial brokerage lot without disclosure.',
    priority: 'Medium',
    status: 'Under Review',
    assignedAdmin: 'Sunil Verma (Moderator)',
    adminNotes: 'Verifying RC copy and GST invoice proof from RTO database.',
    createdAt: '2026-09-20T11:15:00Z'
  }
];

export const INITIAL_CONTACT_SUBMISSIONS: ContactSubmission[] = [
  {
    id: 'cnt-001',
    name: 'Mahesh Babu G.',
    email: 'mahesh.g@techcorp.in',
    phone: '+91 97011 55667',
    subject: 'Bulk Fleet Listing for Transport Buses',
    message: 'We have 6 luxury intercity buses to list directly from our corporate fleet. Can we get custom dealer listing packages?',
    status: 'new',
    assignedTo: 'Harsha Vardhan (Super Admin)',
    createdAt: '2026-09-21T09:40:00Z'
  },
  {
    id: 'cnt-002',
    name: 'Deepika Rao',
    email: 'deepika.rao@gmail.com',
    phone: '+91 89199 88776',
    subject: 'Assistance with RC Ownership Transfer Verification',
    message: 'Need verification guidelines for transferring AP registration to TS registration after direct owner sale.',
    status: 'in_progress',
    assignedTo: 'Sunil Verma (Moderator)',
    createdAt: '2026-09-22T14:10:00Z'
  },
  {
    id: 'cnt-003',
    name: 'Ramesh Naidu',
    email: 'ramesh.naidu@gmail.com',
    phone: '+91 94401 22334',
    subject: 'Escrow Payment Option Request',
    message: 'Does OnRoadPriz offer escrow payment protection for outstation heavy equipment purchases?',
    status: 'resolved',
    assignedTo: 'Harsha Vardhan (Super Admin)',
    createdAt: '2026-09-18T16:25:00Z'
  }
];

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-adm-001',
    name: 'Harsha Vardhan',
    email: 'admin@onroadpriz.com',
    phone: '+91 891 278 4590',
    role: 'Super Admin',
    department: 'Executive Leadership',
    permissions: [
      'manage_overview',
      'manage_users',
      'manage_vehicles',
      'manage_master_data',
      'manage_plans',
      'manage_banners',
      'manage_blogs',
      'manage_moderation',
      'manage_contacts',
      'manage_settings',
      'manage_team'
    ],
    status: 'Active',
    createdAt: '2024-01-01T00:00:00Z',
    lastActive: '2026-09-25T07:00:00Z'
  },
  {
    id: 'team-adm-002',
    name: 'OnRoadPriz Administrator',
    email: 'onroadpriz@admin.com',
    phone: '+91 99000 11111',
    role: 'Super Admin',
    department: 'Platform Operations',
    permissions: [
      'manage_overview',
      'manage_users',
      'manage_vehicles',
      'manage_master_data',
      'manage_plans',
      'manage_banners',
      'manage_blogs',
      'manage_moderation',
      'manage_contacts',
      'manage_settings',
      'manage_team'
    ],
    status: 'Active',
    createdAt: '2024-01-01T00:00:00Z',
    lastActive: '2026-09-25T07:02:00Z'
  },
  {
    id: 'team-mod-003',
    name: 'Sunil Verma',
    email: 'moderator@onroadpriz.com',
    phone: '+91 98480 99001',
    role: 'Moderator',
    department: 'Trust & Verification',
    permissions: [
      'manage_vehicles',
      'manage_moderation',
      'manage_users'
    ],
    status: 'Active',
    createdAt: '2024-03-15T10:00:00Z',
    lastActive: '2026-09-24T18:15:00Z'
  },
  {
    id: 'team-cnt-004',
    name: 'Priya Sharma',
    email: 'priya.content@onroadpriz.com',
    phone: '+91 98480 88220',
    role: 'Content Editor',
    department: 'Marketing & Content',
    permissions: [
      'manage_banners',
      'manage_blogs',
      'manage_settings'
    ],
    status: 'Active',
    createdAt: '2024-04-10T12:00:00Z',
    lastActive: '2026-09-23T14:40:00Z'
  },
  {
    id: 'team-sup-005',
    name: 'Kiran Kumar',
    email: 'kiran.support@onroadpriz.com',
    phone: '+91 98480 77110',
    role: 'Support Specialist',
    department: 'Customer Success',
    permissions: [
      'manage_contacts',
      'manage_users'
    ],
    status: 'Active',
    createdAt: '2024-05-01T09:00:00Z',
    lastActive: '2026-09-25T06:10:00Z'
  }
];

