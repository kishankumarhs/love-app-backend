export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export enum UserRole {
  USER = 'user',
  PROVIDER = 'provider',
  VOLUNTEER = 'volunteer',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CacheOptions {
  ttl?: number;
  key?: string;
}