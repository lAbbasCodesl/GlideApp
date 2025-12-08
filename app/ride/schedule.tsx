// app/ride/schedule.tsx
/**
 * Schedule Creation/Edit Screen
 * 
 * Allows users to create or modify their recurring ride schedule
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSchedule } from '../../hooks/useSchedule';
import { ALL_DAYS, DayOfWeek, getShortDayName, formatTime12Hour } from '../../types/schedule';

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    type: 'driver' | 'rider';
    startAddress: string;
    startLat: string;
    startLng: string;
    destAddress: string;
    destLat: string;
    destLng: string;
    departureTime?: string;
    returnAction?: 'createRide' | 'searchRides'; // NEW: Signal what to do after saving
  }>();

  const { loading, schedule, createOrUpdateSchedule } = useSchedule();

  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [departureTime, setDepartureTime] = useState('08:00');
  const [autoSearch, setAutoSearch] = useState(true);

  // Initialize with existing schedule if editing
  useEffect(() => {
    if (schedule) {
      setSelectedDays(schedule.daysOfWeek);
      setDepartureTime(schedule.departureTime);
      setAutoSearch(schedule.autoSearch);
    } else if (params.departureTime) {
      setDepartureTime(params.departureTime);
    }
  }, [schedule]);

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Select Days', 'Please select at least one day');
      return;
    }

    try {
      await createOrUpdateSchedule({
        type: params.type as 'driver' | 'rider',
        startLocation: {
          lat: parseFloat(params.startLat),
          lng: parseFloat(params.startLng),
          address: params.startAddress,
        },
        endLocation: {
          lat: parseFloat(params.destLat),
          lng: parseFloat(params.destLng),
          address: params.destAddress,
        },
        departureTime,
        daysOfWeek: selectedDays,
        active: true,
        autoSearch,
      });

      // Check if we need to perform an action after saving schedule
      const returnAction = params.returnAction;
      
      if (returnAction === 'createRide') {
        // Driver created schedule, now create the ride
        Alert.alert(
          'Schedule Saved!',
          'Great! Now creating your ride for today...',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate back with signal to create ride
                router.back();
                // The home screen will pick this up and create the ride
              },
            },
          ]
        );
      } else if (returnAction === 'searchRides') {
        // Rider created schedule, now search rides
        Alert.alert(
          'Schedule Saved!',
          'Great! Now searching for rides...',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate back with signal to search
                router.back();
                // The home screen will pick this up and search rides
              },
            },
          ]
        );
      } else {
        // Just edited schedule, no action needed
        Alert.alert(
          'Schedule Saved!',
          `Your ${params.type === 'driver' ? 'ride offering' : 'ride search'} schedule has been saved.${autoSearch ? ' We\'ll automatically match you with rides on these days.' : ''}`,
          [
            {
              text: 'Continue',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save schedule';
      Alert.alert('Error', message);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Schedule?',
      'You can create one-time rides without a schedule, but a schedule helps match you with regular commuters.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Schedule</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="calendar-outline" size={32} color="#2563eb" />
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>Set Your Regular Schedule</Text>
            <Text style={styles.infoBannerText}>
              {params.type === 'driver'
                ? 'Let riders know when you regularly offer rides. We\'ll help match you with consistent riders.'
                : 'Tell us when you regularly need rides. We\'ll automatically find matches for you.'}
            </Text>
          </View>
        </View>

        {/* Route Summary */}
        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <Ionicons name="navigate" size={20} color="#2563eb" />
            <Text style={styles.routeTitle}>Your Route</Text>
          </View>
          <View style={styles.routeDetails}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.routeAddress} numberOfLines={1}>
                {params.startAddress}
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.routeAddress} numberOfLines={1}>
                {params.destAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Departure Time</Text>
          <Text style={styles.sectionSubtitle}>
            What time do you usually leave?
          </Text>

          <View style={styles.timeSelector}>
            <Ionicons name="time-outline" size={24} color="#6b7280" />
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => {
                // TODO: Show time picker
                Alert.alert('Time Picker', 'Time picker implementation coming soon');
              }}
            >
              <Text style={styles.timeText}>{formatTime12Hour(departureTime)}</Text>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Day Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Days</Text>
          <Text style={styles.sectionSubtitle}>
            Which days do you usually travel?
          </Text>

          <View style={styles.daysGrid}>
            {ALL_DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day) && styles.dayButtonActive,
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDays.includes(day) && styles.dayButtonTextActive,
                  ]}
                >
                  {getShortDayName(day)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Auto-Search Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Automatic Matching</Text>
              <Text style={styles.toggleSubtitle}>
                {params.type === 'driver'
                  ? 'Automatically show your ride to matching riders'
                  : 'Automatically search for matching rides'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, autoSearch && styles.toggleActive]}
              onPress={() => setAutoSearch(!autoSearch)}
            >
              <View style={[styles.toggleThumb, autoSearch && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview */}
        {selectedDays.length > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Schedule Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Ionicons name="calendar" size={20} color="#2563eb" />
                <Text style={styles.previewText}>
                  {selectedDays.length === 7
                    ? 'Every day'
                    : selectedDays.length === 5 &&
                      selectedDays.every(d => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(d))
                    ? 'Weekdays'
                    : `${selectedDays.length} ${selectedDays.length === 1 ? 'day' : 'days'} per week`}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Ionicons name="time" size={20} color="#2563eb" />
                <Text style={styles.previewText}>{formatTime12Hour(departureTime)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Ionicons name="sync" size={20} color="#2563eb" />
                <Text style={styles.previewText}>
                  {autoSearch ? 'Auto-match enabled' : 'Manual search only'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading || selectedDays.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Save Schedule</Text>
              <Ionicons name="checkmark" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 20,
    margin: 16,
    borderRadius: 16,
    gap: 16,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  routeCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  routeDetails: {
    paddingLeft: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeAddress: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#d1d5db',
    marginLeft: 5,
    marginVertical: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  dayButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#2563eb',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  previewSection: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewText: {
    fontSize: 16,
    color: '#374151',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});