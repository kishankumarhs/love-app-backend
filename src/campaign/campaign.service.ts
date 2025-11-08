import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {}

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepository.create(createCampaignDto);
    return this.campaignRepository.save(campaign);
  }

  async findAll(filters?: { category?: string; providerId?: string; status?: string }): Promise<Campaign[]> {
    const query = this.campaignRepository.createQueryBuilder('campaign')
      .leftJoinAndSelect('campaign.provider', 'provider');
    
    if (filters?.category) {
      query.andWhere('campaign.category = :category', { category: filters.category });
    }
    
    if (filters?.providerId) {
      query.andWhere('campaign.providerId = :providerId', { providerId: filters.providerId });
    }
    
    if (filters?.status) {
      query.andWhere('campaign.status = :status', { status: filters.status });
    }
    
    return query.getMany();
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['provider'],
    });
    
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    
    return campaign;
  }

  async update(id: string, updateCampaignDto: UpdateCampaignDto): Promise<Campaign> {
    await this.campaignRepository.update(id, updateCampaignDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.campaignRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Campaign not found');
    }
  }

  async findByProvider(providerId: string): Promise<Campaign[]> {
    return this.campaignRepository.find({
      where: { providerId },
      relations: ['provider'],
    });
  }
}