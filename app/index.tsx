import { Redirect } from 'expo-router';

export default function Index() {
  // This will be handled by the root layout
  // If authenticated -> /(tabs)/home
  // If not authenticated -> /(auth)/sign-in
  return <Redirect href="/(auth)/sign-in" />;
}
