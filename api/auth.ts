import { apiPost, removeToken, saveToken } from './client';

interface LoginPayload {
  login: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  teacher: {
    id: number;
    full_name: string;
    login: string;
  };
}

interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  new_password_confirmation: string;
}

interface LogoutResponse {
  message: string;
}

interface RegisterPayload {
  full_name: string;
  login: string;
  password: string;
  password_confirmation: string;
}

interface RegisterResponse {
  message: string;
  token: string;
  teacher: {
    id: number;
    full_name: string;
    login: string;
  };
}

export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await apiPost<LoginResponse>('/teacher/login', {
      login: username,
      password: password,
    });
    console.log(response);
    if (response.success && response.data.token) {
      await saveToken(response.data.token);
      return response.data;
    }
    const errorMsg = response.data?.message || 'Login xatolik';
    throw new Error(errorMsg);
  } catch (error: any) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await apiPost<LogoutResponse>('/teacher/logout', {}, true);
    
    await removeToken();
  } catch (error: any) {
    await removeToken();
    
    throw new Error(error.message || 'Logout amalga oshmadi');
  }
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<string> => {
  try {
    const response = await apiPost<{ message: string }>(
      '/teacher/change-password',
      {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirmation: newPassword,
      },
      true
    );
    if (response.success) {
      return response.data.message;
    }
    throw new Error(response.data.message || 'Parol o\'zgartirilmadi');
  } catch (error: any) {
    throw new Error(error.message || 'Parol o\'zgartirish amalga oshmadi');
  }
};

export const getProfile = async () => {
  try {
    const response = await apiPost('/teacher/profile', {}, true);
    if (response.success) {
      return response.data.teacher;
    }
    throw new Error(response.data.message || 'Profil ma\'lumotlari yuklanmadi');
  } catch (error: any) {
    throw new Error(error.message || 'Profil ma\'lumotlarini olishda xatolik');
  }
};

export const register = async (
  fullName: string,
  login: string,
  password: string
): Promise<RegisterResponse> => {
  try {
    const response = await apiPost<RegisterResponse>('/teacher/register', {
      full_name: fullName,
      login: login,
      password: password,
      password_confirmation: password,
    });
    if (response.success && response.data.token) {
      await saveToken(response.data.token);
      return response.data;
    }
    throw new Error(response.data?.message || "Ro'yxatdan o'tish amalga oshmadi");
  } catch (error: any) {
    throw new Error(error.message || 'Register xatolik yuz berdi');
  }
};