import { Vehicle } from "./user";

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Ride {
  id: string;
  driverId: string;
  driver: {
    name: string;
    photo?: string;
    rating: number;
    company?: string;
    verified: boolean;
  };
  startLocation: Location;
  endLocation: Location;
  departureTime: Date;
  pricePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  vehicle: Vehicle;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  riders: RideParticipant[];
  requests: RideRequest[];
}

export interface RideParticipant {
  userId: string;
  name: string;
  photo?: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  status: 'pending' | 'confirmed' | 'checked-in' | 'completed';
  paymentStatus: 'pending' | 'paid';
}

export interface RideRequest {
  id: string;
  riderId: string;
  riderName: string;
  riderPhoto?: string;
  riderCompany?: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  walkToPickup: number; // meters
  walkFromDrop: number; // meters
  status: 'pending' | 'accepted' | 'rejected';
}