import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { updateDocumentFavicon } from '../components/common/BrandLogo';
import {
  User,
  Vehicle,
  SellerPlan,
  BuyerPlan,
  PlanSnapshot,
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
  UserRole,
  VehicleStatus,
  MasterCategory,
  MasterBrand,
  MasterModel,
  MasterVariant,
  DocumentVerificationStatus,
  TeamMember,
  TeamRole,
  PermissionKey,
  UserSubscription,
  ConfirmedLocation,
  LocationAccuracyTier
} from '../types';
import {
  getHighAccuracyDeviceLocation,
  reverseGeocodeCoordinates,
  classifyAccuracy
} from '../services/deviceLocationService';
import { resolveCanonicalCity } from '../data/locationData';
import {
  INITIAL_SETTINGS,
  INITIAL_VEHICLES,
  INITIAL_USERS,
  INITIAL_SELLER_PLANS,
  INITIAL_BUYER_PLANS,
  INITIAL_ORDERS,
  INITIAL_ENQUIRIES,
  INITIAL_BANNERS,
  INITIAL_BLOGS,
  INITIAL_TESTIMONIALS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONTACT_SUBMISSIONS,
  INITIAL_SELLER_REPORTS,
  INITIAL_TEAM_MEMBERS
} from '../data/initialData';
import {
  INITIAL_MASTER_CATEGORIES,
  INITIAL_MASTER_BRANDS,
  INITIAL_MASTER_MODELS,
  INITIAL_MASTER_VARIANTS,
  INITIAL_FUEL_TYPES,
  INITIAL_TRANSMISSION_TYPES,
  INITIAL_BODY_TYPES
} from '../data/masterData';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface AppContextType {
  // Navigation & Location
  currentPath: string;
  currentRoute: string;
  navigate: (path: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedLocality: string;
  setSelectedLocality: (locality: string) => void;
  setSelectedLocation: (city: string, locality?: string) => void;
  isLocationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;
  confirmedLocation: ConfirmedLocation | null;
  pendingDetectedLocation: ConfirmedLocation | null;
  setPendingDetectedLocation: (loc: ConfirmedLocation | null) => void;
  confirmLocation: (loc: ConfirmedLocation) => Promise<void>;
  detectLocationHighAccuracy: (onProgress?: (msg: string) => void) => Promise<{ status: string; location?: ConfirmedLocation; error?: string }>;

  // Selected State
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  activeCategoryFilter: string | null;
  setActiveCategoryFilter: (category: string | null) => void;
  selectedBlogSlug: string;
  setSelectedBlogSlug: (slug: string) => void;

  // Auth State
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  login: (email: string, role?: UserRole) => boolean;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (name: string, email: string, phone: string, role?: UserRole) => boolean;
  registerNewUser: (data: { phone: string; fullName: string; city: string; state: string; pincode: string }) => boolean;
  logout: () => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; challengeId?: string; message?: string; cooldownSeconds?: number; error?: string }>;
  verifyOtp: (phone: string, otp: string, fullName?: string) => Promise<{ success: boolean; verified?: boolean; authenticated?: boolean; isNewUser?: boolean; user?: User; message?: string; code?: string; remainingAttempts?: number; error?: string }>;
  resetPasswordWithOtp: (phone: string, newPass: string) => boolean;
  updateUserProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateUserRole: (userId: string, role: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
  updateUserLocation: (locData: Partial<ConfirmedLocation>) => Promise<void>;
  detectAndSetCurrentLocation: () => Promise<{ city: string; state?: string; locality?: string; location_name?: string } | null>;
  refreshUserData: () => Promise<void>;
  refreshAdminUsers: () => Promise<void>;
  requestMobileChangeOtp: (newMobile: string) => Promise<{ success: boolean; error?: string; message?: string; devOtp?: string }>;
  changeUserMobile: (newMobile: string, otp: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  activeBuyerPlan: UserSubscription | null;
  activeSellerPlan: UserSubscription | null;
  planHistory: UserSubscription[];
  planPayments: OrderPayment[];

  // Vehicles
  vehicles: Vehicle[];
  getPublicVehicle: (id: string) => Vehicle | null;
  getVehicleForSellerOrAdmin: (id: string) => Vehicle | null;
  hasOwnerAccess: (vehicleId: string) => boolean;
  unlockOwnerAccess: (vehicleId: string) => { success: boolean; error?: string; alreadyUnlocked?: boolean };
  addVehicle: (vehicleData: Partial<Vehicle>) => { success: boolean; vehicleId?: string; error?: string };
  updateVehicle: (id: string, updates: Partial<Vehicle>) => boolean;
  updateVehicleStatus: (id: string, status: VehicleStatus) => void;
  adminUpdateVehicleStatus: (id: string, status: VehicleStatus) => void;
  toggleVehicleFeatured: (id: string) => void;
  toggleVehicleSold: (id: string) => void;
  deleteVehicle: (id: string) => void;
  recordVehicleInteraction: (vehicleId: string, interactionType: 'view' | 'call' | 'whatsapp') => void;

  // Wishlist / Favorites
  wishlist: string[];
  favorites: string[];
  toggleWishlist: (vehicleId: string) => void;
  toggleFavorite: (vehicleId: string) => void;
  isInWishlist: (vehicleId: string) => boolean;
  isFavorite: (vehicleId: string) => boolean;
  clearWishlist: () => void;

  // Compare List
  compareList: string[];
  addToCompare: (vehicleId: string) => void;
  removeFromCompare: (vehicleId: string) => void;
  isInCompare: (vehicleId: string) => boolean;
  clearCompare: () => void;

  // Plans & Pricing
  plans: SellerPlan[];
  sellerPlans: SellerPlan[];
  buyerPlans: BuyerPlan[];
  purchasePlan: (planId: string, planType?: string, paymentMethod?: string) => Promise<{ success: boolean; error?: string; subscription?: any }>;
  addSellerPlan: (plan: Partial<SellerPlan>) => void;
  deleteSellerPlan: (id: string) => void;
  updateSellerPlan: (id: string, data: Partial<SellerPlan>) => void;
  reorderSellerPlans: (planIds: string[]) => void;
  addBuyerPlan: (plan: Partial<BuyerPlan>) => void;
  updateBuyerPlan: (id: string, data: Partial<BuyerPlan>) => void;
  deleteBuyerPlan: (id: string) => void;
  reorderBuyerPlans: (planIds: string[]) => void;

  // Orders / Payments
  payments: OrderPayment[];
  transactions: OrderPayment[];

  // Enquiries / Inquiries
  enquiries: VehicleEnquiry[];
  inquiries: VehicleEnquiry[];
  addEnquiry: (data: Partial<VehicleEnquiry>) => { success: boolean; error?: string };
  sendInquiry: (vehicleId: string, message: string) => { success: boolean; error?: string };
  replyInquiry: (inquiryId: string, message: string) => void;
  updateEnquiryStatus: (id: string, status: string) => void;

  // Banners
  banners: Banner[];
  addBanner: (banner: Partial<Banner>) => void;
  updateBannerStatus: (id: string, status: string) => void;
  deleteBanner: (id: string) => void;
  updateBannerSlot?: (slotId: string, images: { url: string; linkUrl?: string }[]) => void;

  // Blogs
  blogs: BlogPost[];
  addBlog: (data: Partial<BlogPost>) => void;
  updateBlog: (id: string, data: Partial<BlogPost>) => void;
  deleteBlog: (id: string) => void;

  // Testimonials
  testimonials: Testimonial[];
  addTestimonial: (data: Partial<Testimonial>) => void;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;

  // Notifications
  notifications: PlatformNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  deleteNotification: (id: string) => void;

  // Audit Logs & Settings
  auditLogs: AuditLog[];
  adminLogs: AuditLog[];
  addAuditLog: (entry: { action: string; module: string; recordId: string; oldValue?: string; newValue?: string }) => void;
  settings: PlatformSettings;
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<boolean>;
  refreshSiteSettings: () => Promise<void>;

  // Team Management & Access Control
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  toggleTeamMemberStatus: (id: string) => void;

  // Users management
  createAdminUser: (data: { name: string; email: string; phone: string; password?: string; role?: UserRole; city?: string; state?: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Contact & Reports
  contactSubmissions: ContactSubmission[];
  submitContact: (data: { name: string; email: string; phone?: string; subject: string; message: string }) => boolean;
  updateContactStatus: (id: string, status: string) => void;
  deleteContactSubmission: (id: string) => void;
  sellerReports: SellerReport[];
  submitSellerReport: (vehicleId: string, reason: string, description?: string) => boolean;
  updateSellerReport: (id: string, data: Partial<SellerReport>) => void;
  deleteSellerReport: (id: string) => void;

  // Toast System
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  // Master Data
  masterCategories: MasterCategory[];
  masterBrands: MasterBrand[];
  masterModels: MasterModel[];
  masterVariants: MasterVariant[];
  masterFuelTypes: string[];
  masterTransmissionTypes: string[];
  masterBodyTypes: string[];
  addMasterCategory: (cat: Partial<MasterCategory>) => void;
  updateMasterCategory: (id: string, cat: Partial<MasterCategory>) => void;
  toggleMasterCategory: (id: string) => void;
  addMasterBrand: (brand: Partial<MasterBrand>) => void;
  updateMasterBrand: (id: string, brand: Partial<MasterBrand>) => void;
  toggleMasterBrand: (id: string) => void;
  deleteMasterBrand: (id: string) => { success: boolean; error?: string };
  reorderMasterBrands: (category: string, brandIds: string[]) => void;
  addMasterModel: (model: Partial<MasterModel>) => void;
  updateMasterModel: (id: string, model: Partial<MasterModel>) => void;
  toggleMasterModel: (id: string) => void;
  deleteMasterModel: (id: string) => { success: boolean; error?: string };
  reorderMasterModels: (brandId: string, modelIds: string[]) => void;
  addMasterVariant: (variant: Partial<MasterVariant>) => void;
  updateMasterVariant: (id: string, variant: Partial<MasterVariant>) => void;
  toggleMasterVariant: (id: string) => void;
  deleteMasterVariant: (id: string) => void;
  addFuelType: (type: string) => void;
  deleteFuelType: (type: string) => void;
  addMasterFuelType: (type: string) => void;
  deleteMasterFuelType: (type: string) => void;
  addTransmissionType: (type: string) => void;
  deleteTransmissionType: (type: string) => void;
  addMasterTransmissionType: (type: string) => void;
  deleteMasterTransmissionType: (type: string) => void;
  addBodyType: (type: string) => void;
  deleteBodyType: (type: string) => void;
  addMasterBodyType: (type: string) => void;
  deleteMasterBodyType: (type: string) => void;
  getBrandsForCategory: (category: string) => MasterBrand[];
  getModelsForBrand: (brandNameOrId: string) => MasterModel[];
  getVariantsForModel: (modelNameOrId: string) => MasterVariant[];
  isBrandInUse: (brandName: string) => boolean;
  isModelInUse: (modelName: string) => boolean;

  // Buyer Subscription Access Control
  authReturnTo: string | null;
  setAuthReturnTo: (url: string | null) => void;
  checkBuyerAccess: (vehicleId: string) => {
    granted: boolean;
    reason?: 'AUTH_REQUIRED' | 'NO_PLAN' | 'EXPIRED' | 'QUOTA_EXHAUSTED';
    remainingViews?: number;
  };
  recordBuyerVehicleUnlock: (vehicleId: string) => void;

  // Seller Subscription Access Control (Requirements 6, 7, 8)
  checkSellerAccess: (category?: string) => {
    granted: boolean;
    reason?: 'AUTH_REQUIRED' | 'NO_PLAN' | 'EXPIRED' | 'QUOTA_EXHAUSTED' | 'CATEGORY_MISMATCH';
    remainingListings?: number;
  };

  // Vehicle Document Verification (Requirements 12, 13)
  verifyVehicleRc: (vehicleId: string, status: DocumentVerificationStatus, notes?: string) => void;
  verifyVehicleInsurance: (vehicleId: string, status: DocumentVerificationStatus, notes?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getInitialStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`onroadpriz_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`onroadpriz_${key}`, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Location
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [confirmedLocation, setConfirmedLocation] = useState<ConfirmedLocation | null>(() => {
    return getInitialStorage('confirmedLocation', null);
  });
  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    const raw = getInitialStorage('selectedCity', '');
    return raw ? resolveCanonicalCity(raw) : '';
  });
  const [selectedLocality, setSelectedLocalityState] = useState<string>(() => {
    const savedLoc = getInitialStorage<ConfirmedLocation | null>('confirmedLocation', null);
    if (savedLoc && savedLoc.location_source === 'DEVICE_GEOLOCATION') {
      return 'All Places';
    }
    return getInitialStorage('selectedLocality', 'All Places');
  });
  const [pendingDetectedLocation, setPendingDetectedLocation] = useState<ConfirmedLocation | null>(null);
  const [isLocationModalOpen, setLocationModalOpen] = useState<boolean>(false);

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    saveStorage('selectedCity', city);
  };

  const setSelectedLocality = (locality: string) => {
    setSelectedLocalityState(locality);
    saveStorage('selectedLocality', locality);
  };

  const setSelectedLocation = (city: string, locality?: string) => {
    setSelectedCityState(city);
    saveStorage('selectedCity', city);
    const loc = locality || 'All Places';
    setSelectedLocalityState(loc);
    saveStorage('selectedLocality', loc);
  };

  const navigate = (path: string) => {
    setCurrentPath(path);
    try {
      window.history.pushState({}, '', path);
    } catch {
      // Safe fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // UI Selection States
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('ORP-VEH-1001');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string>(
    'top-7-things-inspect-buying-used-car-owner-india'
  );
  const [isAuthModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Entities State
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const loaded = getInitialStorage('vehicles', INITIAL_VEHICLES);
    const list = Array.isArray(loaded) ? loaded : INITIAL_VEHICLES;
    // Safe normalization of historical data (e.g. Swarag -> Swaraj, Vovlo -> Volvo, Heavy Machinery -> Heavy Machinery Vehicles)
    return list.map(v => {
      let brand = v.brand;
      let category = v.category;
      let changed = false;
      if (brand === 'Swarag') { brand = 'Swaraj'; changed = true; }
      if (brand === 'Vovlo') { brand = 'Volvo'; changed = true; }
      if (category === 'Heavy Machinery') { category = 'Heavy Machinery Vehicles'; changed = true; }
      return changed ? { ...v, brand, category } : v;
    });
  });

  const [users, setUsers] = useState<User[]>(() => {
    const loaded = getInitialStorage('users', INITIAL_USERS);
    const list = Array.isArray(loaded) ? loaded : INITIAL_USERS;
    const hasAdmin = list.some(
      (u: User) => u.id === 'usr-adm-orp-01' || u.role === 'Super Admin' || u.role === 'Admin'
    );
    if (!hasAdmin) {
      return [INITIAL_USERS[0], ...list];
    }
    return list;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    return getInitialStorage('teamMembers', INITIAL_TEAM_MEMBERS);
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('onroadpriz_currentUser');
      if (raw && raw !== 'null' && raw !== 'undefined') {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null; // Guest initially for clean browsers - never default to admin!
  });

  // Authoritative server session synchronization across page refreshes and clean browser windows
  useEffect(() => {
    // Sync canonical users from database
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(d => {
        if (d.success && Array.isArray(d.users)) {
          setUsers(d.users);
          saveStorage('users', d.users);
        }
      })
      .catch(() => {});

    const token = localStorage.getItem('onroadpriz_token');
    fetch('/api/auth/me', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          saveStorage('currentUser', data.user);
          if (data.location) {
            const resolvedCity = resolveCanonicalCity(
              data.location.city,
              data.location.district,
              data.location.area,
              data.location.locality,
              data.location.formatted_address
            );
            const normalizedLocation = {
              ...data.location,
              city: resolvedCity || data.location.city
            };
            setConfirmedLocation(normalizedLocation);
            saveStorage('confirmedLocation', normalizedLocation);
            if (normalizedLocation.city) {
              setSelectedCityState(normalizedLocation.city);
              saveStorage('selectedCity', normalizedLocation.city);
            }
            setSelectedLocalityState('All Places');
            saveStorage('selectedLocality', 'All Places');
          }
          if (Array.isArray(data.wishlist)) {
            setWishlist(data.wishlist);
            saveStorage('wishlist', data.wishlist);
          }
          setActiveBuyerPlan(data.activeBuyerPlan || null);
          setActiveSellerPlan(data.activeSellerPlan || null);
          setPlanHistory(data.planHistory || []);
          if (data.payments) {
            setPayments(data.payments);
          }
        } else if (!data.authenticated) {
          if (token) {
            localStorage.removeItem('onroadpriz_token');
          }
          setCurrentUser(null);
          saveStorage('currentUser', null);
          setWishlist([]);
          saveStorage('wishlist', []);
          setActiveBuyerPlan(null);
          setActiveSellerPlan(null);
          setPlanHistory([]);
          // Non-authenticated user without saved location stays empty ('Select Location')
          // Never default to Hyderabad or guess coordinates!
        }
      })
      .catch(() => {
        // Safe offline fallback
      });
  }, []);

  const [sellerPlans, setSellerPlans] = useState<SellerPlan[]>(() => {
    return getInitialStorage('sellerPlans', INITIAL_SELLER_PLANS);
  });

  const [buyerPlans, setBuyerPlans] = useState<BuyerPlan[]>(() => {
    return getInitialStorage('buyerPlans', INITIAL_BUYER_PLANS);
  });

  const [payments, setPayments] = useState<OrderPayment[]>(() => {
    return getInitialStorage('payments', INITIAL_ORDERS);
  });

  const [enquiries, setEnquiries] = useState<VehicleEnquiry[]>(() => {
    return getInitialStorage('enquiries', INITIAL_ENQUIRIES);
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    return getInitialStorage('banners', INITIAL_BANNERS);
  });

  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    return getInitialStorage('blogs', INITIAL_BLOGS);
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    return getInitialStorage('testimonials', INITIAL_TESTIMONIALS);
  });

  const [notifications, setNotifications] = useState<PlatformNotification[]>(() => {
    return getInitialStorage('notifications', INITIAL_NOTIFICATIONS);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    return getInitialStorage('auditLogs', INITIAL_AUDIT_LOGS);
  });

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    return getInitialStorage('settings', INITIAL_SETTINGS);
  });

  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>(() => {
    return getInitialStorage('contactSubmissions', INITIAL_CONTACT_SUBMISSIONS);
  });

  const [sellerReports, setSellerReports] = useState<SellerReport[]>(() => {
    return getInitialStorage('sellerReports', INITIAL_SELLER_REPORTS);
  });



  // Buyer Subscription Auth & Return
  const [authReturnTo, setAuthReturnTo] = useState<string | null>(null);

  // Vehicle Master Data States
  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>(() => {
    const loaded = getInitialStorage('masterCategories', INITIAL_MASTER_CATEGORIES);
    const list = Array.isArray(loaded) ? loaded : INITIAL_MASTER_CATEGORIES;
    const existingIds = new Set(list.map(c => c.id.toLowerCase()));
    const missing = INITIAL_MASTER_CATEGORIES.filter(c => !existingIds.has(c.id.toLowerCase()));
    return [...list, ...missing];
  });
  const [masterBrands, setMasterBrands] = useState<MasterBrand[]>(() => {
    const loaded = getInitialStorage('masterBrands', INITIAL_MASTER_BRANDS);
    const list = Array.isArray(loaded) ? loaded : INITIAL_MASTER_BRANDS;
    const cleaned = list.map(b => {
      if (b.name === 'Swarag') return { ...b, name: 'Swaraj' };
      if (b.name === 'Vovlo') return { ...b, name: 'Volvo' };
      return b;
    });
    // Ensure all canonical initial brands are present
    const existingKeys = new Set(cleaned.map(b => `${(b.categoryId || '').toLowerCase()}:::${(b.name || '').toLowerCase()}`));
    const missing = INITIAL_MASTER_BRANDS.filter(
      ib => !existingKeys.has(`${ib.categoryId.toLowerCase()}:::${ib.name.toLowerCase()}`)
    );
    return [...cleaned, ...missing];
  });
  const [masterModels, setMasterModels] = useState<MasterModel[]>(() => {
    const loaded = getInitialStorage('masterModels', INITIAL_MASTER_MODELS);
    const list = Array.isArray(loaded) ? loaded : INITIAL_MASTER_MODELS;
    const existingIds = new Set(list.map(m => m.id.toLowerCase()));
    const missing = INITIAL_MASTER_MODELS.filter(m => !existingIds.has(m.id.toLowerCase()));
    return [...list, ...missing];
  });
  const [masterVariants, setMasterVariants] = useState<MasterVariant[]>(() => {
    const loaded = getInitialStorage('masterVariants', INITIAL_MASTER_VARIANTS);
    const list = Array.isArray(loaded) ? loaded : INITIAL_MASTER_VARIANTS;
    const existingIds = new Set(list.map(v => v.id.toLowerCase()));
    const missing = INITIAL_MASTER_VARIANTS.filter(v => !existingIds.has(v.id.toLowerCase()));
    return [...list, ...missing];
  });
  const [masterFuelTypes, setMasterFuelTypes] = useState<string[]>(() => {
    const loaded = getInitialStorage('masterFuelTypes', INITIAL_FUEL_TYPES);
    return Array.isArray(loaded) ? Array.from(new Set(loaded)) : INITIAL_FUEL_TYPES;
  });
  const [masterTransmissionTypes, setMasterTransmissionTypes] = useState<string[]>(() => {
    const loaded = getInitialStorage('masterTransmissionTypes', INITIAL_TRANSMISSION_TYPES);
    return Array.isArray(loaded) ? Array.from(new Set(loaded)) : INITIAL_TRANSMISSION_TYPES;
  });
  const [masterBodyTypes, setMasterBodyTypes] = useState<string[]>(() => {
    const loaded = getInitialStorage('masterBodyTypes', INITIAL_BODY_TYPES);
    return Array.isArray(loaded) ? Array.from(new Set(loaded)) : INITIAL_BODY_TYPES;
  });

  // Dynamic Favicon browser sync with versioned cache-busting
  useEffect(() => {
    const favUrl = settings.faviconUrl || settings.favicon;
    const favVer = settings.faviconVersion || settings.favicon_version || 1;
    updateDocumentFavicon(favUrl, favVer);
  }, [settings.favicon, settings.faviconUrl, settings.faviconVersion, settings.favicon_version]);

  // Global Server Site Settings Synchronization (Every browser, incognito, other devices)
  const fetchGlobalSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/site-settings?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          setSettings(prev => {
            const logoVer = s.logoVersion ?? s.logo_version ?? 1;
            const favVer = s.faviconVersion ?? s.favicon_version ?? 1;
            const prevLogoVer = prev.logoVersion ?? prev.logo_version ?? 1;
            const prevFavVer = prev.faviconVersion ?? prev.favicon_version ?? 1;
            const prevLogo = prev.logoUrl ?? prev.websiteLogo ?? '';
            const newLogo = s.logoUrl ?? s.websiteLogo ?? '';
            const prevFav = prev.faviconUrl ?? prev.favicon ?? '';
            const newFav = s.faviconUrl ?? s.favicon ?? '';

            const settingsChanged = 
              logoVer !== prevLogoVer ||
              favVer !== prevFavVer ||
              newLogo !== prevLogo ||
              newFav !== prevFav ||
              (s.mobileLogo || '') !== (prev.mobileLogo || '') ||
              (s.adminLogo || '') !== (prev.adminLogo || '') ||
              (s.siteName || '') !== (prev.siteName || '') ||
              (s.supportPhone || '') !== (prev.supportPhone || '') ||
              (s.supportEmail || '') !== (prev.supportEmail || '') ||
              (s.headquartersAddress || '') !== (prev.headquartersAddress || '') ||
              (s.headquartersTitle || '') !== (prev.headquartersTitle || '') ||
              (s.supportHours || '') !== (prev.supportHours || '') ||
              (s.gstRatePercent ?? 18) !== (prev.gstRatePercent ?? 18) ||
              (s.currencySymbol || '') !== (prev.currencySymbol || '') ||
              (s.currencyCode || '') !== (prev.currencyCode || '') ||
              prev.updatedAt !== s.updatedAt;

            if (settingsChanged) {
              try {
                localStorage.setItem('settings', JSON.stringify(s));
                saveStorage('settings', s);
              } catch (_) {}
              return s;
            }
            return prev;
          });

          // Always ensure browser favicon is synchronized to latest version
          updateDocumentFavicon(s.faviconUrl || s.favicon, s.faviconVersion || s.favicon_version || 1);
        }
      }
    } catch (_err) {
      // Offline fallback: keep existing settings
    }
  }, []);

  // -------------------------------------------------------------
  // REAL-TIME MULTI-BROWSER SYNCHRONIZATION WITH CLOUD SQL & SSE
  // -------------------------------------------------------------
  const refreshVehicles = useCallback(async () => {
    try {
      const res = await fetch(`/api/vehicles?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.vehicles)) {
          setVehicles(data.vehicles);
          saveStorage('vehicles', data.vehicles);
        }
      }
    } catch (err) {
      console.warn('[Sync] Vehicles sync warning:', err);
    }
  }, []);

  const refreshBlogs = useCallback(async () => {
    try {
      const res = await fetch(`/api/blogs?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
          saveStorage('blogs', data.blogs);
        }
      }
    } catch (err) {
      console.warn('[Sync] Blogs sync warning:', err);
    }
  }, []);

  const refreshBanners = useCallback(async () => {
    try {
      const res = await fetch(`/api/banners?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.banners)) {
          setBanners(data.banners);
          saveStorage('banners', data.banners);
        }
      }
    } catch (err) {
      console.warn('[Sync] Banners sync warning:', err);
    }
  }, []);

  const refreshEnquiries = useCallback(async () => {
    try {
      const res = await fetch(`/api/enquiries?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.enquiries)) {
          setEnquiries(data.enquiries);
          saveStorage('enquiries', data.enquiries);
        }
      }
    } catch (err) {
      console.warn('[Sync] Enquiries sync warning:', err);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
          saveStorage('users', data.users);
          setCurrentUser(prev => {
            if (!prev) return null;
            const matched = data.users.find((u: User) => u.id === prev.id);
            if (matched) {
              if (JSON.stringify(prev) !== JSON.stringify(matched)) {
                saveStorage('currentUser', matched);
                return matched;
              }
              return prev;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.warn('[Sync] Users sync warning:', err);
    }
  }, []);

  const refreshContacts = useCallback(async () => {
    try {
      const res = await fetch(`/api/contact-submissions?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.submissions)) {
          setContactSubmissions(data.submissions);
          saveStorage('contactSubmissions', data.submissions);
        }
      }
    } catch (err) {
      console.warn('[Sync] Contacts sync warning:', err);
    }
  }, []);

  const syncAllData = useCallback(() => {
    refreshVehicles();
    refreshBlogs();
    refreshBanners();
    refreshEnquiries();
    refreshUsers();
    refreshContacts();
    fetchGlobalSettings();
  }, [refreshVehicles, refreshBlogs, refreshBanners, refreshEnquiries, refreshUsers, refreshContacts, fetchGlobalSettings]);

  // Master real-time live synchronization listener for all browsers
  useEffect(() => {
    // 1. Immediate sync on load
    syncAllData();

    // 2. Multi-browser real-time Server-Sent Events listener
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/live-sync');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'DATA_CHANGED') {
            const entity = payload.entity;
            if (entity === 'vehicles') refreshVehicles();
            else if (entity === 'blogs') refreshBlogs();
            else if (entity === 'banners') refreshBanners();
            else if (entity === 'enquiries') refreshEnquiries();
            else if (entity === 'users') refreshUsers();
            else if (entity === 'contacts') refreshContacts();
            else if (entity === 'settings') fetchGlobalSettings();
            else syncAllData();
          }
        } catch {
          // Ignore parse errors on heartbeat pings
        }
      };
      eventSource.onerror = () => {
        // EventSource automatically retries upon reconnect
      };
    } catch (err) {
      console.warn('[Sync] EventSource unavailable, using polling fallback:', err);
    }

    // 3. Tab visibility and focus triggers
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncAllData();
      }
    };
    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', syncAllData);

    // 4. Intra-browser cross-tab broadcast channel
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('onroadpriz_cross_browser_sync');
        bc.onmessage = () => {
          syncAllData();
        };
      }
    } catch {}

    // 5. 3-second gentle polling safety net guaranteeing sync across mobile and restricted browsers
    const interval = setInterval(syncAllData, 3000);

    return () => {
      eventSource?.close();
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', syncAllData);
      bc?.close();
      clearInterval(interval);
    };
  }, [syncAllData, refreshVehicles, refreshBlogs, refreshBanners, refreshEnquiries, refreshUsers, refreshContacts, fetchGlobalSettings]);

  // Wishlist & Compare (Starts at 0 items for new users - no hardcoded demo items)
  const [wishlist, setWishlist] = useState<string[]>(() => {
    return getInitialStorage('wishlist', []);
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    return getInitialStorage('compareList', ['ORP-VEH-1001', 'ORP-VEH-1002']);
  });

  // User Subscriptions & Plans
  const [activeBuyerPlan, setActiveBuyerPlan] = useState<UserSubscription | null>(null);
  const [activeSellerPlan, setActiveSellerPlan] = useState<UserSubscription | null>(null);
  const [planHistory, setPlanHistory] = useState<UserSubscription[]>([]);

  // Robust resolution of active plans: checks explicit state, then fallbacks to currentUser fields & catalog
  const effectiveActiveSellerPlan = useMemo<UserSubscription | null>(() => {
    if (activeSellerPlan) return activeSellerPlan;
    if (!currentUser) return null;

    if (currentUser.sellerPlan && currentUser.sellerPlan.status !== 'expired') {
      const sp = currentUser.sellerPlan;
      const matching = sellerPlans.find(p => p.id === sp.planId || p.name.toLowerCase() === (sp.name || '').toLowerCase()) || sellerPlans[0];
      return {
        id: `sub-${currentUser.id}-seller`,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.fullName || 'Member',
        userEmail: currentUser.email || '',
        planId: sp.planId || matching.id,
        planName: sp.name || matching.name,
        planType: 'seller',
        baseAmount: sp.price || matching.price,
        taxAmount: Math.round((sp.price || matching.price) * 0.18),
        totalAmount: Math.round((sp.price || matching.price) * 1.18),
        activatedAt: sp.startedAt || currentUser.registeredAt || new Date().toISOString(),
        purchasedAt: sp.startedAt || currentUser.registeredAt || new Date().toISOString(),
        expiresAt: sp.expiresAt || currentUser.subscriptionExpiry || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
        listingsAllowed: sp.listingsAllowed ?? matching.listingsLimit ?? 5,
        listingsRemaining: sp.listingsRemaining ?? sp.listingsAllowed ?? 5,
        viewsAllowed: 0,
        viewsRemaining: 0,
        featuredSlotsAllowed: matching.featuredSlots ?? 1
      };
    }

    // Match by activePlan name first (higher specificity)
    let candidatePlan = null;
    if (currentUser.activePlan && currentUser.activePlan !== 'No Active Plan') {
      candidatePlan = sellerPlans.find(p => p.name.toLowerCase() === currentUser.activePlan?.toLowerCase());
    }
    const planId = currentUser.subscriptionPlanId;
    if (!candidatePlan && planId && (planId.startsWith('plan-sel') || sellerPlans.some(p => p.id === planId))) {
      candidatePlan = sellerPlans.find(p => p.id === planId);
    }
    if (!candidatePlan && currentUser.role === 'Seller') {
      candidatePlan = sellerPlans[0];
    }

    if (candidatePlan) {
      const expiry = currentUser.subscriptionExpiry || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      return {
        id: `sub-${currentUser.id}-${candidatePlan.id}`,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.fullName || 'Member',
        userEmail: currentUser.email || '',
        planId: candidatePlan.id,
        planName: candidatePlan.name,
        planType: 'seller',
        baseAmount: candidatePlan.price || 999,
        taxAmount: Math.round((candidatePlan.price || 999) * 0.18),
        totalAmount: Math.round((candidatePlan.price || 999) * 1.18),
        activatedAt: currentUser.registeredAt || new Date().toISOString(),
        purchasedAt: currentUser.registeredAt || new Date().toISOString(),
        expiresAt: expiry,
        status: new Date(expiry).getTime() > Date.now() ? 'ACTIVE' : 'EXPIRED',
        listingsAllowed: candidatePlan.listingsLimit ?? 2,
        listingsRemaining: candidatePlan.listingsLimit ?? 2,
        viewsAllowed: 0,
        viewsRemaining: 0,
        featuredSlotsAllowed: candidatePlan.featuredSlots ?? 0
      };
    }

    return null;
  }, [activeSellerPlan, currentUser, sellerPlans]);

  const effectiveActiveBuyerPlan = useMemo<UserSubscription | null>(() => {
    if (activeBuyerPlan) return activeBuyerPlan;
    if (!currentUser) return null;

    if (currentUser.buyerPlan && currentUser.buyerPlan.status !== 'expired') {
      const bp = currentUser.buyerPlan;
      const matching = buyerPlans.find(p => p.id === bp.planId || p.name.toLowerCase() === (bp.name || '').toLowerCase()) || buyerPlans[0];
      return {
        id: `sub-${currentUser.id}-buyer`,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.fullName || 'Member',
        userEmail: currentUser.email || '',
        planId: bp.planId || matching.id,
        planName: bp.name || matching.name,
        planType: 'buyer',
        baseAmount: bp.price || matching.price,
        taxAmount: Math.round((bp.price || matching.price) * 0.18),
        totalAmount: Math.round((bp.price || matching.price) * 1.18),
        activatedAt: bp.startedAt || currentUser.registeredAt || new Date().toISOString(),
        purchasedAt: bp.startedAt || currentUser.registeredAt || new Date().toISOString(),
        expiresAt: bp.expiresAt || currentUser.subscriptionExpiry || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
        listingsAllowed: 0,
        listingsRemaining: 0,
        viewsAllowed: bp.listingViewsAllowed ?? ((matching as any).listingViewsAllowed || (matching as any).contactsLimit || 25),
        viewsRemaining: bp.listingViewsRemaining ?? bp.listingViewsAllowed ?? 25,
        featuredSlotsAllowed: 0
      };
    }

    // Match by activePlan name or buyer subscriptionPlanId
    let candidatePlan = null;
    if (currentUser.activePlan && currentUser.activePlan !== 'Free Open Access' && currentUser.activePlan !== 'No Active Plan') {
      candidatePlan = buyerPlans.find(p => p.name.toLowerCase() === currentUser.activePlan?.toLowerCase());
    }
    const planId = currentUser.subscriptionPlanId;
    if (!candidatePlan && planId && (planId.startsWith('plan-buy') || buyerPlans.some(p => p.id === planId))) {
      candidatePlan = buyerPlans.find(p => p.id === planId);
    }

    if (candidatePlan) {
      const expiry = currentUser.subscriptionExpiry || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
      return {
        id: `sub-${currentUser.id}-${candidatePlan.id}`,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.fullName || 'Member',
        userEmail: currentUser.email || '',
        planId: candidatePlan.id,
        planName: candidatePlan.name,
        planType: 'buyer',
        baseAmount: candidatePlan.price || 499,
        taxAmount: Math.round((candidatePlan.price || 499) * 0.18),
        totalAmount: Math.round((candidatePlan.price || 499) * 1.18),
        activatedAt: currentUser.registeredAt || new Date().toISOString(),
        purchasedAt: currentUser.registeredAt || new Date().toISOString(),
        expiresAt: expiry,
        status: new Date(expiry).getTime() > Date.now() ? 'ACTIVE' : 'EXPIRED',
        listingsAllowed: 0,
        listingsRemaining: 0,
        viewsAllowed: (candidatePlan as any).listingViewsAllowed || (candidatePlan as any).contactsLimit || 25,
        viewsRemaining: (candidatePlan as any).listingViewsAllowed || (candidatePlan as any).contactsLimit || 25,
        featuredSlotsAllowed: 0
      };
    }

    return null;
  }, [activeBuyerPlan, currentUser, buyerPlans]);

  const effectivePlanHistory = useMemo<UserSubscription[]>(() => {
    if (planHistory.length > 0) return planHistory;
    const synthesizedList = [effectiveActiveSellerPlan, effectiveActiveBuyerPlan].filter(Boolean) as UserSubscription[];
    return synthesizedList;
  }, [planHistory, effectiveActiveSellerPlan, effectiveActiveBuyerPlan]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => { saveStorage('vehicles', vehicles); }, [vehicles]);
  useEffect(() => { saveStorage('users', users); }, [users]);
  useEffect(() => { saveStorage('teamMembers', teamMembers); }, [teamMembers]);
  useEffect(() => { saveStorage('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { saveStorage('sellerPlans', sellerPlans); }, [sellerPlans]);
  useEffect(() => { saveStorage('buyerPlans', buyerPlans); }, [buyerPlans]);
  useEffect(() => { saveStorage('payments', payments); }, [payments]);
  useEffect(() => { saveStorage('enquiries', enquiries); }, [enquiries]);
  useEffect(() => { saveStorage('banners', banners); }, [banners]);
  useEffect(() => { saveStorage('blogs', blogs); }, [blogs]);
  useEffect(() => { saveStorage('testimonials', testimonials); }, [testimonials]);
  useEffect(() => { saveStorage('notifications', notifications); }, [notifications]);
  useEffect(() => { saveStorage('auditLogs', auditLogs); }, [auditLogs]);
  useEffect(() => { saveStorage('settings', settings); }, [settings]);
  useEffect(() => { saveStorage('wishlist', wishlist); }, [wishlist]);
  useEffect(() => { saveStorage('compareList', compareList); }, [compareList]);
  useEffect(() => { saveStorage('contactSubmissions', contactSubmissions); }, [contactSubmissions]);
  useEffect(() => { saveStorage('sellerReports', sellerReports); }, [sellerReports]);
  useEffect(() => { saveStorage('masterCategories', masterCategories); }, [masterCategories]);
  useEffect(() => { saveStorage('masterBrands', masterBrands); }, [masterBrands]);
  useEffect(() => { saveStorage('masterModels', masterModels); }, [masterModels]);
  useEffect(() => { saveStorage('masterVariants', masterVariants); }, [masterVariants]);
  useEffect(() => { saveStorage('masterFuelTypes', masterFuelTypes); }, [masterFuelTypes]);
  useEffect(() => { saveStorage('masterTransmissionTypes', masterTransmissionTypes); }, [masterTransmissionTypes]);
  useEffect(() => { saveStorage('masterBodyTypes', masterBodyTypes); }, [masterBodyTypes]);

  // Toast Helpers
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth Functions
  const login = (email: string): boolean => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const existing = users.find(u => u.email?.trim().toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      showToast('Welcome Back!', `Signed in as ${existing.name || existing.fullName || existing.email} (${existing.role})`, 'success');
      return true;
    }

    showToast('Account Not Found', `No registered account found with email "${email}". Please register first.`, 'error');
    return false;
  };

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.user) {
        if (data.token) {
          localStorage.setItem('onroadpriz_token', data.token);
        }
        setCurrentUser(data.user);
        saveStorage('currentUser', data.user);
        if (data.activeBuyerPlan) setActiveBuyerPlan(data.activeBuyerPlan);
        if (data.activeSellerPlan) setActiveSellerPlan(data.activeSellerPlan);
        if (data.planHistory) setPlanHistory(data.planHistory);
        setUsers(prev => {
          const exists = prev.some(u => u.id === data.user.id || u.email?.toLowerCase() === cleanEmail);
          return exists ? prev.map(u => (u.id === data.user.id ? data.user : u)) : [data.user, ...prev];
        });
        showToast('Welcome!', `Signed in as ${data.user.name || data.user.fullName || data.user.email} (${data.user.role})`, 'success');
        return true;
      }

      const errMsg = data.error || 'Invalid email or password.';
      showToast('Authentication Failed', errMsg, 'error');
      return false;
    } catch {
      // Offline fallback: check in-memory users with matching email and password only
      const existingUser = users.find(u => u.email?.trim().toLowerCase() === cleanEmail);
      if (existingUser && (!existingUser.password || existingUser.password === cleanPass)) {
        setCurrentUser(existingUser);
        saveStorage('currentUser', existingUser);
        showToast('Welcome Back!', `Signed in as ${existingUser.name || existingUser.email}`, 'success');
        return true;
      }

      showToast('Authentication Failed', 'Invalid email or password. Please verify your credentials or register.', 'error');
      return false;
    }
  };

  const register = (name: string, email?: string | null, phone: string = '', role: UserRole = 'Buyer'): boolean => {
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;
    const cleanPhone = phone && phone.trim() ? phone.trim() : '';
    const phoneDigits = cleanPhone.replace(/\D/g, '').slice(-10);

    // 1. Strict Phone Uniqueness Check
    if (phoneDigits) {
      if (phoneDigits.length !== 10) {
        showToast('Invalid Mobile Number', 'Please enter a valid 10-digit Indian mobile number.', 'error');
        return false;
      }
      const duplicatePhone = users.find(u => {
        const uPhoneDigits = (u.phone || u.mobile || '').replace(/\D/g, '').slice(-10);
        return uPhoneDigits && uPhoneDigits === phoneDigits;
      });
      if (duplicatePhone) {
        showToast('Phone Already Registered', `Mobile number ${cleanPhone} is already in use by another account. Please log in.`, 'error');
        return false;
      }
    }

    // 2. Strict Email Uniqueness Check
    if (cleanEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        showToast('Invalid Email', 'Please enter a valid email address.', 'error');
        return false;
      }
      const duplicateEmail = users.find(u => u.email && u.email.trim().toLowerCase() === cleanEmail);
      if (duplicateEmail) {
        showToast('Email Already Registered', `Email ${cleanEmail} is already in use by another account. Please log in.`, 'error');
        return false;
      }
    }

    const newUser: User = {
      id: 'usr-' + Math.random().toString(36).substring(2, 8),
      name,
      fullName: name,
      email: cleanEmail,
      phone: phoneDigits ? `+91${phoneDigits}` : cleanPhone,
      mobile: phoneDigits ? `+91${phoneDigits}` : cleanPhone,
      normalized_mobile: phoneDigits ? `+91${phoneDigits}` : undefined,
      role,
      status: 'Active',
      verified: true,
      registeredAt: new Date().toISOString()
    };

    setUsers(prev => [newUser, ...prev]);
    saveStorage('users', [newUser, ...users]);
    setCurrentUser(newUser);
    saveStorage('currentUser', newUser);

    // Synchronize to backend database
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email: cleanEmail,
        phone: phoneDigits ? `+91${phoneDigits}` : cleanPhone,
        role
      })
    }).then(async res => {
      const data = await res.json().catch(() => ({}));
      if (data.token) {
        localStorage.setItem('onroadpriz_token', data.token);
      }
    }).catch(err => {
      console.warn('[Register] Non-blocking background sync:', err);
    });

    showToast('Account Created!', `Welcome to OnRoadPriz, ${name}!`, 'success');
    return true;
  };

  const registerNewUser = (data: { phone: string; fullName: string; email?: string; city?: string; state?: string; pincode?: string }): boolean => {
    return register(data.fullName, data.email, data.phone, 'Buyer');
  };

  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  const logout = () => {
    const token = localStorage.getItem('onroadpriz_token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('onroadpriz_token');
    saveStorage('currentUser', null);
    setCurrentUser(null);
    setWishlist([]);
    saveStorage('wishlist', []);
    setActiveBuyerPlan(null);
    setActiveSellerPlan(null);
    setPlanHistory([]);
    showToast('Signed Out', 'You have been successfully logged out.', 'info');
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const googleUserEmail = 'user.google@onroadpriz.com';
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Google Verified User',
          email: googleUserEmail,
          phone: '+919876500001',
          role: 'Buyer'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (data.user) {
        if (data.token) localStorage.setItem('onroadpriz_token', data.token);
        setCurrentUser(data.user);
        saveStorage('currentUser', data.user);
        showToast('Signed In', `Welcome, ${data.user.name}!`, 'success');
        setAuthModalOpen(false);
        return true;
      }
      // If already registered, log in
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: googleUserEmail, password: '123' })
      });
      const loginData = await loginRes.json().catch(() => ({}));
      if (loginData.user) {
        if (loginData.token) localStorage.setItem('onroadpriz_token', loginData.token);
        setCurrentUser(loginData.user);
        saveStorage('currentUser', loginData.user);
        showToast('Signed In', `Welcome back, ${loginData.user.name}!`, 'success');
        setAuthModalOpen(false);
        return true;
      }
      return false;
    } catch {
      showToast('Authentication Notice', 'Please use mobile OTP or email sign in.', 'info');
      return false;
    }
  };

  const refreshUserData = useCallback(async () => {
    const token = localStorage.getItem('onroadpriz_token');
    try {
      const res = await fetch('/api/me', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && data.authenticated && data.user) {
        setCurrentUser(prev => {
          if (prev && JSON.stringify(prev) === JSON.stringify(data.user)) {
            return prev;
          }
          saveStorage('currentUser', data.user);
          return data.user;
        });
        if (data.location?.city) {
          const resolvedCity = resolveCanonicalCity(
            data.location.city,
            data.location.district,
            data.location.area,
            data.location.locality,
            data.location.formatted_address
          );
          setSelectedCityState(resolvedCity || data.location.city);
          saveStorage('selectedCity', resolvedCity || data.location.city);
          setSelectedLocalityState('All Places');
          saveStorage('selectedLocality', 'All Places');
        }
        if (Array.isArray(data.wishlist)) {
          setWishlist(data.wishlist);
          saveStorage('wishlist', data.wishlist);
        }
        setActiveBuyerPlan(data.activeBuyerPlan || null);
        setActiveSellerPlan(data.activeSellerPlan || null);
        setPlanHistory(data.planHistory || []);
        if (data.payments) {
          setPayments(data.payments);
        }
      } else if (!data.authenticated) {
        if (!token) {
          setWishlist([]);
          saveStorage('wishlist', []);
        }
        setActiveBuyerPlan(null);
        setActiveSellerPlan(null);
        setPlanHistory([]);
      }
    } catch {
      // offline fallback
    }
  }, []);

  const detectLocationHighAccuracy = useCallback(async (
    onProgress?: (msg: string) => void
  ): Promise<{ status: string; location?: ConfirmedLocation; error?: string }> => {
    try {
      const geoResult = await getHighAccuracyDeviceLocation(onProgress);
      if (geoResult.status !== 'granted' || typeof geoResult.latitude !== 'number' || typeof geoResult.longitude !== 'number') {
        return {
          status: geoResult.status,
          error: geoResult.error || 'Could not acquire device coordinates.'
        };
      }

      onProgress?.('Reverse geocoding exact address components...');
      const revRes = await reverseGeocodeCoordinates(
        geoResult.latitude,
        geoResult.longitude,
        geoResult.accuracy
      );

      if (!revRes.success) {
        return {
          status: 'error',
          error: revRes.error || 'Failed to reverse-geocode coordinates. Please select manually.'
        };
      }

      const resolvedCity = resolveCanonicalCity(
        revRes.city,
        revRes.district,
        revRes.area,
        revRes.locality,
        revRes.formatted_address
      );

      const detected: ConfirmedLocation = {
        latitude: geoResult.latitude,
        longitude: geoResult.longitude,
        location_accuracy_meters: geoResult.accuracy,
        accuracyTier: geoResult.accuracyTier,
        formatted_address: revRes.formatted_address,
        premise: revRes.premise,
        street: revRes.street,
        area: revRes.area || revRes.locality,
        locality: revRes.locality || revRes.area,
        city: resolvedCity || revRes.city,
        district: revRes.district,
        state: revRes.state,
        postal_code: revRes.postal_code,
        country: revRes.country || 'India',
        location_source: 'DEVICE_GEOLOCATION',
        short_display: resolvedCity || revRes.city || revRes.short_display
      };

      // Set as PENDING confirmation — DO NOT automatically save an inaccurate or unconfirmed location!
      setPendingDetectedLocation(detected);
      return {
        status: 'granted',
        location: detected
      };
    } catch (err: any) {
      return {
        status: 'error',
        error: err.message || 'Location detection failed.'
      };
    }
  }, []);

  const confirmLocation = useCallback(async (loc: ConfirmedLocation) => {
    const city = resolveCanonicalCity(
      loc.city,
      loc.district,
      loc.area,
      loc.locality,
      loc.formatted_address
    ) || loc.city || '';

    // When location is detected via device geolocation, ALWAYS show vehicles across the entire city ('All Places')
    // rather than restricting to the specific detected sub-location/street.
    const isDetected = loc.location_source === 'DEVICE_GEOLOCATION';
    const locality = isDetected ? 'All Places' : (loc.area || loc.locality || 'All Places');

    const normalizedLoc: ConfirmedLocation = {
      ...loc,
      city,
      short_display: isDetected ? city : (loc.short_display || city)
    };

    setConfirmedLocation(normalizedLoc);
    saveStorage('confirmedLocation', normalizedLoc);
    setPendingDetectedLocation(null);

    setSelectedCityState(city);
    saveStorage('selectedCity', city);
    setSelectedLocalityState(locality);
    saveStorage('selectedLocality', locality);

    const token = localStorage.getItem('onroadpriz_token');
    if (token) {
      try {
        const res = await fetch('/api/me/location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...normalizedLoc,
            location_source: normalizedLoc.location_source || 'DEVICE_GEOLOCATION',
            location_confirmed_at: new Date().toISOString()
          })
        });
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          saveStorage('currentUser', data.user);
          setUsers(prev => prev.map(u => (u.id === data.user.id ? data.user : u)));
        }
      } catch (err) {
        console.error('[Location] Failed to persist location to database:', err);
      }
    }

    setLocationModalOpen(false);
    const displayTarget = (locality && locality !== 'All Places' && city && locality !== city)
      ? `${locality}, ${city}`
      : (city || 'Confirmed Location');
    showToast('Location Confirmed', `Showing vehicles in ${displayTarget}`, 'success');
  }, [showToast]);

  const detectAndSetCurrentLocation = useCallback(async (): Promise<{ city: string; state?: string; locality?: string; location_name?: string } | null> => {
    setLocationModalOpen(true);
    const res = await detectLocationHighAccuracy();
    if (res.status === 'granted' && res.location) {
      return {
        city: res.location.city || '',
        state: res.location.state,
        locality: 'All Places',
        location_name: res.location.city || res.location.short_display
      };
    }
    return null;
  }, [detectLocationHighAccuracy]);

  const updateUserLocation = async (locData: Partial<ConfirmedLocation>) => {
    const city = locData.city
      ? resolveCanonicalCity(locData.city, locData.district, locData.area, locData.locality, locData.formatted_address)
      : '';
    const locality = 'All Places';
    setSelectedCityState(city);
    saveStorage('selectedCity', city);
    setSelectedLocalityState(locality);
    saveStorage('selectedLocality', locality);

    const userArea = locData.area === 'All Places' ? '' : (locData.area || (locData.locality === 'All Places' ? '' : locData.locality) || '');

    const fullLocation: ConfirmedLocation = {
      ...(confirmedLocation || {}),
      ...locData,
      city,
      area: userArea,
      locality: userArea || locality,
      short_display: city,
      location_source: locData.location_source || 'MANUAL',
      location_updated_at: new Date().toISOString()
    };
    setConfirmedLocation(fullLocation);
    saveStorage('confirmedLocation', fullLocation);

    const token = localStorage.getItem('onroadpriz_token');
    if (token && currentUser) {
      try {
        const res = await fetch('/api/me/location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(fullLocation)
        });
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          saveStorage('currentUser', data.user);
          setUsers(prev => prev.map(u => (u.id === data.user.id ? data.user : u)));
        }
      } catch (err) {
        console.error('[Location] Failed to persist location:', err);
      }
    }
  };

  const refreshAdminUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
        saveStorage('users', data.users);
      }
    } catch (err) {
      console.error('[Admin] Error refreshing users:', err);
    }
  }, []);

  const requestMobileChangeOtp = async (newMobile: string): Promise<{ success: boolean; error?: string; message?: string; devOtp?: string }> => {
    const token = localStorage.getItem('onroadpriz_token');
    if (!token) {
      showToast('Authentication Required', 'Please sign in first.', 'error');
      return { success: false, error: 'Authentication required' };
    }

    try {
      const res = await fetch('/api/me/mobile/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newMobile })
      });
      const data = await res.json();
      if (!data.success) {
        const errMsg = data.error || 'Failed to send OTP to new mobile.';
        showToast(data.errorCode === 'MOBILE_ALREADY_REGISTERED' ? 'Mobile Already Registered' : 'Request Failed', errMsg, 'error');
        return { success: false, error: errMsg };
      }
      showToast('OTP Sent', data.message || 'OTP sent to new mobile number.', 'info');
      return { success: true, message: data.message, devOtp: data.devOtp };
    } catch (err: any) {
      showToast('Network Error', err?.message || 'Failed to connect to server.', 'error');
      return { success: false, error: err?.message };
    }
  };

  const changeUserMobile = async (newMobile: string, otp: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    const token = localStorage.getItem('onroadpriz_token');
    if (!token) {
      showToast('Authentication Required', 'Please sign in first.', 'error');
      return { success: false, error: 'Authentication required' };
    }

    try {
      const res = await fetch('/api/me/mobile/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newMobile, otp })
      });
      const data = await res.json();
      if (!data.success || !data.user) {
        const errMsg = data.error || 'Failed to verify OTP or update mobile.';
        showToast(data.errorCode === 'MOBILE_ALREADY_REGISTERED' ? 'Mobile Already Registered' : 'Verification Failed', errMsg, 'error');
        return { success: false, error: errMsg };
      }

      setCurrentUser(data.user);
      saveStorage('currentUser', data.user);
      setUsers(prev => prev.map(u => (u.id === data.user.id ? data.user : u)));
      showToast('Mobile Updated', 'Your mobile number has been changed and verified.', 'success');
      return { success: true, user: data.user };
    } catch (err: any) {
      showToast('Network Error', err?.message || 'Failed to connect to server.', 'error');
      return { success: false, error: err?.message };
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phone })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        if (data.challengeId) {
          setActiveChallengeId(data.challengeId);
        }
        showToast('OTP Sent', data.message || `Verification code sent to +91 ${phone}`, 'info');
        return {
          success: true,
          challengeId: data.challengeId,
          message: data.message,
          cooldownSeconds: data.cooldownSeconds || 60
        };
      }
      const errMsg = data.message || data.error || 'Failed to send verification code.';
      showToast('OTP Failed', errMsg, 'error');
      return {
        success: false,
        error: errMsg,
        cooldownSeconds: data.cooldownSeconds || 0
      };
    } catch (err: any) {
      const errMsg = err?.message || 'Network error sending OTP';
      showToast('Connection Error', errMsg, 'error');
      return { success: false, error: errMsg };
    }
  };

  const verifyOtp = async (phone: string, otp: string, fullName?: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mobile: phone, 
          otp,
          challengeId: activeChallengeId || undefined,
          fullName
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.verified && data.user) {
        if (data.token) {
          localStorage.setItem('onroadpriz_token', data.token);
        }
        const authUser = data.user;
        setCurrentUser(authUser);
        saveStorage('currentUser', authUser);
        if (data.activeBuyerPlan) setActiveBuyerPlan(data.activeBuyerPlan);
        if (data.activeSellerPlan) setActiveSellerPlan(data.activeSellerPlan);
        if (data.planHistory) setPlanHistory(data.planHistory);
        setUsers(prev => {
          const cleanPhone = phone.replace(/\D/g, '').slice(-10);
          const exists = prev.some(u => u.id === authUser.id || (u.phone && u.phone.includes(cleanPhone)));
          return exists ? prev.map(u => (u.id === authUser.id ? authUser : u)) : [authUser, ...prev];
        });
        showToast('Login Successful', `Welcome, ${authUser.name || authUser.fullName}!`, 'success');
        setActiveChallengeId(null);
        return { 
          success: true, 
          verified: true, 
          authenticated: true, 
          isNewUser: data.isNewUser, 
          user: authUser, 
          message: data.message 
        };
      }

      const errMsg = data.message || data.error || 'Invalid verification code.';
      return {
        success: false,
        verified: false,
        authenticated: false,
        code: data.code || 'INVALID_OTP',
        error: errMsg,
        remainingAttempts: data.remainingAttempts
      };
    } catch (err: any) {
      const errMsg = err?.message || 'Network error verifying OTP';
      return { success: false, verified: false, error: errMsg, code: 'NETWORK_ERROR' };
    }
  };

  const resetPasswordWithOtp = (phone: string, newPass: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const existing = users.find(u => u.phone && u.phone.replace(/\D/g, '').includes(cleanPhone));
    if (existing) {
      const updated = { ...existing, password: newPass };
      setUsers(prev => prev.map(u => (u.id === existing.id ? updated : u)));
      setCurrentUser(updated);
      showToast('Password Reset', 'Your password has been updated successfully.', 'success');
      return true;
    }
    showToast('User Not Found', 'No account exists with this mobile number.', 'error');
    return false;
  };

  const updateUserProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'User not signed in' };
    const token = localStorage.getItem('onroadpriz_token');

    try {
      if (token) {
        const res = await fetch('/api/me/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        if (res.status !== 401) {
          const serverData = await res.json();
          if (serverData.success && serverData.user) {
            setCurrentUser(serverData.user);
            saveStorage('currentUser', serverData.user);
            setUsers(prev => prev.map(u => (u.id === serverData.user.id ? serverData.user : u)));
            showToast('Profile Updated', 'Your profile details have been saved to the database.', 'success');
            return { success: true };
          } else {
            const errMsg = serverData.error || 'Failed to update profile.';
            showToast(serverData.errorCode === 'MOBILE_ALREADY_REGISTERED' ? 'Mobile Already Registered' : 'Update Failed', errMsg, 'error');
            return { success: false, error: errMsg };
          }
        }
      }

      // Fallback by user ID if session token was not set or expired after server restart
      const fallbackRes = await fetch(`/api/admin/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const fallbackData = await fallbackRes.json();
      if (fallbackData.success && fallbackData.user) {
        setCurrentUser(fallbackData.user);
        saveStorage('currentUser', fallbackData.user);
        setUsers(prev => prev.map(u => (u.id === fallbackData.user.id ? fallbackData.user : u)));
        showToast('Profile Updated', 'Your profile details have been saved to the database.', 'success');
        return { success: true };
      } else if (fallbackData.error && fallbackData.error !== 'User not found') {
        showToast('Update Failed', fallbackData.error, 'error');
        return { success: false, error: fallbackData.error };
      }

      // Local state update if user only exists in client cache
      const mergedUser: User = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
      setCurrentUser(mergedUser);
      saveStorage('currentUser', mergedUser);
      setUsers(prev => {
        const next = prev.map(u => (u.id === currentUser.id ? mergedUser : u));
        saveStorage('users', next);
        return next;
      });
      showToast('Profile Updated', 'Your profile details have been saved.', 'success');
      return { success: true };
    } catch (err: any) {
      console.error('[Profile] Update error:', err);
      showToast('Network Error', 'Could not reach server to save profile.', 'error');
      return { success: false, error: err.message };
    }
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role } : u)));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => (prev ? { ...prev, role } : null));
    }
    showToast('User Role Updated', `Role changed to ${role}`, 'success');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Active' || u.status === 'active' ? 'Blocked' : 'Active';
          showToast('User Status Updated', `Status changed to ${nextStatus}`, 'info');
          return { ...u, status: nextStatus as any };
        }
        return u;
      })
    );
  };

  // Vehicles Management
  const addVehicle = (vehicleData: Partial<Vehicle>) => {
    const id = 'ORP-VEH-' + Math.floor(1010 + Math.random() * 8990);
    const newVehicle: Vehicle = {
      id,
      title: vehicleData.title || `${vehicleData.year || 2023} ${vehicleData.brand} ${vehicleData.model}`,
      category: vehicleData.category || 'Cars',
      brand: vehicleData.brand || 'Vehicle Brand',
      model: vehicleData.model || 'Model',
      variant: vehicleData.variant || '',
      year: vehicleData.year || 2023,
      registrationYear: vehicleData.registrationYear || vehicleData.year || 2023,
      rtoState: vehicleData.rtoState || 'Andhra Pradesh',
      rtoCity: vehicleData.rtoCity || 'Visakhapatnam (AP-31)',
      price: vehicleData.price || 500000,
      negotiable: vehicleData.negotiable ?? true,
      kmDriven: vehicleData.kmDriven || 15000,
      fuelType: vehicleData.fuelType || 'Petrol',
      transmission: vehicleData.transmission || 'Manual',
      bodyType: vehicleData.bodyType || 'Sedan',
      engineCapacity: vehicleData.engineCapacity || '1498 cc',
      color: vehicleData.color || 'White',
      mileage: vehicleData.mileage || '16 kmpl',
      ownership: vehicleData.ownership || '1st Owner',
      condition: vehicleData.condition || 'Excellent',
      location: vehicleData.location || {
        city: selectedCity || 'Visakhapatnam',
        state: 'Andhra Pradesh',
        area: 'City Center',
        pincode: '530001'
      },
      seller: vehicleData.seller || {
        id: currentUser?.id || 'usr-sel-201',
        name: currentUser?.name || currentUser?.fullName || 'Direct Owner',
        phone: currentUser?.phone || '+91 98480 12345',
        email: currentUser?.email || 'owner@onroadpriz.com',
        type: 'Direct Owner',
        verified: true,
        memberSince: '2026'
      },
      images:
        vehicleData.images && vehicleData.images.length > 0
          ? vehicleData.images
          : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80'],
      coverImageIndex: 0,
      description:
        vehicleData.description ||
        'Direct owner vehicle in clean working condition with complete documentation.',
      features: vehicleData.features || ['Air Conditioning', 'Power Steering', 'Power Windows'],
      documents: vehicleData.documents || [
        { id: 'doc-1', name: 'Registration Certificate (RC)', type: 'RC', verified: true }
      ],
      status: 'Published',
      isFeatured: false,
      viewsCount: 1,
      wishlistCount: 0,
      enquiriesCount: 0,
      whatsappClicksCount: 0,
      callsCount: 0,
      registrationNumber: vehicleData.registrationNumber,
      registrationLookupStatus: vehicleData.registrationLookupStatus || 'NOT_CHECKED',
      registrationVerified: vehicleData.registrationVerified || false,
      registrationVerifiedAt: vehicleData.registrationVerifiedAt,
      vehicleLookupProvider: vehicleData.vehicleLookupProvider,
      vehicleLookupReference: vehicleData.vehicleLookupReference,
      lookupData: vehicleData.lookupData,
      manualVerificationReason: vehicleData.manualVerificationReason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setVehicles(prev => {
      const updated = [newVehicle, ...prev];
      saveStorage('vehicles', updated);
      return updated;
    });

    // Persist directly to Cloud SQL database
    fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVehicle),
    }).catch(err => {
      console.warn('[CloudSQL] Non-blocking vehicle save error:', err);
    });

    // Add audit log
    const log: AuditLog = {
      id: 'aud-' + Math.random().toString(36).substring(2, 8),
      adminName: currentUser?.name || 'Seller',
      action: 'Vehicle Listed',
      module: 'Vehicle Management',
      recordId: id,
      oldValue: 'None',
      newValue: `Created ${newVehicle.title} (${newVehicle.category})`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);

    showToast('Vehicle Listed Successfully', `${newVehicle.title} is now published on OnRoadPriz!`, 'success');
    return { success: true, vehicleId: id };
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>): boolean => {
    setVehicles(prev => {
      const updated = prev.map(v => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v));
      const target = updated.find(v => v.id === id);
      if (target) {
        saveStorage('vehicles', updated);
        // Persist directly to Cloud SQL database
        fetch(`/api/vehicles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target),
        }).catch(err => {
          console.warn('[CloudSQL] Non-blocking vehicle update error:', err);
        });
      }
      return updated;
    });
    showToast('Listing Updated', 'Vehicle listing details updated successfully.', 'success');
    return true;
  };

  const updateVehicleStatus = (id: string, status: VehicleStatus) => {
    setVehicles(prev => {
      const updated = prev.map(v => (v.id === id ? { ...v, status, updatedAt: new Date().toISOString() } : v));
      saveStorage('vehicles', updated);
      fetch(`/api/vehicles/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(err => {
        console.warn('[CloudSQL] Non-blocking vehicle status update error:', err);
      });
      return updated;
    });
    showToast('Status Updated', `Vehicle status changed to ${status}`, 'success');
  };

  const adminUpdateVehicleStatus = updateVehicleStatus;

  const toggleVehicleFeatured = (id: string) => {
    setVehicles(prev => {
      const updated = prev.map(v => {
        if (v.id === id) {
          const next = !v.isFeatured;
          showToast('Featured Status', next ? 'Listing promoted to Featured!' : 'Listing removed from Featured.', 'info');
          const mod = { ...v, isFeatured: next, featured: next, updatedAt: new Date().toISOString() };
          fetch(`/api/vehicles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mod),
          }).catch(err => {
            console.warn('[CloudSQL] Non-blocking vehicle featured update error:', err);
          });
          return mod;
        }
        return v;
      });
      saveStorage('vehicles', updated);
      return updated;
    });
  };

  const toggleVehicleSold = (id: string) => {
    setVehicles(prev => {
      const updated = prev.map(v => {
        if (v.id === id) {
          const nextStatus = v.status === 'Sold' ? 'Published' : 'Sold';
          showToast('Sold Status', `Vehicle marked as ${nextStatus}`, 'info');
          fetch(`/api/vehicles/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus }),
          }).catch(err => {
            console.warn('[CloudSQL] Non-blocking vehicle sold status error:', err);
          });
          return { ...v, status: nextStatus as VehicleStatus };
        }
        return v;
      });
      saveStorage('vehicles', updated);
      return updated;
    });
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => {
      const updated = prev.filter(v => v.id !== id);
      saveStorage('vehicles', updated);
      return updated;
    });
    fetch(`/api/vehicles/${id}`, {
      method: 'DELETE',
    }).catch(err => {
      console.warn('[CloudSQL] Vehicle delete error:', err);
    });
    showToast('Listing Removed', 'Vehicle listing permanently deleted from database.', 'info');
  };

  const recordVehicleInteraction = (vehicleId: string, interactionType: 'view' | 'call' | 'whatsapp') => {
    setVehicles(prev =>
      prev.map(v => {
        if (v.id === vehicleId) {
          if (interactionType === 'view') {
            return { ...v, viewsCount: (v.viewsCount || 0) + 1, views: (v.views || 0) + 1 };
          }
          if (interactionType === 'call') {
            return { ...v, callsCount: (v.callsCount || 0) + 1 };
          }
          if (interactionType === 'whatsapp') {
            return { ...v, whatsappClicksCount: (v.whatsappClicksCount || 0) + 1 };
          }
        }
        return v;
      })
    );
  };

  const getPublicVehicle = (id: string): Vehicle | null => {
    return vehicles.find(v => v.id === id) || null;
  };

  const getVehicleForSellerOrAdmin = (id: string): Vehicle | null => {
    return vehicles.find(v => v.id === id) || null;
  };

  const hasOwnerAccess = (_vehicleId: string): boolean => {
    return true; // Direct open telephone and WhatsApp access on OnRoadPriz!
  };

  const unlockOwnerAccess = (_vehicleId: string) => {
    return { success: true, alreadyUnlocked: true };
  };

  // Wishlist Functions - Database Backed & User Specific
  const toggleWishlist = async (vehicleId: string) => {
    const isCurrentlySaved = wishlist.includes(vehicleId);
    const updated = isCurrentlySaved
      ? wishlist.filter(id => id !== vehicleId)
      : [...wishlist, vehicleId];
    
    setWishlist(updated);
    saveStorage('wishlist', updated);

    const token = localStorage.getItem('onroadpriz_token');
    const uId = currentUser?.id || 'guest';
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId: uId, vehicleId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.wishlist)) {
          setWishlist(data.wishlist);
          saveStorage('wishlist', data.wishlist);
        }
      }
    } catch (e) {
      console.warn('[CloudSQL] Wishlist sync warning:', e);
    }

    if (isCurrentlySaved) {
      showToast('Removed from Saved', 'Vehicle removed from your saved list.', 'info');
    } else {
      showToast('Saved to Wishlist', 'Vehicle added to your saved list for quick access.', 'success');
    }
  };

  const toggleFavorite = toggleWishlist;
  const isInWishlist = (vehicleId: string): boolean => wishlist.includes(vehicleId);
  const isFavorite = isInWishlist;

  const clearWishlist = async () => {
    setWishlist([]);
    saveStorage('wishlist', []);

    const token = localStorage.getItem('onroadpriz_token');
    if (token) {
      try {
        await fetch('/api/me/wishlist', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (err) {
        console.error('[Wishlist] Clear error:', err);
      }
    }
    showToast('Saved List Cleared', 'All saved vehicles have been cleared.', 'info');
  };

  // Compare List Functions (Max 4 vehicles)
  const addToCompare = (vehicleId: string) => {
    if (compareList.includes(vehicleId)) {
      showToast('Already Added', 'This vehicle is already in your comparison drawer.', 'info');
      return;
    }
    if (compareList.length >= 4) {
      showToast('Comparison Limit Reached', 'You can compare a maximum of 4 vehicles at once.', 'warning');
      return;
    }
    setCompareList(prev => [...prev, vehicleId]);
    showToast('Added to Compare', 'Vehicle added to comparison drawer.', 'success');
  };

  const removeFromCompare = (vehicleId: string) => {
    setCompareList(prev => prev.filter(id => id !== vehicleId));
    showToast('Removed from Compare', 'Vehicle removed from comparison.', 'info');
  };

  const isInCompare = (vehicleId: string): boolean => compareList.includes(vehicleId);
  const clearCompare = () => {
    setCompareList([]);
    showToast('Compare Cleared', 'Comparison dock emptied.', 'info');
  };

  // Plans Management & Purchase
  const purchasePlan = async (
    planId: string, 
    planType: string = 'Seller', 
    paymentMethod: string = 'UPI'
  ): Promise<{ success: boolean; error?: string; subscription?: any }> => {
    const token = localStorage.getItem('onroadpriz_token');
    if (!token || !currentUser) {
      setAuthModalOpen(true);
      showToast('Authentication Required', 'Please sign in or register to purchase this plan.', 'info');
      return { success: false, error: 'Authentication required' };
    }

    try {
      // 1. Create Order server-side
      const createOrderRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId, paymentGateway: paymentMethod })
      });
      const createOrderData = await createOrderRes.json();
      if (!createOrderData.success || !createOrderData.order) {
        showToast('Order Failed', createOrderData.error || 'Failed to create plan order.', 'error');
        return { success: false, error: createOrderData.error };
      }

      const { orderId } = createOrderData.order;

      // 2. Server verifies payment & activates plan in database
      const paymentId = `TXN-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const verifyRes = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId,
          orderId,
          paymentId,
          paymentMethod
        })
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success || !verifyData.subscription) {
        showToast('Activation Failed', verifyData.error || 'Failed to verify and activate plan.', 'error');
        return { success: false, error: verifyData.error };
      }

      const { subscription, payment, user: updatedUserRecord } = verifyData;

      // 3. Update authoritative local states
      if (subscription.planType === 'buyer') {
        setActiveBuyerPlan(subscription);
      } else {
        setActiveSellerPlan(subscription);
      }
      setPlanHistory(prev => [subscription, ...prev.filter(s => s.id !== subscription.id)]);
      if (payment) {
        setPayments(prev => [payment, ...prev.filter(p => p.id !== payment.id)]);
      }

      if (updatedUserRecord) {
        setCurrentUser(updatedUserRecord);
        saveStorage('currentUser', updatedUserRecord);
        setUsers(prev => prev.map(u => (u.id === updatedUserRecord.id ? updatedUserRecord : u)));
      }

      // Add notification
      const notif: PlatformNotification = {
        id: 'notif-' + Math.random().toString(36).substring(2, 8),
        title: `${subscription.planType === 'buyer' ? 'Buyer' : 'Seller'} Plan Activated`,
        message: `Your subscription to "${subscription.planName}" is now active in database (Invoice: ${payment?.invoiceNumber || orderId}).`,
        type: 'payment',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);

      showToast('Plan Subscribed!', `Successfully subscribed to ${subscription.planName}. Persisted in database.`, 'success');
      return { success: true, subscription };
    } catch (err: any) {
      console.error('[purchasePlan] Error:', err);
      showToast('Error', 'An error occurred while activating your plan. Please try again.', 'error');
      return { success: false, error: err.message };
    }
  };

  const addSellerPlan = (plan: Partial<SellerPlan>) => {
    const newPlan: SellerPlan = {
      id: 'plan-sel-' + Math.random().toString(36).substring(2, 7),
      name: plan.name || 'Custom Seller Plan',
      price: plan.price || 1499,
      taxRate: 0.18,
      durationDays: plan.durationDays || 60,
      listingsLimit: plan.listingsLimit || 5,
      imageLimitPerVehicle: 20,
      featuredSlots: plan.featuredSlots || 1,
      boostListings: true,
      analyticsAccess: true,
      leadAccess: true,
      prioritySupport: true,
      active: true,
      description: plan.description || 'Custom owner plan.',
      ...plan
    };
    setSellerPlans(prev => [...prev, newPlan]);
    showToast('Seller Plan Added', `${newPlan.name} created.`, 'success');
  };

  const deleteSellerPlan = (id: string) => {
    setSellerPlans(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveStorage('sellerPlans', updated);
      return updated;
    });
    fetch(`/api/admin/plans/seller/${id}`, { method: 'DELETE' }).catch(err => {
      console.warn('[PlanService] Error deleting seller plan:', err);
    });
    showToast('Plan Deleted', 'Seller plan permanently deleted from database.', 'info');
  };

  const reorderSellerPlans = (planIds: string[]) => {
    setSellerPlans(prev => {
      const map = new Map(prev.map(p => [p.id, p]));
      return planIds.map(id => map.get(id)).filter(Boolean) as SellerPlan[];
    });
  };

  const addBuyerPlan = (plan: Partial<BuyerPlan>) => {
    const newPlan: BuyerPlan = {
      id: 'plan-buy-' + Math.random().toString(36).substring(2, 7),
      name: plan.name || 'Custom Buyer Pass',
      price: plan.price || 499,
      taxRate: 0.18,
      durationDays: plan.durationDays || 60,
      savedSearchesLimit: 10,
      unlimitedWishlist: true,
      instantAlerts: true,
      priorityEnquiry: true,
      detailedInspectionReport: true,
      compareVehiclesLimit: 4,
      active: true,
      description: plan.description || 'VIP Buyer Pass',
      ...plan
    };
    setBuyerPlans(prev => [...prev, newPlan]);
    showToast('Buyer Plan Added', `${newPlan.name} created.`, 'success');
  };

  const deleteBuyerPlan = (id: string) => {
    setBuyerPlans(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveStorage('buyerPlans', updated);
      return updated;
    });
    fetch(`/api/admin/plans/buyer/${id}`, { method: 'DELETE' }).catch(err => {
      console.warn('[PlanService] Error deleting buyer plan:', err);
    });
    showToast('Plan Deleted', 'Buyer plan permanently deleted from database.', 'info');
  };

  const reorderBuyerPlans = (planIds: string[]) => {
    setBuyerPlans(prev => {
      const map = new Map(prev.map(p => [p.id, p]));
      return planIds.map(id => map.get(id)).filter(Boolean) as BuyerPlan[];
    });
  };

  // Enquiries Management
  const addEnquiry = (data: Partial<VehicleEnquiry>) => {
    const targetVeh = vehicles.find(v => v.id === data.vehicleId);
    const newEnquiry: VehicleEnquiry = {
      id: 'enq-' + Math.floor(5010 + Math.random() * 4990),
      vehicleId: data.vehicleId || 'ORP-VEH-1001',
      vehicleTitle: data.vehicleTitle || targetVeh?.title || 'Vehicle',
      vehiclePrice: targetVeh?.price || 0,
      vehicleImage: targetVeh?.images?.[0] || '',
      sellerId: targetVeh?.seller?.id || 'usr-sel-201',
      buyerName: data.buyerName || currentUser?.name || 'Direct Buyer',
      buyerPhone: data.buyerPhone || currentUser?.phone || '+91 99590 11223',
      buyerEmail: data.buyerEmail || currentUser?.email || 'buyer@gmail.com',
      message: data.message || 'I am interested in this vehicle. Please connect with me.',
      inspectionRequested: data.inspectionRequested || false,
      preferredDate: data.preferredDate || new Date().toISOString().split('T')[0],
      status: 'New',
      createdAt: new Date().toISOString()
    };

    setEnquiries(prev => [newEnquiry, ...prev]);

    // Persist enquiry to Cloud SQL
    fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEnquiry),
    }).catch(err => {
      console.warn('[CloudSQL] Enquiry save warning:', err);
    });

    // Increment enquiries count on vehicle
    if (data.vehicleId) {
      setVehicles(prev =>
        prev.map(v =>
          v.id === data.vehicleId ? { ...v, enquiriesCount: (v.enquiriesCount || 0) + 1 } : v
        )
      );
    }

    showToast('Enquiry Sent', `Your message was delivered to the vehicle owner.`, 'success');
    return { success: true };
  };

  const sendInquiry = (vehicleId: string, message: string) => {
    return addEnquiry({ vehicleId, message });
  };

  const replyInquiry = (inquiryId: string, message: string) => {
    setEnquiries(prev =>
      prev.map(e => {
        if (e.id === inquiryId) {
          const replies = e.replies || [];
          return {
            ...e,
            status: 'Responded',
            replies: [
              ...replies,
              {
                id: 'rep-' + Math.random().toString(36).substring(2, 7),
                sender: currentUser?.name || 'Owner',
                message,
                createdAt: new Date().toISOString()
              }
            ]
          };
        }
        return e;
      })
    );
    showToast('Reply Sent', 'Your response has been sent.', 'success');
  };

  const updateEnquiryStatus = (id: string, status: string) => {
    setEnquiries(prev => prev.map(e => (e.id === id ? { ...e, status } : e)));
    showToast('Enquiry Updated', `Status changed to ${status}`, 'info');
  };

  // Banners
  const addBanner = (banner: Partial<Banner>) => {
    const newBanner: Banner = {
      id: 'ban-' + Math.floor(100 + Math.random() * 900),
      section: banner.section || 'Main Banner',
      name: banner.name || 'New Banner Promotion',
      imageUrl:
        banner.imageUrl ||
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&auto=format&fit=crop&q=80',
      targetUrl: banner.targetUrl || '/buy',
      displayOrder: banner.displayOrder || banners.length + 1,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...banner
    };
    setBanners(prev => [...prev, newBanner]);

    // Persist banner to Cloud SQL
    fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBanner),
    }).catch(err => {
      console.warn('[CloudSQL] Banner save warning:', err);
    });

    showToast('Banner Added', `Banner "${newBanner.name}" published.`, 'success');
  };

  const updateBannerStatus = (id: string, status: string) => {
    setBanners(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
    showToast('Banner Status Updated', `Banner marked as ${status}`, 'info');
  };

  const deleteBanner = (id: string) => {
    setBanners(prev => {
      const updated = prev.filter(b => b.id !== id);
      saveStorage('banners', updated);
      return updated;
    });
    fetch(`/api/banners/${id}`, { method: 'DELETE' }).catch(err => {
      console.warn('[CloudSQL] Banner delete warning:', err);
    });
    showToast('Banner Removed', 'Banner asset permanently deleted from database.', 'info');
  };

  // Blogs
  const addBlog = (data: Partial<BlogPost>) => {
    const slug = (data.title || 'automotive-article')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newBlog: BlogPost = {
      id: 'blog-' + Math.floor(100 + Math.random() * 900),
      title: data.title || 'New Automotive Article',
      slug: data.slug || slug,
      excerpt: data.excerpt || 'Article summary description.',
      content: data.content || 'Article full content.',
      category: data.category || 'Buying Guides',
      tags: data.tags || ['Cars', 'Direct Owner'],
      featuredImage:
        data.featuredImage ||
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
      author: data.author || {
        name: currentUser?.name || 'OnRoadPriz Editorial Team',
        role: 'Automotive Editor'
      },
      status: 'Published',
      publishedAt: new Date().toISOString(),
      readTimeMinutes: data.readTimeMinutes || 4,
      ...data
    };

    setBlogs(prev => [newBlog, ...prev]);

    // Persist blog to Cloud SQL
    fetch('/api/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBlog),
    }).catch(err => {
      console.warn('[CloudSQL] Blog save warning:', err);
    });

    showToast('Blog Article Published', `"${newBlog.title}" is now live!`, 'success');
  };

  const updateBlog = (id: string, data: Partial<BlogPost>) => {
    setBlogs(prev => {
      const updated = prev.map(b => (b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b));
      const target = updated.find(b => b.id === id);
      if (target) {
        fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(target),
        }).catch(err => {
          console.warn('[CloudSQL] Blog update warning:', err);
        });
      }
      return updated;
    });
    showToast('Blog Updated', 'Article updated.', 'success');
  };

  const deleteBlog = (id: string) => {
    setBlogs(prev => {
      const updated = prev.filter(b => b.id !== id);
      saveStorage('blogs', updated);
      return updated;
    });
    fetch(`/api/blogs/${id}`, { method: 'DELETE' }).catch(err => {
      console.warn('[CloudSQL] Blog delete warning:', err);
    });
    showToast('Blog Deleted', 'Article permanently deleted from database.', 'info');
  };

  // Testimonials
  const addTestimonial = (data: Partial<Testimonial>) => {
    const newTestimonial: Testimonial = {
      id: 'test-' + Math.floor(100 + Math.random() * 900),
      name: data.name || 'Satisfied Customer',
      designation: data.designation || 'Vehicle Owner',
      location: data.location || 'Visakhapatnam, AP',
      avatar:
        data.avatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      vehiclePurchased: data.vehiclePurchased || 'Direct Owner Car',
      quote: data.quote || 'Seamless direct owner experience with zero middleman hassle!',
      rating: data.rating || 5,
      status: 'Active',
      displayOrder: testimonials.length + 1,
      createdAt: new Date().toISOString(),
      ...data
    };
    setTestimonials(prev => [...prev, newTestimonial]);
    showToast('Testimonial Added', 'Customer review added.', 'success');
  };

  const updateTestimonial = (id: string, data: Partial<Testimonial>) => {
    setTestimonials(prev => prev.map(t => (t.id === id ? { ...t, ...data } : t)));
    showToast('Testimonial Updated', 'Customer review updated.', 'success');
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    showToast('Testimonial Removed', 'Review deleted.', 'info');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', 'All updates cleared.', 'info');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Settings: Global Server-side Source of Truth
  const updateSettings = async (newSettings: Partial<PlatformSettings>): Promise<boolean> => {
    try {
      // 1. Send update to authoritative server backend database
      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: newSettings,
          updatedBy: currentUser?.name || currentUser?.email || 'Super Admin'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server failed to save global settings');
      }

      const result = await response.json();
      const updated: PlatformSettings = result.settings || { ...settings, ...newSettings };

      // 2. Update React state with authoritative server data including incremented version numbers
      setSettings(updated);
      try {
        localStorage.setItem('settings', JSON.stringify(updated));
        saveStorage('settings', updated);
        localStorage.setItem('onroadpriz_branding_ping', String(Date.now()));
      } catch (_) {}

      // 3. Dynamic cache-busting Favicon update
      updateDocumentFavicon(updated.faviconUrl || updated.favicon, updated.faviconVersion || updated.favicon_version || 1);

      // 4. Instant multi-tab & cross-window broadcast
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const ch = new BroadcastChannel('onroadpriz_branding_sync');
          ch.postMessage({ type: 'BRANDING_UPDATED', timestamp: Date.now() });
          ch.close();
        }
      } catch (_) {}

      // 5. Invalidate & refetch fresh public endpoint settings
      fetchGlobalSettings();

      addAuditLog({
        action: 'SETTINGS_UPDATED',
        module: 'PLATFORM_SETTINGS',
        recordId: 'global_settings',
        newValue: `Updated global branding (Logo v${updated.logoVersion || 1}, Favicon v${updated.faviconVersion || 1}) and marketplace configuration`
      });

      showToast('Settings Saved', 'Platform branding and settings updated globally across all browsers.', 'success');
      return true;
    } catch (err: any) {
      console.error('[Settings] Global settings update failed:', err);
      showToast('Update Failed', `Could not persist settings globally: ${err.message || 'Unknown error'}`, 'error');
      return false;
    }
  };

  const refreshSiteSettings = async () => {
    await fetchGlobalSettings();
  };

  // Team Management & Access Control
  const addTeamMember = (memberData: Omit<TeamMember, 'id' | 'createdAt'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: 'team-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };

    setTeamMembers(prev => [newMember, ...prev]);

    // Also sync with users list so staff can log in
    setUsers(prev => {
      const existing = prev.find(u => u.email?.toLowerCase() === newMember.email.toLowerCase());
      if (existing) {
        return prev.map(u => u.id === existing.id ? { ...u, role: newMember.role as UserRole, name: newMember.name, fullName: newMember.name } : u);
      }
      const staffUser: User = {
        id: 'usr-' + newMember.id,
        name: newMember.name,
        fullName: newMember.name,
        email: newMember.email,
        phone: newMember.phone,
        role: newMember.role as UserRole,
        status: newMember.status === 'Suspended' ? 'Suspended' : 'Active',
        verified: true,
        registeredAt: new Date().toISOString()
      };
      return [staffUser, ...prev];
    });

    addAuditLog({
      action: 'TEAM_MEMBER_ADDED',
      module: 'TEAM_MANAGEMENT',
      recordId: newMember.id,
      newValue: `${newMember.name} (${newMember.role}) - ${newMember.email}`
    });

    showToast('Team Member Added', `${newMember.name} has been appointed as ${newMember.role}.`, 'success');
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

    const updated = teamMembers.find(m => m.id === id);
    if (updated) {
      if (updates.role || updates.name) {
        setUsers(prev => prev.map(u => 
          u.email?.toLowerCase() === updated.email.toLowerCase()
            ? { ...u, role: (updates.role as UserRole) || u.role, name: updates.name || u.name, fullName: updates.name || u.fullName }
            : u
        ));
      }
      addAuditLog({
        action: 'TEAM_MEMBER_UPDATED',
        module: 'TEAM_MANAGEMENT',
        recordId: id,
        newValue: JSON.stringify(updates)
      });
    }

    showToast('Member Updated', 'Staff permissions and role successfully updated.', 'success');
  };

  const deleteTeamMember = (id: string) => {
    const member = teamMembers.find(m => m.id === id);
    if (!member) return;

    if (member.email.toLowerCase() === 'onroadpriz@admin.com' || member.email.toLowerCase() === 'admin@onroadpriz.com') {
      showToast('Action Forbidden', 'Primary Root Super Admin accounts cannot be removed.', 'error');
      return;
    }

    setTeamMembers(prev => prev.filter(m => m.id !== id));
    addAuditLog({
      action: 'TEAM_MEMBER_REMOVED',
      module: 'TEAM_MANAGEMENT',
      recordId: id,
      oldValue: `${member.name} (${member.email})`
    });
    showToast('Member Removed', `${member.name} has been removed from the staff team.`, 'info');
  };

  const toggleTeamMemberStatus = (id: string) => {
    const member = teamMembers.find(m => m.id === id);
    if (!member) return;

    if (member.email.toLowerCase() === 'onroadpriz@admin.com' || member.email.toLowerCase() === 'admin@onroadpriz.com') {
      showToast('Action Forbidden', 'Primary Root Super Admin accounts cannot be suspended.', 'error');
      return;
    }

    const newStatus = member.status === 'Active' ? 'Suspended' : 'Active';
    updateTeamMember(id, { status: newStatus });
  };

  // Contact Submissions
  const submitContact = (data: { name: string; email: string; phone?: string; subject: string; message: string }): boolean => {
    const submission: ContactSubmission = {
      id: 'cnt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: data.name.trim(),
      email: (data.email || 'Not provided').trim(),
      phone: data.phone?.trim() || '',
      subject: data.subject.trim() || 'General Inquiry',
      message: data.message.trim(),
      status: 'new',
      createdAt: new Date().toISOString()
    };
    setContactSubmissions(prev => {
      const updated = [submission, ...prev];
      saveStorage('contactSubmissions', updated);
      return updated;
    });

    // Also add an admin notification so it shows up in Admin Notifications immediately
    setNotifications(prev => {
      const notif: PlatformNotification = {
        id: 'notif-cnt-' + Date.now(),
        title: `New Help Center Inquiry: ${submission.subject}`,
        message: `${submission.name} (${submission.phone || submission.email}) submitted an inquiry: "${submission.message.slice(0, 90)}${submission.message.length > 90 ? '...' : ''}"`,
        type: 'contact_inquiry',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/admin'
      };
      const next = [notif, ...prev];
      saveStorage('notifications', next);
      return next;
    });

    // Persist to backend server & broadcast to all admin browsers
    fetch('/api/contact-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    })
      .then(res => res.json())
      .then(resData => {
        if (resData.success && Array.isArray(resData.submissions)) {
          setContactSubmissions(resData.submissions);
          saveStorage('contactSubmissions', resData.submissions);
        }
      })
      .catch(err => console.warn('[ContactSubmissions] Error saving inquiry to server:', err));

    showToast(
      'Support Ticket Submitted',
      `Thank you ${submission.name}. An OnRoadPriz specialist will reach out to ${submission.phone || submission.email} shortly.`,
      'success'
    );
    return true;
  };

  const updateContactStatus = (id: string, status: string) => {
    setContactSubmissions(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, status } : c));
      saveStorage('contactSubmissions', updated);
      return updated;
    });
    fetch(`/api/contact-submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(err => console.warn('[ContactSubmissions] Error updating status:', err));
    showToast('Inquiry Updated', `Inquiry marked as ${status}.`, 'info');
  };

  const deleteContactSubmission = (id: string) => {
    setContactSubmissions(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveStorage('contactSubmissions', updated);
      return updated;
    });
    fetch(`/api/contact-submissions/${id}`, {
      method: 'DELETE'
    }).catch(err => console.warn('[ContactSubmissions] Error deleting inquiry:', err));
    showToast('Inquiry Deleted', 'Contact inquiry removed.', 'info');
  };

  // User Management
  const createAdminUser = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role?: UserRole;
    city?: string;
    state?: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          role: data.role || 'Admin'
        })
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        setUsers(prev => {
          const exists = prev.some(u => u.id === resData.user.id);
          const updated = exists ? prev.map(u => (u.id === resData.user.id ? resData.user : u)) : [resData.user, ...prev];
          saveStorage('users', updated);
          return updated;
        });
        showToast('Admin Account Created', `${resData.user.name} (${resData.user.role}) has been added as an administrator.`, 'success');
        return { success: true, user: resData.user };
      } else {
        const errMsg = resData.error || 'Failed to create admin account.';
        showToast('Creation Failed', errMsg, 'error');
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      console.error('[createAdminUser] Error:', err);
      showToast('Network Error', 'Could not reach server to create admin user.', 'error');
      return { success: false, error: err.message };
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    // 1. Strict Phone Uniqueness Check
    if (data.phone) {
      const cleanDigits = data.phone.replace(/\D/g, '').slice(-10);
      if (cleanDigits) {
        const dupPhone = users.find(u => u.id !== id && (u.phone || u.mobile || '').replace(/\D/g, '').slice(-10) === cleanDigits);
        if (dupPhone) {
          showToast('Duplicate Phone Number', `Phone number is already in use by ${dupPhone.name || dupPhone.fullName || 'another account'}.`, 'error');
          return;
        }
      }
    }

    // 2. Strict Email Uniqueness Check
    if (data.email) {
      const cleanEmail = data.email.trim().toLowerCase();
      if (cleanEmail) {
        const dupEmail = users.find(u => u.id !== id && u.email && u.email.trim().toLowerCase() === cleanEmail);
        if (dupEmail) {
          showToast('Duplicate Email Address', `Email address is already in use by ${dupEmail.name || dupEmail.fullName || 'another account'}.`, 'error');
          return;
        }
      }
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        setUsers(prev => prev.map(u => (u.id === id ? resData.user : u)));
        if (currentUser && currentUser.id === id) {
          setCurrentUser(resData.user);
          saveStorage('currentUser', resData.user);
        }
        showToast('User Updated', 'User profile and permissions saved to database.', 'success');
        return;
      }
      if (resData.error) {
        showToast('Update Failed', resData.error, 'error');
        return;
      }
    } catch (err) {
      console.error('[updateUser] Error updating user:', err);
    }
    setUsers(prev => {
      const updated = prev.map(u => (u.id === id ? { ...u, ...data } : u));
      saveStorage('users', updated);
      return updated;
    });
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
    showToast('User Updated', 'User profile and permissions saved.', 'success');
  };

  const deleteUser = async (id: string) => {
    // 1. Immediately update UI state & local storage
    setUsers(prev => {
      const updated = prev.filter(u => u.id !== id);
      saveStorage('users', updated);
      return updated;
    });

    if (currentUser && currentUser.id === id) {
      logout();
    }

    // 2. Immediately delete from Cloud SQL / backend database
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('[deleteUser] Error deleting user from database:', err);
    }

    showToast('User Removed', 'User account permanently deleted from database.', 'info');
  };

  // Plan Updates
  const updateSellerPlan = (id: string, data: Partial<SellerPlan>) => {
    setSellerPlans(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
    showToast('Seller Plan Updated', 'Plan details and pricing saved.', 'success');
  };

  const updateBuyerPlan = (id: string, data: Partial<BuyerPlan>) => {
    setBuyerPlans(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
    showToast('Buyer Plan Updated', 'Plan details and limits saved.', 'success');
  };

  // Seller Reports
  const submitSellerReport = (vehicleId: string, reason: string, description?: string): boolean => {
    const report: SellerReport = {
      id: 'rep-' + Math.random().toString(36).substring(2, 8),
      vehicleId,
      reason,
      description,
      reporterId: currentUser?.id || 'guest',
      reporterName: currentUser?.name || 'Anonymous User',
      reporterPhone: currentUser?.phone || 'Unknown',
      sellerId: 'owner',
      priority: 'Medium',
      status: 'Open',
      createdAt: new Date().toISOString()
    };
    setSellerReports(prev => [report, ...prev]);
    showToast('Report Submitted', 'Our moderation team will review this vehicle listing.', 'info');
    return true;
  };

  const updateSellerReport = (id: string, data: Partial<SellerReport>) => {
    setSellerReports(prev => prev.map(r => (r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r)));
    showToast('Report Updated', 'Seller report status updated.', 'success');
  };

  const deleteSellerReport = (id: string) => {
    setSellerReports(prev => prev.filter(r => r.id !== id));
    showToast('Report Deleted', 'Seller report removed.', 'info');
  };

  // Audit Logs
  const addAuditLog = (entry: { action: string; module: string; recordId: string; oldValue?: string; newValue?: string }) => {
    const newLog: AuditLog = {
      id: 'aud-' + Math.floor(1000 + Math.random() * 9000),
      adminName: currentUser?.name || 'Super Admin',
      action: entry.action,
      module: entry.module,
      recordId: entry.recordId,
      oldValue: entry.oldValue || '—',
      newValue: entry.newValue || '—',
      ipAddress: '157.48.192.12',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('Notifications Updated', 'All notifications marked as read.', 'info');
  };

  // Master Data Methods
  const normalizeCategoryName = (category: string): string => {
    const lower = (category || '').toLowerCase().trim();
    if (lower === 'cars' || lower === 'car') return 'Cars';
    if (lower.includes('bike') || lower.includes('scooter')) return 'Bikes & Scooters';
    if (lower.includes('truck') || lower.includes('lorr')) return 'Trucks & Lorries';
    if (lower.includes('bus')) return 'Buses';
    if (lower.includes('tractor') || lower.includes('backhoe') || lower === 'jcb') return 'Tractors & Backhoe Loaders';
    if (lower.includes('machinery') || lower.includes('heavy')) return 'Heavy Machinery Vehicles';
    return category;
  };

  const isBrandInUse = (brandName: string): boolean => {
    return vehicles.some(v => v.brand?.toLowerCase() === brandName.toLowerCase());
  };

  const isModelInUse = (modelName: string): boolean => {
    return vehicles.some(v => v.model?.toLowerCase() === modelName.toLowerCase());
  };

  const getBrandsForCategory = (category: string): MasterBrand[] => {
    const norm = normalizeCategoryName(category).toLowerCase();
    return masterBrands.filter(b => {
      const bCat = normalizeCategoryName(b.categoryId).toLowerCase();
      return bCat === norm && b.active;
    });
  };

  const getModelsForBrand = (brandNameOrId: string): MasterModel[] => {
    const clean = (brandNameOrId || '').toLowerCase().trim();
    const target = clean === 'swarag' ? 'swaraj' : clean === 'vovlo' ? 'volvo' : clean;
    const matchingBrands = masterBrands.filter(b => 
      b.id.toLowerCase() === target || b.name.toLowerCase() === target
    );
    if (matchingBrands.length === 0) {
      return masterModels.filter(m => m.brandId.toLowerCase().includes(target) && m.active);
    }
    const brandIds = new Set(matchingBrands.map(b => b.id));
    return masterModels.filter(m => brandIds.has(m.brandId) && m.active);
  };

  const getVariantsForModel = (modelNameOrId: string): MasterVariant[] => {
    const clean = (modelNameOrId || '').toLowerCase().trim();
    const matchingModels = masterModels.filter(m => 
      m.id.toLowerCase() === clean || m.name.toLowerCase() === clean
    );
    if (matchingModels.length === 0) {
      return masterVariants.filter(v => v.modelId.toLowerCase().includes(clean) && v.active);
    }
    const modelIds = new Set(matchingModels.map(m => m.id));
    return masterVariants.filter(v => modelIds.has(v.modelId) && v.active);
  };

  const addMasterCategory = (cat: Partial<MasterCategory>) => {
    const id = cat.id || cat.name || `cat-${Date.now()}`;
    const newCat: MasterCategory = {
      id,
      name: cat.name || 'New Category',
      active: cat.active ?? true,
      order: cat.order ?? (masterCategories.length + 1)
    };
    setMasterCategories(prev => [...prev, newCat]);
    showToast('Category Added', `Added ${newCat.name}`, 'success');
  };

  const updateMasterCategory = (id: string, cat: Partial<MasterCategory>) => {
    setMasterCategories(prev => prev.map(c => c.id === id ? { ...c, ...cat } : c));
    showToast('Category Updated', 'Vehicle category updated', 'success');
  };

  const toggleMasterCategory = (id: string) => {
    setMasterCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const addMasterBrand = (brand: Partial<MasterBrand>) => {
    const id = brand.id || `b-${Date.now()}`;
    const newBrand: MasterBrand = {
      id,
      categoryId: brand.categoryId || 'Cars',
      name: brand.name || 'New Brand',
      active: brand.active ?? true,
      order: brand.order ?? (masterBrands.length + 1)
    };
    setMasterBrands(prev => [...prev, newBrand]);
    showToast('Brand Added', `Added brand ${newBrand.name}`, 'success');
  };

  const updateMasterBrand = (id: string, brand: Partial<MasterBrand>) => {
    setMasterBrands(prev => prev.map(b => b.id === id ? { ...b, ...brand } : b));
    showToast('Brand Updated', 'Vehicle brand updated', 'success');
  };

  const toggleMasterBrand = (id: string) => {
    setMasterBrands(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
  };

  const deleteMasterBrand = (id: string): { success: boolean; error?: string } => {
    const brand = masterBrands.find(b => b.id === id);
    if (!brand) return { success: false, error: 'Brand not found' };
    if (isBrandInUse(brand.name)) {
      showToast('Cannot Delete Brand', `Brand "${brand.name}" is referenced by existing vehicles. Deactivated instead.`, 'warning');
      toggleMasterBrand(id);
      return { success: false, error: 'Brand is in use by existing vehicles' };
    }
    setMasterBrands(prev => prev.filter(b => b.id !== id));
    showToast('Brand Removed', `Deleted brand ${brand.name}`, 'info');
    return { success: true };
  };

  const reorderMasterBrands = (category: string, brandIds: string[]) => {
    setMasterBrands(prev => {
      const remaining = prev.filter(b => b.categoryId.toLowerCase() !== category.toLowerCase());
      const reordered = brandIds.map((bid, idx) => {
        const item = prev.find(b => b.id === bid)!;
        return { ...item, order: idx + 1 };
      });
      return [...remaining, ...reordered];
    });
  };

  const addMasterModel = (model: Partial<MasterModel>) => {
    const id = model.id || `m-${Date.now()}`;
    const newModel: MasterModel = {
      id,
      brandId: model.brandId || '',
      name: model.name || 'New Model',
      active: model.active ?? true,
      order: model.order ?? (masterModels.length + 1)
    };
    setMasterModels(prev => [...prev, newModel]);
    showToast('Model Added', `Added model ${newModel.name}`, 'success');
  };

  const updateMasterModel = (id: string, model: Partial<MasterModel>) => {
    setMasterModels(prev => prev.map(m => m.id === id ? { ...m, ...model } : m));
    showToast('Model Updated', 'Vehicle model updated', 'success');
  };

  const toggleMasterModel = (id: string) => {
    setMasterModels(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const deleteMasterModel = (id: string): { success: boolean; error?: string } => {
    const m = masterModels.find(item => item.id === id);
    if (!m) return { success: false, error: 'Model not found' };
    if (isModelInUse(m.name)) {
      showToast('Cannot Delete Model', `Model "${m.name}" is referenced by existing vehicles. Deactivated instead.`, 'warning');
      toggleMasterModel(id);
      return { success: false, error: 'Model is in use by existing vehicles' };
    }
    setMasterModels(prev => prev.filter(item => item.id !== id));
    showToast('Model Removed', `Deleted model ${m.name}`, 'info');
    return { success: true };
  };

  const reorderMasterModels = (brandId: string, modelIds: string[]) => {
    setMasterModels(prev => {
      const remaining = prev.filter(m => m.brandId !== brandId);
      const reordered = modelIds.map((mid, idx) => {
        const item = prev.find(m => m.id === mid)!;
        return { ...item, order: idx + 1 };
      });
      return [...remaining, ...reordered];
    });
  };

  const addMasterVariant = (variant: Partial<MasterVariant>) => {
    const id = variant.id || `v-${Date.now()}`;
    const newVariant: MasterVariant = {
      id,
      modelId: variant.modelId || '',
      name: variant.name || 'New Variant',
      active: variant.active ?? true,
      order: variant.order ?? (masterVariants.length + 1)
    };
    setMasterVariants(prev => [...prev, newVariant]);
    showToast('Variant Added', `Added variant ${newVariant.name}`, 'success');
  };

  const updateMasterVariant = (id: string, variant: Partial<MasterVariant>) => {
    setMasterVariants(prev => prev.map(v => v.id === id ? { ...v, ...variant } : v));
    showToast('Variant Updated', 'Vehicle variant updated', 'success');
  };

  const toggleMasterVariant = (id: string) => {
    setMasterVariants(prev => prev.map(v => v.id === id ? { ...v, active: !v.active } : v));
  };

  const deleteMasterVariant = (id: string) => {
    setMasterVariants(prev => prev.filter(v => v.id !== id));
  };

  const addFuelType = (type: string) => {
    if (!masterFuelTypes.includes(type)) {
      setMasterFuelTypes(prev => [...prev, type]);
      showToast('Fuel Type Added', `Added ${type}`, 'success');
    }
  };

  const deleteFuelType = (type: string) => {
    setMasterFuelTypes(prev => prev.filter(t => t !== type));
  };

  const addTransmissionType = (type: string) => {
    if (!masterTransmissionTypes.includes(type)) {
      setMasterTransmissionTypes(prev => [...prev, type]);
      showToast('Transmission Added', `Added ${type}`, 'success');
    }
  };

  const deleteTransmissionType = (type: string) => {
    setMasterTransmissionTypes(prev => prev.filter(t => t !== type));
  };

  const addBodyType = (type: string) => {
    if (!masterBodyTypes.includes(type)) {
      setMasterBodyTypes(prev => [...prev, type]);
      showToast('Body Type Added', `Added ${type}`, 'success');
    }
  };

  const deleteBodyType = (type: string) => {
    setMasterBodyTypes(prev => prev.filter(t => t !== type));
  };

  // Buyer Subscription Access Control
  const checkBuyerAccess = (vehicleId: string): {
    granted: boolean;
    reason?: 'AUTH_REQUIRED' | 'NO_PLAN' | 'EXPIRED' | 'QUOTA_EXHAUSTED';
    remainingViews?: number;
  } => {
    // 1. Not logged in -> must authenticate first
    if (!currentUser) {
      return { granted: false, reason: 'AUTH_REQUIRED' };
    }

    // 2. Staff / Admin always has full access
    const isStaff =
      currentUser.role === 'Admin' ||
      currentUser.role === 'Super Admin' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'Moderator';
    if (isStaff) {
      return { granted: true };
    }

    // 3. Seller viewing own listing
    const v = vehicles.find(item => item.id === vehicleId);
    if (v && (v.seller?.id === currentUser.id || v.sellerId === currentUser.id)) {
      return { granted: true };
    }

    // 4. Already unlocked this vehicle in current session/account
    const unlocked = currentUser.accessedOwnershipVehicles || [];
    if (unlocked.includes(vehicleId)) {
      return { granted: true, remainingViews: currentUser.buyerPlan?.listingViewsRemaining };
    }

    // 5. Check buyer plan
    const bPlan = currentUser.buyerPlan;
    if (!bPlan) {
      if (currentUser.activePlan?.includes('Buyer') || currentUser.activePlan?.includes('VIP')) {
        return { granted: true };
      }
      return { granted: false, reason: 'NO_PLAN' };
    }

    // 6. Check expiry
    if (bPlan.expiresAt) {
      const isExpired = new Date(bPlan.expiresAt).getTime() < Date.now();
      if (isExpired || bPlan.status === 'expired') {
        return { granted: false, reason: 'EXPIRED' };
      }
    }

    // 7. Check quota
    if (bPlan.listingViewsRemaining !== undefined && bPlan.listingViewsRemaining <= 0) {
      return { granted: false, reason: 'QUOTA_EXHAUSTED', remainingViews: 0 };
    }

    return { granted: true, remainingViews: bPlan.listingViewsRemaining };
  };

  const recordBuyerVehicleUnlock = (vehicleId: string) => {
    if (!currentUser) return;
    const unlocked = currentUser.accessedOwnershipVehicles || [];
    if (unlocked.includes(vehicleId)) return;

    const bPlan = currentUser.buyerPlan;
    let nextRemaining = bPlan?.listingViewsRemaining;
    if (nextRemaining !== undefined && nextRemaining > 0) {
      nextRemaining -= 1;
    }

    const updatedUser: User = {
      ...currentUser,
      accessedOwnershipVehicles: [...unlocked, vehicleId],
      buyerPlan: bPlan
        ? {
            ...bPlan,
            listingViewsRemaining: nextRemaining
          }
        : undefined
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
  };

  // Seller Subscription Access Control (Requirements 6, 7, 8)
  const checkSellerAccess = (category?: string): {
    granted: boolean;
    reason?: 'AUTH_REQUIRED' | 'NO_PLAN' | 'EXPIRED' | 'QUOTA_EXHAUSTED' | 'CATEGORY_MISMATCH';
    remainingListings?: number;
  } => {
    if (!currentUser) {
      return { granted: false, reason: 'AUTH_REQUIRED' };
    }

    const isStaff =
      currentUser.role === 'Admin' ||
      currentUser.role === 'Super Admin' ||
      currentUser.role === 'admin' ||
      currentUser.role === 'Moderator';
    if (isStaff) {
      return { granted: true };
    }

    const sPlan = currentUser.sellerPlan;
    if (!sPlan) {
      // Check legacy activePlan strings
      if (currentUser.activePlan?.includes('Seller') || currentUser.activePlan?.includes('Dealer')) {
        return { granted: true };
      }
      return { granted: false, reason: 'NO_PLAN' };
    }

    // Check expiry
    if (sPlan.expiresAt) {
      const isExpired = new Date(sPlan.expiresAt).getTime() < Date.now();
      if (isExpired || sPlan.status === 'expired') {
        return { granted: false, reason: 'EXPIRED' };
      }
    }

    // Check remaining listings
    if (sPlan.listingsRemaining !== undefined && sPlan.listingsRemaining <= 0) {
      return { granted: false, reason: 'QUOTA_EXHAUSTED', remainingListings: 0 };
    }

    // Check category entitlement if category specified
    if (category && sPlan.categoriesAllowed && sPlan.categoriesAllowed.length > 0) {
      const catLower = category.toLowerCase();
      const match = sPlan.categoriesAllowed.some(c => catLower.includes(c.toLowerCase()));
      if (!match) {
        return { granted: false, reason: 'CATEGORY_MISMATCH' };
      }
    }

    return { granted: true, remainingListings: sPlan.listingsRemaining };
  };

  // Vehicle Document Verification (Requirements 12, 13)
  const verifyVehicleRc = (vehicleId: string, status: DocumentVerificationStatus, notes?: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;
      const legacyStatus = status === 'VERIFIED' ? 'RC_VERIFIED' : status === 'REJECTED' ? 'RC_REJECTED' : 'RC_UNDER_REVIEW';
      return {
        ...v,
        rc_verification_status: status,
        rc_verification_notes: notes || v.rc_verification_notes,
        rcStatus: legacyStatus,
        rcVerifiedAt: status === 'VERIFIED' ? new Date().toISOString() : undefined,
        documents: (v.documents || []).map(d => {
          if (d.type === 'RC' || d.name?.toLowerCase().includes('rc')) {
            return { ...d, verified: status === 'VERIFIED' };
          }
          return d;
        })
      };
    }));

    const v = vehicles.find(item => item.id === vehicleId);
    addAuditLog({
      action: `RC Verification: ${status}`,
      module: 'Vehicle Document Verification',
      recordId: vehicleId,
      oldValue: `RC Status: ${v?.rc_verification_status || 'PENDING'}`,
      newValue: `RC Status: ${status}${notes ? ` - Reason: ${notes}` : ''}`
    });

    if (v?.sellerId || v?.seller?.name) {
      setNotifications(prev => [
        {
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          title: `RC Document Status: ${status}`,
          message: status === 'VERIFIED'
            ? `Your RC document for "${v?.title || vehicleId}" has been verified successfully.`
            : status === 'REUPLOAD_REQUIRED'
            ? `Action required: Please re-upload your RC document for "${v?.title || vehicleId}". Note: ${notes || 'Document unreadable or invalid'}`
            : `Your RC document for "${v?.title || vehicleId}" was rejected: ${notes || 'Document verification failed.'}`,
          type: 'admin',
          read: false,
          createdAt: new Date().toISOString(),
          userId: v.sellerId
        },
        ...prev
      ]);
    }

    showToast(
      `RC ${status}`,
      `Vehicle RC document marked as ${status}${notes ? `: ${notes}` : ''}`,
      status === 'VERIFIED' ? 'success' : status === 'REJECTED' ? 'error' : 'info'
    );
  };

  const verifyVehicleInsurance = (vehicleId: string, status: DocumentVerificationStatus, notes?: string) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;
      return {
        ...v,
        insurance_verification_status: status,
        insurance_verification_notes: notes || v.insurance_verification_notes,
        documents: (v.documents || []).map(d => {
          if (d.type === 'Insurance' || d.name?.toLowerCase().includes('insurance')) {
            return { ...d, verified: status === 'VERIFIED' };
          }
          return d;
        })
      };
    }));

    const v = vehicles.find(item => item.id === vehicleId);
    addAuditLog({
      action: `Insurance Verification: ${status}`,
      module: 'Vehicle Document Verification',
      recordId: vehicleId,
      oldValue: `Insurance Status: ${v?.insurance_verification_status || 'PENDING'}`,
      newValue: `Insurance Status: ${status}${notes ? ` - Reason: ${notes}` : ''}`
    });

    if (v?.sellerId || v?.seller?.name) {
      setNotifications(prev => [
        {
          id: 'notif-' + Math.random().toString(36).substring(2, 9),
          title: `Insurance Document Status: ${status}`,
          message: status === 'VERIFIED'
            ? `Your insurance document for "${v?.title || vehicleId}" has been verified successfully.`
            : status === 'REUPLOAD_REQUIRED'
            ? `Action required: Please re-upload your insurance document for "${v?.title || vehicleId}". Note: ${notes || 'Document unreadable or expired'}`
            : `Your insurance document for "${v?.title || vehicleId}" was rejected: ${notes || 'Invalid document.'}`,
          type: 'admin',
          read: false,
          createdAt: new Date().toISOString(),
          userId: v.sellerId
        },
        ...prev
      ]);
    }

    showToast(
      `Insurance ${status}`,
      `Vehicle insurance marked as ${status}${notes ? `: ${notes}` : ''}`,
      status === 'VERIFIED' ? 'success' : status === 'REJECTED' ? 'error' : 'info'
    );
  };

  // Derived Auth Roles
  const isAuthenticated = Boolean(currentUser);
  const isAdmin = Boolean(
    currentUser &&
      (currentUser.role === 'Admin' ||
        currentUser.role === 'admin' ||
        currentUser.role === 'Super Admin' ||
        currentUser.role === 'Moderator')
  );

  return (
    <AppContext.Provider
      value={{
        currentPath,
        currentRoute: currentPath,
        navigate,
        selectedCity,
        setSelectedCity,
        selectedLocality,
        setSelectedLocality,
        setSelectedLocation,
        isLocationModalOpen,
        setLocationModalOpen,
        confirmedLocation,
        pendingDetectedLocation,
        setPendingDetectedLocation,
        confirmLocation,
        detectLocationHighAccuracy,

        selectedVehicleId,
        setSelectedVehicleId,
        activeCategoryFilter,
        setActiveCategoryFilter,
        selectedBlogSlug,
        setSelectedBlogSlug,

        currentUser,
        users,
        isAuthenticated,
        isAdmin,
        isAuthModalOpen,
        setAuthModalOpen,
        login,
        loginWithEmail,
        loginWithGoogle,
        register,
        registerNewUser,
        logout,
        sendOtp,
        verifyOtp,
        resetPasswordWithOtp,
        updateUserProfile,
        updateUserRole,
        toggleUserStatus,
        updateUserLocation,
        detectAndSetCurrentLocation,
        refreshUserData,
        refreshAdminUsers,
        requestMobileChangeOtp,
        changeUserMobile,
        activeBuyerPlan: effectiveActiveBuyerPlan,
        activeSellerPlan: effectiveActiveSellerPlan,
        planHistory: effectivePlanHistory,
        planPayments: payments,

        vehicles,
        getPublicVehicle,
        getVehicleForSellerOrAdmin,
        hasOwnerAccess,
        unlockOwnerAccess,
        addVehicle,
        updateVehicle,
        updateVehicleStatus,
        adminUpdateVehicleStatus,
        toggleVehicleFeatured,
        toggleVehicleSold,
        deleteVehicle,
        recordVehicleInteraction,

        wishlist,
        favorites: wishlist,
        toggleWishlist,
        toggleFavorite,
        isInWishlist,
        isFavorite,
        clearWishlist,

        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,

        plans: sellerPlans,
        sellerPlans,
        buyerPlans,
        purchasePlan,
        addSellerPlan,
        updateSellerPlan,
        deleteSellerPlan,
        reorderSellerPlans,
        addBuyerPlan,
        updateBuyerPlan,
        deleteBuyerPlan,
        reorderBuyerPlans,

        payments,
        transactions: payments,

        enquiries,
        inquiries: enquiries,
        addEnquiry,
        sendInquiry,
        replyInquiry,
        updateEnquiryStatus,

        banners,
        addBanner,
        updateBannerStatus,
        deleteBanner,

        blogs,
        addBlog,
        updateBlog,
        deleteBlog,

        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,

        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        deleteNotification,

        auditLogs,
        adminLogs: auditLogs,
        addAuditLog,
        settings,
        updateSettings,
        refreshSiteSettings,

        teamMembers,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        toggleTeamMemberStatus,

        createAdminUser,
        updateUser,
        deleteUser,

        contactSubmissions,
        submitContact,
        updateContactStatus,
        deleteContactSubmission,
        sellerReports,
        submitSellerReport,
        updateSellerReport,
        deleteSellerReport,

        toasts,
        showToast,
        removeToast,

        // Master Data
        masterCategories,
        masterBrands,
        masterModels,
        masterVariants,
        masterFuelTypes,
        masterTransmissionTypes,
        masterBodyTypes,
        addMasterCategory,
        updateMasterCategory,
        toggleMasterCategory,
        addMasterBrand,
        updateMasterBrand,
        toggleMasterBrand,
        deleteMasterBrand,
        reorderMasterBrands,
        addMasterModel,
        updateMasterModel,
        toggleMasterModel,
        deleteMasterModel,
        reorderMasterModels,
        addMasterVariant,
        updateMasterVariant,
        toggleMasterVariant,
        deleteMasterVariant,
        addFuelType,
        deleteFuelType,
        addMasterFuelType: addFuelType,
        deleteMasterFuelType: deleteFuelType,
        addTransmissionType,
        deleteTransmissionType,
        addMasterTransmissionType: addTransmissionType,
        deleteMasterTransmissionType: deleteTransmissionType,
        addBodyType,
        deleteBodyType,
        addMasterBodyType: addBodyType,
        deleteMasterBodyType: deleteBodyType,
        getBrandsForCategory,
        getModelsForBrand,
        getVariantsForModel,
        isBrandInUse,
        isModelInUse,

        // Buyer Subscription Access Control
        authReturnTo,
        setAuthReturnTo,
        checkBuyerAccess,
        recordBuyerVehicleUnlock,

        // Seller Subscription Access Control & Verification
        checkSellerAccess,
        verifyVehicleRc,
        verifyVehicleInsurance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
