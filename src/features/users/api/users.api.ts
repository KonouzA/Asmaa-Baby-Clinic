import { api } from '@/lib/api';
import type { CreateUserDto, User } from '../schemas/users.schema';

export const usersApi = {
  list: () => api.get<User[]>('/api/users'),
  create: (dto: CreateUserDto) => api.post<User>('/api/users', dto),
};
