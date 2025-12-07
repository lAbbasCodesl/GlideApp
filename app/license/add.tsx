// app/license/add.tsx
/**
 * License Upload Screen
 * 
 * Allows users to:
 * - Upload driver's license photos (front + back)
 * - Provide license details
 * - Submit for verification
 * 
 * Production features:
 * - Image compression
 * - Preview before upload
 * - Upload progress tracking
 * - Validation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useLicense } from '../../hooks';
import { logError, ErrorSeverity } from '../utils/ErrorHandler';

// US States for dropdown
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function LicenseAddScreen() {
  const { userProfile } = useAuth();
  const { license, submitLicense, updateLicense, loading, uploadProgress } = useLicense();
  const router = useRouter();
  const params = useLocalSearchParams<{ edit?: string }>();

  const isEditing = params.edit === 'true' || !!license;

  // Form state
  const [stateOfIssue, setStateOfIssue] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [showStateModal, setShowStateModal] = useState(false);

  // Initialize with existing license if editing
  useEffect(() => {
    if (license && isEditing) {
      setStateOfIssue(license.stateOfIssue);
      setFrontPhoto(license.frontPhotoURL || null);
      setBackPhoto(license.backPhotoURL || null);
    }
  }, [license, isEditing]);

  /**
   * Pick image from library or camera
   */
  const pickImage = async (side: 'front' | 'back') => {
    Alert.alert(
      'Add Photo',
      'Choose a source',
      [
        {
          text: 'Camera',
          onPress: () => takePicture(side),
        },
        {
          text: 'Library',
          onPress: () => selectFromLibrary(side),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  /**
   * Take photo with camera
   */
  const takePicture = async (side: 'front' | 'back') => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (side === 'front') {
          setFrontPhoto(result.assets[0].uri);
        } else {
          setBackPhoto(result.assets[0].uri);
        }
      }
    } catch (error) {
      logError(error, {
        function: 'takePicture',
        screen: 'LicenseAdd',
        severity: ErrorSeverity.WARNING,
      });
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  /**
   * Select from photo library
   */
  const selectFromLibrary = async (side: 'front' | 'back') => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Photo library access is needed');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (side === 'front') {
          setFrontPhoto(result.assets[0].uri);
        } else {
          setBackPhoto(result.assets[0].uri);
        }
      }
    } catch (error) {
      logError(error, {
        function: 'selectFromLibrary',
        screen: 'LicenseAdd',
        severity: ErrorSeverity.WARNING,
      });
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  /**
   * Validate and submit license
   */
  const handleSubmit = async () => {
    // Validation
    if (!stateOfIssue) {
      Alert.alert('State Required', 'Please select the state that issued your license');
      return;
    }

    if (!frontPhoto) {
      Alert.alert('Front Photo Required', 'Please upload the front of your license');
      return;
    }

    if (!backPhoto) {
      Alert.alert('Back Photo Required', 'Please upload the back of your license');
      return;
    }

    // Check if photos are URLs (existing) or URIs (new uploads)
    const needsFrontUpload = frontPhoto && !frontPhoto.startsWith('http');
    const needsBackUpload = backPhoto && !backPhoto.startsWith('http');

    try {
      if (isEditing) {
        // Update existing license
        await updateLicense(
          needsFrontUpload ? frontPhoto : null,
          needsBackUpload ? backPhoto : null,
          { stateOfIssue }
        );
        
        Alert.alert(
          'License Updated',
          'Your license has been resubmitted for verification',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        // Submit new license
        await submitLicense(frontPhoto, backPhoto, { stateOfIssue, submittedAt: new Date() });
        
        Alert.alert(
          'License Submitted!',
          'Your license is being verified. This typically takes 24-48 hours. You can offer rides while verification is pending.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
        );
      }
    } catch (error) {
      logError(error, {
        function: 'handleSubmit',
        screen: 'LicenseAdd',
        severity: ErrorSeverity.ERROR,
      });

      const message = error instanceof Error ? error.message : 'Failed to upload license';
      Alert.alert('Error', message);
    }
  };

  /**
   * Render photo upload box
   */
  const renderPhotoBox = (side: 'front' | 'back') => {
    const photo = side === 'front' ? frontPhoto : backPhoto;
    const isUploading = side === 'front' ? uploadProgress.front : uploadProgress.back;

    return (
      <View style={styles.photoBox}>
        <Text style={styles.photoLabel}>
          {side === 'front' ? 'Front of License' : 'Back of License'} *
        </Text>
        
        <TouchableOpacity
          style={styles.photoUpload}
          onPress={() => pickImage(side)}
          disabled={loading}
        >
          {photo ? (
            <>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              {!loading && (
                <View style={styles.photoOverlay}>
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.photoOverlayText}>Change</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={48} color="#9ca3af" />
              <Text style={styles.photoPlaceholderText}>
                {side === 'front' ? 'Upload Front' : 'Upload Back'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Update License' : 'Add Driver\'s License'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color="#2563eb" />
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>Why we need this</Text>
            <Text style={styles.infoBannerText}>
              Your license verifies you're legally allowed to drive. We keep this secure and only use it for verification.
            </Text>
          </View>
        </View>

        {/* State Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>License Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>State of Issue *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowStateModal(true)}
              disabled={loading}
            >
              <Ionicons name="location-outline" size={20} color="#6b7280" />
              <Text style={[styles.selectText, stateOfIssue && styles.selectTextFilled]}>
                {stateOfIssue || 'Select state'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Uploads */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>License Photos</Text>
          <Text style={styles.sectionSubtitle}>
            Take clear photos with all information visible
          </Text>

          {renderPhotoBox('front')}
          {renderPhotoBox('back')}
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>
            <Ionicons name="bulb-outline" size={16} color="#f59e0b" /> Tips for good photos
          </Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Ensure all text is clearly readable</Text>
            <Text style={styles.tipItem}>• Use good lighting, avoid glare</Text>
            <Text style={styles.tipItem}>• Include all four corners of the license</Text>
            <Text style={styles.tipItem}>• Don't cover any information</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Update & Resubmit' : 'Submit for Verification'}
            </Text>
          )}
        </TouchableOpacity>
        
        {!isEditing && (
          <Text style={styles.footerNote}>
            Verification typically takes 24-48 hours. You can offer rides while verification is pending.
          </Text>
        )}
      </View>

      {/* State Selection Modal */}
      <Modal
        visible={showStateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={US_STATES}
              keyExtractor={(item) => item}
              numColumns={4}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.stateButton,
                    stateOfIssue === item && styles.stateButtonActive,
                  ]}
                  onPress={() => {
                    setStateOfIssue(item);
                    setShowStateModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.stateButtonText,
                      stateOfIssue === item && styles.stateButtonTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
    gap: 12,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: '#9ca3af',
  },
  selectTextFilled: {
    color: '#111827',
  },
  photoBox: {
    marginBottom: 24,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  photoUpload: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  photoPlaceholder: {
    height: 200,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  uploadingText: {
    fontSize: 14,
    color: '#2563eb',
    marginTop: 8,
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: '#fffbeb',
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footerNote: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  stateButton: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  stateButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  stateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  stateButtonTextActive: {
    color: '#fff',
  },
});