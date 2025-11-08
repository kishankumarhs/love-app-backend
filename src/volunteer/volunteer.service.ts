import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Volunteer, VolunteerStatus } from './entities/volunteer.entity';
import {
  VolunteerApplication,
  ApplicationStatus,
} from './entities/volunteer-application.entity';
import { VolunteerAssignment } from './entities/volunteer-assignment.entity';
import {
  CreateVolunteerDto,
  UpdateVolunteerDto,
} from './dto/create-volunteer.dto';
import { CreateVolunteerApplicationDto } from './dto/create-volunteer-application.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class VolunteerService {
  constructor(
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
    @InjectRepository(VolunteerApplication)
    private applicationRepository: Repository<VolunteerApplication>,
    @InjectRepository(VolunteerAssignment)
    private assignmentRepository: Repository<VolunteerAssignment>,
  ) {}

  async create(createVolunteerDto: CreateVolunteerDto): Promise<Volunteer> {
    const volunteer = this.volunteerRepository.create(createVolunteerDto);
    return this.volunteerRepository.save(volunteer);
  }

  async submitApplication(
    userId: string,
    applicationDto: CreateVolunteerApplicationDto,
  ): Promise<VolunteerApplication> {
    const existingApplication = await this.applicationRepository.findOne({
      where: { userId, status: ApplicationStatus.PENDING },
    });

    if (existingApplication) {
      throw new BadRequestException('You already have a pending application');
    }

    const application = this.applicationRepository.create({
      ...applicationDto,
      userId,
    });

    return await this.applicationRepository.save(application);
  }

  async approveApplication(
    applicationId: string,
    reviewerId: string,
  ): Promise<Volunteer> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['user'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    application.status = ApplicationStatus.APPROVED;
    application.reviewedById = reviewerId;
    application.reviewedAt = new Date();
    await this.applicationRepository.save(application);

    const volunteer = this.volunteerRepository.create({
      userId: application.userId,
      interests: application.interests,
      skills: application.skills,
      availability: application.availability,
      locationPreferences: application.locationPreferences,
      status: VolunteerStatus.ACTIVE,
    });

    return await this.volunteerRepository.save(volunteer);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ volunteers: Volunteer[]; total: number }> {
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

  async update(
    id: string,
    updateVolunteerDto: UpdateVolunteerDto,
  ): Promise<Volunteer> {
    await this.volunteerRepository.update(id, updateVolunteerDto);
    return this.findOne(id);
  }

  async updatePreferences(
    userId: string,
    preferences: any,
  ): Promise<Volunteer> {
    const volunteer = await this.findByUserId(userId);
    await this.volunteerRepository.update(volunteer.id, { preferences });
    return this.findByUserId(userId);
  }

  async getApplications(
    status?: ApplicationStatus,
  ): Promise<VolunteerApplication[]> {
    const where = status ? { status } : {};
    return await this.applicationRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserApplication(userId: string): Promise<VolunteerApplication> {
    return await this.applicationRepository.findOne({
      where: { userId },
      relations: ['user', 'reviewedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAssignments(volunteerId: string): Promise<VolunteerAssignment[]> {
    return await this.assignmentRepository.find({
      where: { volunteerId },
      relations: ['campaign', 'provider'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.volunteerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Volunteer not found');
    }
  }

  async getOpportunities(): Promise<any[]> {
    // Mock opportunities - in real implementation, this would fetch from campaigns or assignments
    return [
      {
        id: '1',
        title: 'Food Distribution',
        description: 'Help distribute food to families in need',
        location: 'Community Center',
        date: new Date(),
        volunteersNeeded: 5,
      },
      {
        id: '2',
        title: 'Elderly Care Support',
        description: 'Assist elderly residents with daily activities',
        location: 'Senior Center',
        date: new Date(),
        volunteersNeeded: 3,
      },
    ];
  }

  async joinOpportunity(opportunityId: string, userId: string): Promise<any> {
    // In real implementation, this would create an assignment
    return {
      message: 'Successfully joined opportunity',
      opportunityId,
      userId,
      joinedAt: new Date(),
    };
  }
}
