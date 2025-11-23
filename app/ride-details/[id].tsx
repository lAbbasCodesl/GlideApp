import React from 'react';
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
import MapView, { Polyline, Marker } from 'react-native-maps';

export default function RideDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; mode?: string }>();

  // Mock ride data
  const ride = {
    id: params.id,
    driver: {
      name: 'Alice Johnson',
      photo: null,
      rating: 4.8,
      totalRides: 126,
      company: 'Tech Corp',
      verified: true,
    },
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      color: 'Blue',
      year: 2020,
      licensePlate: 'ABC-123',
    },
    price: 5,
    availableSeats: 3,
    departureTime: '8:00 AM',
    estimatedArrival: '8:25 AM',
    route: {
      start: { lat: 37.7749, lng: -122.4194, address: '123 Market St, SF' },
      end: { lat: 37.8044, lng: -122.2712, address: '456 Broadway, Oakland' },
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.7749,
              longitude: -122.4194,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            <Marker coordinate={ride.route.start} pinColor="green" />
            <Marker coordinate={ride.route.end} pinColor="red" />
            <Polyline
              coordinates={[ride.route.start, ride.route.end]}
              strokeColor="#2563eb"
              strokeWidth={4}
            />
          </MapView>
        </View>

        {/* Driver Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver</Text>
          
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverInitial}>
                {ride.driver.name.charAt(0)}
              </Text>
            </View>
            
            <View style={styles.driverInfo}>
              <View style={styles.driverNameRow}>
                <Text style={styles.driverName}>{ride.driver.name}</Text>
                {ride.driver.verified && (
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                )}
              </View>
              
              <View style={styles.driverStats}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.statText}>{ride.driver.rating}</Text>
                </View>
                <Text style={styles.statDivider}>•</Text>
                <Text style={styles.statText}>{ride.driver.totalRides} rides</Text>
                <Text style={styles.statDivider}>•</Text>
                <Text style={styles.statText}>{ride.driver.company}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="car-outline" size={20} color="#6b7280" />
              <Text style={styles.infoText}>
                {ride.vehicle.color} {ride.vehicle.make} {ride.vehicle.model} ({ride.vehicle.year})
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color="#6b7280" />
              <Text style={styles.infoText}>{ride.vehicle.licensePlate}</Text>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          
          <View style={styles.tripCard}>
            <View style={styles.tripRow}>
              <View style={styles.tripDot} style={{ backgroundColor: '#10b981' }} />
              <View style={styles.tripInfo}>
                <Text style={styles.tripLabel}>Pickup</Text>
                <Text style={styles.tripAddress}>{ride.route.start.address}</Text>
                <Text style={styles.tripTime}>{ride.departureTime}</Text>
              </View>
            </View>

            <View style={styles.tripLine} />

            <View style={styles.tripRow}>
              <View style={styles.tripDot} style={{ backgroundColor: '#ef4444' }} />
              <View style={styles.tripInfo}>
                <Text style={styles.tripLabel}>Drop-off</Text>
                <Text style={styles.tripAddress}>{ride.route.end.address}</Text>
                <Text style={styles.tripTime}>{ride.estimatedArrival}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          <View style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Price per seat</Text>
              <Text style={styles.pricingValue}>${ride.price}</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Available seats</Text>
              <Text style={styles.pricingValue}>{ride.availableSeats}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerPrice}>${ride.price}</Text>
          <Text style={styles.footerLabel}>per seat</Text>
        </View>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => {
            // TODO: Handle request ride
            alert('Request sent!');
          }}
        >
          <Text style={styles.requestButtonText}>Request Ride</Text>
        </TouchableOpacity>
      </View>
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
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  driverInfo: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  driverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statDivider: {
    fontSize: 14,
    color: '#d1d5db',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#111827',
  },
  tripCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  tripRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tripDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  tripLine: {
    width: 2,
    height: 24,
    backgroundColor: '#d1d5db',
    marginLeft: 5,
    marginVertical: 4,
  },
  tripInfo: {
    flex: 1,
  },
  tripLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  tripAddress: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  tripTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  pricingCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pricingLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  pricingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  footerInfo: {
    marginRight: 16,
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  footerLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  requestButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

