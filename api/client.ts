import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = "https://d9ff274cdc9a.ngrok-free.app/api";

const TOKEN_KEY = 'auth_token';

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
}

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  payload?: any;
  requiresAuth?: boolean;
  headers?: Record<string, string>;
}

export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    throw error;
  }
};

export const apiRequest = async <T = any>({
  method,
  endpoint,
  payload,
  requiresAuth = false,
  headers = {},
}: RequestConfig): Promise<ApiResponse<T>> => {
  try {
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    if (requiresAuth) {
      const token = await getToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (payload && method !== 'GET') {
      config.body = JSON.stringify(payload);
    }

    let url = `${BASE_URL}${endpoint}`;
    if (method === 'GET' && payload) {
      const queryParams = new URLSearchParams(payload).toString();
      url += `?${queryParams}`;
    }

    const response = await fetch(url, config);

    const data = await response.json();

    if (data.success === false) {
      const errorMessage = 
        data.data?.message || 
        data.message || 
        'So\'rov bajarilmadi';
      
      throw new Error(errorMessage);
    }

    if (!response.ok) {
      const errorMessage = 
        data.data?.message || 
        data.message || 
        data.error ||
        `Server xatosi: ${response.status}`;
      
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    if (error.message === 'Network request failed') {
      throw new Error('Internet aloqasi yo\'q');
    }
    
    if (error.message === 'timeout') {
      throw new Error('So\'rov vaqti tugadi');
    }

    throw error;
  }
};

export const apiGet = <T = any>(
  endpoint: string,
  params?: any,
  requiresAuth = false
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'GET',
    endpoint,
    payload: params,
    requiresAuth,
  });
};

export const apiPost = <T = any>(
  endpoint: string,
  payload?: any,
  requiresAuth = false
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'POST',
    endpoint,
    payload,
    requiresAuth,
  });
};

export const apiPut = <T = any>(
  endpoint: string,
  payload?: any,
  requiresAuth = false
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'PUT',
    endpoint,
    payload,
    requiresAuth,
  });
};

export const apiDelete = <T = any>(
  endpoint: string,
  payload?: any,
  requiresAuth = false
): Promise<ApiResponse<T>> => {
  return apiRequest<T>({
    method: 'DELETE',
    endpoint,
    payload,
    requiresAuth,
  });
};