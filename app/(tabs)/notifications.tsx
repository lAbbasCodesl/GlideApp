
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Mock notifications
const initialNotifications = [
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
  {
    id: '5',
    type: 'ride_cancelled',
    title: 'Ride Cancelled',
    message: 'Your ride to San Francisco has been cancelled',
    time: '2 days ago',
    read: true,
    icon: 'close-circle',
    color: '#ef4444',
  },
];

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleNotificationPress = (notification: typeof initialNotifications[0]) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllRead}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              You're all caught up!
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.notificationUnread,
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View
                style={[
                  styles.notificationIcon,
                  { backgroundColor: `${notification.color}15` },
                ]}
              >
                <Ionicons
                  name={notification.icon as any}
                  size={24}
                  color={notification.color}
                />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                </View>

                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>

                {!notification.read && <View style={styles.unreadIndicator} />}
              </View>
            </TouchableOpacity>
          ))
        )}
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
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  notificationUnread: {
    backgroundColor: '#eff6ff',
  },
  notificationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 4,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
  },
});