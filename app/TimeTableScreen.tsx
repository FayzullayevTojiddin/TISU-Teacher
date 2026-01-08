import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, AppStateStatus, Easing, FlatList, Image, Modal, Platform, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const POLL_INTERVAL_MS = 30000;
const DEBOUNCE_MS = 250;

interface TimeTableScreenProps {
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  onExtra?: () => void;
  extraPositionRightOffset?: number;
}

// Nuqtalar uchun animatsiya
const Dot = ({ delay }: { delay: number }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          transform: [{ translateY: bounceAnim }],
        },
      ]}
    />
  );
};

// Katta loading animatsiyasi komponenti
const FullScreenLoader = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Aylanish animatsiyasi
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();

    // Pulsatsiya
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.fullScreenLoader}>
      <Animated.View
        style={[
          styles.loaderCircle,
          {
            opacity: fadeAnim,
            transform: [{ rotate: spin }, { scale: pulseAnim }],
          },
        ]}
      >
        <Text style={styles.loaderIcon}>📚</Text>
      </Animated.View>
      <Animated.Text style={[styles.loaderText, { opacity: fadeAnim }]}>
        Yuklanmoqda
      </Animated.Text>
      <View style={styles.dotsContainer}>
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </View>
    </View>
  );
};

// Animatsiyali bo'sh holat komponenti
const EmptyStateAnimated = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade va scale animatsiyasi
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Sakrash animatsiyasi (cheksiz)
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.in(Easing.quad),
        }),
        Animated.delay(800),
      ])
    ).start();

    // Pulsatsiya animatsiyasi
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.emptyWrap,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.Text
        style={[
          styles.emptyIcon,
          {
            transform: [{ translateY: bounceAnim }, { scale: pulseAnim }],
          },
        ]}
      >
        🎓
      </Animated.Text>
      <Text style={styles.emptyText}>Bugun darslar yo'q</Text>
      <Text style={styles.emptySubtext}>Yangi dars qo'shish uchun "+" tugmasini bosing</Text>
    </Animated.View>
  );
};

