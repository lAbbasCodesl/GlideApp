import React, { useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSchedule } from '../../hooks/useSchedule';
import { formatTime12Hour, getShortDayName, getDayName } from '../../types/schedule';

export default function MyScheduleScreen() {
  const router = useRouter();
  const { loading, schedule, hasSchedule, loadSchedule, toggleActive, deleteSchedule } = useSchedule();

  useEffect(() => {
    loadSchedule();
  }, []);

  const handleEdit = () => {
    if (!schedule) return;
    
    router.push({
      pathname: '/ride/schedule',
      params: {
        type: schedule.type,
        startAddress: schedule.outbound.startLocation.address,
        startLat: schedule.outbound.startLocation.lat.toString(),
        startLng: schedule.outbound.startLocation.lng.toString(),
        destAddress: schedule.outbound.endLocation.address,
        destLat: schedule.outbound.endLocation.lat.toString(),
        destLng: schedule.outbound.endLocation.lng.toString(),
      },
    });
  };

  const handleToggleActive = async () => {
    if (!schedule) return;

    try {
      await toggleActive(!schedule.active);
      Alert.alert(
        'Success',
        schedule.active ? 'Schedule paused' : 'Schedule activated'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update schedule');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Schedule?',
      'This will permanently delete your recurring schedule. Your existing rides won\'t be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSchedule();
              Alert.alert('Schedule Deleted', '', [
                { text: 'OK' },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete schedule');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  if (!hasSchedule) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={80} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Schedule Set</Text>
          <Text style={styles.emptyText}>
            Create a recurring schedule to automatically match with rides
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/ride/schedule')}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create Schedule</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <TouchableOpacity onPress={handleEdit}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Banner */}
        <View style={[
          styles.statusBanner,
          schedule!.active ? styles.statusActive : styles.statusInactive,
        ]}>
          <Ionicons
            name={schedule!.active ? 'checkmark-circle' : 'pause-circle'}
            size={24}
            color={schedule!.active ? '#10b981' : '#f59e0b'}
          />
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {schedule!.active ? 'Schedule Active' : 'Schedule Paused'}
            </Text>
            <Text style={styles.statusText}>
              {schedule!.active
                ? schedule!.autoSearch
                  ? 'Auto-matching enabled'
                  : 'Active, manual search only'
                : 'No automatic matching'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleToggleActive}>
            <Text style={styles.toggleLink}>
              {schedule!.active ? 'Pause' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Outbound Trip */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outbound Trip</Text>
          
          <View style={styles.tripCard}>
            {/* Route */}
            <View style={styles.routeSection}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.routeText} numberOfLines={2}>
                  {schedule!.outbound.startLocation.address}
                </Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.routeText} numberOfLines={2}>
                  {schedule!.outbound.endLocation.address}
                </Text>
              </View>
            </View>

            {/* Time */}
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#6b7280" />
              <Text style={styles.infoText}>
                {formatTime12Hour(schedule!.outbound.departureTime)} (±{schedule!.outbound.timeWindow} min)
              </Text>
            </View>

            {/* Days */}
            <View style={styles.daysRow}>
              {schedule!.outbound.daysOfWeek.map((day) => (
                <View key={day} style={styles.dayChip}>
                  <Text style={styles.dayChipText}>{getShortDayName(day)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Return Trip */}
        {schedule!.return && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Return Trip</Text>
            
            <View style={styles.tripCard}>
              {/* Route */}
              <View style={styles.routeSection}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.routeText} numberOfLines={2}>
                    {schedule!.return.startLocation.address}
                  </Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.routeText} numberOfLines={2}>
                    {schedule!.return.endLocation.address}
                  </Text>
                </View>
              </View>

              {/* Time */}
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#6b7280" />
                <Text style={styles.infoText}>
                  {formatTime12Hour(schedule!.return.departureTime)} (±{schedule!.return.timeWindow} min)
                </Text>
              </View>

              {/* Days */}
              <View style={styles.daysRow}>
                {schedule!.return.daysOfWeek.map((day) => (
                  <View key={day} style={styles.dayChip}>
                    <Text style={styles.dayChipText}>{getShortDayName(day)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Schedule Type</Text>
              <Text style={styles.settingValue}>
                {schedule!.type === 'driver' ? 'Offering Rides' : 'Looking for Rides'}
              </Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Automatic Matching</Text>
              <Text style={styles.settingValue}>
                {schedule!.autoSearch ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Delete Schedule</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  editText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  statusActive: {
    backgroundColor: '#f0fdf4',
  },
  statusInactive: {
    backgroundColor: '#fffbeb',
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
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
    marginBottom: 16,
  },
  tripCard: {
    gap: 16,
  },
  routeSection: {
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
  routeText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#d1d5db',
    marginLeft: 5,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actions: {
    padding: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
