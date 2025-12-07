// app/(auth)/sign-in.tsx - USING NEW ARCHITECTURE
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';  // ONLY for auth operations
import { Ionicons } from '@expo/vector-icons';
import { logError, ErrorSeverity, isRetryableError } from '../../app/utils/ErrorHandler';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // ONLY use auth methods from context
  // Profile updates will use useProfile() hook
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const router = useRouter();

  /**
   * Handles email/password sign in with proper error handling
   */
  const handleSignIn = async () => {
    // Input validation
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation handled by root layout's useEffect
      console.log('✅ Sign in successful, navigation will occur automatically');
    } catch (error) {
      // Error already logged in AuthContext, just show to user
      logError(error, {
        function: 'handleSignIn',
        screen: 'SignIn',
        severity: ErrorSeverity.WARNING,
        additionalInfo: { 
          email,
          hasPassword: !!password,
        },
      });

      // Show user-friendly error with retry option if applicable
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      if (isRetryableError(error)) {
        Alert.alert(
          'Connection Error',
          errorMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: handleSignIn },
          ]
        );
      } else {
        Alert.alert('Sign In Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Google OAuth sign in
   */
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      console.log('✅ Google sign in successful');
    } catch (error) {
      logError(error, {
        function: 'handleGoogleSignIn',
        screen: 'SignIn',
        severity: ErrorSeverity.WARNING,
      });

      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed';
      Alert.alert('Google Sign In Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles Apple OAuth sign in
   */
  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithApple();
      console.log('✅ Apple sign in successful');
    } catch (error) {
      logError(error, {
        function: 'handleAppleSignIn',
        screen: 'SignIn',
        severity: ErrorSeverity.WARNING,
      });

      const errorMessage = error instanceof Error ? error.message : 'Apple sign in failed';
      Alert.alert('Apple Sign In Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
              autoComplete="password"
              textContentType="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              disabled={loading}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link */}
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity disabled={loading}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign In Buttons */}
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleAppleSignIn}
            disabled={loading}
          >
            <Ionicons name="logo-apple" size={20} color="#000" />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity disabled={loading}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    color: '#2563eb',
    textAlign: 'right',
    marginBottom: 24,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    height: 50,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  footerLink: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});