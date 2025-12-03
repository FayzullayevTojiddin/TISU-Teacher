// screens/TimeTableScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { createLesson, fetchLessons } from '../api/lessons';
import AddLessonForm from '../components/AddLessonForm';
import TimeTableItem, { UiLesson } from '../components/TimeTableItem';

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

const POLL_INTERVAL_MS = 30000; // 30s poll (konfiguratsiya mumkin)
const DEBOUNCE_MS = 250; // uzluksiz tez takroriy chaqiruvlarni cheklash

const TimeTableScreen: React.FC = ({ onLogout, onExtra, extraPositionRightOffset = 12 }: any) => {
  const [dateKey, setDateKey] = useState<string>(isoDate(new Date()));
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [lessonsUi, setLessonsUi] = useState<UiLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const currentKey = useMemo(() => dateKey, [dateKey]);

  // Abort controller to cancel inflight fetches and avoid race conditions
  const inflight = useRef<AbortController | null>(null);
  // debounce timer
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // poll interval id
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  // track app state to avoid polling in background
  const appState = useRef(AppState.currentState);

  const mapApiToUi = (apiLesson: any): UiLesson => {
    const details = apiLesson.details ?? {};
    const subject = details.subject_name ?? apiLesson.subject_name ?? (apiLesson.group?.name ? `${apiLesson.group.name} darsi` : '—');
    const start = details.time_at ?? details.start ?? '—';
    const lessonType = details.build ?? "Ma'ruza";
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

  // Compare arrays of lessons by id -> return true if different
  const areLessonsDifferent = (a: UiLesson[], b: UiLesson[]) => {
    if (a.length !== b.length) return true;
    const aIds = a.map(x => x.id).sort();
    const bIds = b.map(x => x.id).sort();
    for (let i = 0; i < aIds.length; i++) {
      if (aIds[i] !== bIds[i]) return true;
    }
    // optionally compare starts/titles if IDs same but changed
    for (let i = 0; i < a.length; i++) {
      const ai = a.find(x => x.id === b[i]?.id);
      const bi = b.find(x => x.id === a[i]?.id);
      if (ai && bi && (ai.start !== bi.start || ai.subject !== bi.subject)) return true;
    }
    return false;
  };

  // Core loader with AbortController and debounce
  const loadLessons = async (iso: string, { showLoader = true, force = false } = {}) => {
    // debounce: cancel previous scheduled call and schedule new
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      // cancel inflight
      if (inflight.current) {
        try { inflight.current.abort(); } catch (e) {}
      }
      const controller = new AbortController();
      inflight.current = controller;

      if (showLoader) setLoading(true);
      setError(null);
      try {
        const payload = await fetchLessons(iso);
        // API expected { lessons: [...] }
        const ui = (payload.lessons ?? []).map(mapApiToUi).sort((a, b) => (a.start || '').localeCompare(b.start || ''));
        // if not force and no change -> don't update state (avoid rerenders & redundant work)
        setLessonsUi(prev => {
          if (!force && !areLessonsDifferent(prev, ui)) {
            return prev;
          }
          return ui;
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // aborted -> ignore
        } else {
          setError(err?.message ?? 'Darslarni yuklashda xatolik');
          setLessonsUi([]);
        }
      } finally {
        if (showLoader) setLoading(false);
        setRefreshing(false);
        inflight.current = null;
      }
    }, DEBOUNCE_MS);
  };

  // initial & when dateKey changes
  useEffect(() => {
    loadLessons(currentKey, { showLoader: true, force: false });
    // cleanup on unmount: clear debounce & abort inflight
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (inflight.current) {
        try { inflight.current.abort(); } catch (e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  // Polling: check server every POLL_INTERVAL_MS only when app active
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const wasInBackground = appState.current === 'inactive' || appState.current === 'background';
      if (wasInBackground && nextAppState === 'active') {
        loadLessons(currentKey);
      }

      appState.current = nextAppState;

      if (nextAppState === 'active') {
        if (!pollInterval.current) {
          pollInterval.current = setInterval(() => {
            loadLessons(currentKey);
          }, POLL_INTERVAL_MS);
        }
      } else {
        if (pollInterval.current) {
          clearInterval(pollInterval.current);
          pollInterval.current = null;
        }
      }
    };

    const subscription = AppState.addEventListener ? AppState.addEventListener('change', handleAppStateChange) : null;
    // start immediately if active
    if (appState.current === 'active') {
      if (!pollInterval.current) {
        pollInterval.current = setInterval(() => {
          loadLessons(currentKey, { showLoader: false, force: false });
        }, POLL_INTERVAL_MS);
      }
    }

    return () => {
      if (subscription && (subscription as any).remove) (subscription as any).remove();
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const existsIndex = prev.findIndex(p => p.id === newUi.id);
        let merged;
        if (existsIndex >= 0) {
          merged = prev.slice();
          merged[existsIndex] = newUi;
        } else {
          merged = [...prev, newUi];
        }
        merged.sort((a, b) => (a.start || '').localeCompare(b.start || ''));
        return merged;
      });
      setIsAddModalVisible(false);
      loadLessons(currentKey);
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLessons(currentKey, { showLoader: false, force: true });
  };

  // --- Calendar generation same as before ---
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
    margin: 10,
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
