import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

// Mock messages
const mockMessages = [
  {
    id: '1',
    senderId: 'alice',
    senderName: 'Alice',
    text: 'Hi everyone! Looking forward to the ride tomorrow',
    timestamp: '9:30 AM',
    isCurrentUser: false,
  },
  {
    id: '2',
    senderId: 'current',
    senderName: 'You',
    text: 'Me too! What time should we meet?',
    timestamp: '9:32 AM',
    isCurrentUser: true,
  },
  {
    id: '3',
    senderId: 'alice',
    senderName: 'Alice',
    text: "I'll be there at 8:00 AM sharp",
    timestamp: '9:35 AM',
    isCurrentUser: false,
  },
  {
    id: '4',
    senderId: 'bob',
    senderName: 'Bob',
    text: 'Perfect! See you all tomorrow',
    timestamp: '9:40 AM',
    isCurrentUser: false,
  },
];

export default function ChatRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { userProfile } = useAuth();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        senderId: 'current',
        senderName: 'You',
        text: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isCurrentUser: true,
      };

      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>SF → Oakland</Text>
          <Text style={styles.headerSubtitle}>Alice, Bob, Carol</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView 
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.isCurrentUser && styles.messageRowRight,
              ]}
            >
              {!msg.isCurrentUser && (
                <View style={styles.messageAvatar}>
                  <Text style={styles.messageAvatarText}>
                    {msg.senderName.charAt(0)}
                  </Text>
                </View>
              )}

              <View style={styles.messageContent}>
                {!msg.isCurrentUser && (
                  <Text style={styles.messageSender}>{msg.senderName}</Text>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    msg.isCurrentUser && styles.messageBubbleOwn,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.isCurrentUser && styles.messageTextOwn,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.messageTime,
                    msg.isCurrentUser && styles.messageTimeOwn,
                  ]}
                >
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={message.trim() ? '#fff' : '#9ca3af'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: '#fff',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContent: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  messageContent: {
    maxWidth: '70%',
  },
  messageSender: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  messageBubbleOwn: {
    backgroundColor: '#2563eb',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#111827',
  },
  messageTextOwn: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    marginLeft: 12,
  },
  messageTimeOwn: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
});
