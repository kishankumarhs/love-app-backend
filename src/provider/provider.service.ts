import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Provider } from './entities/provider.entity';
import { Employee } from './entities/employee.entity';
import { Review, ReviewStatus } from '../review/entities/review.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateProvider } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private userService: UserService,
  ) { }
  // Employee CRUD
  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    // Optionally: check provider exists
    const employee = this.employeeRepository.create(dto);
    return this.employeeRepository.save(employee);
  }

  async findAllEmployees(providerId?: string): Promise<Employee[]> {
    if (providerId) {
      return this.employeeRepository.find({
        where: {
          provider: { id: providerId },
        },
      });
    }
    return this.employeeRepository.find();
  }

  async findEmployeeById(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    await this.employeeRepository.update(id, dto);
    return this.findEmployeeById(id);
  }

  async removeEmployee(id: string): Promise<void> {
    const result = await this.employeeRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Employee not found');
  }

  async create(createProviderDto: CreateProvider): Promise<Provider> {
    await this.userService.update(createProviderDto.userId, {
      role: UserRole.PROVIDER,
    });
    const provider = this.providerRepository.create(createProviderDto);
    return await this.providerRepository.save(provider);
  }

  async findAll(filters?: {
    category?: string;
    location?: string;
    capacity?: number;
  }): Promise<Provider[]> {
    const query = this.providerRepository.createQueryBuilder('provider');

    if (filters?.category) {
      query.andWhere(':category = ANY(provider.categories)', {
        category: filters.category,
      });
    }

    if (filters?.location) {
      query.andWhere('provider.address ILIKE :location', {
        location: `%${filters.location}%`,
      });
    }

    if (filters?.capacity) {
      query.andWhere('provider.capacity >= :capacity', {
        capacity: filters.capacity,
      });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Provider> {
    const provider = await this.providerRepository.findOne({
      where: { id },
      relations: ['campaigns', 'user'],
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return provider;
  }

  async update(
    id: string,
    updateProviderDto: UpdateProviderDto,
  ): Promise<Provider> {
    await this.providerRepository.update(id, updateProviderDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.providerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Provider not found');
    }
  }

  async search(filters: {
    query?: string;
    type?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
  }): Promise<Provider[]> {
    const query = this.providerRepository.createQueryBuilder('provider');

    if (filters.query) {
      query.andWhere(
        'provider.name ILIKE :searchQuery OR provider.description ILIKE :searchQuery',
        { searchQuery: `%${filters.query}%` },
      );
    }

    if (filters.type) {
      query.andWhere(':type = ANY(provider.categories)', {
        type: filters.type,
      });
    }

    if (filters.latitude && filters.longitude && filters.radius) {
      query.andWhere(
        `(
          6371 * acos(
            cos(radians(:latitude)) * cos(radians(provider.latitude)) *
            cos(radians(provider.longitude) - radians(:longitude)) +
            sin(radians(:latitude)) * sin(radians(provider.latitude))
          )
        ) <= :radius`,
        {
          latitude: filters.latitude,
          longitude: filters.longitude,
          radius: filters.radius,
        },
      );
    }

    return query.getMany();
  }

  /**
   * Mobile-friendly service discovery
   * - Supports map/list views via lat/long/radius
   * - Filters: category (capabilities), open_now (isActive), capacity
   * - Pagination included
   */
  async discovery(filters: {
    latitude?: number;
    longitude?: number;
    radius?: number; // in km
    category?: string;
    open_now?: boolean;
    capacity_available?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ providers: Provider[]; total: number }> {
    const query = this.providerRepository.createQueryBuilder('provider');
    const {
      latitude,
      longitude,
      radius,
      category,
      open_now,
      capacity_available,
      page = 1,
      limit = 20,
    } = filters;

    // 1. Location Filter (Haversine)
    if (latitude && longitude && radius) {
      query.andWhere(
        `(
          6371 * acos(
            cos(radians(:latitude)) * cos(radians(provider.latitude)) *
            cos(radians(provider.longitude) - radians(:longitude)) +
            sin(radians(:latitude)) * sin(radians(provider.latitude))
          )
        ) <= :radius`,
        { latitude, longitude, radius },
      );
    }

    // 2. Category Filter (Mapped to capabilities since categories column is missing/unreliable)
    if (category) {
      query.andWhere('provider.capabilities ILIKE :category', {
        category: `%${category}%`,
      });
    }

    // 3. Open Now (Mapped to isActive)
    if (open_now) {
      query.andWhere('provider.isActive = :isActive', { isActive: true });
    }

    // 4. Capacity Filter
    if (capacity_available) {
      query.andWhere('provider.capacity > 0');
    }

    // Pagination
    query.skip((page - 1) * limit).take(limit);

    const [providers, total] = await query.getManyAndCount();
    return { providers, total };
  }

  /**
   * Mobile-optimized detail view
   * Fetches provider + approved reviews
   */
  async getMobileDetail(id: string): Promise<any> {
    const provider = await this.findOne(id);

    // Fetch approved reviews separately
    const reviews = await this.reviewRepository.find({
      where: {
        providerId: id,
        status: ReviewStatus.APPROVED
      },
      order: { createdAt: 'DESC' },
      take: 20 // Limit reviews for mobile performance
    });

    return {
      ...provider,
      reviews
    };
  }
}
