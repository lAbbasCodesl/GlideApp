
// mobile-app/app/address-selection.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

export default function AddressSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: string; returnTo: string }>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // Mock autocomplete results
  const suggestions = [
    {
      id: '1',
      name: 'San Francisco Financial District',
      address: '123 Market St, San Francisco, CA 94105',
      lat: 37.7749,
      lng: -122.4194,
    },
    {
      id: '2',
      name: 'Oakland Downtown',
      address: '456 Broadway, Oakland, CA 94607',
      lat: 37.8044,
      lng: -122.2712,
    },
    {
      id: '3',
      name: 'Mission District',
      address: '789 Mission St, San Francisco, CA 94103',
      lat: 37.7599,
      lng: -122.4148,
    },
  ];

  const handleSelectLocation = (location: typeof suggestions[0]) => {
    // TODO: In production, pass this back to previous screen
    console.log('Selected location:', location);
    router.back();
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({
      lat: latitude,
      lng: longitude,
      address: 'Selected location on map',
    });
  };

  const handleConfirmMapLocation = () => {
    if (selectedLocation) {
      console.log('Confirmed map location:', selectedLocation);
      router.back();
    }
  };

return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Select {params.type === 'start' ? 'Pickup' : 'Drop-off'} Location
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a location"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Recent/Frequent Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Locations</Text>
          
          {suggestions.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={styles.locationItem}
              onPress={() => handleSelectLocation(location)}
            >
              <View style={styles.locationIcon}>
                <Ionicons name="time-outline" size={20} color="#6b7280" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationAddress}>{location.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Map Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select on Map</Text>
          
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 37.7749,
                longitude: -122.4194,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              onPress={handleMapPress}
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.lat,
                    longitude: selectedLocation.lng,
                  }}
                />
              )}
            </MapView>
            
            {selectedLocation && (
              <TouchableOpacity
                style={styles.confirmMapButton}
                onPress={handleConfirmMapLocation}
              >
                <Text style={styles.confirmMapButtonText}>
                  Confirm Location
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    marginBottom: 8,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  confirmMapButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmMapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
