// app/onboarding/personal-info.tsx
/**
 * Onboarding Step 1/3: Personal Information
 * 
 * Collects:
 * - Name (pre-filled from sign up)
 * - Company (required)
 * - Phone Number (required)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks';
import { 
  formatPhoneNumber, 
  isValidPhoneNumber 
} from '../../types/user';
import { logError, ErrorSeverity } from '../utils/ErrorHandler';

export default function PersonalInfo() {
  const { userProfile } = useAuth();
  const { updateProfile, loading } = useProfile();
  const router = useRouter();

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Initialize with existing profile data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setCompany(userProfile.company || '');
      setPhoneNumber(userProfile.phoneNumber || '');
    }
  }, [userProfile]);

  /**
   * Validate and save personal info
   */
  const handleNext = async () => {
    // Validation
    if (!displayName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name');
      return;
    }

    if (displayName.trim().length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters');
      return;
    }

    if (!company.trim()) {
      Alert.alert('Company Required', 'Please enter your company name');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Phone Required', 'Please enter your phone number');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid 10-digit phone number'
      );
      return;
    }

    try {
      // Save to profile
      await updateProfile({
        displayName: displayName.trim(),
        company: company.trim(),
        phoneNumber: formatPhoneNumber(phoneNumber),
      });

      // Navigate to next step
      router.push('/onboarding/profile-photo');
    } catch (error) {
      logError(error, {
        function: 'handleNext',
        screen: 'PersonalInfo',
        severity: ErrorSeverity.ERROR,
      });

      const message = error instanceof Error ? error.message : 'Failed to save information';
      Alert.alert('Error', message);
    }
  };

  /**
   * Format phone as user types
   */
  const handlePhoneChange = (text: string) => {
    // Remove non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    
    setPhoneNumber(limited);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 3</Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>
              This information helps others identify you when sharing rides
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  editable={!loading}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business-outline" size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Tech Corp"
                  value={company}
                  onChangeText={setCompany}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
              <Text style={styles.hint}>
                Company helps match you with coworkers
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#6b7280" />
                <TextInput
                  style={styles.input}
                  placeholder="1234567890"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>
              {phoneNumber.length === 10 && (
                <Text style={styles.formattedPhone}>
                  Formatted: {formatPhoneNumber(phoneNumber)}
                </Text>
              )}
              <Text style={styles.hint}>
                For safety and coordination with ride members
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, loading && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>Next</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
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
  },
  scrollContent: {
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
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#111827',
  },
  hint: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 18,
  },
  formattedPhone: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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