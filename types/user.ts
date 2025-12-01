// types/user.ts - UPDATED FOR PEER-TO-PEER RIDESHARING

/**
 * Core user profile - required for all users
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;        // Required during onboarding
  company?: string;             // Required during onboarding
  rating: number;
  totalRides: number;           // Total rides taken as passenger
  totalRidesOffered: number;    // Total rides offered to others
  vehicle?: Vehicle;            // Vehicle info (optional - only if offering rides)
  license?: License;            // Driver's license info (user-level, not vehicle-level)
  onboardingCompleted: boolean; // Track if user finished initial onboarding
  hasSeenAppGuide?: boolean;
  hasSeenRiderGuide?: boolean;
  hasSeenDriverGuide?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Vehicle information - stored inline with user profile
 * Future: Can be extracted to separate collection for multiple vehicles
 * 
 * Note: This is vehicle-specific info only. Driver's license is separate
 * because one person can have multiple vehicles but only one license.
 */
export interface Vehicle {
  make: string;              // e.g., "Toyota"
  model: string;             // e.g., "Camry"
  year: number;              // e.g., 2020
  color: string;             // e.g., "Blue"
  licensePlate: string;      // e.g., "ABC-123"
  addedAt: Date;             // When vehicle was added
  updatedAt?: Date;          // When vehicle details were last updated
}

/**
 * Driver's license information - belongs to the USER, not the vehicle
 * One user has one license, but can have multiple vehicles
 * 
 * Verification status determines if user can offer rides
 */
export interface License {
  licenseNumber?: string;          // Optional - for admin verification only, not displayed
  stateOfIssue: string;            // e.g., "CA", "NY", "TX"
  expirationDate?: Date;           // Optional - for renewal reminders
  frontPhotoURL?: string;          // Firebase Storage URL for front of license
  backPhotoURL?: string;           // Firebase Storage URL for back of license
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  verificationDate?: Date;         // When license was verified
  rejectionReason?: string;        // If rejected, reason for admin/user
  submittedAt: Date;               // When user submitted for verification
  updatedAt?: Date;                // When license info was last updated
}

/**
 * Car makes with their popular models
 * Used for dropdown selections
 */
export interface CarMake {
  make: string;
  models: string[];
}

/**
 * Static data for vehicle selection
 * Source: Based on most popular cars in US market
 */
export const CAR_MAKES: CarMake[] = [
  {
    make: 'Toyota',
    models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Tacoma', 'Tundra', 'Sienna', '4Runner', 'Avalon'],
  },
  {
    make: 'Honda',
    models: ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'HR-V', 'Ridgeline', 'Passport', 'Insight'],
  },
  {
    make: 'Ford',
    models: ['F-150', 'Escape', 'Explorer', 'Edge', 'Fusion', 'Mustang', 'Ranger', 'Expedition', 'Bronco'],
  },
  {
    make: 'Chevrolet',
    models: ['Silverado', 'Equinox', 'Malibu', 'Traverse', 'Tahoe', 'Suburban', 'Colorado', 'Blazer', 'Camaro'],
  },
  {
    make: 'Nissan',
    models: ['Altima', 'Rogue', 'Sentra', 'Murano', 'Pathfinder', 'Frontier', 'Maxima', 'Armada', 'Kicks'],
  },
  {
    make: 'Jeep',
    models: ['Grand Cherokee', 'Wrangler', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Wagoneer'],
  },
  {
    make: 'Hyundai',
    models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona', 'Palisade', 'Venue', 'Ioniq'],
  },
  {
    make: 'Kia',
    models: ['Forte', 'Optima', 'Sportage', 'Sorento', 'Soul', 'Telluride', 'Seltos', 'Carnival'],
  },
  {
    make: 'Subaru',
    models: ['Outback', 'Forester', 'Crosstrek', 'Impreza', 'Legacy', 'Ascent', 'WRX', 'BRZ'],
  },
  {
    make: 'Mazda',
    models: ['CX-5', 'Mazda3', 'CX-9', 'CX-30', 'Mazda6', 'MX-5 Miata', 'CX-50'],
  },
  {
    make: 'Volkswagen',
    models: ['Jetta', 'Tiguan', 'Atlas', 'Passat', 'Golf', 'Taos', 'Arteon', 'ID.4'],
  },
  {
    make: 'BMW',
    models: ['3 Series', '5 Series', 'X3', 'X5', '7 Series', 'X1', 'X7', '4 Series'],
  },
  {
    make: 'Mercedes-Benz',
    models: ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class', 'A-Class', 'GLA', 'GLS'],
  },
  {
    make: 'Audi',
    models: ['A4', 'Q5', 'A6', 'Q7', 'A3', 'Q3', 'A8', 'e-tron'],
  },
  {
    make: 'Lexus',
    models: ['RX', 'ES', 'NX', 'GX', 'IS', 'UX', 'LS', 'LX'],
  },
  {
    make: 'Tesla',
    models: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  },
  {
    make: 'Ram',
    models: ['1500', '2500', '3500', 'ProMaster'],
  },
  {
    make: 'GMC',
    models: ['Sierra', 'Terrain', 'Acadia', 'Yukon', 'Canyon'],
  },
  {
    make: 'Dodge',
    models: ['Charger', 'Challenger', 'Durango', 'Grand Caravan'],
  },
  {
    make: 'Buick',
    models: ['Encore', 'Enclave', 'Envision'],
  },
  {
    make: 'Other',
    models: ['Other'], // For less common makes
  },
];

