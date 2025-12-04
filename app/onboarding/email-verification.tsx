// app/onboarding/email-verification.tsx
/**
 * Email Verification Screen
 * 
 * Shows after email/password sign up
 * User must verify email before continuing to onboarding
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { logError, ErrorSeverity } from '../utils/ErrorHandler';

export default function EmailVerification() {
  const { user, sendVerificationEmail,setNeedsEmailVerification, signOut } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  /**
   * Check if email has been verified
   * Reloads user to get latest emailVerified status
   */
  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      // Reload user to get latest data from Firebase
      await user?.reload();
      if (user?.emailVerified) {
        Alert.alert('Success!', 'Your email has been verified');
        setNeedsEmailVerification(false);
        // Navigation will be handled by root layout
        router.replace('/onboarding/personal-info');
      } else {
        Alert.alert(
          'Not Verified Yet',
          'Please check your email and click the verification link, then try again.'
        );
      }
    } catch (error) {
      logError(error, {
        function: 'handleCheckVerification',
        screen: 'EmailVerification',
        userId: user?.uid,
        severity: ErrorSeverity.WARNING,
      });
      
      Alert.alert('Error', 'Failed to check verification status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  /**
   * Resend verification email
   */
  const handleResendEmail = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    try {
      await sendVerificationEmail();
      
      Alert.alert(
        'Email Sent!',
        'Check your inbox for the verification link'
      );
      
      // Set 60 second cooldown
      setCooldown(60);
    } catch (error) {
      logError(error, {
        function: 'handleResendEmail',
        screen: 'EmailVerification',
        userId: user?.uid,
        severity: ErrorSeverity.WARNING,
      });
      
      const message = error instanceof Error ? error.message : 'Failed to send email';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out and go back to sign in
   */
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure? You\'ll need to verify your email when you sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-outline" size={64} color="#2563eb" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We sent a verification link to
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.description}>
            Click the link in the email to verify your account, then return here to continue.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, checking && styles.buttonDisabled]}
            onPress={handleCheckVerification}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>I've Verified My Email</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (loading || cooldown > 0) && styles.buttonDisabled,
            ]}
            onPress={handleResendEmail}
            disabled={loading || cooldown > 0}
          >
            {loading ? (
              <ActivityIndicator color="#2563eb" />
            ) : (
              <>
                <Ionicons name="mail" size={20} color="#2563eb" />
                <Text style={styles.secondaryButtonText}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.textButton}
            onPress={handleSignOut}
            disabled={loading || checking}
          >
            <Text style={styles.textButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpBox}>
          <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
          <Text style={styles.helpText}>
            Didn't receive the email? Check your spam folder or request a new one.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  textButton: {
    padding: 12,
    alignItems: 'center',
  },
  textButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 24,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});