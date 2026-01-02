// api/attendance.ts
import { BASE_URL, getToken } from './client';

interface AttendanceItem {
  attendance_id: string | number;
  student_id?: number;
  came: boolean;
}

interface SaveAttendancePayload {
  lesson_id: number;
  attendances: AttendanceItem[];
  image?: string | null;
}

export const saveAttendance = async (payload: SaveAttendancePayload): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getToken();
      if (!token) {
        reject(new Error('Tizimga kiring'));
        return;
      }

      const formData = new FormData();

      payload.attendances.forEach((attendance, index) => {
        formData.append(`attendances[${index}][attendance_id]`, String(attendance.attendance_id));
        if (attendance.student_id) {
          formData.append(`attendances[${index}][student_id]`, String(attendance.student_id));
        }
        formData.append(`attendances[${index}][came]`, attendance.came ? '1' : '0');
      });

      if (payload.image) {
        const imageUri = payload.image;
        
        if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://') && !imageUri.startsWith('ph://')) {
          reject(new Error('Iltimos, yangi rasm oling (kamera yoki galereyadan)'));
          return;
        }
        
        const filename = imageUri.split('/').pop() || `photo-${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type: type,
        } as any);
      }

      const url = `${BASE_URL}/teacher/lessons/${payload.lesson_id}`;
      const xhr = new XMLHttpRequest();
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (parseError) {
            reject(new Error('Javobni o\'qishda xatolik'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            const errorMessage = errorResponse?.data?.message || errorResponse?.message || 'Server xatosi';
            reject(new Error(errorMessage));
          } catch {
            console.log(xhr);
            reject(new Error(`Server xatosi: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Internet aloqasi yo\'q. BASE_URL va backend serverini tekshiring.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('So\'rov vaqti tugadi. Internet aloqangizni tekshiring.'));
      };

      xhr.open('POST', url);
      xhr.timeout = 30000;
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
      xhr.send(formData as any);

    } catch (err: any) {
      reject(err);
    }
  });
};