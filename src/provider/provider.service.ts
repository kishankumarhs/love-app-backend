import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { Employee } from './entities/emplyee.entity';
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
    private userService: UserService,
  ) {}
  // Employee CRUD
  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    // Optionally: check provider exists
    const employee = this.employeeRepository.create(dto);
    return this.employeeRepository.save(employee);
  }

  async findAllEmployees(providerId?: string): Promise<Employee[]> {
    if (providerId) {
      return this.employeeRepository.find({ where: { providerId } });
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
      country: createProviderDto.country,
      role: UserRole.PROVIDER,
    });

    const provider = this.providerRepository.create(createProviderDto);
    return this.providerRepository.save(provider);
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
      relations: ['campaigns', 'userId'],
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
}
