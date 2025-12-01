// hooks/useProfile.ts
/**
 * useProfile Hook - Profile Management
 * 
 * Handles all user profile operations:
 * - Update profile fields (name, company, phone)
 * - Upload profile photo
 * - Complete onboarding
 * 
 * WHY A HOOK INSTEAD OF CONTEXT:
 * - Doesn't need global state (uses AuthContext for user)
 * - Keeps AuthContext clean and focused
 * - Easy to test independently
 * - Can be used anywhere in the app
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types/user';
import { updateUserProfile, completeUserOnboarding } from '../services/userService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import { logError, createStandardError, ErrorSeverity } from '../app/utils/ErrorHandler';

export function useProfile() {
  const { user, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  /**
   * Update user profile fields
   * 
   * @example
   * const { updateProfile } = useProfile();
   * await updateProfile({ company: 'New Company', phoneNumber: '1234567890' });
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setLoading(true);
    try {
      await updateUserProfile(user.uid, updates);
      
      // Refresh profile in AuthContext
      await refreshUserProfile();
      
      console.log('✅ Profile updated successfully');
    } catch (error) {
      logError(error, {
        function: 'useProfile.updateProfile',
        userId: user.uid,
        severity: ErrorSeverity.ERROR,
        additionalInfo: { updates },
      });
      
      throw createStandardError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload profile photo
   * Uploads to Firebase Storage and updates profile
   * 
   * @param imageUri - Local file URI from image picker
   * 
   * @example
   * const { uploadProfilePhoto } = useProfile();
   * await uploadProfilePhoto('file:///path/to/image.jpg');
   */
  const uploadProfilePhoto = async (imageUri: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setLoading(true);
    try {
      // Convert URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload to Storage
      const storageRef = ref(storage, `profiles/${user.uid}/photo.jpg`);
      await uploadBytes(storageRef, blob);

      // Get download URL
      const photoURL = await getDownloadURL(storageRef);

      // Update profile with new photo URL
      await updateUserProfile(user.uid, { photoURL });
      
      // Refresh profile in AuthContext
      await refreshUserProfile();

      console.log('✅ Profile photo uploaded');
      return photoURL;
    } catch (error) {
      logError(error, {
        function: 'useProfile.uploadProfilePhoto',
        userId: user.uid,
        severity: ErrorSeverity.ERROR,
      });
      
      throw createStandardError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Complete onboarding process
   * Marks onboarding as complete and updates profile
   * 
   * @param profileData - Final profile data from onboarding flow
   * 
   * @example
   * const { completeOnboarding } = useProfile();
   * await completeOnboarding({
   *   company: 'Tech Corp',
   *   phoneNumber: '1234567890',
   * });
   */
  const completeOnboarding = async (profileData: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setLoading(true);
    try {
      await completeUserOnboarding(user.uid, profileData);
      
      // Refresh profile in AuthContext
      await refreshUserProfile();

      console.log('✅ Onboarding completed');
    } catch (error) {
      logError(error, {
        function: 'useProfile.completeOnboarding',
        userId: user.uid,
        severity: ErrorSeverity.ERROR,
        additionalInfo: { profileData },
      });
      
      throw createStandardError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateProfile,
    uploadProfilePhoto,
    completeOnboarding,
  };
}