import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
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
import { mockStudents, mockTopics } from '../data/mockStudents';
import { RootStackParamList } from '../types/navigation';

type AttendanceScreenRouteProp = RouteProp<RootStackParamList, 'Attendance'>;
type AttendanceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Attendance'
>;

const AttendanceScreen: React.FC = () => {
  const navigation = useNavigation<AttendanceScreenNavigationProp>();
  const route = useRoute<AttendanceScreenRouteProp>();
  const { lesson } = route.params;

  // Filter students by group
  const students = mockStudents.filter(s => s.group === lesson.group);
  const topics = mockTopics[lesson.subject] || [];

  const [selectedTopic, setSelectedTopic] = useState(topics[0] || '');
  const [attendance, setAttendance] = useState<Record<string, boolean>>(
    students.reduce((acc, student) => ({ ...acc, [student.id]: true }), {})
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId],
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
    const presentCount = Object.values(attendance).filter(Boolean).length;
    const absentCount = students.length - presentCount;

    Alert.alert(
      'Davomat saqlandi',
      `Mavzu: ${selectedTopic}\nKeldi: ${presentCount}\nKelmadi: ${absentCount}`,
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
          <Text style={styles.infoText}>
            {lesson.start} - {lesson.end} • Xona {lesson.room}
          </Text>
          <Text style={styles.infoText}>Guruh: {lesson.group}</Text>
          <Text style={styles.infoText}>Turi: {lesson.type}</Text>
        </View>

        {/* Topic Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mavzu</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedTopic}
              onValueChange={setSelectedTopic}
              style={styles.picker}
            >
              {topics.map((topic, index) => (
                <Picker.Item key={index} label={topic} value={topic} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Students List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Talabalar ro'yxati ({students.length})
          </Text>
          {students.map(student => (
            <TouchableOpacity
              key={student.id}
              style={styles.studentRow}
              onPress={() => toggleAttendance(student.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.studentName}>{student.name}</Text>
              <View style={[
                styles.checkbox,
                attendance[student.id] && styles.checkboxChecked
              ]}>
                {attendance[student.id] && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
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
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentName: {
    fontSize: 15,
    color: '#333',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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