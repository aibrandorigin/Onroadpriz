import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  VehicleCategory, 
  FuelType, 
  TransmissionType, 
  OwnershipType, 
  VehicleCondition, 
  RegistrationLookupStatus,
  NormalizedVehicleLookupResponse,
  calculateInsuranceStatus
} from '../../types';
import { ImageUpload } from '../common/ImageUpload';
import { RegistrationLookupCard } from './RegistrationLookupCard';
import { Capacitor } from '@capacitor/core';
import { AndroidNativeService } from '../../services/androidNativeService';
import confetti from 'canvas-confetti';
import { 
  Car, 
  Layers, 
  FileText, 
  Camera, 
  IndianRupee, 
  Eye, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Upload, 
  X, 
  FileCheck2,
  AlertCircle,
  Key,
  Calendar,
  Building2,
  Wrench,
  Gauge,
  Weight,
  HelpCircle,
  ChevronDown,
  Search,
  Check,
  AlertTriangle
} from 'lucide-react';
import { CITIES_LIST } from '../../data/initialData';

export interface DocumentUploadItem {
  name: string;
  url: string;
  isPdf?: boolean;
  uploaded: boolean;
  uploadProgress?: number;
}

const ALL_CATEGORIES: VehicleCategory[] = [
  'Cars', 
  'Bikes & Scooters', 
  'Trucks & Lorries', 
  'Buses', 
  'Tractors & Backhoe Loaders', 
  'Heavy Machinery Vehicles'
];

