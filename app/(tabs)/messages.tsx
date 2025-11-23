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

// Mock chat data
const chats = [
  {
    id: '1',
    rideName: 'SF → Oakland',
    lastMessage: 'See you at 8 AM!',
    lastMessageTime: '10:30 AM',
    unreadCount: 2,
    participants: ['Alice', 'Bob', 'Carol'],
    rideDate: 'Today',
  },
  {
    id: '2',
    rideName: 'Oakland → SF',
    lastMessage: 'Thanks for the ride!',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    participants: ['John', 'Jane'],
    rideDate: 'Yesterday',
  },
  {
    id: '3',
    rideName: 'SF → San Jose',
    lastMessage: 'Running 5 mins late',
    lastMessageTime: '2 days ago',
    unreadCount: 0,
    participants: ['Mike', 'Sarah', 'Tom'],
    rideDate: 'Dec 8',
  },
];

export default function MessageScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <ScrollView style={styles.content}>
        {chats.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Your ride chats will appear here
            </Text>
          </View>
        ) : (
          chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCard}
              onPress={() => router.push(`/ride-details/chat/${chat.id}`)}
            >
              <View style={styles.chatIcon}>
                <Ionicons name="car" size={24} color="#2563eb" />
              </View>

              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>{chat.rideName}</Text>
                  <Text style={styles.chatTime}>{chat.lastMessageTime}</Text>
                </View>

                <Text style={styles.chatParticipants}>
                  {chat.participants.join(', ')}
                </Text>

                <View style={styles.chatFooter}>
                  <Text
                    style={[
                      styles.lastMessage,
                      chat.unreadCount > 0 && styles.lastMessageUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {chat.lastMessage}
                  </Text>
                  {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
                    </View>
                  )}
                </View>
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
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  chatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chatTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chatParticipants: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  chatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: '#111827',
  },
  unreadBadge: {
    backgroundColor: '#2563eb',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});