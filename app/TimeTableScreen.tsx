import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import TimeTableItem from '../components/TimeTableItem';
import { Lesson, mockTimetable } from '../data/mockTimetable';

// Optional vector icons (uncomment if you have the lib)
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  onLogout?: () => void;        // logout icon pressed
  onExtra?: () => void;         // extra icon pressed (the one to the right)
  extraPositionRightOffset?: number; // tweak horizontal offset for right icon
}

// helper to format ISO date to "YYYY-MM-DD"
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

const formatReadable = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString();
};

const TimeTableScreen: React.FC<Props> = ({ onLogout, onExtra, extraPositionRightOffset = 12 }) => {
  const [dateKey, setDateKey] = useState<string>(isoDate(new Date()));
  const availableDates = Object.keys(mockTimetable).sort();

  const currentKey = useMemo(() => {
    if (mockTimetable[dateKey]) return dateKey;
    return availableDates.length ? availableDates[0] : dateKey;
  }, [dateKey, availableDates]);

  const lessons = useMemo<Lesson[]>(() => mockTimetable[currentKey] || [], [currentKey]);

  function goPrev() {
    const idx = availableDates.indexOf(currentKey);
    if (idx > 0) setDateKey(availableDates[idx - 1]);
  }

  function goNext() {
    const idx = availableDates.indexOf(currentKey);
    if (idx < availableDates.length - 1) setDateKey(availableDates[idx + 1]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.titleText}>Dars Jadvali</Text>
      </View>

      {lessons.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Bugun darslar yo'q</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={lessons}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => <TimeTableItem lesson={item} />}
        />
      )}

      {/* Footer container: main pill (prev/date/next) with icons on the right */}
      <View style={styles.footerContainer}>
        <View style={styles.footerWrap}>
          <TouchableOpacity
            onPress={goPrev}
            style={[
              styles.navBtn,
              !availableDates.length || availableDates.indexOf(currentKey) === 0 ? styles.navBtnDisabled : null
            ]}
            disabled={!availableDates.length || availableDates.indexOf(currentKey) === 0}
          >
            <Text style={styles.navText}>◀</Text>
          </TouchableOpacity>

          <View style={styles.dateBox}>
            <Text style={styles.dateText}>{formatReadable(currentKey)}</Text>
          </View>

          <TouchableOpacity
            onPress={goNext}
            style={[
              styles.navBtn,
              !availableDates.length || availableDates.indexOf(currentKey) === availableDates.length - 1 ? styles.navBtnDisabled : null
            ]}
            disabled={!availableDates.length || availableDates.indexOf(currentKey) === availableDates.length - 1}
          >
            <Text style={styles.navText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Right-side icons stacked vertically */}
        <View style={styles.rightIconsColumn}>
          {/* Logout icon on top */}
          {onLogout ? (
            <TouchableOpacity onPress={onLogout} style={styles.iconBtn} accessibilityLabel="Logout">
              {/* <Icon name="logout" size={20} color="#0B74FF" /> */}
              <Text style={styles.iconFallback}>⎋</Text>
            </TouchableOpacity>
          ) : null}

          {/* Extra icon below */}
          {onExtra ? (
            <TouchableOpacity onPress={onExtra} style={[styles.iconBtn, styles.iconBtnSpacing]} accessibilityLabel="Extra action">
              {/* <Icon name="refresh" size={18} color="#0B74FF" /> */}
              <Text style={styles.iconFallback}>⟳</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

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

  list: { paddingHorizontal: 16, paddingBottom: 240 /* leave space for pill + icons */ },

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
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    marginRight: 12,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnDisabled: { opacity: 0.25 },
  navText: {
    fontSize: 20,
    color: '#0B74FF',
    fontWeight: '700',
  },
  dateBox: { flex: 1, alignItems: 'center' },
  dateText: { fontWeight: '800', fontSize: 16 },

  /* Column that holds icons on the right side */
  rightIconsColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Icon button style */
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
});