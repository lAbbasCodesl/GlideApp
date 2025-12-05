// app/_layout.tsx - SIMPLE FIX
/**
 * Root Layout - Navigation Controller
 * 
 * SIMPLE FIX:
 * - Don't redirect from welcome screen when onboarding completes
 * - Let welcome screen handle its own navigation
 */

import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function RootLayoutNav() {
  const { user, userProfile, loading, needsEmailVerification, needsOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === 'onboarding';
    const inMainApp = segments[0] === '(tabs)';
    
    // Check if we're specifically on the welcome screen
    // segments[1] will be 'welcome' when path is 'onboarding/welcome'
    const onWelcomeScreen = segments[0] === 'onboarding' && segments[1] === 'welcome';

    console.log('🔍 Navigation Check:', {
      user: !!user,
      emailVerified: user?.emailVerified,
      needsEmailVerification,
      needsOnboarding,
      onboardingCompleted: userProfile?.onboardingCompleted,
      currentPath: segments.join('/'),
      segments: segments,
      onWelcomeScreen,
    });

    // Case 1: No user → sign in
    if (!user && !inAuthGroup) {
      console.log('➡️ Redirecting to sign-in (no user)');
      router.replace('/(auth)/sign-in');
      return;
    }

    // Case 2: User exists but needs email verification
    if (user && needsEmailVerification && segments[0] !== 'onboarding') {
      console.log('➡️ Redirecting to email verification');
      router.replace('/onboarding/email-verification');
      return;
    }

    // Case 3: User verified but needs onboarding
    if (user && !needsEmailVerification && needsOnboarding && !inOnboardingGroup) {
      console.log('➡️ Redirecting to onboarding');
      router.replace('/onboarding/personal-info');
      return;
    }

    // Case 4: User authenticated and onboarded, but still in auth screens
    if (user && !needsEmailVerification && !needsOnboarding && inAuthGroup) {
      console.log('➡️ Redirecting to home (already authenticated)');
      router.replace('/(tabs)/home');
      return;
    }

    // Case 5: User authenticated and onboarded, redirect from onboarding to app
    // BUT: DON'T redirect if on welcome screen - let it handle its own navigation
    if (user && !needsEmailVerification && !needsOnboarding && inOnboardingGroup && !onWelcomeScreen) {
      console.log('➡️ Redirecting to home (onboarding complete)');
      router.replace('/(tabs)/home');
      return;
    }

  }, [user, userProfile, loading, needsEmailVerification, needsOnboarding, segments]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});