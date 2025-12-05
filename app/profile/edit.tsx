// app/profile/edit.tsx - EXAMPLE OF USING HOOKS
/**
 * Profile Edit Screen
 * 
 * Demonstrates how to use the new hook-based architecture:
 * - useAuth() for reading profile
 * - useProfile() for updating profile
 * - useVehicle() for vehicle management
 * - useLicense() for license management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile, useVehicle, useLicense } from '../../hooks';
import { formatPhoneNumber, isValidPhoneNumber } from '../../types/user';

export default function ProfileEditScreen() {
  const router = useRouter();
  
  // Get current profile from AuthContext (read-only)
  const { userProfile } = useAuth();
  
  // Get profile update methods from hook
  const { 
    loading: profileLoading, 
    updateProfile, 
    uploadProfilePhoto 
  } = useProfile();
  
  // Get vehicle info from hook
  const { 
    vehicle,
    hasVehicle,
    loading: vehicleLoading,
  } = useVehicle();
  
  // Get license info from hook
  const {
    license,
    statusText,
    canOffer,
    loading: licenseLoading,
  } = useLicense();

  // Local state for form
  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Initialize form with current profile data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setCompany(userProfile.company || '');
      setPhoneNumber(userProfile.phoneNumber || '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    // Validation
    if (!displayName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!company.trim()) {
      Alert.alert('Error', 'Company is required');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      // Use the hook to update profile
      await updateProfile({
        displayName: displayName.trim(),
        company: company.trim(),
        phoneNumber: formatPhoneNumber(phoneNumber),
      });

      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      Alert.alert('Error', message);
    }
  };

  const loading = profileLoading || vehicleLoading || licenseLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Personal Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company</Text>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="Enter your company"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone"
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
        </View>

        {/* Vehicle Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            {hasVehicle && (
              <TouchableOpacity 
                onPress={() => router.push('/vehicle/add')}
                disabled={loading}
              >
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {hasVehicle && vehicle ? (
            <View style={styles.infoCard}>
              <Ionicons name="car" size={24} color="#2563eb" />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>
                 {vehicle.make} {vehicle.model}
                </Text>
                <Text style={styles.infoCardSubtitle}>
                  {vehicle.color} • {vehicle.licensePlate}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/vehicle/add')}
              disabled={loading}
            >
              <Ionicons name="add-circle-outline" size={20} color="#2563eb" />
              <Text style={styles.addButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* License Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Driver's License</Text>
            {license && (
              <TouchableOpacity 
                onPress={() => router.push('/license/add')}
                disabled={loading}
              >
                <Text style={styles.editLink}>Update</Text>
              </TouchableOpacity>
            )}
          </View>

          {license ? (
            <View style={styles.infoCard}>
              <Ionicons 
                name={canOffer ? "checkmark-circle" : "time"} 
                size={24} 
                color={canOffer ? "#10b981" : "#f59e0b"} 
              />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardTitle}>
                  {license.stateOfIssue} License
                </Text>
                <Text style={styles.infoCardSubtitle}>
                  Status: {statusText}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/license/add')}
              disabled={loading}
            >
              <Ionicons name="add-circle-outline" size={20} color="#2563eb" />
              <Text style={styles.addButtonText}>Add Driver's License</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
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
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
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
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 12,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  infoCardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});