// hooks/useLicense.ts
/**
 * useLicense Hook - Driver's License Management
 * 
 * Handles all license operations:
 * - Upload license photos
 * - Submit for verification
 * - Check verification status
 * - Update license
 * 
 * WHY A HOOK:
 * - License operations are complex (photo upload + data save)
 * - Encapsulates business logic
 * - Easy to test
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { License } from '../types/user';
import { 
  uploadLicensePhoto, 
  saveLicense,
} from '../services/licenseService';
import { logError, createStandardError, ErrorSeverity } from '../app/utils/ErrorHandler';
import { 
  canOfferRides, 
  canOfferRidesWithPending, 
  hasPendingVerification,
  getVerificationStatusText,
} from '../types/user';

export function useLicense() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    front: boolean;
    back: boolean;
  }>({ front: false, back: false });

  /**
   * Get current license from profile
   */
  const license = userProfile?.license;

  /**
   * Check if user has a license
   */
  const hasLicense = !!license;

  /**
   * Get verification status
   */
  const verificationStatus = license?.verificationStatus;

  /**
   * Get human-readable status
   */
  const statusText = verificationStatus ? getVerificationStatusText(verificationStatus) : 'Not Submitted';

  /**
   * Check if user can offer rides (has vehicle + approved license)
   */
  const canOffer = userProfile ? canOfferRides(userProfile) : false;

  /**
   * Check if user can offer rides with pending verification
   */
  const canOfferWithPending = userProfile ? canOfferRidesWithPending(userProfile) : false;

  /**
   * Check if verification is pending
   */
  const isPending = userProfile ? hasPendingVerification(userProfile) : false;

  /**
   * Upload and submit license for verification
   * 
   * @param frontImageUri - Front photo URI
   * @param backImageUri - Back photo URI
   * @param licenseData - Additional license data
   * 
   * @example
   * const { submitLicense } = useLicense();
   * await submitLicense(
   *   'file:///front.jpg',
   *   'file:///back.jpg',
   *   { stateOfIssue: 'CA' }
   * );
   */
  const submitLicense = async (
    frontImageUri: string,
    backImageUri: string,
    licenseData: Omit<License, 'frontPhotoURL' | 'backPhotoURL' | 'updatedAt' | 'verificationStatus'>
  ) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setLoading(true);
    try {
      // Upload front photo
      setUploadProgress({ front: false, back: false });
      const frontURL = await uploadLicensePhoto(user.uid, frontImageUri, 'front');
      setUploadProgress({ front: true, back: false });

      // Upload back photo
      const backURL = await uploadLicensePhoto(user.uid, backImageUri, 'back');
      setUploadProgress({ front: true, back: true });

      // Save license data
      await saveLicense(user.uid, {
        ...licenseData,
        frontPhotoURL: frontURL,
        backPhotoURL: backURL,
      }, false);

      // Refresh profile in AuthContext
      await refreshUserProfile();

      console.log('✅ License submitted for verification');
    } catch (error) {
      logError(error, {
        function: 'useLicense.submitLicense',
        userId: user.uid,
        severity: ErrorSeverity.ERROR,
        additionalInfo: { licenseData },
      });
      
      throw createStandardError(error);
    } finally {
      setLoading(false);
      setUploadProgress({ front: false, back: false });
    }
  };

  /**
   * Update existing license (resubmits for verification)
   * 
   * @param frontImageUri - New front photo URI (optional)
   * @param backImageUri - New back photo URI (optional)
   * @param licenseData - Updated license data
   * 
   * @example
   * const { updateLicense } = useLicense();
   * await updateLicense(
   *   'file:///new-front.jpg',
   *   null, // Keep existing back photo
   *   { stateOfIssue: 'NY' }
   * );
   */
  const updateLicense = async (
    frontImageUri: string | null,
    backImageUri: string | null,
    licenseData: Omit<License, 'frontPhotoURL' | 'backPhotoURL' | 'submittedAt' | 'updatedAt' | 'verificationStatus'>
  ) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    if (!license) {
      throw new Error('No license to update');
    }

    setLoading(true);
    try {
      let frontURL = license.frontPhotoURL;
      let backURL = license.backPhotoURL;

      // Upload new front photo if provided
      if (frontImageUri) {
        setUploadProgress({ front: false, back: true });
        frontURL = await uploadLicensePhoto(user.uid, frontImageUri, 'front');
        setUploadProgress({ front: true, back: true });
      }

      // Upload new back photo if provided
      if (backImageUri) {
        setUploadProgress({ front: true, back: false });
        backURL = await uploadLicensePhoto(user.uid, backImageUri, 'back');
        setUploadProgress({ front: true, back: true });
      }

      // Save updated license data
      await saveLicense(user.uid, {
        ...licenseData,
        frontPhotoURL: frontURL,
        backPhotoURL: backURL,
        submittedAt: license.submittedAt as any,
      }, true);

      // Refresh profile in AuthContext
      await refreshUserProfile();

      console.log('✅ License updated - resubmitted for verification');
    } catch (error) {
      logError(error, {
        function: 'useLicense.updateLicense',
        userId: user.uid,
        severity: ErrorSeverity.ERROR,
        additionalInfo: { licenseData },
      });
      
      throw createStandardError(error);
    } finally {
      setLoading(false);
      setUploadProgress({ front: false, back: false });
    }
  };

  return {
    loading,
    uploadProgress,
    license,
    hasLicense,
    verificationStatus,
    statusText,
    canOffer,
    canOfferWithPending,
    isPending,
    submitLicense,
    updateLicense,
  };
}