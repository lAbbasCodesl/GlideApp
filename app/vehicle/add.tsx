// app/vehicle/add.tsx
/**
 * Vehicle Add/Edit Screen
 * 
 * Allows users to:
 * - Add a new vehicle
 * - Edit existing vehicle
 * - Continue to license upload
 * 
 * Uses production patterns:
 * - useVehicle hook for business logic
 * - Validation before submission
 * - Smart dropdowns with filtering
 * - Loading states
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useVehicle } from '../../hooks';
import {
  CAR_MAKES,
  VEHICLE_COLORS,
  getVehicleYears,
  getModelsForMake,
} from '../../types/user';
import { sanitizeLicensePlate } from '../../app/utils/vehicleUtils';
import { logError, ErrorSeverity } from '../../app/utils/ErrorHandler';

type DropdownType = 'make' | 'model' | 'year' | 'color' | null;

export default function VehicleAddScreen() {
  const { userProfile } = useAuth();
  const { vehicle, addVehicle, updateVehicle, loading } = useVehicle();
  const router = useRouter();
  const params = useLocalSearchParams<{ edit?: string }>();

  const isEditing = params.edit === 'true' || !!vehicle;

  // Form state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');

  // Dropdown state
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [modelOptions, setModelOptions] = useState<string[]>([]);

  // Initialize with existing vehicle data if editing
  useEffect(() => {
    if (vehicle && isEditing) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setYear(vehicle.year);
      setColor(vehicle.color);
      setLicensePlate(vehicle.licensePlate);
      setModelOptions(getModelsForMake(vehicle.make));
    }
  }, [vehicle, isEditing]);

  /**
   * Handle make selection - updates available models
   */
  const handleMakeSelect = (selectedMake: string) => {
    setMake(selectedMake);
    setModel(''); // Reset model when make changes
    setModelOptions(getModelsForMake(selectedMake));
    setActiveDropdown(null);
  };

  /**
   * Validate and save vehicle
   */
  const handleSave = async () => {
    // Validation
    if (!make) {
      Alert.alert('Make Required', 'Please select a vehicle make');
      return;
    }

    if (!model) {
      Alert.alert('Model Required', 'Please select a vehicle model');
      return;
    }

    if (!year) {
      Alert.alert('Year Required', 'Please select a vehicle year');
      return;
    }

    if (!color) {
      Alert.alert('Color Required', 'Please select a vehicle color');
      return;
    }

    if (!licensePlate.trim()) {
      Alert.alert('License Plate Required', 'Please enter your license plate');
      return;
    }

    const sanitized = sanitizeLicensePlate(licensePlate);
    if (sanitized.length < 2 || sanitized.length > 10) {
      Alert.alert(
        'Invalid License Plate',
        'License plate must be 2-10 characters'
      );
      return;
    }

    try {
      const vehicleData = {
        make,
        model,
        year,
        color,
        licensePlate: sanitized,
      };

      if (isEditing) {
        await updateVehicle(vehicleData);
        Alert.alert('Success', 'Vehicle updated successfully');
        router.back();
      } else {
        await addVehicle(vehicleData);
        
        // Check if user has license
        if (!userProfile?.license) {
          // Prompt to add license
          Alert.alert(
            'Add Driver\'s License',
            'To offer rides, you need to upload your driver\'s license for verification.',
            [
              {
                text: 'Later',
                style: 'cancel',
                onPress: () => router.replace('/(tabs)/home'),
              },
              {
                text: 'Add License',
                onPress: () => router.replace('/license/add'),
              },
            ]
          );
        } else {
          Alert.alert('Success', 'Vehicle added successfully');
          router.replace('/(tabs)/home');
        }
      }
    } catch (error) {
      logError(error, {
        function: 'handleSave',
        screen: 'VehicleAdd',
        severity: ErrorSeverity.ERROR,
      });

      const message = error instanceof Error ? error.message : 'Failed to save vehicle';
      Alert.alert('Error', message);
    }
  };

  /**
   * Render dropdown modal
   */
  const renderDropdown = () => {
    if (!activeDropdown) return null;

    let data: Array<{ label: string; value: any }> = [];
    let onSelect: (value: any) => void = () => {};

    switch (activeDropdown) {
      case 'make':
        data = CAR_MAKES.map(m => ({ label: m.make, value: m.make }));
        onSelect = (value) => {
          handleMakeSelect(value);
        };
        break;
      case 'model':
        data = modelOptions.map(m => ({ label: m, value: m }));
        onSelect = (value) => {
          setModel(value);
          setActiveDropdown(null);
        };
        break;
      case 'year':
        data = getVehicleYears().map(y => ({ label: y.toString(), value: y }));
        onSelect = (value) => {
          setYear(value);
          setActiveDropdown(null);
        };
        break;
      case 'color':
        data = VEHICLE_COLORS.map(c => ({ label: c, value: c }));
        onSelect = (value) => {
          setColor(value);
          setActiveDropdown(null);
        };
        break;
    }

    return (
      <Modal
        visible={true}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {activeDropdown.charAt(0).toUpperCase() + activeDropdown.slice(1)}
              </Text>
              <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={data}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => onSelect(item.value)}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Vehicle' : 'Add Vehicle'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <Text style={styles.sectionSubtitle}>
            This helps riders identify your vehicle
          </Text>

          {/* Make */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Make *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setActiveDropdown('make')}
              disabled={loading}
            >
              <Ionicons name="car-outline" size={20} color="#6b7280" />
              <Text style={[styles.selectText, make && styles.selectTextFilled]}>
                {make || 'Select make'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Model */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Model *</Text>
            <TouchableOpacity
              style={[styles.selectButton, !make && styles.selectButtonDisabled]}
              onPress={() => setActiveDropdown('model')}
              disabled={loading || !make}
            >
              <Ionicons name="car-sport-outline" size={20} color="#6b7280" />
              <Text style={[styles.selectText, model && styles.selectTextFilled]}>
                {model || (make ? 'Select model' : 'Select make first')}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Year & Color Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Year *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setActiveDropdown('year')}
                disabled={loading}
              >
                <Text style={[styles.selectText, year && styles.selectTextFilled]}>
                  {year || 'Year'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Color *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setActiveDropdown('color')}
                disabled={loading}
              >
                <Text style={[styles.selectText, color && styles.selectTextFilled]}>
                  {color || 'Color'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* License Plate */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>License Plate *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="ABC-123"
                value={licensePlate}
                onChangeText={(text) => setLicensePlate(sanitizeLicensePlate(text))}
                autoCapitalize="characters"
                editable={!loading}
                maxLength={10}
              />
            </View>
            <Text style={styles.hint}>
              Enter as it appears on your plate
            </Text>
          </View>
        </View>

        {/* Preview */}
        {make && model && year && color && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <Ionicons name="car" size={32} color="#2563eb" />
              <View style={styles.previewContent}>
                <Text style={styles.previewText}>
                  {year} {color} {make} {model}
                </Text>
                {licensePlate && (
                  <Text style={styles.previewPlate}>{licensePlate}</Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Save Changes' : 'Add Vehicle'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {renderDropdown()}
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
    padding: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9fafb',
    gap: 12,
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: '#9ca3af',
  },
  selectTextFilled: {
    color: '#111827',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#111827',
  },
  hint: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  previewSection: {
    backgroundColor: '#fff',
    padding: 24,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    gap: 16,
  },
  previewContent: {
    flex: 1,
  },
  previewText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  previewPlate: {
    fontSize: 16,
    color: '#1e40af',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
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
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#111827',
  },
});