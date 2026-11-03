export type CategoryId = 'cars' | 'bikes' | 'trucks' | 'buses' | 'jcb' | 'heavy-machinery';

export type VehicleCategory = 
  | 'Cars' 
  | 'Bikes & Scooters' 
  | 'Trucks & Lorries' 
  | 'Buses' 
  | 'Tractors & Backhoe Loaders' 
  | 'Heavy Machinery'
  | CategoryId
  | string;

export type UserRole = 
  | 'Buyer' 
  | 'Seller' 
  | 'Moderator' 
  | 'Super Admin' 
  | 'Admin' 
  | 'Content Editor'
  | 'Support Specialist'
  | 'user' 
  | 'admin';

export type UserStatus = 
  | 'Active' 
  | 'Suspended' 
  | 'Blocked' 
  | 'active' 
  | 'blocked';

export type VehicleStatus = 
  | 'Published' 
  | 'Pending Approval' 
  | 'Draft' 
  | 'Sold' 
  | 'Rejected' 
  | 'active' 
  | 'sold' 
  | 'expired' 
  | 'suspended';

export type FuelType = 
  | 'Petrol' 
  | 'Diesel' 
  | 'CNG' 
  | 'Electric' 
  | 'Hybrid' 
  | 'Petrol Hybrid' 
  | 'Diesel Hybrid' 
  | 'Hydrogen' 
  | string;

export type TransmissionType = 
  | 'Manual' 
  | 'Automatic' 
  | 'IMT' 
  | 'AMT' 
  | 'CVT' 
  | 'DCT' 
  | 'Powershift' 
  | string;

export type OwnershipType = 
  | '1st Owner' 
  | '2nd Owner' 
  | '3rd Owner' 
  | '4th Owner' 
  | '5th+ Owner' 
  | string;

export type VehicleCondition = 
  | 'Brand New' 
  | 'Excellent' 
  | 'Good' 
  | 'Fair' 
  | string;

export interface VehicleLocation {
  city: string;
  state: string;
  area?: string;
  locality?: string;
  district?: string;
  pincode?: string;
  rtoOffice?: string;
  latitude?: number;
  longitude?: number;
}

export interface VehicleSeller {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type?: string;
  verified?: boolean;
  memberSince?: string;
  avatar?: string;
}

export interface VehicleDocumentItem {
  id: string;
  name: string;
  type: string;
  verified: boolean;
  fileUrl?: string;
  url?: string;
  backUrl?: string;
  ownerName?: string;
  regNo?: string;
}

export interface InterestedBuyer {
  buyerId: string;
  fullName: string;
  phone: string;
  email?: string;
  unlockedAt: string;
}

export interface Vehicle {
  id: string;
  title: string;
  category: VehicleCategory | CategoryId | string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  city?: string;
  state?: string;
  registrationYear?: number;
  rtoState?: string;
  rtoCity?: string;
  price: number;
  negotiable?: boolean;
  kmDriven: number;
  fuelType: FuelType | string;
  transmission: TransmissionType | string;
  bodyType?: string;
  engineCapacity?: string;
  color: string;
  mileage?: string;
  ownership: OwnershipType | string;
  condition?: VehicleCondition | string;
  location?: VehicleLocation;
  seller: VehicleSeller;
  images: string[];
  coverImageIndex?: number;
  description: string;
  features: string[];
  documents: VehicleDocumentItem[];
  status: VehicleStatus;
  planId?: string;
  isFeatured?: boolean;
  featured?: boolean;
  viewsCount: number;
  wishlistCount?: number;
  enquiriesCount?: number;
  whatsappClicksCount?: number;
  callsCount?: number;
  views?: number;
  favorites?: number;
  interestedBuyers?: InterestedBuyer[];
  isVerified?: boolean;
  uploadedBy?: string;
  ownershipProofType?: string;
  relationshipProofType?: string;
  createdAt: string;
  updatedAt: string;
  soldAt?: string;

  // Category specific specs
  seatingCapacity?: number;
  engineCC?: number;
  operatingHours?: number;
  vehicleUsage?: string;
  spareKeyAvailable?: string;
  insuranceType?: string;
  insuranceValidity?: string;
  hypothecationStatus?: string;
  rcType?: string;
  accidentHistory?: string;

