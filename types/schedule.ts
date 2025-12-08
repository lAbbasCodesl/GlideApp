// types/schedule.ts
/**
 * Schedule Management Types
 * 
 * Handles recurring ride schedules for both drivers and riders
 */

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

/**
 * User's recurring schedule
 * Can be for offering rides (driver) or taking rides (rider)
 */
export interface Schedule {
  id: string;
  userId: string;
  type: 'driver' | 'rider';  // Is this person offering or looking for rides?
  
  // Route info
  startLocation: Location;
  endLocation: Location;
  
  // Timing
  departureTime: string;  // Format: "HH:mm" (24-hour)
  daysOfWeek: DayOfWeek[];
  
  // Settings
  active: boolean;        // Can temporarily disable without deleting
  autoSearch: boolean;    // Automatically search/match rides
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Helper to convert 24-hour time to 12-hour format
 */
export const formatTime12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Helper to get day name
 */
export const getDayName = (day: DayOfWeek): string => {
  const names: Record<DayOfWeek, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };
  return names[day];
};

/**
 * Helper to get short day name
 */
export const getShortDayName = (day: DayOfWeek): string => {
  const names: Record<DayOfWeek, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };
  return names[day];
};

/**
 * Get all days in order
 */
export const ALL_DAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

/**
 * Check if schedule is active today
 */
export const isScheduleActiveToday = (schedule: Schedule): boolean => {
  if (!schedule.active) return false;
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek;
  return schedule.daysOfWeek.includes(today);
};

/**
 * Check if two schedules overlap (same route, similar time)
 */
export const schedulesOverlap = (s1: Schedule, s2: Schedule): boolean => {
  // Check if routes are similar (within 1km)
  const startDistance = calculateDistance(
    s1.startLocation.lat,
    s1.startLocation.lng,
    s2.startLocation.lat,
    s2.startLocation.lng
  );
  
  const endDistance = calculateDistance(
    s1.endLocation.lat,
    s1.endLocation.lng,
    s2.endLocation.lat,
    s2.endLocation.lng
  );
  
  if (startDistance > 1 || endDistance > 1) return false;
  
  // Check if times are within 30 minutes
  const [h1, m1] = s1.departureTime.split(':').map(Number);
  const [h2, m2] = s2.departureTime.split(':').map(Number);
  
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  
  const timeDiff = Math.abs(minutes1 - minutes2);
  if (timeDiff > 30) return false;
  
  // Check if they share any days
  const sharedDays = s1.daysOfWeek.filter(day => s2.daysOfWeek.includes(day));
  return sharedDays.length > 0;
};

/**
 * Calculate distance between two coordinates (in km)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}