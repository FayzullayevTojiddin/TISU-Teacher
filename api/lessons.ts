// api/lessons.ts
import { apiGet, apiPost, BASE_URL, getToken } from './client';

export interface LessonDetails {
  fakultet: string;
  subject_name?: string | null;
  time_at?: string | null;
  [k: string]: any;
}

export interface Lesson {
  id: number;
  teacher_id: number;
  group_id: number;
  room_id: number;
  date: string; // YYYY-MM-DD
  image?: string | null;
  details?: LessonDetails;
  group?: any;
  room?: any;
  teacher?: any;
  attendances?: any[];
  [k: string]: any;
}

/* lessons ro'yxatini olish (date required) */
export const fetchLessons = async (date: string): Promise<{ lessons: Lesson[]; total: number }> => {
  try {
    // apiGet<T> ga T -> data ning shakli bo'ladi
    const res = await apiGet<{
      message?: string;
      lessons: Lesson[];
      total?: number;
    }>('/teacher/lessons', { date }, true);

    const data = res.data;
    return {
      lessons: data.lessons ?? [],
      total: data.total ?? (data.lessons ? data.lessons.length : 0),
    };
  } catch (err: any) {
    if (err?.message === 'Network request failed') {
      throw new Error('Internet aloqasi yo\'q');
    }
    throw new Error(err?.message || 'Darslar olinayotganda xatolik yuz berdi');
  }
};

/* bitta lessonni id bo'yicha olish */
export const fetchLesson = async (id: number | string): Promise<Lesson> => {
  try {
    const res = await apiGet<{ message?: string; lesson: Lesson }>(`/teacher/lessons/${id}`, undefined, true);
    return res.data.lesson;
  } catch (err: any) {
    if (err?.message === 'Network request failed') {
      throw new Error('Internet aloqasi yo\'q');
    }
    throw new Error(err?.message || 'Dars ma\'lumotlari olinayotganda xatolik yuz berdi');
  }
};

/* dars qo'shish (image bo'lsa FormData, aks holda JSON) */
export const createLesson = async (payload: {
  group_id: number | string;
  room_id: number | string;
  date: string; // Y-m-d
  fakultet: string;
  subject_name?: string;
  time_at?: string;
  image?: any; // RN: { uri, name, type } yoki browser File
}): Promise<Lesson> => {
  try {
    const { image, ...rest } = payload;

    if (image) {
      const form = new FormData();
      Object.entries(rest).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, String(v));
      });

      // React Native style: { uri, name, type }
      if ((image as any).uri) {
        form.append('image', {
          uri: (image as any).uri,
          name: (image as any).name ?? `photo-${Date.now()}.jpg`,
          type: (image as any).type ?? 'image/jpeg',
        } as any);
      } else {
        // Browser File
        form.append('image', image as any);
      }

      const token = await getToken();
      if (!token) throw new Error('Token mavjud emas. Iltimos avval login qiling.');

      const url = `${BASE_URL}/teacher/lessons`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          // IMPORTANT: Content-Type ni qo'ymang — fetch FormData uchun boundary o'rnatadi
        },
        body: form as any,
      });

      const responseData = await response.json();
      if (!response.ok || responseData.success === false) {
        const msg =
          responseData?.data?.message ||
          responseData?.message ||
          responseData?.error ||
          `Server xatosi: ${response.status}`;
        throw new Error(msg);
      }
      return responseData.data.lesson;
    }

    // image yo'q bo'lsa JSON orqali yuborish
    const res = await apiPost<{ message?: string; lesson: Lesson }>('/teacher/lessons', rest, true);
    return res.data.lesson;
  } catch (err: any) {
    if (err?.message === 'Network request failed') {
      throw new Error('Internet aloqasi yo\'q');
    }
    throw new Error(err?.message || 'Dars qo\'shishda xatolik yuz berdi');
  }
};