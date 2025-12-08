import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Schedule } from '../types/schedule';
import {
  getUserSchedule,
  saveSchedule,
  toggleScheduleActive,
  deleteSchedule as deleteScheduleService,
} from '../services/scheduleService';
import { logError as logErr, createStandardError, ErrorSeverity as Sev } from '../app/utils/ErrorHandler';

export function useSchedule() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<Schedule | null>(null);

  /**
   * Load user's schedule
   */
  const loadSchedule = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getUserSchedule(user.uid);
      setSchedule(data);
    } catch (error) {
      logErr(error, {
        function: 'useSchedule.loadSchedule',
        userId: user.uid,
        severity: Sev.ERROR,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create or update schedule
   */
  const createOrUpdateSchedule = async (
    scheduleData: Omit<Schedule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) throw new Error('No user logged in');

    setLoading(true);
    try {
      const saved = await saveSchedule(user.uid, scheduleData);
      setSchedule(saved);
      console.log('✅ Schedule saved');
    } catch (error) {
      logErr(error, {
        function: 'useSchedule.createOrUpdateSchedule',
        userId: user.uid,
        severity: Sev.ERROR,
      });
      throw createStandardError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle schedule active/inactive
   */
  const toggleActive = async (active: boolean) => {
    if (!user) throw new Error('No user logged in');

    setLoading(true);
    try {
      await toggleScheduleActive(user.uid, active);
      if (schedule) {
        setSchedule({ ...schedule, active });
      }
    } catch (error) {
      logErr(error, {
        function: 'useSchedule.toggleActive',
        userId: user.uid,
        severity: Sev.ERROR,
      });
      throw createStandardError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete schedule
   */
  const deleteSchedule = async () => {
    if (!user) throw new Error('No user logged in');

    setLoading(true);
    try {
      await deleteScheduleService(user.uid);
      setSchedule(null);
    } catch (error) {
      logErr(error, {
        function: 'useSchedule.deleteSchedule',
        userId: user.uid,
        severity: Sev.ERROR,
      });
      throw createStandardError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    schedule,
    hasSchedule: !!schedule,
    loadSchedule,
    createOrUpdateSchedule,
    toggleActive,
    deleteSchedule,
  };
}
 