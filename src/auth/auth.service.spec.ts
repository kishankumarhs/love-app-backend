import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
            verify: jest.fn(() => ({ sub: 1, email: 'test@test.com' })),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('signIn', () => {
    it('should return user and token when credentials are valid', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        phone: null,
        role: 'USER',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.signIn({
        email: 'test@test.com',
        password: 'password',
      });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });

    it('should throw error when credentials are invalid', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      await expect(
        service.signIn({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow();
    });
  });

  describe('signUp', () => {
    it('should create user and return token', async () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        phone: null,
        role: 'USER',
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(user as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.signUp({
        email: 'test@test.com',
        password: 'password',
        name: 'Test User',
      });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
    });
  });
});
