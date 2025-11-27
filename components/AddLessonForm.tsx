// components/AddLessonForm.tsx
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
import { createLesson } from '../api/lessons';
import {
  getFakultets,
  getLessonTypes,
  getParas,
  Option,
  searchGroups,
  searchRooms,
  searchSubjects,
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
        const fArr = await getFakultets();
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
        // silent
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
    const q = roomQuery.trim();
    clearTimeout(roomDebounce.current);
    roomDebounce.current = setTimeout(async () => {
      try {
        setLoadingRooms(true);
        const list = await searchRooms(q || undefined, selectedFaculty || undefined);
        setRoomsList(list);
      } catch (err) {
      } finally {
        setLoadingRooms(false);
      }
    }, 300);
    return () => clearTimeout(roomDebounce.current);
  }, [roomQuery, selectedFaculty]);

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
    if (!selectedFaculty || !selectedRoom || !selectedGroup || !selectedSubject || !selectedType || !selectedPara) {
      Alert.alert('Xato', "Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    const payload: any = {
      group_id: selectedGroup.id,
      room_id: selectedRoom.id,
      date: isoDate ?? currentDate,
      fakultet: selectedFaculty,
      subject_name: selectedSubject.name,
      time_at: selectedPara.name,
    };

    if (imageFile) payload.image = imageFile;

    try {
      setLoading(true);
      const created = await createLesson(payload);
      Alert.alert('Muvaffaqiyat', 'Dars saqlandi');
      onSubmit(created);
      onClose();
    } catch (err: any) {
      console.warn('createLesson error', err);
      const msg = err?.message ?? 'Dars yaratishda xato';
      Alert.alert('Xato', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => { resetForm(); onClose(); }}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Yangi dars qo'shish</Text>
          <Text style={styles.dateSubtitle}>{currentDate}</Text>

          {loading ? <View style={{ padding: 12 }}><ActivityIndicator size="small" /></View> : null}

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Fakultet</Text>
              <TouchableOpacity style={styles.selectBox} onPress={() => setShowFacultyDropdown(!showFacultyDropdown)}>
                <Text style={[styles.selectText, !selectedFaculty && styles.placeholder]}>{selectedFaculty || 'Fakultetni tanlang'}</Text>
                <Text style={styles.arrow}>{showFacultyDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showFacultyDropdown && (
                <View style={styles.dropdown}>
                  {faculties.map((f) => (
                    <TouchableOpacity key={f} style={styles.dropdownItem} onPress={() => { setSelectedFaculty(f); setSelectedRoom(null); setShowFacultyDropdown(false); }}>
                      <Text style={styles.dropdownText}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Xona</Text>
              <TouchableOpacity style={styles.selectBox} onPress={openRoomDropdown}>
                <Text style={[styles.selectText, !selectedRoom && styles.placeholder]}>{selectedRoom?.name || (selectedFaculty ? 'Xonani tanlang' : 'Avval fakultet tanlang')}</Text>
                <Text style={styles.arrow}>{showRoomDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showRoomDropdown && (
                <View style={styles.dropdown}>
                  <View style={{ padding: 8 }}>
                    <TextInput placeholder="Qidirish..." value={roomQuery} onChangeText={setRoomQuery} style={styles.searchInput} />
                  </View>
                  {loadingRooms ? <ActivityIndicator style={{ margin: 8 }} /> : null}
                  {roomsList.map((r) => (
                    <TouchableOpacity key={r.id} style={styles.dropdownItem} onPress={() => { setSelectedRoom(r); setShowRoomDropdown(false); }}>
                      <Text style={styles.dropdownText}>{r.name} {r.fakultet ? `· ${r.fakultet}` : ''}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Guruh</Text>
              <TouchableOpacity style={styles.selectBox} onPress={openGroupDropdown}>
                <Text style={[styles.selectText, !selectedGroup && styles.placeholder]}>{selectedGroup?.name || 'Guruhni tanlang'}</Text>
                <Text style={styles.arrow}>{showGroupDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showGroupDropdown && (
                <View style={styles.dropdown}>
                  <View style={{ padding: 8 }}>
                    <TextInput placeholder="Qidirish..." value={groupQuery} onChangeText={setGroupQuery} style={styles.searchInput} />
                  </View>
                  {loadingGroups ? <ActivityIndicator style={{ margin: 8 }} /> : null}
                  {groupsList.map((g) => (
                    <TouchableOpacity key={g.id} style={styles.dropdownItem} onPress={() => { setSelectedGroup(g); setShowGroupDropdown(false); }}>
                      <Text style={styles.dropdownText}>{g.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Fan</Text>
              <TouchableOpacity style={styles.selectBox} onPress={openSubjectDropdown}>
                <Text style={[styles.selectText, !selectedSubject && styles.placeholder]}>{selectedSubject?.name || 'Fanni tanlang yoki qidirish'}</Text>
                <Text style={styles.arrow}>{showSubjectDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showSubjectDropdown && (
                <View style={styles.dropdown}>
                  <View style={{ padding: 8 }}>
                    <TextInput placeholder="Qidirish..." value={subjectQuery} onChangeText={setSubjectQuery} style={styles.searchInput} />
                  </View>
                  {loadingSubjects ? <ActivityIndicator style={{ margin: 8 }} /> : null}
                  {subjectsList.map((s) => (
                    <TouchableOpacity key={s.id} style={styles.dropdownItem} onPress={() => { setSelectedSubject(s); setShowSubjectDropdown(false); }}>
                      <Text style={styles.dropdownText}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Dars turi</Text>
              <TouchableOpacity style={styles.selectBox} onPress={() => setShowTypeDropdown(!showTypeDropdown)}>
                <Text style={[styles.selectText, !selectedType && styles.placeholder]}>{selectedType?.name || 'Dars turini tanlang'}</Text>
                <Text style={styles.arrow}>{showTypeDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showTypeDropdown && (
                <View style={styles.dropdown}>
                  {lessonTypes.map((t) => (
                    <TouchableOpacity key={t.id} style={styles.dropdownItem} onPress={() => { setSelectedType(t); setShowTypeDropdown(false); }}>
                      <Text style={styles.dropdownText}>{t.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Para</Text>
              <TouchableOpacity style={styles.selectBox} onPress={() => setShowParaDropdown(!showParaDropdown)}>
                <Text style={[styles.selectText, !selectedPara && styles.placeholder]}>{selectedPara?.name || 'Parani tanlang'}</Text>
                <Text style={styles.arrow}>{showParaDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showParaDropdown && (
                <View style={styles.dropdown}>
                  {paras.map((p) => (
                    <TouchableOpacity key={p.id} style={styles.dropdownItem} onPress={() => { setSelectedPara(p); setShowParaDropdown(false); }}>
                      <Text style={styles.dropdownText}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => { resetForm(); onClose(); }}>
              <Text style={styles.cancelButtonText}>Bekor qilish</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.createButton} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createButtonText}>Yaratish</Text>}
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
    marginBottom: 12,
    marginTop: 4,
  },
  formScroll: {
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 12,
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
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
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
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 220,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  searchInput: {
    backgroundColor: '#F4F6F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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