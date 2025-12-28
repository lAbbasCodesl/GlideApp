// types/rideSearch.ts
/**
 * Ride Search Entity Types
 * 
 * Represents an active search for rides (for riders)
 * or an active ride offering (for drivers)
 */

import { Location } from './ride';

/**
 * Active ride search/offering
 * Created when user manually searches or auto-match triggers
 */
export interface RideSearch {
  id: string;
  userId: string;
  type: 'driver' | 'rider';  // Is this person offering or looking?
  
  // Route
  startLocation: Location;
  endLocation: Location;
  
  // Timing
  departureTime: Date;
  timeWindow: number;  // Minutes (+/- from departure time)
  
  // Status
  status: 'active' | 'matched' | 'cancelled' | 'expired';
  
  // For drivers: linked ride if created
  rideId?: string;
  
  // For riders: matched rides
  matchedRideIds?: string[];
  pendingRequestIds?: string[];
  confirmedRideId?: string;  // Once they join a ride
  
  // Source
  isAutomatic: boolean;  // From schedule auto-match or manual
  scheduleId?: string;   // If from schedule
  
  // Metadata
  createdAt: Date;
  expiresAt: Date;  // Auto-expire after 24 hours or after departure time
  updatedAt: Date;
}

/**
 * Helper: Check if search is still valid
 */
export const isSearchActive = (search: RideSearch): boolean => {
  if (search.status !== 'active') return false;
  if (new Date() > search.expiresAt) return false;
  if (new Date() > search.departureTime) return false;
  return true;
};

/**
 * Helper: Check if search has matches
 */
export const hasMatches = (search: RideSearch): boolean => {
  if (search.type === 'driver') {
    return !!search.rideId;
  } else {
    return (search.matchedRideIds?.length || 0) > 0;
  }
};

/**
 * Helper: Format search time window
 */
export const formatTimeWindow = (search: RideSearch): string => {
  const time = search.departureTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  
  if (search.timeWindow === 0) return time;
  
  return `${time} (±${search.timeWindow} min)`;
};

/**
 * Helper: Calculate expiration time
 * Searches expire 1 hour after departure time or 24 hours after creation
 */
export const calculateExpiresAt = (departureTime: Date, createdAt: Date): Date => {
  const oneHourAfterDeparture = new Date(departureTime);
  oneHourAfterDeparture.setHours(oneHourAfterDeparture.getHours() + 1);
  
  const twentyFourHoursAfterCreation = new Date(createdAt);
  twentyFourHoursAfterCreation.setHours(twentyFourHoursAfterCreation.getHours() + 24);
  
  // Whichever comes first
  return oneHourAfterDeparture < twentyFourHoursAfterCreation 
    ? oneHourAfterDeparture 
    : twentyFourHoursAfterCreation;
};