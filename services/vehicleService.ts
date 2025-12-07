// services/vehicleService.ts
/**
 * Vehicle Service - Data Access Layer
 * 
 * Handles all Firestore operations for vehicle data.
 * Vehicles are stored inline with user profiles (for now).
 * 
 * FUTURE: If users can have multiple vehicles, extract to separate collection.
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Vehicle } from '../types/user';
import { logError, ErrorSeverity } from '../app/utils/ErrorHandler';

/**
 * Adds or updates a vehicle for a user
 * 
 * @param userId - The user's UID
 * @param vehicleData - Vehicle information
 * @param isUpdate - Whether this is an update (preserves addedAt)
 * 
 * @example
 * await saveVehicle('abc123', {
 *   make: 'Toyota',
 *   model: 'Camry',
 *   year: 2020,
 *   color: 'Blue',
 *   licensePlate: 'ABC123',
 * });
 */
export async function saveVehicle(
  userId: string,
  vehicleData: Omit<Vehicle, 'updatedAt'>,
  isUpdate: boolean = false
): Promise<Vehicle> {
  try {
    const vehicle: Vehicle = {
      ...vehicleData,
      addedAt: isUpdate ? vehicleData.addedAt as any : new Date(),
      updatedAt: new Date(),
    };

    await setDoc(
      doc(db, 'users', userId),
      {
        vehicle,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(isUpdate ? '✅ Vehicle updated' : '✅ Vehicle added');
    return vehicle;
  } catch (error) {
    logError(error, {
      function: 'saveVehicle',
      userId,
      severity: ErrorSeverity.ERROR,
      additionalInfo: { vehicleData, isUpdate },
    });
    throw error;
  }
}

/**
 * Removes vehicle from user profile
 * 
 * @param userId - The user's UID
 */
export async function removeVehicle(userId: string): Promise<void> {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        vehicle: null,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log('✅ Vehicle removed');
  } catch (error) {
    logError(error, {
      function: 'removeVehicle',
      userId,
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}