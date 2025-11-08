import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Feedback } from './entities/feedback.entity';
import { mockRepository } from '../test/setup';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Feedback),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@test.com',
        password: 'password',
        name: 'Test User',
      };
      const savedUser = { id: 1, ...createUserDto };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual(savedUser);
    });

    it('should create user when email does not exist', async () => {
      const createUserDto = {
        email: 'new@test.com',
        password: 'password',
        name: 'New User',
      };
      const savedUser = { id: 2, ...createUserDto };
      
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual(savedUser);
    });
  });

  describe('findOne', () => {
    it('should return user if found', async () => {
      const user = { id: 1, email: 'test@test.com' };
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
