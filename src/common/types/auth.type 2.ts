import { User } from '../../user/entities/user.entity';

export type JwtPayload = {
  id: string;
  email: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
};

export type AuthResponse = {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
};
