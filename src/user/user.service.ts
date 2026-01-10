import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Feedback } from './entities/feedback.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto/feedback.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async create(createUserDto: Partial<CreateUserDto>): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      const e = error as any;
      // Postgres unique violation code is 23505 — map it to a Conflict (409)
      if (
        e?.code === '23505' ||
        (e?.message && e.message.includes('duplicate key'))
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { users, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string, relations: string[] = []): Promise<User> {
    const allRelations = ['provider', 'vochers'];
    const relationsToLoad =
      relations && relations.length ? relations : allRelations;
    return this.userRepository.findOne({
      where: { email },
      relations: relationsToLoad,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      await this.userRepository.update(id, updateUserDto);
      return this.findOne(id);
    } catch (error) {
      console.log('error in update user', error);
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
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
    // If there was previously a profile table for geo-coordinates, and you
    // removed it, this method will need a replacement approach (e.g., store
    // lat/lng on the User entity). For now, return an empty array.
    return [];
  }
}
