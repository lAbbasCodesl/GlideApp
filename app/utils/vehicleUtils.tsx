
// utils/vehicleUtils.ts

import { Vehicle } from "../../types/user";


/**
 * Formats vehicle for display
 * 
 * @example
 * formatVehicleDisplay(vehicle) 
 * // Returns: "2020 Blue Toyota Camry"
 */
export const formatVehicleDisplay = (vehicle: Vehicle): string => {
  return `${vehicle.year} ${vehicle.color} ${vehicle.make} ${vehicle.model}`;
};

/**
 * Formats vehicle for compact display (card views)
 * 
 * @example
 * formatVehicleCompact(vehicle)
 * // Returns: "Blue Toyota Camry"
 */
export const formatVehicleCompact = (vehicle: Vehicle): string => {
  return `${vehicle.color} ${vehicle.make} ${vehicle.model}`;
};

/**
 * Validates vehicle data before submission
 * 
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateVehicle = (vehicle: Partial<Vehicle>): { 
  isValid: boolean; 
  error?: string;
} => {
  if (!vehicle.make || vehicle.make.trim() === '') {
    return { isValid: false, error: 'Please select a vehicle make' };
  }

  if (!vehicle.model || vehicle.model.trim() === '') {
    return { isValid: false, error: 'Please select a vehicle model' };
  }

  if (!vehicle.year || vehicle.year < 2000 || vehicle.year > new Date().getFullYear()) {
    return { isValid: false, error: 'Please select a valid year' };
  }

  if (!vehicle.color || vehicle.color.trim() === '') {
    return { isValid: false, error: 'Please select a vehicle color' };
  }

  if (!vehicle.licensePlate || vehicle.licensePlate.trim() === '') {
    return { isValid: false, error: 'Please enter a license plate number' };
  }

  // Validate license plate format
  const plateRegex = /^[A-Z0-9\s-]{2,10}$/i;
  if (!plateRegex.test(vehicle.licensePlate.trim())) {
    return { 
      isValid: false, 
      error: 'License plate must be 2-10 characters (letters, numbers, spaces, hyphens only)' 
    };
  }

  return { isValid: true };
};

/**
 * Sanitizes license plate input
 * Converts to uppercase, removes invalid characters
 */
export const sanitizeLicensePlate = (plate: string): string => {
  return plate
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, '')
    .slice(0, 10);
};