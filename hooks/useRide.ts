
import { useState as useStatee } from 'react';
import { useAuth as useAuthh } from '../contexts/AuthContext';
import { Ride } from '../types/ride';
import {
  createRide,
  getRide,
  searchRides,
  getUserActiveRides,
  createRideRequest,
  acceptRideRequest,
  rejectRideRequest,
  removeRider,
  updateRideStatus,
  cancelRide,
} from '../services/rideService';
import { logError as logErrr, createStandardError as createErr, ErrorSeverity as Sevv } from '../app/utils/ErrorHandler';

export function useRide() {
  const { user } = useAuthh();
  const [loading, setLoading] = useStatee(false);
  const [activeRides, setActiveRides] = useStatee<{
    asDriver: Ride[];
    asRider: Ride[];
  }>({ asDriver: [], asRider: [] });

  /**
   * Create a new ride
   */
  const create = async (
    rideData: Omit<Ride, 'id' | 'createdAt' | 'updatedAt' | 'riders' | 'requests'>
  ): Promise<Ride> => {
    if (!user) throw new Error('No user logged in');

    setLoading(true);
    try {
      const ride = await createRide(rideData);
      return ride;
    } catch (error) {
      logErrr(error, {
        function: 'useRide.create',
        userId: user.uid,
        severity: Sevv.ERROR,
      });
      throw createErr(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search for rides
   */
  const search = async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    departureTime?: Date
  ): Promise<Ride[]> => {
    setLoading(true);
    try {
      const rides = await searchRides(startLat, startLng, endLat, endLng, departureTime);
      return rides;
    } catch (error) {
      logErrr(error, {
        function: 'useRide.search',
        severity: Sevv.ERROR,
      });
      throw createErr(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load user's active rides
   */
  const loadActiveRides = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const rides = await getUserActiveRides(user.uid);
      setActiveRides(rides);
    } catch (error) {
      logErrr(error, {
        function: 'useRide.loadActiveRides',
        userId: user.uid,
        severity: Sevv.ERROR,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Request to join ride
   */
  const requestJoin = async (
    rideId: string,
    pickupLocation: any,
    dropoffLocation: any,
    walkToPickup: number,
    walkFromDrop: number,
    message?: string
  ) => {
    if (!user) throw new Error('No user logged in');

    setLoading(true);
    try {
      await createRideRequest(rideId, {
        riderId: user.uid,
        riderName: user.displayName || 'User',
        riderPhoto: user.photoURL || undefined,
        pickupLocation,
        dropoffLocation,
        walkToPickup,
        walkFromDrop,
        message,
      });
    } catch (error) {
      logErrr(error, {
        function: 'useRide.requestJoin',
        userId: user.uid,
        severity: Sevv.ERROR,
      });
      throw createErr(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Accept rider request
   */
  const acceptRequest = async (rideId: string, requestId: string) => {
    if (!user) throw new Error('No user logged in');

    setLoading(true);
    try {
      await acceptRideRequest(rideId, requestId);
    } catch (error) {
      logErrr(error, {
        function: 'useRide.acceptRequest',
        userId: user.uid,
        severity: Sevv.ERROR,
      });
      throw createErr(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reject rider request
   */
  const rejectRequest = async (rideId: string, requestId: string) => {
    if (!user) throw new Error('No user logged in');

    setLoading(true);
    try {
      await rejectRideRequest(rideId, requestId);
    } catch (error) {
      logErrr(error, {
        function: 'useRide.rejectRequest',
        userId: user.uid,
        severity: Sevv.ERROR,
      });
      throw createErr(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove rider from ride
   */
  const remove = async (rideId: string, riderId: string) => {
    if (!user) throw new Error('No user logged in');

    setLoading(true);
    try {
      await removeRider(rideId, riderId);
    } catch (error) {
      logErrr(error, {
        function: 'useRide.remove',
        userId: user.uid,
        severity: Sevv.ERROR,
      });
      throw createErr(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel ride
   */
  const cancel = async (rideId: string) => {
    if (!user) throw new Error('No user logged in');

    setLoading(true);
    try {
      await cancelRide(rideId);
    } catch (error) {
      logErrr(error, {
        function: 'useRide.cancel',
        userId: user.uid,
        severity: Sevv.ERROR,
      });
      throw createErr(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    activeRides,
    create,
    search,
    loadActiveRides,
    requestJoin,
    acceptRequest,
    rejectRequest,
    remove,
    cancel,
  };
}