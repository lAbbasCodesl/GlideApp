import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';

export default function DriverSetupScreen() {
  const router = useRouter();
  const { updateUserProfile } = useAuth();

  const [step, setStep] = useState(1);
  
  // Vehicle info
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  
  // Payment info
  const [venmoHandle, setVenmoHandle] = useState('');
  const [cashappHandle, setCashappHandle] = useState('');
  
  // License photos
  const [licenseFront, setLicenseFront] = useState<string | null>(null);
  const [licenseBack, setLicenseBack] = useState<string | null>(null);

  const pickImage = async (type: 'front' | 'back') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'front') {
        setLicenseFront(result.assets[0].uri);
      } else {
        setLicenseBack(result.assets[0].uri);
      }
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!vehicleMake || !vehicleModel || !vehicleYear || !vehicleColor || !licensePlate) {
        Alert.alert('Error', 'Please fill in all vehicle details');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!venmoHandle && !cashappHandle) {
        Alert.alert('Error', 'Please provide at least one payment method');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!licenseFront || !licenseBack) {
        Alert.alert('Error', 'Please upload both sides of your license');
        return;
      }
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    // TODO: Upload images to Firebase Storage
    // TODO: Create driver profile in Firestore
    
    await updateUserProfile({
      isDriver: true,
    });

    Alert.alert(
      'Success!',
      'Your driver profile is under review. We\'ll notify you once verified.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/home'),
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
        <Text style={styles.headerTitle}>Become a Driver</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(step / 3) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Step {step} of 3</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Step 1: Vehicle Info */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Vehicle Information</Text>
            <Text style={styles.stepSubtitle}>
              Tell us about your vehicle
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Make</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Toyota"
                value={vehicleMake}
                onChangeText={setVehicleMake}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Model</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Camry"
                value={vehicleModel}
                onChangeText={setVehicleModel}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Year</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2020"
                  value={vehicleYear}
                  onChangeText={setVehicleYear}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Color</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Blue"
                  value={vehicleColor}
                  onChangeText={setVehicleColor}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>License Plate</Text>
              <TextInput
                style={styles.input}
                placeholder="ABC-123"
                value={licensePlate}
                onChangeText={setLicensePlate}
                autoCapitalize="characters"
              />
            </View>
          </View>
        )}

        {/* Step 2: Payment Methods */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Payment Methods</Text>
            <Text style={styles.stepSubtitle}>
              How do you want to receive payments?
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Venmo Handle (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="@username"
                value={venmoHandle}
                onChangeText={setVenmoHandle}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cash App Handle (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="$username"
                value={cashappHandle}
                onChangeText={setCashappHandle}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#2563eb" />
              <Text style={styles.infoText}>
                Provide at least one payment method. Riders will pay you directly through these apps.
              </Text>
            </View>
          </View>
        )}

        {/* Step 3: License Upload */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Driver's License</Text>
            <Text style={styles.stepSubtitle}>
              Upload photos of your license for verification
            </Text>

            <View style={styles.uploadContainer}>
              <Text style={styles.uploadLabel}>Front of License</Text>
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={() => pickImage('front')}
              >
                {licenseFront ? (
                  <Image source={{ uri: licenseFront }} style={styles.uploadedImage} />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={48} color="#9ca3af" />
                    <Text style={styles.uploadText}>Tap to upload</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.uploadContainer}>
              <Text style={styles.uploadLabel}>Back of License</Text>
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={() => pickImage('back')}
              >
                {licenseBack ? (
                  <Image source={{ uri: licenseBack }} style={styles.uploadedImage} />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={48} color="#9ca3af" />
                    <Text style={styles.uploadText}>Tap to upload</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="lock-closed" size={20} color="#10b981" />
              <Text style={styles.infoText}>
                Your information is secure and only used for verification. Review typically takes 24-48 hours.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, step === 1 && { flex: 1 }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {step === 3 ? 'Submit for Review' : 'Next'}
          </Text>
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
  progressContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  row: {
    flexDirection: 'row',
  },
  uploadContainer: {
    marginBottom: 24,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  uploadBox: {
    height: 160,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  backButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});



