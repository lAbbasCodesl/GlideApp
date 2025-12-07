// types/user.ts - UPDATED with payment methods and pricing

/**
 * Payment methods supported
 */
export interface PaymentMethods {
  venmo?: string;      // @username
  cashapp?: string;    // $username
  acceptsCash: boolean;
}

/**
 * Core user profile - updated with payment info
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  company?: string;
  rating: number;
  totalRides: number;
  totalRidesOffered: number;
  vehicle?: Vehicle;
  license?: License;
  paymentMethods?: PaymentMethods;  // NEW: How user accepts/sends payments
  onboardingCompleted: boolean;
  hasSeenAppGuide?: boolean;
  hasSeenRiderGuide?: boolean;
  hasSeenDriverGuide?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Vehicle information - with pricing
 */
export interface Vehicle {
  make: string;
  model: string;
  color: string;
  licensePlate: string;
  ratePerMile: number;        // NEW: Rate per mile ($0.50 - $2.00)
  addedAt: Date;
  updatedAt?: Date;
}

/**
 * Driver's license information
 */
export interface License {
  licenseNumber?: string;
  stateOfIssue: string;
  expirationDate?: Date;
  frontPhotoURL?: string;
  backPhotoURL?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  verificationDate?: Date;
  rejectionReason?: string;
  submittedAt: Date;
  updatedAt?: Date;
}

/**
 * Car makes with their popular models
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
 * Helper to get models for a specific make
 */
export const getModelsForMake = (make: string): string[] => {
  const carMake = CAR_MAKES.find(cm => cm.make === make);
  return carMake ? carMake.models : [];
};

/**
 * Calculate ride price based on distance and rate
 * Minimum charge is $5.00
 */
export const calculateRidePrice = (distanceInMiles: number, ratePerMile: number): number => {
  const calculatedPrice = distanceInMiles * ratePerMile;
  return Math.max(5.00, Number(calculatedPrice.toFixed(2)));
};

/**
 * Validate rate per mile
 */
export const isValidRatePerMile = (rate: number): boolean => {
  return rate >= 0.50 && rate <= 2.00;
};

/**
 * Format rate for display
 */
export const formatRate = (rate: number): string => {
  return `$${rate.toFixed(2)}/mile`;
};

/**
 * Format price for display
 */
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

/**
 * Validate payment methods
 */
export const hasPaymentMethod = (paymentMethods?: PaymentMethods): boolean => {
  if (!paymentMethods) return false;
  return !!(paymentMethods.venmo || paymentMethods.cashapp || paymentMethods.acceptsCash);
};

/**
 * Validate Venmo handle
 */
export const isValidVenmoHandle = (handle: string): boolean => {
  // Should start with @ and be 5-30 characters
  const username = handle.trim();

  return username.length >= 4 && username.length <= 30 && /^[a-zA-Z0-9_-]+$/.test(username);
};

/**
 * Validate CashApp handle
 */
export const isValidCashappHandle = (handle: string): boolean => {
  // Should start with $ and be 5-30 characters
  const username = handle.trim();
  return username.length >= 4 && username.length <= 30 && /^[a-zA-Z0-9_-]+$/.test(username);
};

/**
 * Format Venmo handle
 */
export const formatVenmoHandle = (handle: string): string => {
  return handle.trim();

};

/**
 * Format CashApp handle
 */
export const formatCashappHandle = (handle: string): string => {
  return handle.trim();

};

/**
 * Check if user can search/create rides
 * Requires at least one payment method
 */
export const canUseRideFeatures = (profile: UserProfile): boolean => {
  return hasPaymentMethod(profile.paymentMethods);
};

/**
 * Check if user has a vehicle added
 */
export const hasVehicle = (profile: UserProfile): boolean => {
  return !!profile.vehicle;
};

/**
 * Check if user can offer rides (has vehicle + approved license + payment method)
 */
export const canOfferRides = (profile: UserProfile): boolean => {
  return hasVehicle(profile) && 
         !!profile.license && 
         profile.license.verificationStatus === 'approved' &&
         hasPaymentMethod(profile.paymentMethods);
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
 */
export const canOfferRidesWithPending = (profile: UserProfile): boolean => {
  return hasVehicle(profile) && 
         !!profile.license && 
         (profile.license.verificationStatus === 'approved' || 
          profile.license.verificationStatus === 'pending') &&
         hasPaymentMethod(profile.paymentMethods);
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

// Keep all existing validation helpers and constants
export const isValidLicensePlate = (plate: string): boolean => {
  const regex = /^[A-Z0-9\s-]{2,10}$/i;
  return regex.test(plate.trim());
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};