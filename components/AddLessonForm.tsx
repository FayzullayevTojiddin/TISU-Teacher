import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AddLessonFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (lesson: {
    faculty: string;
    room: string;
    group: string;
    subject: string;
    type: string;
    para: number;
  }) => void;
  currentDate: string;
}

// Mock data
const FACULTIES = ['Informatika', 'Matematika', 'Fizika', 'Kimyo'];

const ROOMS_BY_FACULTY: Record<string, string[]> = {
  Informatika: ['101-A', '102-B', '103-C', '104-A'],
  Matematika: ['201-A', '202-B', '203-C'],
  Fizika: ['301-A', '302-B', '303-C', '304-D'],
  Kimyo: ['401-A', '402-B', '403-C'],
};

const GROUPS = ['20-guruh', '21-guruh', '22-guruh', '23-guruh', '24-guruh'];

const SUBJECTS = [
  'Matematika',
  'Ingliz tili',
  'Fizika',
  'Dasturlash',
  "Ma'lumotlar tuzilmasi",
  'Web dasturlash',
  'Kimyo',
  'Tarix',
];

const LESSON_TYPES = ["Ma'ruza", 'Amaliy', 'Seminar'];

const LESSON_TIMES = [
  { para: 1, start: '08:30', end: '09:50' },
  { para: 2, start: '10:00', end: '11:20' },
  { para: 3, start: '11:40', end: '13:00' },
  { para: 4, start: '13:30', end: '14:50' },
  { para: 5, start: '15:00', end: '16:20' },
];

const AddLessonForm: React.FC<AddLessonFormProps> = ({
  visible,
  onClose,
  onSubmit,
  currentDate,
}) => {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPara, setSelectedPara] = useState<number | null>(null);

  // Dropdown visibility states
  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showParaDropdown, setShowParaDropdown] = useState(false);

  const resetForm = () => {
    setSelectedFaculty('');
    setSelectedRoom('');
    setSelectedGroup('');
    setSelectedSubject('');
    setSelectedType('');
    setSelectedPara(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedFaculty || !selectedRoom || !selectedGroup || !selectedSubject || !selectedType || selectedPara === null) {
      alert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    onSubmit({
      faculty: selectedFaculty,
      room: selectedRoom,
      group: selectedGroup,
      subject: selectedSubject,
      type: selectedType,
      para: selectedPara,
    });

    resetForm();
  };

  const availableRooms = selectedFaculty ? ROOMS_BY_FACULTY[selectedFaculty] || [] : [];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Yangi dars qo'shish</Text>
          <Text style={styles.dateSubtitle}>{currentDate}</Text>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Faculty Select */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Fakultet</Text>
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setShowFacultyDropdown(!showFacultyDropdown)}
              >
                <Text style={[styles.selectText, !selectedFaculty && styles.placeholder]}>
                  {selectedFaculty || 'Fakultetni tanlang'}
                </Text>
                <Text style={styles.arrow}>{showFacultyDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showFacultyDropdown && (
                <View style={styles.dropdown}>
                  {FACULTIES.map((faculty) => (
                    <TouchableOpacity
                      key={faculty}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedFaculty(faculty);
                        setSelectedRoom('');
                        setShowFacultyDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{faculty}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Room Select */}
            {selectedFaculty && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Xona</Text>
                <TouchableOpacity
                  style={styles.selectBox}
                  onPress={() => setShowRoomDropdown(!showRoomDropdown)}
                >
                  <Text style={[styles.selectText, !selectedRoom && styles.placeholder]}>
                    {selectedRoom || 'Xonani tanlang'}
                  </Text>
                  <Text style={styles.arrow}>{showRoomDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                {showRoomDropdown && (
                  <View style={styles.dropdown}>
                    {availableRooms.map((room) => (
                      <TouchableOpacity
                        key={room}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedRoom(room);
                          setShowRoomDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownText}>{room}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Group Select */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Guruh</Text>
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setShowGroupDropdown(!showGroupDropdown)}
              >
                <Text style={[styles.selectText, !selectedGroup && styles.placeholder]}>
                  {selectedGroup || 'Guruhni tanlang'}
                </Text>
                <Text style={styles.arrow}>{showGroupDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showGroupDropdown && (
                <View style={styles.dropdown}>
                  {GROUPS.map((group) => (
                    <TouchableOpacity
                      key={group}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedGroup(group);
                        setShowGroupDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{group}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Subject Select */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Fan</Text>
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
              >
                <Text style={[styles.selectText, !selectedSubject && styles.placeholder]}>
                  {selectedSubject || 'Fanni tanlang'}
                </Text>
                <Text style={styles.arrow}>{showSubjectDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showSubjectDropdown && (
                <View style={styles.dropdown}>
                  {SUBJECTS.map((subject) => (
                    <TouchableOpacity
                      key={subject}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedSubject(subject);
                        setShowSubjectDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{subject}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Lesson Type Select */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Dars turi</Text>
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              >
                <Text style={[styles.selectText, !selectedType && styles.placeholder]}>
                  {selectedType || 'Dars turini tanlang'}
                </Text>
                <Text style={styles.arrow}>{showTypeDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showTypeDropdown && (
                <View style={styles.dropdown}>
                  {LESSON_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedType(type);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Para Select */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Para</Text>
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setShowParaDropdown(!showParaDropdown)}
              >
                <Text style={[styles.selectText, !selectedPara && styles.placeholder]}>
                  {selectedPara ? `${selectedPara}-para` : 'Parani tanlang'}
                </Text>
                <Text style={styles.arrow}>{showParaDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showParaDropdown && (
                <View style={styles.dropdown}>
                  {LESSON_TIMES.map((time) => (
                    <TouchableOpacity
                      key={time.para}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedPara(time.para);
                        setShowParaDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>
                        {time.para}-para ({time.start} - {time.end})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Bekor qilish</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
              <Text style={styles.createButtonText}>Yaratish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddLessonForm;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  dateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  formScroll: {
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  placeholder: {
    color: '#999',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '700',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#0B74FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});