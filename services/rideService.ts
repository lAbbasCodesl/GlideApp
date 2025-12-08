// ============================================
// services/rideService.ts - Ride Data Layer
// ============================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Ride, RideRequest, RideParticipant, Location } from '../types/ride';
import { logError, ErrorSeverity } from '../app/utils/ErrorHandler';

/**
 * Create a new ride
 */
export async function createRide(
  rideData: Omit<Ride, 'id' | 'createdAt' | 'updatedAt' | 'riders' | 'requests'>
): Promise<Ride> {
  try {
    const rideRef = doc(collection(db, 'rides'));
    
    const ride: Omit<Ride, 'id'> = {
      ...rideData,
      riders: [],
      requests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(rideRef, ride);

    console.log('✅ Ride created:', rideRef.id);
    
    return {
      ...ride,
      id: rideRef.id,
    };
  } catch (error) {
    logError(error, {
      function: 'createRide',
      userId: rideData.driverId,
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Get ride by ID
 */
export async function getRide(rideId: string): Promise<Ride | null> {
  try {
    const rideDoc = await getDoc(doc(db, 'rides', rideId));
    
    if (rideDoc.exists()) {
      const data = rideDoc.data();
      return {
        ...data,
        id: rideDoc.id,
        departureTime: data.departureTime.toDate(),
        estimatedArrival: data.estimatedArrival?.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Ride;
    }
    
    return null;
  } catch (error) {
    logError(error, {
      function: 'getRide',
      severity: ErrorSeverity.ERROR,
      additionalInfo: { rideId },
    });
    throw error;
  }
}

/**
 * Search for available rides
 */
export async function searchRides(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  departureTime?: Date,
  maxDistance: number = 2 // km
): Promise<Ride[]> {
  try {
    const ridesRef = collection(db, 'rides');
    let q = query(
      ridesRef,
      where('status', '==', 'scheduled'),
      where('availableSeats', '>', 0)
    );

    // Add time filter if provided
    if (departureTime) {
      const timeWindow = new Date(departureTime);
      timeWindow.setHours(timeWindow.getHours() - 1); // 1 hour before
      
      q = query(q, where('departureTime', '>=', Timestamp.fromDate(timeWindow)));
    }

    const snapshot = await getDocs(q);
    
    const rides = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      departureTime: doc.data().departureTime.toDate(),
      estimatedArrival: doc.data().estimatedArrival?.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Ride[];

    // Filter by distance
    return rides.filter(ride => {
      const startDistance = calculateDistance(
        startLat,
        startLng,
        ride.startLocation.lat,
        ride.startLocation.lng
      );
      
      const endDistance = calculateDistance(
        endLat,
        endLng,
        ride.endLocation.lat,
        ride.endLocation.lng
      );
      
      return startDistance <= maxDistance && endDistance <= maxDistance;
    });
  } catch (error) {
    logError(error, {
      function: 'searchRides',
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Get user's active rides (as driver or rider)
 */
export async function getUserActiveRides(userId: string): Promise<{
  asDriver: Ride[];
  asRider: Ride[];
}> {
  try {
    const ridesRef = collection(db, 'rides');
    
    // Rides where user is driver
    const driverQuery = query(
      ridesRef,
      where('driverId', '==', userId),
      where('status', 'in', ['scheduled', 'active'])
    );
    
    const driverSnapshot = await getDocs(driverQuery);
    const asDriver = driverSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      departureTime: doc.data().departureTime.toDate(),
      estimatedArrival: doc.data().estimatedArrival?.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Ride[];

    // Rides where user is rider (need to check riders array)
    const allRidesQuery = query(
      ridesRef,
      where('status', 'in', ['scheduled', 'active'])
    );
    
    const allRidesSnapshot = await getDocs(allRidesQuery);
    const asRider = allRidesSnapshot.docs
      .map(doc => ({
        ...doc.data(),
        id: doc.id,
        departureTime: doc.data().departureTime.toDate(),
        estimatedArrival: doc.data().estimatedArrival?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      }))
      .filter((ride: Ride) => 
        ride.riders.some(r => r.userId === userId)
      ) as Ride[];

    return { asDriver, asRider };
  } catch (error) {
    logError(error, {
      function: 'getUserActiveRides',
      userId,
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Create ride request
 */
export async function createRideRequest(
  rideId: string,
  request: Omit<RideRequest, 'id' | 'rideId' | 'createdAt' | 'status'>
): Promise<void> {
  try {
    const ride = await getRide(rideId);
    if (!ride) throw new Error('Ride not found');
    
    const newRequest: RideRequest = {
      ...request,
      id: `${rideId}_${request.riderId}_${Date.now()}`,
      rideId,
      status: 'pending',
      createdAt: new Date(),
    };

    await updateDoc(doc(db, 'rides', rideId), {
      requests: [...ride.requests, newRequest],
      updatedAt: new Date(),
    });

    console.log('✅ Ride request created');
  } catch (error) {
    logError(error, {
      function: 'createRideRequest',
      severity: ErrorSeverity.ERROR,
      additionalInfo: { rideId },
    });
    throw error;
  }
}

/**
 * Accept ride request
 */
export async function acceptRideRequest(
  rideId: string,
  requestId: string
): Promise<void> {
  try {
    const ride = await getRide(rideId);
    if (!ride) throw new Error('Ride not found');
    
    const request = ride.requests.find(r => r.id === requestId);
    if (!request) throw new Error('Request not found');
    
    if (ride.availableSeats === 0) {
      throw new Error('Ride is full');
    }

    // Update request status
    const updatedRequests = ride.requests.map(r =>
      r.id === requestId ? { ...r, status: 'accepted' as const, respondedAt: new Date() } : r
    );

    // Add rider to participants
    const newParticipant: RideParticipant = {
      userId: request.riderId,
      name: request.riderName,
      photo: request.riderPhoto,
      phoneNumber: undefined,
      company: request.riderCompany,
      pickupLocation: request.pickupLocation,
      dropoffLocation: request.dropoffLocation,
      walkToPickup: request.walkToPickup,
      walkFromDrop: request.walkFromDrop,
      status: 'confirmed',
      paymentStatus: 'pending',
      joinedAt: new Date(),
    };

    await updateDoc(doc(db, 'rides', rideId), {
      requests: updatedRequests,
      riders: [...ride.riders, newParticipant],
      availableSeats: ride.availableSeats - 1,
      updatedAt: new Date(),
    });

    console.log('✅ Request accepted, rider added');
  } catch (error) {
    logError(error, {
      function: 'acceptRideRequest',
      severity: ErrorSeverity.ERROR,
      additionalInfo: { rideId, requestId },
    });
    throw error;
  }
}

/**
 * Reject ride request
 */
export async function rejectRideRequest(
  rideId: string,
  requestId: string
): Promise<void> {
  try {
    const ride = await getRide(rideId);
    if (!ride) throw new Error('Ride not found');

    const updatedRequests = ride.requests.map(r =>
      r.id === requestId ? { ...r, status: 'rejected' as const, respondedAt: new Date() } : r
    );

    await updateDoc(doc(db, 'rides', rideId), {
      requests: updatedRequests,
      updatedAt: new Date(),
    });

    console.log('✅ Request rejected');
  } catch (error) {
    logError(error, {
      function: 'rejectRideRequest',
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Remove rider from ride
 */
export async function removeRider(
  rideId: string,
  riderId: string
): Promise<void> {
  try {
    const ride = await getRide(rideId);
    if (!ride) throw new Error('Ride not found');

    const updatedRiders = ride.riders.filter(r => r.userId !== riderId);

    await updateDoc(doc(db, 'rides', rideId), {
      riders: updatedRiders,
      availableSeats: ride.availableSeats + 1,
      updatedAt: new Date(),
    });

    console.log('✅ Rider removed');
  } catch (error) {
    logError(error, {
      function: 'removeRider',
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Update ride status
 */
export async function updateRideStatus(
  rideId: string,
  status: Ride['status']
): Promise<void> {
  try {
    await updateDoc(doc(db, 'rides', rideId), {
      status,
      updatedAt: new Date(),
    });

    console.log(`✅ Ride status updated to: ${status}`);
  } catch (error) {
    logError(error, {
      function: 'updateRideStatus',
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Cancel ride
 */
export async function cancelRide(rideId: string): Promise<void> {
  try {
    await updateRideStatus(rideId, 'cancelled');
    console.log('✅ Ride cancelled');
  } catch (error) {
    logError(error, {
      function: 'cancelRide',
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

// Helper functions
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
