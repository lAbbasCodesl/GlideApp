// types/ride.ts - UPDATED
/**
 * Ride Management Types
 * 
 * Handles one-time and scheduled rides
 */

import { Vehicle } from "./user";

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

/**
 * A single ride (one-time or instance of scheduled ride)
 */
export interface Ride {
  id: string;
  driverId: string;
  driver: {
    name: string;
    photo?: string;
    rating: number;
    company?: string;
    verified: boolean;
    phoneNumber?: string;
  };
  
  // Route
  startLocation: Location;
  endLocation: Location;
  
  // Timing
  departureTime: Date;
  estimatedArrival?: Date;
  
  // Pricing
  pricePerSeat: number;      // Calculated from driver's ratePerMile
  totalDistance?: number;     // In miles
  
  // Capacity
  totalSeats: number;         // Max seats driver is offering (1-2)
  availableSeats: number;     // Remaining seats
  
  // Vehicle
  vehicle: Vehicle;
  
  // Status
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  
  // Participants
  riders: RideParticipant[];
  requests: RideRequest[];
  
  // Schedule info (if this is a recurring ride)
  scheduleId?: string;
  isRecurring: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A rider who has joined the ride
 */
export interface RideParticipant {
  userId: string;
  name: string;
  photo?: string;
  phoneNumber?: string;
  company?: string;
  
  // Route (might differ from main ride)
  pickupLocation: Location;
  dropoffLocation: Location;
  walkToPickup?: number;      // meters
  walkFromDrop?: number;      // meters
  
  // Status
  status: 'confirmed' | 'checked-in' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  
  // Timestamps
  joinedAt: Date;
  checkedInAt?: Date;
}

/**
 * A request to join a ride
 */
export interface RideRequest {
  id: string;
  rideId: string;
  riderId: string;
  
  // Rider info
  riderName: string;
  riderPhoto?: string;
  riderCompany?: string;
  riderRating?: number;
  
  // Route
  pickupLocation: Location;
  dropoffLocation: Location;
  walkToPickup: number;       // meters
  walkFromDrop: number;       // meters
  
  // Status
  status: 'pending' | 'accepted' | 'rejected';
  
  // Message from rider
  message?: string;
  
  // Timestamps
  createdAt: Date;
  respondedAt?: Date;
}

/**
 * Search filters for finding rides
 */
export interface RideSearchFilters {
  startLocation: Location;
  endLocation: Location;
  departureTime?: Date;
  maxWalkDistance?: number;   // meters
  minRating?: number;
  maxPrice?: number;
  companiesOnly?: string[];   // Filter by company
}

/**
 * Helper: Check if user is driver of ride
 */
export const isDriver = (ride: Ride, userId: string): boolean => {
  return ride.driverId === userId;
};

/**
 * Helper: Check if user is participant in ride
 */
export const isParticipant = (ride: Ride, userId: string): boolean => {
  return ride.riders.some(r => r.userId === userId);
};

/**
 * Helper: Check if user has pending request for ride
 */
export const hasPendingRequest = (ride: Ride, userId: string): boolean => {
  return ride.requests.some(r => r.riderId === userId && r.status === 'pending');
};

/**
 * Helper: Check if ride is full
 */
export const isRideFull = (ride: Ride): boolean => {
  return ride.availableSeats === 0;
};

/**
 * Helper: Check if ride can be cancelled
 */
export const canCancelRide = (ride: Ride): boolean => {
  // Can cancel if status is scheduled and no riders have joined
  return ride.status === 'scheduled' && ride.riders.length === 0;
};

/**
 * Helper: Get ride participants who haven't paid
 */
export const getUnpaidRiders = (ride: Ride): RideParticipant[] => {
  return ride.riders.filter(r => r.paymentStatus === 'pending');
};

/**
 * Helper: Format ride route for display
 */
export const formatRideRoute = (ride: Ride): string => {
  const start = ride.startLocation.address.split(',')[0];
  const end = ride.endLocation.address.split(',')[0];
  return `${start} → ${end}`;
};

/**
 * Helper: Calculate estimated arrival time
 */
export const calculateArrivalTime = (
  departureTime: Date,
  distanceInMiles: number,
  avgSpeedMph: number = 30
): Date => {
  const travelTimeHours = distanceInMiles / avgSpeedMph;
  const arrivalTime = new Date(departureTime);
  arrivalTime.setHours(arrivalTime.getHours() + travelTimeHours);
  return arrivalTime;
};