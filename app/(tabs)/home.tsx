// app/(tabs)/home.tsx - FIXED VERSION with address state management
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Location state
  const [startLocation, setStartLocation] = useState({
    address: '',
    lat: null as number | null,
    lng: null as number | null,
  });
  
  const [destLocation, setDestLocation] = useState({
    address: '',
    lat: null as number | null,
    lng: null as number | null,
  });
  
  const [selectedMode, setSelectedMode] = useState<'find' | 'offer'>('find');

  // Listen for address updates from address-selection screen
  useEffect(() => {
    // Check for start location update
    if (params.startAddress && params.startAddress !== startLocation.address) {
      setStartLocation({
        address: params.startAddress as string,
        lat: params.startLat ? parseFloat(params.startLat as string) : null,
        lng: params.startLng ? parseFloat(params.startLng as string) : null,
      });
    }

    // Check for destination location update
    if (params.destAddress && params.destAddress !== destLocation.address) {
      setDestLocation({
        address: params.destAddress as string,
        lat: params.destLat ? parseFloat(params.destLat as string) : null,
        lng: params.destLng ? parseFloat(params.destLng as string) : null,
      });
    }
  }, [params.startAddress, params.startLat, params.startLng, params.destAddress, params.destLat, params.destLng]);

  const handleLocationSelect = (type: 'start' | 'dest') => {
    router.push({
      pathname: '/address-selection',
      params: { 
        type, 
        returnTo: '/(tabs)/home',
        // Pass current locations so they can be preserved
        currentStartAddress: startLocation.address || undefined,
        currentStartLat: startLocation.lat?.toString() || undefined,
        currentStartLng: startLocation.lng?.toString() || undefined,
        currentDestAddress: destLocation.address || undefined,
        currentDestLat: destLocation.lat?.toString() || undefined,
        currentDestLng: destLocation.lng?.toString() || undefined,
      },
    });
  };

  const handleSearch = () => {
    if (!startLocation.address || !destLocation.address) {
      alert('Please enter both pickup and drop-off locations');
      return;
    }

    // Check if user is trying to offer a ride
    if (selectedMode === 'offer') {
      // Check if user has vehicle
      if (!userProfile?.vehicle) {
        Alert.alert(
          'Vehicle Required',
          'To offer rides, you need to add your vehicle first.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add Vehicle',
              onPress: () => router.push('/vehicle/add'),
            },
          ]
        );
        return;
      }

      // Check if user has license
      if (!userProfile?.license) {
        Alert.alert(
          'Driver\'s License Required',
          'To offer rides, you need to upload your driver\'s license for verification.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Add License',
              onPress: () => router.push('/license/add'),
            },
          ]
        );
        return;
      }

      // Check license verification status
      if (userProfile.license.verificationStatus === 'rejected') {
        Alert.alert(
          'License Verification Failed',
          userProfile.license.rejectionReason || 'Your license was not approved. Please update and resubmit.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Update License',
              onPress: () => router.push({
                pathname: '/license/add',
                params: { edit: 'true' },
              }),
            },
          ]
        );
        return;
      }

      if (userProfile.license.verificationStatus === 'expired') {
        Alert.alert(
          'License Expired',
          'Your driver\'s license has expired. Please update it to continue offering rides.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Update License',
              onPress: () => router.push({
                pathname: '/license/add',
                params: { edit: 'true' },
              }),
            },
          ]
        );
        return;
      }

      // If pending or approved, allow them to continue
      if (userProfile.license.verificationStatus === 'pending') {
        Alert.alert(
          'Verification Pending',
          'Your license is being verified. You can create rides now, but riders may prefer verified drivers.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue Anyway', onPress: () => createRide() },
          ]
        );
        return;
      }

      // License approved - proceed
      createRide();
    } else {
      // Find ride mode - no requirements
      searchRides();
    }
  };

  const searchRides = () => {
    router.push({
      pathname: '/search-results',
      params: {
        startLat: startLocation.lat?.toString() || '37.7749',
        startLng: startLocation.lng?.toString() || '-122.4194',
        destLat: destLocation.lat?.toString() || '37.8044',
        destLng: destLocation.lng?.toString() || '-122.2712',
        startAddress: startLocation.address,
        destAddress: destLocation.address,
        mode: 'rider',
      },
    });
  };

  const createRide = () => {
    router.push({
      pathname: '/search-results',
      params: {
        startLat: startLocation.lat?.toString() || '37.7749',
        startLng: startLocation.lng?.toString() || '-122.4194',
        destLat: destLocation.lat?.toString() || '37.8044',
        destLng: destLocation.lng?.toString() || '-122.2712',
        startAddress: startLocation.address,
        destAddress: destLocation.address,
        mode: 'driver',
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userProfile?.displayName}! 👋</Text>
          <Text style={styles.subtitle}>Where are you going today?</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/profile')}
        >
          <Ionicons name="settings-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Mode Selection */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'find' && styles.modeButtonActive,
          ]}
          onPress={() => setSelectedMode('find')}
        >
          <Ionicons
            name="search"
            size={20}
            color={selectedMode === 'find' ? '#fff' : '#6b7280'}
          />
          <Text
            style={[
              styles.modeButtonText,
              selectedMode === 'find' && styles.modeButtonTextActive,
            ]}
          >
            Find a Ride
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            selectedMode === 'offer' && styles.modeButtonActive,
          ]}
          onPress={() => setSelectedMode('offer')}
        >
          <Ionicons
            name="car"
            size={20}
            color={selectedMode === 'offer' ? '#fff' : '#6b7280'}
          />
          <Text
            style={[
              styles.modeButtonText,
              selectedMode === 'offer' && styles.modeButtonTextActive,
            ]}
          >
            Offer a Ride
          </Text>
        </TouchableOpacity>
      </View>

      {/* Driver Requirements Banner */}
      {selectedMode === 'offer' && userProfile.license.verificationStatus !== 'approved' && (
        <View style={styles.requirementsBanner}>
          {!userProfile?.vehicle || !userProfile?.license ? (
            <>
              <Ionicons name="information-circle" size={24} color="#f59e0b" />
              <View style={styles.requirementsContent}>
                <Text style={styles.requirementsTitle}>Setup Required</Text>
                <Text style={styles.requirementsText}>
                  To offer rides, you need:
                </Text>
                <View style={styles.requirementsList}>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={userProfile?.vehicle ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={userProfile?.vehicle ? "#10b981" : "#9ca3af"} 
                    />
                    <Text style={styles.requirementItemText}>Vehicle information</Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons 
                      name={userProfile?.license ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={userProfile?.license ? "#10b981" : "#9ca3af"} 
                    />
                    <Text style={styles.requirementItemText}>Driver's license</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.setupButton}
                  onPress={() => router.push('/profile/edit')}
                >
                  <Text style={styles.setupButtonText}>Complete Setup</Text>
                  <Ionicons name="arrow-forward" size={16} color="#f59e0b" />
                </TouchableOpacity>
              </View>
            </>
          ) : userProfile.license.verificationStatus === 'pending' ? (
            <>
              <Ionicons name="time" size={24} color="#2563eb" />
              <View style={styles.requirementsContent}>
                <Text style={styles.requirementsTitle}>Verification Pending</Text>
                <Text style={styles.requirementsText}>
                  Your license is being verified. You can create rides now, but riders may prefer verified drivers.
                </Text>
              </View>
            </>
          ) : (
            <>
              <Ionicons name="warning" size={24} color="#ef4444" />
              <View style={styles.requirementsContent}>
                <Text style={styles.requirementsTitle}>Action Required</Text>
                <Text style={styles.requirementsText}>
                  {userProfile.license.verificationStatus === 'rejected' 
                    ? 'Your license verification was rejected. Please update it.'
                    : 'Your license has expired. Please update it to continue offering rides.'}
                </Text>
                <TouchableOpacity 
                  style={[styles.setupButton, styles.setupButtonDanger]}
                  onPress={() => router.push({
                    pathname: '/license/add',
                    params: { edit: 'true' },
                  })}
                >
                  <Text style={styles.setupButtonTextDanger}>Update License</Text>
                  <Ionicons name="arrow-forward" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {/* Location Inputs */}
      <View style={styles.locationContainer}>
        <View style={styles.locationDots}>
          <View style={styles.startDot} />
          <View style={styles.locationLine} />
          <View style={styles.endDot} />
        </View>

        <View style={styles.locationInputs}>
          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => handleLocationSelect('start')}
          >
            <Ionicons name="location" size={20} color="#10b981" />
            <Text
              style={[
                styles.locationInputText,
                !startLocation.address && styles.locationInputPlaceholder,
              ]}
              numberOfLines={1}
            >
              {startLocation.address || 'Pickup Location'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => handleLocationSelect('dest')}
          >
            <Ionicons name="location" size={20} color="#ef4444" />
            <Text
              style={[
                styles.locationInputText,
                !destLocation.address && styles.locationInputPlaceholder,
              ]}
              numberOfLines={1}
            >
              {destLocation.address || 'Drop-off Location'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>
          {selectedMode === 'find' ? 'Search Rides' : 'Create Ride'}
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/ride-details/my-rides')}
          >
            <Ionicons name="calendar-outline" size={32} color="#2563eb" />
            <Text style={styles.quickActionText}>My Rides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/payment/history')}
          >
            <Ionicons name="wallet-outline" size={32} color="#10b981" />
            <Text style={styles.quickActionText}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/messages')}
          >
            <Ionicons name="chatbubble-outline" size={32} color="#f59e0b" />
            <Text style={styles.quickActionText}>Messages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-outline" size={32} color="#8b5cf6" />
            <Text style={styles.quickActionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Rides */}
      <View style={styles.recentRides}>
        <Text style={styles.sectionTitle}>Recent Routes</Text>
        
        <TouchableOpacity 
          style={styles.recentRideCard}
          onPress={() => {
            setStartLocation({
              address: '123 Main St, San Francisco',
              lat: 37.7749,
              lng: -122.4194,
            });
            setDestLocation({
              address: '456 Market St, San Francisco',
              lat: 37.7849,
              lng: -122.4094,
            });
          }}
        >
          <View style={styles.recentRideIcon}>
            <Ionicons name="time-outline" size={20} color="#6b7280" />
          </View>
          <View style={styles.recentRideInfo}>
            <Text style={styles.recentRideRoute}>Home → Work</Text>
            <Text style={styles.recentRideAddress}>
              123 Main St → 456 Market St
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.recentRideCard}
          onPress={() => {
            setStartLocation({
              address: '456 Market St, San Francisco',
              lat: 37.7849,
              lng: -122.4094,
            });
            setDestLocation({
              address: '789 Fitness Ave, San Francisco',
              lat: 37.7949,
              lng: -122.3994,
            });
          }}
        >
          <View style={styles.recentRideIcon}>
            <Ionicons name="time-outline" size={20} color="#6b7280" />
          </View>
          <View style={styles.recentRideInfo}>
            <Text style={styles.recentRideRoute}>Work → Gym</Text>
            <Text style={styles.recentRideAddress}>
              456 Market St → 789 Fitness Ave
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  locationDots: {
    alignItems: 'center',
    paddingTop: 16,
    marginRight: 12,
  },
  startDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  locationLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#d1d5db',
    marginVertical: 4,
  },
  endDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  locationInputs: {
    flex: 1,
    gap: 12,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  locationInputText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  locationInputPlaceholder: {
    color: '#9ca3af',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  recentRides: {
    padding: 16,
    paddingBottom: 32,
  },
  recentRideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  recentRideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentRideInfo: {
    flex: 1,
  },
  recentRideRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  recentRideAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  requirementsBanner: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
    gap: 12,
  },
  requirementsContent: {
    flex: 1,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  requirementsText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
    marginBottom: 8,
  },
  requirementsList: {
    gap: 6,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementItemText: {
    fontSize: 14,
    color: '#78350f',
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 6,
  },
  setupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  setupButtonDanger: {
    // For rejected/expired states
  },
  setupButtonTextDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
});