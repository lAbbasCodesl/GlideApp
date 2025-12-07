// app/onboarding/welcome.tsx - SIMPLIFIED
/**
 * Onboarding Step 3/3: Welcome & Vehicle Prompt
 * 
 * SIMPLIFIED:
 * - Complete onboarding when user makes their choice
 * - Navigate directly without complex timing
 * - Root layout won't interfere because we're on welcome screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks';
import { logError, ErrorSeverity } from '../utils/ErrorHandler';

export default function Welcome() {
  const { userProfile } = useAuth();
  const { completeOnboarding, loading } = useProfile();
  const router = useRouter();
  
  const [completing, setCompleting] = useState(false);

  /**
   * Complete onboarding and go to home
   */
  const handleGetStarted = async () => {
    setCompleting(true);
    try {
      await completeOnboarding({});
      router.replace('/(tabs)/home');
    } catch (error) {
      logError(error, {
        function: 'handleGetStarted',
        screen: 'Welcome',
        severity: ErrorSeverity.ERROR,
      });
    } finally {
      setCompleting(false);
    }
  };

  /**
   * Complete onboarding then go to vehicle setup
   * Root layout won't redirect because we check for welcome screen
   */
  const handleAddVehicle = async () => {
    setCompleting(true);
    try {
      // Complete onboarding
      await completeOnboarding({});
      
      // Navigate to vehicle add
      router.replace('/vehicle/add');
    } catch (error) {
      logError(error, {
        function: 'handleAddVehicle',
        screen: 'Welcome',
        severity: ErrorSeverity.ERROR,
      });
    } finally {
      setCompleting(false);
    }
  };

  const isLoading = loading || completing;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>Step 3 of 3</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={80} color="#10b981" />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Welcome, {userProfile?.displayName}! 🎉
          </Text>
          <Text style={styles.subtitle}>
            You're all set to start finding rides
          </Text>
        </View>

        {/* Vehicle Prompt */}
        <View style={styles.vehiclePrompt}>
          <View style={styles.vehiclePromptHeader}>
            <Ionicons name="car-outline" size={32} color="#2563eb" />
            <Text style={styles.vehiclePromptTitle}>Want to Offer Rides?</Text>
          </View>
          <Text style={styles.vehiclePromptText}>
            Add your vehicle to start offering rides to others. You can do this now or anytime from your profile.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.vehicleButton, isLoading && styles.buttonDisabled]}
          onPress={handleAddVehicle}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#2563eb" />
          ) : (
            <>
              <Ionicons name="car" size={20} color="#2563eb" />
              <Text style={styles.vehicleButtonText}>Add Vehicle</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.startButton, isLoading && styles.buttonDisabled]}
          onPress={handleGetStarted}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.startButtonText}>Skip & Get Started</Text>
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
    backgroundColor: '#10b981',
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
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  vehiclePrompt: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  vehiclePromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  vehiclePromptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  vehiclePromptText: {
    fontSize: 15,
    color: '#1e40af',
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  vehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 18,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  vehicleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});