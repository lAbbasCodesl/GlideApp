// hooks/index.ts
/**
 * Central export for all custom hooks
 * Makes imports cleaner across the app
 * 
 * Usage:
 * import { useProfile, useVehicle, useLicense } from '../hooks';
 * 
 * Instead of:
 * import { useProfile } from '../hooks/useProfile';
 * import { useVehicle } from '../hooks/useVehicle';
 * import { useLicense } from '../hooks/useLicense';
 */

export { useProfile } from './useProfile';
export { useVehicle } from './useVehicle';
export { useLicense } from './useLicense';
export { useSchedule } from './useSchedule';  
export { useRide } from './useRide';  