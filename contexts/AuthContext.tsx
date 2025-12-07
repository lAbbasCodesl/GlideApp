// contexts/AuthContext.tsx - FIXED VERSION
/**
 * Auth Context - Authentication State Management
 * 
 * RESPONSIBILITIES (Read this carefully!):
 * ✅ Authentication (sign in, sign up, sign out)
 * ✅ Auth state management (user object)
 * ✅ User profile state (READ-ONLY)
 * ✅ Email verification
 * 
 * DOES NOT HANDLE:
 * ❌ Profile updates (use useProfile hook)
 * ❌ Vehicle management (use useVehicle hook)
 * ❌ License operations (use useLicense hook)
 * 
 * WHY THIS SEPARATION:
 * - Single Responsibility Principle: Each module does ONE thing
 * - Easier to test: Mock just what you need
 * - Easier to maintain: Changes isolated to one file
 * - Better performance: Fewer unnecessary re-renders
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserProfile } from '../types/user';
import { getUserProfile, createUserProfile } from '../services/userService';
import { 
  logError, 
  createStandardError,
  ErrorSeverity 
} from '../app/utils/ErrorHandler';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';

interface AuthContextType {
  // ============================================
  // AUTH STATE (Read-Only)
  // ============================================
  user: User | null;              // Firebase User object
  userProfile: UserProfile | null; // Firestore profile document
  loading: boolean;                // True during initial auth check
  
  // ============================================
  // STATUS FLAGS
  // ============================================
  needsEmailVerification: boolean; // Email not verified (password provider only)
  needsOnboarding: boolean;        // Profile incomplete or doesn't exist
  
  // ============================================
  // AUTH METHODS
  // ============================================
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  
  // ============================================
  // PROFILE REFRESH
  // Called by hooks after they update profile
  // ============================================
  refreshUserProfile: () => Promise<void>;
  setNeedsEmailVerification: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Google Sign-In setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '70442870803-8m1jk9rfqp412bbj50cgfunjvj933afl.apps.googleusercontent.com',
    androidClientId: '70442870803-6oforsf4n5doba9do6pjlpg7a554g12j.apps.googleusercontent.com',
  });

  /**
   * Listen to Firebase auth state changes
   * This is the ONLY place where user state is set
   * 
   * Flow:
   * 1. Firebase detects auth change (sign in, sign out, token refresh)
   * 2. We update user state
   * 3. We fetch/update profile from Firestore
   * 4. Navigation happens in _layout.tsx based on these states
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? user.email : 'signed out');
      
      setUser(user);
      
      if (user) {
        // User is signed in
        
        // Check if email is verified (only for password provider)
        const isPasswordProvider = user.providerData[0]?.providerId === 'password';
        const emailVerified = user.emailVerified;
        
        if (isPasswordProvider && !emailVerified) {
          console.log('⚠️ Email not verified - blocking onboarding');
          setNeedsEmailVerification(true);
          setNeedsOnboarding(false);
          // Still fetch profile so we can show user info
          await fetchUserProfile(user.uid);
        } else {
          setNeedsEmailVerification(false);
          await fetchUserProfile(user.uid);
        }
      } else {
        // User signed out - clear everything
        setUserProfile(null);
        setNeedsEmailVerification(false);
        setNeedsOnboarding(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Fetches user profile and determines onboarding status
   * 
   * Called automatically by:
   * - onAuthStateChanged (on sign in, sign out, token refresh)
   * - refreshUserProfile() (after profile updates from hooks)
   * 
   * Onboarding is complete when:
   * - Profile exists in Firestore
   * - onboardingCompleted = true
   * - company field exists (required during onboarding)
   * - phoneNumber field exists (required during onboarding)
   */
  const fetchUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      
      if (profile) {
        setUserProfile(profile);
        
        // Check if onboarding is complete
        // User might have profile but not finished onboarding
        const isOnboardingComplete = 
          profile.onboardingCompleted === true &&
          !!profile.company &&
          !!profile.phoneNumber;
        
        setNeedsOnboarding(!isOnboardingComplete);
        
        console.log('✅ Profile loaded:', {
          hasProfile: true,
          onboardingComplete: isOnboardingComplete,
          hasCompany: !!profile.company,
          hasPhone: !!profile.phoneNumber,
        });
      } else {
        // No profile exists - needs onboarding
        console.log('⚠️ No profile found - needs onboarding');
        setUserProfile(null);
        setNeedsOnboarding(true);
        
        logError(new Error('User profile not found'), {
          function: 'fetchUserProfile',
          userId,
          severity: ErrorSeverity.WARNING,
          additionalInfo: { action: 'needs_onboarding' },
        });
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      logError(error, {
        function: 'fetchUserProfile',
        userId,
        severity: ErrorSeverity.ERROR,
      });
      
      // On error, assume needs onboarding to be safe
      setUserProfile(null);
      setNeedsOnboarding(true);
    }
  };

  /**
   * Manually refresh user profile
   * Called by hooks after profile updates
   * 
   * Example:
   * const { updateProfile } = useProfile();
   * await updateProfile({ company: 'New Company' });
   * // useProfile calls refreshUserProfile() internally
   */
  const refreshUserProfile = async () => {
    if (user) {
      console.log('🔄 Manually refreshing profile...');
      await fetchUserProfile(user.uid);
    }
  };

  /**
   * Email/Password Sign Up
   * 
   * Flow:
   * 1. Create Firebase Auth user
   * 2. Send email verification
   * 3. Create minimal profile in Firestore
   * 4. onAuthStateChanged detects new user
   * 5. Navigation happens in _layout.tsx
   * 
   * IMPORTANT: Profile is created with onboardingCompleted=false
   * User must complete onboarding before accessing app
   */
  const signUp = async (email: string, password: string) => {
    try {
      console.log('📝 Creating user account...');
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      console.log('📧 Sending verification email...');
      await sendEmailVerification(credential.user);
      
      // Create minimal profile
      console.log('💾 Creating user profile...');
      await createUserProfile(credential.user.uid, {
        email,
        displayName: '',
        rating: 5.0,
        totalRides: 0,
        totalRidesOffered: 0,
        onboardingCompleted: false, // 🔴 CRITICAL: Must complete onboarding
      });
      
      console.log('✅ User created - email verification sent');
    } catch (error) {
      logError(error, {
        function: 'signUp',
        severity: ErrorSeverity.ERROR,
        additionalInfo: { email },
      });
      
      throw createStandardError(error);
    }
  };

  /**
   * Send email verification to current user
   */
  const sendVerificationEmail = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      await sendEmailVerification(currentUser);
      console.log('✅ Verification email sent');
    } catch (error) {
      logError(error, {
        function: 'sendVerificationEmail',
        userId: currentUser.uid,
        severity: ErrorSeverity.WARNING,
      });
      
      throw createStandardError(error);
    }
  };

  /**
   * Email/Password Sign In
   */
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User signed in');
    } catch (error) {
      logError(error, {
        function: 'signIn',
        severity: ErrorSeverity.WARNING,
        additionalInfo: { email },
      });
      
      throw createStandardError(error);
    }
  };

  /**
   * Google OAuth Sign In
   */
  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      
      if (result?.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);
        
        // Check if profile exists
        const existingProfile = await getUserProfile(userCredential.user.uid);
        
        if (!existingProfile) {
          // First-time OAuth user - create profile
          await createUserProfile(userCredential.user.uid, {
            email: userCredential.user.email!,
            displayName: userCredential.user.displayName || 'User',
            photoURL: userCredential.user.photoURL || undefined,
            rating: 5.0,
            totalRides: 0,
            totalRidesOffered: 0,
            onboardingCompleted: false, // 🔴 Must complete onboarding
          });
          console.log('✅ Google sign in - new user');
        } else {
          console.log('✅ Google sign in - existing user');
        }
      }
    } catch (error) {
      logError(error, {
        function: 'signInWithGoogle',
        severity: ErrorSeverity.ERROR,
      });
      
      throw createStandardError(error);
    }
  };

  /**
   * Apple OAuth Sign In
   */
  const signInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken } = credential;
      const provider = new OAuthProvider('apple.com');
      const oauthCredential = provider.credential({
        idToken: identityToken!,
      });

      const userCredential = await signInWithCredential(auth, oauthCredential);

      const existingProfile = await getUserProfile(userCredential.user.uid);
      
      if (!existingProfile) {
        await createUserProfile(userCredential.user.uid, {
          email: userCredential.user.email || credential.email || '',
          displayName: credential.fullName?.givenName || 'User',
          rating: 5.0,
          totalRides: 0,
          totalRidesOffered: 0,
          onboardingCompleted: false, // 🔴 Must complete onboarding
        });
        console.log('✅ Apple sign in - new user');
      } else {
        console.log('✅ Apple sign in - existing user');
      }
    } catch (error) {
      logError(error, {
        function: 'signInWithApple',
        severity: ErrorSeverity.ERROR,
      });
      
      throw createStandardError(error);
    }
  };

  /**
   * Password Reset
   */
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
    } catch (error) {
      logError(error, {
        function: 'resetPassword',
        severity: ErrorSeverity.WARNING,
        additionalInfo: { email },
      });
      
      throw createStandardError(error);
    }
  };

  /**
   * Sign Out
   */
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setNeedsEmailVerification(false);
      setNeedsOnboarding(false);
      console.log('✅ User signed out');
    } catch (error) {
      logError(error, {
        function: 'signOut',
        userId: user?.uid,
        severity: ErrorSeverity.ERROR,
      });
      
      throw createStandardError(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        needsEmailVerification,
        needsOnboarding,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithApple,
        signOut,
        resetPassword,
        sendVerificationEmail,
        refreshUserProfile,
        setNeedsEmailVerification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};