import api from '../api';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/api/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('admin_token', response.data.token);
  }
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('admin_token');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('admin_token');
};
