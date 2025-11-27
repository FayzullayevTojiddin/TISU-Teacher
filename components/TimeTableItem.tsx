// components/TimeTableItem.tsx
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

const typeColors: Record<string, string> = {
  "Ma'ruza": '#FF8C42',
  Amaliy: '#4CAF50',
  Seminar: '#1E90FF',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TimeTableItem: React.FC<{ lesson: UiLesson }> = ({ lesson }) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
  navigation.navigate('Attendance', { lesson: lesson.raw ?? lesson });
};

  return (
    <TouchableOpacity 
      style={styles.row}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.timeWrap}>
        <Text style={styles.timeText}>{lesson.start}</Text>
        {lesson.end ? <Text style={styles.timeSmall}>{lesson.end}</Text> : null}
      </View>

      <View style={styles.infoWrap}>
        <View style={styles.rowTop}>
          <Text style={styles.subject}>{lesson.subject}</Text>

          <View
            style={[
              styles.typeBadge,
              { backgroundColor: typeColors[lesson.type] || '#999' },
            ]}
          >
            <Text style={styles.typeText}>{lesson.type}</Text>
          </View>
        </View>

        <Text style={styles.meta}>
          {lesson.group ?? '—'} • Xona {lesson.room ?? '—'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TimeTableItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  timeWrap: { width: 70, alignItems: 'center' },
  timeText: { fontWeight: '700', fontSize: 16 },
  timeSmall: { color: '#666', fontSize: 12 },
  infoWrap: { flex: 1, paddingLeft: 12 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subject: { fontSize: 16, fontWeight: '700' },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  meta: { marginTop: 6, color: '#666' },
});