import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Volunteer } from './entities/volunteer.entity';
import { CreateVolunteerDto, UpdateVolunteerDto } from './dto/create-volunteer.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class VolunteerService {
  constructor(
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
  ) {}

  async create(createVolunteerDto: CreateVolunteerDto): Promise<Volunteer> {
    const volunteer = this.volunteerRepository.create(createVolunteerDto);
    return this.volunteerRepository.save(volunteer);
  }

  async findAll(paginationDto: PaginationDto): Promise<{ volunteers: Volunteer[]; total: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const [volunteers, total] = await this.volunteerRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
    return { volunteers, total };
  }

  async findOne(id: string): Promise<Volunteer> {
    const volunteer = await this.volunteerRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }
    return volunteer;
  }

  async findByUserId(userId: string): Promise<Volunteer> {
    const volunteer = await this.volunteerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!volunteer) {
      throw new NotFoundException('Volunteer profile not found');
    }
    return volunteer;
  }

  async update(id: string, updateVolunteerDto: UpdateVolunteerDto): Promise<Volunteer> {
    await this.volunteerRepository.update(id, updateVolunteerDto);
    return this.findOne(id);
  }

  async updatePreferences(userId: string, preferences: any): Promise<Volunteer> {
    const volunteer = await this.findByUserId(userId);
    await this.volunteerRepository.update(volunteer.id, { preferences });
    return this.findByUserId(userId);
  }

  async remove(id: string): Promise<void> {
    const result = await this.volunteerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Volunteer not found');
    }
  }
}