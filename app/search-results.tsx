import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock ride data
const mockRides = [
  {
    id: '1',
    driver: {
      name: 'Alice Johnson',
      photo: null,
      rating: 4.8,
      company: 'Tech Corp',
      verified: true,
    },
    price: 5,
    availableSeats: 3,
    departureTime: '8:00 AM',
    walkToPickup: 0.2, // km
    walkFromDrop: 0.3,
    estimatedTime: '25 min',
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      color: 'Blue',
      year: 2020,
    },
  },
  {
    id: '2',
    driver: {
      name: 'Bob Smith',
      photo: null,
      rating: 4.6,
      company: 'StartupXYZ',
      verified: true,
    },
    price: 6,
    availableSeats: 2,
    departureTime: '8:15 AM',
    walkToPickup: 0.5,
    walkFromDrop: 0.4,
    estimatedTime: '30 min',
    vehicle: {
      make: 'Honda',
      model: 'Accord',
      color: 'Silver',
      year: 2019,
    },
  },
  {
    id: '3',
    driver: {
      name: 'Carol Williams',
      photo: null,
      rating: 4.9,
      company: 'Finance Inc',
      verified: false,
    },
    price: 4,
    availableSeats: 1,
    departureTime: '8:30 AM',
    walkToPickup: 0.8,
    walkFromDrop: 0.6,
    estimatedTime: '28 min',
    vehicle: {
      make: 'Tesla',
      model: 'Model 3',
      color: 'White',
      year: 2021,
    },
  },
];

export default function SearchResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode: string }>();
  const isDriverMode = params.mode === 'driver';

  const [sortBy, setSortBy] = useState<'best-match' | 'price' | 'time'>('best-match');

 return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {isDriverMode ? 'Potential Riders' : 'Available Rides'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {mockRides.length} {isDriverMode ? 'riders' : 'rides'} found
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <ScrollView
        horizontal
        style={styles.sortContainer}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'best-match' && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy('best-match')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'best-match' && styles.sortButtonTextActive,
            ]}
          >
            Best Match
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'price' && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy('price')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'price' && styles.sortButtonTextActive,
            ]}
          >
            Lowest Price
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'time' && styles.sortButtonActive,
          ]}
          onPress={() => setSortBy('time')}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'time' && styles.sortButtonTextActive,
            ]}
          >
            Earliest Time
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Ride Cards */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {mockRides.map((ride) => (
          <TouchableOpacity
            key={ride.id}
            style={styles.rideCard}
            onPress={() => router.push(`/ride-details/${ride.id}?mode=${params.mode}`)}
          >
            {/* Driver Info */}
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverInitial}>
                  {ride.driver.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.driverInfo}>
                <View style={styles.driverNameRow}>
                  <Text style={styles.driverName}>{ride.driver.name}</Text>
                  {ride.driver.verified && (
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  )}
                </View>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.rating}>{ride.driver.rating}</Text>
                  <Text style={styles.company}>• {ride.driver.company}</Text>
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${ride.price}</Text>
                <Text style={styles.priceLabel}>per seat</Text>
              </View>
            </View>

            {/* Time & Vehicle */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.detailText}>{ride.departureTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={16} color="#6b7280" />
                <Text style={styles.detailText}>
                  {ride.vehicle.color} {ride.vehicle.make}
                </Text>
              </View>
            </View>

            {/* Walking Distance */}
            <View style={styles.walkingInfo}>
              <View style={styles.walkingItem}>
                <Ionicons name="walk-outline" size={16} color="#10b981" />
                <Text style={styles.walkingText}>
                  {ride.walkToPickup}km walk to pickup
                </Text>
              </View>
              <View style={styles.walkingItem}>
                <Ionicons name="walk-outline" size={16} color="#ef4444" />
                <Text style={styles.walkingText}>
                  {ride.walkFromDrop}km walk from drop
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.seatsInfo}>
                <Ionicons name="people-outline" size={16} color="#6b7280" />
                <Text style={styles.seatsText}>
                  {ride.availableSeats} seats available
                </Text>
              </View>
              <TouchableOpacity
                style={styles.requestButton}
                onPress={(e) => {
                  e.stopPropagation();
                  // TODO: Handle request ride
                  alert('Request sent!');
                }}
              >
                <Text style={styles.requestButtonText}>
                  {isDriverMode ? 'Invite' : 'Request Ride'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  sortContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#2563eb',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  driverInfo: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  company: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  walkingInfo: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  walkingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walkingText: {
    fontSize: 13,
    color: '#6b7280',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seatsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  requestButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

