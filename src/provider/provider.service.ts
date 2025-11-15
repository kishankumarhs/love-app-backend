import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProvider } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/user/entities/user.entity';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    private userService: UserService,
  ) {}

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
