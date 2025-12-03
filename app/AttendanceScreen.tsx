// AttendanceScreen.tsx - Modern Design
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { saveAttendance } from '../api/attendance';
import { fetchLesson } from '../api/lessons';
import { RootStackParamList } from '../types/navigation';

type AttendanceScreenRouteProp = RouteProp<RootStackParamList, 'Attendance'>;
type AttendanceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Attendance'
>;

type AttendanceStatus = boolean | null;

interface Student {
  id: string | number;
  student_id?: number;
  name: string;
  came?: boolean;
}

const AttendanceScreen: React.FC = () => {
  const navigation = useNavigation<AttendanceScreenNavigationProp>();
  const route = useRoute<AttendanceScreenRouteProp>();
  const { lesson: passedLesson } = route.params;

  const [lesson, setLesson] = useState<any>(passedLesson);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    const loadLessonWithAttendances = async () => {
      setLoading(true);
      setError(null);
      try {
        const lessonId = passedLesson.id || passedLesson.raw?.id;
        
        if (!lessonId) {
          throw new Error('Dars ID topilmadi');
        }

        const fullLesson = await fetchLesson(lessonId);
        setLesson(fullLesson);

        const attendancesList = fullLesson.attendances || [];
        
        if (attendancesList.length === 0) {
          setError('Bu darsda talabalar ro\'yxati topilmadi');
          setStudents([]);
          setLoading(false);
          return;
        }

        const studentsList: Student[] = attendancesList.map((att: any, index: number) => ({
          id: att.id || `student-${index}`,
          student_id: att.student_id,
          name: att.student?.name || att.student?.full_name || `Talaba #${att.student_id || index + 1}`,
          came: att.came
        }));

        setStudents(studentsList);

        const initialAttendance: Record<string, AttendanceStatus> = {};
        studentsList.forEach(student => {
          initialAttendance[String(student.id)] = student.came ?? true;
        });
        setAttendance(initialAttendance);

      } catch (err: any) {
        setError(err?.message || 'Darsni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    loadLessonWithAttendances();
  }, [passedLesson]);

  const toggleAttendance = (studentId: string, status: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error: any) {
      console.log('Photo error:', error);
    }
  };

  const handleSave = async () => {
    if (!photoUri) {
      return;
    }

    setSaving(true);
    try {
      const attendanceData = students.map(student => ({
        attendance_id: student.id,
        student_id: student.student_id,
        came: attendance[String(student.id)] ?? true,
      }));

      await saveAttendance({
        lesson_id: lesson.id,
        attendances: attendanceData,
        image: photoUri,
      });

      navigation.goBack();

    } catch (err: any) {
      console.log('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yuklanmoqda...</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color="#0B74FF" />
          </View>
          <Text style={styles.loadingText}>Ma'lumotlar yuklanmoqda...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xatolik</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorEmoji}>⚠️</Text>
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Orqaga qaytish</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const lessonDetails = lesson?.details || {};
  const subjectName = lessonDetails.subject_name || lesson?.subject || 'Dars';
  const startTime = lessonDetails.time_at || lesson?.start || '—';
  const roomName = lesson?.room?.name || lesson?.room || '—';
  const groupName = lesson?.group?.name || lesson?.group || '—';
  const lessonType = lessonDetails.build || lesson?.type || "Ma'ruza";

  const presentCount = Object.values(attendance).filter(v => v === true).length;
  const absentCount = Object.values(attendance).filter(v => v === false).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{subjectName}</Text>
          <Text style={styles.headerSubtitle}>{groupName}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lesson Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>📚</Text>
            </View>
            <Text style={styles.infoCardTitle}>Dars ma'lumotlari</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <Ionicons name="time-outline" size={20} color="#0B74FF" />
              </View>
              <View style={styles.infoItemText}>
                <Text style={styles.infoLabel}>Vaqt</Text>
                <Text style={styles.infoValue}>{startTime}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <Ionicons name="location-outline" size={20} color="#0B74FF" />
              </View>
              <View style={styles.infoItemText}>
                <Text style={styles.infoLabel}>Xona</Text>
                <Text style={styles.infoValue}>{roomName}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <Ionicons name="book-outline" size={20} color="#0B74FF" />
              </View>
              <View style={styles.infoItemText}>
                <Text style={styles.infoLabel}>Turi</Text>
                <Text style={styles.infoValue}>{lessonType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={[styles.statCircle, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.statNumber}>{presentCount}</Text>
            </View>
            <Text style={styles.statLabel}>Keldi</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statCircle, { backgroundColor: '#FFEBEE' }]}>
              <Text style={styles.statNumber}>{absentCount}</Text>
            </View>
            <Text style={styles.statLabel}>Kelmadi</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statCircle, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.statNumber}>{students.length}</Text>
            </View>
            <Text style={styles.statLabel}>Jami</Text>
          </View>
        </View>

        {/* Students List */}
        {students.length > 0 ? (
          <View style={styles.studentsCard}>
            <View style={styles.studentsHeader}>
              <View style={styles.studentsIconCircle}>
                <Text style={styles.studentsIcon}>👥</Text>
              </View>
              <Text style={styles.studentsTitle}>
                Talabalar ro'yxati
              </Text>
            </View>

            {students.map((student, index) => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentLeft}>
                  <View style={styles.studentNumberBadge}>
                    <Text style={styles.studentNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.studentName}>{student.name}</Text>
                </View>
                
                <View style={styles.attendanceButtons}>
                  <TouchableOpacity
                    style={[
                      styles.attendanceBtn,
                      styles.absentBtn,
                      attendance[String(student.id)] === false && styles.absentBtnActive
                    ]}
                    onPress={() => toggleAttendance(String(student.id), false)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="close" 
                      size={18} 
                      color={attendance[String(student.id)] === false ? '#fff' : '#F44336'}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.attendanceBtn,
                      styles.presentBtn,
                      attendance[String(student.id)] === true && styles.presentBtnActive
                    ]}
                    onPress={() => toggleAttendance(String(student.id), true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="checkmark" 
                      size={18} 
                      color={attendance[String(student.id)] === true ? '#fff' : '#4CAF50'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Talabalar ro'yxati topilmadi</Text>
          </View>
        )}

        {/* Photo Section */}
        <View style={styles.photoCard}>
          <View style={styles.photoHeader}>
            <View style={styles.photoIconCircle}>
              <Text style={styles.photoIcon}>📸</Text>
            </View>
            <Text style={styles.photoTitle}>Dars rasmi</Text>
          </View>

          <TouchableOpacity 
            style={styles.photoButton} 
            onPress={takePhoto}
            activeOpacity={0.7}
          >
            <View style={styles.photoButtonContent}>
              <Ionicons name="camera" size={28} color="#0B74FF" />
              <Text style={styles.photoButtonText}>
                {photoUri ? 'Rasm o\'zgartirish' : 'Rasm olish'}
              </Text>
            </View>
          </TouchableOpacity>

          {photoUri && (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <View style={styles.photoSuccess}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.photoSuccessText}>Rasm qo'shildi</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!photoUri || saving) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!photoUri || saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.saveButtonContent}>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>Davomatni saqlash</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorEmoji: {
    fontSize: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#0B74FF',
    borderRadius: 12,
    shadowColor: '#0B74FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoIcon: {
    fontSize: 22,
  },
  infoCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoItemText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 8,
  },
  studentsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  studentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentsIcon: {
    fontSize: 22,
  },
  studentsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  studentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  studentName: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  absentBtn: {
    borderColor: '#F44336',
    backgroundColor: '#fff',
  },
  absentBtnActive: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  presentBtn: {
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  presentBtnActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 60,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  photoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  photoIcon: {
    fontSize: 22,
  },
  photoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  photoButton: {
    borderWidth: 2,
    borderColor: '#0B74FF',
    borderRadius: 16,
    borderStyle: 'dashed',
    padding: 24,
  },
  photoButtonContent: {
    alignItems: 'center',
    gap: 8,
  },
  photoButtonText: {
    fontSize: 16,
    color: '#0B74FF',
    fontWeight: '600',
  },
  photoPreview: {
    marginTop: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  photoSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    gap: 8,
  },
  photoSuccessText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});