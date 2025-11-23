import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ratingCategories = [
  { id: 'punctuality', label: 'Punctuality', icon: 'time' },
  { id: 'cleanliness', label: 'Cleanliness', icon: 'sparkles' },
  { id: 'communication', label: 'Communication', icon: 'chatbubbles' },
  { id: 'safety', label: 'Safety', icon: 'shield-checkmark' },
];

export default function FeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ rideId: string }>();

  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (overallRating === 0) {
      Alert.alert('Error', 'Please provide an overall rating');
      return;
    }

    // TODO: Submit feedback to backend
    Alert.alert(
      'Thank You!',
      'Your feedback has been submitted',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/home'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Ride</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Overall Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Experience</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setOverallRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= overallRating ? 'star' : 'star-outline'}
                  size={48}
                  color={star <= overallRating ? '#f59e0b' : '#d1d5db'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {overallRating > 0 && (
            <Text style={styles.ratingLabel}>
              {overallRating === 5 && 'Excellent!'}
              {overallRating === 4 && 'Great!'}
              {overallRating === 3 && 'Good'}
              {overallRating === 2 && 'Fair'}
              {overallRating === 1 && 'Poor'}
            </Text>
          )}
        </View>

        {/* Category Ratings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate Specific Areas</Text>
          
          {ratingCategories.map((category) => (
            <View key={category.id} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Ionicons name={category.icon as any} size={20} color="#6b7280" />
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </View>
              
              <View style={styles.categoryStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => 
                      setCategoryRatings({ ...categoryRatings, [category.id]: star })
                    }
                  >
                    <Ionicons
                      name={
                        star <= (categoryRatings[category.id] || 0)
                          ? 'star'
                          : 'star-outline'
                      }
                      size={24}
                      color={
                        star <= (categoryRatings[category.id] || 0)
                          ? '#f59e0b'
                          : '#d1d5db'
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Comments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Comments (Optional)</Text>
          
          <TextInput
            style={styles.commentInput}
            placeholder="Share more about your experience..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          
          <Text style={styles.characterCount}>
            {comment.length}/500
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            overallRating === 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={overallRating === 0}
        >
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
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
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#2563eb',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#111827',
  },
  categoryStars: {
    flexDirection: 'row',
    gap: 4,
  },
  commentInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});