const TimeTableScreen: React.FC<TimeTableScreenProps> = ({ onLogout, onDeleteAccount, onExtra, extraPositionRightOffset = 12 }) => {
  const [dateKey, setDateKey] = useState(isoDate(new Date()));
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [lessonsUi, setLessonsUi] = useState<UiLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const currentKey = useMemo(() => dateKey, [dateKey]);
  const inflight = useRef<AbortController | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // Animatsiya uchun
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const menuSlideAnim = useRef(new Animated.Value(-300)).current;

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

  const areLessonsDifferent = (a: UiLesson[], b: UiLesson[]) => {
    if (a.length !== b.length) return true;
    const aIds = a.map(x => x.id).sort();
    const bIds = b.map(x => x.id).sort();
    for (let i = 0; i < aIds.length; i++) {
      if (aIds[i] !== bIds[i]) return true;
    }
    for (let i = 0; i < a.length; i++) {
      const ai = a.find(x => x.id === b[i]?.id);
      const bi = b.find(x => x.id === a[i]?.id);
      if (ai && bi && (ai.start !== bi.start || ai.subject !== bi.subject)) return true;
    }
    return false;
  };

  const loadLessons = async (iso: string, { showLoader = true, force = false } = {}) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (inflight.current) {
        try {
          inflight.current.abort();
        } catch (e) {}
      }

      const controller = new AbortController();
      inflight.current = controller;

      if (showLoader) setLoading(true);
      setError(null);

      try {
        const payload = await fetchLessons(iso);
        const ui = (payload.lessons ?? []).map(mapApiToUi).sort((a, b) => (a.start || '').localeCompare(b.start || ''));

        setLessonsUi(prev => {
          if (!force && !areLessonsDifferent(prev, ui)) {
            return prev;
          }
          return ui;
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // aborted
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

  useEffect(() => {
    loadLessons(currentKey, { showLoader: true, force: false });

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (inflight.current) {
        try {
          inflight.current.abort();
        } catch (e) {}
      }
    };
  }, [currentKey]);

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
  }, [currentKey]);

  // Date picker animatsiyasi
  useEffect(() => {
    if (showDatePicker) {
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 1000,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start();
    }
  }, [showDatePicker]);

  // Menu modal animatsiyasi
  useEffect(() => {
    if (showMenuModal) {
      Animated.spring(menuSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(menuSlideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start();
    }
  }, [showMenuModal]);

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
      // error handling
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLessons(currentKey, { showLoader: false, force: true });
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
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenuModal(true)}
        >
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <FullScreenLoader />
      ) : error ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : lessonsUi.length === 0 ? (
        <EmptyStateAnimated />
      ) : (
        <FlatList
          style={styles.list}
          data={lessonsUi}
          keyExtractor={it => it.id}
          renderItem={({ item }) => <TimeTableItem lesson={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <View style={styles.footerContainer}>
        <View style={styles.footerWrap}>
          <TouchableOpacity style={styles.dateBoxClickable} onPress={() => setShowDatePicker(!showDatePicker)}>
            <Text style={styles.dateText}>{formatReadable(currentKey)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rightIconsColumn}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleAddLesson}>
            <Text style={styles.addIconText}>+</Text>
          </TouchableOpacity>

          {onExtra ? (
            <TouchableOpacity style={[styles.iconBtn, styles.iconBtnSpacing]} onPress={onExtra}>
              <Text style={styles.iconFallback}>⟳</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {showDatePicker && (
        <>
          <TouchableOpacity style={styles.datePickerOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)} />
          <Animated.View style={[styles.datePickerContainer, { transform: [{ translateY: slideAnim }] }]}>
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
                    key={dateStr}
                    style={[styles.calendarDateCell, isSelected && styles.calendarDateSelected, isToday && !isSelected && styles.calendarDateToday]}
                    onPress={() => {
                      setDateKey(dateStr);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={[styles.calendarDayNumber, isSelected && styles.calendarTextSelected, isToday && !isSelected && styles.calendarTextToday]}>{dayNumber}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </>
      )}

      <Modal visible={isAddModalVisible} animationType="slide" transparent onRequestClose={handleCloseModal}>
        <AddLessonForm 
          visible={isAddModalVisible}
          onClose={handleCloseModal} 
          onSubmit={handleSubmitLesson}
          currentDate={currentKey}
          isoDate={currentKey}
        />
      </Modal>

      <Modal visible={showMenuModal} animationType="fade" transparent onRequestClose={() => setShowMenuModal(false)}>
          <TouchableOpacity style={styles.menuModalOverlay} activeOpacity={1} onPress={() => setShowMenuModal(false)}>
            <Animated.View style={[styles.menuModalContent, { transform: [{ translateX: menuSlideAnim }] }]}>
              <View style={styles.menuHeader}>
                <Image
                  source={require('../assets/images/logo.png')} 
                  style={styles.menuLogoImage}
                />
                <Text style={styles.menuTitle}>TISU O'qituvchi</Text>
              </View>

              <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenuModal(false);
                    if(onLogout){
                      onLogout();
                    }
                  }}
                >
                  <MaterialIcons name="delete-forever" size={24} color="#FF3B3B" />
                  <Text style={[styles.menuItemText, styles.menuItemDanger]}>Hisobni o'chirish</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenuModal(false);
                    if (onLogout) {
                      onLogout();
                    }
                  }}
                >
                  <MaterialIcons name="exit-to-app" size={24} color="#FF6B6B" />
                  <Text style={[styles.menuItemText, styles.menuItemDanger]}>Chiqish</Text>
                </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
  },
  list: { paddingHorizontal: 16, paddingBottom: 240 },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 72,
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
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
  iconBtnSpacing: { marginTop: 10 },
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
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
  },
  loaderCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B74FF',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  loaderIcon: {
    fontSize: 60,
  },
  loaderText: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0B74FF',
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuModalContent: {
    width: 280,
    backgroundColor: '#fff',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    height: '100%',  // minHeight: 300 o'rniga
  },
  menuHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },

  menuLogoImage: {  // menuLogo o'rniga
    width: 64,
    height: 64,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  menuItemDanger: {
    color: '#FF3B3B',
  },
});