/**
 * Common vehicle colors
 */
export const VEHICLE_COLORS = [
  'Black',
  'White',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Brown',
  'Beige',
  'Orange',
  'Yellow',
  'Purple',
  'Gold',
  'Other',
];

/**
 * Vehicle years for dropdown
 * Generates array from current year back to 2000
 */
export const getVehicleYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= 2000; year--) {
    years.push(year);
  }
  return years;
};

/**
 * Helper to get models for a specific make
 */
export const getModelsForMake = (make: string): string[] => {
  const carMake = CAR_MAKES.find(cm => cm.make === make);
  return carMake ? carMake.models : [];
};

/**
 * Validation helpers
 */
export const isValidLicensePlate = (plate: string): boolean => {
  // Basic validation - at least 2 characters, max 10
  // Allows letters, numbers, spaces, hyphens
  const regex = /^[A-Z0-9\s-]{2,10}$/i;
  return regex.test(plate.trim());
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic US phone validation - 10 digits
  // Accepts formats: 1234567890, 123-456-7890, (123) 456-7890
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * Check if user has a vehicle added
 */
export const hasVehicle = (profile: UserProfile): boolean => {
  return !!profile.vehicle;
};

/**
 * Check if user can offer rides (has vehicle + approved license)
 */
export const canOfferRides = (profile: UserProfile): boolean => {
  return hasVehicle(profile) && 
         !!profile.license && 
         profile.license.verificationStatus === 'approved';
};

/**
 * Check if user has pending verification
 */
export const hasPendingVerification = (profile: UserProfile): boolean => {
  return !!profile.license && 
         profile.license.verificationStatus === 'pending';
};

/**
 * Check if user can offer rides with pending verification
 * (Your business rule: allow offering rides while verification is pending)
 */
export const canOfferRidesWithPending = (profile: UserProfile): boolean => {
  return hasVehicle(profile) && 
         !!profile.license && 
         (profile.license.verificationStatus === 'approved' || 
          profile.license.verificationStatus === 'pending');
};

/**
 * Get human-readable verification status
 */
export const getVerificationStatusText = (status: License['verificationStatus']): string => {
  switch (status) {
    case 'pending':
      return 'Verification Pending';
    case 'approved':
      return 'Verified';
    case 'rejected':
      return 'Verification Rejected';
    case 'expired':
      return 'License Expired';
    default:
      return 'Unknown';
  }
};

/**
 * Check if license needs renewal (within 30 days of expiration)
 */
export const needsLicenseRenewal = (license?: License): boolean => {
  if (!license?.expirationDate) return false;
  
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return new Date(license.expirationDate) <= thirtyDaysFromNow;
};