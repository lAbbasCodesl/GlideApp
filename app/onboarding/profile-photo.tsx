// app/onboarding/profile-photo.tsx
/**
 * Onboarding Step 2/3: Profile Photo
 * 
 * Optional but highly recommended
 * Users with photos get 3x more ride matches
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks';
import { logError, ErrorSeverity } from '../utils/ErrorHandler';

export default function ProfilePhoto() {
  const { userProfile } = useAuth();
  const { uploadProfilePhoto, loading } = useProfile();
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState<string | null>(
    userProfile?.photoURL || null
  );
  const [uploading, setUploading] = useState(false);

  /**
   * Pick image from library
   */
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photos to upload a profile picture'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      logError(error, {
        function: 'handlePickImage',
        screen: 'ProfilePhoto',
        severity: ErrorSeverity.WARNING,
      });

      Alert.alert('Error', 'Failed to pick image');
    }
  };

  /**
   * Take photo with camera
   */
  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take a photo'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      logError(error, {
        function: 'handleTakePhoto',
        screen: 'ProfilePhoto',
        severity: ErrorSeverity.WARNING,
      });

      Alert.alert('Error', 'Failed to take photo');
    }
  };

  /**
   * Upload photo and continue
   */
  const handleNext = async () => {
    if (selectedImage && selectedImage !== userProfile?.photoURL) {
      setUploading(true);
      try {
        await uploadProfilePhoto(selectedImage);
      } catch (error) {
        logError(error, {
          function: 'handleNext',
          screen: 'ProfilePhoto',
          severity: ErrorSeverity.ERROR,
        });

        Alert.alert('Error', 'Failed to upload photo. You can add it later from your profile.');
      } finally {
        setUploading(false);
      }
    }

    // Navigate to final step
    router.push('/onboarding/welcome');
  };

  /**
   * Skip photo upload
   */
  const handleSkip = () => {
    router.push('/onboarding/welcome');
  };

  const isLoading = loading || uploading;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.progressText}>Step 2 of 3</Text>
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add a profile photo</Text>
          <Text style={styles.subtitle}>
            Members with photos get 3x more ride matches
          </Text>
        </View>

        {/* Photo Preview */}
        <View style={styles.photoContainer}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={64} color="#9ca3af" />
            </View>
          )}

          {selectedImage && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setSelectedImage(null)}
              disabled={isLoading}
            >
              <Ionicons name="close-circle" size={32} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          <View style={styles.benefitItem}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.benefitText}>Builds trust with ride members</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="people" size={20} color="#2563eb" />
            <Text style={styles.benefitText}>Easier to identify at pickup</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="trending-up" size={20} color="#f59e0b" />
            <Text style={styles.benefitText}>3x more ride requests</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {!selectedImage && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePickImage}
                disabled={isLoading}
              >
                <Ionicons name="images-outline" size={24} color="#2563eb" />
                <Text style={styles.actionButtonText}>Choose from Library</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleTakePhoto}
                disabled={isLoading}
              >
                <Ionicons name="camera-outline" size={24} color="#2563eb" />
                <Text style={styles.actionButtonText}>Take a Photo</Text>
              </TouchableOpacity>
            </>
          )}

          {selectedImage && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePickImage}
              disabled={isLoading}
            >
              <Ionicons name="repeat-outline" size={24} color="#2563eb" />
              <Text style={styles.actionButtonText}>Choose Different Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isLoading}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {selectedImage ? 'Continue' : 'Skip'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  photoPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: '50%',
    marginRight: -96,
  },
  benefits: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
    backgroundColor: '#fff',
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});