// mobile-app/app/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to sign-in if not authenticated
      console.log('Redirecting to sign-in');
      router.replace('/(auth)/sign-in');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(tabs)/home');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
