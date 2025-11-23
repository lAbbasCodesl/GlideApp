import React from 'react';
import { View, Text, TouchableOpacity,Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const router = useRouter();

  const paymentInfo = {
    amount: 5,
    driverName: 'Alice Johnson',
    paymentMethods: {
      venmo: '@alice-johnson',
      cashapp: '$alicejohnson',
    },
  };

  const handlePayment = (method: 'venmo' | 'cashapp') => {
    const { amount, paymentMethods } = paymentInfo;
    
    let url = '';
    if (method === 'venmo') {
      url = `venmo://paycharge?txn=pay&recipients=${paymentMethods.venmo}&amount=${amount}&note=QuickRide`;
    } else {
      url = `https://cash.app/${paymentMethods.cashapp.replace(',','')}/${amount}`;
    }

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
        setTimeout(() => {
          Alert.alert('Payment Sent?', 'Did you complete the payment?', [
            { text: 'Not Yet', style: 'cancel' },
            { text: 'Yes, Paid', onPress: () => router.back() },
          ]);
        }, 3000);
      } else {
        Alert.alert('App Not Installed', `Please install ${method === 'venmo' ? 'Venmo' : 'CashApp'}`);
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">Payment</Text>
        <View className="w-6" />
      </View>

      <View className="flex-1 p-4">
        {/* Amount */}
        <View className="bg-white rounded-2xl p-8 items-center mb-6">
          <Text className="text-sm text-gray-600 mb-2">Amount to Pay</Text>
          <Text className="text-5xl font-bold text-gray-900 mb-2">
            ${paymentInfo.amount}
          </Text>
          <Text className="text-base text-gray-600">
            to {paymentInfo.driverName}
          </Text>
        </View>

        {/* Payment Methods */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Select Payment Method
          </Text>

          {paymentInfo.paymentMethods.venmo && (
            <TouchableOpacity
              className="flex-row items-center bg-white p-4 rounded-xl mb-3"
              onPress={() => handlePayment('venmo')}
            >
              <View className="w-12 h-12 rounded-full bg-blue-50 justify-center items-center mr-3">
                <Text className="text-2xl font-bold text-gray-900">V</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">Venmo</Text>
                <Text className="text-sm text-gray-600">
                  {paymentInfo.paymentMethods.venmo}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          )}

          {paymentInfo.paymentMethods.cashapp && (
            <TouchableOpacity
              className="flex-row items-center bg-white p-4 rounded-xl"
              onPress={() => handlePayment('cashapp')}
            >
              <View className="w-12 h-12 rounded-full bg-green-50 justify-center items-center mr-3">
                <Text className="text-2xl font-bold text-gray-900">$</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">Cash App</Text>
                <Text className="text-sm text-gray-600">
                  {paymentInfo.paymentMethods.cashapp}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
            </TouchableOpacity>
          )}
        </View>

        {/* Info */}
        <View className="flex-row bg-blue-50 p-4 rounded-xl gap-3">
          <Ionicons name="information-circle" size={20} color="#2563eb" />
          <Text className="flex-1 text-sm text-blue-900 leading-5">
            You'll be redirected to the payment app. Complete the transaction and return here to confirm.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}