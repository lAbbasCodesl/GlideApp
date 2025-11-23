import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const { userProfile } = useAuth();
  const router = useRouter();
  
  const [startLocation, setStartLocation] = useState('');
  const [destLocation, setDestLocation] = useState('');
  const [selectedMode, setSelectedMode] = useState<'find' | 'offer'>('find');

  const handleLocationSelect = (type: 'start' | 'dest') => {
    router.push({
      pathname: '/address-selection',
      params: { type, returnTo: '/(tabs)/home' },
    });
  };

  const handleSearch = () => {
    if (!startLocation || !destLocation) {
      alert('Please enter both locations');
      return;
    }

    if (selectedMode === 'find') {
      router.push({
        pathname: '/search-results',
        params: {
          startLat: '37.7749',
          startLng: '-122.4194',
          destLat: '37.8044',
          destLng: '-122.2712',
          mode: 'rider',
        },
      });
    } else {
      // Create ride and show potential riders
      router.push({
        pathname: '/search-results',
        params: {
          startLat: '37.7749',
          startLng: '-122.4194',
          destLat: '37.8044',
          destLng: '-122.2712',
          mode: 'driver',
        },
      });
    }
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
                !startLocation && styles.locationInputPlaceholder,
              ]}
            >
              {startLocation || 'Pickup Location'}
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
                !destLocation && styles.locationInputPlaceholder,
              ]}
            >
              {destLocation || 'Drop-off Location'}
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
        
        <TouchableOpacity style={styles.recentRideCard}>
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

        <TouchableOpacity style={styles.recentRideCard}>
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
});