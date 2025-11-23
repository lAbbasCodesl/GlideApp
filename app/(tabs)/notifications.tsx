import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock notifications
const notifications = [
  {
    id: '1',
    type: 'ride_request',
    title: 'New Ride Request',
    message: 'John Doe wants to join your ride to Oakland',
    time: '2 min ago',
    read: false,
    icon: 'person-add',
    color: '#2563eb',
  },
  {
    id: '2',
    type: 'request_accepted',
    title: 'Request Accepted',
    message: 'Alice accepted your ride request for tomorrow 8:00 AM',
    time: '1 hour ago',
    read: false,
    icon: 'checkmark-circle',
    color: '#10b981',
  },
  {
    id: '3',
    type: 'ride_started',
    title: 'Ride Started',
    message: 'Your driver has started the ride',
    time: '3 hours ago',
    read: true,
    icon: 'car',
    color: '#f59e0b',
  },
  {
    id: '4',
    type: 'payment_received',
    title: 'Payment Received',
    message: 'You received $5 from Jane Smith',
    time: '1 day ago',
    read: true,
    icon: 'cash',
    color: '#10b981',
  },
];

export default function NotificationScreen() {
  const router = useRouter();

  const handleNotificationPress = (notification: typeof notifications[0]) => {
    // TODO: Navigate based on notification type
    console.log('Notification pressed:', notification);
  };

return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.markAllRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.notificationUnread,
            ]}
            onPress={() => handleNotificationPress(notification)}
          >
            <View style={[
              styles.notificationIcon,
              { backgroundColor: `${notification.color}20` },
            ]}>
              <Ionicons
                name={notification.icon as any}
                size={24}
                color={notification.color}
              />
            </View>

            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>
                {notification.title}
              </Text>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>
                {notification.time}
              </Text>
            </View>

            {!notification.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
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
  }
})