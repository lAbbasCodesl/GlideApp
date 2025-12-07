import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks';

const driverRules = [
  {
    id: 1,
    title: 'Screen Your Riders',
    description: 'Review rider profiles before accepting requests. You have full control.',
    icon: 'people',
    color: '#2563eb',
  },
  {
    id: 2,
    title: 'Confirm Pickup Details',
    description: 'Message riders to confirm exact pickup location and time.',
    icon: 'location',
    color: '#10b981',
  },
  {
    id: 3,
    title: 'Vehicle Standards',
    description: 'Keep your car clean and well-maintained. No smoking in the vehicle.',
    icon: 'car-sport',
    color: '#f59e0b',
  },
  {
    id: 4,
    title: 'Safety First',
    description: 'Follow all traffic laws. Never exceed passenger capacity.',
    icon: 'shield-checkmark',
    color: '#ef4444',
  },
  {
    id: 5,
    title: 'Be Professional',
    description: 'Communicate clearly and be respectful. Maintain appropriate boundaries.',
    icon: 'star',
    color: '#8b5cf6',
  },
];

export default function DriverGuideScreen() {
  const router = useRouter();
  const { updateProfile } = useProfile();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < driverRules.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await updateProfile({ hasSeenDriverGuide: true });
    router.back();
  };

  const rule = driverRules[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>Driver Responsibilities</Text>
        <TouchableOpacity onPress={handleFinish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${rule.color}20` }]}>
          <Ionicons name={rule.icon as any} size={64} color={rule.color} />
        </View>

        <Text style={styles.title}>{rule.title}</Text>
        <Text style={styles.description}>{rule.description}</Text>
      </View>

      <View style={styles.pagination}>
        {driverRules.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlide && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentSlide === driverRules.length - 1 ? "I Understand" : "Next"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  badge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#2563eb',
  },
  nextButton: {
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
