// src/data/mockTimetable.ts

export type LessonType = "Ma'ruza" | 'Amaliy' | 'Seminar';

export interface Lesson {
  id: string;
  start: string;
  end: string;
  type: LessonType;
  subject: string;
  group: string;
  room: string;
}

export const mockTimetable: Record<string, Lesson[]> = {
  '2025-11-23': [
    {
      id: '1',
      start: '08:30',
      end: '09:50',
      type: "Ma'ruza",
      subject: 'Matematika',
      group: '101-A',
      room: '201',
    },
    {
      id: '2',
      start: '10:00',
      end: '11:20',
      type: 'Amaliy',
      subject: 'Ingliz tili',
      group: '102-B',
      room: '305',
    },
    {
      id: '3',
      start: '11:40',
      end: '13:00',
      type: 'Seminar',
      subject: 'Fizika',
      group: '101-A',
      room: '110',
    },
  ],

  '2025-11-24': [
    {
      id: '4',
      start: '09:00',
      end: '10:20',
      type: "Ma'ruza",
      subject: 'Tarix',
      group: '103-C',
      room: '210',
    },
    {
      id: '5',
      start: '10:30',
      end: '11:50',
      type: 'Seminar',
      subject: 'Iqtisodiyot',
      group: '101-B',
      room: '102',
    },
  ],
};