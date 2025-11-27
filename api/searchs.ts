// api/searchs.ts
import { apiGet } from './client';

export interface Option {
  id: number | string;
  name: string;
  [k: string]: any;
}

export const getFakultets = async (): Promise<string[]> => {
  try {
    const res = await apiGet<Record<string, string>>('/teacher/search/fakultets', undefined, true);
    const data = res.data;
    return Array.isArray(data) ? data : Object.values(data ?? {});
  } catch (err: any) {
    throw new Error(err?.message ?? 'Fakultetlarni olishda xato');
  }
};

export const searchGroups = async (q?: string): Promise<Option[]> => {
  try {
    const params = q ? { q } : undefined;
    const res = await apiGet<Option[]>('/teacher/search/groups', params, true);
    return (res.data ?? []).map((g: any) => ({ id: g.id, name: g.name }));
  } catch (err: any) {
    throw new Error(err?.message ?? 'Guruhlarni qidirishda xato');
  }
};

export const searchRooms = async (q?: string, fakultet?: string): Promise<Option[]> => {
  try {
    const params: any = {};
    if (q) params.q = q;
    if (fakultet) params.fakultet = fakultet;
    const res = await apiGet<Option[]>('/teacher/search/rooms', Object.keys(params).length ? params : undefined, true);
    return (res.data ?? []).map((r: any) => ({ id: r.id, name: r.name, fakultet: r.fakultet }));
  } catch (err: any) {
    throw new Error(err?.message ?? 'Xonalarni qidirishda xato');
  }
};

export const searchSubjects = async (q?: string): Promise<Option[]> => {
  try {
    const params = q ? { q } : undefined;
    const res = await apiGet<Option[]>('/teacher/search/subjects', params, true);
    return (res.data ?? []).map((s: any) => ({ id: s.id, name: s.name }));
  } catch (err: any) {
    throw new Error(err?.message ?? 'Fanlarni qidirishda xato');
  }
};

export const getParas = async (): Promise<Option[]> => {
  try {
    const res = await apiGet<Option[]>('/teacher/search/paras', undefined, true);
    return (res.data ?? []).map((p: any) => ({ id: p.id, name: p.time }));
  } catch (err: any) {
    throw new Error(err?.message ?? 'Paralarni olishda xato');
  }
};

export const getLessonTypes = async (): Promise<Option[]> => {
  try {
    const res = await apiGet<Option[]>('/teacher/search/lesson-types', undefined, true);
    return (res.data ?? []).map((t: any) => ({ id: t.id, name: t.name }));
  } catch (err: any) {
    throw new Error(err?.message ?? 'Dars turlarini olishda xato');
  }
};