// services/rideSearchService.ts
/**
 * Ride Search Service - Data Access Layer
 * 
 * Handles active searches for rides (both driver offerings and rider searches)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { RideSearch, calculateExpiresAt } from '../types/rideSearch';
import { logError, ErrorSeverity } from '../app/utils/ErrorHandler';

/**
 * Create a new ride search
 */
export async function createRideSearch(
  userId: string,
  searchData: Omit<RideSearch, 'id' | 'userId' | 'createdAt' | 'expiresAt' | 'updatedAt'>
): Promise<RideSearch> {
  try {
    const searchRef = doc(collection(db, 'rideSearches'));
    const now = new Date();
    
    const search: Omit<RideSearch, 'id'> = {
      ...searchData,
      userId,
      createdAt: now,
      expiresAt: calculateExpiresAt(searchData.departureTime, now),
      updatedAt: now,
    };

    await setDoc(searchRef, search);

    console.log('✅ Ride search created:', searchRef.id);
    
    return {
      ...search,
      id: searchRef.id,
    };
  } catch (error) {
    logError(error, {
      function: 'createRideSearch',
      userId,
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Get today's active searches for a user
 */
export async function getTodaysRideSearches(userId: string): Promise<RideSearch[]> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const searchesRef = collection(db, 'rideSearches');
    const q = query(
      searchesRef,
      where('userId', '==', userId),
      where('departureTime', '>=', Timestamp.fromDate(today)),
      where('departureTime', '<', Timestamp.fromDate(tomorrow)),
      where('status', 'in', ['active', 'matched'])
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      departureTime: doc.data().departureTime.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      expiresAt: doc.data().expiresAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as RideSearch[];
  } catch (error) {
    logError(error, {
      function: 'getTodaysRideSearches',
      userId,
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Update ride search status
 */
export async function updateRideSearchStatus(
  searchId: string,
  status: RideSearch['status'],
  updates?: Partial<RideSearch>
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'rideSearches', searchId),
      {
        status,
        ...updates,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(`✅ Ride search status updated to: ${status}`);
  } catch (error) {
    logError(error, {
      function: 'updateRideSearchStatus',
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Cancel ride search
 */
export async function cancelRideSearch(searchId: string): Promise<void> {
  try {
    await updateRideSearchStatus(searchId, 'cancelled');
    console.log('✅ Ride search cancelled');
  } catch (error) {
    logError(error, {
      function: 'cancelRideSearch',
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Delete expired searches
 * Should be called periodically by a background job
 */
export async function deleteExpiredSearches(): Promise<void> {
  try {
    const searchesRef = collection(db, 'rideSearches');
    const q = query(
      searchesRef,
      where('expiresAt', '<', Timestamp.fromDate(new Date()))
    );

    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );

    await Promise.all(deletePromises);

    console.log(`✅ Deleted ${snapshot.size} expired searches`);
  } catch (error) {
    logError(error, {
      function: 'deleteExpiredSearches',
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Get all active searches (for matching)
 */
export async function getActiveSearches(
  type: 'driver' | 'rider'
): Promise<RideSearch[]> {
  try {
    const searchesRef = collection(db, 'rideSearches');
    const q = query(
      searchesRef,
      where('type', '==', type),
      where('status', '==', 'active'),
      where('expiresAt', '>', Timestamp.fromDate(new Date()))
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      departureTime: doc.data().departureTime.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      expiresAt: doc.data().expiresAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as RideSearch[];
  } catch (error) {
    logError(error, {
      function: 'getActiveSearches',
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}