  // 1. Vehicle Condition & Additional Details (All 6 Categories)
  has_spare_key?: boolean;
  insurance_valid_until?: string; // YYYY-MM-DD
  hypothecation_status?: 'No Hypothecation / Clear' | 'Active Loan / Hypothecated' | 'NOC Available' | 'Loan Closed - Removal Pending' | 'Not Sure' | string;
  financier_name?: string;
  oem_service_status?: 'Full OEM Service History' | 'Partial OEM Service History' | 'Independent Service History' | 'No Service Records' | 'Not Available' | string;
  service_records_docs?: string[];
  engine_warranty_status?: 'Active' | 'Expired' | 'Not Available' | 'Not Applicable' | 'Not Sure' | string;
  engine_warranty_valid_until?: string;
  major_accident_history?: 'No Major Accident' | 'Yes' | 'Not Sure' | string;
  major_accident_details?: string;

  // 2. Commercial / Operating Specifications (Trucks & Lorries, Buses, Heavy Machinery)
  load_capacity?: number;
  load_capacity_unit?: 'Tonnes' | 'kg' | string;
  bucket_capacity?: number;
  bucket_capacity_unit?: 'm³' | string;
  max_operating_weight?: number;
  max_operating_weight_unit?: 'tonnes' | 'kg' | string;
  max_height_capacity?: number;
  max_height_capacity_unit?: 'metres' | 'feet' | string;
  max_lift_capacity?: number;
  max_lift_capacity_unit?: 'tonnes' | 'kg' | string;

  // 3. Heavy Machinery Specifications (Heavy Machinery Vehicles ONLY)
  maximum_digging_power?: number;
  maximum_digging_power_unit?: 'kN' | 'kgf' | 'bar' | string;
  engine_power?: number;
  engine_power_unit?: 'HP' | 'kW' | string;

  // 4. Custom brand support ("Others")
  is_custom_brand?: boolean;
  custom_brand_name?: string;

  // Legacy field aliases for backwards compatibility
  loadCapacity?: number;
  bucketCapacity?: string;
  maxOperatingWeight?: number;
  maxLiftCapacity?: number;
  maxHeightCapacity?: number;
  enginePower?: number;
  maxDiggingCapacity?: number;

  // Owner fields alias
  sellerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  vehicleRegistrationNumber?: string;

  // Registration & VAHAN Lookup verification fields
  registrationNumber?: string;
  registrationLookupStatus?: RegistrationLookupStatus;
  registrationVerified?: boolean;
  registrationVerifiedAt?: string;
  vehicleLookupProvider?: string;
  vehicleLookupReference?: string;
  lookupData?: {
    vehicle?: NormalizedVehicleData;
    compliance?: NormalizedComplianceData;
    verification?: NormalizedVerificationData;
  };
  manualVerificationReason?: string;

  // RC & Insurance Document Fields (Requirement 11 & 12)
  rc_front_url?: string;
  rc_back_url?: string;
  insurance_document_url?: string;
  rc_verification_status?: DocumentVerificationStatus;
  insurance_verification_status?: DocumentVerificationStatus;
  documents_uploaded_at?: string;
  rc_verification_notes?: string;
  insurance_verification_notes?: string;

  // RC Document Verification (legacy compatibility)
  rcDocumentUrl?: string;
  rcDocumentBackUrl?: string;
  rcDocumentType?: 'pdf' | 'image' | string;
  rcStatus?: 'RC_NOT_UPLOADED' | 'RC_UPLOADED' | 'RC_UNDER_REVIEW' | 'RC_VERIFIED' | 'RC_REJECTED';
  rcVerifiedAt?: string;
  rcRejectionReason?: string;
}

export type DocumentVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REUPLOAD_REQUIRED';

export type RegistrationLookupStatus = 
  | 'NOT_CHECKED' 
  | 'LOOKUP_SUCCESS' 
  | 'LOOKUP_PARTIAL' 
  | 'LOOKUP_FAILED' 
  | 'MANUAL_REVIEW' 
  | 'VERIFIED';

export interface NormalizedVehicleData {
  manufacturer: string;
  model: string;
  variant?: string;
  vehicleClass?: string;
  vehicleCategory?: string;
  fuelType?: string;
  transmission?: string;
  manufacturingMonth?: string;
  manufacturingYear?: number | string;
  registrationDate?: string;
  color?: string;
  bodyType?: string;
  engineCapacityCC?: number | null;
  seatingCapacity?: number | null;
  rtoCode?: string;
  rtoName?: string;
  state?: string;
  registrationStatus?: string;
}

export interface NormalizedComplianceData {
  insuranceStatus?: string;
  insuranceValidUntil?: string;
  pucStatus?: string;
  pucValidUntil?: string;
  fitnessValidUntil?: string;
  taxValidUntil?: string;
  hypothecation?: string | null;
}

