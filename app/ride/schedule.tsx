// app/ride/schedule.tsx - COMPLETE VERSION WITH ALL STYLES
/**
 * Schedule Creation/Edit Screen
 * 
 * Features:
 * - Time selection with native picker
 * - Outbound time (going to work)
 * - Return time (coming back same day)
 * - Time window selection
 * - Auto-search toggle
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
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
    returnAction?: 'createRide' | 'searchRides';
  }>();

  const { loading, schedule, createOrUpdateSchedule } = useSchedule();

  // Form state
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [outboundTime, setOutboundTime] = useState('08:00');
  const [returnTime, setReturnTime] = useState('17:00');
  const [timeWindow, setTimeWindow] = useState(30);
  const [autoSearch, setAutoSearch] = useState(true);
  
  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerFor, setTimePickerFor] = useState<'outbound' | 'return'>('outbound');
  const [tempTime, setTempTime] = useState(new Date());

  // Initialize with existing schedule
  useEffect(() => {
    if (schedule) {
      setSelectedDays(schedule.outbound.daysOfWeek);
      setOutboundTime(schedule.outbound.departureTime);
      setTimeWindow(schedule.outbound.timeWindow);
      setAutoSearch(schedule.autoSearch);
      
      if (schedule.return) {
        setReturnTime(schedule.return.departureTime);
      }
    }
  }, [schedule]);

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const openTimePicker = (type: 'outbound' | 'return') => {
    const time = type === 'outbound' ? outboundTime : returnTime;
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    setTempTime(date);
    setTimePickerFor(type);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      
      if (timePickerFor === 'outbound') {
        setOutboundTime(timeStr);
      } else {
        setReturnTime(timeStr);
      }
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
        outbound: {
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
          departureTime: outboundTime,
          daysOfWeek: selectedDays,
          timeWindow: timeWindow,
        },
        return: {
          startLocation: {
            lat: parseFloat(params.destLat),
            lng: parseFloat(params.destLng),
            address: params.destAddress,
          },
          endLocation: {
            lat: parseFloat(params.startLat),
            lng: parseFloat(params.startLng),
            address: params.startAddress,
          },
          departureTime: returnTime,
          daysOfWeek: selectedDays, // Same days
          timeWindow: timeWindow, // Same window
        },
        active: true,
        autoSearch,
      });

      const returnAction = params.returnAction;
      
      if (returnAction === 'createRide' || returnAction === 'searchRides') {
        Alert.alert(
          'Schedule Saved!',
          `Your schedule is set. Now ${returnAction === 'createRide' ? 'creating your ride' : 'searching for rides'}...`,
          [{ text: 'Continue', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          'Schedule Saved!',
          `Your schedule has been saved.${autoSearch ? ' We\'ll automatically match you on these days.' : ''}`,
          [{ text: 'Continue', onPress: () => router.back() }]
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
      'You can create one-time rides without a schedule.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => router.back() },
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
                ? 'Let riders know when you regularly offer rides. Set your outbound and return times.'
                : 'Tell us when you regularly need rides. Set your outbound and return times.'}
            </Text>
          </View>
        </View>

        {/* Route Card */}
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

        {/* Day Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Days</Text>
          <Text style={styles.sectionSubtitle}>Which days do you usually travel?</Text>

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

          <View style={styles.quickSelectRow}>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => {
                const weekdays: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                setSelectedDays(weekdays);
              }}
            >
              <Text style={styles.quickSelectText}>Weekdays</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => setSelectedDays(ALL_DAYS)}
            >
              <Text style={styles.quickSelectText}>All Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => setSelectedDays([])}
            >
              <Text style={styles.quickSelectText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Outbound Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outbound Time</Text>
          <Text style={styles.sectionSubtitle}>When do you usually leave?</Text>

          <View style={styles.timeSelector}>
            <Ionicons name="time-outline" size={24} color="#6b7280" />
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => openTimePicker('outbound')}
            >
              <Text style={styles.timeText}>{formatTime12Hour(outboundTime)}</Text>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Return Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Return Time</Text>
          <Text style={styles.sectionSubtitle}>When do you usually come back?</Text>

          <View style={styles.timeSelector}>
            <Ionicons name="time-outline" size={24} color="#6b7280" />
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => openTimePicker('return')}
            >
              <Text style={styles.timeText}>{formatTime12Hour(returnTime)}</Text>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Window */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Flexibility</Text>
          <Text style={styles.sectionSubtitle}>
            We'll match you with rides around these times
          </Text>

          <View style={styles.timeWindowButtons}>
            {[15, 30, 45, 60].map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.windowButton,
                  timeWindow === minutes && styles.windowButtonActive,
                ]}
                onPress={() => setTimeWindow(minutes)}
              >
                <Text
                  style={[
                    styles.windowButtonText,
                    timeWindow === minutes && styles.windowButtonTextActive,
                  ]}
                >
                  ±{minutes}m
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
                <Ionicons name="arrow-forward" size={20} color="#10b981" />
                <Text style={styles.previewText}>
                  Outbound: {formatTime12Hour(outboundTime)} (±{timeWindow}m)
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Ionicons name="arrow-back" size={20} color="#ef4444" />
                <Text style={styles.previewText}>
                  Return: {formatTime12Hour(returnTime)} (±{timeWindow}m)
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (loading || selectedDays.length === 0) && styles.saveButtonDisabled]}
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

      {/* Time Picker Modal */}
      {showTimePicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showTimePicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowTimePicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.timePickerModal}>
                  <View style={styles.timePickerHeader}>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={styles.timePickerButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.timePickerTitle}>Select Time</Text>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={[styles.timePickerButton, styles.timePickerDone]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempTime}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                    style={styles.timePicker}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={tempTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </>
      )}
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
    marginBottom: 12,
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
  quickSelectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickSelectButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  quickSelectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  timeWindowButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  windowButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  windowButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  windowButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  windowButtonTextActive: {
    color: '#2563eb',
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
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  timePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  timePickerButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  timePickerDone: {
    color: '#2563eb',
  },
  timePicker: {
    height: 200,
  },
});