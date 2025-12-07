// app/address-selection.tsx - FIXED VERSION with Google Places
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import {
  getSavedLocations,
  getRecentLocations,
  addRecentLocation,
  SavedLocation,
  RecentLocation,
} from '../services/locationCacheService';

// Google Places API Key - Add this to your environment
const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY'; // Get from Google Cloud Console

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface SelectedLocation {
  lat: number;
  lng: number;
  address: string;
}

export default function AddressSelectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    type: 'start' | 'dest';
    returnTo?: string;
    // Preserve existing location params
    currentStartAddress?: string;
    currentStartLat?: string;
    currentStartLng?: string;
    currentDestAddress?: string;
    currentDestLat?: string;
    currentDestLng?: string;
  }>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  
  // Cached locations
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);

  // Load cached locations on mount
  useEffect(() => {
    loadCachedLocations();
  }, []);

  const loadCachedLocations = async () => {
    try {
      const [saved, recent] = await Promise.all([
        getSavedLocations(),
        getRecentLocations(5), // Get top 5 recent
      ]);
      setSavedLocations(saved);
      setRecentLocations(recent);
    } catch (error) {
      console.error('Error loading cached locations:', error);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.length < 3) {
      setPredictions([]);
      return;
    }

    const timer = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Search places using Google Places Autocomplete API
   */
  const searchPlaces = async (query: string) => {
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
      console.warn('⚠️ Google Places API Key not configured');
      // Show mock data for development
      showMockResults();
      return;
    }

    setLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&key=${GOOGLE_PLACES_API_KEY}&components=country:us`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        setPredictions(data.predictions);
      } else {
        console.error('Places API error:', data.status);
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mock results for development/testing
   */
  const showMockResults = () => {
    const mockPredictions: PlacePrediction[] = [
      {
        place_id: '1',
        description: '123 Market St, San Francisco, CA 94105',
        structured_formatting: {
          main_text: 'San Francisco Financial District',
          secondary_text: '123 Market St, San Francisco, CA 94105',
        },
      },
      {
        place_id: '2',
        description: '456 Broadway, Oakland, CA 94607',
        structured_formatting: {
          main_text: 'Oakland Downtown',
          secondary_text: '456 Broadway, Oakland, CA 94607',
        },
      },
      {
        place_id: '3',
        description: '789 Mission St, San Francisco, CA 94103',
        structured_formatting: {
          main_text: 'Mission District',
          secondary_text: '789 Mission St, San Francisco, CA 94103',
        },
      },
    ];
    setPredictions(mockPredictions);
  };

  /**
   * Get place details (lat/lng) from place_id
   */
  const getPlaceDetails = async (placeId: string, description: string) => {
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
      // Mock coordinates for development
      const mockLocation: SelectedLocation = {
        lat: 37.7749,
        lng: -122.4194,
        address: description,
      };
      handleLocationSelect(mockLocation);
      return;
    }

    setLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result?.geometry?.location) {
        const location: SelectedLocation = {
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
          address: description,
        };
        handleLocationSelect(location);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle location selection and navigate back
   */
  const handleLocationSelect = async (location: SelectedLocation) => {
    console.log('Selected location:', location);
    
    // Save to recent locations cache
    try {
      await addRecentLocation(location.address, location.lat, location.lng);
    } catch (error) {
      console.error('Error saving to recent:', error);
      // Don't block navigation on cache error
    }
    
    // Build params that preserve existing locations
    const navigationParams: any = {};
    
    if (params.type === 'start') {
      // Updating start location - preserve dest
      navigationParams.startAddress = location.address;
      navigationParams.startLat = location.lat.toString();
      navigationParams.startLng = location.lng.toString();
      
      // Preserve existing dest location if it exists
      if (params.currentDestAddress) {
        navigationParams.destAddress = params.currentDestAddress;
        navigationParams.destLat = params.currentDestLat;
        navigationParams.destLng = params.currentDestLng;
      }
    } else {
      // Updating dest location - preserve start
      navigationParams.destAddress = location.address;
      navigationParams.destLat = location.lat.toString();
      navigationParams.destLng = location.lng.toString();
      
      // Preserve existing start location if it exists
      if (params.currentStartAddress) {
        navigationParams.startAddress = params.currentStartAddress;
        navigationParams.startLat = params.currentStartLat;
        navigationParams.startLng = params.currentStartLng;
      }
    }
    
    // Navigate back with all params
    if (params.returnTo) {
      router.push({
        pathname: params.returnTo as any,
        params: navigationParams,
      });
    } else {
      router.back();
    }
  };

  /**
   * Handle map press
   */
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({
      lat: latitude,
      lng: longitude,
      address: 'Selected location on map',
    });
  };

  /**
   * Confirm map selection
   */
  const handleConfirmMapLocation = () => {
    if (selectedLocation) {
      handleLocationSelect(selectedLocation);
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
        {loading && <ActivityIndicator size="small" color="#2563eb" />}
        {searchQuery.length > 0 && !loading && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Search Results */}
        {predictions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            
            {predictions.map((prediction) => (
              <TouchableOpacity
                key={prediction.place_id}
                style={styles.locationItem}
                onPress={() => getPlaceDetails(prediction.place_id, prediction.description)}
              >
                <View style={styles.locationIcon}>
                  <Ionicons name="location-outline" size={20} color="#2563eb" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>
                    {prediction.structured_formatting.main_text}
                  </Text>
                  <Text style={styles.locationAddress}>
                    {prediction.structured_formatting.secondary_text}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Saved Locations (Home, Work, etc.) */}
        {predictions.length === 0 && searchQuery.length === 0 && savedLocations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Locations</Text>
            
            {savedLocations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={styles.locationItem}
                onPress={() => handleLocationSelect({
                  lat: location.lat,
                  lng: location.lng,
                  address: location.address,
                })}
              >
                <View style={[styles.locationIcon, styles.savedLocationIcon]}>
                  <Ionicons 
                    name={location.type === 'home' ? 'home' : location.type === 'work' ? 'briefcase' : 'star'} 
                    size={20} 
                    color="#2563eb" 
                  />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationAddress}>{location.address}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Locations */}
        {predictions.length === 0 && searchQuery.length === 0 && recentLocations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent</Text>
            
            {recentLocations.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={styles.locationItem}
                onPress={() => handleLocationSelect({
                  lat: location.lat,
                  lng: location.lng,
                  address: location.address,
                })}
              >
                <View style={styles.locationIcon}>
                  <Ionicons name="time-outline" size={20} color="#6b7280" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>
                    {location.address.split(',')[0]}
                  </Text>
                  <Text style={styles.locationAddress}>{location.address}</Text>
                </View>
                {location.frequency > 2 && (
                  <View style={styles.frequencyBadge}>
                    <Ionicons name="trending-up" size={12} color="#10b981" />
                    <Text style={styles.frequencyText}>{location.frequency}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Map Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Or Select on Map</Text>
          
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
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
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
  savedLocationIcon: {
    backgroundColor: '#eff6ff',
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginRight: 8,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
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