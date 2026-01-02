import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getBuilds,
  getLessonTypes,
  getParas,
  Option,
  searchGroups,
  searchRooms,
  searchSubjects
} from '../api/searchs';

interface AddLessonFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (lesson: any) => void;
  currentDate: string;
  isoDate?: string;
}

const AddLessonForm: React.FC<AddLessonFormProps> = ({
  visible,
  onClose,
  onSubmit,
  currentDate,
  isoDate,
}) => {
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<Option | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Option | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Option | null>(null);
  const [selectedType, setSelectedType] = useState<Option | null>(null);
  const [selectedPara, setSelectedPara] = useState<Option | null>(null);
  const [imageFile, setImageFile] = useState<any | null>(null);

  const [showFacultyDropdown, setShowFacultyDropdown] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showParaDropdown, setShowParaDropdown] = useState(false);

  const [faculties, setFaculties] = useState<string[]>([]);
  const [paras, setParas] = useState<Option[]>([]);
  const [lessonTypes, setLessonTypes] = useState<Option[]>([]);

  const [groupsList, setGroupsList] = useState<Option[]>([]);
  const [roomsList, setRoomsList] = useState<Option[]>([]);
  const [subjectsList, setSubjectsList] = useState<Option[]>([]);

  const [groupQuery, setGroupQuery] = useState('');
  const [subjectQuery, setSubjectQuery] = useState('');
  const [roomQuery, setRoomQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const groupDebounce = useRef<any>(0);
  const subjectDebounce = useRef<any>(0);
  const roomDebounce = useRef<any>(0);

  const resetForm = () => {
    setSelectedFaculty('');
    setSelectedRoom(null);
    setSelectedGroup(null);
    setSelectedSubject(null);
    setSelectedType(null);
    setSelectedPara(null);
    setImageFile(null);
    setGroupQuery('');
    setSubjectQuery('');
    setRoomQuery('');
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const fArr = await getBuilds();
        setFaculties(fArr);
        const pArr = await getParas();
        setParas(pArr);
        const tArr = await getLessonTypes();
        setLessonTypes(tArr);
      } catch (err: any) {
        Alert.alert('Xato', err?.message ?? 'Ma\'lumotlarni olishda xato');
      } finally {
        setLoading(false);
      }
    })();
  }, [visible]);

  useEffect(() => {
    const q = groupQuery.trim();
    clearTimeout(groupDebounce.current);
    groupDebounce.current = setTimeout(async () => {
      try {
        setLoadingGroups(true);
        const list = await searchGroups(q || undefined);
        setGroupsList(list);
      } catch (err) {
        //
      } finally {
        setLoadingGroups(false);
      }
    }, 450);
    return () => clearTimeout(groupDebounce.current);
  }, [groupQuery]);

  useEffect(() => {
    const q = subjectQuery.trim();
    clearTimeout(subjectDebounce.current);
    subjectDebounce.current = setTimeout(async () => {
      try {
        setLoadingSubjects(true);
        const list = await searchSubjects(q || undefined);
        setSubjectsList(list);
      } catch (err) {
      } finally {
        setLoadingSubjects(false);
      }
    }, 450);
    return () => clearTimeout(subjectDebounce.current);
  }, [subjectQuery]);

  useEffect(() => {
    if (!showRoomDropdown) return;

    const q = roomQuery.trim();
    clearTimeout(roomDebounce.current);
    roomDebounce.current = setTimeout(async () => {
      try {
        setLoadingRooms(true);
        const list = await searchRooms(q || undefined, selectedFaculty || undefined);
        setRoomsList(list);
      } catch (err) {
        //
      } finally {
        setLoadingRooms(false);
      }
    }, 300);
    return () => clearTimeout(roomDebounce.current);
  }, [roomQuery, selectedFaculty, showRoomDropdown]);

  const openGroupDropdown = () => {
    setShowGroupDropdown(true);
    if (!groupsList.length) setGroupQuery('');
  };
  const openSubjectDropdown = () => {
    setShowSubjectDropdown(true);
    if (!subjectsList.length) setSubjectQuery('');
  };
  const openRoomDropdown = () => {
    setShowRoomDropdown(true);
    if (!roomsList.length) setRoomQuery('');
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!selectedFaculty || !selectedRoom || !selectedGroup || !selectedSubject || !selectedType || !selectedPara) {
      Alert.alert('Xato', "Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    const payload: any = {
      group_id: selectedGroup.id,
      room_id: selectedRoom.id,
      date: isoDate ?? currentDate,
      build: selectedFaculty,
      subject_name: selectedSubject.name,
      lesson_type: selectedType.name,
      time_at: selectedPara.name,
      image: imageFile ? imageFile : undefined,
    };

    if (imageFile) payload.image = imageFile;

    try {
      setLoading(true);
      onSubmit(payload);
      onClose();
    } catch (err: any) {
      console.warn('createLesson error', err);
      const msg = err?.message ?? 'Dars yaratishda xato';
      Alert.alert('Xato', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderDropdownContent = (
    items: any[],
    selectedItem: any,
    onSelect: (item: any) => void,
    loadingState?: boolean,
    searchQuery?: string,
    onSearchChange?: (text: string) => void,
    renderItemText?: (item: any) => string
  ) => (
    <View style={styles.dropdownContainer}>
      {onSearchChange && (
        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Qidirish..."
            value={searchQuery}
            onChangeText={onSearchChange}
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
        </View>
      )}
      <ScrollView 
        style={styles.dropdownScroll}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
      >
        {loadingState ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#0B74FF" />
          </View>
        ) : (
          items.map((item) => (
            <TouchableOpacity
              key={typeof item === 'string' ? item : item.id}
              style={styles.dropdownItem}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownText}>
                {renderItemText ? renderItemText(item) : (typeof item === 'string' ? item : item.name)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => { resetForm(); onClose(); }}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIcon}>📝</Text>
            </View>
            <Text style={styles.modalTitle}>Yangi dars qo'shish</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>📅 {currentDate}</Text>
            </View>
          </View>

          {loading && (
            <View style={styles.topLoadingBar}>
              <ActivityIndicator size="small" color="#0B74FF" />
            </View>
          )}

          {/* Form Content */}
          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Bino */}
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>🏛️ Bino</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowFacultyDropdown(!showFacultyDropdown)}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectText, !selectedFaculty && styles.placeholderText]}>
                  {selectedFaculty || 'Binoni tanlang'}
                </Text>
                <Text style={styles.arrowIcon}>{showFacultyDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showFacultyDropdown && renderDropdownContent(
                faculties,
                selectedFaculty,
                (f) => {
                  setSelectedFaculty(f);
                  setSelectedRoom(null);
                  setShowFacultyDropdown(false);
                }
              )}
            </View>

            {/* Xona */}
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>🚪 Xona</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={openRoomDropdown}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectText, !selectedRoom && styles.placeholderText]}>
                  {selectedRoom?.name || (selectedFaculty ? 'Xonani tanlang' : 'Avval binoni tanlang')}
                </Text>
                <Text style={styles.arrowIcon}>{showRoomDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showRoomDropdown && renderDropdownContent(
                roomsList,
                selectedRoom,
                (r) => {
                  setSelectedRoom(r);
                  setShowRoomDropdown(false);
                },
                loadingRooms,
                roomQuery,
                setRoomQuery,
                (r) => `${r.name}${r.build ? ` · ${r.build}` : ''}`
              )}
            </View>

            {/* Guruh */}
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>👥 Guruh</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={openGroupDropdown}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectText, !selectedGroup && styles.placeholderText]}>
                  {selectedGroup?.name || 'Guruhni tanlang'}
                </Text>
                <Text style={styles.arrowIcon}>{showGroupDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showGroupDropdown && renderDropdownContent(
                groupsList,
                selectedGroup,
                (g) => {
                  setSelectedGroup(g);
                  setShowGroupDropdown(false);
                },
                loadingGroups,
                groupQuery,
                setGroupQuery
              )}
            </View>

            {/* Fan */}
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>📚 Fan</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={openSubjectDropdown}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectText, !selectedSubject && styles.placeholderText]}>
                  {selectedSubject?.name || 'Fanni tanlang'}
                </Text>
                <Text style={styles.arrowIcon}>{showSubjectDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showSubjectDropdown && renderDropdownContent(
                subjectsList,
                selectedSubject,
                (s) => {
                  setSelectedSubject(s);
                  setShowSubjectDropdown(false);
                },
                loadingSubjects,
                subjectQuery,
                setSubjectQuery
              )}
            </View>

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>📖 Dars turi</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectText, !selectedType && styles.placeholderText]}>
                  {selectedType?.name || 'Dars turini tanlang'}
                </Text>
                <Text style={styles.arrowIcon}>{showTypeDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showTypeDropdown && renderDropdownContent(
                lessonTypes,
                selectedType,
                (t) => {
                  setSelectedType(t);
                  setShowTypeDropdown(false);
                }
              )}
            </View>

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>⏰ Para</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowParaDropdown(!showParaDropdown)}
                activeOpacity={0.7}
              >
                <Text style={[styles.selectText, !selectedPara && styles.placeholderText]}>
                  {selectedPara?.name || 'Parani tanlang'}
                </Text>
                <Text style={styles.arrowIcon}>{showParaDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showParaDropdown && renderDropdownContent(
                paras,
                selectedPara,
                (p) => {
                  setSelectedPara(p);
                  setShowParaDropdown(false);
                }
              )}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => { resetForm(); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>❌ Bekor qilish</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>✅ Yaratish</Text>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIcon: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  dateBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  topLoadingBar: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  formScroll: {
    marginBottom: 16,
  },
  fieldCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  arrowIcon: {
    fontSize: 11,
    color: '#666',
    marginLeft: 8,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 240,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  searchWrapper: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1a1a1a',
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  dropdownText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '700',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#0B74FF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#0B74FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});