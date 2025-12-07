// services/userService.ts
/**
 * User Service - Data Access Layer
 * 
 * Handles all Firestore operations for user profiles.
 * Abstracts database implementation from business logic.
 * 
 * WHY THIS EXISTS:
 * - Single place for all user database operations
 * - Easy to mock for testing
 * - Can switch databases (Firestore → Supabase) by changing only this file
 * - Centralized error handling for database operations
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types/user';
import { logError, ErrorSeverity } from '../app/utils/ErrorHandler';

/**
 * Fetches user profile from Firestore
 * 
 * @param userId - The user's UID
 * @returns UserProfile or null if not found
 * 
 * @example
 * const profile = await getUserProfile('abc123');
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profileDoc = await getDoc(doc(db, 'users', userId));
    
    if (profileDoc.exists()) {
      return profileDoc.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    logError(error, {
      function: 'getUserProfile',
      userId,
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Creates a new user profile
 * Used during sign-up flow
 * 
 * @param userId - The user's UID
 * @param profileData - Initial profile data
 * 
 * @example
 * await createUserProfile('abc123', {
 *   email: 'user@example.com',
 *   displayName: 'John Doe',
 * });
 */
export async function createUserProfile(
  userId: string,
  profileData: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  try {
    const profile: UserProfile = {
      ...profileData,
      uid: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', userId), profile);
    
    console.log('✅ User profile created:', userId);
  } catch (error) {
    logError(error, {
      function: 'createUserProfile',
      userId,
      severity: ErrorSeverity.CRITICAL,
      additionalInfo: { profileData },
    });
    throw error;
  }
}

/**
 * Updates user profile fields
 * Use merge: true to only update provided fields
 * 
 * @param userId - The user's UID
 * @param updates - Partial profile data to update
 * 
 * @example
 * await updateUserProfile('abc123', {
 *   displayName: 'Jane Doe',
 *   company: 'New Company',
 * });
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        ...updates,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log('✅ User profile updated:', userId);
  } catch (error) {
    logError(error, {
      function: 'updateUserProfile',
      userId,
      severity: ErrorSeverity.ERROR,
      additionalInfo: { updates },
    });
    throw error;
  }
}

/**
 * Marks user onboarding as complete
 * 
 * @param userId - The user's UID
 * @param finalData - Any final data to save with onboarding completion
 */
export async function completeUserOnboarding(
  userId: string,
  finalData?: Partial<UserProfile>
): Promise<void> {
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        ...finalData,
        onboardingCompleted: true,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log('✅ User onboarding completed:', userId);
  } catch (error) {
    logError(error, {
      function: 'completeUserOnboarding',
      userId,
      severity: ErrorSeverity.ERROR,
    });
    throw error;
  }
}

/**
 * Deletes user profile
 * Should only be called when user deletes their account
 * 
 * @param userId - The user's UID
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  try {
    // In production, you might want to soft-delete instead
    // by setting a deletedAt timestamp
    await setDoc(
      doc(db, 'users', userId),
      {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log('✅ User profile deleted:', userId);
  } catch (error) {
    logError(error, {
      function: 'deleteUserProfile',
      userId,
      severity: ErrorSeverity.CRITICAL,
    });
    throw error;
  }
}