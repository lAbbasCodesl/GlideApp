// services/scheduleService.ts
/**
 * Schedule Service - Data Access Layer
 * 
 * Handles all Firestore operations for ride schedules
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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Schedule } from '../types/schedule';
import { logError, ErrorSeverity } from '../app/utils/ErrorHandler';

/**
 * Get user's schedule
 * Users can only have ONE schedule
 */
export async function getUserSchedule(userId: string): Promise<Schedule | null> {
  try {
    const scheduleDoc = await getDoc(doc(db, 'schedules', userId));
    
    if (scheduleDoc.exists()) {
      const data = scheduleDoc.data();
      return {
        ...data,
        id: scheduleDoc.id,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Schedule;
    }
    
    return null;
  } catch (error) {
    logError(error, {
      function: 'getUserSchedule',
      userId,
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Create or update user's schedule
 * Replaces existing schedule if it exists
 */
export async function saveSchedule(
  userId: string,
  scheduleData: Omit<Schedule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Schedule> {
  try {
    // Check if schedule already exists
    const existing = await getUserSchedule(userId);
    
    const schedule: Omit<Schedule, 'id'> = {
      ...scheduleData,
      userId,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'schedules', userId), schedule);

    console.log(existing ? '✅ Schedule updated' : '✅ Schedule created');
    
    return {
      ...schedule,
      id: userId,
    };
  } catch (error) {
    logError(error, {
      function: 'saveSchedule',
      userId,
      severity: ErrorSeverity.ERROR,
      additionalInfo: { scheduleData },
    });
    throw error;
  }
}

/**
 * Toggle schedule active status
 */
export async function toggleScheduleActive(
  userId: string,
  active: boolean
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'schedules', userId),
      {
        active,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(`✅ Schedule ${active ? 'activated' : 'deactivated'}`);
  } catch (error) {
    logError(error, {
      function: 'toggleScheduleActive',
      userId,
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Delete user's schedule
 */
export async function deleteSchedule(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'schedules', userId));
    console.log('✅ Schedule deleted');
  } catch (error) {
    logError(error, {
      function: 'deleteSchedule',
      userId,
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Find active schedules matching criteria
 * Used for auto-matching rides
 */
export async function findMatchingSchedules(
  type: 'driver' | 'rider',
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  maxDistance: number = 2 // km
): Promise<Schedule[]> {
  try {
    const schedulesRef = collection(db, 'schedules');
    const q = query(
      schedulesRef,
      where('type', '==', type),
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);
    
    const schedules = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Schedule[];

    // Filter by distance (Firestore doesn't support geo queries easily)
    return schedules.filter(schedule => {
      const startDistance = calculateDistance(
        startLat,
        startLng,
        schedule.startLocation.lat,
        schedule.startLocation.lng
      );
      
      const endDistance = calculateDistance(
        endLat,
        endLng,
        schedule.endLocation.lat,
        schedule.endLocation.lng
      );
      
      return startDistance <= maxDistance && endDistance <= maxDistance;
    });
  } catch (error) {
    logError(error, {
      function: 'findMatchingSchedules',
      severity: ErrorSeverity.ERROR,
      additionalInfo: { type, startLat, startLng, endLat, endLng },
    });
    throw error;
  }
}

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