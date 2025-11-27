// screens/TimeTableScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createLesson, fetchLessons } from '../api/lessons';
import AddLessonForm from '../components/AddLessonForm';
import TimeTableItem, { UiLesson } from '../components/TimeTableItem';

const LESSON_TIMES = [
  { para: 1, start: '08:30', end: '09:50' },
  { para: 2, start: '10:00', end: '11:20' },
  { para: 3, start: '11:40', end: '13:00' },
  { para: 4, start: '13:30', end: '14:50' },
  { para: 5, start: '15:00', end: '16:20' },
];

const isoDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatReadable = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString();
};

const TimeTableScreen: React.FC = ({ onLogout, onExtra, extraPositionRightOffset = 12 }: any) => {
  const [dateKey, setDateKey] = useState<string>(isoDate(new Date()));
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [lessonsUi, setLessonsUi] = useState<UiLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentKey = useMemo(() => dateKey, [dateKey]);

  const mapApiToUi = (apiLesson: any): UiLesson => {
    const details = apiLesson.details ?? {};
    const subject = details.subject_name ?? apiLesson.subject_name ?? (apiLesson.group?.name ? `${apiLesson.group.name} darsi` : '—');
    const start = details.time_at ?? details.start ?? '—';
    const lessonType = details.fakultet ?? "Ma'ruza";
    const groupName = apiLesson.group?.name ?? String(apiLesson.group_id ?? '');
    const roomName = apiLesson.room?.name ?? String(apiLesson.room_id ?? '');
    return {
      id: String(apiLesson.id),
      subject,
      type: lessonType,
      start,
      end: undefined,
      room: roomName,
      group: groupName,
      raw: apiLesson,
    };
  };

  const loadLessons = async (iso: string) => {
    setLoading(true);
    setError(null);
    try {
      const { lessons } = await fetchLessons(iso);
      const ui = lessons.map(mapApiToUi).sort((a, b) => (a.start || '').localeCompare(b.start || ''));
      setLessonsUi(ui);
    } catch (err: any) {
      setError(err?.message ?? 'Darslarni yuklashda xatolik');
      setLessonsUi([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons(currentKey);
  }, [currentKey]);

  const handleAddLesson = () => {
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
  };

  const handleSubmitLesson = async (lessonData: any) => {
    try {
      const payload = {
        ...lessonData,
        date: currentKey,
      };
      setLoading(true);
      const created = await createLesson(payload);
      const newUi = mapApiToUi(created);
      setLessonsUi(prev => {
        const merged = [...prev, newUi].sort((a, b) => (a.start || '').localeCompare(b.start || ''));
        return merged;
      });
      setIsAddModalVisible(false);
      Alert.alert('Muvaffaqiyat', "Dars muvaffaqiyatli qo'shildi");
    } catch (err: any) {
      Alert.alert('Xato', err?.message ?? "Dars qo'shilmadi");
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDates = () => {
    const selected = new Date(currentKey);
    const year = selected.getFullYear();
    const month = selected.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const dates: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) dates.push(null);
    for (let day = 1; day <= daysInMonth; day++) dates.push(new Date(year, month, day));
    return { dates, monthName: firstDay.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' }) };
  };

  const { dates: calendarDates, monthName } = generateCalendarDates();

  const goToPrevMonth = () => {
    const current = new Date(currentKey);
    current.setMonth(current.getMonth() - 1);
    setDateKey(isoDate(current));
  };

  const goToNextMonth = () => {
    const current = new Date(currentKey);
    current.setMonth(current.getMonth() + 1);
    setDateKey(isoDate(current));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.titleText}>Dars Jadvali</Text>
      </View>

      {loading ? (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : lessonsUi.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Bugun darslar yo'q</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={lessonsUi}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => <TimeTableItem lesson={item} />}
        />
      )}

      <View style={styles.footerContainer}>
        <View style={styles.footerWrap}>
          <TouchableOpacity
            style={styles.dateBoxClickable}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Text style={styles.dateText}>{formatReadable(currentKey)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightIconsColumn}>
          <TouchableOpacity onPress={handleAddLesson} style={styles.iconBtn} accessibilityLabel="Dars qo'shish">
            <Text style={styles.addIconText}>+</Text>
          </TouchableOpacity>

          {onLogout ? (
            <TouchableOpacity onPress={onLogout} style={[styles.iconBtn, styles.iconBtnSpacing]} accessibilityLabel="Logout">
              <Text style={styles.iconFallback}>⎋</Text>
            </TouchableOpacity>
          ) : null}

          {onExtra ? (
            <TouchableOpacity onPress={onExtra} style={[styles.iconBtn, styles.iconBtnSpacing]} accessibilityLabel="Extra action">
              <Text style={styles.iconFallback}>⟳</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <AddLessonForm
        visible={isAddModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmitLesson}
        currentDate={formatReadable(currentKey)}
        isoDate={currentKey}
      />

      {showDatePicker && (
        <>
          <TouchableOpacity style={styles.datePickerOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)} />
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={goToPrevMonth} style={styles.monthNavBtn}>
                <Text style={styles.monthNavText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>{monthName}</Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.monthNavBtn}>
                <Text style={styles.monthNavText}>▶</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'].map((day, index) => (
                <View key={index} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDates.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.calendarDateCell} />;
                }

                const dateStr = isoDate(date);
                const isSelected = dateStr === currentKey;
                const isToday = dateStr === isoDate(new Date());
                const dayNumber = date.getDate();

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDateCell,
                      isSelected && styles.calendarDateSelected,
                      isToday && !isSelected && styles.calendarDateToday,
                    ]}
                    onPress={() => {
                      setDateKey(dateStr);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.calendarDayNumber,
                      isSelected && styles.calendarTextSelected,
                      isToday && !isSelected && styles.calendarTextToday
                    ]}>
                      {dayNumber}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </>
      )}

      <View style={Platform.OS === 'ios' ? { height: 14 } : { height: 10 }} />
    </SafeAreaView>
  );
};

export default TimeTableScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6F9' },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  list: { paddingHorizontal: 16, paddingBottom: 240 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#666' },
  footerContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerWrap: {
    height: 56,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    marginRight: 12,
  },
  dateBoxClickable: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateText: {
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center',
  },
  rightIconsColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  iconBtnSpacing: {
    marginTop: 10,
  },
  iconFallback: {
    fontSize: 20,
    color: '#0B74FF',
    fontWeight: '800',
    lineHeight: 20,
  },
  addIconText: {
    fontSize: 28,
    color: '#0B74FF',
    fontWeight: '700',
    lineHeight: 28,
  },
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  datePickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 999,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  monthNavBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNavText: {
    fontSize: 20,
    color: '#0B74FF',
    fontWeight: '700',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDateCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  calendarDateSelected: {
    backgroundColor: '#0B74FF',
    borderRadius: 50,
  },
  calendarDateToday: {
    borderWidth: 2,
    borderColor: '#0B74FF',
    borderRadius: 50,
  },
  calendarDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  calendarTextSelected: {
    color: '#fff',
  },
  calendarTextToday: {
    color: '#0B74FF',
  },
});