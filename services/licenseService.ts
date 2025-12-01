// services/licenseService.ts
/**
 * License Service - Data Access Layer
 * 
 * Handles all Firestore operations for driver's license data.
 * Licenses are stored inline with user profiles.
 */

import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { License } from '../types/user';
import { logError, ErrorSeverity } from '../app/utils/ErrorHandler';

/**
 * Uploads license photo to Firebase Storage
 * 
 * @param userId - The user's UID
 * @param imageUri - Local file URI
 * @param side - 'front' or 'back'
 * @returns Download URL for the uploaded image
 * 
 * @example
 * const url = await uploadLicensePhoto('abc123', 'file:///...', 'front');
 */
export async function uploadLicensePhoto(
  userId: string,
  imageUri: string,
  side: 'front' | 'back'
): Promise<string> {
  try {
    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Upload to Storage
    const storageRef = ref(storage, `licenses/${userId}/${side}.jpg`);
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    console.log(`✅ License ${side} photo uploaded`);
    return downloadURL;
  } catch (error) {
    logError(error, {
      function: 'uploadLicensePhoto',
      userId,
      severity: ErrorSeverity.ERROR,
      additionalInfo: { side },
    });
    throw error;
  }
}

/**
 * Saves or updates license information
 * Always resets verification status to 'pending'
 * 
 * @param userId - The user's UID
 * @param licenseData - License information
 * @param isUpdate - Whether this is an update (preserves submittedAt)
 */
export async function saveLicense(
  userId: string,
  licenseData: Omit<License, 'updatedAt' | 'verificationStatus'>,
  isUpdate: boolean = false
): Promise<void> {
  try {
    const license: License = {
      ...licenseData,
      verificationStatus: 'pending', // Always reset to pending on save/update
      submittedAt: isUpdate ? (licenseData as any).submittedAt : new Date(),
      updatedAt: new Date(),
    };

    await setDoc(
      doc(db, 'users', userId),
      {
        license,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(isUpdate ? '✅ License updated - resubmitted for verification' : '✅ License submitted for verification');
  } catch (error) {
    logError(error, {
      function: 'saveLicense',
      userId,
      severity: ErrorSeverity.ERROR,
      additionalInfo: { isUpdate },
    });
    throw error;
  }
}

/**
 * Updates license verification status
 * Called by admin/backend verification system
 * 
 * @param userId - The user's UID
 * @param status - New verification status
 * @param rejectionReason - Reason if rejected
 */
export async function updateLicenseVerification(
  userId: string,
  status: License['verificationStatus'],
  rejectionReason?: string
): Promise<void> {
  try {
    const updates: Partial<License> = {
      verificationStatus: status,
      verificationDate: new Date(),
      updatedAt: new Date(),
    };

    if (status === 'rejected' && rejectionReason) {
      updates.rejectionReason = rejectionReason;
    }

    await setDoc(
      doc(db, 'users', userId),
      {
        license: updates,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(`✅ License verification updated: ${status}`);
  } catch (error) {
    logError(error, {
      function: 'updateLicenseVerification',
      userId,
      severity: ErrorSeverity.ERROR,
      additionalInfo: { status, rejectionReason },
    });
    throw error;
  }
}