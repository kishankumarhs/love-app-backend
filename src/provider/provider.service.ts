import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
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
      relations: ['campaigns'],
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

  async search(query: string): Promise<Provider[]> {
    return this.providerRepository
      .createQueryBuilder('provider')
      .where(
        'provider.name ILIKE :query OR provider.description ILIKE :query',
        { query: `%${query}%` },
      )
      .getMany();
  }
}
