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
export const createLesson = async (payload: {
  group_id: number | string;
  room_id: number | string;
  date: string;
  fakultet: string;
  subject_name?: string;
  time_at?: string;
  image?: any;
}): Promise<Lesson> => {
  try {
    const { image, ...rest } = payload;
    const token = await getToken();
    if (!token) throw new Error("Dars qo'shilmadi");

    // yordamchi: body ichidan lesson topish
    const extractLesson = (body: any): Lesson | null => {
      if (!body) return null;
      if (body.data && body.data.lesson) return body.data.lesson as Lesson;
      if (body.lesson) return body.lesson as Lesson;
      if (body.data && typeof body.data.id === 'number') return body.data as Lesson;
      if (typeof body.id === 'number') return body as Lesson;
      return null;
    };

    // FormData (image) shoxi
    if (image) {
      const form = new FormData();
      Object.entries(rest).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, String(v));
      });

      if ((image as any).uri) {
        form.append('image', {
          uri: (image as any).uri,
          name: (image as any).name ?? `photo-${Date.now()}.jpg`,
          type: (image as any).type ?? 'image/jpeg',
        } as any);
      } else {
        form.append('image', image as any);
      }

      const url = `${BASE_URL}/teacher/lessons`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: form as any,
      });

      let body: any = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }

      const lesson = extractLesson(body);
      if (lesson) return lesson;
      throw new Error("Dars qo'shilmadi");
    }

    // JSON branch (image yo'q)
    const res = await apiPost<{ data?: { lesson?: Lesson } | Lesson }>(
      '/teacher/lessons',
      rest,
      true
    );

    const lessonFromRes =
      (res && (res.data as any) && (res.data as any).lesson) ||
      (res && (res.data as any) && typeof (res.data as any).id === 'number' ? (res.data as any) : null) ||
      null;

    if (lessonFromRes) return lessonFromRes as Lesson;

    throw new Error("Dars qo'shilmadi");
  } catch (err: any) {
    if (err?.message === 'Network request failed') {
      throw new Error("Internet aloqasi yo'q");
    }

    console.log(err)
    throw new Error("Dars qo'shilmadi1");
  }
};