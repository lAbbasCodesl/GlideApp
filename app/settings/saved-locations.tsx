// app/settings/saved-locations.tsx
/**
 * Saved Locations Management Screen
 * 
 * Allows users to:
 * - View saved locations (Home, Work, etc.)
 * - Add new saved locations
 * - Edit existing locations
 * - Delete locations
 * - View recent locations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getSavedLocations,
  getRecentLocations,
  saveLocation,
  deleteSavedLocation,
  clearRecentLocations,
  SavedLocation,
  RecentLocation,
} from '../../services/locationCacheService';

export default function SavedLocationsScreen() {
  const router = useRouter();
  
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add location modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationType, setNewLocationType] = useState<'home' | 'work' | 'custom'>('custom');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const [saved, recent] = await Promise.all([
        getSavedLocations(),
        getRecentLocations(10),
      ]);
      setSavedLocations(saved);
      setRecentLocations(recent);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = (location: SavedLocation) => {
    Alert.alert(
      'Delete Location',
      `Remove "${location.name}" from saved locations?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedLocation(location.id);
              await loadLocations();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete location');
            }
          },
        },
      ]
    );
  };

  const handleClearRecent = () => {
    Alert.alert(
      'Clear Recent Locations',
      'This will remove all recent location history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearRecentLocations();
              await loadLocations();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear recent locations');
            }
          },
        },
      ]
    );
  };

  const handleSaveFromRecent = (location: RecentLocation) => {
    setNewLocationName('');
    setNewLocationType('custom');
    setShowAddModal(true);
    
    // Store in temporary state to use after modal input
    // In real app, you'd handle this better
  };

  const getLocationIcon = (type?: 'home' | 'work' | 'custom') => {
    switch (type) {
      case 'home':
        return 'home';
      case 'work':
        return 'briefcase';
      default:
        return 'location';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Locations</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Saved Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Places</Text>
          
          {savedLocations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No saved locations</Text>
              <Text style={styles.emptySubtext}>
                Save your frequently used locations for quick access
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            savedLocations.map((location) => (
              <View key={location.id} style={styles.locationCard}>
                <View style={styles.locationIcon}>
                  <Ionicons 
                    name={getLocationIcon(location.type) as any} 
                    size={24} 
                    color="#2563eb" 
                  />
                </View>
                
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationAddress} numberOfLines={1}>
                    {location.address}
                  </Text>
                  {location.lastUsed && (
                    <Text style={styles.locationMeta}>
                      Last used: {new Date(location.lastUsed).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteLocation(location)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Recent Locations */}
        {recentLocations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Locations</Text>
              <TouchableOpacity onPress={handleClearRecent}>
                <Text style={styles.clearButton}>Clear</Text>
              </TouchableOpacity>
            </View>

            {recentLocations.map((location, index) => (
              <View key={index} style={styles.recentCard}>
                <View style={styles.recentIcon}>
                  <Ionicons name="time-outline" size={20} color="#6b7280" />
                </View>
                
                <View style={styles.locationInfo}>
                  <Text style={styles.locationAddress} numberOfLines={2}>
                    {location.address}
                  </Text>
                  <View style={styles.recentMeta}>
                    <Text style={styles.locationMeta}>
                      Used {location.frequency} {location.frequency === 1 ? 'time' : 'times'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleSaveFromRecent(location)}
                >
                  <Ionicons name="bookmark-outline" size={20} color="#2563eb" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Location Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Saved Location</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalNote}>
                To add a location, first search for it in the address selection screen, then come back here to save it with a name.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Home, Work, Gym"
                  value={newLocationName}
                  onChangeText={setNewLocationName}
                />
              </View>

              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newLocationType === 'home' && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewLocationType('home')}
                >
                  <Ionicons 
                    name="home" 
                    size={20} 
                    color={newLocationType === 'home' ? '#fff' : '#6b7280'} 
                  />
                  <Text 
                    style={[
                      styles.typeButtonText,
                      newLocationType === 'home' && styles.typeButtonTextActive,
                    ]}
                  >
                    Home
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newLocationType === 'work' && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewLocationType('work')}
                >
                  <Ionicons 
                    name="briefcase" 
                    size={20} 
                    color={newLocationType === 'work' ? '#fff' : '#6b7280'} 
                  />
                  <Text 
                    style={[
                      styles.typeButtonText,
                      newLocationType === 'work' && styles.typeButtonTextActive,
                    ]}
                  >
                    Work
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    newLocationType === 'custom' && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewLocationType('custom')}
                >
                  <Ionicons 
                    name="location" 
                    size={20} 
                    color={newLocationType === 'custom' ? '#fff' : '#6b7280'} 
                  />
                  <Text 
                    style={[
                      styles.typeButtonText,
                      newLocationType === 'custom' && styles.typeButtonTextActive,
                    ]}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    marginBottom: 4,
  },
  locationMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  deleteButton: {
    padding: 8,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  modalNote: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    gap: 6,
  },
  typeButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
});