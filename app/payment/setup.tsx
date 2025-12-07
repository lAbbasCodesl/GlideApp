// app/payment/setup.tsx
/**
 * Payment Methods Setup Screen
 * 
 * Allows users to add/edit payment methods:
 * - Venmo (@username)
 * - Cash App ($username)
 * - Cash (toggle)
 * 
 * Required before searching or creating rides
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
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks';
import {
  isValidVenmoHandle,
  isValidCashappHandle,
  formatVenmoHandle,
  formatCashappHandle,
} from '../../types/user';

export default function PaymentSetupScreen() {
  const { userProfile } = useAuth();
  const { updateProfile, loading } = useProfile();
  const router = useRouter();
  const params = useLocalSearchParams<{ required?: string; returnTo?: string }>();

  const isRequired = params.required === 'true';
  const returnTo = params.returnTo || '/(tabs)/home';

  const [venmoHandle, setVenmoHandle] = useState('');
  const [cashappHandle, setCashappHandle] = useState('');
  const [acceptsCash, setAcceptsCash] = useState(false);

  // Initialize with existing data
  useEffect(() => {
    if (userProfile?.paymentMethods) {
      setVenmoHandle(userProfile.paymentMethods.venmo || '');
      setCashappHandle(userProfile.paymentMethods.cashapp || '');
      setAcceptsCash(userProfile.paymentMethods.acceptsCash || false);
    }
  }, [userProfile]);

  const handleSave = async () => {
    // Validation - at least one method required
    const hasVenmo = venmoHandle.trim().length > 0;
    const hasCashapp = cashappHandle.trim().length > 0;

    if (!hasVenmo && !hasCashapp && !acceptsCash) {
      Alert.alert(
        'Payment Method Required',
        'Please add at least one payment method to continue'
      );
      return;
    }

    // Validate Venmo if provided
    if (hasVenmo && !isValidVenmoHandle(venmoHandle)) {
      Alert.alert(
        'Invalid Venmo Handle',
        'Venmo handle should be 5-30 characters (letters, numbers, hyphens, underscores only)'
      );
      return;
    }

    // Validate CashApp if provided
    if (hasCashapp && !isValidCashappHandle(cashappHandle)) {
      Alert.alert(
        'Invalid Cash App Handle',
        'Cash App handle should be 5-30 characters (letters, numbers, hyphens, underscores only)'
      );
      return;
    }

    try {
      await updateProfile({
        paymentMethods: {
          venmo: hasVenmo ? formatVenmoHandle(venmoHandle) : null,
          cashapp: hasCashapp ? formatCashappHandle(cashappHandle) : null,
          acceptsCash,
        },
      });

      Alert.alert('Success', 'Payment methods saved', [
        {
          text: 'OK',
          onPress: () => {
            if (isRequired) {
              router.replace(returnTo as any);
            } else {
              router.back();
            }
          },
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save payment methods';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {!isRequired && (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        )}
        {isRequired && <View style={{ width: 24 }} />}
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Banner */}
        {isRequired && (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={24} color="#2563eb" />
            <View style={styles.infoBannerContent}>
              <Text style={styles.infoBannerTitle}>Payment Method Required</Text>
              <Text style={styles.infoBannerText}>
                Add at least one payment method to search or create rides
              </Text>
            </View>
          </View>
        )}

        {!isRequired && (
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.infoText}>
              Your payment information is never stored. Only your handles are saved for riders to pay you directly.
            </Text>
          </View>
        )}

       {/* Venmo */}
<View style={styles.section}>
  <View style={styles.methodHeader}>
    <View style={styles.methodIcon}>
      <Text style={styles.methodIconText}>V</Text>
    </View>
    <View style={styles.methodHeaderContent}>
      <Text style={styles.methodTitle}>Venmo</Text>
      <Text style={styles.methodSubtitle}>Add your @username</Text>
    </View>
  </View>

  <View style={styles.inputGroup}>
    <Text style={styles.label}>Venmo Handle (Optional)</Text>

    {/* Input */}
    <View style={styles.inputContainer}>
      <Text style={styles.inputPrefix}>@</Text>
      <TextInput
        style={styles.input}
        placeholder="username"
        value={venmoHandle}
        onChangeText={(text) => {
          // Remove any accidental @ or $
          const clean = text.replace(/[@$]/g, '');
          setVenmoHandle(clean);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
    </View>

      <Text style={styles.hint}>e.g., @john-smith or @johnsmith123</Text>
  </View>
</View>

{/* Cash App */}
<View style={styles.section}>
  <View style={styles.methodHeader}>
    <View style={[styles.methodIcon, styles.cashappIcon]}>
      <Text style={styles.methodIconText}>$</Text>
    </View>
    <View style={styles.methodHeaderContent}>
      <Text style={styles.methodTitle}>Cash App</Text>
      <Text style={styles.methodSubtitle}>Add your $cashtag</Text>
    </View>
  </View>

  <View style={styles.inputGroup}>
    <Text style={styles.label}>Cash App Handle (Optional)</Text>

    <View style={styles.inputContainer}>
      <Text style={styles.inputPrefix}>$</Text>

      <TextInput
        style={styles.input}
        placeholder="username"
        value={cashappHandle.replace('$', '')}
        onChangeText={(text) => setCashappHandle(text.replace('$', ''))}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
    </View>
    <Text style={styles.hint}>
        e.g., $johnsmith or $john-smith
    </Text>
  </View>
</View>


        {/* Cash */}
        <View style={styles.section}>
          <View style={styles.methodHeader}>
            <View style={[styles.methodIcon, styles.cashIcon]}>
              <Ionicons name="cash" size={24} color="#10b981" />
            </View>
            <View style={styles.methodHeaderContent}>
              <Text style={styles.methodTitle}>Cash</Text>
              <Text style={styles.methodSubtitle}>Accept cash payments</Text>
            </View>
            <Switch
              value={acceptsCash}
              onValueChange={setAcceptsCash}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={acceptsCash ? '#2563eb' : '#f3f4f6'}
              disabled={loading}
            />
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>
            <Ionicons name="bulb-outline" size={16} color="#f59e0b" /> Tips
          </Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>
              • Add at least one method to use Glide
            </Text>
            <Text style={styles.tipItem}>
              • Riders will pay you directly through these methods
            </Text>
            <Text style={styles.tipItem}>
              • Double-check your handles for accuracy
            </Text>
            <Text style={styles.tipItem}>
              • You can update these anytime from your profile
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
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
              {isRequired ? 'Continue' : 'Save Changes'}
            </Text>
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
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cashappIcon: {
    backgroundColor: '#f0fdf4',
  },
  cashIcon: {
    backgroundColor: '#f0fdf4',
  },
  methodIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  methodHeaderContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 4,
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
    marginLeft: 4,
  },
  tipsSection: {
    backgroundColor: '#fffbeb',
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
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
});