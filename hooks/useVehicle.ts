// hooks/useVehicle.ts
/**
 * useVehicle Hook - Vehicle Management
 * 
 * Handles all vehicle operations:
 * - Add vehicle
 * - Update vehicle
 * - Remove vehicle
 * - Get vehicle status
 * 
 * WHY A HOOK:
 * - Vehicle operations are independent of auth
 * - Can be reused in multiple components
 * - Easy to test
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Vehicle } from '../types/user';
import { saveVehicle, removeVehicle as removeVehicleService } from '../services/vehicleService';
import { validateVehicle } from '../app/utils/vehicleUtils';
import { logError, createStandardError, ErrorSeverity } from '../app/utils/ErrorHandler';

export function useVehicle() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  /**
   * Get current vehicle from profile
   */
  const vehicle = userProfile?.vehicle;

  /**
   * Check if user has a vehicle
   */
  const hasVehicle = !!vehicle;

  /**
   * Add a new vehicle
   * 
   * @param vehicleData - Vehicle information
   * 
   * @example
   * const { addVehicle } = useVehicle();
   * await addVehicle({
   *   make: 'Toyota',
   *   model: 'Camry',
   *   year: 2020,
   *   color: 'Blue',
   *   licensePlate: 'ABC123',
   * });
   */
  const addVehicle = async (vehicleData: Omit<Vehicle, 'updatedAt'>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    // Validate vehicle data
    const validation = validateVehicle(vehicleData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    setLoading(true);
    try {
      await saveVehicle(user.uid, vehicleData, false);
      
      // Refresh profile in AuthContext
      await refreshUserProfile();

      console.log('✅ Vehicle added');
    } catch (error) {
      logError(error, {
        function: 'useVehicle.addVehicle',
        userId: user.uid,
        severity: ErrorSeverity.ERROR,
        additionalInfo: { vehicleData },
      });
      
      throw createStandardError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update existing vehicle
   * 
   * @param vehicleData - Updated vehicle information
   * 
   * @example
   * const { updateVehicle } = useVehicle();
   * await updateVehicle({
   *   ...currentVehicle,
   *   color: 'Red',
   * });
   */
  const updateVehicle = async (vehicleData: Omit<Vehicle, 'addedAt' | 'updatedAt'>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    if (!vehicle) {
      throw new Error('No vehicle to update');
    }

    // Validate vehicle data
    const validation = validateVehicle(vehicleData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    setLoading(true);
    try {
      // Pass existing addedAt to preserve it
      await saveVehicle(user.uid, {
        ...vehicleData,
        addedAt: vehicle.addedAt as any,
      }, true);
      
      // Refresh profile in AuthContext
      await refreshUserProfile();

      console.log('✅ Vehicle updated');
    } catch (error) {
      logError(error, {
        function: 'useVehicle.updateVehicle',
        userId: user.uid,
        severity: ErrorSeverity.ERROR,
        additionalInfo: { vehicleData },
      });
      
      throw createStandardError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove vehicle from profile
   * 
   * @example
   * const { removeVehicle } = useVehicle();
   * await removeVehicle();
   */
  const removeVehicle = async () => {
    if (!user) {
      throw new Error('No user logged in');
    }

    if (!vehicle) {
      throw new Error('No vehicle to remove');
    }

    setLoading(true);
    try {
      await removeVehicleService(user.uid);
      
      // Refresh profile in AuthContext
      await refreshUserProfile();

      console.log('✅ Vehicle removed');
    } catch (error) {
      logError(error, {
        function: 'useVehicle.removeVehicle',
        userId: user.uid,
        severity: ErrorSeverity.ERROR,
      });
      
      throw createStandardError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    vehicle,
    hasVehicle,
    addVehicle,
    updateVehicle,
    removeVehicle,
  };
}