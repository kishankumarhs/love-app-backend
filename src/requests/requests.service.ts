import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { Referral } from './entities/referral.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
  ) {}

  async createRequest(createRequestDto: CreateRequestDto): Promise<Request> {
    const request = this.requestRepository.create(createRequestDto);
    return this.requestRepository.save(request);
  }

  async findAllRequests(filters?: {
    status?: string;
    category?: string;
    userId?: string;
  }): Promise<Request[]> {
    const query = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('request.provider', 'provider')
      .leftJoinAndSelect('request.referrals', 'referrals');

    if (filters?.status) {
      query.andWhere('request.status = :status', { status: filters.status });
    }

    if (filters?.category) {
      query.andWhere('request.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.userId) {
      query.andWhere('request.userId = :userId', { userId: filters.userId });
    }

    return query.orderBy('request.createdAt', 'DESC').getMany();
  }

  async findOneRequest(id: string): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['user', 'provider', 'referrals', 'referrals.provider'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async updateRequest(
    id: string,
    updateRequestDto: UpdateRequestDto,
  ): Promise<Request> {
    const updateData = { ...updateRequestDto };

    if (updateRequestDto.status === 'completed') {
      updateData['completedAt'] = new Date();
    }

    await this.requestRepository.update(id, updateData);
    return this.findOneRequest(id);
  }

  async createReferral(
    createReferralDto: CreateReferralDto,
  ): Promise<Referral> {
    const referral = this.referralRepository.create(createReferralDto);
    return this.referralRepository.save(referral);
  }

  async findReferralsByRequest(requestId: string): Promise<Referral[]> {
    return this.referralRepository.find({
      where: { requestId },
      relations: ['provider', 'referrer'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateReferral(
    id: string,
    updateReferralDto: UpdateReferralDto,
  ): Promise<Referral> {
    const updateData = { ...updateReferralDto };

    if (updateReferralDto.status === 'completed') {
      updateData['completedAt'] = new Date();
    }

    if (updateReferralDto.responseReceived) {
      updateData['contactedAt'] = new Date();
    }

    await this.referralRepository.update(id, updateData);

    const referral = await this.referralRepository.findOne({
      where: { id },
      relations: ['request', 'provider', 'referrer'],
    });

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    return referral;
  }

  async getReferralHistory(userId: string): Promise<Referral[]> {
    return this.referralRepository
      .createQueryBuilder('referral')
      .leftJoinAndSelect('referral.request', 'request')
      .leftJoinAndSelect('referral.provider', 'provider')
      .where('request.userId = :userId', { userId })
      .orderBy('referral.createdAt', 'DESC')
      .getMany();
  }

  async deleteRequest(id: string): Promise<void> {
    const result = await this.requestRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Request not found');
    }
  }
}