export const SellVehiclePage: React.FC = () => {
  const { 
    currentUser, 
    vehicles,
    addVehicle, 
    showToast, 
    navigate, 
    setAuthModalOpen, 
    setSelectedVehicleId,
    checkSellerAccess,
    setAuthReturnTo,
    getBrandsForCategory,
    getModelsForBrand,
    getVariantsForModel,
    masterFuelTypes,
    masterTransmissionTypes,
    selectedCity,
    selectedLocality,
    confirmedLocation
  } = useApp();

  // Access Protection
  useEffect(() => {
    const access = checkSellerAccess();
    if (!access.granted) {
      if (access.reason === 'AUTH_REQUIRED') {
        setAuthReturnTo('/sell');
        setAuthModalOpen(true);
        showToast('Authentication Required', 'Please sign in to list your vehicle.', 'info');
        navigate('/plans/seller?returnTo=/sell');
      } else {
        showToast('Seller Plan Required', 'An active Seller Plan is required to list your vehicle.', 'warning');
        navigate('/plans/seller?returnTo=/sell');
      }
    }
  }, [currentUser]);

  // 7 Steps Flow
  // STEP 1: Registration Number
  // STEP 2: Vehicle Details & Segment
  // STEP 3: Vehicle Condition & Technical Specifications
  // STEP 4: Vehicle Documents
  // STEP 5: Vehicle Photos
  // STEP 6: Price & Description
  // STEP 7: Preview & Submit
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Registration & VAHAN Lookup State
  const [registrationNumber, setRegistrationNumber] = useState<string>('');
  const [lookupStatus, setLookupStatus] = useState<RegistrationLookupStatus>('NOT_CHECKED');
  const [verifiedResult, setVerifiedResult] = useState<NormalizedVehicleLookupResponse | null>(null);
  const [allowManualCorrection, setAllowManualCorrection] = useState<boolean>(false);

  // STEP 2: Category -> Brand -> Model -> Variant
  const [category, setCategory] = useState<VehicleCategory>('Cars');
  const [brand, setBrand] = useState('Hyundai');
  const [brandSearch, setBrandSearch] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState('');

  const [model, setModel] = useState('Creta');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState('');

  const [variant, setVariant] = useState('SX (O) Turbo');
  const [year, setYear] = useState<number>(2023);
  const [registrationYear, setRegistrationYear] = useState<number>(2023);
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [transmission, setTransmission] = useState<TransmissionType>('Automatic');
  const [rtoCity, setRtoCity] = useState(() => confirmedLocation?.city ? `${confirmedLocation.city} RTO` : '');

  // STEP 3: Vehicle Condition & Technical Specs
  const [kmDriven, setKmDriven] = useState<number>(24000);
  const [ownership, setOwnership] = useState<OwnershipType>('1st Owner');
  const [condition, setCondition] = useState<VehicleCondition>('Excellent');
  const [color, setColor] = useState('Polar White');
  const [engineCapacity, setEngineCapacity] = useState('1497 cc');
  const [mileage, setMileage] = useState('16.8 kmpl');

  // REQUIREMENT 1: Fields Required for ALL Vehicles
  // 1. Spare Key (boolean)
  const [hasSpareKey, setHasSpareKey] = useState<boolean | null>(true);
  // 2. Insurance Validity (date picker + dynamic status)
  const [insuranceValidUntil, setInsuranceValidUntil] = useState<string>('2026-12-31');
  // 3. Hypothecation Status
  const [hypothecationStatus, setHypothecationStatus] = useState<string>('No Hypothecation / Clear');
  const [financierName, setFinancierName] = useState<string>('');
  // 4. OEM / Authorized Service History
  const [oemServiceStatus, setOemServiceStatus] = useState<string>('Full OEM Service History');
  const [serviceRecordsDocs, setServiceRecordsDocs] = useState<DocumentUploadItem[]>([]);
  // 5. Engine Warranty
  const [engineWarrantyStatus, setEngineWarrantyStatus] = useState<string>('Active');
  const [engineWarrantyValidUntil, setEngineWarrantyValidUntil] = useState<string>('2027-06-30');
  // 6. Major Accident History
  const [majorAccidentHistory, setMajorAccidentHistory] = useState<string>('No Major Accident');
  const [majorAccidentDetails, setMajorAccidentDetails] = useState<string>('');

  // REQUIREMENTS 3, 4: Commercial / Operating Specifications
  // (Trucks & Lorries, Buses, Heavy Machinery Vehicles)
  const [loadCapacity, setLoadCapacity] = useState<number | ''>(10);
  const [loadCapacityUnit, setLoadCapacityUnit] = useState<'Tonnes' | 'kg'>('Tonnes');
  const [bucketCapacity, setBucketCapacity] = useState<number | ''>(1.2);
  const [bucketCapacityUnit, setBucketCapacityUnit] = useState<string>('m³');
  const [maxOperatingWeight, setMaxOperatingWeight] = useState<number | ''>(22);
  const [maxOperatingWeightUnit, setMaxOperatingWeightUnit] = useState<'tonnes' | 'kg'>('tonnes');
  const [maxHeightCapacity, setMaxHeightCapacity] = useState<number | ''>(12);
  const [maxHeightCapacityUnit, setMaxHeightCapacityUnit] = useState<'metres' | 'feet'>('metres');
  const [maxLiftCapacity, setMaxLiftCapacity] = useState<number | ''>(5);
  const [maxLiftCapacityUnit, setMaxLiftCapacityUnit] = useState<'tonnes' | 'kg'>('tonnes');

  // REQUIREMENT 5: Heavy Machinery Extra Specifications
  // (Heavy Machinery Vehicles ONLY)
  const [maximumDiggingPower, setMaximumDiggingPower] = useState<number | ''>(150);
  const [maximumDiggingPowerUnit, setMaximumDiggingPowerUnit] = useState<string>('kN');
  const [enginePower, setEnginePower] = useState<number | ''>(135);
  const [enginePowerUnit, setEnginePowerUnit] = useState<'HP' | 'kW'>('HP');

  // Mobile Collapsible Sections
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>({
    condition: true,
    history: true,
    commercial: true,
    heavyMachinery: true,
    technical: true
  });

  const toggleAccordion = (sec: string) => {
    setAccordionState(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // STEP 4: Mandatory RC Front, RC Back, Insurance Documents
  const [rcFront, setRcFront] = useState<DocumentUploadItem | null>({
    name: 'RC_Front_Card.jpg',
    url: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&auto=format&fit=crop&q=80',
    uploaded: true
  });
  const [rcBack, setRcBack] = useState<DocumentUploadItem | null>({
    name: 'RC_Back_Card.jpg',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
    uploaded: true
  });
  const [insuranceDoc, setInsuranceDoc] = useState<DocumentUploadItem | null>({
    name: 'Insurance_Comprehensive_Policy.pdf',
    url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    isPdf: true,
    uploaded: true
  });

  // STEP 5: Vehicle Photos
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=80'
  ]);
  const [coverIndex, setCoverIndex] = useState<number>(0);

  // STEP 6: Price & Location & Description
  const [price, setPrice] = useState<number>(1450000);
  const [negotiable, setNegotiable] = useState(true);
  const [stateName, setStateName] = useState(() => confirmedLocation?.state || currentUser?.state || '');
  const [city, setCity] = useState(() => confirmedLocation?.city || selectedCity || currentUser?.city || '');
  const [area, setArea] = useState(() => confirmedLocation?.area || (selectedLocality && selectedLocality !== 'All Places' ? selectedLocality : ''));
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Touchscreen Infotainment',
    'Reverse Parking Camera',
    'Panoramic Sunroof',
    'Alloy Wheels',
    'Push Button Start / Keyless',
    'Cruise Control'
  ]);
  const [description, setDescription] = useState(
    'Single owner driven vehicle in pristine condition. 100% company serviced with full service records available at authorized dealership. No accidental history, bumper to bumper insurance valid. Direct buyers only, genuine offers welcome.'
  );

  // STEP 7: Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Brand dropdown ref for click outside
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Category -> Brands lookup with search
  const availableCategoryBrands = useMemo(() => {
    const list = getBrandsForCategory(category);
    if (!brandSearch.trim()) return list;
    const query = brandSearch.toLowerCase().trim();
    return list.filter(b => b.name.toLowerCase().includes(query));
  }, [category, getBrandsForCategory, brandSearch]);

  // Brand -> Models lookup
  const activeBrandName = isCustomBrand ? customBrandName : brand;
  const availableBrandModels = useMemo(() => {
    if (!activeBrandName || activeBrandName === 'Others') return [];
    return getModelsForBrand(activeBrandName);
  }, [activeBrandName, getModelsForBrand]);

  // Model -> Variants lookup
  const activeModelName = isCustomModel ? customModelName : model;
  const availableModelVariants = useMemo(() => {
    if (!activeModelName || activeModelName === 'Other Model') return [];
    return getVariantsForModel(activeModelName);
  }, [activeModelName, getVariantsForModel]);

  // Dynamic Insurance Status calculation (Requirement 1 & 2)
  const insuranceCalculation = useMemo(() => {
    return calculateInsuranceStatus(insuranceValidUntil);
  }, [insuranceValidUntil]);

  // Requirement 16: Category change cascade reset
  const handleCategorySelect = (newCat: VehicleCategory) => {
    setCategory(newCat);
    setBrand('');
    setModel('');
    setVariant('');
    setIsCustomBrand(false);
    setCustomBrandName('');
    setIsCustomModel(false);
    setCustomModelName('');
    setBrandSearch('');
  };

  // Requirement 16: Brand change cascade reset
  const handleBrandSelect = (selectedBrandName: string) => {
    if (selectedBrandName === 'Others') {
      setIsCustomBrand(true);
      setBrand('Others');
      setCustomBrandName('');
    } else {
      setIsCustomBrand(false);
      setCustomBrandName('');
      setBrand(selectedBrandName);
    }
    setModel('');
    setVariant('');
    setIsCustomModel(false);
    setCustomModelName('');
    setIsBrandDropdownOpen(false);
    setBrandSearch('');
  };

  // Requirement 16: Model change cascade reset
  const handleModelSelect = (selectedModelName: string) => {
    if (selectedModelName === 'Other Model') {
      setIsCustomModel(true);
      setModel('Other Model');
      setCustomModelName('');
    } else {
      setIsCustomModel(false);
      setCustomModelName('');
      setModel(selectedModelName);
    }
    setVariant('');
  };

  // Auto-fill from VAHAN registration lookup
  const handleLookupSuccess = (data: NormalizedVehicleLookupResponse) => {
    if (!data.vehicle) return;
    setVerifiedResult(data);
    setLookupStatus('LOOKUP_SUCCESS');

    if (data.vehicle.manufacturer) {
      setBrand(data.vehicle.manufacturer);
      setIsCustomBrand(false);
    }
    if (data.vehicle.model) {
      setModel(data.vehicle.model);
      setIsCustomModel(false);
    }
    if (data.vehicle.variant) setVariant(data.vehicle.variant);
    if (data.vehicle.manufacturingYear) {
      setYear(Number(data.vehicle.manufacturingYear) || 2023);
      setRegistrationYear(Number(data.vehicle.manufacturingYear) || 2023);
    }
    if (data.vehicle.fuelType) setFuelType(data.vehicle.fuelType as FuelType);
    if (data.vehicle.transmission) setTransmission(data.vehicle.transmission as TransmissionType);
    if (data.vehicle.color) setColor(data.vehicle.color);
    if (data.vehicle.engineCapacityCC) setEngineCapacity(`${data.vehicle.engineCapacityCC} cc`);
    if (data.vehicle.rtoCode) setRtoCity(data.vehicle.rtoName ? `${data.vehicle.rtoCode} - ${data.vehicle.rtoName}` : data.vehicle.rtoCode);
    if (data.vehicle.state) setStateName(data.vehicle.state);
  };

  // Document upload handler
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'rcFront' | 'rcBack' | 'insurance' | 'serviceRecord'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if ((type === 'rcFront' || type === 'rcBack') && isPdf) {
      showToast('Invalid Format', 'RC front and back must be JPG, JPEG, PNG, or WEBP images.', 'error');
      return;
    }

    if (!isPdf && !validImageTypes.includes(file.type)) {
      showToast('Invalid Format', 'Supported formats: JPG, JPEG, PNG, WEBP (and PDF for insurance/service records).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const item: DocumentUploadItem = {
        name: file.name,
        url: result,
        isPdf,
        uploaded: true
      };

      if (type === 'rcFront') {
        setRcFront(item);
        showToast('RC Front Uploaded', 'RC Front document uploaded successfully.', 'success');
      } else if (type === 'rcBack') {
        setRcBack(item);
        showToast('RC Back Uploaded', 'RC Back document uploaded successfully.', 'success');
      } else if (type === 'insurance') {
        setInsuranceDoc(item);
        showToast('Insurance Uploaded', 'Insurance policy uploaded successfully.', 'success');
      } else {
        setServiceRecordsDocs(prev => [...prev, item]);
        showToast('Service Record Uploaded', `${file.name} added to service history.`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Native Android Camera/Gallery Document Capture Handler
  const handleNativeDocCapture = async (
    type: 'rcFront' | 'rcBack' | 'insurance',
    source: 'camera' | 'photos'
  ) => {
    const dataUrl = await AndroidNativeService.captureImage(source);
    if (!dataUrl) return;
    const item: DocumentUploadItem = {
      name: `${type}_${Date.now()}.jpg`,
      url: dataUrl,
      isPdf: false,
      uploaded: true
    };
    if (type === 'rcFront') {
      setRcFront(item);
      showToast('RC Front Captured', 'RC Front captured successfully.', 'success');
    } else if (type === 'rcBack') {
      setRcBack(item);
      showToast('RC Back Captured', 'RC Back captured successfully.', 'success');
    } else if (type === 'insurance') {
      setInsuranceDoc(item);
      showToast('Insurance Captured', 'Insurance document captured successfully.', 'success');
    }
  };

  // Requirement 26: Seller Validation with field-specific errors
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!registrationNumber.trim()) {
        showToast('Registration Required', 'Please enter your vehicle registration number.', 'error');
        return false;
      }
    }

    if (step === 2) {
      const finalBrand = isCustomBrand ? customBrandName.trim() : brand.trim();
      const finalModel = isCustomModel ? customModelName.trim() : model.trim();
      if (!finalBrand) {
        showToast('Brand Required', 'Please select or enter the vehicle brand.', 'error');
        return false;
      }
      if (!finalModel) {
        showToast('Model Required', 'Please select or enter the vehicle model.', 'error');
        return false;
      }
    }

    if (step === 3) {
      if (kmDriven < 0 || isNaN(kmDriven)) {
        showToast('Invalid Reading', 'Please specify realistic kilometers driven or operating hours.', 'error');
        return false;
      }

      // Requirement 1 & 26: Condition & Additional Details validations
      if (hasSpareKey === null || hasSpareKey === undefined) {
        showToast('Spare Key Required', 'Please select Spare Key status (Yes or No).', 'error');
        return false;
      }
      if (!insuranceValidUntil) {
        showToast('Insurance Date Required', 'Please enter Insurance Validity date.', 'error');
        return false;
      }
      if (!hypothecationStatus) {
        showToast('Hypothecation Required', 'Please select Hypothecation Status.', 'error');
        return false;
      }
      if (hypothecationStatus === 'Active Loan / Hypothecated' && !financierName.trim()) {
        showToast('Financier Name', 'Please enter the Financier or Bank name for active loan.', 'error');
        return false;
      }
      if (!oemServiceStatus) {
        showToast('OEM Service Required', 'Please select OEM / Authorized Service History status.', 'error');
        return false;
      }
      if (!engineWarrantyStatus) {
        showToast('Engine Warranty Required', 'Please select Engine Warranty status.', 'error');
        return false;
      }
      if (engineWarrantyStatus === 'Active' && !engineWarrantyValidUntil) {
        showToast('Warranty Expiry Date', 'Please enter Engine Warranty Valid Until date.', 'error');
        return false;
      }
      if (!majorAccidentHistory) {
        showToast('Accident History Required', 'Please select Major Accident History.', 'error');
        return false;
      }
      if (majorAccidentHistory === 'Yes' && !majorAccidentDetails.trim()) {
        showToast('Accident Details', 'Please briefly describe the accident and repairs.', 'error');
        return false;
      }

      // Requirement 3 & 4: Commercial vehicle specifications validation
      const isCommercial = category === 'Trucks & Lorries' || category === 'Buses' || category === 'Heavy Machinery Vehicles';
      if (isCommercial) {
        if (loadCapacity !== '' && (Number(loadCapacity) < 0 || isNaN(Number(loadCapacity)))) {
          showToast('Invalid Load Capacity', 'Load capacity cannot be a negative value.', 'error');
          return false;
        }
        if (bucketCapacity !== '' && (Number(bucketCapacity) < 0 || isNaN(Number(bucketCapacity)))) {
          showToast('Invalid Bucket Capacity', 'Bucket capacity cannot be a negative value.', 'error');
          return false;
        }
        if (maxOperatingWeight !== '' && (Number(maxOperatingWeight) < 0 || isNaN(Number(maxOperatingWeight)))) {
          showToast('Invalid Operating Weight', 'Maximum operating weight cannot be a negative value.', 'error');
          return false;
        }
        if (maxHeightCapacity !== '' && (Number(maxHeightCapacity) < 0 || isNaN(Number(maxHeightCapacity)))) {
          showToast('Invalid Height Capacity', 'Maximum height capacity cannot be a negative value.', 'error');
          return false;
        }
        if (maxLiftCapacity !== '' && (Number(maxLiftCapacity) < 0 || isNaN(Number(maxLiftCapacity)))) {
          showToast('Invalid Lift Capacity', 'Maximum lift capacity cannot be a negative value.', 'error');
          return false;
        }
      }

      // Requirement 5: Heavy Machinery specifications validation
      if (category === 'Heavy Machinery Vehicles') {
        if (maximumDiggingPower !== '' && (Number(maximumDiggingPower) < 0 || isNaN(Number(maximumDiggingPower)))) {
          showToast('Invalid Digging Power', 'Maximum digging power cannot be a negative value.', 'error');
          return false;
        }
        if (enginePower !== '' && (Number(enginePower) < 0 || isNaN(Number(enginePower)))) {
          showToast('Invalid Engine Power', 'Engine power cannot be a negative value.', 'error');
          return false;
        }
      }
    }

    if (step === 4) {
      if (!rcFront?.url || !rcBack?.url || !insuranceDoc?.url) {
        showToast('Documents Required', 'Please upload RC Front, RC Back, and Insurance document before submitting your vehicle.', 'error');
        return false;
      }
    }

    if (step === 5) {
      if (images.length === 0) {
        showToast('Photos Required', 'Please attach at least one vehicle photo.', 'error');
        return false;
      }
    }

    if (step === 6) {
      if (price <= 0 || isNaN(price)) {
        showToast('Price Required', 'Please set an expected price for your vehicle.', 'error');
        return false;
      }
      if (!city.trim()) {
        showToast('City Required', 'Please select your city.', 'error');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = () => {
    if (!rcFront?.url || !rcBack?.url || !insuranceDoc?.url) {
      showToast('Documents Required', 'Please upload RC Front, RC Back, and Insurance document before submitting your vehicle.', 'error');
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);
    const finalBrand = isCustomBrand ? customBrandName.trim() : brand.trim();
    const finalModel = isCustomModel ? customModelName.trim() : model.trim();
    const vehicleTitle = `${year} ${finalBrand} ${finalModel} ${variant ? variant : ''}`.trim();

    const result = addVehicle({
      title: vehicleTitle,
      category,
      brand: finalBrand,
      model: finalModel,
      variant: variant || '',
      is_custom_brand: isCustomBrand,
      custom_brand_name: isCustomBrand ? customBrandName.trim() : undefined,
      year: Number(year),
      registrationYear: Number(registrationYear),
      price: Number(price),
      negotiable,
      kmDriven: Number(kmDriven),
      fuelType,
      transmission,
      ownership,
      condition,
      location: {
        city,
        state: stateName,
        area
      },
      rtoState: stateName,
      rtoCity,
      images,
      coverImageIndex: coverIndex,
      features: selectedFeatures,
      description,
      engineCapacity,
      mileage,
      color,
      status: 'Pending Approval',

      // Requirement 1 & 2: Vehicle Condition & Additional Details (All 6 Categories)
      has_spare_key: Boolean(hasSpareKey),
      insurance_valid_until: insuranceValidUntil,
      hypothecation_status: hypothecationStatus,
      financier_name: hypothecationStatus === 'Active Loan / Hypothecated' ? financierName : undefined,
      oem_service_status: oemServiceStatus,
      service_records_docs: serviceRecordsDocs.map(d => d.url),
      engine_warranty_status: engineWarrantyStatus,
      engine_warranty_valid_until: engineWarrantyStatus === 'Active' ? engineWarrantyValidUntil : undefined,
      major_accident_history: majorAccidentHistory,
      major_accident_details: majorAccidentHistory === 'Yes' ? majorAccidentDetails : undefined,

      // Requirements 3 & 4: Commercial Specifications
      load_capacity: loadCapacity !== '' ? Number(loadCapacity) : undefined,
      load_capacity_unit: loadCapacityUnit,
      bucket_capacity: bucketCapacity !== '' ? Number(bucketCapacity) : undefined,
      bucket_capacity_unit: bucketCapacityUnit,
      max_operating_weight: maxOperatingWeight !== '' ? Number(maxOperatingWeight) : undefined,
      max_operating_weight_unit: maxOperatingWeightUnit,
      max_height_capacity: maxHeightCapacity !== '' ? Number(maxHeightCapacity) : undefined,
      max_height_capacity_unit: maxHeightCapacityUnit,
      max_lift_capacity: maxLiftCapacity !== '' ? Number(maxLiftCapacity) : undefined,
      max_lift_capacity_unit: maxLiftCapacityUnit,

      // Requirement 5: Heavy Machinery Specifications
      maximum_digging_power: maximumDiggingPower !== '' ? Number(maximumDiggingPower) : undefined,
      maximum_digging_power_unit: maximumDiggingPowerUnit,
      engine_power: enginePower !== '' ? Number(enginePower) : undefined,
      engine_power_unit: enginePowerUnit,

      // Documents
      rc_front_url: rcFront.url,
      rc_back_url: rcBack.url,
      insurance_document_url: insuranceDoc.url,
      rc_verification_status: 'PENDING',
      insurance_verification_status: 'PENDING',
      documents_uploaded_at: new Date().toISOString(),
      documents: [
        {
          id: `doc-rc-front-${Date.now()}`,
          name: 'Registration Certificate (RC Front)',
          type: 'RC',
          url: rcFront.url,
          verified: false
        },
        {
          id: `doc-rc-back-${Date.now()}`,
          name: 'Registration Certificate (RC Back)',
          type: 'RC',
          url: rcBack.url,
          verified: false
        },
        {
          id: `doc-insurance-${Date.now()}`,
          name: 'Insurance Policy Certificate',
          type: 'Insurance',
          url: insuranceDoc.url,
          verified: false
        }
      ]
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(
      'Listing Submitted!',
      'Your vehicle has been submitted for direct owner verification. Our compliance team will review your RC and Insurance within 2-4 hours.',
      'success'
    );

    setIsSubmitting(false);
    navigate(`/vehicle/${result.vehicleId || ''}`);
  };

  const isCommercialCategory = category === 'Trucks & Lorries' || category === 'Buses' || category === 'Heavy Machinery Vehicles';
  const isHeavyMachineryCategory = category === 'Heavy Machinery Vehicles';

  const allAvailableFeatures = [
    'Touchscreen Infotainment',
    'Reverse Parking Camera',
    'Panoramic Sunroof',
    'Alloy Wheels',
    'Push Button Start / Keyless',
    'Cruise Control',
    'GPS Telematics',
    'Dual Front Airbags',
    'ABS with EBD',
    'Power Steering & Windows',
    'Company Fitted AC Cabin',
    'Heavy Duty Hydraulic Pump'
  ];

  const handleToggleFeature = (feat: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* PAGE HEADER */}
      <div className="bg-gradient-to-r from-[#77101F] to-[#550B15] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>0% Brokerage Direct-Owner Listing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
            List Your Vehicle For Sale
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
            Sell directly to verified buyers across India. Provide accurate vehicle specifications and condition details to get maximum buyer enquiries.
          </p>
        </div>
      </div>

      {/* STEP INDICATOR BAR */}
      <div className="bg-white rounded-2xl p-4 border border-[#DCE3EC] shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {[
            { num: 1, title: 'Registration' },
            { num: 2, title: 'Make & Model' },
            { num: 3, title: 'Condition & Specs' },
            { num: 4, title: 'Documents' },
            { num: 5, title: 'Photos' },
            { num: 6, title: 'Pricing' },
            { num: 7, title: 'Preview' }
          ].map(s => (
            <div key={s.num} className="flex items-center gap-2">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  currentStep === s.num
                    ? 'bg-[#77101F] text-white shadow-xs scale-105'
                    : currentStep > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${
                currentStep === s.num ? 'text-[#77101F]' : currentStep > s.num ? 'text-slate-800' : 'text-slate-400'
              }`}>
                {s.title}
              </span>
              {s.num < 7 && <div className="w-6 h-px bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================
          STEP 1: REGISTRATION NUMBER & VAHAN LOOKUP
      ==================================================== */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-[#DCE3EC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DCE3EC] pb-4">
            <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2 font-display">
              <ShieldCheck className="w-5 h-5 text-[#77101F]" />
              <span>Step 1: Vehicle Registration Number</span>
            </h2>
            <p className="text-xs text-[#667085] mt-1">
              Enter the official registration number from your RC Smart Card.
            </p>
          </div>

          <RegistrationLookupCard
            registrationNumber={registrationNumber}
            onRegistrationChange={setRegistrationNumber}
            onLookupSuccess={handleLookupSuccess}
            onManualEntrySelect={() => {
              setLookupStatus('LOOKUP_FAILED');
              setCurrentStep(2);
            }}
            existingVehicles={vehicles}
            onViewExistingVehicle={(vid) => {
              setSelectedVehicleId(vid);
              navigate(`/buy/${vid}`);
            }}
            lookupStatus={lookupStatus}
            setLookupStatus={setLookupStatus}
            verifiedResult={verifiedResult}
            allowManualEdit={allowManualCorrection}
            onRequestManualCorrection={() => setAllowManualCorrection(true)}
          />
        </div>
      )}

      {/* ====================================================
          STEP 2: VEHICLE CATEGORY -> BRAND -> MODEL -> VARIANT
      ==================================================== */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-[#DCE3EC] p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-[#101828] border-b border-[#DCE3EC] pb-3 flex items-center gap-2 font-display">
            <Car className="w-5 h-5 text-[#77101F]" />
            <span>Step 2: Category, Brand & Model Architecture</span>
          </h2>

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold text-[#101828] uppercase tracking-wider mb-2">
              Vehicle Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 ${
                    category === cat
                      ? 'bg-[#77101F] text-white border-[#77101F] shadow-sm'
                      : 'bg-[#F7F9FC] border-[#DCE3EC] text-[#101828] hover:border-[#77101F]'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Brand -> Model -> Variant Cascade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Searchable Brand Dropdown */}
            <div className="relative" ref={brandDropdownRef}>
              <label className="block text-xs font-bold text-[#101828] mb-1">
                Make / Brand ({category}) *
              </label>
              
              <div 
                onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] bg-white flex items-center justify-between cursor-pointer hover:border-[#77101F]"
              >
                <span>{isCustomBrand ? `Others (${customBrandName || 'Custom'})` : brand || 'Select Brand...'}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>

              {/* Searchable Dropdown Menu */}
              {isBrandDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-hidden flex flex-col animate-in fade-in duration-100">
                  <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={brandSearch}
                      onChange={e => setBrandSearch(e.target.value)}
                      placeholder="Search brands (e.g. roy, bm, tata)..."
                      className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800 placeholder:text-slate-400"
                      autoFocus
                    />
                  </div>

                  <div className="overflow-y-auto max-h-52 divide-y divide-slate-100 text-xs">
                    {availableCategoryBrands.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 text-xs">
                        No matching brands found
                      </div>
                    ) : (
                      availableCategoryBrands.map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleBrandSelect(b.name)}
                          className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors ${
                            brand === b.name && !isCustomBrand ? 'bg-[#77101F]/5 text-[#77101F] font-bold' : 'text-slate-700 font-medium'
                          }`}
                        >
                          <span>{b.name}</span>
                          {brand === b.name && !isCustomBrand && <Check className="w-3.5 h-3.5 text-[#77101F]" />}
                        </button>
                      ))
                    )}
                    {/* Always include Others option */}
                    <button
                      type="button"
                      onClick={() => handleBrandSelect('Others')}
                      className={`w-full text-left px-3.5 py-2.5 hover:bg-amber-50 flex items-center justify-between text-amber-900 font-bold bg-amber-50/50 ${
                        isCustomBrand ? 'border-l-4 border-amber-500' : ''
                      }`}
                    >
                      <span>Others (Enter custom brand)</span>
                      {isCustomBrand && <Check className="w-3.5 h-3.5 text-amber-700" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Brand Name Input if "Others" selected */}
              {isCustomBrand && (
                <div className="mt-2 space-y-1 animate-in fade-in">
                  <label className="block text-[11px] font-bold text-amber-900">Brand Name *</label>
                  <input
                    type="text"
                    value={customBrandName}
                    onChange={e => setCustomBrandName(e.target.value)}
                    placeholder="Enter vehicle brand"
                    className="w-full text-xs font-semibold p-2.5 border border-amber-300 rounded-xl bg-amber-50/40 text-slate-900 focus:outline-hidden focus:border-[#77101F]"
                  />
                  <p className="text-[10px] text-slate-500">Custom brand saved separately from master list.</p>
                </div>
              )}
            </div>

            {/* Model Input or Dropdown */}
            <div>
              <label className="block text-xs font-bold text-[#101828] mb-1">
                Model Name *
              </label>
              {availableBrandModels.length > 0 && !isCustomBrand ? (
                <div className="space-y-2">
                  <select
                    value={isCustomModel ? 'Other Model' : model}
                    onChange={e => handleModelSelect(e.target.value)}
                    className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                  >
                    <option value="">Select Model...</option>
                    {availableBrandModels.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                    <option value="Other Model">Other Model (Manual Entry)</option>
                  </select>

                  {isCustomModel && (
                    <input
                      type="text"
                      value={customModelName}
                      onChange={e => setCustomModelName(e.target.value)}
                      placeholder="Enter model name"
                      className="w-full text-xs font-semibold p-2.5 border border-amber-300 rounded-xl bg-amber-50/40 text-slate-900 focus:outline-hidden focus:border-[#77101F]"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="Enter model (e.g. Creta, Thar, Classic 350)"
                  className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                />
              )}
            </div>

            {/* Variant Dropdown or Input */}
            <div>
              <label className="block text-xs font-bold text-[#101828] mb-1">
                Variant / Trim
              </label>
              {availableModelVariants.length > 0 && !isCustomBrand && !isCustomModel ? (
                <div className="space-y-2">
                  <select
                    value={variant}
                    onChange={e => setVariant(e.target.value)}
                    className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                  >
                    <option value="">Select Variant...</option>
                    {availableModelVariants.map(v => (
                      <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="text"
                  value={variant}
                  onChange={e => setVariant(e.target.value)}
                  placeholder="e.g. SX (O) Turbo, 4WD, Top End"
                  className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                />
              )}
            </div>

            {/* Manufacturing Year */}
            <div>
              <label className="block text-xs font-bold text-[#101828] mb-1">Manufacturing Year *</label>
              <select
                value={year}
                onChange={e => {
                  setYear(Number(e.target.value));
                  setRegistrationYear(Number(e.target.value));
                }}
                className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
              >
                {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2012, 2010, 2008, 2005].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-xs font-bold text-[#101828] mb-1">Fuel Type *</label>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value as FuelType)}
                className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
              >
                {(masterFuelTypes.length > 0 ? masterFuelTypes : ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']).map(f => (
                  <option key={f} value={f.split(' ')[0] as FuelType}>{f}</option>
                ))}
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-xs font-bold text-[#101828] mb-1">Transmission *</label>
              <select
                value={transmission}
                onChange={e => setTransmission(e.target.value as TransmissionType)}
                className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
              >
                {(masterTransmissionTypes.length > 0 ? masterTransmissionTypes : ['Manual', 'Automatic']).map(t => (
                  <option key={t} value={t as TransmissionType}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          STEP 3: VEHICLE CONDITION & ADDITIONAL SPECIFICATIONS
          (Requirements 1-6, 26, 27)
      ==================================================== */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* SECTION A: Vehicle Condition & Additional Details (ALL 6 CATEGORIES) */}
          <div className="bg-white rounded-2xl border border-[#DCE3EC] p-6 sm:p-8 shadow-xs space-y-6">
            <div 
              onClick={() => toggleAccordion('condition')}
              className="flex items-center justify-between border-b border-[#DCE3EC] pb-3 cursor-pointer sm:cursor-default"
            >
              <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2 font-display">
                <Layers className="w-5 h-5 text-[#77101F]" />
                <span>Vehicle Condition & Additional Details</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full ml-2">
                  All Vehicles
                </span>
              </h2>
              <ChevronDown className={`w-4 h-4 text-slate-400 sm:hidden transition-transform ${accordionState.condition ? 'rotate-180' : ''}`} />
            </div>

            {accordionState.condition && (
              <div className="space-y-5 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Basic condition & KM */}
                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">
                      {category === 'Tractors & Backhoe Loaders' || category === 'Heavy Machinery Vehicles' ? 'Operating Hours *' : 'Kilometers Driven *'}
                    </label>
                    <input
                      type="number"
                      value={kmDriven}
                      min={0}
                      onChange={e => setKmDriven(Math.max(0, Number(e.target.value)))}
                      placeholder="e.g. 24000"
                      className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">Ownership Serial *</label>
                    <select
                      value={ownership}
                      onChange={e => setOwnership(e.target.value as OwnershipType)}
                      className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                    >
                      <option value="1st Owner">1st Owner (Direct Owner)</option>
                      <option value="2nd Owner">2nd Owner</option>
                      <option value="3rd Owner">3rd Owner</option>
                      <option value="4th Owner+">4th Owner+</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* 1. Spare Key (Requirement 1) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#101828] flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#77101F]" />
                      <span>Spare Key Available *</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setHasSpareKey(true)}
                        className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          hasSpareKey === true
                            ? 'bg-[#77101F] text-white border-[#77101F] shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {hasSpareKey === true && <Check className="w-3.5 h-3.5" />}
                        <span>Yes</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasSpareKey(false)}
                        className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          hasSpareKey === false
                            ? 'bg-[#77101F] text-white border-[#77101F] shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {hasSpareKey === false && <Check className="w-3.5 h-3.5" />}
                        <span>No</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Insurance Validity (Requirement 1) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#101828] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#77101F]" />
                        <span>Insurance Validity *</span>
                      </label>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${insuranceCalculation.badgeClass}`}>
                        {insuranceCalculation.label}
                      </span>
                    </div>
                    <input
                      type="date"
                      value={insuranceValidUntil}
                      onChange={e => setInsuranceValidUntil(e.target.value)}
                      className="w-full text-xs font-semibold p-2.5 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                    />
                  </div>

                  {/* 3. Hypothecation Status (Requirement 1) */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-[#101828] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#77101F]" />
                      <span>Hypothecation Status *</span>
                    </label>
                    <select
                      value={hypothecationStatus}
                      onChange={e => setHypothecationStatus(e.target.value)}
                      className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                    >
                      <option value="No Hypothecation / Clear">No Hypothecation / Clear</option>
                      <option value="Active Loan / Hypothecated">Active Loan / Hypothecated</option>
                      <option value="NOC Available">NOC Available</option>
                      <option value="Loan Closed - Removal Pending">Loan Closed - Removal Pending</option>
                      <option value="Not Sure">Not Sure</option>
                    </select>

                    {hypothecationStatus === 'Active Loan / Hypothecated' && (
                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 mt-2 space-y-1 animate-in fade-in">
                        <label className="block text-[11px] font-bold text-amber-900">
                          Financier / Bank Name *
                        </label>
                        <input
                          type="text"
                          value={financierName}
                          onChange={e => setFinancierName(e.target.value)}
                          placeholder="e.g. HDFC Bank, SBI, Mahindra Finance"
                          className="w-full text-xs font-semibold p-2.5 bg-white border border-amber-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-[#77101F]"
                        />
                        <p className="text-[10px] text-amber-800">
                          Note: Sensitive loan account numbers are never exposed publicly.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 4. OEM / Authorized Service History (Requirement 1) */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-[#101828] flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-[#77101F]" />
                      <span>OEM / Authorized Service History *</span>
                    </label>
                    <select
                      value={oemServiceStatus}
                      onChange={e => setOemServiceStatus(e.target.value)}
                      className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                    >
                      <option value="Full OEM Service History">Full OEM Service History</option>
                      <option value="Partial OEM Service History">Partial OEM Service History</option>
                      <option value="Independent Service History">Independent Service History</option>
                      <option value="No Service Records">No Service Records</option>
                      <option value="Not Available">Not Available</option>
                    </select>

                    {/* Optional Service Records Upload */}
                    <div className="pt-2">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Upload Service Records / Invoices (Optional)
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Attach Service Document</span>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,.pdf"
                            onChange={e => handleFileUpload(e, 'serviceRecord')}
                            className="hidden"
                          />
                        </label>
                        {serviceRecordsDocs.map((doc, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-[11px] bg-slate-100 text-slate-800 px-2 py-1 rounded-md border border-slate-200">
                            <span className="truncate max-w-[150px]">{doc.name}</span>
                            <button
                              type="button"
                              onClick={() => setServiceRecordsDocs(prev => prev.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 5. Engine Warranty (Requirement 1) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#101828] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#77101F]" />
                      <span>Engine Warranty *</span>
                    </label>
                    <select
                      value={engineWarrantyStatus}
                      onChange={e => setEngineWarrantyStatus(e.target.value)}
                      className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                    >
                      <option value="Active">Active</option>
                      <option value="Expired">Expired</option>
                      <option value="Not Available">Not Available</option>
                      <option value="Not Applicable">Not Applicable</option>
                      <option value="Not Sure">Not Sure</option>
                    </select>

                    {engineWarrantyStatus === 'Active' && (
                      <div className="mt-2 space-y-1 animate-in fade-in">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Engine Warranty Valid Until *
                        </label>
                        <input
                          type="date"
                          value={engineWarrantyValidUntil}
                          onChange={e => setEngineWarrantyValidUntil(e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                        />
                      </div>
                    )}
                  </div>

                  {/* 6. Major Accident History (Requirement 1) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#101828] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Major Accident History *</span>
                    </label>
                    <select
                      value={majorAccidentHistory}
                      onChange={e => setMajorAccidentHistory(e.target.value)}
                      className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                    >
                      <option value="No Major Accident">No Major Accident</option>
                      <option value="Yes">Yes</option>
                      <option value="Not Sure">Not Sure</option>
                    </select>

                    {majorAccidentHistory === 'Yes' && (
                      <div className="mt-2 space-y-1 animate-in fade-in">
                        <label className="block text-[11px] font-bold text-rose-800">
                          Major Accident Details *
                        </label>
                        <textarea
                          rows={2}
                          value={majorAccidentDetails}
                          onChange={e => setMajorAccidentDetails(e.target.value)}
                          placeholder="Briefly describe the accident/repairs (e.g. front bumper replacement at authorized center)."
                          className="w-full text-xs p-2.5 border border-rose-300 rounded-xl bg-rose-50/30 text-[#101828] focus:outline-hidden focus:border-rose-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION B: Commercial / Operating Specifications
              (REQUIREMENTS 3, 4, 6: Trucks & Lorries, Buses, Heavy Machinery Vehicles) */}
          {isCommercialCategory && (
            <div className="bg-white rounded-2xl border border-[#DCE3EC] p-6 sm:p-8 shadow-xs space-y-6">
              <div 
                onClick={() => toggleAccordion('commercial')}
                className="flex items-center justify-between border-b border-[#DCE3EC] pb-3 cursor-pointer sm:cursor-default"
              >
                <div>
                  <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2 font-display">
                    <Weight className="w-5 h-5 text-[#77101F]" />
                    <span>Commercial / Operating Specifications</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full ml-2">
                      Commercial Vehicles
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Operating weight, payload capacity, and load units for {category}.
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 sm:hidden transition-transform ${accordionState.commercial ? 'rotate-180' : ''}`} />
              </div>

              {accordionState.commercial && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                  {/* Load Capacity */}
                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">
                      Load Capacity
                    </label>
                    <div className="flex rounded-xl border border-[#DCE3EC] overflow-hidden focus-within:border-[#77101F]">
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={loadCapacity}
                        onChange={e => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                          setLoadCapacity(val);
                        }}
                        placeholder="e.g. 10"
                        className="w-full text-xs font-semibold p-3 focus:outline-hidden"
                      />
                      <select
                        value={loadCapacityUnit}
                        onChange={e => setLoadCapacityUnit(e.target.value as 'Tonnes' | 'kg')}
                        className="bg-slate-50 border-l border-slate-200 text-xs font-bold px-3 text-slate-700 focus:outline-hidden"
                      >
                        <option value="Tonnes">Tonnes</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>

                  {/* Bucket Capacity (For Trucks/Tipper or Machinery) */}
                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">
                      Bucket / Body Volume Capacity
                    </label>
                    <div className="flex rounded-xl border border-[#DCE3EC] overflow-hidden focus-within:border-[#77101F]">
                      <input
                        type="number"
                        min={0}
                        step="0.05"
                        value={bucketCapacity}
                        onChange={e => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                          setBucketCapacity(val);
                        }}
                        placeholder="e.g. 1.2"
                        className="w-full text-xs font-semibold p-3 focus:outline-hidden"
                      />
                      <span className="bg-slate-50 border-l border-slate-200 text-xs font-bold px-4 py-3 text-slate-700">
                        m³
                      </span>
                    </div>
                  </div>

                  {/* Maximum Operating Weight */}
                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">
                      Maximum Operating Weight (GVW)
                    </label>
                    <div className="flex rounded-xl border border-[#DCE3EC] overflow-hidden focus-within:border-[#77101F]">
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={maxOperatingWeight}
                        onChange={e => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                          setMaxOperatingWeight(val);
                        }}
                        placeholder="e.g. 22"
                        className="w-full text-xs font-semibold p-3 focus:outline-hidden"
                      />
                      <select
                        value={maxOperatingWeightUnit}
                        onChange={e => setMaxOperatingWeightUnit(e.target.value as 'tonnes' | 'kg')}
                        className="bg-slate-50 border-l border-slate-200 text-xs font-bold px-3 text-slate-700 focus:outline-hidden"
                      >
                        <option value="tonnes">tonnes</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>

                  {/* Maximum Height Capacity */}
                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">
                      Maximum Height Capacity / Reach
                    </label>
                    <div className="flex rounded-xl border border-[#DCE3EC] overflow-hidden focus-within:border-[#77101F]">
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={maxHeightCapacity}
                        onChange={e => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                          setMaxHeightCapacity(val);
                        }}
                        placeholder="e.g. 12"
                        className="w-full text-xs font-semibold p-3 focus:outline-hidden"
                      />
                      <select
                        value={maxHeightCapacityUnit}
                        onChange={e => setMaxHeightCapacityUnit(e.target.value as 'metres' | 'feet')}
                        className="bg-slate-50 border-l border-slate-200 text-xs font-bold px-3 text-slate-700 focus:outline-hidden"
                      >
                        <option value="metres">metres</option>
                        <option value="feet">feet</option>
                      </select>
                    </div>
                  </div>

                  {/* Maximum Lift Capacity */}
                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">
                      Maximum Lift Capacity
                    </label>
                    <div className="flex rounded-xl border border-[#DCE3EC] overflow-hidden focus-within:border-[#77101F]">
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={maxLiftCapacity}
                        onChange={e => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                          setMaxLiftCapacity(val);
                        }}
                        placeholder="e.g. 5"
                        className="w-full text-xs font-semibold p-3 focus:outline-hidden"
                      />
                      <select
                        value={maxLiftCapacityUnit}
                        onChange={e => setMaxLiftCapacityUnit(e.target.value as 'tonnes' | 'kg')}
                        className="bg-slate-50 border-l border-slate-200 text-xs font-bold px-3 text-slate-700 focus:outline-hidden"
                      >
                        <option value="tonnes">tonnes</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION C: Heavy Machinery Extra Specifications
              (REQUIREMENTS 5 & 6: Heavy Machinery Vehicles ONLY) */}
          {isHeavyMachineryCategory && (
            <div className="bg-white rounded-2xl border border-amber-300 p-6 sm:p-8 shadow-xs space-y-6">
              <div 
                onClick={() => toggleAccordion('heavyMachinery')}
                className="flex items-center justify-between border-b border-amber-200 pb-3 cursor-pointer sm:cursor-default"
              >
                <div>
                  <h2 className="text-lg font-bold text-amber-950 flex items-center gap-2 font-display">
                    <Gauge className="w-5 h-5 text-amber-700" />
                    <span>Heavy Machinery Specifications</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full ml-2">
                      Machinery Only
                    </span>
                  </h2>
                  <p className="text-xs text-amber-800 mt-1">
                    Digging breakout force and industrial engine power ratings.
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-amber-600 sm:hidden transition-transform ${accordionState.heavyMachinery ? 'rotate-180' : ''}`} />
              </div>

              {accordionState.heavyMachinery && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                  {/* Maximum Digging Power */}
                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">
                      Maximum Digging Power / Breakout Force
                    </label>
                    <div className="flex rounded-xl border border-amber-300 overflow-hidden focus-within:border-[#77101F]">
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={maximumDiggingPower}
                        onChange={e => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                          setMaximumDiggingPower(val);
                        }}
                        placeholder="e.g. 150"
                        className="w-full text-xs font-semibold p-3 focus:outline-hidden"
                      />
                      <select
                        value={maximumDiggingPowerUnit}
                        onChange={e => setMaximumDiggingPowerUnit(e.target.value)}
                        className="bg-amber-50 border-l border-amber-200 text-xs font-bold px-3 text-amber-900 focus:outline-hidden"
                      >
                        <option value="kN">kN (kilonewtons)</option>
                        <option value="kgf">kgf</option>
                        <option value="bar">bar</option>
                      </select>
                    </div>
                  </div>

                  {/* Engine Power */}
                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">
                      Engine Power Rating
                    </label>
                    <div className="flex rounded-xl border border-amber-300 overflow-hidden focus-within:border-[#77101F]">
                      <input
                        type="number"
                        min={0}
                        step="0.5"
                        value={enginePower}
                        onChange={e => {
                          const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                          setEnginePower(val);
                        }}
                        placeholder="e.g. 135"
                        className="w-full text-xs font-semibold p-3 focus:outline-hidden"
                      />
                      <select
                        value={enginePowerUnit}
                        onChange={e => setEnginePowerUnit(e.target.value as 'HP' | 'kW')}
                        className="bg-amber-50 border-l border-amber-200 text-xs font-bold px-3 text-amber-900 focus:outline-hidden"
                      >
                        <option value="HP">HP (Horsepower)</option>
                        <option value="kW">kW (Kilowatts)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ====================================================
          STEP 4: VEHICLE DOCUMENTS (RC & INSURANCE)
      ==================================================== */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-[#DCE3EC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DCE3EC] pb-3">
            <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2 font-display">
              <FileCheck2 className="w-5 h-5 text-[#77101F]" />
              <span>Step 4: Vehicle Documents</span>
            </h2>
            <p className="text-xs text-[#667085] mt-1">
              RC Front, RC Back, and Insurance documents are strictly mandatory before final listing submission.
            </p>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Privacy &amp; Document Policy</span>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Documents are securely stored and accessible only to authorized verification staff. Property-related documents (RC, insurance, NOC) are visible only to potential buyers after they unlock Owner’s Access. We do not misuse, alter, or share any documents with third parties under any circumstance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* RC Front */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 block">RC Front Card *</span>
                {rcFront?.url && (
                  <button
                    type="button"
                    onClick={() => setRcFront(null)}
                    className="text-[11px] font-bold text-[#77101F] hover:underline cursor-pointer"
                  >
                    Replace
                  </button>
                )}
              </div>
              {rcFront?.url ? (
                <div className="space-y-2">
                  <img src={rcFront.url} alt="RC Front" className="w-full h-28 object-cover rounded-lg border border-slate-300" />
                  <span className="text-[11px] font-bold text-emerald-700 block truncate">{rcFront.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#77101F] rounded-lg p-3.5 flex flex-col items-center justify-center cursor-pointer bg-white text-center">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Upload / Capture RC Front</span>
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'rcFront')} className="hidden" />
                  </label>
                  {Capacitor.isNativePlatform() && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleNativeDocCapture('rcFront', 'camera')}
                        className="py-1.5 px-2 bg-[#77101F] text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        <Camera className="w-3 h-3" /> Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNativeDocCapture('rcFront', 'photos')}
                        className="py-1.5 px-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        <Upload className="w-3 h-3" /> Gallery
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RC Back */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 block">RC Back Card *</span>
                {rcBack?.url && (
                  <button
                    type="button"
                    onClick={() => setRcBack(null)}
                    className="text-[11px] font-bold text-[#77101F] hover:underline cursor-pointer"
                  >
                    Replace
                  </button>
                )}
              </div>
              {rcBack?.url ? (
                <div className="space-y-2">
                  <img src={rcBack.url} alt="RC Back" className="w-full h-28 object-cover rounded-lg border border-slate-300" />
                  <span className="text-[11px] font-bold text-emerald-700 block truncate">{rcBack.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#77101F] rounded-lg p-3.5 flex flex-col items-center justify-center cursor-pointer bg-white text-center">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Upload / Capture RC Back</span>
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'rcBack')} className="hidden" />
                  </label>
                  {Capacitor.isNativePlatform() && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleNativeDocCapture('rcBack', 'camera')}
                        className="py-1.5 px-2 bg-[#77101F] text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        <Camera className="w-3 h-3" /> Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNativeDocCapture('rcBack', 'photos')}
                        className="py-1.5 px-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        <Upload className="w-3 h-3" /> Gallery
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Insurance Doc */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 block">Insurance Policy *</span>
                {insuranceDoc?.url && (
                  <button
                    type="button"
                    onClick={() => setInsuranceDoc(null)}
                    className="text-[11px] font-bold text-[#77101F] hover:underline cursor-pointer"
                  >
                    Replace
                  </button>
                )}
              </div>
              {insuranceDoc?.url ? (
                <div className="space-y-2">
                  <div className="w-full h-28 bg-white rounded-lg border border-slate-300 flex flex-col items-center justify-center p-2 text-center">
                    <FileText className="w-6 h-6 text-[#77101F] mb-1" />
                    <span className="text-[11px] font-bold text-slate-800 truncate max-w-full">{insuranceDoc.name}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#77101F] rounded-lg p-3.5 flex flex-col items-center justify-center cursor-pointer bg-white text-center">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">Upload Policy (Image / PDF)</span>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={e => handleFileUpload(e, 'insurance')} className="hidden" />
                  </label>
                  {Capacitor.isNativePlatform() && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleNativeDocCapture('insurance', 'camera')}
                        className="py-1.5 px-2 bg-[#77101F] text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        <Camera className="w-3 h-3" /> Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNativeDocCapture('insurance', 'photos')}
                        className="py-1.5 px-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
                      >
                        <Upload className="w-3 h-3" /> Gallery
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          STEP 5: VEHICLE PHOTOS
      ==================================================== */}
      {currentStep === 5 && (
        <div className="bg-white rounded-2xl border border-[#DCE3EC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DCE3EC] pb-3">
            <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2 font-display">
              <Camera className="w-5 h-5 text-[#77101F]" />
              <span>Step 5: Vehicle Photos</span>
            </h2>
            <p className="text-xs text-[#667085] mt-1">
              Add clear exterior and interior photos of your vehicle. Select your preferred cover photo.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-[#77101F] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[#77101F]">Important Notice: 1. Vehicle Image Policy</span>
              <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">
                Vehicle images must not contain text, descriptions, mobile numbers, or any information other than the vehicle image itself. Violations will result in listing deletion without a refund, as per the OnRoadPriz Business Policy.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101828] uppercase tracking-wider mb-2">
              Vehicle Gallery Photos (At least 1 required) *
            </label>
            <ImageUpload
              images={images}
              onChange={setImages}
              coverIndex={coverIndex}
              onSetCover={setCoverIndex}
              maxImages={12}
            />
          </div>
        </div>
      )}

      {/* ====================================================
          STEP 6: PRICE & DESCRIPTION
      ==================================================== */}
      {currentStep === 6 && (
        <div className="bg-white rounded-2xl border border-[#DCE3EC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DCE3EC] pb-3">
            <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2 font-display">
              <IndianRupee className="w-5 h-5 text-[#77101F]" />
              <span>Step 6: Price & Location</span>
            </h2>
            <p className="text-xs text-[#667085] mt-1">
              Set your expected selling price and location details. Direct buyers negotiate directly with zero brokerage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#101828] mb-1">
                Your Expected Price (INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#77101F]">
                  ₹
                </span>
                <input
                  type="number"
                  value={price}
                  min={1}
                  onChange={e => setPrice(Math.max(0, Number(e.target.value)))}
                  placeholder="e.g. 1450000"
                  className="w-full text-xs font-bold pl-8 p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
                />
              </div>
              <p className="text-[11px] text-[#667085] mt-1">
                Amount in Words: ₹{(price / 100000).toFixed(2)} Lakhs
              </p>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#101828]">
                <input
                  type="checkbox"
                  checked={negotiable}
                  onChange={e => setNegotiable(e.target.checked)}
                  className="rounded text-[#77101F] focus:ring-[#77101F]"
                />
                <span>Price is Negotiable with Direct Buyers</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101828] mb-1">State *</label>
              <select
                value={stateName}
                onChange={e => setStateName(e.target.value)}
                className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
              >
                <option value="Telangana">Telangana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi NCR</option>
                <option value="Gujarat">Gujarat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101828] mb-1">City *</label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
              >
                {CITIES_LIST.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#101828] mb-1">
                Locality / Area *
              </label>
              <input
                type="text"
                value={area}
                onChange={e => setArea(e.target.value)}
                placeholder="e.g. Gachibowli, Jubilee Hills, Whitefield"
                className="w-full text-xs font-semibold p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101828] uppercase tracking-wider mb-2">
              Key Features & Highlights
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allAvailableFeatures.map(feat => {
                const isSelected = selectedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => handleToggleFeature(feat)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'bg-[#77101F]/5 border-[#77101F] text-[#77101F] font-bold'
                        : 'bg-[#F7F9FC] border-[#DCE3EC] text-[#101828] hover:border-[#77101F]'
                    }`}
                  >
                    <span>{feat}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#77101F]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101828] mb-1">
              Detailed Description for Buyers *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe vehicle condition, service history, tyre health, and reasons for selling..."
              className="w-full text-xs p-3 border border-[#DCE3EC] rounded-xl text-[#101828] focus:outline-hidden focus:border-[#77101F]"
            />
          </div>
        </div>
      )}

      {/* ====================================================
          STEP 7: PREVIEW & SUBMIT
      ==================================================== */}
      {currentStep === 7 && (
        <div className="bg-white rounded-2xl border border-[#DCE3EC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#DCE3EC] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2 font-display">
                <Eye className="w-5 h-5 text-[#77101F]" />
                <span>Step 7: Preview & Submit Listing</span>
              </h2>
              <p className="text-xs text-[#667085] mt-1">
                Please review all information and mandatory attached documents before submitting.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
              Ready to Publish
            </span>
          </div>

          {/* Vehicle Highlights Summary */}
          <div className="bg-[#F7F9FC] rounded-2xl p-5 border border-[#DCE3EC] flex flex-col md:flex-row gap-5 items-start">
            {images.length > 0 && (
              <img
                src={images[coverIndex] || images[0]}
                alt="Cover Preview"
                className="w-full md:w-56 h-36 object-cover rounded-xl border border-slate-200 shrink-0"
              />
            )}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#77101F] uppercase tracking-wider">
                  {category} • {registrationNumber || 'Direct Owner'}
                </span>
                <span className="text-xl font-black text-[#77101F] font-display">
                  ₹{price.toLocaleString('en-IN')}
                </span>
              </div>
              <h3 className="text-lg font-black text-[#101828]">
                {year} {isCustomBrand ? customBrandName : brand} {isCustomModel ? customModelName : model} {variant}
              </h3>
              <p className="text-xs text-[#667085]">
                {city}, {stateName} • {fuelType} • {transmission} • {kmDriven.toLocaleString('en-IN')} {category === 'Heavy Machinery Vehicles' ? 'Hours' : 'KM'} • {ownership}
              </p>
            </div>
          </div>

          {/* Condition & Specifications Review Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Condition & Operating Specifications Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Spare Key</span>
                <span className="font-bold text-slate-800">{hasSpareKey ? 'Yes (Available)' : 'No'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Insurance Validity</span>
                <span className={`font-bold ${insuranceCalculation.colorClass}`}>
                  {insuranceValidUntil} ({insuranceCalculation.status})
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Hypothecation</span>
                <span className="font-bold text-slate-800">{hypothecationStatus}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">OEM Service</span>
                <span className="font-bold text-slate-800">{oemServiceStatus}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Engine Warranty</span>
                <span className="font-bold text-slate-800">
                  {engineWarrantyStatus} {engineWarrantyStatus === 'Active' ? `(Until ${engineWarrantyValidUntil})` : ''}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Accident History</span>
                <span className="font-bold text-slate-800">{majorAccidentHistory}</span>
              </div>

              {isCommercialCategory && (
                <>
                  {loadCapacity !== '' && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="text-[10px] text-blue-500 font-bold uppercase block">Load Capacity</span>
                      <span className="font-bold text-blue-900">{loadCapacity} {loadCapacityUnit}</span>
                    </div>
                  )}
                  {maxOperatingWeight !== '' && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="text-[10px] text-blue-500 font-bold uppercase block">Max Operating Weight</span>
                      <span className="font-bold text-blue-900">{maxOperatingWeight} {maxOperatingWeightUnit}</span>
                    </div>
                  )}
                </>
              )}

              {isHeavyMachineryCategory && (
                <>
                  {maximumDiggingPower !== '' && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-amber-600 font-bold uppercase block">Digging Power</span>
                      <span className="font-bold text-amber-900">{maximumDiggingPower} {maximumDiggingPowerUnit}</span>
                    </div>
                  )}
                  {enginePower !== '' && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-amber-600 font-bold uppercase block">Engine Power</span>
                      <span className="font-bold text-amber-900">{enginePower} {enginePowerUnit}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Owner "I Agree" Consent & Authorized Listings Policy */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3 text-xs text-slate-800">
            <div className="flex items-center gap-2 font-black text-[#77101F] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Owner Consent (“I Agree”) &amp; Authorized Listings Declaration</span>
            </div>
            <ul className="space-y-1.5 text-[11px] sm:text-xs text-slate-700 list-disc list-inside leading-relaxed">
              <li>
                <strong>Authorized Listings:</strong> To eliminate duplications and fraudulent postings, only the vehicle owner, their parents, spouse, or their children are authorized to list their vehicle on Onroadpriz. Dealers, brokers, and agents are strictly not permitted unless bought and proof of ownership is submitted.
              </li>
              <li>
                <strong>Owner Consent:</strong> By clicking “Confirm &amp; Publish Vehicle” (I Agree), the vehicle owner grants permission for the buyer to access their contact details, RC book, and insurance information. These details will be visible in the buyer’s dashboard only after the buyer purchases the owner details. No access is provided to any user who has not purchased the owner’s access.
              </li>
              <li>
                By listing your vehicle, you confirm that you have read, understood, and accepted Onroadpriz’s{' '}
                <button type="button" onClick={() => navigate('/terms')} className="text-[#77101F] font-bold underline cursor-pointer">
                  Terms, Guidelines
                </button>{' '}
                and{' '}
                <button type="button" onClick={() => navigate('/privacy-policy')} className="text-[#77101F] font-bold underline cursor-pointer">
                  Privacy Policy
                </button>.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION BUTTONS */}
      <div className="flex items-center justify-between pt-4 border-t border-[#DCE3EC]">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="px-5 py-2.5 rounded-xl border border-[#DCE3EC] bg-white text-xs font-bold text-[#101828] hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : <div />}

        {currentStep < 7 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-2.5 rounded-xl bg-[#77101F] text-white text-xs font-bold hover:bg-[#5E0B17] flex items-center gap-1.5 shadow-md transition-all"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFinalSubmit}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-black flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting Listing...' : 'Confirm & Publish Vehicle'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
