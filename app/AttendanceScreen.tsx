import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { mockStudents } from '../data/mockStudents';
import { RootStackParamList } from '../types/navigation';

type AttendanceScreenRouteProp = RouteProp<RootStackParamList, 'Attendance'>;
type AttendanceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Attendance'
>;

type AttendanceStatus = boolean | null;

const AttendanceScreen: React.FC = () => {
  const navigation = useNavigation<AttendanceScreenNavigationProp>();
  const route = useRoute<AttendanceScreenRouteProp>();
  const { lesson } = route.params;

  const students = mockStudents.filter(s => s.group === lesson.group);

  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    students.reduce((acc, student) => ({ ...acc, [student.id]: true }), {})
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const toggleAttendance = (studentId: string, status: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Xatolik', 'Kamera ruxsati berilmadi');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    const presentCount = Object.values(attendance).filter(status => status === true).length;
    const absentCount = Object.values(attendance).filter(status => status === false).length;

    Alert.alert(
      'Davomat saqlandi',
      `Keldi: ${presentCount}\nKelmadi: ${absentCount}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson.subject}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Lesson Info */}
        <View style={styles.lessonInfo}>
          <View style={styles.infoGrid}>
            {/* Vaqt */}
            <View style={[styles.infoCell, styles.infoCellWithBorder]}>
              <Ionicons name="time-outline" size={24} color="#0B74FF" />
              <Text style={styles.infoText}>
                {lesson.start} - {lesson.end}
              </Text>
            </View>

            {/* Xona */}
            <View style={[styles.infoCell, styles.infoCellWithBorder]}>
              <Ionicons name="location-outline" size={24} color="#0B74FF" />
              <Text style={styles.infoText}>{lesson.room}</Text>
            </View>

            {/* Guruh */}
            <View style={[styles.infoCell, styles.infoCellWithBorder]}>
              <Ionicons name="people-outline" size={24} color="#0B74FF" />
              <Text style={styles.infoText}>{lesson.group}</Text>
            </View>

            {/* Turi */}
            <View style={styles.infoCell}>
              <Ionicons name="book-outline" size={24} color="#0B74FF" />
              <Text style={styles.infoText}>{lesson.type}</Text>
            </View>
          </View>
        </View>

        {/* Students List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Talabalar ro'yxati ({students.length})
          </Text>
          {students.map((student, index) => (
            <View key={student.id} style={styles.studentRow}>
              <Text style={styles.studentNumber}>{index + 1}.</Text>
              <Text style={styles.studentName}>{student.name}</Text>
              
              <View style={styles.buttonGroup}>
                {/* Kelmadi tugmasi - chap tomonda */}
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    styles.absentButton,
                    attendance[student.id] === false && styles.absentButtonActive
                  ]}
                  onPress={() => toggleAttendance(student.id, false)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.statusIcon,
                    attendance[student.id] === false && styles.statusIconActive
                  ]}>
                    ✕
                  </Text>
                </TouchableOpacity>

                {/* Keldi tugmasi - o'ng tomonda */}
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    styles.presentButton,
                    attendance[student.id] === true && styles.presentButtonActive
                  ]}
                  onPress={() => toggleAttendance(student.id, true)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.statusIcon,
                    attendance[student.id] === true && styles.statusIconActive
                  ]}>
                    ✓
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dars rasmi</Text>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color="#1E90FF" />
            <Text style={styles.photoButtonText}>
              {photoUri ? 'Rasm o\'zgartirish' : 'Rasm olish'}
            </Text>
          </TouchableOpacity>
          {photoUri && (
            <View style={styles.photoPreview}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.photoPreviewText}>Rasm qo'shildi</Text>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, !photoUri && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!photoUri}
        >
          <Text style={styles.saveButtonText}>Saqlash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  lessonInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  infoCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  infoCellWithBorder: {
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentNumber: {
    fontSize: 15,
    color: '#999',
    fontWeight: '600',
    marginRight: 8,
    minWidth: 25,
  },
  studentName: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 5,
  },
  statusButton: {
    width: 30,
    height: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  presentButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  presentButtonActive: {
    backgroundColor: '#4CAF50',
  },
  absentButton: {
    borderColor: '#F44336',
    backgroundColor: '#fff',
  },
  absentButtonActive: {
    backgroundColor: '#F44336',
  },
  statusIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
  statusIconActive: {
    color: '#fff',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#1E90FF',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  photoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1E90FF',
    fontWeight: '600',
  },
  photoPreview: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPreviewText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});