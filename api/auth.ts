const BASE_URL = 'https://your-backend-api.com';

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error('Login yoki parol noto\'g\'ri');
    }

    const data = await response.json();
    
    return true;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Tizimga kirishda xatolik yuz berdi');
  }
}

export async function loginMock(username: string, password: string): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (username === 'teacher' && password === '1') {
    return true;
  }
  
  throw new Error('Login yoki parol noto\'g\'ri');
}