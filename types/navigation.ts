import { Lesson } from '../data/mockTimetable';

export type RootStackParamList = {
  Login: undefined;
  TimeTable: undefined;
  Attendance: { lesson: Lesson };
  Settings: undefined;
};