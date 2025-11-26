// ============== TYPES ==============
export type LessonType = "Ma'ruza" | 'Amaliy' | 'Seminar';

export interface Lesson {
  id: string;
  start: string;
  end: string;
  type: LessonType;
  subject: string;
  group: string;
  room: string;
  faculty: string;
  lessonNumber: number;
}

export interface Faculty {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  number: string;
  facultyId: string;
}

export interface Group {
  id: string;
  name: string;
  facultyId: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  groupId: string;
}

export type AttendanceStatus = boolean | null;

// ============== MOCK DATA ==============
export const faculties: Faculty[] = [
  { id: 'f1', name: 'Matematika fakulteti' },
  { id: 'f2', name: 'Fizika fakulteti' },
  { id: 'f3', name: 'Iqtisodiyot fakulteti' },
  { id: 'f4', name: 'Filologiya fakulteti' },
];

export const rooms: Room[] = [
  { id: 'r1', number: '101', facultyId: 'f1' },
  { id: 'r2', number: '102', facultyId: 'f1' },
  { id: 'r3', number: '201', facultyId: 'f1' },
  { id: 'r4', number: '202', facultyId: 'f1' },
  { id: 'r5', number: '103', facultyId: 'f2' },
  { id: 'r6', number: '104', facultyId: 'f2' },
  { id: 'r7', number: '203', facultyId: 'f2' },
  { id: 'r8', number: '105', facultyId: 'f3' },
  { id: 'r9', number: '205', facultyId: 'f3' },
  { id: 'r10', number: '106', facultyId: 'f4' },
];

export const groups: Group[] = [
  { id: 'g1', name: '101-A', facultyId: 'f1' },
  { id: 'g2', name: '102-A', facultyId: 'f1' },
  { id: 'g3', name: '201-B', facultyId: 'f1' },
  { id: 'g4', name: '101-F', facultyId: 'f2' },
  { id: 'g5', name: '202-F', facultyId: 'f2' },
  { id: 'g6', name: '101-I', facultyId: 'f3' },
  { id: 'g7', name: '203-I', facultyId: 'f3' },
  { id: 'g8', name: '101-Fil', facultyId: 'f4' },
];

export const subjects: Subject[] = [
  { id: 's1', name: 'Matematika' },
  { id: 's2', name: 'Fizika' },
  { id: 's3', name: 'Ingliz tili' },
  { id: 's4', name: 'Tarix' },
  { id: 's5', name: 'Iqtisodiyot' },
  { id: 's6', name: 'Adabiyot' },
  { id: 's7', name: 'Informatika' },
];

export const students: Student[] = [
  { id: 'st1', name: 'Aliyev Abbos', groupId: 'g1' },
  { id: 'st2', name: 'Karimova Madina', groupId: 'g1' },
  { id: 'st3', name: 'Tursunov Jasur', groupId: 'g1' },
  { id: 'st4', name: 'Rahimova Dilnoza', groupId: 'g1' },
  { id: 'st5', name: 'Ergashev Sarvar', groupId: 'g1' },
  { id: 'st6', name: 'Yusupova Gulnora', groupId: 'g2' },
  { id: 'st7', name: 'Mahmudov Otabek', groupId: 'g2' },
  { id: 'st8', name: 'Saidova Feruza', groupId: 'g3' },
  { id: 'st9', name: 'Nabiyev Aziz', groupId: 'g4' },
  { id: 'st10', name: 'Ismoilova Nilufar', groupId: 'g4' },
];

// ============== LESSON TIMES ==============
export const lessonTimes = [
  { number: 1, start: '08:30', end: '09:50' },
  { number: 2, start: '10:00', end: '11:20' },
  { number: 3, start: '11:40', end: '13:00' },
  { number: 4, start: '13:10', end: '14:30' },
  { number: 5, start: '14:40', end: '16:00' },
  { number: 6, start: '16:10', end: '17:30' },
];