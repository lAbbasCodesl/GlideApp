export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  isDriver: boolean;
  company?: string;
  rating: number;
  totalRides: number;
  hasSeenAppGuide?: boolean;
  hasSeenRiderGuide?: boolean;
  hasSeenDriverGuide?: boolean;
}

export interface DriverProfile extends UserProfile {
  isDriver: true;
  vehicles: Vehicle[];
  licenseVerified: boolean;
  paymentMethods: {
    venmo?: string;
    cashapp?: string;
  };
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
}