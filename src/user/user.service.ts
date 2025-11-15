import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Feedback } from './entities/feedback.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CreateUserProfileDto,
  UpdateUserProfileDto,
} from './dto/user-profile.dto';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto/feedback.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createUserDto: Partial<CreateUserDto>): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['profile'],
    });
    return { users, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  // Profile Management
  async createProfile(
    createProfileDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    const profile = this.profileRepository.create(createProfileDto);
    return this.profileRepository.save(profile);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    const profile = await this.getProfile(userId);
    await this.profileRepository.update(profile.id, updateProfileDto);
    return this.getProfile(userId);
  }

  // Feedback Management
  async createFeedback(
    createFeedbackDto: CreateFeedbackDto,
  ): Promise<Feedback> {
    const feedback = this.feedbackRepository.create(createFeedbackDto);
    return this.feedbackRepository.save(feedback);
  }

  async getFeedback(
    paginationDto: PaginationDto,
  ): Promise<{ feedback: Feedback[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const [feedback, total] = await this.feedbackRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return { feedback, total };
  }

  async updateFeedback(
    id: string,
    updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<Feedback> {
    await this.feedbackRepository.update(id, updateFeedbackDto);
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }
    return feedback;
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radius: number = 10,
  ): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('profile.latitude IS NOT NULL AND profile.longitude IS NOT NULL')
      .andWhere(
        `(
          6371 * acos(
            cos(radians(:latitude)) * cos(radians(profile.latitude)) *
            cos(radians(profile.longitude) - radians(:longitude)) +
            sin(radians(:latitude)) * sin(radians(profile.latitude))
          )
        ) <= :radius`,
        { latitude, longitude, radius },
      )
      .getMany();
  }
}
