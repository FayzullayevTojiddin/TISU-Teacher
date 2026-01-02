// components/TimeTableItem.tsx - Minimal & Elegant
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../types/navigation';

export type UiLesson = {
  id: string;
  subject: string;
  type: string;
  start: string;
  end?: string;
  room?: string;
  group?: string;
  raw?: any;
};

const typeConfig: Record<string, { color: string; icon: string }> = {
  "Ma'ruza": { color: '#FF8C42', icon: '📚' },
  Amaliy: { color: '#4CAF50', icon: '⚗️' },
  Seminar: { color: '#1E90FF', icon: '👥' },
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TimeTableItem: React.FC<{ lesson: UiLesson }> = ({ lesson }) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate('Attendance', { lesson: lesson.raw ?? lesson });
  };

  const config = typeConfig[lesson.raw.details.lesson_type] || { color: '#999', icon: '📄' };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Chap accent line */}
      <View style={[styles.accentLine, { backgroundColor: config.color }]} />

      {/* Main content */}
      <View style={styles.mainContent}>
        {/* Top section */}
        <View style={styles.topSection}>
          <View style={styles.emojiCircle}>
            <Text style={styles.emoji}>{config.icon}</Text>
          </View>

          <View style={styles.topRight}>
            <Text style={[styles.typeLabel, { color: config.color }]}>
              {lesson.raw.details.lesson_type}
            </Text>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={12} color="#666" />
              <Text style={styles.timeText}>
                {lesson.start}{lesson.end ? ` - ${lesson.end}` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Subject name */}
        <Text style={styles.subjectName} numberOfLines={2}>
          {lesson.subject}
        </Text>

        {/* Bottom info */}
        <View style={styles.infoRow}>
          <View style={styles.infoChip}>
            <Text style={styles.infoLabel}>Guruh:</Text>
            <Text style={styles.infoValue}>{lesson.group || '—'}</Text>
          </View>
          
          <View style={styles.dot} />
          
          <View style={styles.infoChip}>
            <Text style={styles.infoLabel}>Xona:</Text>
            <Text style={styles.infoValue}>{lesson.room || '—'}</Text>
          </View>
        </View>
      </View>

      {/* Right arrow indicator */}
      <View style={styles.arrowBox}>
        <Ionicons name="arrow-forward" size={18} color="#999" />
      </View>
    </TouchableOpacity>
  );
};

export default TimeTableItem;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 14,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  accentLine: {
    width: 5,
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
  },
  topRight: {
    flex: 1,
    gap: 6,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  subjectName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 23,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '700',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  arrowBox: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
});