export interface NormalizedVerificationData {
  lookupCompleted: boolean;
  provider: string;
  verifiedAt: string;
  referenceId?: string;
}

export interface NormalizedVehicleLookupResponse {
  success: boolean;
  registrationNumber: string;
  vehicle?: NormalizedVehicleData;
  compliance?: NormalizedComplianceData;
  verification?: NormalizedVerificationData;
  error?: string;
  errorCode?: 'INVALID_REGISTRATION' | 'NOT_FOUND' | 'UNCONFIGURED' | 'TIMEOUT' | 'RATE_LIMITED' | 'AUTH_ERROR' | 'PROVIDER_ERROR' | string;
  providerConfigured?: boolean;
}

export interface SellerPlan {
  id: string;
  name: string;
  tagline?: string;
  price: number;
  taxRate?: number;
  durationDays?: number;
  validityDays?: number;
  period?: string;
  listingLimit?: number;
  listingsLimit?: number;
  listingsAllowed?: number;
  imageLimitPerVehicle?: number;
  featuredSlots?: number;
  featuredListingsCount?: number;
  boostListings?: boolean;
  analyticsAccess?: boolean;
  leadAccess?: boolean;
  prioritySupport?: boolean;
  active?: boolean;
  badge?: string;
  description?: string;
  features?: string[];
  popular?: boolean;
  status?: string;
  categoriesAllowed?: CategoryId[];
  additionalPoints?: string[];
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type SellerPlanCatalog = SellerPlan;

export interface BuyerPlan {
  id: string;
  name: string;
  tagline?: string;
  price: number;
  taxRate?: number;
  durationDays?: number;
  validityDays?: number;
  contactsLimit?: number;
  listingViewsAllowed?: number;
  savedSearchesLimit?: number;
  unlimitedWishlist?: boolean;
  instantAlerts?: boolean;
  priorityEnquiry?: boolean;
  detailedInspectionReport?: boolean;
  compareVehiclesLimit?: number;
  active?: boolean;
  badge?: string;
  description?: string;
  features?: string[];
  popular?: boolean;
  status?: string;
  categoriesAllowed?: CategoryId[];
  additionalPoints?: string[];
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BuyerPlanCatalog = BuyerPlan;

export interface PlanSnapshot {
  planId: string;
  name: string;
  description?: string;
  price: number;
  listingsAllowed?: number;
  listingsRemaining?: number;
  listingViewsAllowed?: number;
  listingViewsRemaining?: number;
  validityDays: number;
  categoriesAllowed?: CategoryId[];
  additionalPoints?: string[];
  startedAt: string;
  expiresAt: string;
  status: 'active' | 'expired';
  source?: 'mock_payment' | 'admin' | 'system' | string;
}

export interface UserAddress {
  city: string;
  state: string;
  pincode: string;
}

export type LocationAccuracyTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ConfirmedLocation {
  latitude?: number;
  longitude?: number;
  location_accuracy_meters?: number;
  accuracyTier?: LocationAccuracyTier;
  formatted_address?: string;
  premise?: string;
  street?: string;
  area?: string;
  locality?: string;
  city?: string;
  district?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  location_source?: 'DEVICE_GEOLOCATION' | 'MANUAL' | 'GPS' | 'PROFILE';
  location_confirmed_at?: string;
  location_updated_at?: string;
  location_name?: string;
  short_display?: string;
}

export interface User {
  id: string;
  name: string;
  fullName?: string;
  displayName?: string;
  phone: string;
  mobile?: string;
  normalized_mobile?: string;
  email?: string | null;
  password?: string;
  role: UserRole;
  location?: string;
  location_name?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  location_accuracy_meters?: number;
  formatted_address?: string;
  premise?: string;
  street?: string;
  area?: string;
  locality?: string;
  district?: string;
  postal_code?: string;
  pincode?: string;
  avatar?: string;
  photoURL?: string;
  country?: string;
  location_source?: 'DEVICE_GEOLOCATION' | 'MANUAL' | 'GPS' | 'PROFILE';
  location_confirmed_at?: string;
  location_updated_at?: string;
  address?: UserAddress;
  verified: boolean;
  verified_mobile?: boolean;
  verified_email?: boolean;
  status: UserStatus;
  subscriptionPlanId?: string;
  subscriptionExpiry?: string;
  sellerPlan?: PlanSnapshot | null;
  buyerPlan?: PlanSnapshot | null;
  activePlan?: string | null;
  listingsCount?: number;
  enquiriesCount?: number;
  accessedOwnershipVehicles?: string[];
  favorites?: string[];
  registeredAt?: string;
  joinedDate?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  planId: string;
  planType: 'buyer' | 'seller';
  planName: string;
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentId?: string;
  orderId?: string;
  paymentGateway?: string;
  purchasedAt: string;
  activatedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  listingsAllowed?: number;
  listingsUsed?: number;
  listingsRemaining?: number;
  viewsAllowed?: number;
  viewsUsed?: number;
  viewsRemaining?: number;
  featuredSlotsAllowed?: number;
  features?: string[];
}

export type TeamRole = 
  | 'Super Admin'
  | 'Admin'
  | 'Moderator'
  | 'Content Editor'
  | 'Support Specialist';

export type PermissionKey =
  | 'manage_overview'
  | 'manage_users'
  | 'manage_vehicles'
  | 'manage_master_data'
  | 'manage_plans'
  | 'manage_banners'
  | 'manage_blogs'
  | 'manage_moderation'
  | 'manage_contacts'
  | 'manage_settings'
  | 'manage_team';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'Core' | 'Inventory & Users' | 'Content & Growth' | 'Safety & Settings';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  department?: string;
  permissions: PermissionKey[];
  status: 'Active' | 'Suspended' | 'Invited';
  createdAt: string;
  lastActive?: string;
  avatarUrl?: string;
}

export interface OrderPayment {
  id: string;
  transactionId?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  planId: string;
  planName: string;
  planType: 'Seller' | 'Buyer' | 'seller' | 'buyer';
  baseAmount?: number;
  taxAmount?: number;
  amount?: number;
  totalAmount?: number;
  paymentGateway?: string;
  currency?: string;
  status: 'Successful' | 'Paid' | 'Pending' | 'Failed' | 'initiated' | 'paid' | 'failed' | 'cancelled' | string;
  date?: string;
  invoiceNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Transaction = OrderPayment;

export interface VehicleEnquiry {
  id: string;
  vehicleId: string;
  vehicleTitle: string;
  vehiclePrice: number;
  vehicleImage?: string;
  sellerId?: string;
  buyerId?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  message: string;
  inspectionRequested?: boolean;
  preferredDate?: string;
  offerPrice?: number;
  status: 'New' | 'Contacted' | 'Follow-up' | 'Closed' | 'Pending' | 'Responded' | 'open' | 'responded' | 'closed' | string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
  responses?: any[];
  replies?: { id: string; sender: string; message: string; createdAt: string }[];
}

export type Inquiry = VehicleEnquiry;

export interface Banner {
  id: string;
  section: string;
  name: string;
  title?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  targetUrl?: string;
  redirectUrl?: string;
  linkUrl?: string;
  openInNewTab?: boolean;
  altText?: string;
  trackingId?: string;
  displayOrder: number;
  order?: number;
  status: 'Active' | 'Inactive' | string;
  startDate?: string;
  endDate?: string;
  dimensions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerSlot {
  id: string;
  images: { url: string; linkUrl?: string }[];
  updatedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  coverImage?: string;
  tileImageUrl?: string;
  contentHtml?: string;
  authorId?: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  status?: string;
  published?: boolean;
  publishedAt: string;
  readTimeMinutes: number;
  seoTitle?: string;
  seoDescription?: string;
  metaDescription?: string;
  viewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type BlogItem = BlogPost;

export interface Testimonial {
  id: string;
  name: string;
  customerName?: string;
  designation?: string;
  location?: string;
  avatar?: string;
  imageUrl?: string;
  vehiclePurchased?: string;
  quote?: string;
  testimonial?: string;
  rating: number;
  status?: string;
  published?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type TestimonialItem = Testimonial;

export interface AuditLog {
  id: string;
  adminId?: string;
  adminName: string;
  userName?: string;
  action: string;
  module: string;
  entity?: string;
  recordId: string;
  oldValue: string;
  newValue: string;
  details?: string;
  targetType?: string;
  targetId?: string;
  reason?: string;
  ipAddress?: string;
  timestamp: string | number;
  createdAt?: string;
}

export type AdminLog = AuditLog;

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  link?: string;
  userMobile?: string;
  userId?: string;
  details?: Record<string, any>;
}

export type NotificationItem = PlatformNotification;

export interface PlatformSettings {
  siteName: string;
  tagline: string;
  primaryColor: string;
  currencySymbol: string;
  currencyCode: string;
  supportPhone: string;
  supportEmail: string;
  headquartersAddress: string;
  headquartersTitle?: string;
  supportHours?: string;
  gstRatePercent: number;
  maintenanceMode: boolean;
  autoApproveVerifiedSellers: boolean;
  metaTitle: string;
  metaDescription: string;
  socialLinks: Record<string, string>;
  // Branding (Authoritative Global Platform Configuration)
  websiteLogo?: string;
  mobileLogo?: string;
  adminLogo?: string;
  favicon?: string;
  logoUrl?: string;
  faviconUrl?: string;
  logo_url?: string;
  favicon_url?: string;
  logoVersion?: number;
  mobileLogoVersion?: number;
  adminLogoVersion?: number;
  faviconVersion?: number;
  logo_version?: number;
  favicon_version?: number;
  brandingUpdatedAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  updated_at?: string;
  updated_by?: string;
  // Requirement 19: Specification & Field Requirement Configuration per Category
  vehicleFieldsConfig?: Record<string, CategoryFieldConfig>;
}

export type FieldRequirementStatus = 'Required' | 'Optional' | 'Hidden';
export type CategoryFieldRule = FieldRequirementStatus;

export interface CategoryFieldConfig {
  spareKey: FieldRequirementStatus;
  insuranceValidity: FieldRequirementStatus;
  hypothecationStatus: FieldRequirementStatus;
  oemService: FieldRequirementStatus;
  engineWarranty: FieldRequirementStatus;
  majorAccidentHistory: FieldRequirementStatus;
  loadCapacity?: FieldRequirementStatus;
  bucketCapacity?: FieldRequirementStatus;
  maxOperatingWeight?: FieldRequirementStatus;
  maxHeightCapacity?: FieldRequirementStatus;
  maxLiftCapacity?: FieldRequirementStatus;
  maximumDiggingPower?: FieldRequirementStatus;
  enginePower?: FieldRequirementStatus;
}

export type InsuranceValidityStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export interface InsuranceStatusCalculation {
  status: InsuranceValidityStatus;
  daysRemaining: number | null;
  label: string;
  colorClass: string;
  badgeClass: string;
}

/**
 * Requirement 1: Calculate insurance validity status dynamically without permanently storing status
 */
export const calculateInsuranceStatus = (validUntilDate?: string): InsuranceStatusCalculation => {
  if (!validUntilDate) {
    return {
      status: 'Expired',
      daysRemaining: null,
      label: 'Not Provided',
      colorClass: 'text-slate-500',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
    };
  }

  const target = new Date(validUntilDate);
  if (isNaN(target.getTime())) {
    return {
      status: 'Expired',
      daysRemaining: null,
      label: 'Invalid Date',
      colorClass: 'text-rose-600',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'Expired',
      daysRemaining: diffDays,
      label: `Expired (${Math.abs(diffDays)}d ago)`,
      colorClass: 'text-rose-600',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
    };
  } else if (diffDays <= 30) {
    return {
      status: 'Expiring Soon',
      daysRemaining: diffDays,
      label: `Expiring Soon (${diffDays}d left)`,
      colorClass: 'text-amber-600',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
    };
  } else {
    return {
      status: 'Valid',
      daysRemaining: diffDays,
      label: `Valid (${diffDays}d remaining)`,
      colorClass: 'text-emerald-700',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
  }
};

export interface MasterCategory {
  id: string;
  name: string;
  active: boolean;
  order: number;
}

export interface MasterBrand {
  id: string;
  categoryId: string; // e.g. 'Cars', 'Bikes & Scooters'
  name: string;
  active: boolean;
  order: number;
  logo?: string;
  logoUrl?: string;
}

export interface MasterModel {
  id: string;
  brandId: string;
  name: string;
  active: boolean;
  order: number;
}

export interface MasterVariant {
  id: string;
  modelId: string;
  name: string;
  active: boolean;
  order: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'read' | 'replied' | 'resolved' | 'spam' | 'archived' | string;
  assignedTo?: string;
  adminNotes?: string;
  createdAt: string;
  readAt?: string;
  readBy?: string;
}

export interface SellerReport {
  id: string;
  vehicleId: string;
  reason: string;
  description?: string;
  details?: string;
  reporterId?: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  sellerId: string;
  sellerName?: string;
  sellerInfo?: any;
  vehicleTitle?: string;
  vehicleInfo?: any;
  priority?: 'Low' | 'Medium' | 'High' | string;
  status?: 'Open' | 'Under Review' | 'Resolved' | 'Rejected' | string;
  assignedAdmin?: string;
  adminNotes?: string;
  evidenceUrls?: string[];
  createdAt: string;
  updatedAt?: string;
}
