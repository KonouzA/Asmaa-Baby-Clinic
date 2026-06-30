import { api } from '@/lib/api';
import type { LoginDto, LoginResponse, SessionUser } from '../schemas/auth.schema';

export const authApi = {
  login: (dto: LoginDto) => api.post<LoginResponse>('/api/auth/login', dto),
  logout: () => api.post<{ ok: true }>('/api/auth/logout'),
  me: () => api.get<SessionUser>('/api/auth/me'),
};
