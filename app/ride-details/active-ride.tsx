import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';

export default function ActiveRideScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rideId: string; role: string }>();
  const isDriver = params.role === 'driver';

  const [rideStatus, setRideStatus] = useState<'scheduled' | 'started' | 'completed'>('scheduled');

  // Mock ride data
  const ride = {
    id: params.rideId,
    driver: {
      name: 'Alice Johnson',
      photo: null,
    },
    riders: [
      {
        id: '1',
        name: 'John Doe',
        photo: null,
        pickupLocation: { lat: 37.7749, lng: -122.4194, address: '123 Market St' },
        dropoffLocation: { lat: 37.7844, lng: -122.4294, address: '456 Mission St' },
        status: 'confirmed',
        checkedIn: false,
        paid: false,
      },
      {
        id: '2',
        name: 'Jane Smith',
        photo: null,
        pickupLocation: { lat: 37.7799, lng: -122.4244, address: '789 Pine St' },
        dropoffLocation: { lat: 37.8044, lng: -122.2712, address: '321 Broadway' },
        status: 'confirmed',
        checkedIn: false,
        paid: false,
      },
    ],
    requests: [
      {
        id: '3',
        riderName: 'Bob Wilson',
        riderPhoto: null,
        riderCompany: 'StartupXYZ',
        pickupLocation: { lat: 37.7775, lng: -122.4220, address: '555 Howard St' },
        status: 'pending',
      },
    ],
  };

  const handleStartRide = () => {
    Alert.alert(
      'Start Ride',
      'Are you ready to start the ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            setRideStatus('started');
            // TODO: Send notification to all riders
          },
        },
      ]
    );
  };

  const handleCheckInRider = (riderId: string) => {
    Alert.alert(
      'Check In',
      'Confirm rider has been picked up?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check In',
          onPress: () => {
            // TODO: Update rider status
            console.log('Checked in rider:', riderId);
          },
        },
      ]
    );
  };

  const handleEndRide = () => {
    Alert.alert(
      'End Ride',
      'Complete this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Ride',
          onPress: () => {
            setRideStatus('completed');
            router.push(`/feedback/${params.rideId}`);
          },
        },
      ]
    );
  };

  const handleAcceptRequest = (requestId: string) => {
    Alert.alert('Request Accepted', 'Rider has been notified');
    // TODO: Update request status
  };

  const handleRejectRequest = (requestId: string) => {
    Alert.alert('Request Rejected');
    // TODO: Update request status
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {isDriver ? 'Your Ride' : 'Current Ride'}
          </Text>
          <View style={styles.statusBadge}>
            <View style={[
              styles.statusDot,
              rideStatus === 'started' && { backgroundColor: '#10b981' },
              rideStatus === 'scheduled' && { backgroundColor: '#f59e0b' },
            ]} />
            <Text style={styles.statusText}>
              {rideStatus === 'started' ? 'In Progress' : 'Scheduled'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push(`/ride-details/chat/${params.rideId}`)}>
          <Ionicons name="chatbubbles-outline" size={24} color="#111827" />
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
            {/* Driver marker */}
            <Marker
              coordinate={{ latitude: 37.7749, longitude: -122.4194 }}
              pinColor="blue"
              title="Driver"
            />
            
            {/* Rider markers */}
            {ride.riders.map((rider) => (
              <Marker
                key={rider.id}
                coordinate={rider.pickupLocation}
                pinColor="green"
                title={rider.name}
              />
            ))}
          </MapView>
        </View>

        {/* Driver Controls */}
        {isDriver && (
          <View style={styles.section}>
            <View style={styles.controlButtons}>
              {rideStatus === 'scheduled' && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleStartRide}
                >
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Start Ride</Text>
                </TouchableOpacity>
              )}

              {rideStatus === 'started' && (
                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={handleEndRide}
                >
                  <Ionicons name="stop" size={20} color="#fff" />
                  <Text style={styles.dangerButtonText}>End Ride</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Riders List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Passengers ({ride.riders.length})
          </Text>

          {ride.riders.map((rider) => (
            <View key={rider.id} style={styles.riderCard}>
              <View style={styles.riderAvatar}>
                <Text style={styles.riderInitial}>
                  {rider.name.charAt(0)}
                </Text>
              </View>

              <View style={styles.riderInfo}>
                <Text style={styles.riderName}>{rider.name}</Text>
                <Text style={styles.riderLocation}>
                  {rider.pickupLocation.address}
                </Text>
                <View style={styles.riderStatus}>
                  {rider.checkedIn ? (
                    <>
                      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                      <Text style={[styles.riderStatusText, { color: '#10b981' }]}>
                        Checked In
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="time-outline" size={16} color="#f59e0b" />
                      <Text style={[styles.riderStatusText, { color: '#f59e0b' }]}>
                        Waiting
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {isDriver && rideStatus === 'started' && !rider.checkedIn && (
                <TouchableOpacity
                  style={styles.checkInButton}
                  onPress={() => handleCheckInRider(rider.id)}
                >
                  <Text style={styles.checkInButtonText}>Check In</Text>
                </TouchableOpacity>
              )}

              {!isDriver && rider.checkedIn && !rider.paid && (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => router.push(`/payment/${ride.id}`)}
                >
                  <Ionicons name="card-outline" size={16} color="#fff" />
                  <Text style={styles.payButtonText}>Pay</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Pending Requests (Driver Only) */}
        {isDriver && ride.requests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pending Requests ({ride.requests.length})
            </Text>

            {ride.requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestAvatar}>
                  <Text style={styles.requestInitial}>
                    {request.riderName.charAt(0)}
                  </Text>
                </View>

                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{request.riderName}</Text>
                  <Text style={styles.requestCompany}>{request.riderCompany}</Text>
                  <Text style={styles.requestLocation}>
                    {request.pickupLocation.address}
                  </Text>
                </View>

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRequest(request.id)}
                  >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleRejectRequest(request.id)}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Passenger View - Driver Info */}
        {!isDriver && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Driver</Text>
            
            <View style={styles.driverCard}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverInitial}>
                  {ride.driver.name.charAt(0)}
                </Text>
              </View>
              
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{ride.driver.name}</Text>
                <View style={styles.driverRating}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.callButton}>
                <Ionicons name="call" size={20} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 250,
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
  controlButtons: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  riderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  riderInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  riderLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  riderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  riderStatusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkInButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkInButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  requestCompany: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  requestLocation: {
    fontSize: 13,
    color: '#9ca3af',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});