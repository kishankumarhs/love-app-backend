import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../provider/entities/emplyee.entity';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  // Assign employees to campaign
  async assignEmployees(
    campaignId: string,
    employeeIds: string[],
  ): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['employees'],
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    const employees = await this.employeeRepository.findByIds(employeeIds);
    campaign.employees = Array.isArray(campaign.employees)
      ? [...new Set([...campaign.employees, ...employees])]
      : employees;
    return this.campaignRepository.save(campaign);
  }

  // Remove employee from campaign
  async unassignEmployee(
    campaignId: string,
    employeeId: string,
  ): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['employees'],
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    campaign.employees = (campaign.employees || []).filter(
      (e: any) => e.id !== employeeId,
    );
    return this.campaignRepository.save(campaign);
  }

  // List employees for a campaign
  async listEmployees(campaignId: string): Promise<Employee[]> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['employees'],
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign.employees || [];
  }

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepository.create(createCampaignDto);
    return this.campaignRepository.save(campaign);
  }

  async findAll(filters?: {
    category?: string;
    providerId?: string;
    status?: string;
  }): Promise<Campaign[]> {
    const query = this.campaignRepository.createQueryBuilder('campaign');

    if (filters?.category) {
      query.andWhere('campaign.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.providerId) {
      query.andWhere('campaign.providerId = :providerId', {
        providerId: filters.providerId,
      });
    }

    if (filters?.status) {
      query.andWhere('campaign.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign> {
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
    });
  }

  async search(filters: {
    category?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    status?: string;
  }): Promise<Campaign[]> {
    let campaigns = await this.findAll({
      category: filters.category,
      status: filters.status,
    });

    if (filters.latitude && filters.longitude && filters.radius) {
      campaigns = campaigns.filter((campaign) => {
        const distance = this.calculateDistance(
          filters.latitude,
          filters.longitude,
          campaign.location.coordinates[1],
          campaign.location.coordinates[0],
        );
        return distance <= filters.radius;
      });
    }

    return campaigns;
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number = 10,
  ): Promise<Campaign[]> {
    const campaigns = await this.campaignRepository.find();

    return campaigns.filter((campaign) => {
      const distance = this.calculateDistance(
        lat,
        lng,
        campaign.location.coordinates[1],
        campaign.location.coordinates[0],
      );
      return distance <= radiusKm;
    });
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }

  // Publish campaign
  async publishCampaign(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    campaign.status = 'published';
    return this.campaignRepository.save(campaign);
  }
}
