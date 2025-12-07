import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const router = useRouter();

  const paymentInfo = {
    amount: 5,
    driverName: 'Alice Johnson',
    paymentMethods: {
      venmo: 'atalawala',
      cashapp: 'alicejohnson',
    },
  };

    const handlePayment = (method: 'venmo' | 'cashapp') => {
    const { amount, paymentMethods } = paymentInfo;

    let url = '';
    let fallbackUrl = '';

    if (method === 'venmo') {
      const venmoUser = paymentMethods.venmo.replace('@', '');
      const note = encodeURIComponent("Glide ride payment");
      
      // Try multiple Venmo URL formats
      url = `venmo://paycharge?txn=pay&recipients=${venmoUser}&amount=${amount}&note=${note}`;
      fallbackUrl = `https://venmo.com/@${venmoUser}?txn=pay&amount=${amount}&note=${note}`;
    } else {
      // CashApp deep link
      const cashTag = paymentMethods.cashapp.replace(/[\$]/g, '');
      url = `cashapp://cash.app/$${cashTag}/${amount}`;
      fallbackUrl = `https://cash.app/$${cashTag}/${amount}`;
    }

    // Try opening the app directly
    Linking.openURL(url).catch(() => {
      // If app deep link fails, try the web fallback
      Linking.openURL(fallbackUrl).catch(() => {
        Alert.alert(
          'App Not Installed',
          `Please install ${method === 'venmo' ? 'Venmo' : 'Cash App'} or open the link manually.`,
          [
            { 
              text: 'Copy Handle', 
              onPress: () => {
                // You'd need to implement clipboard copy here
                Alert.alert('Handle', method === 'venmo' ? paymentMethods.venmo : paymentMethods.cashapp);
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      });
    }).then(() => {
      // If link opened successfully, show confirmation after delay
      setTimeout(() => {
        Alert.alert(
          'Payment Sent?',
          'Did you complete the payment?',
          [
            { text: 'Not Yet', style: 'cancel' },
            { text: 'Yes, Paid', onPress: () => router.back() },
          ]
        );
      }, 3000);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>
            ${paymentInfo.amount}
          </Text>
          <Text style={styles.recipientText}>
            to {paymentInfo.driverName}
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>
            Select Payment Method
          </Text>

          {paymentInfo.paymentMethods.venmo && (
            <TouchableOpacity
              style={styles.paymentMethodCard}
              onPress={() => handlePayment('venmo')}
            >
              <View style={[styles.paymentIcon, styles.venmoIcon]}>
                <Text style={styles.paymentIconText}>V</Text>
              </View>
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodName}>Venmo</Text>
                <Text style={styles.paymentMethodHandle}>
                  {paymentInfo.paymentMethods.venmo}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          )}

          {paymentInfo.paymentMethods.cashapp && (
            <TouchableOpacity
              style={styles.paymentMethodCard}
              onPress={() => handlePayment('cashapp')}
            >
              <View style={[styles.paymentIcon, styles.cashappIcon]}>
                <Text style={styles.paymentIconText}>$</Text>
              </View>
              <View style={styles.paymentMethodContent}>
                <Text style={styles.paymentMethodName}>Cash App</Text>
                <Text style={styles.paymentMethodHandle}>
                  {paymentInfo.paymentMethods.cashapp}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#2563eb" />
          <Text style={styles.infoText}>
            You'll be redirected to the payment app. Complete the transaction and return here to confirm.
          </Text>
        </View>
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
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  recipientText: {
    fontSize: 16,
    color: '#6b7280',
  },
  paymentMethodsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  venmoIcon: {
    backgroundColor: '#eff6ff',
  },
  cashappIcon: {
    backgroundColor: '#f0fdf4',
  },
  paymentIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentMethodHandle: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});